# Task: Transpiler Basis - ST → HA YAML

## Kontext

Du implementierst den Basis-Transpiler für das "ST for Home Assistant" Projekt. Der Transpiler wandelt den **AST** in **native Home Assistant YAML** (Automationen + Scripts) um.

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`
**Voraussetzung:** Dependency Analyzer + Storage Analyzer sind implementiert (Phase 2 abgeschlossen)

## Ziel

Erstelle einen Basis-Transpiler mit:
- IF/ELSIF/ELSE → HA `choose` Actions
- CASE → HA `choose` mit mehreren Conditions
- FOR/WHILE/REPEAT → HA `repeat` Actions
- Assignments → HA `service` Calls oder `variables`
- Entity-Binding Resolution
- Defensive Jinja-Generierung

---

## Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Transpiler Pipeline                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────────────┐  │
│  │   AST   │───▶│ Dependency   │───▶│  Storage    │───▶│  Transpiler    │  │
│  │         │    │  Analyzer    │    │  Analyzer   │    │                │  │
│  └─────────┘    └──────────────┘    └─────────────┘    └───────┬────────┘  │
│                                                                 │           │
│                                                                 ▼           │
│                              ┌──────────────────────────────────────────┐   │
│                              │              Output                      │   │
│                              │  ┌────────────┐    ┌─────────────────┐  │   │
│                              │  │ Automation │    │     Script      │  │   │
│                              │  │ (Trigger)  │    │    (Logic)      │  │   │
│                              │  └────────────┘    └─────────────────┘  │   │
│                              │  ┌────────────────────────────────────┐ │   │
│                              │  │         Helper Configs             │ │   │
│                              │  └────────────────────────────────────┘ │   │
│                              └──────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Zu erstellende Dateien

```
frontend/src/transpiler/
├── transpiler.ts             # Haupt-Transpiler
├── jinja-generator.ts        # Defensive Jinja-Generierung
├── action-generator.ts       # Statement → HA Action
├── trigger-generator.ts      # Triggers für Automation
├── types.ts                  # Output Types
├── source-map.ts             # Source Mapping für Debugging
├── index.ts                  # Exports
└── __tests__/
    ├── transpiler.test.ts
    └── jinja-generator.test.ts
```

---

## frontend/src/transpiler/types.ts

```typescript
/**
 * Transpiler Output Types
 */

// ============================================================================
// HA Automation/Script Types
// ============================================================================

export interface HAAutomation {
  id: string;
  alias: string;
  description?: string;
  mode: 'single' | 'restart' | 'queued' | 'parallel';
  max?: number;
  trigger: HATrigger[];
  condition?: HACondition[];
  action: HAAction[];
  variables?: Record<string, string>;
}

export interface HAScript {
  alias: string;
  description?: string;
  mode: 'single' | 'restart' | 'queued' | 'parallel';
  max?: number;
  sequence: HAAction[];
  variables?: Record<string, string>;
  fields?: Record<string, HAScriptField>;
}

export interface HAScriptField {
  name: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  selector?: Record<string, unknown>;
}

// ============================================================================
// Trigger Types
// ============================================================================

export type HATrigger = 
  | HAStateTrigger
  | HAEventTrigger
  | HATimeTrigger
  | HANumericStateTrigger;

export interface HAStateTrigger {
  platform: 'state';
  entity_id: string | string[];
  from?: string | string[];
  to?: string | string[];
  not_from?: string[];
  not_to?: string[];
  attribute?: string;
  for?: string | HADuration;
  id?: string;
}

export interface HAEventTrigger {
  platform: 'event';
  event_type: string;
  event_data?: Record<string, unknown>;
  id?: string;
}

export interface HATimeTrigger {
  platform: 'time';
  at: string;
  id?: string;
}

export interface HANumericStateTrigger {
  platform: 'numeric_state';
  entity_id: string | string[];
  above?: number | string;
  below?: number | string;
  attribute?: string;
  for?: string | HADuration;
  id?: string;
}

