# Task: Dependency Analyzer - Automatische Trigger-Generierung

## Kontext

Du implementierst den Dependency Analyzer für das "ST for Home Assistant" Projekt. Der Analyzer löst das kritische **"Zyklus → Event"** Problem:

```
ST denkt:        "Ich prüfe kontinuierlich alle Variablen"
HA denkt:        "Ich schlafe bis ein Event kommt"
```

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`
**Voraussetzung:** Parser ist vollständig implementiert (Phase 1 abgeschlossen)

## ⚠️ Kritisches Problem

Ohne Dependency Analyzer würde ein ST-Programm **niemals ausgeführt** werden, weil HA keine Trigger hat. Der Analyzer muss:

1. Alle gelesenen Entity-Variablen im AST finden
2. Daraus automatisch HA State-Change-Trigger generieren
3. Pragmas (`{trigger}`, `{no_trigger}`) respektieren
4. Warnungen ausgeben wenn keine Trigger erkannt werden

## Ziel

Erstelle einen Dependency Analyzer mit:
- AST-Traversierung zur Entity-Extraktion
- Automatische Trigger-Generierung für Input-Entities
- Pragma-gesteuerte Trigger-Kontrolle
- R_TRIG / F_TRIG Erkennung für Flanken-Trigger
- Diagnostics mit Warnungen und Infos

---

## Zu erstellende Dateien

```
frontend/src/analyzer/
├── dependency-analyzer.ts    # Haupt-Analyzer
├── trigger-generator.ts      # Trigger-Config Generierung
├── ast-visitor.ts            # AST-Traversierung Helper
├── types.ts                  # Type Definitions
├── index.ts                  # Exports
└── __tests__/
    └── dependency-analyzer.test.ts
```

---

## frontend/src/analyzer/types.ts

```typescript
/**
 * Type Definitions for Analyzer Module
 */

import type { SourceLocation, ProgramNode, VariableDeclaration, Expression } from '../parser/ast';

// ============================================================================
// Trigger Types
// ============================================================================

export interface TriggerConfig {
  platform: 'state' | 'event' | 'time' | 'numeric_state';
  entity_id?: string;
  from?: string | string[];
  to?: string | string[];
  not_from?: string[];
  not_to?: string[];
  attribute?: string;
  for?: string;
  id?: string;
  // Event-specific
  event_type?: string;
  event_data?: Record<string, unknown>;
  // Time-specific
  at?: string;
  // Numeric state specific
  above?: number;
  below?: number;
}

export interface EdgeTrigger extends TriggerConfig {
  platform: 'state';
  from: string;
  to: string;
  edge: 'rising' | 'falling';
}

// ============================================================================
// Analysis Results
// ============================================================================

export interface EntityDependency {
  entityId: string;
  variableName: string;
  direction: 'INPUT' | 'OUTPUT' | 'MEMORY';
  dataType: string;
  isTrigger: boolean;
  location?: SourceLocation;
}

export interface AnalysisResult {
  triggers: TriggerConfig[];
  dependencies: EntityDependency[];
  diagnostics: Diagnostic[];
  metadata: AnalysisMetadata;
}

export interface AnalysisMetadata {
  programName: string;
  inputCount: number;
  outputCount: number;
  triggerCount: number;
  hasPersistentVars: boolean;
  hasTimers: boolean;
  mode?: string;
  throttle?: string;
  debounce?: string;
}

// ============================================================================
// Diagnostics
// ============================================================================

export type DiagnosticSeverity = 'Error' | 'Warning' | 'Info' | 'Hint';

export interface Diagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  location?: SourceLocation;
  relatedInfo?: string;
}

// Diagnostic Codes
export const DiagnosticCodes = {
  // Warnings (W0xx)
  NO_TRIGGERS: 'W001',
  MANY_TRIGGERS: 'W002',
  UNUSED_INPUT: 'W003',
  WRITE_TO_INPUT: 'W004',
  READ_FROM_OUTPUT: 'W005',
  
  // Info (I0xx)
  AUTO_TRIGGER: 'I001',
  EXPLICIT_NO_TRIGGER: 'I002',
  EDGE_TRIGGER_DETECTED: 'I003',
  
  // Errors (E0xx)
  INVALID_ENTITY_ID: 'E001',
  DUPLICATE_BINDING: 'E002',
  CIRCULAR_DEPENDENCY: 'E003',
} as const;

// ============================================================================
// Pragma Types
// ============================================================================

export interface ParsedPragma {
  name: string;
  value?: string | number | boolean;
}

