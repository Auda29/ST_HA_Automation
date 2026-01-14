# Task: Restore Policy & Migration Handler

## Kontext

Du implementierst das Restore-Policy-System und den Migration-Handler für das "ST for Home Assistant" Projekt. Diese Features steuern, wie persistente Variablen nach HA-Neustarts und bei Schema-Änderungen behandelt werden.

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`
**Voraussetzung:** Helper Manager ist implementiert (Phase 3 abgeschlossen)

## ⚠️ Das Problem

```
Szenario 1: HA-Neustart
- Was passiert mit counter := counter + 1?
- Soll der alte Wert geladen oder auf 0 gesetzt werden?

Szenario 2: Schema-Änderung
- Variable war INT, jetzt REAL
- Variable wurde entfernt
- Variable wurde hinzugefügt
```

**Lösung:** 
1. Explizite Restore-Policies über Pragmas
2. Migration-Handler für Schema-Änderungen mit User-Interaktion

---

## Restore-Policies

| Pragma | Verhalten | Use Case |
|--------|-----------|----------|
| (kein) | Restore wenn vorhanden, sonst Initialwert | Default |
| `{reset_on_restart}` | Immer Initialwert | Session-Counter |
| `{require_restore}` | Fehler wenn kein Wert | Kritische States |

---

## Architektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Restore Policy Flow                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  HA Restart                      Deploy Time                                │
│  ┌──────────────┐               ┌──────────────┐                           │
│  │ Helper hat   │               │ Schema prüfen │                          │
│  │ Wert: 42     │               │              │                           │
│  └──────┬───────┘               └──────┬───────┘                           │
│         │                              │                                    │
│         ▼                              ▼                                    │
│  ┌──────────────┐               ┌──────────────┐                           │
│  │ Policy Check │               │ Diff berechnen│                          │
│  └──────┬───────┘               └──────┬───────┘                           │
│         │                              │                                    │
│    ┌────┼────┐                    ┌────┼────┐                              │
│    │    │    │                    │    │    │                              │
│    ▼    ▼    ▼                    ▼    ▼    ▼                              │
│  ┌───┐┌───┐┌───┐              ┌───┐┌───┐┌───┐                             │
│  │DEF││RST││REQ│              │ADD││UPD││DEL│                             │
│  │42 ││0  ││42 │              │   ││   ││   │                             │
│  └───┘└───┘└───┘              └───┘└───┘└───┘                             │
│    │    │    │                    │    │    │                              │
│    │    │    └─ Fehler wenn      │    │    └─ User-Bestätigung            │
│    │    │       unavailable      │    └─ Migration-Dialog                  │
│    │    └─ Auf Initialwert      │                                         │
│    └─ Restore                   └─ Automatisch                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Zu erstellende Dateien

```
frontend/src/restore/
├── restore-policy.ts        # Policy Definition & Evaluation
├── migration-handler.ts     # Schema Migration
├── migration-types.ts       # Type Definitions
├── migration-dialog.ts      # Lit Component für Migration UI
└── __tests__/
    ├── restore-policy.test.ts
    └── migration-handler.test.ts
```

---

## frontend/src/restore/migration-types.ts

```typescript
/**
 * Migration System Type Definitions
 */

import type { HelperConfig, DataType } from '../transpiler/types';

// ============================================================================
// Restore Policy
// ============================================================================

export enum RestorePolicy {
  /** Default: Restore if available, otherwise use initial value */
  RESTORE_OR_INIT = 'RESTORE_OR_INIT',
  
  /** Always use initial value on restart */
  ALWAYS_INIT = 'ALWAYS_INIT',
  
  /** Require restored value, error if not available */
  REQUIRE_RESTORE = 'REQUIRE_RESTORE',
}

export interface RestorePolicyConfig {
  policy: RestorePolicy;
  variableName: string;
  helperId: string;
  initialValue: any;
  dataType: DataType;
}

// ============================================================================
// Schema Definition
// ============================================================================

export interface VariableSchema {
  name: string;
  dataType: DataType;
  helperId: string;
  helperType: 'input_boolean' | 'input_number' | 'input_text' | 'input_datetime';
  initialValue: any;
  restorePolicy: RestorePolicy;
  
  // For numeric types
  min?: number;
  max?: number;
  step?: number;
}

export interface ProgramSchema {
  programName: string;
  projectName: string;
  variables: VariableSchema[];
  version: string;
  generatedAt: string;
}

// ============================================================================
// Migration
// ============================================================================

export type MigrationIssueType = 
  | 'added'
  | 'removed'
  | 'type_changed'
  | 'range_changed'
  | 'initial_changed';

export interface MigrationIssue {
  type: MigrationIssueType;
  variable: string;
  helperId: string;
  
  /** Details about the change */
  details?: string;
  
  /** Old schema (for updates/deletes) */
  oldSchema?: VariableSchema;
  
