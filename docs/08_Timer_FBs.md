# Task: Timer Function Blocks (TON, TOF, TP)

## Kontext

Du implementierst die Timer Function Blocks für das "ST for Home Assistant" Projekt. Timer sind in der SPS-Welt essentiell und müssen korrekt auf das HA Event-System gemappt werden.

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`
**Voraussetzung:** Transpiler Basis ist implementiert (Phase 3 abgeschlossen)

## ⚠️ Kritisches Problem

```
HA delay:        Blockiert, NICHT unterbrechbar
ST Timer (TON):  Rücksetzbar, unterbrechbar, hat State
```

**Lösung:** Timer als `timer.*` Entity + separate Event-Automation für `timer.finished`

---

## Timer-Typen (IEC 61131-3)

| Timer | Beschreibung | Verhalten |
|-------|--------------|-----------|
| **TON** | Einschaltverzögerung | Q wird TRUE nach PT Zeit, wenn IN=TRUE |
| **TOF** | Ausschaltverzögerung | Q wird FALSE nach PT Zeit, wenn IN=FALSE |
| **TP** | Impuls | Q ist TRUE für PT Zeit nach steigender Flanke |

---

## Architektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TON Timer Umsetzung                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ST Code:                          HA Entities:                             │
│  ┌──────────────────────┐          ┌───────────────────────────────────┐   │
│  │ VAR                  │          │ timer.st_prog_timer1              │   │
│  │   timer1 : TON;      │   ───▶   │ input_boolean.st_prog_timer1_q    │   │
│  │ END_VAR              │          └───────────────────────────────────┘   │
│  │                      │                                                   │
│  │ timer1(             │          ┌───────────────────────────────────┐   │
│  │   IN := sensor,     │   ───▶   │ Haupt-Automation:                 │   │
│  │   PT := T#5s        │          │   IF IN=TRUE AND timer.idle:      │   │
│  │ );                  │          │     → timer.start(5s)             │   │
│  │                      │          │   IF IN=FALSE:                    │   │
│  │ IF timer1.Q THEN    │          │     → timer.cancel()              │   │
│  │   output := TRUE;   │          │     → Q.turn_off()                │   │
│  │ END_IF;             │          └───────────────────────────────────┘   │
│  └──────────────────────┘                                                   │
│                                    ┌───────────────────────────────────┐   │
│                                    │ Timer-Finished Automation:        │   │
│                                    │   trigger: timer.finished         │   │
│                                    │   condition: IN still TRUE        │   │
│                                    │   action: Q.turn_on()             │   │
│                                    └───────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Zu erstellende Dateien

```
frontend/src/transpiler/
├── timer-transpiler.ts       # Timer FB Transpilation
├── timer-types.ts            # Timer Type Definitions
└── __tests__/
    └── timer-transpiler.test.ts
```

---

## frontend/src/transpiler/timer-types.ts

```typescript
/**
 * Timer Function Block Type Definitions
 */

import type { HAAutomation, HAAction, HelperConfig } from './types';

// ============================================================================
// Timer FB Types
// ============================================================================

export type TimerFBType = 'TON' | 'TOF' | 'TP';

export interface TimerInstance {
  name: string;
  type: TimerFBType;
  programName: string;
  projectName: string;
}

export interface TimerInputs {
  IN: string;      // Jinja expression for input condition
  PT: string;      // Duration in seconds
}

export interface TimerEntities {
  timerId: string;           // timer.st_prog_timer1
  outputHelperId: string;    // input_boolean.st_prog_timer1_q
  elapsedHelperId?: string;  // input_number.st_prog_timer1_et (optional)
}

export interface TimerTranspileResult {
  /** Entities needed for this timer */
  entities: TimerEntities;
  
  /** Helper configs to create */
  helpers: HelperConfig[];
  
  /** Actions to add to main automation/script */
  mainActions: HAAction[];
  
  /** Separate automation for timer.finished event */
  finishedAutomation: HAAutomation;
  
  /** Jinja expression mappings for timer outputs */
  outputMappings: TimerOutputMappings;
}

export interface TimerOutputMappings {
  /** Q output - is timer done? */
  Q: string;
  /** ET output - elapsed time (optional) */
  ET?: string;
}

// ============================================================================
// Timer State Machine
// ============================================================================