export interface TriggerPragmaOptions {
  explicitTrigger: boolean;    // {trigger}
  explicitNoTrigger: boolean;  // {no_trigger}
  stateChange: boolean;        // Default for inputs
}
```

---

## frontend/src/analyzer/ast-visitor.ts

```typescript
/**
 * AST Visitor Utilities for Analysis
 */

import type {
  ASTNode,
  ProgramNode,
  VariableDeclaration,
  Statement,
  Expression,
  IfStatement,
  ForStatement,
  WhileStatement,
  RepeatStatement,
  CaseStatement,
  AssignmentStatement,
  FunctionCallStatement,
  BinaryExpression,
  UnaryExpression,
  VariableRef,
  MemberAccess,
  FunctionCall,
} from '../parser/ast';

export type VisitorCallback<T extends ASTNode = ASTNode> = (node: T, context: VisitorContext) => void;

export interface VisitorContext {
  scope: 'global' | 'local';
  inCondition: boolean;
  inLoop: boolean;
  currentStatement?: Statement;
  path: string[];
}

export interface VisitorOptions {
  onVariable?: VisitorCallback<VariableDeclaration>;
  onVariableRef?: VisitorCallback<VariableRef>;
  onAssignment?: VisitorCallback<AssignmentStatement>;
  onFunctionCall?: VisitorCallback<FunctionCall>;
  onExpression?: VisitorCallback<Expression>;
}

/**
 * Walk the AST and invoke callbacks
 */
export function walkAST(ast: ProgramNode, options: VisitorOptions): void {
  const context: VisitorContext = {
    scope: 'local',
    inCondition: false,
    inLoop: false,
    path: ['program'],
  };

  // Visit variable declarations
  for (const varDecl of ast.variables) {
    options.onVariable?.(varDecl, { ...context, path: [...context.path, 'variables', varDecl.name] });
  }

  // Visit statements
  visitStatements(ast.body, options, context);
}

function visitStatements(statements: Statement[], options: VisitorOptions, context: VisitorContext): void {
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const stmtContext = { ...context, currentStatement: stmt, path: [...context.path, `statement[${i}]`] };
    visitStatement(stmt, options, stmtContext);
  }
}

function visitStatement(stmt: Statement, options: VisitorOptions, context: VisitorContext): void {
  switch (stmt.type) {
    case 'Assignment':
      options.onAssignment?.(stmt, context);
      visitExpression(stmt.value, options, context);
      break;

    case 'IfStatement':
      visitIfStatement(stmt, options, context);
      break;

    case 'ForStatement':
      visitForStatement(stmt, options, context);
      break;

    case 'WhileStatement':
      visitWhileStatement(stmt, options, context);
      break;

    case 'RepeatStatement':
      visitRepeatStatement(stmt, options, context);
      break;

    case 'CaseStatement':
      visitCaseStatement(stmt, options, context);
      break;

    case 'FunctionCallStatement':
      visitFunctionCall(stmt.call, options, context);
      break;

    case 'ReturnStatement':
      if (stmt.value) {
        visitExpression(stmt.value, options, context);
      }
      break;
  }
}

function visitIfStatement(stmt: IfStatement, options: VisitorOptions, context: VisitorContext): void {
  const condContext = { ...context, inCondition: true };
  
  // Visit condition
  visitExpression(stmt.condition, options, condContext);
  
  // Visit then branch
  visitStatements(stmt.thenBranch, options, context);
  
  // Visit elsif branches
  for (const elsif of stmt.elsifBranches) {
    visitExpression(elsif.condition, options, condContext);
    visitStatements(elsif.body, options, context);
  }
  
  // Visit else branch
  if (stmt.elseBranch) {
    visitStatements(stmt.elseBranch, options, context);
  }
}

function visitForStatement(stmt: ForStatement, options: VisitorOptions, context: VisitorContext): void {
  const loopContext = { ...context, inLoop: true };
  
  visitExpression(stmt.from, options, context);
  visitExpression(stmt.to, options, context);
  if (stmt.by) {
    visitExpression(stmt.by, options, context);
  }
  
  visitStatements(stmt.body, options, loopContext);
}

function visitWhileStatement(stmt: WhileStatement, options: VisitorOptions, context: VisitorContext): void {
  const loopContext = { ...context, inLoop: true, inCondition: true };
  
  visitExpression(stmt.condition, options, loopContext);
  visitStatements(stmt.body, options, { ...loopContext, inCondition: false });
}

function visitRepeatStatement(stmt: RepeatStatement, options: VisitorOptions, context: VisitorContext): void {
  const loopContext = { ...context, inLoop: true };
  
  visitStatements(stmt.body, options, loopContext);
  visitExpression(stmt.condition, options, { ...loopContext, inCondition: true });
}