  /** New schema (for updates/adds) */
  newSchema?: VariableSchema;
  
  /** Available resolution options */
  options: MigrationOption[];
  
  /** Default/recommended option */
  defaultOption: string;
}

export interface MigrationOption {
  id: string;
  label: string;
  description?: string;
  isDestructive?: boolean;
}

export interface MigrationResolution {
  issueId: string;
  selectedOption: string;
}

export interface MigrationPlan {
  issues: MigrationIssue[];
  hasDestructiveChanges: boolean;
  requiresUserInput: boolean;
}

export interface MigrationResult {
  success: boolean;
  appliedChanges: string[];
  errors: string[];
}

// ============================================================================
// Schema Storage
// ============================================================================

export interface StoredSchemas {
  [programId: string]: ProgramSchema;
}
```

---

## frontend/src/restore/restore-policy.ts

```typescript
/**
 * Restore Policy System
 * 
 * Manages how persistent variables behave after HA restarts.
 */

import type { VariableDeclaration } from '../parser/ast';
import type { 
  RestorePolicy, 
  RestorePolicyConfig,
  VariableSchema,
} from './migration-types';
import { RestorePolicy as RP } from './migration-types';

// ============================================================================
// Policy Extraction
// ============================================================================

/**
 * Extract restore policy from variable declaration pragmas
 */
export function extractRestorePolicy(varDecl: VariableDeclaration): RestorePolicy {
  const pragmas = varDecl.pragmas || [];
  
  for (const pragma of pragmas) {
    switch (pragma.name.toLowerCase()) {
      case 'reset_on_restart':
        return RP.ALWAYS_INIT;
      case 'require_restore':
        return RP.REQUIRE_RESTORE;
    }
  }
  
  return RP.RESTORE_OR_INIT;
}

// ============================================================================
// Policy Evaluation
// ============================================================================

export interface RestoreResult {
  value: any;
  source: 'restored' | 'initial' | 'error';
  message?: string;
}

/**
 * Evaluate restore policy and determine value to use
 */
export function evaluateRestorePolicy(
  config: RestorePolicyConfig,
  currentHelperValue: any | null,
  isHelperAvailable: boolean
): RestoreResult {
  
  switch (config.policy) {
    case RP.ALWAYS_INIT:
      // Always use initial value
      return {
        value: config.initialValue,
        source: 'initial',
        message: `Variable '${config.variableName}' auf Initialwert gesetzt (reset_on_restart)`,
      };
    
    case RP.REQUIRE_RESTORE:
      // Must have restored value
      if (!isHelperAvailable) {
        return {
          value: null,
          source: 'error',
          message: `Variable '${config.variableName}' erfordert gespeicherten Wert, aber Helper '${config.helperId}' nicht gefunden (require_restore)`,
        };
      }
      if (currentHelperValue === null || currentHelperValue === undefined) {
        return {
          value: null,
          source: 'error',
          message: `Variable '${config.variableName}' erfordert gespeicherten Wert, aber Helper ist leer (require_restore)`,
        };
      }
      return {
        value: currentHelperValue,
        source: 'restored',
      };
    
    case RP.RESTORE_OR_INIT:
    default:
      // Restore if available, otherwise initial
      if (isHelperAvailable && currentHelperValue !== null && currentHelperValue !== undefined) {
        return {
          value: currentHelperValue,
          source: 'restored',
        };
      }
      return {
        value: config.initialValue,
        source: 'initial',
      };
  }
}

// ============================================================================
// Jinja Generation for Restore
// ============================================================================

/**
 * Generate Jinja template for variable initialization based on restore policy
 */
export function generateRestoreJinja(config: RestorePolicyConfig): string {
  const helperId = config.helperId;
  const initial = JSON.stringify(config.initialValue);
  
  switch (config.policy) {
    case RP.ALWAYS_INIT:
      // Always return initial value
      return initial;
    
    case RP.REQUIRE_RESTORE:
      // Return helper value, error handled at automation level
      return `{{ states('${helperId}') }}`;
    
    case RP.RESTORE_OR_INIT:
    default:
      // Return helper value if available, otherwise initial
      return `{% set _h = states('${helperId}') %}{{ _h if _h not in ['unknown', 'unavailable', ''] else ${initial} }}`;
  }
}

// ============================================================================
// Automation Condition for require_restore
// ============================================================================

/**
 * Generate condition that checks all require_restore variables
 */
export function generateRequireRestoreCondition(
  configs: RestorePolicyConfig[]
): object | null {
  const requireRestoreConfigs = configs.filter(
    c => c.policy === RP.REQUIRE_RESTORE
  );
  
  if (requireRestoreConfigs.length === 0) {
    return null;
  }
  
  // Generate condition that checks all required helpers are available
  const checks = requireRestoreConfigs.map(c => 
    `states('${c.helperId}') not in ['unknown', 'unavailable', '']`
  );
  
  return {
    condition: 'template',
    value_template: `{{ ${checks.join(' and ')} }}`,
  };
}