/**
 * TON State Machine:
 * 
 * State: IDLE
 *   IN=TRUE  → Start timer, go to RUNNING
 *   IN=FALSE → Stay IDLE, Q=FALSE
 * 
 * State: RUNNING
 *   IN=TRUE  → Wait for timer
 *   IN=FALSE → Cancel timer, go to IDLE, Q=FALSE
 *   Timer finished → Go to DONE, Q=TRUE
 * 
 * State: DONE
 *   IN=TRUE  → Stay DONE, Q=TRUE
 *   IN=FALSE → Go to IDLE, Q=FALSE
 */

export type TimerState = 'idle' | 'active' | 'paused';

// ============================================================================
// FB Call Parsing
// ============================================================================

export interface ParsedTimerCall {
  instanceName: string;
  type: TimerFBType;
  inputs: {
    IN?: string;
    PT?: string;
    R?: string;  // Reset for TP
  };
}
```

---

## frontend/src/transpiler/timer-transpiler.ts

```typescript
/**
 * Timer Function Block Transpiler
 * 
 * Converts ST timer FBs (TON, TOF, TP) to HA timer entities
 * with appropriate automation logic.
 */

import type { FunctionCall, Expression } from '../parser/ast';
import type {
  HAAutomation,
  HAAction,
  HAChooseAction,
  HAServiceAction,
  HACondition,
  HelperConfig,
  TranspilerContext,
} from './types';
import type {
  TimerFBType,
  TimerInstance,
  TimerInputs,
  TimerEntities,
  TimerTranspileResult,
  TimerOutputMappings,
  ParsedTimerCall,
} from './timer-types';
import { JinjaGenerator } from './jinja-generator';

// ============================================================================
// Main Timer Transpiler
// ============================================================================

export class TimerTranspiler {
  private context: TranspilerContext;
  private jinja: JinjaGenerator;

  constructor(context: TranspilerContext) {
    this.context = context;
    this.jinja = new JinjaGenerator(context);
  }

  /**
   * Check if a function call is a timer FB
   */
  isTimerFB(call: FunctionCall): boolean {
    const name = call.name.toUpperCase();
    return ['TON', 'TOF', 'TP'].includes(name);
  }

  /**
   * Parse a timer FB call
   */
  parseTimerCall(instanceName: string, call: FunctionCall): ParsedTimerCall {
    const type = call.name.toUpperCase() as TimerFBType;
    const inputs: ParsedTimerCall['inputs'] = {};

    for (const arg of call.arguments) {
      const paramName = arg.name?.toUpperCase();
      const value = this.jinja.generateExpression(arg.value);

      switch (paramName) {
        case 'IN':
          inputs.IN = value;
          break;
        case 'PT':
          inputs.PT = this.parseTimeToSeconds(arg.value);
          break;
        case 'R':
          inputs.R = value;
          break;
      }
    }

    return { instanceName, type, inputs };
  }