function visitCaseStatement(stmt: CaseStatement, options: VisitorOptions, context: VisitorContext): void {
  visitExpression(stmt.selector, options, { ...context, inCondition: true });
  
  for (const caseClause of stmt.cases) {
    for (const value of caseClause.values) {
      visitExpression(value, options, context);
    }
    visitStatements(caseClause.body, options, context);
  }
  
  if (stmt.elseCase) {
    visitStatements(stmt.elseCase, options, context);
  }
}

function visitExpression(expr: Expression, options: VisitorOptions, context: VisitorContext): void {
  options.onExpression?.(expr, context);
  
  switch (expr.type) {
    case 'VariableRef':
      options.onVariableRef?.(expr, context);
      break;

    case 'BinaryExpression':
      visitExpression(expr.left, options, context);
      visitExpression(expr.right, options, context);
      break;

    case 'UnaryExpression':
      visitExpression(expr.operand, options, context);
      break;

    case 'MemberAccess':
      visitExpression(expr.object, options, context);
      break;

    case 'FunctionCall':
      visitFunctionCall(expr, options, context);
      break;

    case 'ParenExpression':
      visitExpression(expr.expression, options, context);
      break;
  }
}

function visitFunctionCall(call: FunctionCall, options: VisitorOptions, context: VisitorContext): void {
  options.onFunctionCall?.(call, context);
  
  for (const arg of call.arguments) {
    visitExpression(arg.value, options, context);
  }
}

/**
 * Find all variable references in an expression
 */
export function findVariableRefs(expr: Expression): string[] {
  const refs: string[] = [];
  
  const visitor: VisitorOptions = {
    onVariableRef: (node) => {
      refs.push(node.name);
    },
  };
  
  visitExpression(expr, visitor, {
    scope: 'local',
    inCondition: false,
    inLoop: false,
    path: [],
  });
  
  return refs;
}

/**
 * Check if expression contains a specific variable
 */
export function expressionContainsVariable(expr: Expression, varName: string): boolean {
  return findVariableRefs(expr).includes(varName);
}
```

---

## frontend/src/analyzer/trigger-generator.ts

```typescript
/**
 * Trigger Configuration Generator
 */

import type { TriggerConfig, EdgeTrigger, EntityDependency, ParsedPragma } from './types';
import type { VariableDeclaration, PragmaNode } from '../parser/ast';

// ============================================================================
// Trigger Generation
// ============================================================================

/**
 * Generate a state change trigger for an entity
 */
export function generateStateTrigger(dep: EntityDependency): TriggerConfig {
  return {
    platform: 'state',
    entity_id: dep.entityId,
    not_from: ['unavailable', 'unknown'],
    not_to: ['unavailable', 'unknown'],
    id: `dep_${dep.variableName}`,
  };
}

/**
 * Generate a rising edge trigger (R_TRIG equivalent)
 */
export function generateRisingEdgeTrigger(dep: EntityDependency): EdgeTrigger {
  return {
    platform: 'state',
    entity_id: dep.entityId,
    from: 'off',
    to: 'on',
    edge: 'rising',
    id: `rtrig_${dep.variableName}`,
  };
}

/**
 * Generate a falling edge trigger (F_TRIG equivalent)
 */
export function generateFallingEdgeTrigger(dep: EntityDependency): EdgeTrigger {
  return {
    platform: 'state',
    entity_id: dep.entityId,
    from: 'on',
    to: 'off',
    edge: 'falling',
    id: `ftrig_${dep.variableName}`,
  };
}

/**
 * Generate numeric state trigger for threshold comparisons
 */
export function generateNumericStateTrigger(
  dep: EntityDependency,
  options: { above?: number; below?: number }
): TriggerConfig {
  return {
    platform: 'numeric_state',
    entity_id: dep.entityId,
    above: options.above,
    below: options.below,
    id: `numeric_${dep.variableName}`,
  };
}

// ============================================================================
// Pragma Parsing
// ============================================================================

/**
 * Parse pragma nodes into structured format
 */
export function parsePragmas(pragmas: PragmaNode[]): ParsedPragma[] {
  return pragmas.map(p => ({
    name: p.name.toLowerCase(),
    value: p.value,
  }));
}

/**
 * Check if variable should trigger automation
 */
export function shouldTrigger(varDecl: VariableDeclaration): boolean {
  const pragmas = parsePragmas(varDecl.pragmas);
  
  // Explicit {no_trigger} = never trigger
  if (pragmas.some(p => p.name === 'no_trigger')) {
    return false;
  }
  
  // Explicit {trigger} = always trigger
  if (pragmas.some(p => p.name === 'trigger')) {
    return true;
  }
  
  // Default: INPUT bindings trigger, others don't
  return varDecl.binding?.direction === 'INPUT';
}