// ============================================================================
// Schema Builder
// ============================================================================

/**
 * Build variable schema from declaration
 */
export function buildVariableSchema(
  varDecl: VariableDeclaration,
  helperId: string,
  helperType: VariableSchema['helperType']
): VariableSchema {
  const schema: VariableSchema = {
    name: varDecl.name,
    dataType: varDecl.dataType.name,
    helperId,
    helperType,
    initialValue: extractInitialValue(varDecl),
    restorePolicy: extractRestorePolicy(varDecl),
  };
  
  // Add numeric constraints
  if (helperType === 'input_number') {
    schema.min = extractNumericConstraint(varDecl, 'min') ?? -1000000;
    schema.max = extractNumericConstraint(varDecl, 'max') ?? 1000000;
    schema.step = extractNumericConstraint(varDecl, 'step') ?? 1;
  }
  
  return schema;
}

function extractInitialValue(varDecl: VariableDeclaration): any {
  if (!varDecl.initialValue) {
    // Default by type
    switch (varDecl.dataType.name.toUpperCase()) {
      case 'BOOL': return false;
      case 'INT':
      case 'DINT':
      case 'REAL':
      case 'LREAL': return 0;
      case 'STRING': return '';
      default: return null;
    }
  }
  
  // Extract from literal
  if (varDecl.initialValue.type === 'Literal') {
    return varDecl.initialValue.value;
  }
  
  return null;
}

function extractNumericConstraint(
  varDecl: VariableDeclaration, 
  constraint: 'min' | 'max' | 'step'
): number | null {
  const pragma = varDecl.pragmas?.find(p => p.name.toLowerCase() === constraint);
  if (pragma && pragma.value) {
    return Number(pragma.value);
  }
  return null;
}
```

---

## frontend/src/restore/migration-handler.ts

```typescript
/**
 * Migration Handler
 * 
 * Handles schema changes between deployments with user interaction.
 */

import type {
  VariableSchema,
  ProgramSchema,
  MigrationIssue,
  MigrationOption,
  MigrationPlan,
  MigrationResolution,
  MigrationResult,
  StoredSchemas,
} from './migration-types';

// ============================================================================
// Schema Storage
// ============================================================================

const SCHEMA_STORAGE_KEY = 'st_hass_schemas';

export class SchemaStorage {
  save(programId: string, schema: ProgramSchema): void {
    const stored = this.loadAll();
    stored[programId] = schema;
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(stored));
  }

  load(programId: string): ProgramSchema | null {
    const stored = this.loadAll();
    return stored[programId] || null;
  }

  loadAll(): StoredSchemas {
    const raw = localStorage.getItem(SCHEMA_STORAGE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  delete(programId: string): void {
    const stored = this.loadAll();
    delete stored[programId];
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(stored));
  }

  clear(): void {
    localStorage.removeItem(SCHEMA_STORAGE_KEY);
  }
}

// ============================================================================
// Migration Detector
// ============================================================================

export class MigrationDetector {
  /**
   * Detect migration issues between old and new schema
   */
  detectIssues(oldSchema: ProgramSchema | null, newSchema: ProgramSchema): MigrationPlan {
    const issues: MigrationIssue[] = [];
    
    if (!oldSchema) {
      // First deployment, no migration needed
      return {
        issues: [],
        hasDestructiveChanges: false,
        requiresUserInput: false,
      };
    }
    
    const oldVars = new Map(oldSchema.variables.map(v => [v.name, v]));
    const newVars = new Map(newSchema.variables.map(v => [v.name, v]));
    
    // Check for removed variables
    for (const [name, oldVar] of oldVars) {
      if (!newVars.has(name)) {
        issues.push(this.createRemovedIssue(oldVar));
      }
    }
    
    // Check for added and changed variables
    for (const [name, newVar] of newVars) {
      const oldVar = oldVars.get(name);
      
      if (!oldVar) {
        issues.push(this.createAddedIssue(newVar));
      } else {
        // Check for changes
        const changeIssues = this.detectChanges(oldVar, newVar);
        issues.push(...changeIssues);
      }
    }
    
    return {
      issues,
      hasDestructiveChanges: issues.some(i => 
        i.options.some(o => o.isDestructive)
      ),
      requiresUserInput: issues.some(i => 
        i.type === 'removed' || i.type === 'type_changed'
      ),
    };
  }

  private createRemovedIssue(oldVar: VariableSchema): MigrationIssue {
    return {
      type: 'removed',
      variable: oldVar.name,
      helperId: oldVar.helperId,
      details: `Variable '${oldVar.name}' wurde aus dem Code entfernt`,
      oldSchema: oldVar,
      options: [
        {
          id: 'delete',
          label: 'Helper löschen',
          description: 'Entfernt den Helper und seinen Wert',
          isDestructive: true,
        },
        {
          id: 'keep',
          label: 'Helper behalten (orphaned)',
          description: 'Behält den Helper, wird aber nicht mehr verwendet',
        },
      ],
      defaultOption: 'delete',
    };
  }

