# Task: Storage Analyzer - Persistenz-Erkennung

## Kontext

Du implementierst den Storage Analyzer für das "ST for Home Assistant" Projekt. Der Analyzer löst das kritische **"State-Persistenz"** Problem:

```
ST denkt:        "Variablen behalten ihren Wert zwischen Zyklen"
HA denkt:        "Variablen leben nur Millisekunden pro Automation-Run"
```

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`
**Voraussetzung:** Dependency Analyzer ist implementiert (04 abgeschlossen)

## ⚠️ Kritisches Problem

Ohne Storage Analyzer würden Variablen wie Counter, FB-Instanzen oder Timer-Zustände bei jedem Run verloren gehen. Der Analyzer muss:

1. Automatisch erkennen welche Variablen Persistenz brauchen
2. Passende HA Helper-Typen zuweisen (`input_number`, `input_boolean`, etc.)
3. Pragmas (`{persistent}`, `{transient}`) respektieren
4. Namespace-Konvention für Helper-IDs einhalten

## Ziel

Erstelle einen Storage Analyzer mit:
- Automatische Persistenz-Erkennung (Self-Reference, FB-Instanzen)
- Pragma-gesteuerte explizite Kontrolle
- Helper-Typ Mapping (ST-Typ → HA Helper-Typ)
- Namespace-konforme Helper-ID Generierung
- Variable Usage Analysis

---

## Storage-Strategie (Tiered Storage)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Storage Types                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  DERIVED          Entity-gebundene Variablen                        │
│  ─────────        Wert kommt aus Entity State                       │
│                   → Kein Helper nötig                                │
│                   Beispiel: sensor AT %I* := 'sensor.temp';         │
│                                                                      │
│  TRANSIENT        Temporäre Variablen                               │
│  ──────────       Nur innerhalb eines Runs gültig                   │
│                   → HA `variables:` Sektion                          │
│                   Beispiel: tempResult : INT := 0;                  │
│                                                                      │
│  PERSISTENT       Variablen die Runs überdauern müssen              │
│  ───────────      Wert muss zwischen Runs erhalten bleiben          │
│                   → HA input_* Helper Entity                         │
│                   Beispiel: {persistent} counter : INT := 0;        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Zu erstellende Dateien

```
frontend/src/analyzer/
├── storage-analyzer.ts       # Haupt-Analyzer
├── helper-mapping.ts         # Typ-Mapping ST → HA Helper
├── types.ts                  # (Erweitern um Storage Types)
└── __tests__/
    └── storage-analyzer.test.ts
```

---

## frontend/src/analyzer/types.ts (Erweiterung)

```typescript
// Zu den bestehenden Types hinzufügen:

// ============================================================================
// Storage Types
// ============================================================================

export enum StorageType {
  /** Entity-bound variable - value comes from entity state */
  DERIVED = 'DERIVED',
  
  /** Temporary variable - only valid during single run */
  TRANSIENT = 'TRANSIENT',
  
  /** Persistent variable - survives across runs via HA helper */
  PERSISTENT = 'PERSISTENT',
}

export interface StorageDecision {
  type: StorageType;
  reason: string;
  helperId?: string;
  helperType?: HelperType;
  initialValue?: unknown;
}

export type HelperType = 
  | 'input_boolean'
  | 'input_number'
  | 'input_text'
  | 'input_datetime'
  | 'input_select'
  | 'counter'
  | 'timer';

export interface HelperConfig {
  id: string;
  type: HelperType;
  name: string;
  initial?: unknown;
  min?: number;
  max?: number;
  step?: number;
  mode?: 'box' | 'slider';
  options?: string[];
  pattern?: string;
}

export interface StorageAnalysisResult {
  variables: VariableStorageInfo[];
  helpers: HelperConfig[];
  diagnostics: Diagnostic[];
}

export interface VariableStorageInfo {
  name: string;
  dataType: string;
  storage: StorageDecision;
  usageInfo: VariableUsageInfo;
}

export interface VariableUsageInfo {
  isRead: boolean;
  isWritten: boolean;
  hasSelfReference: boolean;
  isFBInstance: boolean;
  isTimerRelated: boolean;
  readCount: number;
  writeCount: number;
}