export interface HADuration {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

// ============================================================================
// Condition Types
// ============================================================================

export type HACondition =
  | HAStateCondition
  | HANumericStateCondition
  | HATemplateCondition
  | HAAndCondition
  | HAOrCondition
  | HANotCondition;

export interface HAStateCondition {
  condition: 'state';
  entity_id: string;
  state: string | string[];
  attribute?: string;
}

export interface HANumericStateCondition {
  condition: 'numeric_state';
  entity_id: string;
  above?: number | string;
  below?: number | string;
  attribute?: string;
}

export interface HATemplateCondition {
  condition: 'template';
  value_template: string;
}

export interface HAAndCondition {
  condition: 'and';
  conditions: HACondition[];
}

export interface HAOrCondition {
  condition: 'or';
  conditions: HACondition[];
}

export interface HANotCondition {
  condition: 'not';
  conditions: HACondition[];
}

// ============================================================================
// Action Types
// ============================================================================

export type HAAction =
  | HAServiceAction
  | HADelayAction
  | HAWaitAction
  | HAChooseAction
  | HARepeatAction
  | HAIfAction
  | HAVariablesAction
  | HAStopAction
  | HAEventAction;

export interface HAServiceAction {
  service: string;
  target?: HATarget;
  data?: Record<string, unknown>;
  data_template?: Record<string, string>;
}

export interface HATarget {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
}

export interface HADelayAction {
  delay: string | HADuration;
}

export interface HAWaitAction {
  wait_template: string;
  timeout?: string | HADuration;
  continue_on_timeout?: boolean;
}

export interface HAChooseAction {
  choose: HAChooseOption[];
  default?: HAAction[];
}

export interface HAChooseOption {
  conditions: HACondition[];
  sequence: HAAction[];
}

export interface HARepeatAction {
  repeat: HARepeatConfig;
}

export interface HARepeatConfig {
  count?: number | string;
  while?: HACondition[];
  until?: HACondition[];
  sequence: HAAction[];
}

export interface HAIfAction {
  if: HACondition[];
  then: HAAction[];
  else?: HAAction[];
}

export interface HAVariablesAction {
  variables: Record<string, string | number | boolean>;
}

export interface HAStopAction {
  stop: string;
  error?: boolean;
}

export interface HAEventAction {
  event: string;
  event_data?: Record<string, unknown>;
  event_data_template?: Record<string, string>;
}

// ============================================================================
// Transpiler Result
// ============================================================================

export interface TranspilerResult {
  automation: HAAutomation;
  script: HAScript;
  helpers: HelperConfig[];
  sourceMap: SourceMap;
  diagnostics: TranspilerDiagnostic[];
}

export interface HelperConfig {
  id: string;
  type: string;
  name: string;
  initial?: unknown;
  min?: number;
  max?: number;
  step?: number;
}

export interface SourceMap {
  entries: SourceMapEntry[];
}

export interface SourceMapEntry {
  yamlPath: string;
  stFile: string;
  stLine: number;
  stColumn?: number;
}

export interface TranspilerDiagnostic {
  severity: 'Error' | 'Warning' | 'Info';
  code: string;
  message: string;
  stLine?: number;
}

// ============================================================================
// Context Types
// ============================================================================

export interface TranspilerContext {
  programName: string;
  projectName: string;
  variables: Map<string, VariableInfo>;
  entityBindings: Map<string, EntityInfo>;
  currentPath: string[];
  loopDepth: number;
  safetyCounters: number;
}

export interface VariableInfo {
  name: string;
  dataType: string;
  isInput: boolean;
  isOutput: boolean;
  isPersistent: boolean;
  helperId?: string;
  entityId?: string;
}

export interface EntityInfo {
  entityId: string;
  variableName: string;
  direction: 'INPUT' | 'OUTPUT';
  dataType: string;
}
```

---

## frontend/src/transpiler/jinja-generator.ts

```typescript
/**
 * Defensive Jinja Template Generator
 * 
 * Generates null-safe Jinja2 templates for HA that handle
 * unavailable, unknown, and empty states gracefully.
 */

import type { Expression, BinaryExpression, UnaryExpression, Literal, VariableRef, FunctionCall } from '../parser/ast';
import type { TranspilerContext, VariableInfo } from './types';

// ============================================================================
// Main Generator
// ============================================================================

export class JinjaGenerator {
  private context: TranspilerContext;

  constructor(context: TranspilerContext) {
    this.context = context;
  }

