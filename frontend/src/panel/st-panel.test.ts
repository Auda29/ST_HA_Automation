import { describe, it, expect } from "vitest";
import "./st-panel";

describe("STPanel", () => {
  it("renders st-editor and shows syntax status based on code-change events", async () => {
    const panel = document.createElement("st-panel") as any;
    document.body.appendChild(panel);

    // Wait for initial render
    await panel.updateComplete;

    const shadowRoot = panel.shadowRoot!;
    const editor = shadowRoot.querySelector("st-editor");
    expect(editor).toBeTruthy();

    // Helper to read status bar text
    const getStatusText = () =>
      shadowRoot.querySelector(".status-bar")?.textContent ?? "";

    // Send clearly invalid ST code and expect a syntax error indicator
    editor!.dispatchEvent(
      new CustomEvent("code-change", {
        detail: { code: "PROGRAM Test" }, // missing END_PROGRAM
        bubbles: true,
        composed: true,
      }),
    );
    await panel.updateComplete;

    expect(getStatusText()).toContain("Syntax Error");

    // Send a minimal valid program and expect Syntax OK
    editor!.dispatchEvent(
      new CustomEvent("code-change", {
        detail: { code: "PROGRAM Test\nEND_PROGRAM" },
        bubbles: true,
        composed: true,
      }),
    );
    await panel.updateComplete;

    expect(getStatusText()).toContain("Syntax OK");
  });
});

