import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { undo } from "@codemirror/commands";
import { EditorView } from "@codemirror/view";
import { subscribeEntities } from "home-assistant-js-websocket";
import { STPanel } from "./st-panel";
import { ProjectStorage, type STProjectExplorer, type STFileTree } from "../project";
import type { STEntityBrowser } from "../entity-browser/entity-browser";
import type { STEntityList } from "../entity-browser/entity-list";
import type { STEntityItem } from "../entity-browser/entity-item";
import type { OnlineToolbar } from "../online/online-toolbar";
import { ENTITY_BINDING_MIME_TYPE } from "../entity-binding";

vi.mock("home-assistant-js-websocket", () => ({ subscribeEntities: vi.fn() }));

function getView(panel: STPanel): EditorView {
  return EditorView.findFromDOM(
    panel.shadowRoot!.querySelector("st-editor")!.shadowRoot!.querySelector(".cm-editor")!,
  )!;
}

async function openPanel(hass?: STPanel["hass"]): Promise<STPanel> {
  const panel = new STPanel();
  panel.hass = hass;
  document.body.appendChild(panel);
  await panel.updateComplete;
  const explorer = panel.shadowRoot!.querySelector<STProjectExplorer>("st-project-explorer")!;
  await vi.waitFor(() => expect(explorer.project).toBeTruthy());
  await explorer.updateComplete;
  await explorer.shadowRoot!.querySelector<STFileTree>("st-file-tree")!.updateComplete;
  return panel;
}