  /**
   * Generate a defensive Jinja template from an ST expression
   */
  generateExpression(expr: Expression): string {
    switch (expr.type) {
      case 'Literal':
        return this.generateLiteral(expr);

      case 'VariableRef':
        return this.generateVariableRef(expr);

      case 'BinaryExpression':
        return this.generateBinaryExpression(expr);

      case 'UnaryExpression':
        return this.generateUnaryExpression(expr);

      case 'FunctionCall':
        return this.generateFunctionCall(expr);

      case 'ParenExpression':
        return `(${this.generateExpression(expr.expression)})`;

      case 'MemberAccess':
        return this.generateMemberAccess(expr);

      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }

  /**
   * Generate a complete condition template (wrapped in {{ }})
   */
  generateCondition(expr: Expression): string {
    return `{{ ${this.generateExpression(expr)} }}`;
  }

  // ==========================================================================
  // Literal Generation
  // ==========================================================================

  private generateLiteral(lit: Literal): string {
    switch (lit.kind) {
      case 'boolean':
        return lit.value ? 'true' : 'false';

      case 'integer':
        return String(lit.value);

      case 'real':
        return String(lit.value);

      case 'string':
        return `'${lit.value}'`;

      case 'time':
        // Convert ST time literal to seconds for HA
        return this.convertTimeToSeconds(lit.raw);

      default:
        return String(lit.value);
    }
  }

  private convertTimeToSeconds(timeLiteral: string): string {
    // T#1h30m15s -> 5415
    // This is a simplified conversion - expand as needed
    const match = timeLiteral.match(/T#(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:(\d+)ms)?/i);
    if (!match) return '0';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    const ms = parseInt(match[4] || '0');

    const totalSeconds = hours * 3600 + minutes * 60 + seconds + ms / 1000;
    return String(totalSeconds);
  }

  // ==========================================================================
  // Variable Reference Generation
  // ==========================================================================

  private generateVariableRef(ref: VariableRef): string {
    const varInfo = this.context.variables.get(ref.name);

    if (!varInfo) {
      // Unknown variable - return as-is (might be a loop variable)
      return ref.name;
    }

    // Entity-bound variable → read from entity state
    if (varInfo.entityId) {
      return this.generateEntityRead(varInfo.entityId, varInfo.dataType);
    }

    // Persistent variable → read from helper
    if (varInfo.isPersistent && varInfo.helperId) {
      return this.generateHelperRead(varInfo.helperId, varInfo.dataType);
    }

    // Transient variable → just the variable name (from HA variables:)
    return ref.name;
  }

  /**
   * Generate defensive entity state read
   */
  private generateEntityRead(entityId: string, dataType: string): string {
    const state = `states('${entityId}')`;
    const invalid = `['unavailable', 'unknown', 'none', '']`;

    switch (dataType.toUpperCase()) {
      case 'BOOL':
        return `(${state} in ['on', 'true', 'True', '1'])`;

      case 'INT':
      case 'DINT':
      case 'SINT':
      case 'LINT':
      case 'UINT':
      case 'UDINT':
      case 'USINT':
      case 'ULINT':
        return `(${state} | int(default=0) if ${state} not in ${invalid} else 0)`;

      case 'REAL':
      case 'LREAL':
        return `(${state} | float(default=0.0) if ${state} not in ${invalid} else 0.0)`;

      case 'STRING':
      case 'WSTRING':
        return `(${state} if ${state} not in ['unavailable', 'unknown'] else '')`;

      default:
        return state;
    }
  }

  /**
   * Generate defensive helper state read
   */
  private generateHelperRead(helperId: string, dataType: string): string {
    const state = `states('${helperId}')`;
    const invalid = `['unavailable', 'unknown', 'none', '']`;

    switch (dataType.toUpperCase()) {
      case 'BOOL':
        return `(${state} == 'on')`;

      case 'INT':
      case 'DINT':
      case 'SINT':
      case 'LINT':
      case 'UINT':
      case 'UDINT':
      case 'USINT':
      case 'ULINT':
        return `(${state} | int(default=0) if ${state} not in ${invalid} else 0)`;

      case 'REAL':
      case 'LREAL':
        return `(${state} | float(default=0.0) if ${state} not in ${invalid} else 0.0)`;

      case 'STRING':
      case 'WSTRING':
        return `(${state} if ${state} not in ${invalid} else '')`;

      default:
        return state;
    }
  }

  // ==========================================================================
  // Binary Expression Generation
  // ==========================================================================

  private generateBinaryExpression(expr: BinaryExpression): string {
    const left = this.generateExpression(expr.left);
    const right = this.generateExpression(expr.right);

    switch (expr.operator.toUpperCase()) {
      // Arithmetic
      case '+': return `(${left} + ${right})`;
      case '-': return `(${left} - ${right})`;
      case '*': return `(${left} * ${right})`;
      case '/': return `(${left} / ${right})`;
      case 'MOD': return `(${left} % ${right})`;

      // Comparison
      case '=': return `(${left} == ${right})`;
      case '<>': return `(${left} != ${right})`;
      case '<': return `(${left} < ${right})`;
      case '>': return `(${left} > ${right})`;
      case '<=': return `(${left} <= ${right})`;
      case '>=': return `(${left} >= ${right})`;

      // Logical
      case 'AND': return `(${left} and ${right})`;
      case 'OR': return `(${left} or ${right})`;
      case 'XOR': return `((${left} or ${right}) and not (${left} and ${right}))`;

      default:
        throw new Error(`Unknown operator: ${expr.operator}`);
    }
  }

  // ==========================================================================
  // Unary Expression Generation
  // ==========================================================================

  private generateUnaryExpression(expr: UnaryExpression): string {
    const operand = this.generateExpression(expr.operand);

    switch (expr.operator.toUpperCase()) {
      case 'NOT': return `(not ${operand})`;
      case '-': return `(-${operand})`;
      default:
        throw new Error(`Unknown unary operator: ${expr.operator}`);
    }
  }

  // ==========================================================================
  // Function Call Generation
  // ==========================================================================

  private generateFunctionCall(call: FunctionCall): string {
    const funcName = call.name.toUpperCase();
    const args = call.arguments.map(a => this.generateExpression(a.value));

    // Built-in functions with null-safe implementations
    switch (funcName) {
      // Selection functions
      case 'SEL':
        return this.generateSEL(args);
      case 'MUX':
        return this.generateMUX(args);

      // Limit functions
      case 'MIN':
        return `min(${args[0]}, ${args[1]})`;
      case 'MAX':
        return `max(${args[0]}, ${args[1]})`;
      case 'LIMIT':
        return this.generateLIMIT(args);

      // Math functions
      case 'ABS':
        return `(${args[0]} | abs)`;
      case 'SQRT':
        return this.generateSQRT(args);
      case 'TRUNC':
        return `(${args[0]} | int)`;
      case 'ROUND':
        return `(${args[0]} | round)`;

      // Type conversion
      case 'TO_INT':
      case 'TO_DINT':
        return `(${args[0]} | int(default=0))`;
      case 'TO_REAL':
      case 'TO_LREAL':
        return `(${args[0]} | float(default=0.0))`;
      case 'TO_STRING':
        return `(${args[0]} | string)`;
      case 'TO_BOOL':
        return `(${args[0]} | bool)`;

      // String functions
      case 'LEN':
        return `(${args[0]} | length)`;
      case 'CONCAT':
        return `(${args[0]} ~ ${args[1]})`;

      default:
        // Unknown function - pass through (might be custom)
        return `${funcName.toLowerCase()}(${args.join(', ')})`;
    }
  }

  private generateSEL(args: string[]): string {
    // SEL(G, IN0, IN1) - if G then IN1 else IN0
    return `(${args[2]} if ${args[0]} else ${args[1]})`;
  }

  private generateMUX(args: string[]): string {
    // MUX(K, IN0, IN1, ...) - select INx based on K
    const selector = args[0];
    const inputs = args.slice(1);
    
    // Generate nested if-else
    let result = inputs[inputs.length - 1]; // Default to last
    for (let i = inputs.length - 2; i >= 0; i--) {
      result = `(${inputs[i]} if ${selector} == ${i} else ${result})`;
    }
    return result;
  }

  private generateLIMIT(args: string[]): string {
    // LIMIT(MN, IN, MX) - clamp IN between MN and MX
    const [mn, input, mx] = args;
    return `{% set _v = ${input} %}{% if _v is number %}{{ [[${mn}, _v] | max, ${mx}] | min }}{% else %}{{ ${mn} }}{% endif %}`;
  }

  private generateSQRT(args: string[]): string {
    // SQRT with negative number check
    return `{% set _v = ${args[0]} %}{% if _v is number and _v >= 0 %}{{ _v | sqrt }}{% else %}{{ 0 }}{% endif %}`;
  }

  // ==========================================================================
  // Member Access Generation
  // ==========================================================================

  private generateMemberAccess(expr: { object: Expression; member: string }): string {
    const obj = this.generateExpression(expr.object);
    return `${obj}.${expr.member}`;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Generate a simple entity state read (without full context)
 */
export function generateEntityStateRead(entityId: string, dataType: string): string {
  const state = `states('${entityId}')`;
  const invalid = `['unavailable', 'unknown', 'none', '']`;

  switch (dataType.toUpperCase()) {
    case 'BOOL':
      return `{{ ${state} in ['on', 'true', 'True', '1'] }}`;
    case 'INT':
    case 'DINT':
      return `{{ ${state} | int(default=0) if ${state} not in ${invalid} else 0 }}`;
    case 'REAL':
    case 'LREAL':
      return `{{ ${state} | float(default=0.0) if ${state} not in ${invalid} else 0.0 }}`;
    default:
      return `{{ ${state} }}`;
  }
}

/**
 * Generate a throttle condition template with fallback for uninitialized helper
 */
export function generateThrottleCondition(lastRunHelper: string, throttleSeconds: number): string {
  return `{% set last = states('${lastRunHelper}') %}
{% if last in ['unknown', 'unavailable', 'none', ''] %}
  true
{% else %}
  {{ (now() - (last | as_datetime)).total_seconds() > ${throttleSeconds} }}
{% endif %}`;
}
```

---

## frontend/src/transpiler/action-generator.ts

```typescript
/**
 * Action Generator - Convert ST Statements to HA Actions
 */

import type {
  Statement,
  IfStatement,
  CaseStatement,
  ForStatement,
  WhileStatement,
  RepeatStatement,
  AssignmentStatement,
  FunctionCallStatement,
  Expression,
} from '../parser/ast';
import type {
  HAAction,
  HAChooseAction,
  HARepeatAction,
  HAServiceAction,
  HAVariablesAction,
  HACondition,
  HATemplateCondition,
  TranspilerContext,
} from './types';
import { JinjaGenerator } from './jinja-generator';

const MAX_LOOP_ITERATIONS = 1000;

export class ActionGenerator {
  private context: TranspilerContext;
  private jinja: JinjaGenerator;

  constructor(context: TranspilerContext) {
    this.context = context;
    this.jinja = new JinjaGenerator(context);
  }

  /**
   * Generate HA actions from ST statements
   */
  generateActions(statements: Statement[]): HAAction[] {
    return statements.map(stmt => this.generateAction(stmt)).flat();
  }

  /**
   * Generate single HA action from ST statement
   */
  generateAction(stmt: Statement): HAAction[] {
    switch (stmt.type) {
      case 'Assignment':
        return this.generateAssignment(stmt);

      case 'IfStatement':
        return [this.generateIf(stmt)];

      case 'CaseStatement':
        return [this.generateCase(stmt)];

      case 'ForStatement':
        return [this.generateFor(stmt)];

      case 'WhileStatement':
        return [this.generateWhile(stmt)];

      case 'RepeatStatement':
        return [this.generateRepeat(stmt)];

      case 'FunctionCallStatement':
        return this.generateFunctionCall(stmt);

      case 'ReturnStatement':
        return [{ stop: 'Return from program', error: false }];

      case 'ExitStatement':
        // EXIT in loops - handled by repeat structure
        return [{ stop: 'Exit loop', error: false }];

      default:
        throw new Error(`Unknown statement type: ${(stmt as any).type}`);
    }
  }

  // ==========================================================================
  // Assignment Generation
  // ==========================================================================

  private generateAssignment(stmt: AssignmentStatement): HAAction[] {
    const targetName = typeof stmt.target === 'string' 
      ? stmt.target 
      : this.getTargetName(stmt.target);

    const varInfo = this.context.variables.get(targetName);

    if (!varInfo) {
      // Unknown variable - use HA variables
      return [this.generateVariableAssignment(targetName, stmt.value)];
    }

    // Output entity → service call
    if (varInfo.isOutput && varInfo.entityId) {
      return this.generateEntityWrite(varInfo.entityId, stmt.value, varInfo.dataType);
    }

    // Persistent variable → helper service call
    if (varInfo.isPersistent && varInfo.helperId) {
      return this.generateHelperWrite(varInfo.helperId, stmt.value, varInfo.dataType);
    }

    // Transient variable → HA variables
    return [this.generateVariableAssignment(targetName, stmt.value)];
  }

  private getTargetName(target: Expression): string {
    if (target.type === 'VariableRef') {
      return target.name;
    }
    if (target.type === 'MemberAccess') {
      let current = target;
      while (current.type === 'MemberAccess') {
        current = current.object as any;
      }
      if (current.type === 'VariableRef') {
        return current.name;
      }
    }
    return 'unknown';
  }

  private generateVariableAssignment(name: string, value: Expression): HAVariablesAction {
    return {
      variables: {
        [name]: `{{ ${this.jinja.generateExpression(value)} }}`,
      },
    };
  }

  private generateEntityWrite(entityId: string, value: Expression, dataType: string): HAAction[] {
    const domain = entityId.split('.')[0];
    const valueExpr = this.jinja.generateExpression(value);

    // Boolean entities (lights, switches, etc.)
    if (dataType.toUpperCase() === 'BOOL') {
      return [{
        service: `{{ '${domain}.turn_on' if ${valueExpr} else '${domain}.turn_off' }}`,
        target: { entity_id: entityId },
      }];
    }

    // Numeric entities (input_number, etc.)
    if (domain === 'input_number' || domain === 'number') {
      return [{
        service: `${domain}.set_value`,
        target: { entity_id: entityId },
        data: { value: `{{ ${valueExpr} }}` },
      }];
    }

    // Text entities
    if (domain === 'input_text') {
      return [{
        service: 'input_text.set_value',
        target: { entity_id: entityId },
        data: { value: `{{ ${valueExpr} }}` },
      }];
    }

    // Default: try to set state (might not work for all entities)
    return [{
      service: `${domain}.turn_on`,
      target: { entity_id: entityId },
    }];
  }

  private generateHelperWrite(helperId: string, value: Expression, dataType: string): HAAction[] {
    const domain = helperId.split('.')[0];
    const valueExpr = this.jinja.generateExpression(value);

    switch (domain) {
      case 'input_boolean':
        return [{
          service: `{{ 'input_boolean.turn_on' if ${valueExpr} else 'input_boolean.turn_off' }}`,
          target: { entity_id: helperId },
        }];

      case 'input_number':
        return [{
          service: 'input_number.set_value',
          target: { entity_id: helperId },
          data: { value: `{{ ${valueExpr} }}` },
        }];

      case 'input_text':
        return [{
          service: 'input_text.set_value',
          target: { entity_id: helperId },
          data: { value: `{{ ${valueExpr} }}` },
        }];

      case 'input_datetime':
        return [{
          service: 'input_datetime.set_datetime',
          target: { entity_id: helperId },
          data: { datetime: `{{ ${valueExpr} }}` },
        }];

      case 'counter':
        return [{
          service: 'counter.set_value',
          target: { entity_id: helperId },
          data: { value: `{{ ${valueExpr} }}` },
        }];

      default:
        throw new Error(`Unknown helper type: ${domain}`);
    }
  }

  // ==========================================================================
  // Control Flow Generation
  // ==========================================================================

  private generateIf(stmt: IfStatement): HAChooseAction {
    const options: HAChooseAction['choose'] = [];

    // Main IF branch
    options.push({
      conditions: [this.generateCondition(stmt.condition)],
      sequence: this.generateActions(stmt.thenBranch),
    });

    // ELSIF branches
    for (const elsif of stmt.elsifBranches) {
      options.push({
        conditions: [this.generateCondition(elsif.condition)],
        sequence: this.generateActions(elsif.body),
      });
    }

    const result: HAChooseAction = { choose: options };

    // ELSE branch
    if (stmt.elseBranch && stmt.elseBranch.length > 0) {
      result.default = this.generateActions(stmt.elseBranch);
    }

    return result;
  }

  private generateCase(stmt: CaseStatement): HAChooseAction {
    const selectorExpr = this.jinja.generateExpression(stmt.selector);
    const options: HAChooseAction['choose'] = [];

    for (const caseClause of stmt.cases) {
      // Generate condition for each case value
      const conditions: HACondition[] = caseClause.values.map(val => {
        const valExpr = this.jinja.generateExpression(val);
        return {
          condition: 'template' as const,
          value_template: `{{ ${selectorExpr} == ${valExpr} }}`,
        };
      });

      // For multiple values, wrap in OR
      const finalCondition: HACondition = conditions.length === 1
        ? conditions[0]
        : { condition: 'or', conditions };

      options.push({
        conditions: [finalCondition],
        sequence: this.generateActions(caseClause.body),
      });
    }

    const result: HAChooseAction = { choose: options };

    if (stmt.elseCase && stmt.elseCase.length > 0) {
      result.default = this.generateActions(stmt.elseCase);
    }

    return result;
  }

  private generateFor(stmt: ForStatement): HARepeatAction {
    // Calculate iteration count
    const fromExpr = this.jinja.generateExpression(stmt.from);
    const toExpr = this.jinja.generateExpression(stmt.to);
    const byExpr = stmt.by ? this.jinja.generateExpression(stmt.by) : '1';

    // For safety, we use a count-based repeat with calculated iterations
    const countExpr = `{{ (((${toExpr}) - (${fromExpr})) / (${byExpr})) | int + 1 }}`;

    // Generate loop body with index variable
    const loopVarInit: HAVariablesAction = {
      variables: {
        [stmt.variable]: `{{ ${fromExpr} }}`,
      },
    };

    const loopVarIncrement: HAVariablesAction = {
      variables: {
        [stmt.variable]: `{{ ${stmt.variable} + ${byExpr} }}`,
      },
    };

    return {
      repeat: {
        count: countExpr,
        sequence: [
          loopVarInit,
          ...this.generateActions(stmt.body),
          loopVarIncrement,
        ],
      },
    };
  }

  private generateWhile(stmt: WhileStatement): HARepeatAction {
    // Add safety counter to prevent infinite loops
    const safetyVar = `_while_safety_${this.context.safetyCounters++}`;

    const safetyInit: HAVariablesAction = {
      variables: { [safetyVar]: 0 },
    };

    const safetyIncrement: HAVariablesAction = {
      variables: { [safetyVar]: `{{ ${safetyVar} + 1 }}` },
    };

    const condition = this.generateCondition(stmt.condition);
    const safetyCondition: HATemplateCondition = {
      condition: 'template',
      value_template: `{{ ${safetyVar} < ${MAX_LOOP_ITERATIONS} }}`,
    };

    return {
      repeat: {
        while: [condition, safetyCondition],
        sequence: [
          safetyIncrement,
          ...this.generateActions(stmt.body),
        ],
      },
    };
  }

  private generateRepeat(stmt: RepeatStatement): HARepeatAction {
    // Add safety counter
    const safetyVar = `_repeat_safety_${this.context.safetyCounters++}`;

    const safetyInit: HAVariablesAction = {
      variables: { [safetyVar]: 0 },
    };

    const safetyIncrement: HAVariablesAction = {
      variables: { [safetyVar]: `{{ ${safetyVar} + 1 }}` },
    };

    const condition = this.generateCondition(stmt.condition);
    const safetyCondition: HATemplateCondition = {
      condition: 'template',
      value_template: `{{ ${safetyVar} < ${MAX_LOOP_ITERATIONS} }}`,
    };

    // REPEAT...UNTIL = do-while, so we use until (condition becomes true to stop)
    // But also add safety to prevent infinite loops
    return {
      repeat: {
        until: [
          { condition: 'or', conditions: [condition, { condition: 'not', conditions: [safetyCondition] }] },
        ],
        sequence: [
          safetyIncrement,
          ...this.generateActions(stmt.body),
        ],
      },
    };
  }

  // ==========================================================================
  // Function Call Generation
  // ==========================================================================

  private generateFunctionCall(stmt: FunctionCallStatement): HAAction[] {
    const funcName = stmt.call.name.toUpperCase();

    // Handle special FB calls
    switch (funcName) {
      case 'R_TRIG':
      case 'F_TRIG':
        // Edge triggers are handled at trigger level, not as actions
        return [];

      case 'TON':
      case 'TOF':
      case 'TP':
        // Timer FBs need special handling (→ Phase 4)
        return this.generateTimerFBCall(stmt.call);

      default:
        // Custom function call - might be a script call
        return [{
          service: `script.${funcName.toLowerCase()}`,
          data: this.buildFunctionCallData(stmt.call),
        }];
    }
  }

  private generateTimerFBCall(call: FunctionCall): HAAction[] {
    // Placeholder - detailed implementation in Phase 4
    return [{
      service: 'system_log.write',
      data: { message: `Timer FB ${call.name} not yet implemented` },
    }];
  }

  private buildFunctionCallData(call: FunctionCall): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    
    for (const arg of call.arguments) {
      const key = arg.name || `arg_${call.arguments.indexOf(arg)}`;
      data[key] = `{{ ${this.jinja.generateExpression(arg.value)} }}`;
    }
    
    return data;
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private generateCondition(expr: Expression): HATemplateCondition {
    return {
      condition: 'template',
      value_template: this.jinja.generateCondition(expr),
    };
  }
}
```

---

## frontend/src/transpiler/transpiler.ts

```typescript
/**
 * Main Transpiler - ST AST to HA Automation/Script
 */

import type { ProgramNode, VariableDeclaration } from '../parser/ast';
import type { AnalysisResult } from '../analyzer/types';
import type { StorageAnalysisResult, VariableStorageInfo } from '../analyzer/types';
import type {
  TranspilerResult,
  HAAutomation,
  HAScript,
  TranspilerContext,
  VariableInfo,
  EntityInfo,
  HelperConfig,
  SourceMap,
  TranspilerDiagnostic,
} from './types';
import { analyzeDependencies } from '../analyzer/dependency-analyzer';
import { analyzeStorage } from '../analyzer/storage-analyzer';
import { ActionGenerator } from './action-generator';
import { parsePragmas } from '../analyzer/trigger-generator';

export class Transpiler {
  private ast: ProgramNode;
  private projectName: string;
  private depAnalysis!: AnalysisResult;
  private storageAnalysis!: StorageAnalysisResult;
  private context!: TranspilerContext;
  private sourceMap: SourceMap = { entries: [] };
  private diagnostics: TranspilerDiagnostic[] = [];

  constructor(ast: ProgramNode, projectName: string = 'default') {
    this.ast = ast;
    this.projectName = projectName;
  }

  /**
   * Transpile AST to HA automation and script
   */
  transpile(): TranspilerResult {
    // Phase 1: Run analyzers
    this.depAnalysis = analyzeDependencies(this.ast);
    this.storageAnalysis = analyzeStorage(this.ast, this.projectName);

    // Collect diagnostics from analyzers
    this.diagnostics.push(
      ...this.depAnalysis.diagnostics.map(d => ({
        severity: d.severity,
        code: d.code,
        message: d.message,
        stLine: d.location?.startLine,
      })),
      ...this.storageAnalysis.diagnostics.map(d => ({
        severity: d.severity,
        code: d.code,
        message: d.message,
        stLine: d.location?.startLine,
      }))
    );

    // Phase 2: Build transpiler context
    this.buildContext();

    // Phase 3: Generate automation (triggers)
    const automation = this.generateAutomation();

    // Phase 4: Generate script (logic)
    const script = this.generateScript();

    // Phase 5: Collect helpers
    const helpers = this.storageAnalysis.helpers;

    return {
      automation,
      script,
      helpers,
      sourceMap: this.sourceMap,
      diagnostics: this.diagnostics,
    };
  }

  // ==========================================================================
  // Context Building
  // ==========================================================================

  private buildContext(): void {
    const variables = new Map<string, VariableInfo>();
    const entityBindings = new Map<string, EntityInfo>();

    // Build variable info map
    for (const varDecl of this.ast.variables) {
      const storageInfo = this.storageAnalysis.variables.find(v => v.name === varDecl.name);
      const depInfo = this.depAnalysis.dependencies.find(d => d.variableName === varDecl.name);

      const varInfo: VariableInfo = {
        name: varDecl.name,
        dataType: varDecl.dataType.name,
        isInput: varDecl.binding?.direction === 'INPUT',
        isOutput: varDecl.binding?.direction === 'OUTPUT',
        isPersistent: storageInfo?.storage.type === 'PERSISTENT',
        helperId: storageInfo?.storage.helperId,
        entityId: depInfo?.entityId,
      };

      variables.set(varDecl.name, varInfo);

      // Build entity binding map
      if (depInfo) {
        entityBindings.set(varDecl.name, {
          entityId: depInfo.entityId,
          variableName: varDecl.name,
          direction: depInfo.direction,
          dataType: varDecl.dataType.name,
        });
      }
    }

    this.context = {
      programName: this.ast.name,
      projectName: this.projectName,
      variables,
      entityBindings,
      currentPath: [],
      loopDepth: 0,
      safetyCounters: 0,
    };
  }

  // ==========================================================================
  // Automation Generation
  // ==========================================================================

  private generateAutomation(): HAAutomation {
    const pragmas = parsePragmas(this.ast.pragmas);
    const mode = (pragmas.find(p => p.name === 'mode')?.value as string) || 'restart';
    const throttle = pragmas.find(p => p.name === 'throttle')?.value as string | undefined;
    const debounce = pragmas.find(p => p.name === 'debounce')?.value as string | undefined;

    const automation: HAAutomation = {
      id: `st_${this.projectName}_${this.ast.name}`.toLowerCase(),
      alias: `[ST] ${this.ast.name}`,
      description: `Generated from ST program: ${this.ast.name}`,
      mode: 'single', // Automation is just dispatcher
      trigger: this.depAnalysis.triggers.map(t => ({
        platform: t.platform as any,
        entity_id: t.entity_id,
        not_from: t.not_from,
        not_to: t.not_to,
        id: t.id,
      })),
      action: [],
    };

    // Add throttle condition if specified
    if (throttle) {
      const throttleHelper = `input_datetime.st_${this.projectName}_${this.ast.name}_last_run`.toLowerCase();
      const throttleSeconds = this.parseTimeToSeconds(throttle);

      automation.condition = [{
        condition: 'template',
        value_template: this.generateThrottleCondition(throttleHelper, throttleSeconds),
      }];

      // Add action to update last run time
      automation.action.push({
        service: 'input_datetime.set_datetime',
        target: { entity_id: throttleHelper },
        data: { datetime: '{{ now().isoformat() }}' },
      });
    }

    // Add debounce delay if specified
    if (debounce) {
      automation.mode = 'restart'; // Restart = debounce effect
      const debounceSeconds = this.parseTimeToSeconds(debounce);
      automation.action.push({
        delay: { seconds: debounceSeconds },
      });
    }

    // Call the logic script
    automation.action.push({
      service: 'script.turn_on',
      target: {
        entity_id: `script.st_${this.projectName}_${this.ast.name}_logic`.toLowerCase(),
      },
    });

    return automation;
  }

  private generateThrottleCondition(helperId: string, seconds: number): string {
    return `{% set last = states('${helperId}') %}
{% if last in ['unknown', 'unavailable', 'none', ''] %}
  true
{% else %}
  {{ (now() - (last | as_datetime)).total_seconds() > ${seconds} }}
{% endif %}`;
  }

  private parseTimeToSeconds(timeLiteral: string): number {
    // Parse T#1h30m15s format
    const match = timeLiteral.match(/T#(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:(\d+)ms)?/i);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    const ms = parseInt(match[4] || '0');

    return hours * 3600 + minutes * 60 + seconds + ms / 1000;
  }

  // ==========================================================================
  // Script Generation
  // ==========================================================================

  private generateScript(): HAScript {
    const pragmas = parsePragmas(this.ast.pragmas);
    const mode = (pragmas.find(p => p.name === 'mode')?.value as string) || 'restart';

    const actionGenerator = new ActionGenerator(this.context);

    const script: HAScript = {
      alias: `[ST] ${this.ast.name} Logic`,
      description: `Logic script for ST program: ${this.ast.name}`,
      mode: mode as HAScript['mode'],
      sequence: [],
    };

    // Initialize transient variables
    const initVars = this.generateVariableInitializers();
    if (Object.keys(initVars).length > 0) {
      script.variables = initVars;
    }

    // Generate actions from body
    script.sequence = actionGenerator.generateActions(this.ast.body);

    return script;
  }

  private generateVariableInitializers(): Record<string, string> {
    const vars: Record<string, string> = {};

    for (const storageInfo of this.storageAnalysis.variables) {
      // Only initialize transient variables
      if (storageInfo.storage.type !== 'TRANSIENT') {
        continue;
      }

      const varDecl = this.ast.variables.find(v => v.name === storageInfo.name);
      if (!varDecl?.initialValue) {
        continue;
      }

      if (varDecl.initialValue.type === 'Literal') {
        vars[storageInfo.name] = String(varDecl.initialValue.value);
      }
    }

    return vars;
  }
}

// ============================================================================
// Convenience Function
// ============================================================================

/**
 * Transpile an ST program to HA automation and script
 */
export function transpile(ast: ProgramNode, projectName?: string): TranspilerResult {
  const transpiler = new Transpiler(ast, projectName);
  return transpiler.transpile();
}
```

---

## frontend/src/transpiler/index.ts

```typescript
/**
 * Transpiler Module Exports
 */

export * from './types';
export * from './transpiler';
export * from './jinja-generator';
export * from './action-generator';

// Convenience re-export
export { transpile, Transpiler } from './transpiler';
export { JinjaGenerator, generateEntityStateRead, generateThrottleCondition } from './jinja-generator';
export { ActionGenerator } from './action-generator';
```

---

## frontend/src/transpiler/__tests__/transpiler.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { parse } from '../../parser';
import { transpile } from '../transpiler';

describe('Transpiler', () => {

  describe('Basic Transpilation', () => {

    it('transpiles simple IF statement', () => {
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
      const result = transpile(ast!);

      // Check automation
      expect(result.automation.trigger).toHaveLength(1);
      expect(result.automation.trigger[0].entity_id).toBe('binary_sensor.motion');

      // Check script has choose action
      expect(result.script.sequence).toHaveLength(1);
      expect(result.script.sequence[0]).toHaveProperty('choose');
    });

    it('transpiles IF-ELSE statement', () => {
      const code = `PROGRAM Test
VAR
    motion AT %I* : BOOL := 'binary_sensor.motion';
    light AT %Q* : BOOL := 'light.kitchen';
END_VAR
IF motion THEN
    light := TRUE;
ELSE
    light := FALSE;
END_IF;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = transpile(ast!);

      const choose = result.script.sequence[0] as any;
      expect(choose.choose).toHaveLength(1);
      expect(choose.default).toBeDefined();
    });

    it('handles persistent variables', () => {
      const code = `PROGRAM Test
VAR
    {persistent}
    counter : INT := 0;
END_VAR
counter := counter + 1;
END_PROGRAM`;

      const { ast } = parse(code);
      const result = transpile(ast!, 'myproject');

      // Should generate helper config
      expect(result.helpers).toHaveLength(1);
      expect(result.helpers[0].type).toBe('input_number');
    });
  });

