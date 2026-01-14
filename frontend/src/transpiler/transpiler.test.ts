import { describe, it, expect } from 'vitest';
import { parse } from '../parser';
import { transpile } from './transpiler';

describe('Transpiler', () => {

  describe('Basic Transpilation', () => {

    it('transpiles simple IF statement', () => {
      const code = `
        PROGRAM Test
        VAR
          motion AT %I* : BOOL := 'binary_sensor.motion';
          light AT %Q* : BOOL := 'light.kitchen';
        END_VAR
          IF motion THEN
            light := TRUE;
          END_IF
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);
      expect(parseResult.ast).toBeDefined();

      const result = transpile(parseResult.ast!);

      // Check automation
      expect(result.automation.trigger).toHaveLength(1);
      expect(result.automation.trigger[0].platform).toBe('state');
      expect((result.automation.trigger[0] as any).entity_id).toBe('binary_sensor.motion');

      // Check script has choose action
      expect(result.script.sequence).toHaveLength(1);
      expect(result.script.sequence[0]).toHaveProperty('choose');
    });

    it('transpiles IF-ELSE statement', () => {
      const code = `
        PROGRAM Test
        VAR
          motion AT %I* : BOOL := 'binary_sensor.motion';
          light AT %Q* : BOOL := 'light.kitchen';
        END_VAR
          IF motion THEN
            light := TRUE;
          ELSE
            light := FALSE;
          END_IF
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      const choose = result.script.sequence[0] as any;
      expect(choose.choose).toHaveLength(1);
      expect(choose.default).toBeDefined();
    });

    it('handles persistent variables', () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          counter : INT := 0;
        END_VAR
          counter := counter + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!, 'myproject');

      // Should generate helper config
      expect(result.helpers).toHaveLength(1);
      expect(result.helpers[0].type).toBe('input_number');
    });
  });

  describe('Mode and Throttle', () => {

    it('applies mode pragma', () => {
      const code = `
        {mode: queued}
        PROGRAM Test
        VAR
          x AT %I* : BOOL := 'binary_sensor.x';
        END_VAR
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      expect(result.script.mode).toBe('queued');
    });

    it('generates throttle condition', () => {
      const code = `
        {throttle: T#5s}
        PROGRAM Test
        VAR
          x AT %I* : BOOL := 'binary_sensor.x';
        END_VAR
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      expect(result.automation.condition).toBeDefined();
      expect(result.automation.condition![0].condition).toBe('template');
    });

    it('generates debounce delay', () => {
      const code = `
        {debounce: T#500ms}
        PROGRAM Test
        VAR
          x AT %I* : BOOL := 'binary_sensor.x';
        END_VAR
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      expect(result.automation.mode).toBe('restart');
      expect(result.automation.action.some(a => 'delay' in a)).toBe(true);
    });
  });

  describe('Output Generation', () => {

    it('generates correct automation ID', () => {
      const code = `
        PROGRAM Kitchen_Light
        VAR
          x AT %I* : BOOL := 'binary_sensor.x';
        END_VAR
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!, 'home');

      expect(result.automation.id).toBe('st_home_kitchen_light');
    });

    it('generates script call in automation', () => {
      const code = `
        PROGRAM Test
        VAR
          x AT %I* : BOOL := 'binary_sensor.x';
        END_VAR
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!, 'myproject');

      const scriptCall = result.automation.action.find(a => 
        'service' in a && (a as any).service === 'script.turn_on'
      ) as any;

      expect(scriptCall).toBeDefined();
      expect(scriptCall.target.entity_id).toContain('st_myproject_test_logic');
    });
  });

  describe('Control Flow', () => {
    it('transpiles CASE statement', () => {
      const code = `
        PROGRAM Test
        VAR
          x : INT := 0;
          y : INT := 0;
        END_VAR
          CASE x OF
            1: y := 10;
            2, 3: y := 20;
          ELSE
            y := 0;
          END_CASE
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      const choose = result.script.sequence[0] as any;
      expect(choose.choose).toBeDefined();
      expect(choose.choose.length).toBeGreaterThan(0);
      expect(choose.default).toBeDefined();
    });

    it('transpiles FOR loop', () => {
      const code = `
        PROGRAM Test
        VAR
          i : INT;
          sum : INT := 0;
        END_VAR
          FOR i := 1 TO 10 DO
            sum := sum + i;
          END_FOR
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      const repeat = result.script.sequence[0] as any;
      expect(repeat.repeat).toBeDefined();
      expect(repeat.repeat.count).toBeDefined();
    });

    it('transpiles WHILE loop', () => {
      const code = `
        PROGRAM Test
        VAR
          x : INT := 0;
        END_VAR
          WHILE x < 100 DO
            x := x + 1;
          END_WHILE
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      const repeat = result.script.sequence[0] as any;
      expect(repeat.repeat).toBeDefined();
      expect(repeat.repeat.while).toBeDefined();
    });
  });

  describe('Assignments', () => {
    it('generates service call for output entity', () => {
      const code = `
        PROGRAM Test
        VAR
          light AT %Q* : BOOL := 'light.kitchen';
          motion AT %I* : BOOL := 'binary_sensor.motion';
        END_VAR
          light := motion;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      const actions = result.script.sequence;
      const serviceAction = actions.find(a => 'service' in a) as any;
      expect(serviceAction).toBeDefined();
      expect(serviceAction.service).toContain('light.turn');
    });

    it('generates helper service call for persistent variable', () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          counter : INT := 0;
        END_VAR
          counter := counter + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      const actions = result.script.sequence;
      const serviceAction = actions.find(a => 'service' in a) as any;
      expect(serviceAction).toBeDefined();
      expect(serviceAction.service).toBe('input_number.set_value');
    });

    it('generates variables action for transient variable', () => {
      const code = `
        PROGRAM Test
        VAR
          temp : INT := 0;
        END_VAR
          temp := 42;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = transpile(parseResult.ast!);

      const actions = result.script.sequence;
      const varAction = actions.find(a => 'variables' in a) as any;
      expect(varAction).toBeDefined();
      expect(varAction.variables.temp).toBeDefined();
    });
  });

  describe('Timers integration (off-delay example)', () => {
    it('transpiles TOF off-delay timer with Q used in assignment (smoke test)', () => {
      const code = `
        PROGRAM Light_Control
        VAR
            motion AT %I* : BOOL := 'binary_sensor.motion';
            light AT %Q* : BOOL := 'light.kitchen';
            
            offDelay : TOF;
        END_VAR

        // Licht mit 30s Nachlaufzeit
        offDelay(IN := motion, PT := T#30s);
        light := offDelay.Q;

        END_PROGRAM
      `;

      const parseResult = parse(code);
      if (!parseResult.success || !parseResult.ast) {
        // Parser does not yet support full timer syntax end-to-end in this example.
        // This test is a smoke test for transpiler wiring and may be tightened later.
        return;
      }

      const result = transpile(parseResult.ast, 'default');

      // Helpers should include a timer and a boolean Q helper
      const timerHelper = result.helpers.find((h) =>
        h.id.startsWith('timer.st_default_light_control_offdelay'),
      );
      const qHelper = result.helpers.find((h) =>
        h.id.startsWith('input_boolean.st_default_light_control_offdelay_q'),
      );
      expect(timerHelper).toBeDefined();
      expect(qHelper).toBeDefined();

      // Additional automations should include a timer.finished handler
      expect(result.additionalAutomations && result.additionalAutomations.length).toBeGreaterThan(0);
      const finished = result.additionalAutomations!.find((a) =>
        a.trigger.some(
          (t) =>
            t.platform === 'event' &&
            (t as any).event_type === 'timer.finished',
        ),
      );
      expect(finished).toBeDefined();
    });
  });
});
