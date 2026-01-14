import { describe, it, expect } from "vitest";
import {
  extractRestorePolicy,
  evaluateRestorePolicy,
  generateRestoreJinja,
  generateRequireRestoreCondition,
} from "../restore-policy";
import { RestorePolicy } from "../migration-types";
import type { VariableDeclaration } from "../../parser/ast";

describe("Restore Policy Extraction", () => {
  it("returns default policy when no pragma", () => {
    const varDecl: VariableDeclaration = {
      type: "VariableDeclaration",
      name: "counter",
      dataType: { type: "DataType", name: "INT" },
      section: "VAR",
      pragmas: [],
      constant: false,
    } as unknown as VariableDeclaration;

    expect(extractRestorePolicy(varDecl)).toBe(RestorePolicy.RESTORE_OR_INIT);
  });

  it("recognizes reset_on_restart pragma", () => {
    const varDecl: VariableDeclaration = {
      type: "VariableDeclaration",
      name: "session",
      dataType: { type: "DataType", name: "INT" },
      section: "VAR",
      pragmas: [{ type: "Pragma", name: "reset_on_restart" } as any],
      constant: false,
    } as unknown as VariableDeclaration;

    expect(extractRestorePolicy(varDecl)).toBe(RestorePolicy.ALWAYS_INIT);
  });

  it("recognizes require_restore pragma", () => {
    const varDecl: VariableDeclaration = {
      type: "VariableDeclaration",
      name: "critical",
      dataType: { type: "DataType", name: "BOOL" },
      section: "VAR",
      pragmas: [{ type: "Pragma", name: "require_restore" } as any],
      constant: false,
    } as unknown as VariableDeclaration;

    expect(extractRestorePolicy(varDecl)).toBe(RestorePolicy.REQUIRE_RESTORE);
  });
});

describe("Restore Policy Evaluation", () => {
  it("RESTORE_OR_INIT: uses helper value when available", () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.RESTORE_OR_INIT,
        variableName: "counter",
        helperId: "input_number.st_counter",
        initialValue: 0,
        dataType: "INT",
      },
      42,
      true,
    );

    expect(result.value).toBe(42);
    expect(result.source).toBe("restored");
  });

  it("RESTORE_OR_INIT: uses initial when helper unavailable", () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.RESTORE_OR_INIT,
        variableName: "counter",
        helperId: "input_number.st_counter",
        initialValue: 0,
        dataType: "INT",
      },
      null,
      false,
    );

    expect(result.value).toBe(0);
    expect(result.source).toBe("initial");
  });

  it("ALWAYS_INIT: always uses initial value", () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.ALWAYS_INIT,
        variableName: "session",
        helperId: "input_number.st_session",
        initialValue: 0,
        dataType: "INT",
      },
      42,
      true,
    );

    expect(result.value).toBe(0);
    expect(result.source).toBe("initial");
  });

  it("REQUIRE_RESTORE: errors when unavailable", () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.REQUIRE_RESTORE,
        variableName: "critical",
        helperId: "input_boolean.st_critical",
        initialValue: false,
        dataType: "BOOL",
      },
      null,
      false,
    );

    expect(result.source).toBe("error");
    expect(result.message).toContain("require_restore");
  });

  it("REQUIRE_RESTORE: succeeds when available", () => {
    const result = evaluateRestorePolicy(
      {
        policy: RestorePolicy.REQUIRE_RESTORE,
        variableName: "critical",
        helperId: "input_boolean.st_critical",
        initialValue: false,
        dataType: "BOOL",
      },
      true,
      true,
    );

    expect(result.value).toBe(true);
    expect(result.source).toBe("restored");
  });
});

describe("Jinja Generation", () => {
  it("generates constant for ALWAYS_INIT", () => {
    const jinja = generateRestoreJinja({
      policy: RestorePolicy.ALWAYS_INIT,
      variableName: "x",
      helperId: "input_number.x",
      initialValue: 0,
      dataType: "INT",
    });

    expect(jinja).toBe("0");
  });

  it("generates fallback for RESTORE_OR_INIT", () => {
    const jinja = generateRestoreJinja({
      policy: RestorePolicy.RESTORE_OR_INIT,
      variableName: "x",
      helperId: "input_number.st_x",
      initialValue: 42,
      dataType: "INT",
    });

    expect(jinja).toContain("input_number.st_x");
    expect(jinja).toContain("42");
    expect(jinja).toContain("unknown");
  });
});

describe("Require Restore Condition", () => {
  it("returns null when no require_restore", () => {
    const condition = generateRequireRestoreCondition([
      {
        policy: RestorePolicy.RESTORE_OR_INIT,
        variableName: "x",
        helperId: "input_number.x",
        initialValue: 0,
        dataType: "INT",
      },
    ]);

    expect(condition).toBeNull();
  });

  it("generates condition for require_restore", () => {
    const condition = generateRequireRestoreCondition([
      {
        policy: RestorePolicy.REQUIRE_RESTORE,
        variableName: "critical",
        helperId: "input_boolean.st_critical",
        initialValue: false,
        dataType: "BOOL",
      },
    ]);

    expect(condition).not.toBeNull();
    expect((condition as any).condition).toBe("template");
    expect((condition as any).value_template).toContain(
      "input_boolean.st_critical",
    );
  });
});

