import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../editor";

@customElement("st-panel")
export class STPanel extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @property({ type: Boolean }) public narrow = false;

  @state() private _code: string = `{mode: restart}
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
    }
    .status-ok {
      color: var(--success-color, #4caf50);
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <div class="container">
        <div class="toolbar">
          <h1>ST for Home Assistant</h1>
          <button @click=${this._handleDeploy}>▶ Deploy</button>
        </div>
        <div class="editor-container">
          <st-editor
            .code=${this._code}
            @code-change=${this._handleCodeChange}
          ></st-editor>
        </div>
        <div class="status-bar">
          <span class="status-ok">✓ Syntax OK</span>
          <span>Triggers: 1</span>
          <span>Entities: 3</span>
          <span>Mode: restart</span>
        </div>
      </div>
    `;
  }

  private _handleCodeChange(e: CustomEvent<{ code: string }>) {
    this._code = e.detail.code;
  }

  private _handleDeploy() {
    console.log("Deploy:", this._code);
  }
}