// Diagnostic Codes für Storage (zu bestehenden hinzufügen)
export const StorageDiagnosticCodes = {
  // Info
  AUTO_PERSISTENT: 'I010',
  EXPLICIT_PERSISTENT: 'I011',
  EXPLICIT_TRANSIENT: 'I012',
  
  // Warnings
  SELF_REF_NOT_PERSISTENT: 'W010',
  FB_INSTANCE_NOT_PERSISTENT: 'W011',
  UNUSED_PERSISTENT: 'W012',
  
  // Errors
  INVALID_HELPER_TYPE: 'E010',
  CONFLICTING_PRAGMAS: 'E011',
} as const;
```

---

## frontend/src/analyzer/helper-mapping.ts

```typescript
/**
 * ST Data Type to HA Helper Type Mapping
 */

import type { HelperType, HelperConfig } from './types';

// ============================================================================
// Type Mapping
// ============================================================================

interface TypeMapping {
  helperType: HelperType;
  defaultMin?: number;
  defaultMax?: number;
  defaultStep?: number;
}

const TYPE_MAPPINGS: Record<string, TypeMapping> = {
  // Boolean types
  'BOOL': { helperType: 'input_boolean' },
  
  // Integer types
  'SINT': { helperType: 'input_number', defaultMin: -128, defaultMax: 127, defaultStep: 1 },
  'INT': { helperType: 'input_number', defaultMin: -32768, defaultMax: 32767, defaultStep: 1 },
  'DINT': { helperType: 'input_number', defaultMin: -2147483648, defaultMax: 2147483647, defaultStep: 1 },
  'LINT': { helperType: 'input_number', defaultMin: -9223372036854775808, defaultMax: 9223372036854775807, defaultStep: 1 },
  'USINT': { helperType: 'input_number', defaultMin: 0, defaultMax: 255, defaultStep: 1 },
  'UINT': { helperType: 'input_number', defaultMin: 0, defaultMax: 65535, defaultStep: 1 },
  'UDINT': { helperType: 'input_number', defaultMin: 0, defaultMax: 4294967295, defaultStep: 1 },
  'ULINT': { helperType: 'input_number', defaultMin: 0, defaultMax: Number.MAX_SAFE_INTEGER, defaultStep: 1 },
  
  // Real types
  'REAL': { helperType: 'input_number', defaultMin: -3.4e38, defaultMax: 3.4e38, defaultStep: 0.1 },
  'LREAL': { helperType: 'input_number', defaultMin: Number.MIN_SAFE_INTEGER, defaultMax: Number.MAX_SAFE_INTEGER, defaultStep: 0.01 },
  
  // String types
  'STRING': { helperType: 'input_text' },
  'WSTRING': { helperType: 'input_text' },
  
  // Time types
  'TIME': { helperType: 'input_text' }, // Stored as ISO duration string
  'DATE': { helperType: 'input_datetime' },
  'TIME_OF_DAY': { helperType: 'input_datetime' },
  'TOD': { helperType: 'input_datetime' },
  'DATE_AND_TIME': { helperType: 'input_datetime' },
  'DT': { helperType: 'input_datetime' },
};

// Function Block types that need special handling
const FB_TYPES = ['TON', 'TOF', 'TP', 'R_TRIG', 'F_TRIG', 'SR', 'RS', 'CTU', 'CTD', 'CTUD'];

/**
 * Get the appropriate HA helper type for an ST data type
 */
export function getHelperType(stType: string): HelperType | null {
  const normalizedType = stType.toUpperCase();
  const mapping = TYPE_MAPPINGS[normalizedType];
  return mapping?.helperType ?? null;
}

/**
 * Check if type is a Function Block
 */
export function isFunctionBlockType(stType: string): boolean {
  return FB_TYPES.includes(stType.toUpperCase());
}

/**
 * Check if type is numeric (INT, REAL variants)
 */
export function isNumericType(stType: string): boolean {
  const normalizedType = stType.toUpperCase();
  return [
    'SINT', 'INT', 'DINT', 'LINT',
    'USINT', 'UINT', 'UDINT', 'ULINT',
    'REAL', 'LREAL',
  ].includes(normalizedType);
}

/**
 * Check if type is boolean
 */
export function isBooleanType(stType: string): boolean {
  return stType.toUpperCase() === 'BOOL';
}

