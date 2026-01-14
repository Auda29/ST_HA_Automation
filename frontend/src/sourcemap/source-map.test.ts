import { describe, it, expect } from "vitest";
import {
  SourceMapBuilder,
  SourceMapReader,
} from "./source-map";
import type { SourceMap } from "./source-map-types";

describe("SourceMapBuilder and SourceMapReader", () => {
  const project = "home";
  const program = "TestProgram";
  const sourceFile = "TestProgram.st";
  const sourceContent = [
    "PROGRAM TestProgram",
    "VAR",
    "  x : INT;",
    "END_VAR",
    "x := x + 1;",
    "END_PROGRAM",
  ].join("\n");

  it("records mappings using current path and explicit paths", () => {
    const builder = new SourceMapBuilder({
      project,
      program,
      sourceFile,
      sourceContent,
    });

    // Record via current path helpers
    builder.withPath("action", () => {
      builder.withPath(0, () => {
        builder.record({ line: 5, column: 1 }, "increment assignment");
      });
    });

    // Record via explicit path
    builder.recordAt(
      "trigger.0",
      { line: 3, column: 3 },
      "trigger condition",
    );

    const map = builder.build("st_home_testprogram");

    expect(map.mappings["action.0"]).toBeDefined();
    expect(map.mappings["action.0"]!.st.line).toBe(5);
    expect(map.mappings["action.0"]!.description).toBe("increment assignment");

    expect(map.mappings["trigger.0"]).toBeDefined();
    expect(map.mappings["trigger.0"]!.st.line).toBe(3);
    expect(map.mappings["trigger.0"]!.description).toBe("trigger condition");
  });

  it("looks up mappings by exact and parent YAML path", () => {
    const builder = new SourceMapBuilder({
      project,
      program,
      sourceFile,
      sourceContent,
    });

    builder.recordAt("action.0", { line: 5, column: 1 }, "base action");

    const map = builder.build("st_home_testprogram");
    const reader = new SourceMapReader(map);

    // Exact match
    const exact = reader.lookup("action.0");
    expect(exact).not.toBeNull();
    expect(exact!.st.line).toBe(5);

    // Child path should fall back to parent
    const child = reader.lookup("action.0.sequence.0");
    expect(child).not.toBeNull();
    expect(child!.st.line).toBe(5);
  });

  it("finds mappings by prefix and by ST line", () => {
    const builder = new SourceMapBuilder({
      project,
      program,
      sourceFile,
      sourceContent,
    });

    builder.recordAt("action.0", { line: 5, column: 1 }, "first");
    builder.recordAt("action.1", { line: 5, column: 10 }, "second");
    builder.recordAt("trigger.0", { line: 3, column: 3 }, "trigger");

    const map = builder.build("st_home_testprogram");
    const reader = new SourceMapReader(map);

    const actions = reader.findByPrefix("action");
    expect(actions.length).toBe(2);
    const linesAt5 = reader.findByLine(sourceFile, 5);
    expect(linesAt5.length).toBe(2);
    const linesAt3 = reader.findByLine(sourceFile, 3);
    expect(linesAt3.length).toBe(1);
  });

  it("validates source hash against current content", () => {
    const builder = new SourceMapBuilder({
      project,
      program,
      sourceFile,
      sourceContent,
    });
    builder.recordAt("action.0", { line: 5, column: 1 }, "sample");

    const mapWithHash: SourceMap = builder.build("st_home_testprogram");
    const reader = new SourceMapReader(mapWithHash);

    // Same content → hash must validate
    expect(reader.validateHash(sourceContent)).toBe(true);

    // Different content → hash must fail
    const modifiedSource = sourceContent + "\n// modified";
    expect(reader.validateHash(modifiedSource)).toBe(false);
  });

  it("builds embedded source map payload", () => {
    const builder = new SourceMapBuilder({
      project,
      program,
      sourceFile,
      sourceContent,
    });
    builder.recordAt("action.0", { line: 5, column: 1 }, "embedded");

    const embedded = builder.buildEmbedded();
    expect(embedded._st_source_map["action.0"]).toBeDefined();
    expect(embedded._st_source_file).toBe(sourceFile);
    expect(typeof embedded._st_source_hash).toBe("string");
  });
});

