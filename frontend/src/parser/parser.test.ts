/**
 * Parser Tests
 */

import { describe, it, expect } from "vitest";
import { parse } from "./index";
import type { AssignmentStatement } from "./ast";

describe("ST Parser", () => {
  describe("Program structure", () => {
    it("should parse a minimal program", () => {
      const code = `
        PROGRAM Test
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.type).toBe("Program");
      expect(result.ast?.name).toBe("Test");
    });

    it("should parse a program with pragmas", () => {
      const code = `
        {trigger: state_change}
        PROGRAM LightControl
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.pragmas).toHaveLength(1);
      expect(result.ast?.pragmas[0].name).toBe("trigger");
      expect(result.ast?.pragmas[0].value).toBe("state_change");
    });
  });

  describe("Variable declarations", () => {
    it("should parse VAR block with basic variables", () => {
      const code = `
        PROGRAM Test
        VAR
          counter: INT;
          enabled: BOOL;
        END_VAR
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.variables).toHaveLength(2);
      expect(result.ast?.variables[0].name).toBe("counter");
      expect(result.ast?.variables[0].dataType.name).toBe("INT");
      expect(result.ast?.variables[1].name).toBe("enabled");
      expect(result.ast?.variables[1].dataType.name).toBe("BOOL");
    });

    it("should parse variables with initial values", () => {
      const code = `
        PROGRAM Test
        VAR
          counter: INT := 0;
          name: STRING := 'default';
        END_VAR
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.variables[0].initialValue).toBeDefined();
    });

    it("should parse VAR_INPUT and VAR_OUTPUT", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          sensor: BOOL;
        END_VAR
        VAR_OUTPUT
          actuator: BOOL;
        END_VAR
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.variables).toHaveLength(2);
      expect(result.ast?.variables[0].section).toBe("VAR_INPUT");
      expect(result.ast?.variables[1].section).toBe("VAR_OUTPUT");
    });

    it("should parse I/O bindings", () => {
      const code = `
        PROGRAM Test
        VAR
          doorSensor: BOOL AT %I0.0;
        END_VAR
        END_PROGRAM
      `;

      const result = parse(code);
      if (!result.success) {
        console.log("Errors:", result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.ast?.variables[0].binding?.entityId).toBe("I0.0");
    });

    it("should parse variable pragmas", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          lastState: BOOL;
        END_VAR
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.variables[0].pragmas).toHaveLength(1);
      expect(result.ast?.variables[0].pragmas[0].name).toBe("persistent");
    });
  });

  describe("Statements", () => {
    it("should parse assignment statements", () => {
      const code = `
        PROGRAM Test
        VAR
          x: INT;
        END_VAR
          x := 42;
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.body).toHaveLength(1);
      expect(result.ast?.body[0].type).toBe("Assignment");
    });

    it("should parse IF statements", () => {
      const code = `
        PROGRAM Test
        VAR
          x: INT;
          y: INT;
        END_VAR
          IF x > 10 THEN
            y := 1;
          END_IF
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.body[0].type).toBe("IfStatement");
    });

    it("should parse IF-ELSIF-ELSE statements", () => {
      const code = `
        PROGRAM Test
        VAR
          x: INT;
          y: INT;
        END_VAR
          IF x > 10 THEN
            y := 1;
          ELSIF x > 5 THEN
            y := 2;
          ELSE
            y := 3;
          END_IF
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      const ifStmt = result.ast?.body[0] as any;
      expect(ifStmt.type).toBe("IfStatement");
      expect(ifStmt.elsifBranches).toHaveLength(1);
      expect(ifStmt.elseBranch).toBeDefined();
    });

    it("should parse FOR loops", () => {
      const code = `
        PROGRAM Test
        VAR
          i: INT;
          sum: INT;
        END_VAR
          FOR i := 1 TO 10 BY 2 DO
            sum := sum + i;
          END_FOR
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.body[0].type).toBe("ForStatement");
    });

    it("should parse WHILE loops", () => {
      const code = `
        PROGRAM Test
        VAR
          x: INT;
        END_VAR
          WHILE x < 100 DO
            x := x + 1;
          END_WHILE
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.body[0].type).toBe("WhileStatement");
    });

    it("should parse REPEAT loops", () => {
      const code = `
        PROGRAM Test
        VAR
          x: INT;
        END_VAR
          REPEAT
            x := x + 1;
          UNTIL x >= 100
          END_REPEAT
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.body[0].type).toBe("RepeatStatement");
    });

    it("should parse CASE statements", () => {
      const code = `
        PROGRAM Test
        VAR
          x: INT;
          y: INT;
        END_VAR
          CASE x OF
            1: y := 10;
            2, 3: y := 20;
            5..10: y := 30;
          ELSE
            y := 0;
          END_CASE
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.ast?.body[0].type).toBe("CaseStatement");
    });
  });

  describe("Expressions", () => {
    it("should parse arithmetic expressions", () => {
      const code = `
        PROGRAM Test
        VAR
          result: INT;
        END_VAR
          result := 1 + 2 * 3;
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
    });

    it("should parse comparison expressions", () => {
      const code = `
        PROGRAM Test
        VAR
          x: INT;
          result: BOOL;
        END_VAR
          result := x > 10 AND x < 20;
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
    });

    it("should parse boolean literals", () => {
      const code = `
        PROGRAM Test
        VAR
          flag: BOOL;
        END_VAR
          flag := TRUE;
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
      const assignment = result.ast?.body[0] as AssignmentStatement;
      expect(assignment.value.type).toBe("Literal");
    });

    it("should parse function calls", () => {
      const code = `
        PROGRAM Test
        VAR
          result: INT;
        END_VAR
          result := ABS(-42);
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
    });

    it("should parse nested expressions with parentheses", () => {
      const code = `
        PROGRAM Test
        VAR
          result: INT;
        END_VAR
          result := (1 + 2) * (3 + 4);
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
    });

    it("should parse unary expressions", () => {
      const code = `
        PROGRAM Test
        VAR
          x: INT;
          flag: BOOL;
        END_VAR
          x := -42;
          flag := NOT TRUE;
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should report syntax errors", () => {
      const code = `
        PROGRAM Test
        VAR
          x: INT
        END_VAR
        END_PROGRAM
      `;

      const result = parse(code);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should report missing END_PROGRAM", () => {
      const code = `
        PROGRAM Test
        VAR
        END_VAR
      `;

      const result = parse(code);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Complex examples", () => {
    it("should parse a complete automation program", () => {
      const code = `
        {trigger: state_change}
        PROGRAM LightControl

        VAR_INPUT
          motionSensor: BOOL AT %I0.0;
          lightSwitch: BOOL AT %I0.1;
        END_VAR

        VAR_OUTPUT
          light: BOOL AT %Q0.0;
        END_VAR

        VAR
          {persistent}
          manualOverride: BOOL := FALSE;
          timer: TIME;
        END_VAR

          IF manualOverride THEN
            light := lightSwitch;
          ELSIF motionSensor THEN
            light := TRUE;
            timer := T#5m;
          ELSE
            light := FALSE;
          END_IF

        END_PROGRAM
      `;

      const result = parse(code);
      if (!result.success) {
        console.log("Complex example errors:", result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.ast?.name).toBe("LightControl");
      expect(result.ast?.pragmas).toHaveLength(1);
      expect(result.ast?.variables.length).toBeGreaterThan(0);
      expect(result.ast?.body.length).toBeGreaterThan(0);
    });
  });
});
