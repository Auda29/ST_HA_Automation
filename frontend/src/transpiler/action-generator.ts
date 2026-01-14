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
  FunctionCall,
  MemberAccess,
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
} from "./types";
import { JinjaGenerator } from "./jinja-generator";
import type { TimerOutputResolver } from "./timer-transpiler";

const MAX_LOOP_ITERATIONS = 1000;

export class ActionGenerator {
  private context: TranspilerContext;
  private jinja: JinjaGenerator;

  constructor(context: TranspilerContext, timerResolver?: TimerOutputResolver) {
    this.context = context;
    this.jinja = new JinjaGenerator(context, timerResolver);
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

  private getTargetName(target: string | MemberAccess): string {
    if (typeof target === 'string') {
      return target;
    }
    
    // target is a MemberAccess - get root variable name
    // e.g., for fb.output, get 'fb'
    let current: Expression = target;
    while (current.type === 'MemberAccess') {
      current = current.object;
    }
    if (current.type === 'VariableRef') {
      return current.name;
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

  private generateEntityWrite(entityId: string, value: Expression, _dataType: string): HAAction[] {
    const domain = entityId.split('.')[0];
    const valueExpr = this.jinja.generateExpression(value);

    // Boolean entities (lights, switches, etc.)
    if (_dataType.toUpperCase() === 'BOOL') {
      return [{
        service: `{{ '${domain}.turn_on' if ${valueExpr} else '${domain}.turn_off' }}`,
        target: { entity_id: entityId },
      } as HAServiceAction];
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

  private generateHelperWrite(helperId: string, value: Expression, _dataType: string): HAAction[] {
    const domain = helperId.split('.')[0];
    const valueExpr = this.jinja.generateExpression(value);

    switch (domain) {
      case 'input_boolean':
        return [{
          service: `{{ 'input_boolean.turn_on' if ${valueExpr} else 'input_boolean.turn_off' }}`,
          target: { entity_id: helperId },
        } as HAServiceAction];

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
          safetyInit,
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
          safetyInit,
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
