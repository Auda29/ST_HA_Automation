import { describe, it, expect } from "vitest";
import type { HALogEntry } from "./error-types";
import type { SourceMap } from "../sourcemap/source-map-types";
import { ErrorMapper, ErrorDisplayFormatter } from "./error-mapper";
import { translateMessage } from "./error-patterns";

describe("ErrorMapper", () => {
  const automationId = "st_home_testprogram";
  const sourceFile = "TestProgram.st";
  const sourceContent = [
    "PROGRAM TestProgram",
    "VAR",
    "  x : INT;",
    "END_VAR",
    "x := x + 1; // error here",
    "END_PROGRAM",
  ].join("\n");

  function createSourceMap(): SourceMap {
    return {
      version: 1,
      project: "home",
      program: "TestProgram",
      automationId,
      scriptId: "script.st_home_testprogram_logic",
      generatedAt: "2025-01-01T00:00:00Z",
      mappings: {
        "action.0": {
          st: {
            file: sourceFile,
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 10,
          },
          description: "increment assignment",
        },
      },
      // Hash is optional for mapping tests
      sourceHash: undefined,
    };
  }

  it("parses HA log entry and maps to ST location with code snippet", () => {
    const mapper = new ErrorMapper();
    mapper.registerSourceMap(automationId, createSourceMap());
    mapper.registerSourceFile(sourceFile, sourceContent);

    const entry: HALogEntry = {
      level: "ERROR",
      timestamp: "2025-01-01T00:00:00Z",
      logger: "automation",
      message: "Error while executing automation st_home_testprogram at path action.0",
      context: {
        automation_id: automationId,
        path: "action.0",
      },
    };

    const mapped = mapper.mapLogEntry(entry);
    expect(mapped).not.toBeNull();
    if (!mapped) return;

    // ST location resolved from source map
    expect(mapped.stLocation).toBeDefined();
    expect(mapped.stLocation!.file).toBe(sourceFile);
    expect(mapped.stLocation!.line).toBe(5);

    // Code snippet around error
    expect(mapped.codeSnippet).toBeDefined();
    const snippet = mapped.codeSnippet!;
    expect(snippet.lines.some((l) => l.isError && l.number === 5)).toBe(true);
  });

  it("translates known template errors to German with suggestions", () => {
    const message = "UndefinedError: 'foo' is undefined";
    const translated = translateMessage(message);

    expect(translated).toContain("Variable 'foo' ist nicht definiert");

    const mapper = new ErrorMapper();
    const entry: HALogEntry = {
      level: "ERROR",
      timestamp: "2025-01-01T00:00:00Z",
      logger: "template",
      message,
      context: {
        automation_id: automationId,
        path: "action.0",
      },
    };

    // Register a minimal source map so mapLogEntry succeeds
    mapper.registerSourceMap(automationId, createSourceMap());
    mapper.registerSourceFile(sourceFile, sourceContent);

    const mapped = mapper.mapLogEntry(entry);
    expect(mapped).not.toBeNull();
    if (!mapped) return;

    expect(mapped.translatedMessage).toContain("Variable 'foo' ist nicht definiert");
    expect(mapped.suggestions && mapped.suggestions.length).toBeGreaterThan(0);
  });
});

describe("ErrorDisplayFormatter", () => {
  it("formats mapped error for console output with German header and snippet", () => {
    const formatter = new ErrorDisplayFormatter();

    const mappedError = {
      original: {
        automationId: "st_home_testprogram",
        message: "UndefinedError: 'foo' is undefined",
        yamlPath: "action.0",
        logEntry: {
          level: "ERROR",
          timestamp: "2025-01-01T00:00:00Z",
          logger: "template",
          message: "UndefinedError: 'foo' is undefined",
        },
      },
      translatedMessage: "Variable 'foo' ist nicht definiert oder Entity nicht gefunden",
      stLocation: {
        file: "TestProgram.st",
        line: 5,
        column: 1,
        endLine: 5,
        endColumn: 10,
      },
      codeSnippet: {
        lines: [
          { number: 4, content: "line 4", isError: false },
          { number: 5, content: "line 5", isError: true },
        ],
        highlightRange: { start: 1, end: 5 },
      },
      suggestions: [
        "Prüfen Sie, ob die Variable deklariert ist",
      ],
      docLinks: [],
    } satisfies import("./error-types").MappedError;

    const output = formatter.formatForConsole(mappedError);

    expect(output).toContain("Fehler in TestProgram.st Zeile 5");
    expect(output).toContain("Variable 'foo' ist nicht definiert");
    expect(output).toContain("line 5");
    expect(output).toContain("Vorschläge");
  });
});