/**
 * Check if variable has specific pragma
 */
export function hasPragma(varDecl: VariableDeclaration, pragmaName: string): boolean {
  return varDecl.pragmas.some(p => p.name.toLowerCase() === pragmaName.toLowerCase());
}

/**
 * Get pragma value if exists
 */
export function getPragmaValue(varDecl: VariableDeclaration, pragmaName: string): string | undefined {
  const pragma = varDecl.pragmas.find(p => p.name.toLowerCase() === pragmaName.toLowerCase());
  return pragma?.value;
}

// ============================================================================
// Entity ID Validation
// ============================================================================

const VALID_DOMAINS = [
  'binary_sensor', 'sensor', 'switch', 'light', 'cover', 'fan', 'climate',
  'input_boolean', 'input_number', 'input_text', 'input_select', 'input_datetime',
  'automation', 'script', 'scene', 'timer', 'counter', 'person', 'zone',
  'device_tracker', 'media_player', 'camera', 'vacuum', 'lock', 'alarm_control_panel',
  'water_heater', 'humidifier', 'number', 'select', 'button', 'text',
];

/**
 * Validate entity ID format
 */
export function isValidEntityId(entityId: string): boolean {
  if (!entityId || typeof entityId !== 'string') {
    return false;
  }
  
  const parts = entityId.split('.');
  if (parts.length !== 2) {
    return false;
  }
  
  const [domain, name] = parts;
  
  // Check domain is valid
  if (!VALID_DOMAINS.includes(domain)) {
    return false;
  }
  
  // Check name is valid (alphanumeric + underscore)
  if (!/^[a-z0-9_]+$/.test(name)) {
    return false;
  }
  
  return true;
}

/**
 * Extract domain from entity ID
 */
export function getEntityDomain(entityId: string): string | null {
  const parts = entityId.split('.');
  return parts.length === 2 ? parts[0] : null;
}

/**
 * Check if entity is typically boolean (on/off)
 */
export function isBooleanEntity(entityId: string): boolean {
  const domain = getEntityDomain(entityId);
  return domain !== null && [
    'binary_sensor', 'switch', 'light', 'input_boolean', 'fan',
    'lock', 'cover', 'automation', 'script',
  ].includes(domain);
}

/**
 * Check if entity is typically numeric
 */
export function isNumericEntity(entityId: string): boolean {
  const domain = getEntityDomain(entityId);
  return domain !== null && [
    'sensor', 'input_number', 'number', 'counter',
  ].includes(domain);
}
```

---

## frontend/src/analyzer/dependency-analyzer.ts

```typescript
/**
 * Dependency Analyzer - Extract triggers from ST AST
 * 
 * Solves the "Cycle → Event" problem by analyzing which entities
 * are read in the program and generating appropriate HA triggers.
 */

import type { ProgramNode, VariableDeclaration, PragmaNode, Expression } from '../parser/ast';
import type {
  AnalysisResult,
  EntityDependency,
  TriggerConfig,
  Diagnostic,
  AnalysisMetadata,
  DiagnosticSeverity,
} from './types';
import { DiagnosticCodes } from './types';
import { walkAST, findVariableRefs } from './ast-visitor';
import {
  generateStateTrigger,
  generateRisingEdgeTrigger,
  generateFallingEdgeTrigger,
  shouldTrigger,
  hasPragma,
  getPragmaValue,
  isValidEntityId,
  parsePragmas,
} from './trigger-generator';

// ============================================================================
// Main Analyzer Class
// ============================================================================

export class DependencyAnalyzer {
  private ast: ProgramNode;
  private dependencies: Map<string, EntityDependency> = new Map();
  private triggers: TriggerConfig[] = [];
  private diagnostics: Diagnostic[] = [];
  private readVariables: Set<string> = new Set();
  private writtenVariables: Set<string> = new Set();
  private variableMap: Map<string, VariableDeclaration> = new Map();

  constructor(ast: ProgramNode) {
    this.ast = ast;
  }

