import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../colors_and_type.css";
import "../editor";
import "../online/online-toolbar";
import { parse } from "../parser";
import { analyzeDependencies } from "../analyzer";
import type {
  TriggerConfig,
  AnalysisMetadata,
  EntityDependency,
} from "../analyzer/types";
import type { VariableBinding, OnlineModeState } from "../online/types";
import type { STEditor } from "../editor/st-editor";
import type { ProjectStructure, ProjectFile } from "../project/types";
import { ProjectStorage } from "../project";
import type { STEntityBrowser } from "../entity-browser/entity-browser";

interface CombinedDiagnostic {
  severity: "Error" | "Warning" | "Info" | "Hint";
  code?: string;
  message: string;
  line?: number;
  column?: number;
}

interface DeployFeedback {
  tone: "success" | "error" | "info";
  message: string;
}

const PROJECT_SAVE_ERROR = "Could not save this project in browser storage. Keep this tab open to retain your edits.";

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
  @state() declare private _storage: ProjectStorage | null;
  @state() declare private _isDeploying: boolean;
  @state() declare private _deployFeedback: DeployFeedback | null;
  private _entityBrowserLoaded = false;
  private _projectInitialization?: Promise<void>;
  private _onlineAttempt = 0;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      height: 100dvh;
      color: var(--primary-text-color, #212121);
      background: var(--primary-background-color, #fafafa);
      font-family: var(--paper-font-common-base_-_font-family, Roboto, sans-serif);
    }
    * { box-sizing: border-box; }
    .container { display: flex; flex-direction: column; height: 100%; min-height: 0; }
    .toolbar {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 12px 16px; background: var(--card-background-color, #fff);
      border-bottom: 1px solid var(--divider-color, #ddd);
    }
    .toolbar-brand { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .menu-button {
      display: grid; place-items: center; flex: none; width: 36px; height: 38px;
      padding: 0; border: 0; background: transparent; color: inherit;
    }
    .toolbar h1 { margin: 0; font-size: 18px; line-height: 1.3; font-weight: 600; }
    .toolbar-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    button, summary { font: inherit; }
    button { cursor: pointer; }
    button:focus-visible, summary:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px;
    }
    .toolbar-button, .deploy-button, .entity-overlay-close {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      min-height: 38px; padding: 0 12px; border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px; background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121); font-weight: 500;
    }
    .toolbar-button:hover, .toolbar-button.active, .entity-overlay-close:hover {
      background: var(--secondary-background-color, #eee);
    }
    .deploy-button { background: var(--primary-color, #03a9f4); color: var(--text-primary-color, #fff); border-color: transparent; }
    .deploy-button:hover { filter: brightness(.92); }
    .deploy-button:disabled { opacity: .6; cursor: wait; }
    .toolbar-icon, .deploy-button ha-icon { --mdc-icon-size: 18px; }
    .deploy-feedback { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--secondary-background-color, #eee); }
    .deploy-feedback.error { color: var(--error-color, #b00020); }
    .deploy-feedback.success { color: var(--success-color, #2e7d32); }
    .deploy-feedback ha-icon { --mdc-icon-size: 18px; flex: none; }
    .main-content { display: flex; flex: 1; min-height: 0; overflow: hidden; }
    .project-sidebar {
      display: flex; flex-direction: column; width: 230px; flex: 0 0 230px; min-height: 0;
      background: var(--secondary-background-color, #f3f3f3);
      border-right: 1px solid var(--divider-color, #ddd); overflow: auto;
    }
    .content-area { position: relative; display: flex; flex: 1; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; }
    .tabs-container { display: flex; flex: none; overflow-x: auto; background: var(--secondary-background-color, #f3f3f3); border-bottom: 1px solid var(--divider-color, #ddd); }
    .tab-group { display: flex; align-items: center; flex: none; background: var(--card-background-color, #fff); }
    .tab { display: inline-flex; align-items: center; gap: 8px; flex: none; max-width: 220px; min-height: 40px; padding: 0 12px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--secondary-text-color, #666); }
    .tab:hover { background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); }
    .tab.active { background: var(--card-background-color, #fff); border-bottom-color: var(--primary-color, #03a9f4); color: var(--primary-text-color, #212121); }
    .tab-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tab-close { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-right: 4px; border: 0; background: transparent; color: var(--secondary-text-color, #666); border-radius: 4px; }
    .tab-close:hover { background: var(--secondary-background-color, #eee); }
    .tab-close ha-icon { --mdc-icon-size: 16px; }
    .unsaved-dot { width: 7px; height: 7px; flex: none; border-radius: 50%; background: var(--warning-color, #ff9800); }
    .editor-container { flex: 1; min-height: 0; overflow: hidden; background: var(--card-background-color, #fff); }
    st-editor { display: block; height: 100%; overflow: hidden; }
    .empty-editor { display: flex; align-items: center; justify-content: center; height: 100%; padding: 24px; color: var(--secondary-text-color, #666); text-align: center; }
    .entity-overlay { position: absolute; inset: 0 0 0 auto; width: min(440px, 100%); display: flex; flex-direction: column; overflow: hidden; z-index: 3; background: var(--card-background-color, #fff); border-left: 1px solid var(--divider-color, #ddd); }
    .entity-overlay st-entity-browser { flex: 1; min-height: 0; }
    .entity-overlay-close { position: absolute; right: 8px; top: 8px; z-index: 2; width: 36px; padding: 0; }
    .entity-overlay-close ha-icon { --mdc-icon-size: 18px; }
    .diagnostics-panel { flex: none; max-height: 28%; overflow: auto; background: var(--card-background-color, #fff); border-top: 1px solid var(--divider-color, #ddd); }
    .diagnostics-header { display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-weight: 600; cursor: pointer; }
    .diagnostics-header::before { content: "▸"; }
    details[open] > .diagnostics-header::before { content: "▾"; }
    .diagnostics-header ha-icon, .diagnostic-icon { --mdc-icon-size: 18px; }
    .diagnostic { display: flex; align-items: baseline; gap: 10px; padding: 6px 16px; font-size: 13px; }
    .diagnostic-icon { flex: none; align-self: center; }
    .diagnostic-location { flex: none; color: var(--secondary-text-color, #666); }
    .diagnostic-message { overflow-wrap: anywhere; }
    .diagnostic-code { margin-right: 6px; color: var(--secondary-text-color, #666); }
    .diagnostic-error .diagnostic-icon { color: var(--error-color, #b00020); }
    .diagnostic-warning .diagnostic-icon { color: var(--warning-color, #b26a00); }
    .diagnostic-info .diagnostic-icon { color: var(--primary-color, #03a9f4); }
    .status-bar { display: flex; align-items: center; flex: none; flex-wrap: wrap; gap: 4px 16px; padding: 7px 16px; background: var(--secondary-background-color, #f3f3f3); border-top: 1px solid var(--divider-color, #ddd); font-size: 12px; }
    .status-pill, .syntax-chip { display: inline-flex; align-items: center; gap: 4px; }
    .status-pill ha-icon { --mdc-icon-size: 15px; }
    .status-ok { color: var(--success-color, #2e7d32); }
    .status-error { color: var(--error-color, #b00020); }
    .status-warning { color: var(--warning-color, #b26a00); }
    @media (max-width: 640px) {
      .toolbar { flex-wrap: wrap; gap: 8px; }
      .toolbar h1 { font-size: 16px; }
      .toolbar-actions { margin-left: auto; }
      .main-content { flex-direction: column; overflow: auto; }
      .project-sidebar { width: 100%; flex: 0 1 auto; max-height: 25vh; border-right: 0; border-bottom: 1px solid var(--divider-color, #ddd); }
      .content-area { flex: 1 0 300px; }
      .status-bar { gap: 4px 12px; }
    }
  `;

  constructor() {
    super();
    this.narrow = false;
    this._showEntityBrowser = false;
    this._project = null;
    this._storage = null;
    this._code = "";
    this._syntaxOk = true;
    this._triggers = [];
    this._diagnostics = [];
    this._metadata = null;
    this._entityCount = 0;
    this._onlineState = this._createDisconnectedOnlineState();
    this._isDeploying = false;
    this._deployFeedback = null;
    this.addEventListener("binding-feedback", (event) => {
      this._showBindingFeedback((event as CustomEvent<string>).detail);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    void this._initializeProject();
  }

  disconnectedCallback(): void {
    this._handleOnlineDisconnect();
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(changedProperties);
    const previousHass = changedProperties.get("hass") as
      | { connection?: unknown }
      | undefined;
    if (previousHass?.connection && previousHass.connection !== this.hass?.connection) {
      this._handleOnlineDisconnect();
    }
  }

  private _initializeProject(): Promise<void> {
    return this._projectInitialization ??= this._loadProject();
  }

  private async _loadProject(): Promise<void> {
    if (this._project) {
      this._analyzeCode();
      return;
    }

    const storage = this._storage ??= new ProjectStorage(
      this.hass?.connection ?? null,
      this.hass?.config?.entry_id ?? "default",
    );
    try {
      const project = await storage.loadProject();
      if (project) {
        if (project.activeFileId !== null) {
          const activeFile = project.files.find((file) => file.id === project.activeFileId)
            ?? project.files[0];
          project.activeFileId = activeFile?.id ?? null;
          if (activeFile) activeFile.isOpen = true;
        }
        this._project = project;
      } else {
        this._project = storage.createDefaultProject();
        void this._saveProject();
      }
    } catch (error) {
      console.error("Failed to load project", error);
      this._setDeployFeedback("error", "Could not load the project from browser storage.");
    }
    this._analyzeCode();
  }

  render() {
    const errorCount = this._diagnostics.filter(
      (d) => d.severity === "Error",
    ).length;
    const warningCount = this._diagnostics.filter(
      (d) => d.severity === "Warning",
    ).length;

    const deployDisabled = this._isDeploying;
    const deployTitle = !this._syntaxOk
      ? "Show deploy errors"
      : this._isDeploying
        ? "Deploy in progress"
        : "Deploy to Home Assistant";

    return html`
      <div class="container">
        <div class="toolbar" role="banner">
          <div class="toolbar-brand">
            ${this.narrow
              ? html`<button
                  class="menu-button"
                  type="button"
                  aria-label="Open Home Assistant menu"
                  @click=${() => this.dispatchEvent(new CustomEvent("hass-toggle-menu", {
                    bubbles: true,
                    composed: true,
                  }))}
                ><ha-icon icon="mdi:menu"></ha-icon></button>`
              : ""}
            <h1 class="st-h1">ST for Home Assistant</h1>
          </div>
          <div class="toolbar-actions" role="group" aria-label="Panel actions">
            <button
              class="toolbar-button ${this._showEntityBrowser ? "active" : ""}"
              @click=${this._toggleEntityBrowser}
              title="Toggle Entity Browser"
              aria-pressed=${this._showEntityBrowser}
              aria-label="Toggle entity browser"
            >
              <ha-icon
                class="toolbar-icon"
                icon="mdi:transmission-tower"
              ></ha-icon>
              Entities
            </button>
            <button
              class="deploy-button ${this._isDeploying ? "deploying" : ""}"
              @click=${this._handleDeploy}
              ?disabled=${deployDisabled}
              title=${deployTitle}
              aria-label=${deployTitle}
            >
              <ha-icon
                icon=${this._isDeploying ? "mdi:progress-upload" : "mdi:rocket-launch"}
              ></ha-icon>
              <span class="deploy-label">${this._isDeploying ? "Deploying" : "Deploy"}</span>
            </button>
          </div>
        </div>
        ${this._deployFeedback
          ? html`
              <div
                class="deploy-feedback ${this._deployFeedback.tone}"
                role="status"
                aria-live="polite"
              >
                <ha-icon
                  icon=${this._getDeployFeedbackIcon(this._deployFeedback.tone)}
                ></ha-icon>
                <span>${this._deployFeedback.message}</span>
              </div>
            `
          : ""}
        <st-online-toolbar
          .state=${this._onlineState ?? this._createDisconnectedOnlineState()}
          @connect=${this._handleOnlineConnect}
          @disconnect=${this._handleOnlineDisconnect}
          @toggle-pause=${this._handleOnlineTogglePause}
          @setting-change=${this._handleOnlineSettingChange}
        ></st-online-toolbar>
        <div class="main-content">
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
          <div class="content-area">
            ${this._project
              ? html`
                  <div class="tabs-container" role="tablist">
                    ${this._getOpenFiles().map(
                      (file) => html`
                        <div class="tab-group">
                        <button
                          class="tab ${file.id === this._project!.activeFileId
                            ? "active"
                            : ""}"
                          @click=${() => this._switchToFile(file.id)}
                          @auxclick=${(e: MouseEvent) => {
                            if (e.button === 1) {
                              e.preventDefault();
                              this._closeFile(file.id);
                            }
                          }}
                          title=${file.path}
                          role="tab"
                          aria-selected=${file.id === this._project!.activeFileId}
                        >
                          <span class="tab-label">${this._getFileDisplayName(file.name)}</span>
                          ${file.hasUnsavedChanges
                            ? html`<div
                                class="unsaved-dot"
                                title="Unsaved changes"
                                aria-label="Unsaved changes"
                              ></div>`
                            : ""}
                        </button>
                          <button
                            class="tab-close"
                            type="button"
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              this._closeFile(file.id);
                            }}
                            title="Close (middle-click also works)"
                            aria-label="Close ${file.name}"
                          >
                            <ha-icon icon="mdi:close"></ha-icon>
                          </button>
                        </div>
                      `,
                    )}
                  </div>
                `
              : ""}
            <div class="editor-container">
              ${this._project && !this._project.activeFileId
                ? html`
                    <div class="empty-editor">
                      All files are closed. Open a file from the project explorer or create a new one.
                    </div>
                  `
                : html`
                    <st-editor
                      .code=${this._getCurrentCode()}
                      .hass=${this.hass}
                      @code-change=${this._handleCodeChange}
                    ></st-editor>
                  `}
            </div>
            ${this._showEntityBrowser
              ? html`
                  <div
                    class="entity-overlay"
                    role="dialog"
                    aria-label="Entity Browser"
                    @keydown=${(event: KeyboardEvent) => {
                      if (event.key === "Escape") {
                        event.stopPropagation();
                        void this._toggleEntityBrowser();
                      }
                    }}
                  >
                    <button
                      class="entity-overlay-close"
                      @click=${this._toggleEntityBrowser}
                      title="Close Entity Browser"
                      aria-label="Close entity browser"
                    >
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                    <st-entity-browser
                      .hass=${this.hass}
                      .currentCode=${this._getCurrentCode()}
                      @insert-binding=${this._handleInsertBinding}
                      @remove-binding=${this._handleRemoveBinding}
                    ></st-entity-browser>
                  </div>
                `
              : ""}
          </div>
        </div>
        ${this._diagnostics.length > 0
          ? html`
              <details class="diagnostics-panel" open>
                <summary class="diagnostics-header">
                  <ha-icon icon="mdi:message-alert-outline"></ha-icon>
                  <span>Diagnostics (${this._diagnostics.length})</span>
                </summary>
                <div role="log" aria-label="Diagnostics" aria-live="polite">
                ${this._diagnostics.map(
                  (d) => html`
                    <div
                      class="diagnostic diagnostic-${d.severity.toLowerCase()}"
                    >
                      <ha-icon
                        class="diagnostic-icon"
                        icon=${this._getDiagnosticIcon(d.severity)}
                      ></ha-icon>
                      <span class="diagnostic-location">
                        ${d.line ? `Ln ${d.line}, Col ${d.column || 0}` : ""}
                      </span>
                      <span class="diagnostic-message">
                        ${d.code
                          ? html`<span class="diagnostic-code">${d.code}</span>`
                          : ""}${d.message}
                      </span>
                    </div>
                  `,
                )}
                </div>
              </details>
            `
          : ""}
        <div class="status-bar" role="status" aria-live="polite">
          ${this._syntaxOk
            ? html`<span class="syntax-chip status-ok" aria-label="Syntax OK"
                >Syntax OK</span
              >`
            : html`<span class="syntax-chip status-error" aria-label="Syntax Error"
                >Syntax Error</span
              >`}
          ${errorCount > 0
            ? html`<span
                class="status-pill status-error"
                title="${errorCount} error${errorCount === 1 ? "" : "s"}"
              >
                <ha-icon icon="mdi:alert-circle"></ha-icon>
                ${errorCount} Error${errorCount === 1 ? "" : "s"}
              </span>`
            : ""}
          ${warningCount > 0
            ? html`<span
                class="status-pill status-warning"
                title="${warningCount} warning${warningCount === 1 ? "" : "s"}"
              >
                <ha-icon icon="mdi:alert"></ha-icon>
                ${warningCount} Warning${warningCount === 1 ? "" : "s"}
              </span>`
            : ""}
          <span class="status-pill" title="Number of triggers">
            <ha-icon icon="mdi:flash"></ha-icon>
            Triggers: ${this._triggers.length}
          </span>
          <span class="status-pill" title="Bound entities">
            <ha-icon icon="mdi:link-variant"></ha-icon>
            Entities: ${this._entityCount}
          </span>
          ${this._metadata?.mode
            ? html`<span class="status-pill" title="Execution mode">
                <ha-icon icon="mdi:cog-outline"></ha-icon>
                Mode: ${this._metadata.mode}
              </span>`
            : ""}
          ${this._metadata?.hasPersistentVars
            ? html`<span class="status-pill status-accent" title="Persistent variables">
                <ha-icon icon="mdi:database-outline"></ha-icon>
                Persistent
              </span>`
            : ""}
          ${this._metadata?.hasTimers
            ? html`<span class="status-pill status-accent" title="Timers used">
                <ha-icon icon="mdi:timer-outline"></ha-icon>
                Timers
              </span>`
            : ""}
        </div>
      </div>
    `;
  }

  private _getDiagnosticIcon(severity: CombinedDiagnostic["severity"]): string {
    switch (severity) {
      case "Error":
        return "mdi:alert-circle";
      case "Warning":
        return "mdi:alert";
      case "Info":
        return "mdi:information";
      case "Hint":
        return "mdi:lightbulb-outline";
      default:
        return "mdi:information-outline";
    }
  }

  private _getDeployFeedbackIcon(tone: DeployFeedback["tone"]): string {
    switch (tone) {
      case "success":
        return "mdi:check-circle";
      case "error":
        return "mdi:alert-circle";
      case "info":
      default:
        return "mdi:information";
    }
  }

  private _setDeployFeedback(
    tone: DeployFeedback["tone"],
    message: string,
  ): void {
    this._deployFeedback = { tone, message };
  }

  private _formatDeployError(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object") {
      const candidate = error as {
        message?: unknown;
        body?: { message?: unknown; error?: unknown } | unknown;
        error?: unknown;
      };

      if (typeof candidate.message === "string" && candidate.message.trim()) {
        return candidate.message;
      }

      if (candidate.body && typeof candidate.body === "object") {
        const body = candidate.body as { message?: unknown; error?: unknown };
        if (typeof body.message === "string" && body.message.trim()) {
          return body.message;
        }
        if (typeof body.error === "string" && body.error.trim()) {
          return body.error;
        }
      }

      if (typeof candidate.error === "string" && candidate.error.trim()) {
        return candidate.error;
      }

      try {
        return JSON.stringify(error);
      } catch {
        return "Deploy error";
      }
    }

    return "Deploy error";
  }

  private _getFileDisplayName(name: string): string {
    return name.replace(/\.st$/i, "");
  }

  private _handleCodeChange(e: CustomEvent<{ code: string }>): void {
    const { code } = e.detail;
    if (this._project) {
      const activeFile = this._project.files.find(
        (file) => file.id === this._project?.activeFileId,
      );
      if (!activeFile || activeFile.content === code) return;

      const editedFile = {
        ...activeFile,
        content: code,
        hasUnsavedChanges: true,
        lastModified: Date.now(),
      };
      this._updateProject(this._project.files.map(
        (file) => file.id === editedFile.id ? editedFile : file,
      ));
    } else {
      this._code = code;
      this._handleOnlineDisconnect();
      this._analyzeCode();
    }
  }

  private _getCurrentCode(): string {
    if (!this._project) return this._code;
    return this._project.files.find(
      (file) => file.id === this._project?.activeFileId,
    )?.content ?? "";
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
    if (!this._project || fileId === this._project.activeFileId) return;
    if (!this._project.files.some((file) => file.id === fileId)) return;

    this._updateProject(this._project.files.map(
      (file) => file.id === fileId ? { ...file, isOpen: true } : file,
    ), fileId);
  }

  private _closeFile(fileId: string): void {
    if (!this._project) return;
    const file = this._project.files.find((candidate) => candidate.id === fileId);
    if (!file?.isOpen) return;

    const files = this._project.files.map(
      (candidate) => candidate.id === fileId ? { ...candidate, isOpen: false } : candidate,
    );
    const nextActiveId = fileId === this._project.activeFileId
      ? files.find((candidate) => candidate.isOpen)?.id ?? null
      : this._project.activeFileId;
    this._updateProject(files, nextActiveId);
  }

  private _handleFileOpen(e: CustomEvent<{ fileId: string }>): void {
    this._switchToFile(e.detail.fileId);
  }

  private _handleFileSelected(e: CustomEvent<{ fileId: string }>): void {
    this._switchToFile(e.detail.fileId);
  }

  private _handleFileRename(e: CustomEvent<{ fileId: string; newName: string }>): void {
    if (!this._project) return;
    const { fileId, newName } = e.detail;
    const file = this._project.files.find((candidate) => candidate.id === fileId);
    const trimmedName = newName.trim();
    if (!file || !trimmedName || trimmedName === file.name) return;
    if (trimmedName.includes("/") || trimmedName.includes("\\")) {
      this._setDeployFeedback("error", "Enter a file name without folder separators.");
      return;
    }

    const name = /\.st$/i.test(trimmedName) ? trimmedName : `${trimmedName}.st`;
    const path = file.path.slice(0, file.path.lastIndexOf("/") + 1) + name;
    if (this._project.files.some(
      (candidate) => candidate.id !== fileId && candidate.path.toLowerCase() === path.toLowerCase(),
    )) {
      this._setDeployFeedback("error", `A file named "${name}" already exists in this folder.`);
      return;
    }

    this._updateProject(this._project.files.map(
      (candidate) => candidate.id === fileId
        ? { ...candidate, name, path, lastModified: Date.now() }
        : candidate,
    ));
  }

  private _handleFileDeleted(e: CustomEvent<{ fileId: string }>): void {
    if (!this._project) return;
    const { fileId } = e.detail;
    const remainingFiles = this._project.files.filter((file) => file.id !== fileId);
    if (remainingFiles.length === this._project.files.length) return;

    let nextActiveId = this._project.activeFileId;
    if (nextActiveId === fileId) {
      nextActiveId = (remainingFiles.find((file) => file.isOpen) ?? remainingFiles[0])?.id ?? null;
    }
    this._updateProject(remainingFiles.map(
      (file) => file.id === nextActiveId ? { ...file, isOpen: true } : file,
    ), nextActiveId);
  }

  private _handleFileCreated(e: CustomEvent<{ file: ProjectFile }>): void {
    if (!this._project) return;
    const { file } = e.detail;
    this._updateProject([...this._project.files, file], file.id);
  }

  private _updateProject(
    files: ProjectFile[],
    activeFileId = this._project?.activeFileId ?? null,
  ): void {
    if (!this._project) return;
    const switchedFiles = activeFileId !== this._project.activeFileId;
    const previousCode = this._getCurrentCode();
    this._project = {
      ...this._project,
      files,
      activeFileId,
      lastModified: Date.now(),
    };
    const code = this._getCurrentCode();
    if (switchedFiles || code !== previousCode) {
      this._handleOnlineDisconnect();
      if (switchedFiles && activeFileId) {
        this.shadowRoot?.querySelector("st-editor")?.setCode(code);
      }
      if (switchedFiles) this._showBindingFeedback("");
      this._analyzeCode();
    }
    void this._saveProject();
  }

  private async _saveProject(): Promise<void> {
    const project = this._project;
    if (!this._storage || !project) return;
    try {
      await this._storage.saveProject(project);
      if (this._project !== project) return;
      if (project.files.some((file) => file.hasUnsavedChanges)) {
        this._project = {
          ...project,
          files: project.files.map((file) => ({ ...file, hasUnsavedChanges: false })),
        };
      }
      if (this._deployFeedback?.message === PROJECT_SAVE_ERROR) {
        this._deployFeedback = null;
      }
    } catch (error) {
      if (this._project === project) this._setDeployFeedback("error", PROJECT_SAVE_ERROR);
      console.error("Failed to save project", error);
    }
  }

  /**
   * Parse and analyze the current code
   * Updates all reactive state with results
   */
  private _analyzeCode(): void {
    const diagnostics: CombinedDiagnostic[] = [];
    if (this._project && !this._project.activeFileId) {
      this._syntaxOk = true;
      this._triggers = [];
      this._metadata = null;
      this._entityCount = 0;
      this._diagnostics = diagnostics;
      return;
    }

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
    if (this._isDeploying) return;

    if (this._project && !this._project.activeFileId) {
      this._setDeployFeedback("error", "Open a file to deploy its program.");
      return;
    }

    if (!this._syntaxOk) {
      this._setDeployFeedback(
        "error",
        "Cannot deploy while syntax errors are present.",
      );
      console.error("Cannot deploy: syntax errors present");
      return;
    }

    // Deploy needs both transports: REST (callApi) for automation/script configs
    // and the WebSocket connection for helpers and service calls.
    if (!this.hass?.connection || typeof this.hass?.callApi !== "function") {
      this._setDeployFeedback(
        "error",
        "Cannot deploy because the Home Assistant connection is not available.",
      );
      console.error(
        "Cannot deploy: Home Assistant connection is not available",
      );
      return;
    }

    const parseResult = parse(this._getCurrentCode());
    if (!parseResult.success || !parseResult.ast) {
      this._setDeployFeedback("error", "Cannot deploy because parsing failed.");
      console.error("Cannot deploy: parsing failed");
      return;
    }

    this._isDeploying = true;
    this._deployFeedback = null;
    try {
      // Lazy load transpiler and deploy modules
      const [{ transpile }, { deploy, HAApiClient }] = await Promise.all([
        import("../transpiler"),
        import("../deploy"),
      ]);

      const transpilerResult = transpile(parseResult.ast, "home");
      const compilerError = transpilerResult.diagnostics.find((d) => d.severity === "Error");
      if (compilerError) {
        const location = compilerError.stLine ? `Line ${compilerError.stLine}: ` : "";
        this._setDeployFeedback(
          "error",
          `Cannot deploy. ${location}${compilerError.message}`,
        );
        console.error(
          "Cannot deploy: transpiler reported errors",
          transpilerResult.diagnostics,
        );
        return;
      }

      const states = this.hass.states as Record<string, unknown> | undefined;
      if (states) {
        const missing = analyzeDependencies(parseResult.ast).dependencies.find(
          ({ entityId }) => entityId && !Object.prototype.hasOwnProperty.call(states, entityId),
        );
        if (missing) {
          const location = missing.location ? `Line ${missing.location.line}: ` : "";
          this._setDeployFeedback(
            "error",
            `Cannot deploy. ${location}Entity ${missing.entityId} was not found in Home Assistant.`,
          );
          return;
        }
      }

      const api = new HAApiClient(this.hass);
      const deployResult = await deploy(api, transpilerResult, {
        createBackup: true,
      });
      if (!deployResult.success) {
        this._setDeployFeedback(
          "error",
          deployResult.errors[0]?.message || "Deployment failed.",
        );
        console.error("Deploy failed", deployResult.errors);
      } else {
        this._setDeployFeedback(
          "success",
          `Deploy successful (${deployResult.transactionId}).`,
        );
        // eslint-disable-next-line no-console
        console.log("Deploy successful", deployResult.transactionId);
      }
    } catch (error) {
      this._setDeployFeedback(
        "error",
        this._formatDeployError(error),
      );
      console.error("Deploy error", error);
    } finally {
      this._isDeploying = false;
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
    const state = this._onlineState ?? this._createDisconnectedOnlineState();
    if (state.status !== "disconnected" && state.status !== "error") return;
    if (!this._syntaxOk) {
      this._setDeployFeedback("error", "Fix the syntax errors before connecting live values.");
      return;
    }
    if (!this.hass?.connection) {
      this._setDeployFeedback("error", "Cannot connect live values without a Home Assistant connection.");
      return;
    }

    const editor = this.shadowRoot?.querySelector("st-editor");
    if (!editor) return;
    const parseResult = parse(this._getCurrentCode());
    if (!parseResult.success || !parseResult.ast) {
      return;
    }

    const analysis = analyzeDependencies(parseResult.ast);
    const bindings = this._extractBindings(analysis.dependencies);
    if (!bindings.length) {
      this._setDeployFeedback("info", "Add an entity binding before connecting live values.");
      return;
    }

    this._deployFeedback = null;
    const attempt = ++this._onlineAttempt;
    this._onlineState = { ...state, status: "connecting" };
    try {
      await editor.startOnlineMode(bindings);
      if (attempt !== this._onlineAttempt) return;
      editor.setOnlineSettings(this._onlineState);
      this._onlineState = editor.getOnlineState();
    } catch (error) {
      if (attempt !== this._onlineAttempt) return;
      editor.stopOnlineMode();
      this._onlineState = { ...(this._onlineState ?? state), status: "error" };
      console.error("Failed to start online mode", error);
    }
  }

  private _handleOnlineDisconnect(): void {
    if (!this._onlineState || this._onlineState.status === "disconnected") return;
    this._onlineAttempt++;
    this.shadowRoot?.querySelector("st-editor")?.stopOnlineMode();
    this._onlineState = {
      ...this._onlineState,
      status: "disconnected",
      bindings: [],
      liveValues: new Map(),
    };
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

    const editor = this.shadowRoot?.querySelector(
      "st-editor",
    ) as STEditor | null;
    editor?.setOnlineSettings({
      updateRate:
        setting === "updateRate" && typeof value === "number"
          ? value
          : undefined,
      showConditions:
        setting === "showConditions" && typeof value === "boolean"
          ? value
          : undefined,
      highlightChanges:
        setting === "highlightChanges" && typeof value === "boolean"
          ? value
          : undefined,
    });

    if (editor && currentState.status !== "connecting") {
      this._onlineState = editor.getOnlineState() ?? this._onlineState;
    }
  }

  private async _toggleEntityBrowser(): Promise<void> {
    if (this._showEntityBrowser) {
      this._showEntityBrowser = false;
      this.shadowRoot?.querySelector<HTMLButtonElement>(".toolbar-button")?.focus();
      return;
    }

    try {
      if (!this._entityBrowserLoaded) {
        await import("../entity-browser");
        this._entityBrowserLoaded = true;
      }
      this._showEntityBrowser = true;
      await this.updateComplete;
      const browser = this.shadowRoot?.querySelector<STEntityBrowser>("st-entity-browser");
      await browser?.focusSearch();
    } catch (error) {
      this._setDeployFeedback("error", `Could not open the entity browser: ${this._formatDeployError(error)}`);
    }
  }

  private _handleInsertBinding(
    e: CustomEvent<{ bindingSyntax: string }>,
  ): void {
    e.stopPropagation();
    const editor = this.shadowRoot?.querySelector("st-editor") as STEditor | null;
    const bindingSyntax = e.detail?.bindingSyntax;
    if (!bindingSyntax) return;

    this._showBindingFeedback(
      editor?.insertBinding(bindingSyntax) ?? "Open a file to insert a binding.",
    );
  }

  private _handleRemoveBinding(
    e: CustomEvent<{ entityId: string }>,
  ): void {
    e.stopPropagation();
    const editor = this.shadowRoot?.querySelector("st-editor") as STEditor | null;
    const entityId = e.detail?.entityId;
    if (!entityId) return;

    this._showBindingFeedback(
      editor?.removeBinding(entityId) ?? "Open a file to remove a binding.",
    );
  }

  private _showBindingFeedback(message: string): void {
    const browser = this.shadowRoot?.querySelector<STEntityBrowser>("st-entity-browser");
    browser?.showBindingFeedback(message);
  }
}