describe("STPanel", () => {
  const storage = new ProjectStorage(null, "default");

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(subscribeEntities).mockReset().mockReturnValue(vi.fn());
    // jsdom has no layout engine, so CodeMirror cannot measure a text range.
    Range.prototype.getClientRects ??= () => document.createElement("span").getClientRects();
    Range.prototype.getBoundingClientRect ??= () => new DOMRect();
    document.execCommand ??= () => false;
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

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
    const project = storage.createDefaultProject();
    const main = project.files[0];
    const broken = {
      ...main,
      id: "broken",
      name: "Broken.st",
      path: "Broken.st",
      content: "PROGRAM Broken",
      isOpen: false,
    };
    project.files.push(broken);
    await storage.saveProject(project);

    const panel = await openPanel();
    const explorer = panel.shadowRoot!.querySelector<STProjectExplorer>("st-project-explorer")!;
    const tree = explorer.shadowRoot!.querySelector<STFileTree>("st-file-tree")!;
    const editor = getView(panel);
    editor.dispatch({ changes: { from: 0, insert: "(* autosaved *)\n" } });
    expect((await storage.loadProject())!.files[0].content).toContain("(* autosaved *)");

    tree.shadowRoot!.querySelector<HTMLElement>('[title^="Broken.st"]')!.click();
    await panel.updateComplete;
    expect(editor.state.doc.toString()).toBe(broken.content);
    expect(undo(editor)).toBe(false);
    expect(panel.shadowRoot!.querySelector(".status-bar")?.textContent).toContain("Syntax Error");

    tree.shadowRoot!.querySelector<HTMLElement>('[title^="Main.st"]')!.click();
    await panel.updateComplete;
    expect(editor.state.doc.toString()).toContain("(* autosaved *)");
    expect(panel.shadowRoot!.querySelector(".status-bar")?.textContent).toContain("Syntax OK");

    editor.dispatch({ changes: { from: 0, insert: "(* before reload *)\n" } });
    panel.remove();
    const reloaded = await openPanel();
    expect(getView(reloaded).state.doc.toString()).toContain("(* before reload *)");
    expect((await storage.loadProject())!.files[1].content).toBe(broken.content);
  });

  it("creates separately reachable files and saves keyboard rename and delete", async () => {
    const panel = await openPanel();
    const explorer = panel.shadowRoot!.querySelector<STProjectExplorer>("st-project-explorer")!;
    const tree = explorer.shadowRoot!.querySelector<STFileTree>("st-file-tree")!;
    const create = explorer.shadowRoot!.querySelector<HTMLButtonElement>('[title="New File"]')!;
    create.click();
    await panel.updateComplete;
    create.click();
    await panel.updateComplete;
    await tree.updateComplete;

    const initial = (await storage.loadProject())!;
    expect(initial.files.map((file) => file.name)).toEqual(["Main.st", "NewFile.st", "NewFile2.st"]);
    expect(tree.shadowRoot!.querySelectorAll('[role="treeitem"]')).toHaveLength(3);
    const row = tree.shadowRoot!.querySelector<HTMLElement>('[title^="NewFile.st"]')!;
    row.dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: true }));
    await tree.updateComplete;
    const rename = tree.shadowRoot!.querySelector("input")!;
    expect(tree.shadowRoot!.activeElement).toBe(rename);
    rename.value = "Heating";
    rename.dispatchEvent(new Event("input", { bubbles: true }));
    rename.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    await panel.updateComplete;
    expect((await storage.loadProject())!.activeFileId).toBe(initial.activeFileId);
    expect((await storage.loadProject())!.files.map((file) => file.path)).toContain("Heating.st");

    vi.spyOn(window, "confirm").mockReturnValue(true);
    tree.shadowRoot!.querySelector<HTMLButtonElement>('[aria-label="Delete NewFile2.st"]')!.click();
    await panel.updateComplete;
    const saved = (await storage.loadProject())!;
    expect(saved.files.map((file) => file.name)).toEqual(["Main.st", "Heating.st"]);
    expect(getView(panel).state.doc.toString()).toBe(saved.files.find((file) => file.id === saved.activeFileId)!.content);
  });

  it("keeps both legacy files visible when their stored paths match", async () => {
    const project = storage.createDefaultProject();
    project.files.push({
      ...project.files[0],
      id: "second",
      content: "PROGRAM Second\nEND_PROGRAM",
      isOpen: false,
    });
    await storage.saveProject(project);
    const panel = await openPanel();
    const explorer = panel.shadowRoot!.querySelector<STProjectExplorer>("st-project-explorer")!;
    const tree = explorer.shadowRoot!.querySelector<STFileTree>("st-file-tree")!;
    const rows = tree.shadowRoot!.querySelectorAll<HTMLElement>('[role="treeitem"]');
    expect(rows).toHaveLength(2);
    rows[1].click();
    expect(getView(panel).state.doc.toString()).toContain("PROGRAM Second");
    rows[0].click();
    expect(getView(panel).state.doc.toString()).toContain("PROGRAM Main");
  });

  it("keeps edits in memory if browser storage fails and saves them on the next edit", async () => {
    const panel = await openPanel();
    const editor = getView(panel);
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });
    editor.dispatch({ changes: { from: 0, insert: "(* first edit *)\n" } });

    await vi.waitFor(() => expect(panel.shadowRoot!.querySelector(".deploy-feedback")?.textContent)
      .toContain("Could not save this project in browser storage"));
    expect(editor.state.doc.toString()).toContain("first edit");
    expect(panel.shadowRoot!.querySelector(".unsaved-dot")).toBeTruthy();

    editor.dispatch({ changes: { from: 0, insert: "(* second edit *)\n" } });
    expect((await storage.loadProject())!.files[0].content).toContain("(* second edit *)\n(* first edit *)");
    await vi.waitFor(() => expect(panel.shadowRoot!.querySelector(".unsaved-dot")).toBeNull());
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
    expect(panel.shadowRoot?.querySelector(".tab")?.textContent).toContain("Broken");
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

  it("reopens the fallback file when deleting the active file", async () => {
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
          name: "Closed.st",
          path: "Closed.st",
          content: "PROGRAM Closed\nEND_PROGRAM",
          lastModified: Date.now(),
          isOpen: false,
          hasUnsavedChanges: false,
        },
      ],
      activeFileId: "file_1",
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    document.body.appendChild(panel);

    await panel.updateComplete;

    panel._handleFileDeleted(
      new CustomEvent("file-deleted", {
        detail: { fileId: "file_1" },
      }),
    );
    await panel.updateComplete;

    expect(panel._project.activeFileId).toBe("file_2");
    expect(panel._project.files[0].isOpen).toBe(true);
    expect(panel.shadowRoot?.querySelectorAll(".tab").length).toBe(1);
  });

  it("forwards online toolbar settings to the editor", async () => {
    const panel = document.createElement("st-panel") as any;
    document.body.appendChild(panel);
    await panel.updateComplete;

    const editor = panel.shadowRoot?.querySelector("st-editor") as any;
    editor.setOnlineSettings = vi.fn();
    editor.getOnlineState = vi.fn().mockReturnValue({
      status: "disconnected",
      bindings: [],
      liveValues: new Map(),
      updateRate: 250,
      showConditions: true,
      highlightChanges: true,
    });

    panel._handleOnlineSettingChange(
      new CustomEvent("setting-change", {
        detail: { setting: "updateRate", value: 250 },
      }),
    );

    expect(editor.setOnlineSettings).toHaveBeenCalledWith({
      updateRate: 250,
      showConditions: undefined,
      highlightChanges: undefined,
    });
    expect(panel._onlineState.updateRate).toBe(250);
  });

  it("inserts and removes an entity binding through browser controls and reports the result", async () => {
    const entityId = "binary_sensor.test_motion";
    const project = storage.createDefaultProject();
    project.files[0].content = `PROGRAM Main
VAR
  reference : STRING := '${entityId}';
END_VAR
END_PROGRAM`;
    await storage.saveProject(project);
    const panel = await openPanel({
      connection: {},
      states: {
        [entityId]: { entity_id: entityId, state: "off", attributes: {} },
      },
    });
    panel.shadowRoot!.querySelector<HTMLButtonElement>('[aria-label="Toggle entity browser"]')!.click();
    const browser = await vi.waitFor(() => {
      const browser = panel.shadowRoot!.querySelector<STEntityBrowser>("st-entity-browser");
      expect(browser).toBeTruthy();
      return browser!;
    });
    await browser.updateComplete;

    const search = browser.shadowRoot!.querySelector<HTMLInputElement>('input[type="text"]')!;
    search.value = entityId;
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await browser.updateComplete;
    const list = browser.shadowRoot!.querySelector<STEntityList>("st-entity-list")!;
    await list.updateComplete;
    const item = list.shadowRoot!.querySelector<STEntityItem>("st-entity-item")!;
    await item.updateComplete;
    const removeButton = () => item.shadowRoot!.querySelector<HTMLButtonElement>('[aria-label^="Remove binding"]');
    const feedback = () => browser.shadowRoot!.querySelector('[role="status"]')?.textContent;
    expect(removeButton()).toBeNull();

    const insert = item.shadowRoot!.querySelector<HTMLButtonElement>('[aria-label^="Insert input binding"]')!;
    insert.click();
    await vi.waitFor(() => expect(removeButton()).toBeTruthy());
    expect(feedback()).toContain("Inserted input binding");
    expect((await storage.loadProject())!.files[0].content).toContain("testMotion AT %I*");

    insert.click();
    await browser.updateComplete;
    expect(feedback()).toContain("already has an input binding");

    removeButton()!.click();
    await vi.waitFor(() => expect(removeButton()).toBeNull());
    expect(feedback()).toContain("Removed binding");
    expect((await storage.loadProject())!.files[0].content).toBe(project.files[0].content);

    const data = new Map<string, string>();
    const dataTransfer = {
      getData: (type: string) => data.get(type) ?? "",
      setData: (type: string, value: string) => data.set(type, value),
    };
    const dragStart = new Event("dragstart", { bubbles: true });
    Object.defineProperty(dragStart, "dataTransfer", { value: dataTransfer });
    item.shadowRoot!.querySelector("[draggable]")!.dispatchEvent(dragStart);
    expect(dataTransfer.getData(ENTITY_BINDING_MIME_TYPE)).toContain(entityId);
    const drop = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(drop, "dataTransfer", { value: dataTransfer });
    getView(panel).contentDOM.dispatchEvent(drop);
    await browser.updateComplete;
    expect(feedback()).toContain("Inserted input binding");
    expect((await storage.loadProject())!.files[0].content).toContain(
      `  testMotion AT %I* : BOOL := '${entityId}';\nEND_VAR`,
    );
  });

  it("stops the old online subscription on file and connection changes and allows reconnection", async () => {
    const firstConnection = {};
    const secondConnection = {};
    const unsubscribe = vi.fn();
    vi.mocked(subscribeEntities).mockReturnValue(unsubscribe);

    const project = storage.migrateFromSingleFile(
      "PROGRAM Main\nVAR\n  motion AT %I* : BOOL := 'binary_sensor.motion';\nEND_VAR\nEND_PROGRAM",
    );
    await storage.saveProject(project);
    const panel = await openPanel({ connection: firstConnection });
    const toolbar = panel.shadowRoot!.querySelector<OnlineToolbar>("st-online-toolbar")!;
    const connect = async () => {
      toolbar.dispatchEvent(new CustomEvent("connect"));
      await vi.waitFor(() => expect(toolbar.state.status).toBe("online"));
    };

    await connect();
    expect(subscribeEntities).toHaveBeenCalledWith(firstConnection, expect.any(Function));

    const explorer = panel.shadowRoot!.querySelector<STProjectExplorer>("st-project-explorer")!;
    explorer.shadowRoot!.querySelector<HTMLButtonElement>('[title="New File"]')!.click();
    await panel.updateComplete;
    expect(toolbar.state.status).toBe("disconnected");
    expect(unsubscribe).toHaveBeenCalledTimes(1);

    toolbar.dispatchEvent(new CustomEvent("connect"));
    await panel.updateComplete;
    expect(panel.shadowRoot!.querySelector(".deploy-feedback")?.textContent)
      .toContain("Add an entity binding before connecting live values.");
    const editor = getView(panel);
    const declarationsEnd = editor.state.doc.toString().indexOf("END_VAR");
    editor.dispatch({
      changes: {
        from: declarationsEnd,
        insert: "  motion AT %I* : BOOL := 'binary_sensor.motion';\n",
      },
    });
    await connect();
    panel.hass = { connection: secondConnection };
    await vi.waitFor(() => expect(toolbar.state.status).toBe("disconnected"));
    expect(unsubscribe).toHaveBeenCalledTimes(2);
    await connect();
    expect(subscribeEntities).toHaveBeenLastCalledWith(secondConnection, expect.any(Function));

    panel.remove();
    expect(unsubscribe).toHaveBeenCalledTimes(3);
    document.body.appendChild(panel);
    await panel.updateComplete;
    expect(getView(panel).state.doc.toString()).toContain("PROGRAM NewFile");
    expect(toolbar.state.status).toBe("disconnected");
  });
});