/**
 * Check if type is string
 */
export function isStringType(stType: string): boolean {
  const normalizedType = stType.toUpperCase();
  return ['STRING', 'WSTRING'].includes(normalizedType);
}

/**
 * Check if type is time-related
 */
export function isTimeType(stType: string): boolean {
  const normalizedType = stType.toUpperCase();
  return ['TIME', 'DATE', 'TIME_OF_DAY', 'TOD', 'DATE_AND_TIME', 'DT'].includes(normalizedType);
}

// ============================================================================
// Helper Config Generation
// ============================================================================

/**
 * Generate Helper ID following namespace convention
 * Format: input_<type>.st_<project>_<program>_<variable>
 */
export function generateHelperId(
  projectName: string,
  programName: string,
  variableName: string,
  helperType: HelperType
): string {
  const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  const prefix = helperType.replace('input_', '');
  const id = `st_${sanitize(projectName)}_${sanitize(programName)}_${sanitize(variableName)}`;
  
  return `${helperType}.${id}`;
}

/**
 * Generate full helper configuration
 */
export function generateHelperConfig(
  projectName: string,
  programName: string,
  variableName: string,
  stType: string,
  initialValue?: unknown
): HelperConfig | null {
  const helperType = getHelperType(stType);
  if (!helperType) {
    return null;
  }

  const id = generateHelperId(projectName, programName, variableName, helperType);
  const mapping = TYPE_MAPPINGS[stType.toUpperCase()];
  
  const config: HelperConfig = {
    id,
    type: helperType,
    name: `ST ${programName} - ${variableName}`,
  };

  // Set type-specific options
  if (helperType === 'input_number' && mapping) {
    config.min = mapping.defaultMin;
    config.max = mapping.defaultMax;
    config.step = mapping.defaultStep;
    config.mode = 'box';
    
    if (initialValue !== undefined && typeof initialValue === 'number') {
      config.initial = initialValue;
    } else {
      config.initial = 0;
    }
  }

  if (helperType === 'input_boolean') {
    config.initial = initialValue === true;
  }

  if (helperType === 'input_text') {
    config.initial = typeof initialValue === 'string' ? initialValue : '';
  }

  return config;
}

/**
 * Get default value for a data type
 */
export function getDefaultValue(stType: string): unknown {
  const normalizedType = stType.toUpperCase();
  
  if (isBooleanType(normalizedType)) return false;
  if (isNumericType(normalizedType)) return 0;
  if (isStringType(normalizedType)) return '';
  if (isTimeType(normalizedType)) return 'PT0S';
  
  return null;
}

/**
 * Convert ST literal value to helper-compatible value
 */
export function convertToHelperValue(value: unknown, stType: string): unknown {
  const normalizedType = stType.toUpperCase();
  
  if (isBooleanType(normalizedType)) {
    return value === true || value === 'TRUE' || value === 1;
  }
  
  if (isNumericType(normalizedType)) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  }
  
  if (isStringType(normalizedType)) {
    return String(value ?? '');
  }
  
  return value;
}
```

---

## frontend/src/analyzer/storage-analyzer.ts

```typescript
/**
 * Storage Analyzer - Determine persistence requirements for variables
 * 
 * Analyzes ST variables to determine which need HA helpers for
 * state persistence across automation runs.
 */

import type {
  ProgramNode,
  VariableDeclaration,
  Expression,
  AssignmentStatement,
} from '../parser/ast';
import type {
  StorageType,
  StorageDecision,
  StorageAnalysisResult,
  VariableStorageInfo,
  VariableUsageInfo,
  HelperConfig,
  Diagnostic,
  DiagnosticSeverity,
} from './types';
import { StorageType as ST, StorageDiagnosticCodes } from './types';
import { walkAST, findVariableRefs, expressionContainsVariable } from './ast-visitor';
import {
  getHelperType,
  isFunctionBlockType,
  generateHelperConfig,
  getDefaultValue,
  convertToHelperValue,
} from './helper-mapping';
import { hasPragma, getPragmaValue } from './trigger-generator';

// ============================================================================
// Main Analyzer Class
// ============================================================================

