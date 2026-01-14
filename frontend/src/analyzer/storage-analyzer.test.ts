/**
 * Storage Analyzer Tests
 *
 * This test suite verifies that the storage analyzer correctly:
 * - Detects entity-bound variables as DERIVED
 * - Marks regular variables as TRANSIENT by default
 * - Auto-detects self-references as PERSISTENT
 * - Auto-detects FB instances as PERSISTENT
 * - Respects {persistent} and {transient} pragmas
 * - Generates correct helper configurations
 * - Follows namespace conventions for helper IDs
 */

import { describe, it, expect } from "vitest";
import { parse } from "../parser";
import {
  analyzeStorage,
  getPersistentVariables,
  getRequiredHelpers,
} from "./storage-analyzer";
import { StorageType, StorageDiagnosticCodes } from "./types";

describe("Storage Analyzer", () => {
  describe("Storage Type Detection", () => {
    it("marks entity-bound variables as DERIVED", () => {
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

      const result = analyzeStorage(parseResult.ast!);

      const motion = result.variables.find((v) => v.name === "motion");
      const light = result.variables.find((v) => v.name === "light");

      expect(motion?.storage.type).toBe(StorageType.DERIVED);
      expect(light?.storage.type).toBe(StorageType.DERIVED);
    });

    it("marks regular variables as TRANSIENT by default", () => {
      const code = `
        PROGRAM Test
        VAR
          temp : INT := 0;
          result : BOOL := FALSE;
        END_VAR
          temp := 42;
          result := TRUE;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      expect(
        result.variables.every((v) => v.storage.type === StorageType.TRANSIENT),
      ).toBe(true);
    });

    it("detects self-reference as PERSISTENT", () => {
      const code = `
        PROGRAM Test
        VAR
          counter : INT := 0;
        END_VAR
          counter := counter + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      const counter = result.variables.find((v) => v.name === "counter");
      expect(counter?.storage.type).toBe(StorageType.PERSISTENT);
      expect(counter?.usageInfo.hasSelfReference).toBe(true);
    });

    it("detects FB instances as PERSISTENT", () => {
      const code = `
        PROGRAM Test
        VAR
          timer1 : TON;
          trigger1 : R_TRIG;
        END_VAR
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      const timer = result.variables.find((v) => v.name === "timer1");
      const trigger = result.variables.find((v) => v.name === "trigger1");

      expect(timer?.storage.type).toBe(StorageType.PERSISTENT);
      expect(trigger?.storage.type).toBe(StorageType.PERSISTENT);
      expect(timer?.usageInfo.isFBInstance).toBe(true);
      expect(trigger?.usageInfo.isFBInstance).toBe(true);
    });

    it("detects TIME variables as PERSISTENT", () => {
      const code = `
        PROGRAM Test
        VAR
          elapsedTime : TIME := T#0s;
        END_VAR
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      const elapsed = result.variables.find((v) => v.name === "elapsedTime");
      expect(elapsed?.storage.type).toBe(StorageType.PERSISTENT);
      expect(elapsed?.usageInfo.isTimerRelated).toBe(true);
    });
  });

  describe("Pragma Control", () => {
    it("respects {persistent} pragma", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          state : INT := 0;
        END_VAR
          state := 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      const state = result.variables.find((v) => v.name === "state");
      expect(state?.storage.type).toBe(StorageType.PERSISTENT);
    });

    it("respects {transient} pragma even with self-reference", () => {
      const code = `
        PROGRAM Test
        VAR
          {transient}
          counter : INT := 0;
        END_VAR
          counter := counter + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      const counter = result.variables.find((v) => v.name === "counter");
      expect(counter?.storage.type).toBe(StorageType.TRANSIENT);

      // Should warn about self-reference in transient
      expect(
        result.diagnostics.some(
          (d) => d.code === StorageDiagnosticCodes.SELF_REF_NOT_PERSISTENT,
        ),
      ).toBe(true);
    });

    it("detects conflicting pragmas", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          {transient}
          confused : INT := 0;
        END_VAR
          confused := 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      expect(
        result.diagnostics.some(
          (d) => d.code === StorageDiagnosticCodes.CONFLICTING_PRAGMAS,
        ),
      ).toBe(true);
    });
  });

  describe("Helper Generation", () => {
    it("generates input_number helper for INT", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          counter : INT := 42;
        END_VAR
          counter := counter + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const helpers = getRequiredHelpers(parseResult.ast!, "myproject");

      expect(helpers).toHaveLength(1);
      expect(helpers[0].type).toBe("input_number");
      expect(helpers[0].id).toContain("st_myproject_test_counter");
      expect(helpers[0].initial).toBe(42);
    });

    it("generates input_boolean helper for BOOL", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          flag : BOOL := TRUE;
        END_VAR
          flag := NOT flag;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const helpers = getRequiredHelpers(parseResult.ast!);

      expect(helpers).toHaveLength(1);
      expect(helpers[0].type).toBe("input_boolean");
      expect(helpers[0].initial).toBe(true);
    });

    it("generates input_text helper for STRING", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          message : STRING := 'Hello';
        END_VAR
          message := 'World';
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const helpers = getRequiredHelpers(parseResult.ast!);

      expect(helpers).toHaveLength(1);
      expect(helpers[0].type).toBe("input_text");
      expect(helpers[0].initial).toBe("Hello");
    });

    it("sets correct min/max for numeric helpers", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          small : SINT := 0;
          {persistent}
          medium : INT := 0;
          {persistent}
          large : DINT := 0;
        END_VAR
          small := small + 1;
          medium := medium + 1;
          large := large + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const helpers = getRequiredHelpers(parseResult.ast!);

      const small = helpers.find((h) => h.id.includes("small"));
      const medium = helpers.find((h) => h.id.includes("medium"));
      const large = helpers.find((h) => h.id.includes("large"));

      expect(small?.min).toBe(-128);
      expect(small?.max).toBe(127);
      expect(medium?.min).toBe(-32768);
      expect(medium?.max).toBe(32767);
      expect(large?.min).toBe(-2147483648);
      expect(large?.max).toBe(2147483647);
    });

    it("follows namespace convention", () => {
      const code = `
        PROGRAM Kitchen_Light
        VAR
          {persistent}
          activationCount : INT := 0;
        END_VAR
          activationCount := activationCount + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const helpers = getRequiredHelpers(parseResult.ast!, "home");

      expect(helpers[0].id).toBe(
        "input_number.st_home_kitchen_light_activationcount",
      );
    });
  });

  describe("Usage Analysis", () => {
    it("tracks read and write counts", () => {
      const code = `
        PROGRAM Test
        VAR
          x : INT := 0;
        END_VAR
          x := 1;
          x := x + 1;
          x := x * 2;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      const x = result.variables.find((v) => v.name === "x");
      expect(x?.usageInfo.isRead).toBe(true);
      expect(x?.usageInfo.isWritten).toBe(true);
      expect(x?.usageInfo.readCount).toBe(2); // x + 1, x * 2
      expect(x?.usageInfo.writeCount).toBe(3);
    });

    it("warns about unused persistent variables", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          unused : INT := 0;
          {persistent}
          used : INT := 0;
        END_VAR
          used := used + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      expect(
        result.diagnostics.some(
          (d) =>
            d.code === StorageDiagnosticCodes.UNUSED_PERSISTENT &&
            d.message.includes("unused"),
        ),
      ).toBe(true);
    });
  });

  describe("getPersistentVariables", () => {
    it("returns only persistent variables", () => {
      const code = `
        PROGRAM Test
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
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const persistent = getPersistentVariables(parseResult.ast!);

      expect(persistent).toHaveLength(2);
      expect(persistent.map((v) => v.name)).toContain("persistent1");
      expect(persistent.map((v) => v.name)).toContain("selfRef");
    });
  });

  describe("Helper Type Mapping Edge Cases", () => {
    it("handles unsigned integer types", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          byteVal : USINT := 0;
          {persistent}
          wordVal : UINT := 0;
        END_VAR
          byteVal := byteVal + 1;
          wordVal := wordVal + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const helpers = getRequiredHelpers(parseResult.ast!);

      const byteHelper = helpers.find((h) => h.id.includes("byteval"));
      const wordHelper = helpers.find((h) => h.id.includes("wordval"));

      expect(byteHelper?.min).toBe(0);
      expect(byteHelper?.max).toBe(255);
      expect(wordHelper?.min).toBe(0);
      expect(wordHelper?.max).toBe(65535);
    });

    it("handles REAL types", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          temperature : REAL := 20.5;
        END_VAR
          temperature := temperature + 0.1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const helpers = getRequiredHelpers(parseResult.ast!);

      expect(helpers).toHaveLength(1);
      expect(helpers[0].type).toBe("input_number");
      expect(helpers[0].step).toBe(0.1);
    });
  });

  describe("Complex Self-Reference Detection", () => {
    it("detects self-reference in complex expressions", () => {
      const code = `
        PROGRAM Test
        VAR
          total : INT := 0;
          multiplier : INT := 2;
        END_VAR
          total := (total * multiplier) + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      const total = result.variables.find((v) => v.name === "total");
      const multiplier = result.variables.find((v) => v.name === "multiplier");

      expect(total?.storage.type).toBe(StorageType.PERSISTENT);
      expect(total?.usageInfo.hasSelfReference).toBe(true);
      expect(multiplier?.storage.type).toBe(StorageType.TRANSIENT);
      expect(multiplier?.usageInfo.hasSelfReference).toBe(false);
    });

    it("detects accumulator pattern", () => {
      const code = `
        PROGRAM Test
        VAR
          sum : INT := 0;
          value : INT := 10;
        END_VAR
          sum := sum + value;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      const sum = result.variables.find((v) => v.name === "sum");
      expect(sum?.storage.type).toBe(StorageType.PERSISTENT);
      expect(sum?.usageInfo.hasSelfReference).toBe(true);
    });
  });

  describe("Diagnostics", () => {
    it("emits info diagnostic for auto-detected persistent", () => {
      const code = `
        PROGRAM Test
        VAR
          counter : INT := 0;
        END_VAR
          counter := counter + 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      expect(
        result.diagnostics.some(
          (d) =>
            d.code === StorageDiagnosticCodes.AUTO_PERSISTENT &&
            d.message.includes("self-reference"),
        ),
      ).toBe(true);
    });

    it("emits info diagnostic for explicit persistent pragma", () => {
      const code = `
        PROGRAM Test
        VAR
          {persistent}
          state : INT := 0;
        END_VAR
          state := 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      expect(
        result.diagnostics.some(
          (d) => d.code === StorageDiagnosticCodes.EXPLICIT_PERSISTENT,
        ),
      ).toBe(true);
    });

    it("emits info diagnostic for explicit transient pragma", () => {
      const code = `
        PROGRAM Test
        VAR
          {transient}
          temp : INT := 0;
        END_VAR
          temp := 1;
        END_PROGRAM
      `;

      const parseResult = parse(code);
      expect(parseResult.success).toBe(true);

      const result = analyzeStorage(parseResult.ast!);

      expect(
        result.diagnostics.some(
          (d) => d.code === StorageDiagnosticCodes.EXPLICIT_TRANSIENT,
        ),
      ).toBe(true);
    });
  });
});