  private createAddedIssue(newVar: VariableSchema): MigrationIssue {
    return {
      type: 'added',
      variable: newVar.name,
      helperId: newVar.helperId,
      details: `Neue Variable '${newVar.name}' hinzugefügt`,
      newSchema: newVar,
      options: [
        {
          id: 'create',
          label: 'Helper erstellen',
          description: `Erstellt neuen Helper mit Initialwert ${JSON.stringify(newVar.initialValue)}`,
        },
      ],
      defaultOption: 'create',
    };
  }

  private detectChanges(oldVar: VariableSchema, newVar: VariableSchema): MigrationIssue[] {
    const issues: MigrationIssue[] = [];
    
    // Type change
    if (oldVar.dataType !== newVar.dataType) {
      issues.push({
        type: 'type_changed',
        variable: oldVar.name,
        helperId: oldVar.helperId,
        details: `Typ geändert: ${oldVar.dataType} → ${newVar.dataType}`,
        oldSchema: oldVar,
        newSchema: newVar,
        options: this.getTypeChangeOptions(oldVar, newVar),
        defaultOption: 'convert',
      });
    }
    
    // Range change (for numbers)
    if (oldVar.helperType === 'input_number' && newVar.helperType === 'input_number') {
      if (oldVar.min !== newVar.min || oldVar.max !== newVar.max) {
        issues.push({
          type: 'range_changed',
          variable: oldVar.name,
          helperId: oldVar.helperId,
          details: `Bereich geändert: [${oldVar.min}, ${oldVar.max}] → [${newVar.min}, ${newVar.max}]`,
          oldSchema: oldVar,
          newSchema: newVar,
          options: [
            {
              id: 'update_range',
              label: 'Bereich aktualisieren',
              description: 'Aktualisiert min/max, Wert wird ggf. begrenzt',
            },
            {
              id: 'reset',
              label: 'Auf Initialwert zurücksetzen',
              description: `Setzt auf ${newVar.initialValue}`,
            },
          ],
          defaultOption: 'update_range',
        });
      }
    }
    
    return issues;
  }

  private getTypeChangeOptions(oldVar: VariableSchema, newVar: VariableSchema): MigrationOption[] {
    const options: MigrationOption[] = [];
    
    // Check if conversion is possible
    if (this.canConvert(oldVar.dataType, newVar.dataType)) {
      options.push({
        id: 'convert',
        label: 'Wert konvertieren',
        description: `Konvertiert ${oldVar.dataType} zu ${newVar.dataType}`,
      });
    }
    
    options.push({
      id: 'reset',
      label: 'Auf Initialwert zurücksetzen',
      description: `Setzt auf ${JSON.stringify(newVar.initialValue)}`,
      isDestructive: true,
    });
    
    options.push({
      id: 'keep_helper',
      label: 'Alten Helper behalten, neuen erstellen',
      description: 'Erstellt neuen Helper, alter wird orphaned',
    });
    
    return options;
  }

  private canConvert(fromType: string, toType: string): boolean {
    const conversions: Record<string, string[]> = {
      'INT': ['DINT', 'REAL', 'LREAL', 'STRING'],
      'DINT': ['REAL', 'LREAL', 'STRING'],
      'REAL': ['LREAL', 'STRING'],
      'LREAL': ['STRING'],
      'BOOL': ['INT', 'STRING'],
    };
    
    return conversions[fromType]?.includes(toType) || false;
  }
}

// ============================================================================
// Migration Executor
// ============================================================================

export class MigrationExecutor {
  private haApi: any; // HAApiClient

  constructor(haApi: any) {
    this.haApi = haApi;
  }

  /**
   * Execute migration with user-provided resolutions
   */
  async execute(
    plan: MigrationPlan,
    resolutions: MigrationResolution[]
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      appliedChanges: [],
      errors: [],
    };
    
    // Create resolution map
    const resolutionMap = new Map(
      resolutions.map(r => [r.issueId, r.selectedOption])
    );
    