  describe('Mode and Throttle', () => {

    it('applies mode pragma', () => {
      const code = `{mode: queued}
PROGRAM Test
VAR
    x AT %I* : BOOL := 'binary_sensor.x';
END_VAR
END_PROGRAM`;

      const { ast } = parse(code);
      const result = transpile(ast!);

      expect(result.script.mode).toBe('queued');
    });

    it('generates throttle condition', () => {
      const code = `{throttle: T#5s}
PROGRAM Test
VAR
    x AT %I* : BOOL := 'binary_sensor.x';
END_VAR
END_PROGRAM`;

      const { ast } = parse(code);
      const result = transpile(ast!);

      expect(result.automation.condition).toBeDefined();
      expect(result.automation.condition![0].condition).toBe('template');
    });

    it('generates debounce delay', () => {
      const code = `{debounce: T#500ms}
PROGRAM Test
VAR
    x AT %I* : BOOL := 'binary_sensor.x';
END_VAR
END_PROGRAM`;

      const { ast } = parse(code);
      const result = transpile(ast!);

      expect(result.automation.mode).toBe('restart');
      expect(result.automation.action.some(a => 'delay' in a)).toBe(true);
    });
  });

  describe('Output Generation', () => {

    it('generates correct automation ID', () => {
      const code = `PROGRAM Kitchen_Light
VAR
    x AT %I* : BOOL := 'binary_sensor.x';
END_VAR
END_PROGRAM`;

      const { ast } = parse(code);
      const result = transpile(ast!, 'home');

      expect(result.automation.id).toBe('st_home_kitchen_light');
    });

    it('generates script call in automation', () => {
      const code = `PROGRAM Test
VAR
    x AT %I* : BOOL := 'binary_sensor.x';
END_VAR
END_PROGRAM`;

      const { ast } = parse(code);
      const result = transpile(ast!, 'myproject');

      const scriptCall = result.automation.action.find(a => 
        'service' in a && a.service === 'script.turn_on'
      ) as any;

      expect(scriptCall).toBeDefined();
      expect(scriptCall.target.entity_id).toContain('st_myproject_test_logic');
    });
  });
});
```

---

## Ausführungsschritte

```bash
cd "C:\##\Projects\ST_HA_Automation\frontend"

