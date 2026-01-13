import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('st-panel')
export class STPanel extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @property({ type: Boolean }) public narrow = false;

  @state() private _code: string = `{mode: restart}
{throttle: T#1s}
PROGRAM Kitchen_Light
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';
    light AT %Q* : BOOL := 'light.kitchen';
END_VAR

IF motion THEN
    light := TRUE;
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
      font-weight: 500;
    }
    .editor-container {
      flex: 1;
      overflow: auto;
      padding: 16px;
    }
    .editor {
      width: 100%;
      height: 100%;
      min-height: 400px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 14px;
      padding: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      resize: none;
    }
    .status-bar {
      display: flex;
      gap: 16px;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border-top: 1px solid var(--divider-color);
      font-size: 12px;
    }
    .status-ok { color: var(--success-color, #4caf50); }
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
          <textarea class="editor" .value=${this._code} @input=${this._handleCodeChange} spellcheck="false"></textarea>
        </div>
        <div class="status-bar">
          <span class="status-ok">✓ Syntax OK</span>
          <span>Triggers: 1</span>
          <span>Entities: 2</span>
        </div>
      </div>
    `;
  }

  private _handleCodeChange(e: Event) {
    this._code = (e.target as HTMLTextAreaElement).value;
  }

  private _handleDeploy() {
    console.log('Deploy:', this._code);
  }
}
