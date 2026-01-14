/**
 * Timer Function Block Transpiler
 *
 * Converts ST timer FBs (TON, TOF, TP) to HA timer entities
 * with appropriate automation logic.
 *
 * This module is currently used in isolation (via its own tests)
 * and is designed to be wired into the main transpiler in a
 * follow-up integration step.
 */

import type { Expression, FunctionCall } from "../parser/ast";
import type {
  HAAutomation,
  HAAction,
  HACondition,
  HAServiceAction,
  TranspilerContext,
} from "./types";
import type {
  TimerFBType,
  TimerInstance,
  TimerInputs,
  TimerEntities,
  TimerTranspileResult,
  TimerOutputMappings,
  ParsedTimerCall,
} from "./timer-types";
import { JinjaGenerator } from "./jinja-generator";

// ============================================================================
// Main Timer Transpiler
// ============================================================================

export class TimerTranspiler {
  private jinja: JinjaGenerator;

  constructor(_context: TranspilerContext) {
    this.jinja = new JinjaGenerator(_context);
  }

  /**
   * Check if a function call is a timer FB (by FB type name)
   */
  isTimerFBType(name: string): boolean {
    const upper = name.toUpperCase();
    return upper === "TON" || upper === "TOF" || upper === "TP";
  }

  /**
   * Parse a timer FB call
   *
   * Note: The current parser models FB calls with `call.name` equal to the
   * called symbol. Whether this is the instance name or FB type depends on
   * how the ST code is written; this helper is intentionally generic and
   * leaves the instance/type resolution to the caller.
   */
  parseTimerCall(instanceName: string, call: FunctionCall): ParsedTimerCall {
    const type = call.name.toUpperCase() as TimerFBType;
    const inputs: ParsedTimerCall["inputs"] = {};

    for (const arg of call.arguments) {
      const paramName = arg.name?.toUpperCase();
      if (!paramName) continue;

      switch (paramName) {
        case "IN":
          inputs.IN = this.jinja.generateExpression(arg.value);
          break;
        case "PT":
          inputs.PT = this.parseTimeToSeconds(arg.value);
          break;
        case "R":
          inputs.R = this.jinja.generateExpression(arg.value);
          break;
      }
    }

    return { instanceName, type, inputs };
  }

  /**
   * Transpile a timer FB instance given its resolved type and inputs.
   *
   * The caller is responsible for:
   * - Determining the correct `TimerInstance` (name/program/project/type)
   * - Providing normalized `TimerInputs` (IN/PT Jinja expressions)
   */
  transpileTimer(instance: TimerInstance, inputs: TimerInputs): TimerTranspileResult {
    const entities = this.generateEntityIds(instance);
    const helpers = this.generateHelperConfigs(instance, entities);

    switch (instance.type) {
      case "TON":
        return this.transpileTON(instance, inputs, entities, helpers);
      case "TOF":
        return this.transpileTOF(instance, inputs, entities, helpers);
      case "TP":
        return this.transpileTP(instance, inputs, entities, helpers);
      default:
        throw new Error(`Unknown timer type: ${instance.type}`);
    }
  }

  // ==========================================================================
  // TON - On-Delay Timer
  // ==========================================================================

  private transpileTON(
    instance: TimerInstance,
    inputs: TimerInputs,
    entities: TimerEntities,
    helpers: import("../analyzer/types").HelperConfig[],
  ): TimerTranspileResult {
    const mainActions: HAAction[] = [
      {
        // High-level choose block for TON behavior
        // Case 1: IN = TRUE and timer idle -> start timer
        // Case 2: IN = FALSE -> cancel timer and reset Q
        choose: [
          {
            conditions: [
              this.templateCondition(inputs.IN),
              this.stateCondition(entities.timerId, "idle"),
            ],
            sequence: [this.timerStart(entities.timerId, inputs.PT)],
          },
          {
            conditions: [this.templateCondition(`not (${inputs.IN})`)],
            sequence: [
              this.timerCancel(entities.timerId),
              this.booleanTurnOff(entities.outputHelperId),
            ],
          },
        ],
      } as any,
    ];

    const finishedAutomation = this.generateFinishedAutomation(
      instance,
      entities,
      inputs.IN,
      [this.booleanTurnOn(entities.outputHelperId)],
    );

    const outputMappings: TimerOutputMappings = {
      Q: `(states('${entities.outputHelperId}') == 'on')`,
      ET: entities.elapsedHelperId
        ? `(states('${entities.elapsedHelperId}') | float(default=0))`
        : undefined,
    };

    return {
      entities,
      helpers,
      mainActions,
      finishedAutomation,
      outputMappings,
    };
  }

