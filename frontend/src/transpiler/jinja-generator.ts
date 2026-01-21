/**
 * Defensive Jinja Template Generator
 * 
 * Generates null-safe Jinja2 templates for HA that handle
 * unavailable, unknown, and empty states gracefully.
 */

import type {
  Expression,
  BinaryExpression,
  UnaryExpression,
  Literal,
  VariableRef,
  FunctionCall,
  MemberAccess,
} from "../parser/ast";
import type { TranspilerContext } from "./types";
import type { TimerOutputResolver } from "./timer-transpiler";

// ============================================================================
// Main Generator
// ============================================================================

export class JinjaGenerator {
  private context: TranspilerContext;
  private timerResolver?: TimerOutputResolver;

  constructor(context: TranspilerContext, timerResolver?: TimerOutputResolver) {
    this.context = context;
    this.timerResolver = timerResolver;
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
        {
          // Escape single quotes in strings
          const escaped = String(lit.value).replace(/'/g, "\\'");
          return `'${escaped}'`;
        }

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

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    const ms = parseInt(match[4] || '0', 10);

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
    if (args.length < 3) {
      throw new Error('SEL requires 3 arguments');
    }
    return `(${args[2]} if ${args[0]} else ${args[1]})`;
  }

  private generateMUX(args: string[]): string {
    // MUX(K, IN0, IN1, ...) - select INx based on K
    if (args.length < 2) {
      throw new Error('MUX requires at least 2 arguments');
    }
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
    if (args.length < 3) {
      throw new Error('LIMIT requires 3 arguments');
    }
    const [mn, input, mx] = args;
    return `{% set _v = ${input} %}{% if _v is number %}{{ [[${mn}, _v] | max, ${mx}] | min }}{% else %}{{ ${mn} }}{% endif %}`;
  }

  private generateSQRT(args: string[]): string {
    // SQRT with negative number check
    if (args.length < 1) {
      throw new Error('SQRT requires 1 argument');
    }
    return `{% set _v = ${args[0]} %}{% if _v is number and _v >= 0 %}{{ _v | sqrt }}{% else %}{{ 0 }}{% endif %}`;
  }

  // ==========================================================================
  // Member Access Generation
  // ==========================================================================

  private generateMemberAccess(expr: MemberAccess): string {
    // Special handling for timer outputs like timer1.Q / timer1.ET
    if (this.timerResolver) {
      let root: Expression = expr.object;
      while (root.type === "MemberAccess") {
        root = root.object;
      }
      if (root.type === "VariableRef") {
        const mapped = this.timerResolver.resolveOutput(
          root.name,
          expr.member.toUpperCase() === "ET" ? "ET" : "Q",
        );
        if (mapped) {
          return mapped;
        }
      }
    }

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