# Dateien in src/transpiler/ erstellen

# Tests ausführen
npm run test:run

# Type-Check
npm run typecheck

# Build
npm run build
```

---

## Erfolgskriterien

- [ ] IF → `choose` Action mit conditions
- [ ] IF-ELSE → `choose` mit `default`
- [ ] IF-ELSIF-ELSE → `choose` mit mehreren options
- [ ] CASE → `choose` mit value-conditions
- [ ] FOR → `repeat` mit count
- [ ] WHILE → `repeat` mit while + safety counter
- [ ] Assignments zu Output-Entities → service calls
- [ ] Assignments zu Persistent Vars → helper service calls
- [ ] Assignments zu Transient Vars → HA variables
- [ ] Jinja-Templates sind null-safe
- [ ] Throttle erzeugt condition + datetime helper
- [ ] Debounce erzeugt delay + restart mode
- [ ] Automation ruft Script auf
- [ ] Helpers werden generiert
- [ ] Alle Tests bestehen

---

## Nicht in diesem Task

- Timer FBs (TON, TOF, TP) → 07_Timer_FBs.md
- Source Maps für Debugging
- Deploy Manager
- Helper Sync mit HA

---

## Beispiel-Output

### Input ST:
```iecst
{mode: restart}
{throttle: T#1s}
PROGRAM Kitchen
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.motion';
    light AT %Q* : BOOL := 'light.kitchen';
    {persistent}
    counter : INT := 0;
END_VAR

IF motion THEN
    light := TRUE;
    counter := counter + 1;
ELSE
    light := FALSE;
END_IF;

END_PROGRAM
```

### Output Automation:
```yaml
id: st_default_kitchen
alias: "[ST] Kitchen"
mode: single
trigger:
  - platform: state
    entity_id: binary_sensor.motion
    not_from: ['unavailable', 'unknown']
    not_to: ['unavailable', 'unknown']
    id: dep_motion
condition:
  - condition: template
    value_template: >-
      {% set last = states('input_datetime.st_default_kitchen_last_run') %}
      {% if last in ['unknown', 'unavailable', 'none', ''] %}
        true
      {% else %}
        {{ (now() - (last | as_datetime)).total_seconds() > 1 }}
      {% endif %}
action:
  - service: input_datetime.set_datetime
    target:
      entity_id: input_datetime.st_default_kitchen_last_run
    data:
      datetime: "{{ now().isoformat() }}"
  - service: script.turn_on
    target:
      entity_id: script.st_default_kitchen_logic
```

### Output Script:
```yaml
alias: "[ST] Kitchen Logic"
mode: restart
sequence:
  - choose:
      - conditions:
          - condition: template
            value_template: >-
              {{ states('binary_sensor.motion') in ['on', 'true', 'True', '1'] }}
        sequence:
          - service: "{{ 'light.turn_on' if true else 'light.turn_off' }}"
            target:
              entity_id: light.kitchen
          - service: input_number.set_value
            target:
              entity_id: input_number.st_default_kitchen_counter
            data:
              value: >-
                {{ (states('input_number.st_default_kitchen_counter') | int(default=0)) + 1 }}
    default:
      - service: "{{ 'light.turn_on' if false else 'light.turn_off' }}"
        target:
          entity_id: light.kitchen
```
