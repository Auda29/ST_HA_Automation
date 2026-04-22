import { describe, expect, it, vi } from "vitest";
import "./st-editor";
import { STEditor } from "./st-editor";

describe("STEditor", () => {
  const createEditor = (initialCode: string) => {
    let code = initialCode;
    const focus = vi.fn();
    const dispatch = vi.fn((transaction: { changes: { from: number; to?: number; insert: string } }) => {
      const { from, to = from, insert } = transaction.changes;
      code = `${code.slice(0, from)}${insert}${code.slice(to)}`;
      editor.code = code;
    });

    const editor = new STEditor() as any;

    editor.code = code;
    editor._editor = {
      state: {
        doc: { toString: () => code },
        selection: { main: { head: 0, from: 0, empty: true } },
      },
      dispatch,
      focus,
    };

    return {
      editor,
      getCode: () => code,
      dispatch,
      focus,
    };
  };

  it("inserts bindings before END_VAR in an existing declaration block", () => {
    const { editor, getCode, focus } = createEditor(
      "PROGRAM Main\nVAR\n    x : INT := 1;\nEND_VAR\nEND_PROGRAM",
    );

    editor.insertBinding("motion AT %I* : BOOL := 'binary_sensor.motion';");

    expect(getCode()).toBe(
      "PROGRAM Main\nVAR\n    x : INT := 1;\n    motion AT %I* : BOOL := 'binary_sensor.motion';\nEND_VAR\nEND_PROGRAM",
    );
    expect(focus).toHaveBeenCalled();
  });

  it("creates a VAR block after the program header when none exists", () => {
    const { editor, getCode } = createEditor("PROGRAM Main\nEND_PROGRAM");

    editor.insertBinding("motion AT %I* : BOOL := 'binary_sensor.motion';");

    expect(getCode()).toBe(
      "PROGRAM Main\nVAR\n    motion AT %I* : BOOL := 'binary_sensor.motion';\nEND_VAR\nEND_PROGRAM",
    );
  });

  it("does not insert duplicate bindings for the same generated syntax", () => {
    const binding = "motion AT %I* : BOOL := 'binary_sensor.motion';";
    const { editor, getCode, dispatch } = createEditor(
      `PROGRAM Main\nVAR\n    ${binding}\nEND_VAR\nEND_PROGRAM`,
    );

    editor.insertBinding(binding);

    expect(getCode()).toBe(
      `PROGRAM Main\nVAR\n    ${binding}\nEND_VAR\nEND_PROGRAM`,
    );
    expect(dispatch).not.toHaveBeenCalled();
  });
});