  /**
   * Run full analysis and return results
   */
  analyze(): AnalysisResult {
    // Phase 1: Build variable map
    this.buildVariableMap();

    // Phase 2: Extract entity dependencies from declarations
    this.extractDependencies();

    // Phase 3: Analyze variable usage in code
    this.analyzeUsage();

    // Phase 4: Generate triggers
    this.generateTriggers();

    // Phase 5: Validate and generate diagnostics
    this.validate();

    // Phase 6: Build metadata
    const metadata = this.buildMetadata();

    return {
      triggers: this.triggers,
      dependencies: Array.from(this.dependencies.values()),
      diagnostics: this.diagnostics,
      metadata,
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
  // Phase 2: Extract Dependencies
  // ==========================================================================

  private extractDependencies(): void {
    for (const varDecl of this.ast.variables) {
      // Skip variables without entity bindings
      if (!varDecl.binding) {
        continue;
      }

      // Extract entity ID from initial value (string literal)
      const entityId = this.extractEntityId(varDecl);
      if (!entityId) {
        this.addDiagnostic('Error', DiagnosticCodes.INVALID_ENTITY_ID,
          `Variable '${varDecl.name}' has binding but no valid entity ID`,
          varDecl.location);
        continue;
      }

      // Validate entity ID format
      if (!isValidEntityId(entityId)) {
        this.addDiagnostic('Error', DiagnosticCodes.INVALID_ENTITY_ID,
          `Invalid entity ID format: '${entityId}' for variable '${varDecl.name}'`,
          varDecl.location);
        continue;
      }

      // Check for duplicate bindings
      if (this.dependencies.has(entityId)) {
        this.addDiagnostic('Warning', DiagnosticCodes.DUPLICATE_BINDING,
          `Entity '${entityId}' is bound to multiple variables`,
          varDecl.location);
      }

      const dependency: EntityDependency = {
        entityId,
        variableName: varDecl.name,
        direction: varDecl.binding.direction,
        dataType: varDecl.dataType.name,
        isTrigger: shouldTrigger(varDecl),
        location: varDecl.location,
      };

      this.dependencies.set(varDecl.name, dependency);

      // Log explicit trigger/no_trigger pragmas
      if (hasPragma(varDecl, 'trigger')) {
        this.addDiagnostic('Info', DiagnosticCodes.AUTO_TRIGGER,
          `Variable '${varDecl.name}' explicitly marked as trigger`,
          varDecl.location);
      }
      if (hasPragma(varDecl, 'no_trigger')) {
        this.addDiagnostic('Info', DiagnosticCodes.EXPLICIT_NO_TRIGGER,
          `Variable '${varDecl.name}' explicitly excluded from triggers`,
          varDecl.location);
      }
    }
  }

  private extractEntityId(varDecl: VariableDeclaration): string | null {
    if (!varDecl.initialValue) {
      return null;
    }

    // Entity ID is stored as string literal in initial value
    if (varDecl.initialValue.type === 'Literal' && varDecl.initialValue.kind === 'string') {
      return varDecl.initialValue.value as string;
    }

    return null;
  }

  // ==========================================================================
  // Phase 3: Analyze Usage
  // ==========================================================================

  private analyzeUsage(): void {
    walkAST(this.ast, {
      onVariableRef: (node, context) => {
        this.readVariables.add(node.name);
      },

      onAssignment: (node, context) => {
        // Track written variables
        if (typeof node.target === 'string') {
          this.writtenVariables.add(node.target);
        } else if (node.target.type === 'MemberAccess') {
          // For member access, get the root variable
          let current: Expression = node.target;
          while (current.type === 'MemberAccess') {
            current = current.object;
          }
          if (current.type === 'VariableRef') {
            this.writtenVariables.add(current.name);
          }
        }
      },

      onFunctionCall: (node, context) => {
        // Check for R_TRIG / F_TRIG function blocks
        const name = node.name.toUpperCase();
        if (name === 'R_TRIG' || name === 'F_TRIG') {
          this.handleEdgeTrigger(node, name);
        }
      },
    });
  }

  private handleEdgeTrigger(call: { name: string; arguments: { value: Expression }[] }, trigType: string): void {
    // R_TRIG/F_TRIG typically take an input variable as argument
    if (call.arguments.length > 0) {
      const refs = findVariableRefs(call.arguments[0].value);
      for (const refName of refs) {
        const dep = this.dependencies.get(refName);
        if (dep && dep.direction === 'INPUT') {
          this.addDiagnostic('Info', DiagnosticCodes.EDGE_TRIGGER_DETECTED,
            `${trigType} detected on '${refName}' - will generate edge trigger`,
            dep.location);
        }
      }
    }
  }

  // ==========================================================================
  // Phase 4: Generate Triggers
  // ==========================================================================

  private generateTriggers(): void {
    for (const [varName, dep] of this.dependencies) {
      // Skip outputs and non-triggering variables
      if (dep.direction === 'OUTPUT' || !dep.isTrigger) {
        continue;
      }

      // Check if variable is actually read in code
      if (!this.readVariables.has(varName)) {
        this.addDiagnostic('Warning', DiagnosticCodes.UNUSED_INPUT,
          `Input variable '${varName}' is declared but never read`,
          dep.location);
        continue;
      }

      // Generate appropriate trigger
      const trigger = generateStateTrigger(dep);
      this.triggers.push(trigger);
    }

    // Deduplicate triggers by entity_id
    this.triggers = this.deduplicateTriggers(this.triggers);
  }

  private deduplicateTriggers(triggers: TriggerConfig[]): TriggerConfig[] {
    const seen = new Map<string, TriggerConfig>();
    
    for (const trigger of triggers) {
      const key = trigger.entity_id || '';
      if (!seen.has(key)) {
        seen.set(key, trigger);
      }
    }
    
    return Array.from(seen.values());
  }

  // ==========================================================================
  // Phase 5: Validation
  // ==========================================================================

  private validate(): void {
    // Check for no triggers
    if (this.triggers.length === 0) {
      this.addDiagnostic('Warning', DiagnosticCodes.NO_TRIGGERS,
        'No triggers detected. Program will never execute automatically. ' +
        'Add {trigger} pragma to input variables or ensure inputs are read in code.',
        this.ast.location);
    }

    // Check for many triggers (performance warning)
    if (this.triggers.length > 10) {
      this.addDiagnostic('Info', DiagnosticCodes.MANY_TRIGGERS,
        `Program triggers on ${this.triggers.length} entities. ` +
        'Consider using {no_trigger} pragma on less important inputs.',
        this.ast.location);
    }

    // Check for writes to input variables
    for (const [varName, dep] of this.dependencies) {
      if (dep.direction === 'INPUT' && this.writtenVariables.has(varName)) {
        this.addDiagnostic('Warning', DiagnosticCodes.WRITE_TO_INPUT,
          `Writing to input variable '${varName}' - this may not update the entity`,
          dep.location);
      }

      if (dep.direction === 'OUTPUT' && this.readVariables.has(varName) && 
          !this.writtenVariables.has(varName)) {
        this.addDiagnostic('Warning', DiagnosticCodes.READ_FROM_OUTPUT,
          `Reading from output variable '${varName}' without writing - value may be stale`,
          dep.location);
      }
    }
  }

  // ==========================================================================
  // Phase 6: Build Metadata
  // ==========================================================================

  private buildMetadata(): AnalysisMetadata {
    const deps = Array.from(this.dependencies.values());
    const programPragmas = parsePragmas(this.ast.pragmas);

    return {
      programName: this.ast.name,
      inputCount: deps.filter(d => d.direction === 'INPUT').length,
      outputCount: deps.filter(d => d.direction === 'OUTPUT').length,
      triggerCount: this.triggers.length,
      hasPersistentVars: this.ast.variables.some(v => hasPragma(v, 'persistent')),
      hasTimers: this.hasTimerUsage(),
      mode: programPragmas.find(p => p.name === 'mode')?.value as string | undefined,
      throttle: programPragmas.find(p => p.name === 'throttle')?.value as string | undefined,
      debounce: programPragmas.find(p => p.name === 'debounce')?.value as string | undefined,
    };
  }

  private hasTimerUsage(): boolean {
    let hasTimer = false;
    
    walkAST(this.ast, {
      onFunctionCall: (node) => {
        const name = node.name.toUpperCase();
        if (['TON', 'TOF', 'TP'].includes(name)) {
          hasTimer = true;
        }
      },
    });
    
    return hasTimer;
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
 * Analyze a program AST and return dependency analysis results
 */
export function analyzeDependencies(ast: ProgramNode): AnalysisResult {
  const analyzer = new DependencyAnalyzer(ast);
  return analyzer.analyze();
}
```

---

## frontend/src/analyzer/index.ts

```typescript
/**
 * Analyzer Module Exports
 */

export * from './types';
export * from './dependency-analyzer';
export * from './trigger-generator';
export * from './ast-visitor';

// Convenience re-export
export { analyzeDependencies, DependencyAnalyzer } from './dependency-analyzer';
```

---

## frontend/src/analyzer/__tests__/dependency-analyzer.test.ts

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { parse } from '../../parser';
import { analyzeDependencies, DependencyAnalyzer } from '../dependency-analyzer';
import type { AnalysisResult } from '../types';

describe('Dependency Analyzer', () => {
  
  describe('Basic Trigger Generation', () => {
    
    it('generates trigger for input variable', () => {
      const code = `PROGRAM Test
VAR
    motion AT %I* : BOOL := 'binary_sensor.motion';
END_VAR
IF motion THEN
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].entity_id).toBe('binary_sensor.motion');
      expect(result.triggers[0].platform).toBe('state');
    });

    it('generates multiple triggers for multiple inputs', () => {
      const code = `PROGRAM Test
VAR
    motion AT %I* : BOOL := 'binary_sensor.motion';
    temp AT %I* : REAL := 'sensor.temperature';
END_VAR
IF motion AND temp > 20.0 THEN
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.triggers).toHaveLength(2);
      expect(result.triggers.map(t => t.entity_id)).toContain('binary_sensor.motion');
      expect(result.triggers.map(t => t.entity_id)).toContain('sensor.temperature');
    });

    it('does NOT generate trigger for output variable', () => {
      const code = `PROGRAM Test
VAR
    light AT %Q* : BOOL := 'light.kitchen';
END_VAR
light := TRUE;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.triggers).toHaveLength(0);
      expect(result.diagnostics.some(d => d.code === 'W001')).toBe(true); // NO_TRIGGERS warning
    });
  });

  describe('Pragma Control', () => {
    
    it('respects {trigger} pragma', () => {
      const code = `PROGRAM Test
VAR
    {trigger}
    sensor AT %I* : REAL := 'sensor.value';
END_VAR
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      // Note: Variable declared but not used - should warn but still add trigger
      // due to explicit {trigger} pragma
      const dep = result.dependencies.find(d => d.variableName === 'sensor');
      expect(dep?.isTrigger).toBe(true);
    });

    it('respects {no_trigger} pragma', () => {
      const code = `PROGRAM Test
VAR
    {no_trigger}
    motion AT %I* : BOOL := 'binary_sensor.motion';
    {trigger}
    temp AT %I* : REAL := 'sensor.temp';
END_VAR
IF motion AND temp > 20.0 THEN
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      // Only temp should trigger
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].entity_id).toBe('sensor.temp');
    });
  });

  describe('Diagnostics', () => {
    
    it('warns when no triggers detected', () => {
      const code = `PROGRAM Test
VAR
    x : INT := 0;
END_VAR
x := 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.diagnostics.some(d => d.code === 'W001')).toBe(true);
    });

    it('warns about unused input variables', () => {
      const code = `PROGRAM Test
VAR
    motion AT %I* : BOOL := 'binary_sensor.motion';
    unused AT %I* : BOOL := 'binary_sensor.unused';
END_VAR
IF motion THEN
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.diagnostics.some(d => 
        d.code === 'W003' && d.message.includes('unused')
      )).toBe(true);
    });

    it('warns when writing to input variable', () => {
      const code = `PROGRAM Test
VAR
    motion AT %I* : BOOL := 'binary_sensor.motion';
END_VAR
motion := TRUE;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.diagnostics.some(d => d.code === 'W004')).toBe(true);
    });

    it('warns about many triggers', () => {
      const vars = Array.from({ length: 12 }, (_, i) => 
        `s${i} AT %I* : BOOL := 'binary_sensor.s${i}';`
      ).join('\n    ');
      
      const reads = Array.from({ length: 12 }, (_, i) => `s${i}`).join(' OR ');

      const code = `PROGRAM Test
VAR
    ${vars}
END_VAR
IF ${reads} THEN
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.diagnostics.some(d => d.code === 'W002')).toBe(true);
    });
  });

  describe('Entity Dependency Extraction', () => {
    
    it('extracts entity ID from string literal', () => {
      const code = `PROGRAM Test
VAR
    motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';
END_VAR
IF motion THEN
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      const dep = result.dependencies.find(d => d.variableName === 'motion');
      expect(dep).toBeDefined();
      expect(dep?.entityId).toBe('binary_sensor.kitchen_motion');
      expect(dep?.direction).toBe('INPUT');
      expect(dep?.dataType).toBe('BOOL');
    });

    it('correctly identifies INPUT vs OUTPUT direction', () => {
      const code = `PROGRAM Test
VAR
    sensor AT %I* : REAL := 'sensor.temp';
    actuator AT %Q* : BOOL := 'switch.fan';
END_VAR
IF sensor > 25.0 THEN
    actuator := TRUE;
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      const sensorDep = result.dependencies.find(d => d.variableName === 'sensor');
      const actuatorDep = result.dependencies.find(d => d.variableName === 'actuator');

      expect(sensorDep?.direction).toBe('INPUT');
      expect(actuatorDep?.direction).toBe('OUTPUT');
    });

    it('validates entity ID format', () => {
      const code = `PROGRAM Test
VAR
    bad AT %I* : BOOL := 'invalid entity id';
END_VAR
IF bad THEN
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.diagnostics.some(d => d.code === 'E001')).toBe(true);
    });
  });

  describe('Metadata Extraction', () => {
    
    it('extracts program metadata', () => {
      const code = `{mode: restart}
{throttle: T#1s}
PROGRAM Kitchen
VAR
    motion AT %I* : BOOL := 'binary_sensor.motion';
    light AT %Q* : BOOL := 'light.kitchen';
    {persistent}
    counter : INT := 0;
END_VAR
IF motion THEN
    light := TRUE;
    counter := counter + 1;
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.metadata.programName).toBe('Kitchen');
      expect(result.metadata.inputCount).toBe(1);
      expect(result.metadata.outputCount).toBe(1);
      expect(result.metadata.hasPersistentVars).toBe(true);
      expect(result.metadata.mode).toBe('restart');
      expect(result.metadata.throttle).toBe('T#1s');
    });

    it('detects timer usage', () => {
      const code = `PROGRAM Test
VAR
    timer1 : TON;
END_VAR
timer1(IN := TRUE, PT := T#5s);
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      expect(result.metadata.hasTimers).toBe(true);
    });
  });

  describe('Trigger Deduplication', () => {
    
    it('removes duplicate triggers for same entity', () => {
      const code = `PROGRAM Test
VAR
    motion1 AT %I* : BOOL := 'binary_sensor.motion';
    motion2 AT %I* : BOOL := 'binary_sensor.motion';
END_VAR
IF motion1 OR motion2 THEN
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = analyzeDependencies(ast!);

      // Should only have one trigger despite two variables bound to same entity
      const motionTriggers = result.triggers.filter(t => 
        t.entity_id === 'binary_sensor.motion'
      );
      expect(motionTriggers).toHaveLength(1);
    });
  });
});
```

---

## Ausführungsschritte

```bash
cd "C:\##\Projects\ST_HA_Automation\frontend"