  /**
   * Transpile a timer FB instance
   */
  transpileTimer(instance: TimerInstance, inputs: TimerInputs): TimerTranspileResult {
    const entities = this.generateEntityIds(instance);
    const helpers = this.generateHelperConfigs(instance, entities);

    switch (instance.type) {
      case 'TON':
        return this.transpileTON(instance, inputs, entities, helpers);
      case 'TOF':
        return this.transpileTOF(instance, inputs, entities, helpers);
      case 'TP':
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
    helpers: HelperConfig[]
  ): TimerTranspileResult {
    
    // Main automation actions for TON logic
    const mainActions: HAAction[] = [{
      choose: [
        // Case 1: IN=TRUE and timer idle → Start timer
        {
          conditions: [
            this.templateCondition(inputs.IN),
            this.stateCondition(entities.timerId, 'idle'),
          ],
          sequence: [
            this.timerStart(entities.timerId, inputs.PT),
          ],
        },
        // Case 2: IN=FALSE → Cancel timer, reset output
        {
          conditions: [
            this.templateCondition(`not (${inputs.IN})`),
          ],
          sequence: [
            this.timerCancel(entities.timerId),
            this.booleanTurnOff(entities.outputHelperId),
          ],
        },
      ],
    }];

    // Finished automation - triggers when timer completes
    const finishedAutomation = this.generateFinishedAutomation(
      instance,
      entities,
      inputs.IN,
      // Action when timer finishes and IN is still TRUE
      [this.booleanTurnOn(entities.outputHelperId)]
    );

    // Output mappings for code generation
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
    helpers: HelperConfig[]
  ): TimerTranspileResult {
    
    // Main automation actions for TOF logic
    const mainActions: HAAction[] = [{
      choose: [
        // Case 1: IN=TRUE → Cancel timer, set output TRUE immediately
        {
          conditions: [
            this.templateCondition(inputs.IN),
          ],
          sequence: [
            this.timerCancel(entities.timerId),
            this.booleanTurnOn(entities.outputHelperId),
          ],
        },
        // Case 2: IN=FALSE and output is ON and timer idle → Start timer
        {
          conditions: [
            this.templateCondition(`not (${inputs.IN})`),
            this.stateCondition(entities.outputHelperId, 'on'),
            this.stateCondition(entities.timerId, 'idle'),
          ],
          sequence: [
            this.timerStart(entities.timerId, inputs.PT),
          ],
        },
      ],
    }];

    // Finished automation - triggers when timer completes
    const finishedAutomation = this.generateFinishedAutomation(
      instance,
      entities,
      `not (${inputs.IN})`, // Condition: IN is still FALSE
      // Action when timer finishes
      [this.booleanTurnOff(entities.outputHelperId)]
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
    helpers: HelperConfig[]
  ): TimerTranspileResult {
    
    // We need an additional helper to track if pulse was triggered
    const pulseTriggeredId = `input_boolean.${this.sanitize(instance.projectName)}_${this.sanitize(instance.programName)}_${this.sanitize(instance.name)}_triggered`;
    
    helpers.push({
      id: pulseTriggeredId,
      type: 'input_boolean',
      name: `ST ${instance.programName} ${instance.name} Triggered`,
      initial: false,
    });

    // Main automation actions for TP logic
    const mainActions: HAAction[] = [{
      choose: [
        // Case 1: Rising edge (IN=TRUE and not already triggered) → Start pulse
        {
          conditions: [
            this.templateCondition(inputs.IN),
            this.stateCondition(pulseTriggeredId, 'off'),
            this.stateCondition(entities.timerId, 'idle'),
          ],
          sequence: [
            this.booleanTurnOn(pulseTriggeredId),
            this.booleanTurnOn(entities.outputHelperId),
            this.timerStart(entities.timerId, inputs.PT),
          ],
        },
        // Case 2: IN=FALSE and timer idle → Reset trigger flag
        {
          conditions: [
            this.templateCondition(`not (${inputs.IN})`),
            this.stateCondition(entities.timerId, 'idle'),
          ],
          sequence: [
            this.booleanTurnOff(pulseTriggeredId),
          ],
        },
      ],
    }];

    // Finished automation - end of pulse
    const finishedAutomation = this.generateFinishedAutomation(
      instance,
      entities,
      'true', // Always execute when timer finishes
      [this.booleanTurnOff(entities.outputHelperId)]
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
    const base = `st_${this.sanitize(instance.projectName)}_${this.sanitize(instance.programName)}_${this.sanitize(instance.name)}`;
    
    return {
      timerId: `timer.${base}`,
      outputHelperId: `input_boolean.${base}_q`,
      elapsedHelperId: `input_number.${base}_et`,
    };
  }

  private generateHelperConfigs(instance: TimerInstance, entities: TimerEntities): HelperConfig[] {
    const baseName = `ST ${instance.programName} ${instance.name}`;
    
    return [
      {
        id: entities.timerId,
        type: 'timer' as any,
        name: `${baseName} Timer`,
      },
      {
        id: entities.outputHelperId,
        type: 'input_boolean',
        name: `${baseName} Q`,
        initial: false,
      },
    ];
  }

  private generateFinishedAutomation(
    instance: TimerInstance,
    entities: TimerEntities,
    additionalCondition: string,
    actions: HAAction[]
  ): HAAutomation {
    return {
      id: `st_${this.sanitize(instance.projectName)}_${this.sanitize(instance.programName)}_${this.sanitize(instance.name)}_finished`,
      alias: `[ST] ${instance.programName} - ${instance.name} Finished`,
      description: `Timer finished handler for ${instance.type} ${instance.name}`,
      mode: 'single',
      trigger: [{
        platform: 'event',
        event_type: 'timer.finished',
        event_data: {
          entity_id: entities.timerId,
        },
      }],
      condition: additionalCondition !== 'true' ? [{
        condition: 'template',
        value_template: `{{ ${additionalCondition} }}`,
      }] : undefined,
      action: actions,
    };
  }

  // ==========================================================================
  // Action Helpers
  // ==========================================================================

  private timerStart(timerId: string, durationSeconds: string): HAServiceAction {
    return {
      service: 'timer.start',
      target: { entity_id: timerId },
      data: { duration: `{{ ${durationSeconds} }}` },
    };
  }

  private timerCancel(timerId: string): HAServiceAction {
    return {
      service: 'timer.cancel',
      target: { entity_id: timerId },
    };
  }

  private booleanTurnOn(helperId: string): HAServiceAction {
    return {
      service: 'input_boolean.turn_on',
      target: { entity_id: helperId },
    };
  }

  private booleanTurnOff(helperId: string): HAServiceAction {
    return {
      service: 'input_boolean.turn_off',
      target: { entity_id: helperId },
    };
  }

  // ==========================================================================
  // Condition Helpers
  // ==========================================================================

  private templateCondition(expression: string): HACondition {
    return {
      condition: 'template',
      value_template: `{{ ${expression} }}`,
    };
  }

  private stateCondition(entityId: string, state: string): HACondition {
    return {
      condition: 'state',
      entity_id: entityId,
      state,
    };
  }

  // ==========================================================================
  // Utility Helpers
  // ==========================================================================

  private sanitize(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  private parseTimeToSeconds(expr: Expression): string {
    if (expr.type === 'Literal' && expr.kind === 'time') {
      // Parse T#1h30m15s format
      const raw = expr.raw;
      const match = raw.match(/T#(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:(\d+)ms)?/i);
      if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');
        const ms = parseInt(match[4] || '0');
        const total = hours * 3600 + minutes * 60 + seconds + ms / 1000;
        return String(total);
      }
    }
    
    // For variable expressions, return as-is
    return this.jinja.generateExpression(expr);
  }
}

// ============================================================================
// Timer Output Resolver
// ============================================================================

/**
 * Resolve timer output references in expressions
 * 
 * When code references `timer1.Q`, this resolves to the appropriate
 * Jinja expression reading from the helper entity.
 */
export class TimerOutputResolver {
  private timerMappings: Map<string, TimerOutputMappings> = new Map();

  registerTimer(instanceName: string, mappings: TimerOutputMappings): void {
    this.timerMappings.set(instanceName, mappings);
  }

  resolveOutput(instanceName: string, output: 'Q' | 'ET'): string | null {
    const mappings = this.timerMappings.get(instanceName);
    if (!mappings) return null;

    switch (output) {
      case 'Q':
        return mappings.Q;
      case 'ET':
        return mappings.ET || null;
      default:
        return null;
    }
  }

  /**
   * Check if an expression references a timer output
   */
  isTimerOutputRef(varName: string, member: string): boolean {
    return this.timerMappings.has(varName) && ['Q', 'ET'].includes(member.toUpperCase());
  }
}
```

---

## frontend/src/transpiler/__tests__/timer-transpiler.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { TimerTranspiler, TimerOutputResolver } from '../timer-transpiler';
import type { TranspilerContext } from '../types';
import type { TimerInstance, TimerInputs } from '../timer-types';

describe('Timer Transpiler', () => {
  
  const createContext = (): TranspilerContext => ({
    programName: 'Test',
    projectName: 'home',
    variables: new Map(),
    entityBindings: new Map(),
    currentPath: [],
    loopDepth: 0,
    safetyCounters: 0,
  });

  describe('TON Timer', () => {
    
    it('generates correct entities for TON', () => {
      const transpiler = new TimerTranspiler(createContext());
      
      const instance: TimerInstance = {
        name: 'delayTimer',
        type: 'TON',
        programName: 'Kitchen',
        projectName: 'home',
      };
      
      const inputs: TimerInputs = {
        IN: 'states(\'binary_sensor.motion\') == \'on\'',
        PT: '5',
      };
      
      const result = transpiler.transpileTimer(instance, inputs);
      
      expect(result.entities.timerId).toBe('timer.st_home_kitchen_delaytimer');
      expect(result.entities.outputHelperId).toBe('input_boolean.st_home_kitchen_delaytimer_q');
    });

    it('generates helper configs', () => {
      const transpiler = new TimerTranspiler(createContext());
      
      const instance: TimerInstance = {
        name: 'timer1',
        type: 'TON',
        programName: 'Test',
        projectName: 'default',
      };
      
      const result = transpiler.transpileTimer(instance, { IN: 'true', PT: '10' });
      
      expect(result.helpers).toHaveLength(2);
      expect(result.helpers.find(h => h.type === 'timer')).toBeDefined();
      expect(result.helpers.find(h => h.type === 'input_boolean')).toBeDefined();
    });

    it('generates finished automation', () => {
      const transpiler = new TimerTranspiler(createContext());
      
      const instance: TimerInstance = {
        name: 'timer1',
        type: 'TON',
        programName: 'Test',
        projectName: 'default',
      };
      
      const result = transpiler.transpileTimer(instance, { IN: 'sensor_value', PT: '5' });
      
      expect(result.finishedAutomation.trigger[0]).toMatchObject({
        platform: 'event',
        event_type: 'timer.finished',
      });
    });

    it('generates output mappings', () => {
      const transpiler = new TimerTranspiler(createContext());
      
      const instance: TimerInstance = {
        name: 'timer1',
        type: 'TON',
        programName: 'Test',
        projectName: 'default',
      };
      
      const result = transpiler.transpileTimer(instance, { IN: 'true', PT: '5' });
      
      expect(result.outputMappings.Q).toContain('input_boolean');
      expect(result.outputMappings.Q).toContain('== \'on\'');
    });
  });

  describe('TOF Timer', () => {
    
    it('generates correct logic for TOF', () => {
      const transpiler = new TimerTranspiler(createContext());
      
      const instance: TimerInstance = {
        name: 'offDelay',
        type: 'TOF',
        programName: 'Light',
        projectName: 'home',
      };
      
      const result = transpiler.transpileTimer(instance, { IN: 'motion', PT: '30' });
      
      // TOF should turn on output immediately when IN is true
      const choose = result.mainActions[0] as any;
      expect(choose.choose[0].sequence).toContainEqual(
        expect.objectContaining({ service: 'input_boolean.turn_on' })
      );
    });
  });

  describe('TP Timer', () => {
    
    it('generates pulse logic for TP', () => {
      const transpiler = new TimerTranspiler(createContext());
      
      const instance: TimerInstance = {
        name: 'pulse',
        type: 'TP',
        programName: 'Alarm',
        projectName: 'home',
      };
      
      const result = transpiler.transpileTimer(instance, { IN: 'trigger', PT: '1' });
      
      // TP needs additional helper for trigger tracking
      expect(result.helpers.length).toBeGreaterThan(2);
    });
  });

  describe('Timer Output Resolver', () => {
    
    it('resolves Q output', () => {
      const resolver = new TimerOutputResolver();
      
      resolver.registerTimer('timer1', {
        Q: '(states(\'input_boolean.timer1_q\') == \'on\')',
      });
      
      const result = resolver.resolveOutput('timer1', 'Q');
      expect(result).toContain('input_boolean.timer1_q');
    });

    it('returns null for unknown timer', () => {
      const resolver = new TimerOutputResolver();
      
      const result = resolver.resolveOutput('unknown', 'Q');
      expect(result).toBeNull();
    });

    it('identifies timer output references', () => {
      const resolver = new TimerOutputResolver();
      
      resolver.registerTimer('myTimer', { Q: 'test' });
      
      expect(resolver.isTimerOutputRef('myTimer', 'Q')).toBe(true);
      expect(resolver.isTimerOutputRef('myTimer', 'ET')).toBe(true);
      expect(resolver.isTimerOutputRef('myTimer', 'X')).toBe(false);
      expect(resolver.isTimerOutputRef('other', 'Q')).toBe(false);
    });
  });
});
```

---

## Integration in Transpiler

```typescript
// In transpiler.ts - ergänzen

import { TimerTranspiler, TimerOutputResolver } from './timer-transpiler';

class Transpiler {
  private timerTranspiler: TimerTranspiler;
  private timerResolver: TimerOutputResolver;
  private additionalAutomations: HAAutomation[] = [];

  // In transpile() method:
  transpile(): TranspilerResult {
    // ... existing code ...
    
    this.timerTranspiler = new TimerTranspiler(this.context);
    this.timerResolver = new TimerOutputResolver();
    
    // Find and process timer FB instances
    this.processTimerFBs();
    
    // ... rest of transpilation ...
    
    return {
      automation,
      script,
      helpers,
      additionalAutomations: this.additionalAutomations,
      sourceMap: this.sourceMap,
      diagnostics: this.diagnostics,
    };
  }

  private processTimerFBs(): void {
    // Find timer variable declarations
    for (const varDecl of this.ast.variables) {
      const typeName = varDecl.dataType.name.toUpperCase();
      if (['TON', 'TOF', 'TP'].includes(typeName)) {
        // This is a timer FB instance declaration
        // Actual transpilation happens when the FB is called
      }
    }
  }
}
```

---

## Beispiel

### Input ST:
```iecst
PROGRAM Light_Control
VAR
    motion AT %I* : BOOL := 'binary_sensor.motion';
    light AT %Q* : BOOL := 'light.kitchen';
    
    offDelay : TOF;  // Ausschaltverzögerung
END_VAR

// Licht mit 30s Nachlaufzeit
offDelay(IN := motion, PT := T#30s);
light := offDelay.Q;

END_PROGRAM
```

### Output:

**Timer Entity:**
```yaml
timer:
  st_default_light_control_offdelay:
    name: "ST Light_Control offDelay Timer"
```

**Helper:**
```yaml
input_boolean:
  st_default_light_control_offdelay_q:
    name: "ST Light_Control offDelay Q"
    initial: false
```

**Haupt-Automation (erweitert):**
```yaml
# ... trigger section ...
action:
  - choose:
      # TOF Logic
      - conditions:
          - condition: template
            value_template: >-
              {{ states('binary_sensor.motion') == 'on' }}
        sequence:
          - service: timer.cancel
            target:
              entity_id: timer.st_default_light_control_offdelay
          - service: input_boolean.turn_on
            target:
              entity_id: input_boolean.st_default_light_control_offdelay_q
      - conditions:
          - condition: template
            value_template: >-
              {{ states('binary_sensor.motion') != 'on' }}
          - condition: state
            entity_id: input_boolean.st_default_light_control_offdelay_q
            state: 'on'
          - condition: state
            entity_id: timer.st_default_light_control_offdelay
            state: 'idle'
        sequence:
          - service: timer.start
            target:
              entity_id: timer.st_default_light_control_offdelay
            data:
              duration: 30
  # Light assignment
  - service: >-
      {{ 'light.turn_on' if states('input_boolean.st_default_light_control_offdelay_q') == 'on' else 'light.turn_off' }}
    target:
      entity_id: light.kitchen
```

**Timer-Finished Automation:**
```yaml
id: st_default_light_control_offdelay_finished
alias: "[ST] Light_Control - offDelay Finished"
mode: single
trigger:
  - platform: event
    event_type: timer.finished
    event_data:
      entity_id: timer.st_default_light_control_offdelay
condition:
  - condition: template
    value_template: >-
      {{ states('binary_sensor.motion') != 'on' }}
action:
  - service: input_boolean.turn_off
    target:
      entity_id: input_boolean.st_default_light_control_offdelay_q
```

---

## Erfolgskriterien

- [ ] TON: Output wird nach PT Zeit TRUE wenn IN=TRUE
- [ ] TON: Output wird sofort FALSE wenn IN=FALSE (Timer abgebrochen)
- [ ] TOF: Output wird sofort TRUE wenn IN=TRUE
- [ ] TOF: Output wird nach PT Zeit FALSE wenn IN=FALSE
- [ ] TP: Output ist für PT Zeit TRUE nach steigender Flanke
- [ ] Timer sind über `timer.cancel` unterbrechbar
- [ ] timer.finished Event wird korrekt behandelt
- [ ] Helper-Entities werden generiert
- [ ] Output-Mappings erlauben `timer1.Q` Referenzen
- [ ] Alle Tests bestehen

---

## Nicht in diesem Task

- CTU/CTD/CTUD Counter FBs
- SR/RS Flip-Flop FBs  
- Benutzerdefinierte Function Blocks
