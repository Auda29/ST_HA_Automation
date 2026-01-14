/**
 * Dependency Analyzer Tests
 *
 * This test suite verifies that the dependency analyzer correctly:
 * - Generates triggers for input variables
 * - Respects trigger control pragmas
 * - Detects usage patterns
 * - Extracts entity dependencies
 * - Generates diagnostics
 */

import { describe, it, expect } from "vitest";
import { parse } from "../parser";
import { analyzeDependencies } from "./dependency-analyzer";
import { DiagnosticCodes } from "./types";

describe("Dependency Analyzer", () => {
  describe("Basic Trigger Generation", () => {
    it("generates trigger for input variable", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          motion AT %I* : BOOL := 'binary_sensor.motion';
        END_VAR
        VAR_OUTPUT
          light AT %Q* : BOOL := 'light.living_room';
        END_VAR
          light := motion;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      if (!parseResult.success || !parseResult.ast) {
        console.error("Parse errors:", parseResult.errors);
      }
      expect(parseResult.success).toBe(true);
      expect(parseResult.ast).toBeDefined();

      const result = analyzeDependencies(parseResult.ast!);

      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].entity_id).toBe("binary_sensor.motion");
      expect(result.triggers[0].platform).toBe("state");
    });

    it("generates multiple triggers for multiple inputs", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          motion AT %I* : BOOL := 'binary_sensor.motion';
          door AT %I* : BOOL := 'binary_sensor.door';
        END_VAR
        VAR_OUTPUT
          alarm AT %Q* : BOOL := 'switch.alarm';
        END_VAR
          alarm := motion OR door;
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      expect(result.triggers).toHaveLength(2);
      expect(result.triggers.map((t) => t.entity_id)).toContain(
        "binary_sensor.motion",
      );
      expect(result.triggers.map((t) => t.entity_id)).toContain(
        "binary_sensor.door",
      );
    });

    it("does NOT generate trigger for output variable", () => {
      const code = `
        PROGRAM Test
        VAR_OUTPUT
          light AT %Q* : BOOL := 'light.living_room';
        END_VAR
          light := TRUE;
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      expect(result.triggers).toHaveLength(0);
    });
  });

  describe("Pragma Control", () => {
    it("respects {trigger} pragma", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          {trigger}
          temp AT %I* : REAL := 'sensor.temperature';
        END_VAR
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      expect(result.triggers).toHaveLength(1);
      const dep = result.dependencies.find((d) => d.variableName === "temp");
      expect(dep?.isTrigger).toBe(true);
    });

    it("respects {no_trigger} pragma", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          {no_trigger}
          motion AT %I* : BOOL := 'binary_sensor.motion';
          door AT %I* : BOOL := 'binary_sensor.door';
        END_VAR
        VAR_OUTPUT
          alarm AT %Q* : BOOL := 'switch.alarm';
        END_VAR
          alarm := motion OR door;
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      // Only 'door' should generate a trigger
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].entity_id).toBe("binary_sensor.door");
    });
  });

  describe("Diagnostics", () => {
    it("warns when no triggers detected", () => {
      const code = `
        PROGRAM Test
        VAR
          counter: INT;
        END_VAR
          counter := counter + 1;
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      expect(
        result.diagnostics.some((d) => d.code === DiagnosticCodes.NO_TRIGGERS),
      ).toBe(true);
    });

    it("warns about unused input variables", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          motion AT %I* : BOOL := 'binary_sensor.motion';
          unused AT %I* : BOOL := 'binary_sensor.unused';
        END_VAR
        VAR_OUTPUT
          light AT %Q* : BOOL := 'light.living_room';
        END_VAR
          light := motion;
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      const unusedWarning = result.diagnostics.find(
        (d) =>
          d.code === DiagnosticCodes.UNUSED_INPUT &&
          d.message.includes("unused"),
      );
      expect(unusedWarning).toBeDefined();
    });

    it("warns when writing to input variable", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          motion AT %I* : BOOL := 'binary_sensor.motion';
        END_VAR
          motion := TRUE;
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      const writeWarning = result.diagnostics.find(
        (d) => d.code === DiagnosticCodes.WRITE_TO_INPUT,
      );
      expect(writeWarning).toBeDefined();
    });

    it("warns about many triggers", () => {
      // Create code with 11 input variables
      const vars = Array.from(
        { length: 11 },
        (_, i) => `motion${i} AT %I* : BOOL := 'binary_sensor.motion${i}';`,
      ).join("\n          ");

      const reads = Array.from({ length: 11 }, (_, i) => `motion${i}`).join(
        " OR ",
      );

      const code = `
        PROGRAM Test
        VAR_INPUT
          ${vars}
        END_VAR
        VAR_OUTPUT
          alarm AT %Q* : BOOL := 'switch.alarm';
        END_VAR
          alarm := ${reads};
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      expect(
        result.diagnostics.some(
          (d) => d.code === DiagnosticCodes.MANY_TRIGGERS,
        ),
      ).toBe(true);
    });
  });

  describe("Entity Dependency Extraction", () => {
    it("extracts entity ID from string literal", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          temp AT %I* : REAL := 'sensor.temperature';
        END_VAR
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      expect(result.dependencies).toHaveLength(1);
      const dep = result.dependencies[0];
      expect(dep.entityId).toBe("sensor.temperature");
      expect(dep.dataType).toBe("REAL");
    });

    it("correctly identifies INPUT vs OUTPUT direction", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          sensor AT %I* : REAL := 'sensor.temperature';
        END_VAR
        VAR_OUTPUT
          actuator AT %Q* : BOOL := 'switch.heater';
        END_VAR
          actuator := sensor > 20.0;
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      const sensorDep = result.dependencies.find(
        (d) => d.variableName === "sensor",
      );
      const actuatorDep = result.dependencies.find(
        (d) => d.variableName === "actuator",
      );

      expect(sensorDep?.direction).toBe("INPUT");
      expect(actuatorDep?.direction).toBe("OUTPUT");
    });

    it("validates entity ID format", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          invalid AT %I* : BOOL := 'invalid_entity_id';
        END_VAR
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      expect(
        result.diagnostics.some(
          (d) => d.code === DiagnosticCodes.INVALID_ENTITY_ID,
        ),
      ).toBe(true);
    });
  });

  describe("Metadata Extraction", () => {
    it("extracts program metadata", () => {
      const code = `
        {mode: single}
        {throttle: 1000}
        PROGRAM LightControl
        VAR_INPUT
          motion AT %I* : BOOL := 'binary_sensor.motion';
          lux AT %I* : REAL := 'sensor.light';
        END_VAR
        VAR_OUTPUT
          light AT %Q* : BOOL := 'light.living_room';
        END_VAR
          IF motion AND lux < 50.0 THEN
            light := TRUE;
          END_IF
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      expect(result.metadata.programName).toBe("LightControl");
      expect(result.metadata.inputCount).toBe(2);
      expect(result.metadata.outputCount).toBe(1);
      expect(result.metadata.mode).toBe("single");
      expect(result.metadata.throttle).toBe(1000);
    });

    it.skip("detects timer usage", () => {
      // TODO: Requires named parameter support in parser (IN := TRUE, PT := T#5s)
      const code = `
        PROGRAM Test
        VAR
          timer: TON;
        END_VAR
          timer(IN := TRUE, PT := T#5s);
        END_PROGRAM
      `;

      const parseResult = parse(code);
      if (!parseResult.success || !parseResult.ast) {
        console.error("Parse errors:", parseResult.errors);
      }
      expect(parseResult.success).toBe(true);
      expect(parseResult.ast).toBeDefined();

      const result = analyzeDependencies(parseResult.ast!);

      expect(result.metadata.hasTimers).toBe(true);
    });
  });

  describe("Trigger Deduplication", () => {
    it("removes duplicate triggers for same entity", () => {
      const code = `
        PROGRAM Test
        VAR_INPUT
          motion AT %I* : BOOL := 'binary_sensor.motion';
        END_VAR
        VAR_OUTPUT
          light1 AT %Q* : BOOL := 'light.room1';
          light2 AT %Q* : BOOL := 'light.room2';
        END_VAR
          light1 := motion;
          light2 := motion;
        END_PROGRAM
      `;

      const ast = parse(code).ast!;
      const result = analyzeDependencies(ast);

      // Should only have one trigger for motion sensor
      const motionTriggers = result.triggers.filter(
        (t) => t.entity_id === "binary_sensor.motion",
      );
      expect(motionTriggers).toHaveLength(1);
    });
  });
});