    for (const issue of plan.issues) {
      const selectedOption = resolutionMap.get(issue.variable) || issue.defaultOption;
      
      try {
        await this.applyResolution(issue, selectedOption);
        result.appliedChanges.push(
          `${issue.variable}: ${selectedOption}`
        );
      } catch (error) {
        result.success = false;
        result.errors.push(
          `${issue.variable}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    
    return result;
  }

  private async applyResolution(issue: MigrationIssue, option: string): Promise<void> {
    switch (issue.type) {
      case 'added':
        if (option === 'create') {
          await this.createHelper(issue.newSchema!);
        }
        break;
      
      case 'removed':
        if (option === 'delete') {
          await this.deleteHelper(issue.helperId);
        }
        // 'keep' does nothing
        break;
      
      case 'type_changed':
        await this.handleTypeChange(issue, option);
        break;
      
      case 'range_changed':
        await this.handleRangeChange(issue, option);
        break;
    }
  }

  private async handleTypeChange(issue: MigrationIssue, option: string): Promise<void> {
    switch (option) {
      case 'convert':
        const currentValue = await this.getHelperValue(issue.helperId);
        const convertedValue = this.convertValue(
          currentValue,
          issue.oldSchema!.dataType,
          issue.newSchema!.dataType
        );
        await this.deleteHelper(issue.helperId);
        await this.createHelper(issue.newSchema!, convertedValue);
        break;
      
      case 'reset':
        await this.deleteHelper(issue.helperId);
        await this.createHelper(issue.newSchema!);
        break;
      
      case 'keep_helper':
        // Create new helper with different ID
        const newHelperId = issue.newSchema!.helperId + '_v2';
        await this.createHelper({
          ...issue.newSchema!,
          helperId: newHelperId,
        });
        break;
    }
  }

  private async handleRangeChange(issue: MigrationIssue, option: string): Promise<void> {
    if (option === 'update_range') {
      const currentValue = await this.getHelperValue(issue.helperId);
      const clampedValue = Math.max(
        issue.newSchema!.min!,
        Math.min(issue.newSchema!.max!, Number(currentValue))
      );
      
      await this.deleteHelper(issue.helperId);
      await this.createHelper(issue.newSchema!, clampedValue);
    } else if (option === 'reset') {
      await this.deleteHelper(issue.helperId);
      await this.createHelper(issue.newSchema!);
    }
  }

  private convertValue(value: any, fromType: string, toType: string): any {
    switch (toType) {
      case 'INT':
      case 'DINT':
        return Math.round(Number(value));
      case 'REAL':
      case 'LREAL':
        return Number(value);
      case 'STRING':
        return String(value);
      case 'BOOL':
        return Boolean(value);
      default:
        return value;
    }
  }

  private async createHelper(schema: VariableSchema, value?: any): Promise<void> {
    const initialValue = value ?? schema.initialValue;
    
    switch (schema.helperType) {
      case 'input_boolean':
        await this.haApi.createInputBoolean({
          name: this.extractHelperName(schema.helperId),
          initial: Boolean(initialValue),
        });
        break;
      
      case 'input_number':
        await this.haApi.createInputNumber({
          name: this.extractHelperName(schema.helperId),
          initial: Number(initialValue),
          min: schema.min,
          max: schema.max,
          step: schema.step,
          mode: 'box',
        });
        break;
      
      case 'input_text':
        await this.haApi.createInputText({
          name: this.extractHelperName(schema.helperId),
          initial: String(initialValue),
        });
        break;
    }
  }

  private async deleteHelper(helperId: string): Promise<void> {
    await this.haApi.deleteHelper(helperId);
  }

  private async getHelperValue(helperId: string): Promise<any> {
    return await this.haApi.getState(helperId);
  }

  private extractHelperName(helperId: string): string {
    // input_number.st_prog_var → ST Prog Var
    const parts = helperId.split('.');
    if (parts.length > 1) {
      return parts[1]
        .replace(/^st_/, 'ST ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    return helperId;
  }
}
```

---

## frontend/src/restore/migration-dialog.ts

```typescript
/**
 * Migration Dialog Component
 * 
 * Shows migration issues and collects user resolutions.
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { MigrationPlan, MigrationIssue, MigrationResolution } from './migration-types';

@customElement('st-migration-dialog')
export class MigrationDialog extends LitElement {
  @property({ type: Object }) plan!: MigrationPlan;
  
  @state() private _resolutions: Map<string, string> = new Map();
  @state() private _isOpen: boolean = false;

  static styles = css`
    :host {
      display: block;
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .dialog {
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      max-width: 600px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      padding: 16px 24px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    
    .header h2 {
      margin: 0;
      font-size: 18px;
    }
    
    .content {
      padding: 16px 24px;
      overflow-y: auto;
      flex: 1;
    }
    
    .issue {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--divider-color, #eee);
    }
    
    .issue:last-child {
      border-bottom: none;
    }
    
    .issue-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .issue-type {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .issue-type--added {
      background: #e8f5e9;
      color: #2e7d32;
    }
    
    .issue-type--removed {
      background: #ffebee;
      color: #c62828;
    }
    
    .issue-type--type_changed {
      background: #fff3e0;
      color: #ef6c00;
    }
    
    .issue-type--range_changed {
      background: #e3f2fd;
      color: #1565c0;
    }
    
    .issue-name {
      font-weight: 500;
      font-family: monospace;
    }
    
    .issue-details {
      color: var(--secondary-text-color);
      font-size: 14px;
      margin-bottom: 12px;
    }
    
    .options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .option {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px;
      border: 1px solid var(--divider-color, #eee);
      border-radius: 4px;
      cursor: pointer;
    }
    
    .option:hover {
      background: var(--secondary-background-color);
    }
    
    .option.selected {
      border-color: var(--primary-color);
      background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
    }
    
    .option.destructive {
      border-color: #ffcdd2;
    }
    
    .option.destructive.selected {
      border-color: #c62828;
      background: rgba(198, 40, 40, 0.1);
    }
    
    .option-label {
      font-weight: 500;
    }
    
    .option-description {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    
    .footer {
      padding: 16px 24px;
      border-top: 1px solid var(--divider-color, #eee);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn-cancel {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    
    .btn-apply {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    
    .btn-apply:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #fff3e0;
      border-radius: 4px;
      margin-bottom: 16px;
      color: #e65100;
    }
  `;

  open(): void {
    this._isOpen = true;
    // Initialize with default options
    for (const issue of this.plan.issues) {
      if (!this._resolutions.has(issue.variable)) {
        this._resolutions.set(issue.variable, issue.defaultOption);
      }
    }
    this._resolutions = new Map(this._resolutions);
  }

  close(): void {
    this._isOpen = false;
  }

  getResolutions(): MigrationResolution[] {
    return Array.from(this._resolutions.entries()).map(([issueId, option]) => ({
      issueId,
      selectedOption: option,
    }));
  }

  render() {
    if (!this._isOpen || !this.plan) {
      return html``;
    }

    return html`
      <div class="overlay" @click=${this._handleOverlayClick}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="header">
            <h2>🔄 Schema-Migration erforderlich</h2>
          </div>
          
          <div class="content">
            ${this.plan.hasDestructiveChanges ? html`
              <div class="warning">
                ⚠️ Einige Änderungen können zu Datenverlust führen. 
                Bitte überprüfe die Optionen sorgfältig.
              </div>
            ` : ''}
            
            ${this.plan.issues.map(issue => this._renderIssue(issue))}
          </div>
          
          <div class="footer">
            <button class="btn-cancel" @click=${this._handleCancel}>
              Abbrechen
            </button>
            <button class="btn-apply" @click=${this._handleApply}>
              Migration ausführen
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderIssue(issue: MigrationIssue) {
    const typeLabels: Record<string, string> = {
      added: 'Neu',
      removed: 'Entfernt',
      type_changed: 'Typ geändert',
      range_changed: 'Bereich geändert',
    };

    return html`
      <div class="issue">
        <div class="issue-header">
          <span class="issue-type issue-type--${issue.type}">
            ${typeLabels[issue.type]}
          </span>
          <span class="issue-name">${issue.variable}</span>
        </div>
        
        <div class="issue-details">${issue.details}</div>
        
        <div class="options">
          ${issue.options.map(option => this._renderOption(issue, option))}
        </div>
      </div>
    `;
  }

  private _renderOption(issue: MigrationIssue, option: { id: string; label: string; description?: string; isDestructive?: boolean }) {
    const isSelected = this._resolutions.get(issue.variable) === option.id;
    
    return html`
      <div 
        class="option ${isSelected ? 'selected' : ''} ${option.isDestructive ? 'destructive' : ''}"
        @click=${() => this._selectOption(issue.variable, option.id)}
      >
        <input 
          type="radio" 
          name="option-${issue.variable}"
          .checked=${isSelected}
        >
        <div>
          <div class="option-label">
            ${option.label}
            ${option.isDestructive ? html`<span style="color: #c62828;">⚠️</span>` : ''}
          </div>
          ${option.description ? html`
            <div class="option-description">${option.description}</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private _selectOption(variable: string, optionId: string): void {
    this._resolutions.set(variable, optionId);
    this._resolutions = new Map(this._resolutions);
  }

  private _handleOverlayClick(): void {
    // Don't close on overlay click for important dialogs
  }

  private _handleCancel(): void {
    this.dispatchEvent(new CustomEvent('cancel'));
    this.close();
  }

  private _handleApply(): void {
    this.dispatchEvent(new CustomEvent('apply', {
      detail: { resolutions: this.getResolutions() },
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'st-migration-dialog': MigrationDialog;
  }
}
```

---

## frontend/src/restore/__tests__/restore-policy.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import {
  extractRestorePolicy,
  evaluateRestorePolicy,
  generateRestoreJinja,
  generateRequireRestoreCondition,
} from '../restore-policy';
import { RestorePolicy } from '../migration-types';
import type { VariableDeclaration } from '../../parser/ast';

describe('Restore Policy Extraction', () => {
  
  it('returns default policy when no pragma', () => {
    const varDecl: VariableDeclaration = {
      type: 'VariableDeclaration',
      name: 'counter',
      dataType: { type: 'DataType', name: 'INT' },
      section: 'VAR',
      pragmas: [],
      constant: false,
    };
    
    expect(extractRestorePolicy(varDecl)).toBe(RestorePolicy.RESTORE_OR_INIT);
  });

  it('recognizes reset_on_restart pragma', () => {
    const varDecl: VariableDeclaration = {
      type: 'VariableDeclaration',
      name: 'session',
      dataType: { type: 'DataType', name: 'INT' },
      section: 'VAR',
      pragmas: [{ type: 'Pragma', name: 'reset_on_restart' }],
      constant: false,
    };
    
    expect(extractRestorePolicy(varDecl)).toBe(RestorePolicy.ALWAYS_INIT);
  });

  it('recognizes require_restore pragma', () => {
    const varDecl: VariableDeclaration = {
      type: 'VariableDeclaration',
      name: 'critical',
      dataType: { type: 'DataType', name: 'BOOL' },
      section: 'VAR',
      pragmas: [{ type: 'Pragma', name: 'require_restore' }],
      constant: false,
    };
    
    expect(extractRestorePolicy(varDecl)).toBe(RestorePolicy.REQUIRE_RESTORE);
  });
});

describe('Restore Policy Evaluation', () => {
  
  it('RESTORE_OR_INIT: uses helper value when available', () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.RESTORE_OR_INIT,
        variableName: 'counter',
        helperId: 'input_number.st_counter',
        initialValue: 0,
        dataType: 'INT',
      },
      42,
      true
    );
    
    expect(result.value).toBe(42);
    expect(result.source).toBe('restored');
  });

  it('RESTORE_OR_INIT: uses initial when helper unavailable', () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.RESTORE_OR_INIT,
        variableName: 'counter',
        helperId: 'input_number.st_counter',
        initialValue: 0,
        dataType: 'INT',
      },
      null,
      false
    );
    
    expect(result.value).toBe(0);
    expect(result.source).toBe('initial');
  });

  it('ALWAYS_INIT: always uses initial value', () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.ALWAYS_INIT,
        variableName: 'session',
        helperId: 'input_number.st_session',
        initialValue: 0,
        dataType: 'INT',
      },
      42,
      true
    );
    
    expect(result.value).toBe(0);
    expect(result.source).toBe('initial');
  });

  it('REQUIRE_RESTORE: errors when unavailable', () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.REQUIRE_RESTORE,
        variableName: 'critical',
        helperId: 'input_boolean.st_critical',
        initialValue: false,
        dataType: 'BOOL',
      },
      null,
      false
    );
    
    expect(result.source).toBe('error');
    expect(result.message).toContain('require_restore');
  });

  it('REQUIRE_RESTORE: succeeds when available', () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.REQUIRE_RESTORE,
        variableName: 'critical',
        helperId: 'input_boolean.st_critical',
        initialValue: false,
        dataType: 'BOOL',
      },
      true,
      true
    );
    
    expect(result.value).toBe(true);
    expect(result.source).toBe('restored');
  });
});

describe('Jinja Generation', () => {
  
  it('generates constant for ALWAYS_INIT', () => {
    const jinja = generateRestoreJinja({
      policy: RestorePolicy.ALWAYS_INIT,
      variableName: 'x',
      helperId: 'input_number.x',
      initialValue: 0,
      dataType: 'INT',
    });
    
    expect(jinja).toBe('0');
  });

  it('generates fallback for RESTORE_OR_INIT', () => {
    const jinja = generateRestoreJinja({
      policy: RestorePolicy.RESTORE_OR_INIT,
      variableName: 'x',
      helperId: 'input_number.st_x',
      initialValue: 42,
      dataType: 'INT',
    });
    
    expect(jinja).toContain('input_number.st_x');
    expect(jinja).toContain('42');
    expect(jinja).toContain('unknown');
  });
});

describe('Require Restore Condition', () => {
  
  it('returns null when no require_restore', () => {
    const condition = generateRequireRestoreCondition([
      {
        policy: RestorePolicy.RESTORE_OR_INIT,
        variableName: 'x',
        helperId: 'input_number.x',
        initialValue: 0,
        dataType: 'INT',
      },
    ]);
    
    expect(condition).toBeNull();
  });

  it('generates condition for require_restore', () => {
    const condition = generateRequireRestoreCondition([
      {
        policy: RestorePolicy.REQUIRE_RESTORE,
        variableName: 'critical',
        helperId: 'input_boolean.st_critical',
        initialValue: false,
        dataType: 'BOOL',
      },
    ]);
    
    expect(condition).not.toBeNull();
    expect((condition as any).condition).toBe('template');
    expect((condition as any).value_template).toContain('input_boolean.st_critical');
  });
});
```

---

## frontend/src/restore/__tests__/migration-handler.test.ts

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MigrationDetector, SchemaStorage } from '../migration-handler';
import type { ProgramSchema, VariableSchema } from '../migration-types';
import { RestorePolicy } from '../migration-types';

describe('MigrationDetector', () => {
  const detector = new MigrationDetector();

  const baseSchema: VariableSchema = {
    name: 'counter',
    dataType: 'INT',
    helperId: 'input_number.st_test_counter',
    helperType: 'input_number',
    initialValue: 0,
    restorePolicy: RestorePolicy.RESTORE_OR_INIT,
    min: 0,
    max: 100,
  };

  it('returns empty plan for first deployment', () => {
    const newSchema: ProgramSchema = {
      programName: 'Test',
      projectName: 'home',
      variables: [baseSchema],
      version: '1.0',
      generatedAt: new Date().toISOString(),
    };

    const plan = detector.detectIssues(null, newSchema);
    
    expect(plan.issues).toHaveLength(0);
    expect(plan.requiresUserInput).toBe(false);
  });

  it('detects added variable', () => {
    const oldSchema: ProgramSchema = {
      programName: 'Test',
      projectName: 'home',
      variables: [],
      version: '1.0',
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [baseSchema],
    };

    const plan = detector.detectIssues(oldSchema, newSchema);
    
    expect(plan.issues).toHaveLength(1);
    expect(plan.issues[0].type).toBe('added');
    expect(plan.issues[0].variable).toBe('counter');
  });

  it('detects removed variable', () => {
    const oldSchema: ProgramSchema = {
      programName: 'Test',
      projectName: 'home',
      variables: [baseSchema],
      version: '1.0',
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [],
    };

    const plan = detector.detectIssues(oldSchema, newSchema);
    
    expect(plan.issues).toHaveLength(1);
    expect(plan.issues[0].type).toBe('removed');
    expect(plan.issues[0].options).toContainEqual(
      expect.objectContaining({ id: 'delete' })
    );
    expect(plan.issues[0].options).toContainEqual(
      expect.objectContaining({ id: 'keep' })
    );
  });

  it('detects type change', () => {
    const oldSchema: ProgramSchema = {
      programName: 'Test',
      projectName: 'home',
      variables: [baseSchema],
      version: '1.0',
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [{
        ...baseSchema,
        dataType: 'REAL',
      }],
    };

    const plan = detector.detectIssues(oldSchema, newSchema);
    
    expect(plan.issues).toHaveLength(1);
    expect(plan.issues[0].type).toBe('type_changed');
    expect(plan.issues[0].details).toContain('INT');
    expect(plan.issues[0].details).toContain('REAL');
  });

  it('detects range change', () => {
    const oldSchema: ProgramSchema = {
      programName: 'Test',
      projectName: 'home',
      variables: [baseSchema],
      version: '1.0',
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [{
        ...baseSchema,
        min: 0,
        max: 1000,  // Changed from 100
      }],
    };

    const plan = detector.detectIssues(oldSchema, newSchema);
    
    expect(plan.issues).toHaveLength(1);
    expect(plan.issues[0].type).toBe('range_changed');
  });

  it('marks destructive changes', () => {
    const oldSchema: ProgramSchema = {
      programName: 'Test',
      projectName: 'home',
      variables: [baseSchema],
      version: '1.0',
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [],  // Removed
    };

    const plan = detector.detectIssues(oldSchema, newSchema);
    
    expect(plan.hasDestructiveChanges).toBe(true);
    expect(plan.requiresUserInput).toBe(true);
  });
});

describe('SchemaStorage', () => {
  let storage: SchemaStorage;

  beforeEach(() => {
    storage = new SchemaStorage();
    storage.clear();
  });

  it('saves and loads schema', () => {
    const schema: ProgramSchema = {
      programName: 'Test',
      projectName: 'home',
      variables: [],
      version: '1.0',
      generatedAt: new Date().toISOString(),
    };

    storage.save('st_test', schema);
    const loaded = storage.load('st_test');
    
    expect(loaded).toEqual(schema);
  });

  it('returns null for unknown program', () => {
    const loaded = storage.load('unknown');
    expect(loaded).toBeNull();
  });
});
```

---

## Erfolgskriterien

- [ ] Restore-Policies werden aus Pragmas extrahiert
- [ ] RESTORE_OR_INIT: Wert wird restored wenn verfügbar
- [ ] ALWAYS_INIT: Immer Initialwert verwendet
- [ ] REQUIRE_RESTORE: Fehler wenn Helper nicht verfügbar
- [ ] Schema-Änderungen werden erkannt (add/remove/type/range)
- [ ] Migration-Dialog zeigt alle Issues
- [ ] User kann Resolution pro Issue wählen
- [ ] Destructive Changes sind markiert
- [ ] Migration wird korrekt ausgeführt
- [ ] Alle Tests bestehen

---

## Nicht in diesem Task

- Automatische Backup vor Migration
- Migration History/Undo
- Schema-Versioning