# Dateien in src/analyzer/ erstellen

# Tests ausführen
npm run test:run

# Type-Check
npm run typecheck

# Build
npm run build
```

---

## Erfolgskriterien

- [ ] Entity-Variablen werden aus AST extrahiert
- [ ] INPUT-Variablen erzeugen automatisch State-Trigger
- [ ] OUTPUT-Variablen erzeugen KEINE Trigger
- [ ] `{trigger}` Pragma erzwingt Trigger
- [ ] `{no_trigger}` Pragma unterdrückt Trigger
- [ ] Warnung W001 bei 0 Triggern
- [ ] Warnung W002 bei >10 Triggern
- [ ] Warnung W003 bei ungenutzten Inputs
- [ ] Warnung W004 bei Schreiben auf Inputs
- [ ] Entity-ID Format wird validiert
- [ ] Programm-Metadaten werden extrahiert
- [ ] Duplikate werden entfernt
- [ ] Alle Tests bestehen

---

## Nicht in diesem Task

- Storage Analyzer (→ 05_Storage_Analyzer.md)
- Transpiler zu HA YAML
- Type Checking / Semantic Analysis
- R_TRIG/F_TRIG als eigenständige FB-Klassen

---

## Integration in das ST-Panel

Der Dependency Analyzer ist bereits im `st-panel.ts` als **reine Fachlogik** eingebunden (siehe auch `02_CodeMirror_Spike.md` für die Scope-Erweiterung):

```typescript
// In st-panel.ts
import { parse } from '../parser';
import { analyzeDependencies } from '../analyzer';

