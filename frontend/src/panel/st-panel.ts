import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../editor";
import "../online/online-toolbar";
// Entity browser and project explorer are lazy loaded when shown
// import "../entity-browser";
// import "../project";
import { parse } from "../parser";
import { analyzeDependencies } from "../analyzer";
import type {
  TriggerConfig,
  AnalysisMetadata,
  EntityDependency,
} from "../analyzer/types";
// Transpiler and deploy are lazy loaded when deploy is triggered
// import { transpile } from "../transpiler";
// import { deploy, HAApiClient } from "../deploy";
import type { VariableBinding, OnlineModeState } from "../online/types";
import type { STEditor } from "../editor/st-editor";
import type { ProjectStructure, ProjectFile } from "../project/types";
import type { ProjectStorage } from "../project";

interface CombinedDiagnostic {
  severity: "Error" | "Warning" | "Info" | "Hint";
  code?: string;
  message: string;
  line?: number;
  column?: number;
}

@customElement("st-panel")
export class STPanel extends LitElement {
  @property({ attribute: false }) declare public hass?: any;
  @property({ type: Boolean }) declare public narrow: boolean;

  @state() declare private _code: string; // Legacy single-file mode
  @state() declare private _project: ProjectStructure | null; // Multi-file mode
  @state() declare private _syntaxOk: boolean;
  @state() declare private _triggers: TriggerConfig[];
  @state() declare private _diagnostics: CombinedDiagnostic[];
  @state() declare private _metadata: AnalysisMetadata | null;
  @state() declare private _entityCount: number;
  @state() declare private _onlineState: OnlineModeState | null;
  @state() declare private _showEntityBrowser: boolean;
  @state() declare private _showProjectExplorer: boolean;
  @state() declare private _storage: ProjectStorage | null;
  private _entityBrowserLoaded = false;
  private _projectExplorerLoaded = false;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--ui-bg, var(--primary-background-color));
      color: var(--ui-text-primary, var(--primary-text-color));
      font-family: var(--font-ui, var(--paper-font-common-base_-_font-family));
    }
    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      width: var(--sidebar-width-default, 320px);
      min-width: var(--sidebar-width-min, 240px);
      max-width: var(--sidebar-width-max, 400px);
      border-right: 1px solid var(--ui-divider, var(--divider-color));
      display: flex;
      flex-direction: column;
      background: var(--ui-bg-card, var(--card-background-color));
      overflow: hidden;
    }
    .sidebar.hidden {
      display: none;
    }
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2, 8px) var(--space-4, 16px);
      background: var(--ui-bg-header, var(--app-header-background-color));
      color: var(--ui-text-header, var(--app-header-text-color));
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
    }
    .toolbar h1 {
      margin: 0;
      font-size: var(--font-size-2xl, 20px);
      font-weight: var(--font-weight-normal, 400);
      letter-spacing: -0.2px;
      font-family: var(--font-ui, inherit);
    }
    .toolbar-actions {
      display: flex;
      gap: var(--space-2, 8px);
      align-items: center;
    }
    .toolbar-button {
      padding: 6px var(--space-3, 12px);
      border: 1px solid color-mix(in srgb, var(--ui-text-header, #fff) 40%, transparent);
      border-radius: var(--radius-md, 4px);
      background: color-mix(in srgb, var(--ui-text-header, #fff) 15%, transparent);
      color: var(--ui-text-header, #fff);
      cursor: pointer;
      font-size: var(--font-size-md, 14px);
      font-family: var(--font-ui, inherit);
      display: flex;
      align-items: center;
      gap: var(--space-1, 4px);
      transition: var(--transition-fast, background-color 0.2s ease);
    }
    .toolbar-button:hover {
      background: color-mix(in srgb, var(--ui-text-header, #fff) 25%, transparent);
    }
    .toolbar-button.active {
      background: color-mix(in srgb, var(--ui-text-header, #fff) 35%, transparent);
      border-color: color-mix(in srgb, var(--ui-text-header, #fff) 60%, transparent);
    }
    .toolbar-button:focus-visible {
      outline: 2px solid var(--ui-text-header, #fff);
      outline-offset: 2px;
    }
    .editor-container {
      flex: 1;
      overflow: hidden;
      padding: var(--space-4, 16px);
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--ui-bg-secondary, #e5e5e5) 32%, transparent),
        transparent 32%
      );
    }
    st-editor {
      height: 100%;
      border-radius: var(--radius-md, 4px);
      box-shadow: var(--shadow-popover, 0 4px 12px rgba(0, 0, 0, 0.2));
    }
    .status-bar {
      display: flex;
      gap: var(--space-4, 16px);
      padding: 6px var(--space-4, 16px);
      background: var(--ui-bg-card, var(--card-background-color));
      border-top: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 12px);
      flex-wrap: wrap;
      align-items: center;
      font-family: var(--font-ui, inherit);
    }
    .status-ok {
      color: var(--ui-success, var(--success-color, #4caf50));
    }
    .status-error {
      color: var(--ui-error, var(--error-color, #f44336));
    }
    .status-warning {
      color: var(--ui-warning, var(--warning-color, #ff9800));
    }
    .deploy-button {
      padding: var(--space-2, 8px) var(--space-4, 16px);
      border: none;
      border-radius: var(--radius-md, 4px);
      background: var(--ui-text-header, #fff);
      color: var(--ui-bg-header, #03a9f4);
      cursor: pointer;
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-bold, 700);
      font-family: var(--font-ui, inherit);
    }
    .deploy-button:hover:not(:disabled) {
      opacity: 0.9;
    }
    .deploy-button:focus-visible {
      outline: 2px solid var(--ui-text-header, #fff);
      outline-offset: 2px;
    }
    .deploy-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .diagnostics-panel {
      max-height: 130px;
      overflow-y: auto;
      padding: 6px var(--space-4, 16px);
      background: var(--ui-bg-card, var(--card-background-color));
      border-top: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 12px);
      font-family: var(--font-mono, "Fira Code", "Consolas", "Courier New", monospace);
    }
    .diagnostic {
      padding: 2px 0;
    }
    .diagnostic-error {
      color: var(--error-color, #f44336);
    }
    .diagnostic-warning {
      color: var(--warning-color, #ff9800);
    }
    .diagnostic-info {
      color: var(--info-color, #2196f3);
    }
    .diagnostic-hint {
      color: var(--disabled-text-color, #9e9e9e);
    }
    .tabs-container {
      display: flex;
      gap: 2px;
      padding: 0 var(--space-2, 8px);
      background: var(--ui-bg-card, var(--card-background-color));
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      overflow-x: auto;
    }
    .tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: var(--ui-bg-card, var(--card-background-color));
      color: var(--ui-text-primary, var(--primary-text-color));
      cursor: pointer;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: var(--font-size-base, 13px);
      font-family: var(--font-ui, inherit);
      white-space: nowrap;
      transition: all 0.2s;
    }
    .tab:hover {
      background: color-mix(in srgb, var(--ui-primary, #03a9f4) 8%, var(--ui-bg-card, #fff));
    }
    .tab.active {
      background: var(--ui-bg, var(--primary-background-color));
      border-bottom-color: var(--ui-primary, var(--primary-color));
      color: var(--ui-text-primary, var(--primary-text-color));
    }
    .tab-close {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
      opacity: 0.6;
    }
    .tab-close:hover {
      opacity: 1;
      background: var(--ui-divider, var(--divider-color));
    }
    .unsaved-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--ui-warning, var(--warning-color, #ff9800));
    }
    .project-sidebar {
      width: 280px;
      min-width: 240px;
      max-width: 360px;
      border-right: 1px solid var(--ui-divider, var(--divider-color));
      display: flex;
      flex-direction: column;
      background: var(--ui-bg-card, var(--card-background-color));
    }
    .project-sidebar.hidden {
      display: none;
    }
  `;

  constructor() {
    super();
    this.narrow = false;
    this._showEntityBrowser = false;
    this._showProjectExplorer = false;
    this._project = null;
    this._storage = null;
    this._code = `{mode: restart}
{throttle: T#1s}
PROGRAM Kitchen_Light
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';

    {no_trigger}
    temperature AT %I* : REAL := 'sensor.kitchen_temperature';

    {persistent}
    activationCount : INT := 0;

    light AT %Q* : BOOL := 'light.kitchen';
END_VAR

(* Main logic *)
IF motion THEN
    light := TRUE;
    activationCount := activationCount + 1;
ELSE
    light := FALSE;
END_IF

END_PROGRAM`;
    this._syntaxOk = true;
    this._triggers = [];
    this._diagnostics = [];
    this._metadata = null;
    this._entityCount = 0;
    this._onlineState = this._createDisconnectedOnlineState();
  }

  connectedCallback() {
    super.connectedCallback();
    this._initializeProject();
    // Run initial analysis
    this._analyzeCode();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has("hass")) {
      this._initializeStorage().then(() => {
        if (!this._project) {
          this._initializeProject();
        }
      });
    }
  }

  private async _initializeStorage(): Promise<void> {
    if (this._storage) return; // Already initialized
    
    // Lazy load ProjectStorage module
    const { ProjectStorage } = await import("../project");
    
    if (this.hass?.connection) {
      const configEntryId = this.hass.config?.entry_id || "default";
      this._storage = new ProjectStorage(this.hass.connection, configEntryId);
    } else {
      this._storage = new ProjectStorage(null, "default");
    }
  }

  private async _initializeProject(): Promise<void> {
    if (!this._storage) {
      await this._initializeStorage();
    }

    if (this._storage) {
      try {
        const project = await this._storage.loadProject();
        if (project) {
          this._project = project;
          // Open the active file if any
          if (project.activeFileId) {
            const activeFile = project.files.find(
              (f) => f.id === project.activeFileId,
            );
            if (activeFile) {
              this._code = activeFile.content;
            }
          }
        } else {
          // Migrate from single-file mode
          this._project = this._storage.migrateFromSingleFile(this._code);
          await this._storage.saveProject(this._project);
        }
      } catch (error) {
        console.error("Failed to load project", error);
        // Fall back to single-file mode
      }
    }
  }

  render() {
    const errorCount = this._diagnostics.filter(
      (d) => d.severity === "Error",
    ).length;
    const warningCount = this._diagnostics.filter(
      (d) => d.severity === "Warning",
    ).length;

    return html`
      <div class="container">
        <div class="toolbar">
          <h1>ST for Home Assistant</h1>
          <div class="toolbar-actions">
            <button
              class="toolbar-button ${this._showProjectExplorer
                ? "active"
                : ""}"
              @click=${this._toggleProjectExplorer}
              title="Toggle Project Explorer"
            >
              <ha-icon icon="mdi:folder"></ha-icon>
              Project
            </button>
            <button
              class="toolbar-button ${this._showEntityBrowser ? "active" : ""}"
              @click=${this._toggleEntityBrowser}
              title="Toggle Entity Browser"
            >
              <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
              Entities
            </button>
            <button class="deploy-button" @click=${this._handleDeploy} ?disabled=${!this._syntaxOk}>
              ▶ Deploy
            </button>
          </div>
        </div>
        <st-online-toolbar
          .state=${this._onlineState ?? this._createDisconnectedOnlineState()}
          @connect=${this._handleOnlineConnect}
          @disconnect=${this._handleOnlineDisconnect}
          @toggle-pause=${this._handleOnlineTogglePause}
          @setting-change=${this._handleOnlineSettingChange}
        ></st-online-toolbar>
        <div class="main-content">
          ${this._showProjectExplorer
            ? html`
                <div class="project-sidebar">
                  <st-project-explorer
                    .hass=${this.hass}
                    .project=${this._project}
                    @file-open=${this._handleFileOpen}
                    @file-selected=${this._handleFileSelected}
                    @file-rename=${this._handleFileRename}
                    @file-deleted=${this._handleFileDeleted}
                    @file-created=${this._handleFileCreated}
                  ></st-project-explorer>
                </div>
              `
            : ""}
          <div class="sidebar ${this._showEntityBrowser ? "" : "hidden"}">
            <st-entity-browser .hass=${this.hass}></st-entity-browser>
          </div>
          <div class="content-area">
            ${this._project
              ? html`
                  <div class="tabs-container">
                    ${this._getOpenFiles().map(
                      (file) => html`
                        <button
                          class="tab ${file.id === this._project!.activeFileId
                            ? "active"
                            : ""}"
                          @click=${() => this._switchToFile(file.id)}
                          title=${file.path}
                        >
                          <span>${file.name}</span>
                          ${file.hasUnsavedChanges
                            ? html`<div class="unsaved-dot"></div>`
                            : ""}
                          <div
                            class="tab-close"
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              this._closeFile(file.id);
                            }}
                            title="Close"
                          >
                            <ha-icon
                              icon="mdi:close"
                              style="width: 12px; height: 12px;"
                            ></ha-icon>
                          </div>
                        </button>
                      `,
                    )}
                  </div>
                `
              : ""}
            <div class="editor-container">
              <st-editor
                .code=${this._getCurrentCode()}
                .hass=${this.hass}
                @code-change=${this._handleCodeChange}
              ></st-editor>
            </div>
          </div>
        </div>
        ${this._diagnostics.length > 0
          ? html`
              <div class="diagnostics-panel">
                ${this._diagnostics.map(
                  (d) => html`
                    <div
                      class="diagnostic diagnostic-${d.severity.toLowerCase()}"
                    >
                      ${d.line ? `[${d.line}:${d.column || 0}] ` : ""}${d.code
                        ? `${d.code}: `
                        : ""}${d.message}
                    </div>
                  `,
                )}
              </div>
            `
          : ""}
        <div class="status-bar">
          ${this._syntaxOk
            ? html`<span class="status-ok">✓ Syntax OK</span>`
            : html`<span class="status-error">✗ Syntax Error</span>`}
          ${errorCount > 0
            ? html`<span class="status-error">${errorCount} Error(s)</span>`
            : ""}
          ${warningCount > 0
            ? html`<span class="status-warning"
                >${warningCount} Warning(s)</span
              >`
            : ""}
          <span>Triggers: ${this._triggers.length}</span>
          <span>Entities: ${this._entityCount}</span>
          ${this._metadata?.mode
            ? html`<span>Mode: ${this._metadata.mode}</span>`
            : ""}
          ${this._metadata?.hasPersistentVars
            ? html`<span>💾 Persistent</span>`
            : ""}
          ${this._metadata?.hasTimers ? html`<span>⏱️ Timers</span>` : ""}
        </div>
      </div>
    `;
  }

  private _handleCodeChange(e: CustomEvent<{ code: string }>) {
    const newCode = e.detail.code;

    if (this._project && this._project.activeFileId) {
      // Update active file in project
      const activeFile = this._project.files.find(
        (f) => f.id === this._project!.activeFileId,
      );
      if (activeFile) {
        activeFile.content = newCode;
        // Mark as unsaved if content differs from what was last saved
        // We'll track the "saved" state separately - for now, mark as unsaved if changed
        activeFile.hasUnsavedChanges = true; // Will be cleared on save
        activeFile.lastModified = Date.now();
        this._project.lastModified = Date.now();
        // Don't auto-save on every keystroke - just update in-memory state
      }
    } else {
      // Legacy single-file mode
      this._code = newCode;
    }

    this._analyzeCode();
  }

  private _getCurrentCode(): string {
    if (this._project && this._project.activeFileId) {
      const activeFile = this._project.files.find(
        (f) => f.id === this._project!.activeFileId,
      );
      return activeFile?.content || "";
    }
    return this._code;
  }

  private _createDisconnectedOnlineState(): OnlineModeState {
    return {
      status: "disconnected",
      bindings: [],
      liveValues: new Map(),
      updateRate: 100,
      showConditions: true,
      highlightChanges: true,
    };
  }

  private _getOpenFiles(): ProjectFile[] {
    if (!this._project) return [];
    return this._project.files.filter((f) => f.isOpen);
  }

  private _switchToFile(fileId: string): void {
    if (!this._project) return;

    const file = this._project.files.find((f) => f.id === fileId);
    if (!file) return;

    // Save current file content from editor before switching
    const editor = this.shadowRoot?.querySelector(
      "st-editor",
    ) as STEditor | null;
    if (editor && this._project.activeFileId) {
      const currentFile = this._project.files.find(
        (f) => f.id === this._project!.activeFileId,
      );
      if (currentFile) {
        const editorCode = editor.getCode();
        // Only update if content actually changed
        if (editorCode !== currentFile.content) {
          currentFile.content = editorCode;
          currentFile.hasUnsavedChanges = true;
          currentFile.lastModified = Date.now();
        }
      }
    }

    // Switch to new file
    this._project.activeFileId = fileId;
    this._project.files.forEach((f) => {
      f.isOpen = f.id === fileId || f.isOpen;
    });
    this._project.lastModified = Date.now();

    // Update editor with new file content
    if (editor) {
      editor.setCode(file.content);
    }

    this._saveProject();
    this.requestUpdate();
  }

  private _closeFile(fileId: string): void {
    if (!this._project) return;

    const file = this._project.files.find((f) => f.id === fileId);
    if (!file) return;

    // Check for unsaved changes
    if (file.hasUnsavedChanges) {
      if (!confirm(`File "${file.name}" has unsaved changes. Close anyway?`)) {
        return;
      }
    }

    // Close file
    file.isOpen = false;

    // If this was the active file, switch to another open file
    if (this._project.activeFileId === fileId) {
      const openFiles = this._project.files.filter(
        (f) => f.isOpen && f.id !== fileId,
      );
      this._project.activeFileId =
        openFiles.length > 0 ? openFiles[0].id : null;
    }

    this._project.lastModified = Date.now();
    this._saveProject();
    this.requestUpdate();
  }

  private _handleFileOpen(e: CustomEvent): void {
    const { fileId } = e.detail;
    this._switchToFile(fileId);
  }

  private _handleFileSelected(_e: CustomEvent): void {
    // Just update selection, don't switch yet
    // Could be used for preview or other features
  }

  private _handleFileRename(e: CustomEvent): void {
    const { fileId, newName } = e.detail;
    if (!this._project) return;

    const file = this._project.files.find((f) => f.id === fileId);
    if (file) {
      file.name = newName;
      file.path = newName; // Simple: path = name for now
      file.lastModified = Date.now();
      this._project.lastModified = Date.now();
      this._saveProject();
    }
  }

  private _handleFileDeleted(e: CustomEvent): void {
    const { fileId } = e.detail;
    this._closeFile(fileId);
  }

  private _handleFileCreated(e: CustomEvent): void {
    const { file } = e.detail;
    if (!this._project || !file) return;

    // Add the new file to the project
    this._project = {
      ...this._project,
      files: [...this._project.files, file],
      activeFileId: file.id,
      lastModified: Date.now(),
    };

    // Update editor with new file content
    const editor = this.shadowRoot?.querySelector(
      "st-editor",
    ) as STEditor | null;
    if (editor) {
      editor.setCode(file.content);
    }

    this._saveProject();
    this._analyzeCode();
    this.requestUpdate();
  }

  private async _saveProject(): Promise<void> {
    if (!this._storage || !this._project) return;
    try {
      await this._storage.saveProject(this._project);
    } catch (error) {
      console.error("Failed to save project", error);
    }
  }

  private async _toggleProjectExplorer(): Promise<void> {
    if (!this._projectExplorerLoaded && !this._showProjectExplorer) {
      // Lazy load project explorer module when first shown
      await import("../project");
      this._projectExplorerLoaded = true;
    }
    this._showProjectExplorer = !this._showProjectExplorer;
  }

  /**
   * Parse and analyze the current code
   * Updates all reactive state with results
   */
  private _analyzeCode(): void {
    const diagnostics: CombinedDiagnostic[] = [];

    // Step 1: Parse the code (use current code from project or legacy mode)
    const code = this._getCurrentCode();
    const parseResult = parse(code);

    // Convert parser errors to combined diagnostics
    if (parseResult.errors.length > 0) {
      for (const error of parseResult.errors) {
        diagnostics.push({
          severity: "Error",
          message: error.message,
          line: error.line,
          column: error.column,
        });
      }
    }

    this._syntaxOk = parseResult.success && parseResult.ast !== undefined;

    // Step 2: If parsing succeeded, run dependency analysis
    if (parseResult.success && parseResult.ast) {
      const analysis = analyzeDependencies(parseResult.ast);

      // Add analyzer diagnostics
      for (const diag of analysis.diagnostics) {
        diagnostics.push({
          severity: diag.severity,
          code: diag.code,
          message: diag.message,
          line: diag.location?.line,
          column: diag.location?.column,
        });
      }

      this._triggers = analysis.triggers;
      this._metadata = analysis.metadata;
      this._entityCount = analysis.dependencies.length;
    } else {
      // Reset analysis state on parse failure
      this._triggers = [];
      this._metadata = null;
      this._entityCount = 0;
    }

    this._diagnostics = diagnostics;
  }

  private async _handleDeploy() {
    if (!this._syntaxOk) {
      console.error("Cannot deploy: syntax errors present");
      return;
    }

    if (!this.hass?.connection) {
      console.error(
        "Cannot deploy: Home Assistant connection is not available",
      );
      return;
    }

    const parseResult = parse(this._getCurrentCode());
    if (!parseResult.success || !parseResult.ast) {
      console.error("Cannot deploy: parsing failed");
      return;
    }

    // Lazy load transpiler and deploy modules
    const [{ transpile }, { deploy, HAApiClient }] = await Promise.all([
      import("../transpiler"),
      import("../deploy"),
    ]);

    const transpilerResult = transpile(parseResult.ast, "home");
    if (transpilerResult.diagnostics.some((d) => d.severity === "Error")) {
      console.error(
        "Cannot deploy: transpiler reported errors",
        transpilerResult.diagnostics,
      );
      return;
    }

    const api = new HAApiClient(this.hass.connection);
    try {
      const deployResult = await deploy(api, transpilerResult, {
        createBackup: true,
      });
      if (!deployResult.success) {
        console.error("Deploy failed", deployResult.errors);
      } else {
        // eslint-disable-next-line no-console
        console.log("Deploy successful", deployResult.transactionId);
      }
    } catch (error) {
      console.error("Deploy error", error);
    }
  }

  /**
   * Extract variable bindings from AST for online mode
   */
  private _extractBindings(
    dependencies: EntityDependency[],
  ): VariableBinding[] {
    const bindings: VariableBinding[] = [];

    for (const dep of dependencies) {
      if (!dep.entityId || !dep.location) continue;

      bindings.push({
        variableName: dep.variableName,
        entityId: dep.entityId,
        dataType: dep.dataType,
        line: dep.location.line,
        column: dep.location.column,
        endColumn: dep.location.column + dep.variableName.length,
        isInput: dep.direction === "INPUT",
        isOutput: dep.direction === "OUTPUT",
        isPersistent: false, // Will be determined from storage analysis if needed
      });
    }

    return bindings;
  }

  private async _handleOnlineConnect(): Promise<void> {
    if (!this._syntaxOk || !this.hass?.connection) {
      return;
    }

    const parseResult = parse(this._getCurrentCode());
    if (!parseResult.success || !parseResult.ast) {
      return;
    }

    const analysis = analyzeDependencies(parseResult.ast);
    const bindings = this._extractBindings(analysis.dependencies);

    const editor = this.shadowRoot?.querySelector(
      "st-editor",
    ) as STEditor | null;
    if (editor) {
      try {
        await editor.startOnlineMode(bindings);
        this._onlineState = editor.getOnlineState();
      } catch (error) {
        console.error("Failed to start online mode", error);
      }
    }
  }

  private _handleOnlineDisconnect(): void {
    const editor = this.shadowRoot?.querySelector(
      "st-editor",
    ) as STEditor | null;
    if (editor) {
      editor.stopOnlineMode();
      this._onlineState = this._createDisconnectedOnlineState();
    }
  }

  private _handleOnlineTogglePause(): void {
    const editor = this.shadowRoot?.querySelector(
      "st-editor",
    ) as STEditor | null;
    if (editor && this._onlineState) {
      const isPaused = this._onlineState.status === "paused";
      editor.setOnlinePaused(!isPaused);
      this._onlineState = editor.getOnlineState();
    }
  }

  private _handleOnlineSettingChange(e: CustomEvent): void {
    const currentState = this._onlineState ?? this._createDisconnectedOnlineState();
    const { setting, value } = e.detail as {
      setting: "highlightChanges" | "showConditions" | "updateRate";
      value: boolean | number;
    };

    this._onlineState = {
      ...currentState,
      [setting]: value,
    };
  }

  private async _toggleEntityBrowser(): Promise<void> {
    if (!this._entityBrowserLoaded && !this._showEntityBrowser) {
      // Lazy load entity browser module when first shown
      await import("../entity-browser");
      this._entityBrowserLoaded = true;
    }
    this._showEntityBrowser = !this._showEntityBrowser;
  }
}