export class StorageAnalyzer {
  private ast: ProgramNode;
  private projectName: string;
  private diagnostics: Diagnostic[] = [];
  private usageMap: Map<string, VariableUsageInfo> = new Map();
  private variableMap: Map<string, VariableDeclaration> = new Map();

  constructor(ast: ProgramNode, projectName: string = 'default') {
    this.ast = ast;
    this.projectName = projectName;
  }

  /**
   * Run full storage analysis
   */
  analyze(): StorageAnalysisResult {
    // Phase 1: Build variable map
    this.buildVariableMap();

    // Phase 2: Analyze variable usage
    this.analyzeUsage();

    // Phase 3: Determine storage type for each variable
    const variables = this.determineStorageTypes();

    // Phase 4: Generate helper configs for persistent variables
    const helpers = this.generateHelperConfigs(variables);

    // Phase 5: Validate
    this.validate(variables);

    return {
      variables,
      helpers,
      diagnostics: this.diagnostics,
    };
  }

  // ==========================================================================
  // Phase 1: Build Variable Map
  // ==========================================================================

  private buildVariableMap(): void {
    for (const varDecl of this.ast.variables) {
      this.variableMap.set(varDecl.name, varDecl);
    }
  }

  // ==========================================================================
  // Phase 2: Analyze Usage
  // ==========================================================================

  private analyzeUsage(): void {
    // Initialize usage info for all variables
    for (const varDecl of this.ast.variables) {
      this.usageMap.set(varDecl.name, {
        isRead: false,
        isWritten: false,
        hasSelfReference: false,
        isFBInstance: isFunctionBlockType(varDecl.dataType.name),
        isTimerRelated: this.isTimerRelatedType(varDecl.dataType.name),
        readCount: 0,
        writeCount: 0,
      });
    }

    // Track assignments to detect self-references
    const assignments: Map<string, Expression[]> = new Map();

    walkAST(this.ast, {
      onVariableRef: (node, context) => {
        const usage = this.usageMap.get(node.name);
        if (usage) {
          usage.isRead = true;
          usage.readCount++;
        }
      },

      onAssignment: (node, context) => {
        const targetName = typeof node.target === 'string' 
          ? node.target 
          : this.getAssignmentTargetName(node.target);
        
        if (targetName) {
          const usage = this.usageMap.get(targetName);
          if (usage) {
            usage.isWritten = true;
            usage.writeCount++;
          }

          // Collect assignments for self-reference detection
          if (!assignments.has(targetName)) {
            assignments.set(targetName, []);
          }
          assignments.get(targetName)!.push(node.value);
        }
      },
    });

    // Detect self-references (e.g., counter := counter + 1)
    for (const [varName, expressions] of assignments) {
      for (const expr of expressions) {
        if (expressionContainsVariable(expr, varName)) {
          const usage = this.usageMap.get(varName);
          if (usage) {
            usage.hasSelfReference = true;
          }
        }
      }
    }
  }

  private getAssignmentTargetName(target: Expression): string | null {
    if (target.type === 'VariableRef') {
      return target.name;
    }
    if (target.type === 'MemberAccess') {
      // Get root variable name
      let current = target;
      while (current.type === 'MemberAccess') {
        current = current.object as any;
      }
      if (current.type === 'VariableRef') {
        return current.name;
      }
    }
    return null;
  }

  private isTimerRelatedType(typeName: string): boolean {
    return ['TON', 'TOF', 'TP', 'TIME'].includes(typeName.toUpperCase());
  }

  // ==========================================================================
  // Phase 3: Determine Storage Types
  // ==========================================================================

  private determineStorageTypes(): VariableStorageInfo[] {
    const results: VariableStorageInfo[] = [];

    for (const varDecl of this.ast.variables) {
      const usage = this.usageMap.get(varDecl.name)!;
      const storage = this.determineStorageType(varDecl, usage);

      results.push({
        name: varDecl.name,
        dataType: varDecl.dataType.name,
        storage,
        usageInfo: usage,
      });
    }

    return results;
  }

