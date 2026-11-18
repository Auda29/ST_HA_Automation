import { describe, expect, it, vi } from "vitest";
import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import "./st-editor";
import { STEditor } from "./st-editor";
import { stCompletion } from "./st-language";
import { parse } from "../parser";

describe("STEditor", () => {
  it("inserts a valid PROGRAM snippet with an editable program name", async () => {
    const state = EditorState.create({ doc: "PROG" });
    const result = await stCompletion(new CompletionContext(state, 4, true));
    const completion = result?.options.find(({ label }) => label === "PROGRAM");
    if (!completion || typeof completion.apply !== "function") {
      throw new Error("PROGRAM completion must apply a snippet");
    }

    const view = new EditorView({ state });
    try {
      completion.apply(view, completion, 0, 4);
      expect(parse(view.state.doc.toString()).success).toBe(true);
      const { from, to } = view.state.selection.main;
      expect(view.state.sliceDoc(from, to)).toBe("ProgramName");
    } finally {
      view.destroy();
    }
  });

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

  it("inserts into the matching direction section with an unused ST variable name", () => {
    const { editor, getCode } = createEditor(
      "PROGRAM Main\nVAR_INPUT\n    relay : BOOL;\nEND_VAR\nVAR_OUTPUT\nEND_VAR\nEND_PROGRAM",
    );

    editor.insertBinding("Relay AT %Q* : BOOL := 'switch.relay';");

    expect(getCode()).toContain("VAR_OUTPUT\n    Relay_2 AT %Q* : BOOL := 'switch.relay';\nEND_VAR");
  });

  it("recognizes an existing entity binding even with a different address, name and layout", () => {
    const { editor, dispatch } = createEditor(
      "PROGRAM Main\nVAR\n  movement : BOOL :=\n    'binary_sensor.motion' AT %I0.0;\nEND_VAR\nEND_PROGRAM",
    );

    expect(editor.insertBinding("motion AT %I* : BOOL := 'binary_sensor.motion';")).toContain(
      "already has an input binding",
    );
    expect(dispatch).not.toHaveBeenCalled();
  });
});
