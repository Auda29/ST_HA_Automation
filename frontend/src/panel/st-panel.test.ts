import { describe, it, expect, vi } from "vitest";
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

  it("renders the online toolbar in disconnected state before connecting", async () => {
    const panel = document.createElement("st-panel") as any;
    document.body.appendChild(panel);

    await panel.updateComplete;

    const toolbar = panel.shadowRoot?.querySelector("st-online-toolbar") as any;
    expect(toolbar).toBeTruthy();
    expect(toolbar.state.status).toBe("disconnected");
  });

  it("switches files on file-selected and preserves edited content", async () => {
    const panel = document.createElement("st-panel") as any;
    panel._project = {
      id: "project_1",
      name: "My ST Project",
      files: [
        {
          id: "file_1",
          name: "Main.st",
          path: "Main.st",
          content: "PROGRAM Main\nEND_PROGRAM",
          lastModified: Date.now(),
          isOpen: true,
          hasUnsavedChanges: false,
        },
        {
          id: "file_2",
          name: "NewFile.st",
          path: "NewFile.st",
          content: "PROGRAM NewFile\nEND_PROGRAM",
          lastModified: Date.now(),
          isOpen: true,
          hasUnsavedChanges: false,
        },
      ],
      activeFileId: "file_1",
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    document.body.appendChild(panel);

    await panel.updateComplete;

    const editor = panel.shadowRoot?.querySelector("st-editor") as any;
    expect(editor).toBeTruthy();

    editor.setCode("PROGRAM Main\nVAR\n  x : INT := 1;\nEND_VAR\nEND_PROGRAM");
    await editor.updateComplete;

    panel._handleFileSelected(
      new CustomEvent("file-selected", {
        detail: { fileId: "file_2" },
      }),
    );
    await panel.updateComplete;
    await editor.updateComplete;

    expect(panel._project.activeFileId).toBe("file_2");
    expect(panel._project.files.find((f: any) => f.id === "file_1").content).toContain(
      "x : INT := 1;",
    );
    expect(editor.getCode()).toBe("PROGRAM NewFile\nEND_PROGRAM");
  });

  it("shows an empty state instead of legacy example code when all files are closed", async () => {
    const panel = document.createElement("st-panel") as any;
    panel._project = {
      id: "project_1",
      name: "My ST Project",
      files: [
        {
          id: "file_1",
          name: "Main.st",
          path: "Main.st",
          content: "PROGRAM Main\nEND_PROGRAM",
          lastModified: Date.now(),
          isOpen: true,
          hasUnsavedChanges: false,
        },
      ],
      activeFileId: "file_1",
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    document.body.appendChild(panel);

    await panel.updateComplete;

    panel._closeFile("file_1");
    await panel.updateComplete;

    expect(panel._project.activeFileId).toBeNull();
    expect(panel._getCurrentCode()).toBe("");
    expect(panel.shadowRoot?.querySelector("st-editor")).toBeNull();
    expect(panel.shadowRoot?.querySelector(".empty-editor")?.textContent).toContain(
      "All files are closed",
    );
  });

  it("shows visible deploy feedback when deployment is blocked by syntax errors", async () => {
    const panel = document.createElement("st-panel") as any;
    document.body.appendChild(panel);

    await panel.updateComplete;
    panel._syntaxOk = false;
    await panel.updateComplete;

    const deployButton = panel.shadowRoot?.querySelector(".deploy-button") as HTMLButtonElement;
    expect(deployButton.disabled).toBe(false);
    deployButton.click();

    await panel.updateComplete;

    const feedback = panel.shadowRoot?.querySelector(".deploy-feedback");
    expect(feedback?.textContent).toContain(
      "Cannot deploy while syntax errors are present",
    );
  });

  it("shows visible deploy feedback when Home Assistant connection is unavailable", async () => {
    const panel = document.createElement("st-panel") as any;
    panel._syntaxOk = true;
    panel.hass = null;
    document.body.appendChild(panel);

    await panel.updateComplete;

    await panel._handleDeploy();
    await panel.updateComplete;

    const feedback = panel.shadowRoot?.querySelector(".deploy-feedback");
    expect(feedback?.textContent).toContain(
      "Home Assistant connection is not available",
    );
  });

  it("re-analyzes restored projects and reopens the active tab on load", async () => {
    const panel = document.createElement("st-panel") as any;
    panel._storage = {
      loadProject: vi.fn().mockResolvedValue({
        id: "project_1",
        name: "My ST Project",
        files: [
          {
            id: "file_1",
            name: "Main.st",
            path: "Main.st",
            content: "PROGRAM Main\nEND_PROGRAM",
            lastModified: Date.now(),
            isOpen: false,
            hasUnsavedChanges: false,
          },
          {
            id: "file_2",
            name: "Broken.st",
            path: "Broken.st",
            content: "PROGRAM Broken",
            lastModified: Date.now(),
            isOpen: false,
            hasUnsavedChanges: false,
          },
        ],
        activeFileId: "file_2",
        createdAt: Date.now(),
        lastModified: Date.now(),
      }),
      saveProject: vi.fn(),
    };
    document.body.appendChild(panel);

    await panel._initializeProject();
    await panel.updateComplete;

    expect(panel._project.files.find((f: any) => f.id === "file_2").isOpen).toBe(true);
    expect(panel.shadowRoot?.querySelectorAll(".tab").length).toBe(1);
    expect(panel.shadowRoot?.querySelector(".tab")?.textContent).toContain("Broken.st");
    expect(panel._syntaxOk).toBe(false);
    expect(panel._diagnostics.length).toBeGreaterThan(0);
  });

  it("clears unsaved markers after a successful project save", async () => {
    const panel = document.createElement("st-panel") as any;
    panel._project = {
      id: "project_1",
      name: "My ST Project",
      files: [
        {
          id: "file_1",
          name: "Main.st",
          path: "Main.st",
          content: "PROGRAM Main\nEND_PROGRAM",
          lastModified: Date.now(),
          isOpen: true,
          hasUnsavedChanges: true,
        },
      ],
      activeFileId: "file_1",
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    panel._storage = {
      saveProject: vi.fn().mockResolvedValue(undefined),
    };

    await panel._saveProject();

    expect(panel._project.files[0].hasUnsavedChanges).toBe(false);
  });
});