  private determineStorageType(
    varDecl: VariableDeclaration,
    usage: VariableUsageInfo
  ): StorageDecision {
    
    // 1. Entity-bound variables → DERIVED
    if (varDecl.binding) {
      return {
        type: ST.DERIVED,
        reason: 'Entity-bound variable - value comes from entity state',
      };
    }

    // 2. Check explicit pragmas
    if (hasPragma(varDecl, 'transient')) {
      this.addDiagnostic('Info', StorageDiagnosticCodes.EXPLICIT_TRANSIENT,
        `Variable '${varDecl.name}' explicitly marked as transient`,
        varDecl.location);
      
      return {
        type: ST.TRANSIENT,
        reason: 'Explicit {transient} pragma',
      };
    }

    if (hasPragma(varDecl, 'persistent')) {
      this.addDiagnostic('Info', StorageDiagnosticCodes.EXPLICIT_PERSISTENT,
        `Variable '${varDecl.name}' explicitly marked as persistent`,
        varDecl.location);
      
      return this.createPersistentDecision(varDecl, 'Explicit {persistent} pragma');
    }

    // 3. Auto-detect persistence needs

    // Self-reference (counter := counter + 1) → PERSISTENT
    if (usage.hasSelfReference) {
      this.addDiagnostic('Info', StorageDiagnosticCodes.AUTO_PERSISTENT,
        `Variable '${varDecl.name}' auto-detected as persistent (self-reference)`,
        varDecl.location);
      
      return this.createPersistentDecision(varDecl, 'Self-reference detected');
    }

    // FB instances → PERSISTENT (they have internal state)
    if (usage.isFBInstance) {
      this.addDiagnostic('Info', StorageDiagnosticCodes.AUTO_PERSISTENT,
        `Variable '${varDecl.name}' auto-detected as persistent (FB instance)`,
        varDecl.location);
      
      return this.createPersistentDecision(varDecl, 'Function Block instance');
    }

    // Timer-related → PERSISTENT
    if (usage.isTimerRelated) {
      this.addDiagnostic('Info', StorageDiagnosticCodes.AUTO_PERSISTENT,
        `Variable '${varDecl.name}' auto-detected as persistent (timer-related)`,
        varDecl.location);
      
      return this.createPersistentDecision(varDecl, 'Timer-related variable');
    }

    // 4. Default → TRANSIENT
    return {
      type: ST.TRANSIENT,
      reason: 'No persistence requirement detected',
    };
  }

  private createPersistentDecision(
    varDecl: VariableDeclaration,
    reason: string
  ): StorageDecision {
    const helperType = getHelperType(varDecl.dataType.name);
    
    if (!helperType) {
      this.addDiagnostic('Warning', StorageDiagnosticCodes.INVALID_HELPER_TYPE,
        `Cannot create helper for type '${varDecl.dataType.name}' - using transient storage`,
        varDecl.location);
      
      return {
        type: ST.TRANSIENT,
        reason: `No helper type available for ${varDecl.dataType.name}`,
      };
    }

    const helperId = `input_${helperType.replace('input_', '')}.st_${this.projectName}_${this.ast.name}_${varDecl.name}`.toLowerCase();
    
    // Extract initial value
    let initialValue = getDefaultValue(varDecl.dataType.name);
    if (varDecl.initialValue?.type === 'Literal') {
      initialValue = convertToHelperValue(varDecl.initialValue.value, varDecl.dataType.name);
    }

    return {
      type: ST.PERSISTENT,
      reason,
      helperId,
      helperType,
      initialValue,
    };
  }

  // ==========================================================================
  // Phase 4: Generate Helper Configs
  // ==========================================================================

  private generateHelperConfigs(variables: VariableStorageInfo[]): HelperConfig[] {
    const helpers: HelperConfig[] = [];

    for (const varInfo of variables) {
      if (varInfo.storage.type !== ST.PERSISTENT) {
        continue;
      }

      const varDecl = this.variableMap.get(varInfo.name)!;
      const config = generateHelperConfig(
        this.projectName,
        this.ast.name,
        varInfo.name,
        varInfo.dataType,
        varInfo.storage.initialValue
      );

      if (config) {
        helpers.push(config);
      }
    }

    return helpers;
  }

  // ==========================================================================
  // Phase 5: Validation
  // ==========================================================================

