import { describe, it, expect } from "vitest";
import {
  ErrorMapper,
  ErrorDisplayFormatter,
} from "../error-mapping/error-mapper";
import {
  translateMessage,
  findMatchingPattern,
} from "../error-mapping/error-patterns";

describe("Error Mapping", () => {
  describe("Error Patterns", () => {
    it("translates undefined variable error", () => {
      const message = "UndefinedError: 'sensor_temp' is undefined";
      const result = translateMessage(message);

      expect(result).toContain("sensor_temp");
      expect(result).toContain("nicht definiert");
    });

    it("translates float conversion error", () => {
      const message = "could not convert string to float: 'unavailable'";
      const result = translateMessage(message);

      expect(result).toContain("unavailable");
      expect(result).toContain("Zahl");
    });

    it("provides suggestions for known errors", () => {
      const message = "UndefinedError: 'myVar' is undefined";
      const result = findMatchingPattern(message);

      expect(result).not.toBeNull();
      expect(result?.pattern.suggestions).toBeDefined();
      expect(result?.pattern.suggestions?.length).toBeGreaterThan(0);
    });

    it("returns original for unknown errors", () => {
      const message = "Some completely unknown error";
      const result = translateMessage(message);

      expect(result).toBe(message);
    });
  });

  describe("ErrorMapper", () => {
    it("maps errors with source maps", () => {
      const mapper = new ErrorMapper();

      mapper.registerSourceMap("st_test", {
        version: 1,
        project: "home",
        program: "Test",
        automationId: "st_test",
        generatedAt: new Date().toISOString(),
        mappings: {
          "action.0": { st: { file: "test.st", line: 7, column: 1 } },
        },
      });

      const error = mapper.mapError({
        automationId: "st_test",
        message: "UndefinedError: 'x' is undefined",
        yamlPath: "action.0",
        logEntry: {
          level: "ERROR",
          timestamp: new Date().toISOString(),
          logger: "homeassistant",
          message: "UndefinedError: 'x' is undefined",
        },
      });

      expect(error.stLocation?.line).toBe(7);
    });

    it("generates code snippets", () => {
      const mapper = new ErrorMapper();

      mapper.registerSourceFile(
        "test.st",
        `PROGRAM Test
VAR
    x : INT;
END_VAR

IF x > 5 THEN
    y := x;
END_IF

END_PROGRAM`,
      );

      mapper.registerSourceMap("st_test", {
        version: 1,
        project: "home",
        program: "Test",
        automationId: "st_test",
        generatedAt: new Date().toISOString(),
        mappings: {
          "action.0": { st: { file: "test.st", line: 7, column: 5 } },
        },
      });

      const error = mapper.mapError({
        automationId: "st_test",
        message: "UndefinedError: 'y' is undefined",
        yamlPath: "action.0",
        logEntry: {
          level: "ERROR",
          timestamp: new Date().toISOString(),
          logger: "homeassistant",
          message: "UndefinedError: 'y' is undefined",
        },
      });

      expect(error.codeSnippet).toBeDefined();
      expect(error.codeSnippet?.lines.find((l) => l.isError)).toBeDefined();
    });
  });

  describe("ErrorDisplayFormatter", () => {
    it("formats error for console", () => {
      const formatter = new ErrorDisplayFormatter();

      const output = formatter.formatForConsole({
        original: {
          automationId: "st_test",
          message: "test error",
          logEntry: { level: "ERROR", timestamp: "", logger: "", message: "" },
        },
        translatedMessage: "Übersetzter Fehler",
        stLocation: { file: "test.st", line: 7, column: 1 },
        suggestions: ["Suggestion 1"],
      });

      expect(output).toContain("test.st");
      expect(output).toContain("7");
      expect(output).toContain("Übersetzter Fehler");
    });
  });
});