  // ==========================================================================
  // TOF - Off-Delay Timer
  // ==========================================================================

  private transpileTOF(
    instance: TimerInstance,
    inputs: TimerInputs,
    entities: TimerEntities,
    helpers: import("../analyzer/types").HelperConfig[],
  ): TimerTranspileResult {
    const mainActions: HAAction[] = [
      {
        choose: [
          // Case 1: IN = TRUE -> cancel timer and set Q immediately
          {
            conditions: [this.templateCondition(inputs.IN)],
            sequence: [
              this.timerCancel(entities.timerId),
              this.booleanTurnOn(entities.outputHelperId),
            ],
          },
          // Case 2: IN = FALSE and Q ON and timer idle -> start timer
          {
            conditions: [
              this.templateCondition(`not (${inputs.IN})`),
              this.stateCondition(entities.outputHelperId, "on"),
              this.stateCondition(entities.timerId, "idle"),
            ],
            sequence: [this.timerStart(entities.timerId, inputs.PT)],
          },
        ],
      } as any,
    ];

    const finishedAutomation = this.generateFinishedAutomation(
      instance,
      entities,
      `not (${inputs.IN})`,
      [this.booleanTurnOff(entities.outputHelperId)],
    );

    const outputMappings: TimerOutputMappings = {
      Q: `(states('${entities.outputHelperId}') == 'on')`,
    };

    return {
      entities,
      helpers,
      mainActions,
      finishedAutomation,
      outputMappings,
    };
  }

  // ==========================================================================
  // TP - Pulse Timer
  // ==========================================================================

  private transpileTP(
    instance: TimerInstance,
    inputs: TimerInputs,
    entities: TimerEntities,
    helpers: import("../analyzer/types").HelperConfig[],
  ): TimerTranspileResult {
    // Additional helper to track pulse trigger state
    const pulseTriggeredId = `input_boolean.${this.sanitize(
      instance.projectName,
    )}_${this.sanitize(instance.programName)}_${this.sanitize(instance.name)}_triggered`;

    helpers.push({
      id: pulseTriggeredId,
      type: "input_boolean",
      name: `ST ${instance.programName} ${instance.name} Triggered`,
      initial: false,
    });

    const mainActions: HAAction[] = [
      {
        choose: [
          // Case 1: Rising edge (IN TRUE and not triggered) -> start pulse
          {
            conditions: [
              this.templateCondition(inputs.IN),
              this.stateCondition(pulseTriggeredId, "off"),
              this.stateCondition(entities.timerId, "idle"),
            ],
            sequence: [
              this.booleanTurnOn(pulseTriggeredId),
              this.booleanTurnOn(entities.outputHelperId),
              this.timerStart(entities.timerId, inputs.PT),
            ],
          },
          // Case 2: IN FALSE and timer idle -> reset trigger flag
          {
            conditions: [
              this.templateCondition(`not (${inputs.IN})`),
              this.stateCondition(entities.timerId, "idle"),
            ],
            sequence: [this.booleanTurnOff(pulseTriggeredId)],
          },
        ],
      } as any,
    ];

    const finishedAutomation = this.generateFinishedAutomation(
      instance,
      entities,
      "true", // always execute when timer finishes
      [this.booleanTurnOff(entities.outputHelperId)],
    );

    const outputMappings: TimerOutputMappings = {
      Q: `(states('${entities.outputHelperId}') == 'on')`,
    };

    return {
      entities,
      helpers,
      mainActions,
      finishedAutomation,
      outputMappings,
    };
  }

  // ==========================================================================
  // Helper Generators
  // ==========================================================================

  private generateEntityIds(instance: TimerInstance): TimerEntities {
    const base = `st_${this.sanitize(instance.projectName)}_${this.sanitize(
      instance.programName,
    )}_${this.sanitize(instance.name)}`;

    return {
      timerId: `timer.${base}`,
      outputHelperId: `input_boolean.${base}_q`,
      elapsedHelperId: `input_number.${base}_et`,
    };
  }