  private validate(variables: VariableStorageInfo[]): void {
    for (const varInfo of variables) {
      const usage = varInfo.usageInfo;

      // Warn about self-referencing variables not marked as persistent
      if (usage.hasSelfReference && varInfo.storage.type === ST.TRANSIENT) {
        this.addDiagnostic('Warning', StorageDiagnosticCodes.SELF_REF_NOT_PERSISTENT,
          `Variable '${varInfo.name}' has self-reference but is transient - value will reset each run`,
          this.variableMap.get(varInfo.name)?.location);
      }

      // Warn about FB instances not marked as persistent
      if (usage.isFBInstance && varInfo.storage.type === ST.TRANSIENT) {
        this.addDiagnostic('Warning', StorageDiagnosticCodes.FB_INSTANCE_NOT_PERSISTENT,
          `Function Block '${varInfo.name}' is transient - internal state will reset each run`,
          this.variableMap.get(varInfo.name)?.location);
      }

      // Warn about persistent variables that are never written
      if (varInfo.storage.type === ST.PERSISTENT && !usage.isWritten) {
        this.addDiagnostic('Warning', StorageDiagnosticCodes.UNUSED_PERSISTENT,
          `Persistent variable '${varInfo.name}' is never written - consider making it transient`,
          this.variableMap.get(varInfo.name)?.location);
      }

      // Check for conflicting pragmas
      const varDecl = this.variableMap.get(varInfo.name)!;
      if (hasPragma(varDecl, 'persistent') && hasPragma(varDecl, 'transient')) {
        this.addDiagnostic('Error', StorageDiagnosticCodes.CONFLICTING_PRAGMAS,
          `Variable '${varInfo.name}' has conflicting {persistent} and {transient} pragmas`,
          varDecl.location);
      }
    }
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private addDiagnostic(
    severity: DiagnosticSeverity,
    code: string,
    message: string,
    location?: any
  ): void {
    this.diagnostics.push({ severity, code, message, location });
  }
}

// ============================================================================
// Convenience Function
// ============================================================================

/**
 * Analyze storage requirements for a program AST
 */
export function analyzeStorage(ast: ProgramNode, projectName?: string): StorageAnalysisResult {
  const analyzer = new StorageAnalyzer(ast, projectName);
  return analyzer.analyze();
}

/**
 * Get only the variables that need helpers
 */
export function getPersistentVariables(ast: ProgramNode, projectName?: string): VariableStorageInfo[] {
  const result = analyzeStorage(ast, projectName);
  return result.variables.filter(v => v.storage.type === ST.PERSISTENT);
}

/**
 * Get helper configs for a program
 */
export function getRequiredHelpers(ast: ProgramNode, projectName?: string): HelperConfig[] {
  const result = analyzeStorage(ast, projectName);
  return result.helpers;
}
```

---

## frontend/src/analyzer/__tests__/storage-analyzer.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { parse } from '../../parser';
import { analyzeStorage, getPersistentVariables, getRequiredHelpers } from '../storage-analyzer';
import { StorageType } from '../types';

describe('Storage Analyzer', () => {

  describe('Storage Type Detection', () => {

    it('marks entity-bound variables as DERIVED', () => {
      const code = `PROGRAM Test
VAR
    motion AT %I* : BOOL := 'binary_sensor.motion';
    light AT %Q* : BOOL := 'light.kitchen';
END_VAR
IF motion THEN
    light := TRUE;
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeStorage(ast!);

      const motion = result.variables.find(v => v.name === 'motion');
      const light = result.variables.find(v => v.name === 'light');