private _analyzeCode() {
  const diagnostics: CombinedDiagnostic[] = [];

  // 1) Parser
  const parseResult = parse(this._code);
  if (parseResult.errors.length > 0) {
    for (const error of parseResult.errors) {
      diagnostics.push({
        severity: "Error",
        message: error.message,
        line: error.line,
        column: error.column,
      });
    }
  }

  this._syntaxOk = parseResult.success && parseResult.ast !== undefined;

  // 2) Analyzer
  if (parseResult.success && parseResult.ast) {
    const analysis = analyzeDependencies(parseResult.ast);

    for (const diag of analysis.diagnostics) {
      diagnostics.push({
        severity: diag.severity,
        code: diag.code,
        message: diag.message,
        line: diag.location?.line,
        column: diag.location?.column,
      });
    }

    this._triggers = analysis.triggers;
    this._metadata = analysis.metadata;
    this._entityCount = analysis.dependencies.length;
  } else {
    this._triggers = [];
    this._metadata = null;
    this._entityCount = 0;
  }

  this._diagnostics = diagnostics;
}
```

Damit ist die Verantwortung klar getrennt:

- **Parser**: ST → AST + Parser-Fehler (siehe `03_Parser_Spike.md`, Task T‑003)  
- **Analyzer**: AST → Triggers, Dependencies, Diagnostics, Metadata (dieses Dokument, Task T‑004/T‑005/T‑007)  
- **Panel**: UI-/UX‑Schicht, die Editor, Parser und Analyzer zusammensetzt und Ergebnisse visualisiert.
