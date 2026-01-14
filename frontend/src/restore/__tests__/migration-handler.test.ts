import { describe, it, expect, beforeEach } from "vitest";
import { MigrationDetector, SchemaStorage } from "../migration-handler";
import type { ProgramSchema, VariableSchema } from "../migration-types";
import { RestorePolicy } from "../migration-types";

describe("MigrationDetector", () => {
  const detector = new MigrationDetector();

  const baseSchema: VariableSchema = {
    name: "counter",
    dataType: "INT",
    helperId: "input_number.st_test_counter",
    helperType: "input_number",
    initialValue: 0,
    restorePolicy: RestorePolicy.RESTORE_OR_INIT,
    min: 0,
    max: 100,
  };

  it("returns empty plan for first deployment", () => {
    const newSchema: ProgramSchema = {
      programName: "Test",
      projectName: "home",
      variables: [baseSchema],
      version: "1.0",
      generatedAt: new Date().toISOString(),
    };

    const plan = detector.detectIssues(null, newSchema);

    expect(plan.issues).toHaveLength(0);
    expect(plan.requiresUserInput).toBe(false);
  });

  it("detects added variable", () => {
    const oldSchema: ProgramSchema = {
      programName: "Test",
      projectName: "home",
      variables: [],
      version: "1.0",
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [baseSchema],
    };

    const plan = detector.detectIssues(oldSchema, newSchema);

    expect(plan.issues).toHaveLength(1);
    expect(plan.issues[0]!.type).toBe("added");
    expect(plan.issues[0]!.variable).toBe("counter");
  });

  it("detects removed variable", () => {
    const oldSchema: ProgramSchema = {
      programName: "Test",
      projectName: "home",
      variables: [baseSchema],
      version: "1.0",
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [],
    };

    const plan = detector.detectIssues(oldSchema, newSchema);

    expect(plan.issues).toHaveLength(1);
    expect(plan.issues[0]!.type).toBe("removed");
    expect(plan.issues[0]!.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "delete" }),
        expect.objectContaining({ id: "keep" }),
      ]),
    );
  });

  it("detects type change", () => {
    const oldSchema: ProgramSchema = {
      programName: "Test",
      projectName: "home",
      variables: [baseSchema],
      version: "1.0",
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [
        {
          ...baseSchema,
          dataType: "REAL",
        },
      ],
    };

    const plan = detector.detectIssues(oldSchema, newSchema);

    expect(plan.issues).toHaveLength(1);
    expect(plan.issues[0]!.type).toBe("type_changed");
    expect(plan.issues[0]!.details).toContain("INT");
    expect(plan.issues[0]!.details).toContain("REAL");
  });

  it("detects range change", () => {
    const oldSchema: ProgramSchema = {
      programName: "Test",
      projectName: "home",
      variables: [baseSchema],
      version: "1.0",
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [
        {
          ...baseSchema,
          min: 0,
          max: 1000,
        },
      ],
    };

    const plan = detector.detectIssues(oldSchema, newSchema);

    expect(plan.issues).toHaveLength(1);
    expect(plan.issues[0]!.type).toBe("range_changed");
  });

  it("marks destructive changes and required user input", () => {
    const oldSchema: ProgramSchema = {
      programName: "Test",
      projectName: "home",
      variables: [baseSchema],
      version: "1.0",
      generatedAt: new Date().toISOString(),
    };

    const newSchema: ProgramSchema = {
      ...oldSchema,
      variables: [], // Removed
    };

    const plan = detector.detectIssues(oldSchema, newSchema);

    expect(plan.hasDestructiveChanges).toBe(true);
    expect(plan.requiresUserInput).toBe(true);
  });
});

describe("SchemaStorage", () => {
  let storage: SchemaStorage;

  beforeEach(() => {
    // Simple in-memory localStorage mock for tests
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        Object.keys(store).forEach((k) => delete store[k]);
      },
    };

    storage = new SchemaStorage();
    storage.clear();
  });

  it("saves and loads schema", () => {
    const schema: ProgramSchema = {
      programName: "Test",
      projectName: "home",
      variables: [],
      version: "1.0",
      generatedAt: new Date().toISOString(),
    };

    storage.save("st_test", schema);
    const loaded = storage.load("st_test");

    expect(loaded).toEqual(schema);
  });

  it("returns null for unknown program", () => {
    const loaded = storage.load("unknown");
    expect(loaded).toBeNull();
  });
});