      expect(motion?.storage.type).toBe(StorageType.DERIVED);
      expect(light?.storage.type).toBe(StorageType.DERIVED);
    });

    it('marks regular variables as TRANSIENT by default', () => {
      const code = `PROGRAM Test
VAR
    temp : INT := 0;
    result : BOOL := FALSE;
END_VAR
temp := 42;
result := TRUE;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeStorage(ast!);

      expect(result.variables.every(v => v.storage.type === StorageType.TRANSIENT)).toBe(true);
    });

    it('detects self-reference as PERSISTENT', () => {
      const code = `PROGRAM Test
VAR
    counter : INT := 0;
END_VAR
counter := counter + 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeStorage(ast!);

      const counter = result.variables.find(v => v.name === 'counter');
      expect(counter?.storage.type).toBe(StorageType.PERSISTENT);
      expect(counter?.usageInfo.hasSelfReference).toBe(true);
    });

    it('detects FB instances as PERSISTENT', () => {
      const code = `PROGRAM Test
VAR
    timer1 : TON;
    trigger1 : R_TRIG;
END_VAR
timer1(IN := TRUE, PT := T#5s);
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeStorage(ast!);

      const timer = result.variables.find(v => v.name === 'timer1');
      const trigger = result.variables.find(v => v.name === 'trigger1');

      expect(timer?.storage.type).toBe(StorageType.PERSISTENT);
      expect(trigger?.storage.type).toBe(StorageType.PERSISTENT);
    });
  });

  describe('Pragma Control', () => {

    it('respects {persistent} pragma', () => {
      const code = `PROGRAM Test
VAR
    {persistent}
    state : INT := 0;
END_VAR
state := 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeStorage(ast!);

      const state = result.variables.find(v => v.name === 'state');
      expect(state?.storage.type).toBe(StorageType.PERSISTENT);
    });

    it('respects {transient} pragma even with self-reference', () => {
      const code = `PROGRAM Test
VAR
    {transient}
    counter : INT := 0;
END_VAR
counter := counter + 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeStorage(ast!);

      const counter = result.variables.find(v => v.name === 'counter');
      expect(counter?.storage.type).toBe(StorageType.TRANSIENT);
      
      // Should warn about self-reference in transient
      expect(result.diagnostics.some(d => d.code === 'W010')).toBe(true);
    });

    it('detects conflicting pragmas', () => {
      const code = `PROGRAM Test
VAR
    {persistent}
    {transient}
    confused : INT := 0;
END_VAR
confused := 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeStorage(ast!);

      expect(result.diagnostics.some(d => d.code === 'E011')).toBe(true);
    });
  });

  describe('Helper Generation', () => {

    it('generates input_number helper for INT', () => {
      const code = `PROGRAM Test
VAR
    {persistent}
    counter : INT := 42;
END_VAR
counter := counter + 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const helpers = getRequiredHelpers(ast!, 'myproject');

      expect(helpers).toHaveLength(1);
      expect(helpers[0].type).toBe('input_number');
      expect(helpers[0].id).toContain('st_myproject_test_counter');
      expect(helpers[0].initial).toBe(42);
    });

    it('generates input_boolean helper for BOOL', () => {
      const code = `PROGRAM Test
VAR
    {persistent}
    flag : BOOL := TRUE;
END_VAR
flag := NOT flag;
END_PROGRAM`;

      const { ast } = parse(code);
      const helpers = getRequiredHelpers(ast!);

      expect(helpers).toHaveLength(1);
      expect(helpers[0].type).toBe('input_boolean');
      expect(helpers[0].initial).toBe(true);
    });

    it('generates input_text helper for STRING', () => {
      const code = `PROGRAM Test
VAR
    {persistent}
    message : STRING := 'Hello';
END_VAR
message := 'World';
END_PROGRAM`;

      const { ast } = parse(code);
      const helpers = getRequiredHelpers(ast!);

      expect(helpers).toHaveLength(1);
      expect(helpers[0].type).toBe('input_text');
      expect(helpers[0].initial).toBe('Hello');
    });

    it('sets correct min/max for numeric helpers', () => {
      const code = `PROGRAM Test
VAR
    {persistent}
    small : SINT := 0;
    medium : INT := 0;
    large : DINT := 0;
END_VAR
small := small + 1;
medium := medium + 1;
large := large + 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const helpers = getRequiredHelpers(ast!);

      const small = helpers.find(h => h.id.includes('small'));
      const medium = helpers.find(h => h.id.includes('medium'));
      const large = helpers.find(h => h.id.includes('large'));

      expect(small?.min).toBe(-128);
      expect(small?.max).toBe(127);
      expect(medium?.min).toBe(-32768);
      expect(medium?.max).toBe(32767);
      expect(large?.min).toBe(-2147483648);
      expect(large?.max).toBe(2147483647);
    });

    it('follows namespace convention', () => {
      const code = `PROGRAM Kitchen_Light
VAR
    {persistent}
    activationCount : INT := 0;
END_VAR
activationCount := activationCount + 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const helpers = getRequiredHelpers(ast!, 'home');

      expect(helpers[0].id).toBe('input_number.st_home_kitchen_light_activationcount');
    });
  });

  describe('Usage Analysis', () => {

    it('tracks read and write counts', () => {
      const code = `PROGRAM Test
VAR
    x : INT := 0;
END_VAR
x := 1;
x := x + 1;
x := x * 2;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeStorage(ast!);

      const x = result.variables.find(v => v.name === 'x');
      expect(x?.usageInfo.isRead).toBe(true);
      expect(x?.usageInfo.isWritten).toBe(true);
      expect(x?.usageInfo.readCount).toBe(2); // x + 1, x * 2
      expect(x?.usageInfo.writeCount).toBe(3);
    });

    it('warns about unused persistent variables', () => {
      const code = `PROGRAM Test
VAR
    {persistent}
    unused : INT := 0;
    used : INT := 0;
END_VAR
used := used + 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeStorage(ast!);

      expect(result.diagnostics.some(d => 
        d.code === 'W012' && d.message.includes('unused')
      )).toBe(true);
    });
  });

  describe('getPersistentVariables', () => {

    it('returns only persistent variables', () => {
      const code = `PROGRAM Test
VAR
    derived AT %I* : BOOL := 'sensor.x';
    transient : INT := 0;
    {persistent}
    persistent1 : INT := 0;
    selfRef : INT := 0;
END_VAR
transient := 1;
persistent1 := 1;
selfRef := selfRef + 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const persistent = getPersistentVariables(ast!);

      expect(persistent).toHaveLength(2);
      expect(persistent.map(v => v.name)).toContain('persistent1');
      expect(persistent.map(v => v.name)).toContain('selfRef');
    });
  });
});
```

---

## Update zu frontend/src/analyzer/index.ts

```typescript
/**
 * Analyzer Module Exports
 */

