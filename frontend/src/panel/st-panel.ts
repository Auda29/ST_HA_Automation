import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../editor";
import { parse } from "../parser";
import { analyzeDependencies } from "../analyzer";
import type { TriggerConfig, AnalysisMetadata } from "../analyzer/types";

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

  @state() declare private _code: string;
  @state() declare private _syntaxOk: boolean;
  @state() declare private _triggers: TriggerConfig[];
  @state() declare private _diagnostics: CombinedDiagnostic[];
  @state() declare private _metadata: AnalysisMetadata | null;
  @state() declare private _entityCount: number;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--primary-background-color);
    }
    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--app-header-background-color);
      color: var(--app-header-text-color);
      border-bottom: 1px solid var(--divider-color);
    }
    .toolbar h1 {
      margin: 0;
      font-size: 20px;
    }
    .editor-container {
      flex: 1;
      overflow: hidden;
      padding: 16px;
    }
    st-editor {
      height: 100%;
      border-radius: 4px;
    }
    .status-bar {
      display: flex;
      gap: 16px;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border-top: 1px solid var(--divider-color);
      font-size: 12px;
      flex-wrap: wrap;
    }
    .status-ok {
      color: var(--success-color, #4caf50);
    }
    .status-error {
      color: var(--error-color, #f44336);
    }
    .status-warning {
      color: var(--warning-color, #ff9800);
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .diagnostics-panel {
      max-height: 150px;
      overflow-y: auto;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border-top: 1px solid var(--divider-color);
      font-size: 12px;
      font-family: monospace;
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
  `;

  constructor() {
    super();
    this.narrow = false;
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
END_IF;

END_PROGRAM`;
    this._syntaxOk = true;
    this._triggers = [];
    this._diagnostics = [];
    this._metadata = null;
    this._entityCount = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    // Run initial analysis
    this._analyzeCode();
  }

  render() {
    const errorCount = this._diagnostics.filter((d) => d.severity === "Error").length;
    const warningCount = this._diagnostics.filter((d) => d.severity === "Warning").length;

    return html`
      <div class="container">
        <div class="toolbar">
          <h1>ST for Home Assistant</h1>
          <button @click=${this._handleDeploy} ?disabled=${!this._syntaxOk}>
            ▶ Deploy
          </button>
        </div>
        <div class="editor-container">
          <st-editor
            .code=${this._code}
            @code-change=${this._handleCodeChange}
          ></st-editor>
        </div>
        ${this._diagnostics.length > 0
          ? html`
              <div class="diagnostics-panel">
                ${this._diagnostics.map(
                  (d) => html`
                    <div class="diagnostic diagnostic-${d.severity.toLowerCase()}">
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
            ? html`<span class="status-warning">${warningCount} Warning(s)</span>`
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
    this._code = e.detail.code;
    this._analyzeCode();
  }

  /**
   * Parse and analyze the current code
   * Updates all reactive state with results
   */
  private _analyzeCode(): void {
    const diagnostics: CombinedDiagnostic[] = [];

    // Step 1: Parse the code
    const parseResult = parse(this._code);

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

  private _handleDeploy() {
    if (!this._syntaxOk) {
      console.error("Cannot deploy: syntax errors present");
      return;
    }

    console.log("Deploy:", this._code);
    console.log("Triggers:", this._triggers);
    console.log("Metadata:", this._metadata);

    // TODO: Implement actual deployment to Home Assistant
  }
}