  private generateHelperConfigs(
    instance: TimerInstance,
    entities: TimerEntities,
  ): import("../analyzer/types").HelperConfig[] {
    const baseName = `ST ${instance.programName} ${instance.name}`;

    return [
      {
        id: entities.timerId,
        type: "timer",
        name: `${baseName} Timer`,
      },
      {
        id: entities.outputHelperId,
        type: "input_boolean",
        name: `${baseName} Q`,
        initial: false,
      },
    ];
  }

  private generateFinishedAutomation(
    instance: TimerInstance,
    entities: TimerEntities,
    additionalCondition: string,
    actions: HAAction[],
  ): HAAutomation {
    return {
      id: `st_${this.sanitize(instance.projectName)}_${this.sanitize(
        instance.programName,
      )}_${this.sanitize(instance.name)}_finished`,
      alias: `[ST] ${instance.programName} - ${instance.name} Finished`,
      description: `Timer finished handler for ${instance.type} ${instance.name}`,
      mode: "single",
      trigger: [
        {
          platform: "event",
          event_type: "timer.finished",
          event_data: {
            entity_id: entities.timerId,
          },
        },
      ],
      condition:
        additionalCondition !== "true"
          ? [
              {
                condition: "template",
                value_template: `{{ ${additionalCondition} }}`,
              },
            ]
          : undefined,
      action: actions,
    };
  }

  // ==========================================================================
  // Action Helpers
  // ==========================================================================

  private timerStart(timerId: string, durationSeconds: string): HAServiceAction {
    return {
      service: "timer.start",
      target: { entity_id: timerId },
      data: { duration: `{{ ${durationSeconds} }}` },
    };
  }

  private timerCancel(timerId: string): HAServiceAction {
    return {
      service: "timer.cancel",
      target: { entity_id: timerId },
    };
  }

  private booleanTurnOn(helperId: string): HAServiceAction {
    return {
      service: "input_boolean.turn_on",
      target: { entity_id: helperId },
    };
  }

  private booleanTurnOff(helperId: string): HAServiceAction {
    return {
      service: "input_boolean.turn_off",
      target: { entity_id: helperId },
    };
  }

  // ==========================================================================
  // Condition Helpers
  // ==========================================================================

  private templateCondition(expression: string): HACondition {
    return {
      condition: "template",
      value_template: `{{ ${expression} }}`,
    };
  }

  private stateCondition(entityId: string, state: string): HACondition {
    return {
      condition: "state",
      entity_id: entityId,
      state,
    };
  }

  // ==========================================================================
  // Utility Helpers
  // ==========================================================================

  private sanitize(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, "_");
  }

  private parseTimeToSeconds(expr: Expression): string {
    if (expr.type === "Literal" && expr.kind === "time") {
      // Parse T#1h30m15s format
      const raw = expr.raw;
      const match = raw.match(/T#(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:(\d+)ms)?/i);
      if (match) {
        const hours = parseInt(match[1] || "0", 10);
        const minutes = parseInt(match[2] || "0", 10);
        const seconds = parseInt(match[3] || "0", 10);
        const ms = parseInt(match[4] || "0", 10);
        const total = hours * 3600 + minutes * 60 + seconds + ms / 1000;
        return String(total);
      }
    }

    // For variable expressions or non-time literals, treat as Jinja expression
    return this.jinja.generateExpression(expr);
  }
}

// ============================================================================
// Timer Output Resolver
// ============================================================================

/**
 * Resolve timer output references in expressions.
 *
 * When code references `timer1.Q`, this can be used to map that to the
 * appropriate Jinja expression for the underlying helper entity.
 *
 * Note: Wiring into the main `JinjaGenerator` is planned but not required
 * for the core timer transpiler tests in this phase.
 */
export class TimerOutputResolver {
  private timerMappings: Map<string, TimerOutputMappings> = new Map();

  registerTimer(instanceName: string, mappings: TimerOutputMappings): void {
    this.timerMappings.set(instanceName, mappings);
  }

  resolveOutput(instanceName: string, output: "Q" | "ET"): string | null {
    const mappings = this.timerMappings.get(instanceName);
    if (!mappings) return null;

    switch (output) {
      case "Q":
        return mappings.Q;
      case "ET":
        return mappings.ET ?? null;
      default:
        return null;
    }
  }

  /**
   * Check if a variable/member pair refers to a known timer output.
   */
  isTimerOutputRef(varName: string, member: string): boolean {
    if (!this.timerMappings.has(varName)) return false;
    const upper = member.toUpperCase();
    return upper === "Q" || upper === "ET";
  }
}