// Types
export * from './types';

// Dependency Analyzer
export * from './dependency-analyzer';
export { analyzeDependencies, DependencyAnalyzer } from './dependency-analyzer';

// Storage Analyzer
export * from './storage-analyzer';
export { analyzeStorage, StorageAnalyzer, getPersistentVariables, getRequiredHelpers } from './storage-analyzer';

// Utilities
export * from './trigger-generator';
export * from './helper-mapping';
export * from './ast-visitor';
```

---

## Ausführungsschritte

```bash
cd "C:\##\Projects\ST_HA_Automation\frontend"

# Dateien erstellen/erweitern

# Tests ausführen
npm run test:run

# Type-Check
npm run typecheck

# Build
npm run build
```

---

## Erfolgskriterien

- [ ] Entity-gebundene Variablen werden als DERIVED erkannt
- [ ] Reguläre Variablen sind standardmäßig TRANSIENT
- [ ] Self-Reference (counter := counter + 1) → PERSISTENT
- [ ] FB-Instanzen (TON, R_TRIG) → PERSISTENT
- [ ] `{persistent}` Pragma erzwingt PERSISTENT
- [ ] `{transient}` Pragma erzwingt TRANSIENT
- [ ] Konflikt-Warnung bei beiden Pragmas
- [ ] Helper-Typ Mapping funktioniert (INT→input_number, BOOL→input_boolean)
- [ ] Helper-ID folgt Namespace-Konvention
- [ ] Initial-Werte werden übernommen
- [ ] Min/Max Grenzen für numerische Helper
- [ ] Warnung bei ungenutzten PERSISTENT Variablen
- [ ] Alle Tests bestehen

---

## Nicht in diesem Task

- Helper Manager (Erstellung/Sync in HA) → Phase 3
- Transpiler zu HA YAML
- Jinja-Generierung für Helper-Zugriff
- Migration bei Schema-Änderungen

---

## Nächste Integration

Nach Abschluss können beide Analyzer kombiniert werden:

```typescript
// In transpiler (später)
import { analyzeDependencies } from './analyzer';
import { analyzeStorage } from './analyzer';

function analyzeProgram(ast: ProgramNode) {
  const depResult = analyzeDependencies(ast);
  const storageResult = analyzeStorage(ast);
  
  return {
    triggers: depResult.triggers,
    helpers: storageResult.helpers,
    diagnostics: [...depResult.diagnostics, ...storageResult.diagnostics],
  };
}
```
```

