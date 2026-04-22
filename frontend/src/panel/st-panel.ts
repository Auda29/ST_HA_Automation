import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../colors_and_type.css";
import "../editor";
import "../online/online-toolbar";
import "../project";
// Entity browser is lazy loaded when shown
// import "../entity-browser";
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

interface DeployFeedback {
  tone: "success" | "error" | "info";
  message: string;
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
  @state() declare private _storage: ProjectStorage | null;
  @state() declare private _isDeploying: boolean;
  @state() declare private _deployFeedback: DeployFeedback | null;
  private _entityBrowserLoaded = false;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background:
        radial-gradient(circle at top left, rgba(24, 183, 230, 0.12), transparent 28%),
        radial-gradient(circle at bottom right, rgba(14, 127, 166, 0.08), transparent 36%),
        linear-gradient(180deg, #081018, #091119 26%, #070d13 100%);
      color: var(--ui-text-primary, var(--primary-text-color));
      font-family: var(--font-ui, var(--paper-font-common-base_-_font-family));
    }
    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .main-content {
      position: relative;
      display: flex;
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }
    .content-area {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4, 16px);
      padding: 18px 20px 14px;
      background:
        linear-gradient(135deg, rgba(24, 183, 230, 0.16), transparent 28%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent),
        var(--ui-bg-header, var(--app-header-background-color));
      color: var(--ui-text-header, var(--app-header-text-color));
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      box-shadow: var(--shadow-header);
      flex-wrap: wrap;
    }
    .toolbar-brand {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .toolbar-kicker {
      font-size: var(--font-size-xs, 11px);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(237, 246, 255, 0.58);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-kicker::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4ad7ff, var(--ui-primary, #18b7e6));
      box-shadow: 0 0 10px rgba(74, 215, 255, 0.6);
    }
    .toolbar h1 {
      margin: 0;
      font-size: var(--font-size-3xl, 26px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: -0.04em;
      font-family: var(--font-ui, inherit);
    }
    .toolbar-subtitle {
      font-size: var(--font-size-sm, 12px);
      color: rgba(237, 246, 255, 0.7);
      max-width: 56ch;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    .toolbar-button {
      padding: 10px 14px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: var(--radius-md, 10px);
      background: rgba(255, 255, 255, 0.06);
      color: var(--ui-text-header, #fff);
      cursor: pointer;
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-semibold, 600);
      font-family: var(--font-ui, inherit);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(10px);
      transition: var(--transition-fast, all 160ms ease);
    }
    .toolbar-button:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.22);
      transform: translateY(-1px);
    }
    .toolbar-button:active {
      transform: translateY(0);
    }
    .toolbar-button.active {
      background: linear-gradient(135deg, var(--ui-primary-soft), rgba(24, 183, 230, 0.22));
      border-color: rgba(91, 212, 255, 0.48);
      color: #f6fdff;
      box-shadow: inset 0 0 0 1px rgba(91, 212, 255, 0.2),
        0 6px 18px rgba(24, 183, 230, 0.12);
    }
    .toolbar-button:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }
    .editor-container {
      flex: 1;
      overflow: hidden;
      padding: 18px;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.03),
        transparent 24%
      );
      min-height: 0;
    }
    st-editor {
      height: 100%;
      border-radius: var(--radius-lg, 16px);
      box-shadow: var(--shadow-popover, 0 4px 12px rgba(0, 0, 0, 0.2));
      border: 1px solid rgba(255, 255, 255, 0.04);
      overflow: hidden;
    }
    .status-bar {
      display: flex;
      gap: 10px;
      padding: 10px 16px 12px;
      background: rgba(8, 14, 20, 0.88);
      border-top: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 12px);
      flex-wrap: wrap;
      align-items: center;
      font-family: var(--font-ui, inherit);
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: var(--radius-pill, 999px);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--ui-text-secondary);
      line-height: 1;
      font-weight: var(--font-weight-medium, 500);
    }
    .status-pill ha-icon {
      --mdc-icon-size: 14px;
      color: var(--ui-text-muted, #8ea1af);
    }
    .status-pill.status-accent {
      border-color: rgba(91, 212, 255, 0.22);
      background: rgba(24, 183, 230, 0.1);
      color: var(--ui-text-primary, #f3f7fb);
    }
    .status-pill.status-accent ha-icon {
      color: var(--ui-info, #6bc9ff);
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
    .syntax-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: var(--radius-pill, 999px);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      font-weight: var(--font-weight-semibold, 600);
      line-height: 1;
    }
    .syntax-chip::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 10px currentColor;
      opacity: 0.9;
    }
    .syntax-chip.status-ok {
      background: rgba(79, 211, 158, 0.1);
      border-color: rgba(79, 211, 158, 0.24);
    }
    .syntax-chip.status-error {
      background: rgba(255, 114, 114, 0.1);
      border-color: rgba(255, 114, 114, 0.28);
    }
    .deploy-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 18px;
      border: 1px solid transparent;
      border-radius: var(--radius-md, 10px);
      background: linear-gradient(135deg, #eafaff, #c9f3ff);
      color: #08141b;
      cursor: pointer;
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-bold, 700);
      font-family: var(--font-ui, inherit);
      letter-spacing: 0.02em;
      box-shadow: 0 10px 22px rgba(24, 183, 230, 0.18);
      transition: var(--transition-fast, all 160ms ease);
    }
    .deploy-button ha-icon {
      --mdc-icon-size: 16px;
    }
    .deploy-button:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.05);
      box-shadow: 0 14px 28px rgba(24, 183, 230, 0.28);
    }
    .deploy-button:active:not(:disabled) {
      transform: translateY(0);
    }
    .deploy-button:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }
    .deploy-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
    .deploy-button.deploying {
      pointer-events: none;
    }
    .deploy-button.deploying .deploy-label::after {
      content: "…";
      display: inline-block;
      animation: deploy-dots 1.2s infinite;
    }
    @keyframes deploy-dots {
      0%, 20% { content: "."; }
      40% { content: ".."; }
      60%, 100% { content: "…"; }
    }
    .deploy-feedback {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 13px);
      font-weight: var(--font-weight-medium, 500);
      background: rgba(8, 14, 20, 0.9);
    }
    .deploy-feedback ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
    }
    .deploy-feedback.error {
      color: var(--ui-error, #ff7272);
      background: rgba(255, 114, 114, 0.08);
      border-bottom-color: rgba(255, 114, 114, 0.24);
    }
    .deploy-feedback.success {
      color: var(--ui-success, #4fd39e);
      background: rgba(79, 211, 158, 0.08);
      border-bottom-color: rgba(79, 211, 158, 0.22);
    }
    .deploy-feedback.info {
      color: var(--ui-info, #6bc9ff);
      background: rgba(107, 201, 255, 0.08);
      border-bottom-color: rgba(107, 201, 255, 0.22);
    }
    .diagnostics-panel {
      max-height: 150px;
      overflow-y: auto;
      padding: var(--space-2, 8px) 0;
      background: rgba(8, 14, 20, 0.9);
      border-top: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 12px);
      font-family: var(--font-mono, "Fira Code", "Consolas", "Courier New", monospace);
    }
    .diagnostics-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px var(--space-4, 16px);
      color: var(--ui-text-muted, #8ea1af);
      font-family: var(--font-ui, inherit);
      font-size: var(--font-size-xs, 11px);
      font-weight: var(--font-weight-semibold, 600);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      border-bottom: 1px solid rgba(140, 169, 193, 0.08);
    }
    .diagnostic {
      display: grid;
      grid-template-columns: 18px minmax(72px, auto) 1fr;
      gap: 10px;
      padding: 6px var(--space-4, 16px);
      align-items: baseline;
      border-left: 2px solid transparent;
    }
    .diagnostic:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .diagnostic-icon {
      --mdc-icon-size: 14px;
      align-self: center;
    }
    .diagnostic-location {
      color: var(--ui-text-muted, #8ea1af);
      font-size: var(--font-size-xs, 11px);
      text-align: right;
    }
    .diagnostic-message {
      color: var(--ui-text-primary, #edf6ff);
      overflow-wrap: anywhere;
    }
    .diagnostic-code {
      display: inline-block;
      margin-right: 6px;
      padding: 1px 6px;
      border-radius: var(--radius-sm, 6px);
      background: rgba(140, 169, 193, 0.1);
      color: var(--ui-text-secondary, #8ea6bd);
      font-size: var(--font-size-xs, 11px);
    }
    .diagnostic-error {
      border-left-color: var(--ui-error, #ff7272);
    }
    .diagnostic-error .diagnostic-icon {
      color: var(--ui-error, #ff7272);
    }
    .diagnostic-warning {
      border-left-color: var(--ui-warning, #ffbf47);
    }
    .diagnostic-warning .diagnostic-icon {
      color: var(--ui-warning, #ffbf47);
    }
    .diagnostic-info {
      border-left-color: var(--ui-info, #6bc9ff);
    }
    .diagnostic-info .diagnostic-icon {
      color: var(--ui-info, #6bc9ff);
    }
    .diagnostic-hint {
      border-left-color: var(--ui-disabled, #6c8194);
    }
    .diagnostic-hint .diagnostic-icon {
      color: var(--ui-disabled, #6c8194);
    }
    .tabs-container {
      display: flex;
      gap: 6px;
      padding: 10px 14px 0;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(140, 169, 193, 0.3) transparent;
    }
    .tabs-container::-webkit-scrollbar {
      height: 6px;
    }
    .tabs-container::-webkit-scrollbar-thumb {
      background: rgba(140, 169, 193, 0.22);
      border-radius: 3px;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      background: rgba(255, 255, 255, 0.03);
      color: var(--ui-text-secondary, var(--primary-text-color));
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      font-size: var(--font-size-base, 13px);
      font-family: var(--font-ui, inherit);
      white-space: nowrap;
      transition: var(--transition-fast, all 160ms ease);
      max-width: 220px;
    }
    .tab:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--ui-text-primary);
    }
    .tab:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: -2px;
    }
    .tab.active {
      background: linear-gradient(180deg, rgba(24, 183, 230, 0.16), rgba(255, 255, 255, 0.02));
      border-color: rgba(91, 212, 255, 0.28);
      color: var(--ui-text-primary, var(--primary-text-color));
      box-shadow: inset 0 2px 0 rgba(91, 212, 255, 0.6);
    }
    .tab-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: var(--font-weight-medium, 500);
    }
    .tab-close {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm, 6px);
      opacity: 0.55;
      transition: var(--transition-fast, all 160ms ease);
    }
    .tab-close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
      color: var(--ui-text-primary);
    }
    .tab-close ha-icon {
      --mdc-icon-size: 12px;
    }
    .unsaved-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: var(--ui-warning, var(--warning-color, #ff9800));
      box-shadow: 0 0 6px rgba(255, 191, 71, 0.45);
      flex-shrink: 0;
    }
    .project-sidebar {
      width: 236px;
      min-width: 212px;
      max-width: 260px;
      border-right: 1px solid var(--ui-divider, var(--divider-color));
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 16%),
        var(--ui-bg-card, var(--card-background-color));
    }
    .entity-overlay {
      position: absolute;
      top: 18px;
      left: 18px;
      bottom: 18px;
      width: min(420px, calc(100% - 36px));
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(91, 212, 255, 0.18);
      border-radius: var(--radius-xl, 18px);
      overflow: hidden;
      background: rgba(6, 12, 16, 0.86);
      backdrop-filter: blur(16px);
      box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.42),
        0 0 0 1px rgba(255, 255, 255, 0.03) inset;
      z-index: 3;
    }
    .entity-overlay::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at top left, rgba(24, 183, 230, 0.14), transparent 36%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 18%);
      pointer-events: none;
    }
    .entity-overlay st-entity-browser {
      position: relative;
      z-index: 1;
    }
    .entity-overlay-close {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 2;
      width: 32px;
      height: 32px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      background: rgba(8, 14, 20, 0.82);
      color: var(--ui-text-primary, #edf6ff);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-fast, all 160ms ease);
    }
    .entity-overlay-close:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .entity-overlay-close ha-icon {
      --mdc-icon-size: 16px;
    }
    .toolbar-icon {
      width: 18px;
      height: 18px;
      --mdc-icon-size: 18px;
    }
    .empty-editor {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8, 32px);
      color: var(--ui-text-muted, #8ea1af);
      font-size: var(--font-size-md, 14px);
      text-align: center;
    }
    @media (max-width: 900px) {
      .toolbar {
        padding: 14px 16px 12px;
      }
      .toolbar h1 {
        font-size: 22px;
      }
      .toolbar-subtitle {
        display: none;
      }
      .project-sidebar {
        width: 220px;
        min-width: 200px;
      }
      .entity-overlay {
        top: 12px;
        left: 12px;
        bottom: 12px;
        width: min(380px, calc(100% - 24px));
      }
      .editor-container {
        padding: 12px;
      }
    }
    @media (max-width: 640px) {
      .toolbar {
        flex-direction: column;
        align-items: stretch;
      }
      .toolbar-actions {
        justify-content: flex-end;
      }
      .main-content {
        flex-direction: column;
      }
      .project-sidebar {
        width: 100%;
        max-width: none;
        max-height: 32vh;
      }
      .entity-overlay {
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        width: auto;
      }
    }
  `;

  constructor() {
    super();
    this.narrow = false;
    this._showEntityBrowser = false;
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
    this._isDeploying = false;
    this._deployFeedback = null;
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
          if (project.activeFileId) {
            project.files = project.files.map((file) => ({
              ...file,
              isOpen: file.id === project.activeFileId || file.isOpen,
            }));
          }
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
          this._analyzeCode();
        } else {
          // Migrate from single-file mode
          this._project = this._storage.migrateFromSingleFile(this._code);
          await this._storage.saveProject(this._project);
          this._analyzeCode();
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
            <div class="toolbar-kicker">Structured Text Runtime</div>
            <h1 class="st-h1">ST for Home Assistant</h1>
            <div class="toolbar-subtitle">
              Engineer automations, bind entities, and deploy from one control
              surface.
            </div>
          </div>
          <div class="toolbar-actions" role="toolbar" aria-label="Panel actions">
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
                          <div
                            class="tab-close"
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              this._closeFile(file.id);
                            }}
                            title="Close (middle-click also works)"
                            role="button"
                            aria-label="Close ${file.name}"
                          >
                            <ha-icon icon="mdi:close"></ha-icon>
                          </div>
                        </button>
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
                  <div class="entity-overlay" role="dialog" aria-label="Entity Browser">
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
              <div
                class="diagnostics-panel"
                role="log"
                aria-label="Diagnostics"
                aria-live="polite"
              >
                <div class="diagnostics-header">
                  <ha-icon icon="mdi:message-alert-outline"></ha-icon>
                  <span>Diagnostics (${this._diagnostics.length})</span>
                </div>
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

  private _markProjectSaved(): void {
    if (!this._project) return;
    this._project.files.forEach((file) => {
      file.hasUnsavedChanges = false;
    });
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
    if (this._project) {
      if (!this._project.activeFileId) {
        return "";
      }

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

    void this._saveProject();
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
    void this._saveProject();
    this._analyzeCode();
    this.requestUpdate();
  }

  private _handleFileOpen(e: CustomEvent): void {
    const { fileId } = e.detail;
    this._switchToFile(fileId);
  }

  private _handleFileSelected(e: CustomEvent): void {
    const { fileId } = e.detail;
    if (!fileId) return;
    this._switchToFile(fileId);
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
      void this._saveProject();
    }
  }

  private _handleFileDeleted(e: CustomEvent): void {
    const { fileId } = e.detail;
    if (!this._project) return;

    const remainingFiles = this._project.files.filter((f) => f.id !== fileId);
    let nextActiveId = this._project.activeFileId;
    if (nextActiveId === fileId) {
      const nextOpen = remainingFiles.find((f) => f.isOpen);
      nextActiveId = nextOpen?.id ?? remainingFiles[0]?.id ?? null;
    }

    const normalizedFiles = remainingFiles.map((file) =>
      file.id === nextActiveId ? { ...file, isOpen: true } : file,
    );

    this._project = {
      ...this._project,
      files: normalizedFiles,
      activeFileId: nextActiveId,
      lastModified: Date.now(),
    };

    const editor = this.shadowRoot?.querySelector(
      "st-editor",
    ) as STEditor | null;
    if (editor && nextActiveId) {
      const activeFile = this._project.files.find((f) => f.id === nextActiveId);
      if (activeFile) editor.setCode(activeFile.content);
    }

    void this._saveProject();
    this._analyzeCode();
    this.requestUpdate();
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

    void this._saveProject();
    this._analyzeCode();
    this.requestUpdate();
  }

  private async _saveProject(): Promise<void> {
    if (!this._storage || !this._project) return;
    try {
      await this._storage.saveProject(this._project);
      this._markProjectSaved();
      this.requestUpdate();
    } catch (error) {
      console.error("Failed to save project", error);
    }
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
    if (this._isDeploying) return;

    if (!this._syntaxOk) {
      this._setDeployFeedback(
        "error",
        "Cannot deploy while syntax errors are present.",
      );
      console.error("Cannot deploy: syntax errors present");
      return;
    }

    if (!this.hass?.connection) {
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
      if (transpilerResult.diagnostics.some((d) => d.severity === "Error")) {
        this._setDeployFeedback(
          "error",
          "Cannot deploy because transpilation reported errors.",
        );
        console.error(
          "Cannot deploy: transpiler reported errors",
          transpilerResult.diagnostics,
        );
        return;
      }

      const api = new HAApiClient(this.hass.connection);
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
        const currentState =
          this._onlineState ?? this._createDisconnectedOnlineState();
        editor.setOnlineSettings({
          updateRate: currentState.updateRate,
          showConditions: currentState.showConditions,
          highlightChanges: currentState.highlightChanges,
        });
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

    if (editor) {
      this._onlineState = editor.getOnlineState() ?? this._onlineState;
    }
  }

  private async _toggleEntityBrowser(): Promise<void> {
    if (!this._entityBrowserLoaded && !this._showEntityBrowser) {
      // Lazy load entity browser module when first shown
      await import("../entity-browser");
      this._entityBrowserLoaded = true;
    }
    this._showEntityBrowser = !this._showEntityBrowser;
  }

  private _handleInsertBinding(
    e: CustomEvent<{ bindingSyntax: string }>,
  ): void {
    e.stopPropagation();
    const editor = this.shadowRoot?.querySelector("st-editor") as STEditor | null;
    const bindingSyntax = e.detail?.bindingSyntax;
    if (!editor || !bindingSyntax) return;

    editor.insertBinding(bindingSyntax);
  }

  private _handleRemoveBinding(
    e: CustomEvent<{ entityId: string }>,
  ): void {
    e.stopPropagation();
    const editor = this.shadowRoot?.querySelector("st-editor") as STEditor | null;
    const entityId = e.detail?.entityId;
    if (!editor || !entityId) return;

    editor.removeBinding(entityId);
  }
}
