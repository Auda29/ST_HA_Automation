# Task: Live-Werte / Online-Modus

## Kontext

Du implementierst den Online-Modus für das "ST for Home Assistant" Projekt. Dieser zeigt Live-Werte der Variablen direkt im Editor an - wie in TwinCAT.

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`
**Voraussetzung:** Alle vorherigen Phasen abgeschlossen

## Das Feature

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Kitchen_Automation.st                          [● ONLINE] [⏸ Pause]       │
├─────────────────────────────────────────────────────────────────────────────┤
│  1 │ {mode: restart}                                                        │
│  2 │ {throttle: T#1s}                                                       │
│  3 │ PROGRAM Kitchen_Automation                                             │
│  4 │ VAR                                                                    │
│  5 │   {trigger}                                                            │
│  6 │   motion AT %I* : BOOL := '...';            │ TRUE  │ ◀── Live        │
│  7 │   temperature AT %I* : REAL := '...';       │ 21.5  │                  │
│  8 │                                                                        │
│  9 │   {persistent}                                                         │
│ 10 │   counter : INT := 0;                       │ 42    │                  │
│ 11 │                                                                        │
│ 12 │   mainLight AT %Q* : BOOL := '...';         │ TRUE  │                  │
│ 13 │ END_VAR                                                                │
│ 14 │                                                                        │
│ 15 │ IF motion THEN  ────────────────────────────▶│ TRUE  │ ◀── Condition  │
│ 16 │   mainLight := TRUE;                                                   │
│ 17 │   counter := counter + 1;                                              │
│ 18 │ END_IF;                                                                │
│ 19 │                                                                        │
│ 20 │ END_PROGRAM                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Online Mode Architecture                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                 │
│  │ HA WebSocket│      │ State       │      │ Editor      │                 │
│  │ Connection  │◀────▶│ Manager     │─────▶│ Decorations │                 │
│  └─────────────┘      └─────────────┘      └─────────────┘                 │
│         │                    │                    │                         │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  subscribeEntities    entityStates         CodeMirror                      │
│  (real-time)          Map<id, value>       StateField                      │
│                                            Decoration                       │
│                                                                              │
│  Flow:                                                                      │
│  1. WebSocket empfängt State-Changes                                        │
│  2. State Manager filtert relevante Entities                                │
│  3. Editor Decorations werden aktualisiert                                  │
│  4. Inline-Widgets zeigen Live-Werte                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Zu erstellende Dateien

```
frontend/src/online/
├── state-manager.ts         # Entity State Management
├── live-decorations.ts      # CodeMirror Decorations
├── live-widget.ts           # Inline Value Widget
├── online-toolbar.ts        # Toolbar Component
├── types.ts                 # Type Definitions
└── __tests__/
    └── state-manager.test.ts
```

---

## frontend/src/online/types.ts

```typescript
/**
 * Online Mode Type Definitions
 */

// ============================================================================
// Entity State
// ============================================================================

export interface EntityState {
  entityId: string;
  state: string;
  lastChanged: string;
  attributes: Record<string, any>;
}

export interface ParsedValue {
  raw: string;
  formatted: string;
  isValid: boolean;
  dataType: 'BOOL' | 'INT' | 'REAL' | 'STRING' | 'TIME' | 'UNKNOWN';
}

// ============================================================================
// Variable Mapping
// ============================================================================

export interface VariableBinding {
  variableName: string;
  entityId: string;
  dataType: string;
  line: number;
  column: number;
  endColumn: number;
  isInput: boolean;
  isOutput: boolean;
  isPersistent: boolean;
}

export interface LiveValue {
  binding: VariableBinding;
  currentValue: ParsedValue;
  previousValue?: ParsedValue;
  hasChanged: boolean;
  lastUpdate: number;
}

// ============================================================================
// Online Mode State
// ============================================================================

export type OnlineStatus = 'disconnected' | 'connecting' | 'online' | 'paused' | 'error';

export interface OnlineModeState {
  status: OnlineStatus;
  bindings: VariableBinding[];
  liveValues: Map<string, LiveValue>;
  updateRate: number; // ms between updates
  showConditions: boolean;
  highlightChanges: boolean;
  error?: string;
}

// ============================================================================
// Condition Evaluation
// ============================================================================

export interface ConditionValue {
  line: number;
  expression: string;
  result: boolean | null;
  error?: string;
}
```

---

## frontend/src/online/state-manager.ts

```typescript
/**
 * Entity State Manager for Online Mode
 * 
 * Manages WebSocket subscriptions and entity state updates.
 */

import type { 
  EntityState, 
  VariableBinding, 
  LiveValue, 
  ParsedValue,
  OnlineModeState,
  OnlineStatus,
} from './types';

// ============================================================================
// State Manager
// ============================================================================

export class OnlineStateManager {
  private connection: any; // HomeAssistant WebSocket connection
  private bindings: Map<string, VariableBinding> = new Map();
  private entityStates: Map<string, EntityState> = new Map();
  private liveValues: Map<string, LiveValue> = new Map();
  private subscribers: Set<(state: OnlineModeState) => void> = new Set();
  private unsubscribe: (() => void) | null = null;
  
  private status: OnlineStatus = 'disconnected';
  private updateRate: number = 100;
  private showConditions: boolean = true;
  private highlightChanges: boolean = true;

  constructor(connection: any) {
    this.connection = connection;
  }

  /**
   * Start online mode with given variable bindings
   */
  async start(bindings: VariableBinding[]): Promise<void> {
    this.status = 'connecting';
    this.notifySubscribers();

    // Store bindings
    this.bindings.clear();
    for (const binding of bindings) {
      this.bindings.set(binding.variableName, binding);
    }

    // Get unique entity IDs
    const entityIds = new Set(bindings.map(b => b.entityId));

    try {
      // Subscribe to entity state changes
      this.unsubscribe = await this.connection.subscribeEntities(
        (entities: Record<string, EntityState>) => {
          this.handleEntityUpdate(entities);
        }
      );

      this.status = 'online';
      this.notifySubscribers();
    } catch (error) {
      this.status = 'error';
      this.notifySubscribers();
      throw error;
    }
  }

  /**
   * Stop online mode
   */
  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.status = 'disconnected';
    this.liveValues.clear();
    this.notifySubscribers();
  }

  /**
   * Pause/resume updates
   */
  setPaused(paused: boolean): void {
    this.status = paused ? 'paused' : 'online';
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: OnlineModeState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Get current state
   */
  getState(): OnlineModeState {
    return {
      status: this.status,
      bindings: Array.from(this.bindings.values()),
      liveValues: this.liveValues,
      updateRate: this.updateRate,
      showConditions: this.showConditions,
      highlightChanges: this.highlightChanges,
    };
  }

  /**
   * Get live value for a variable
   */
  getLiveValue(variableName: string): LiveValue | null {
    return this.liveValues.get(variableName) || null;
  }

  // ==========================================================================
  // Internal Methods
  // ==========================================================================

  private handleEntityUpdate(entities: Record<string, EntityState>): void {
    if (this.status === 'paused') return;

    const now = Date.now();

    // Update entity states
    for (const [entityId, state] of Object.entries(entities)) {
      this.entityStates.set(entityId, state);
    }

    // Update live values for bound variables
    for (const [varName, binding] of this.bindings) {
      const entityState = this.entityStates.get(binding.entityId);
      if (!entityState) continue;

      const currentValue = this.parseValue(entityState.state, binding.dataType);
      const existingLive = this.liveValues.get(varName);

      const liveValue: LiveValue = {
        binding,
        currentValue,
        previousValue: existingLive?.currentValue,
        hasChanged: existingLive 
          ? existingLive.currentValue.raw !== currentValue.raw
          : false,
        lastUpdate: now,
      };

      this.liveValues.set(varName, liveValue);
    }

    this.notifySubscribers();
  }

  private parseValue(raw: string, expectedType: string): ParsedValue {
    const invalid = ['unavailable', 'unknown', 'none', ''];
    
    if (invalid.includes(raw.toLowerCase())) {
      return {
        raw,
        formatted: '—',
        isValid: false,
        dataType: 'UNKNOWN',
      };
    }

    switch (expectedType.toUpperCase()) {
      case 'BOOL':
        const boolValue = ['on', 'true', '1'].includes(raw.toLowerCase());
        return {
          raw,
          formatted: boolValue ? 'TRUE' : 'FALSE',
          isValid: true,
          dataType: 'BOOL',
        };

      case 'INT':
      case 'DINT':
        const intValue = parseInt(raw);
        return {
          raw,
          formatted: isNaN(intValue) ? '—' : String(intValue),
          isValid: !isNaN(intValue),
          dataType: 'INT',
        };

      case 'REAL':
      case 'LREAL':
        const floatValue = parseFloat(raw);
        return {
          raw,
          formatted: isNaN(floatValue) ? '—' : floatValue.toFixed(2),
          isValid: !isNaN(floatValue),
          dataType: 'REAL',
        };

      case 'STRING':
        return {
          raw,
          formatted: raw.length > 20 ? raw.substring(0, 17) + '...' : raw,
          isValid: true,
          dataType: 'STRING',
        };

      case 'TIME':
        return {
          raw,
          formatted: raw,
          isValid: true,
          dataType: 'TIME',
        };

      default:
        return {
          raw,
          formatted: raw,
          isValid: true,
          dataType: 'UNKNOWN',
        };
    }
  }

  private notifySubscribers(): void {
    const state = this.getState();
    for (const callback of this.subscribers) {
      callback(state);
    }
  }
}

// ============================================================================
// Value Formatter
// ============================================================================

export class ValueFormatter {
  /**
   * Format value for display with appropriate styling
   */
  static format(value: ParsedValue): { text: string; className: string } {
    if (!value.isValid) {
      return { text: value.formatted, className: 'st-live-value--invalid' };
    }

    switch (value.dataType) {
      case 'BOOL':
        return {
          text: value.formatted,
          className: value.formatted === 'TRUE' 
            ? 'st-live-value--bool-true' 
            : 'st-live-value--bool-false',
        };

      case 'INT':
        return { text: value.formatted, className: 'st-live-value--int' };

      case 'REAL':
        return { text: value.formatted, className: 'st-live-value--real' };

      case 'STRING':
        return { text: `"${value.formatted}"`, className: 'st-live-value--string' };

      default:
        return { text: value.formatted, className: 'st-live-value--unknown' };
    }
  }

  /**
   * Format with change highlight
   */
  static formatWithChange(live: LiveValue): { text: string; className: string } {
    const base = this.format(live.currentValue);
    
    if (live.hasChanged) {
      base.className += ' st-live-value--changed';
    }
    
    return base;
  }
}
```

---

## frontend/src/online/live-decorations.ts

```typescript
/**
 * CodeMirror Live Value Decorations
 * 
 * Adds inline widgets showing live values next to variables.
 */

import {
  EditorView,
  Decoration,
  DecorationSet,
  WidgetType,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { StateField, StateEffect, Extension } from '@codemirror/state';
import type { LiveValue, OnlineModeState, VariableBinding } from './types';
import { ValueFormatter } from './state-manager';

// ============================================================================
// State Effects
// ============================================================================

export const setLiveValuesEffect = StateEffect.define<Map<string, LiveValue>>();
export const setOnlineStatusEffect = StateEffect.define<OnlineModeState['status']>();

// ============================================================================
// Live Value Widget
// ============================================================================

class LiveValueWidget extends WidgetType {
  constructor(
    private value: LiveValue,
    private showChange: boolean
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.className = 'st-live-value-widget';

    const formatted = this.showChange
      ? ValueFormatter.formatWithChange(this.value)
      : ValueFormatter.format(this.value.currentValue);

    const valueSpan = document.createElement('span');
    valueSpan.className = `st-live-value ${formatted.className}`;
    valueSpan.textContent = formatted.text;

    // Add tooltip with entity ID
    valueSpan.title = `${this.value.binding.entityId}\nLast update: ${new Date(this.value.lastUpdate).toLocaleTimeString()}`;

    wrapper.appendChild(valueSpan);
    return wrapper;
  }

  eq(other: LiveValueWidget): boolean {
    return (
      this.value.currentValue.raw === other.value.currentValue.raw &&
      this.value.hasChanged === other.value.hasChanged
    );
  }

  ignoreEvent(): boolean {
    return false;
  }
}

// ============================================================================
// Decoration State Field
// ============================================================================

const liveValueDecorations = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(decorations, tr) {
    // Check for live value updates
    for (const effect of tr.effects) {
      if (effect.is(setLiveValuesEffect)) {
        return buildDecorations(tr.state.doc.toString(), effect.value);
      }
    }
    
    // Map decorations through document changes
    if (tr.docChanged) {
      decorations = decorations.map(tr.changes);
    }
    
    return decorations;
  },

  provide: field => EditorView.decorations.from(field),
});

// ============================================================================
// Build Decorations
// ============================================================================

function buildDecorations(
  doc: string,
  liveValues: Map<string, LiveValue>
): DecorationSet {
  const decorations: Array<{ from: number; to: number; decoration: Decoration }> = [];
  const lines = doc.split('\n');
  let pos = 0;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const lineEnd = pos + line.length;

    // Find variable declarations on this line
    for (const [varName, liveValue] of liveValues) {
      if (liveValue.binding.line === lineNum + 1) {
        // Add widget at end of line
        const widget = Decoration.widget({
          widget: new LiveValueWidget(liveValue, true),
          side: 1,
        });

        decorations.push({
          from: lineEnd,
          to: lineEnd,
          decoration: widget,
        });
      }
    }

    pos = lineEnd + 1; // +1 for newline
  }

  // Sort by position and create DecorationSet
  decorations.sort((a, b) => a.from - b.from);
  return Decoration.set(
    decorations.map(d => d.decoration.range(d.from, d.to))
  );
}

// ============================================================================
// Online Mode Status Line Widget
// ============================================================================

class OnlineStatusWidget extends WidgetType {
  constructor(private status: OnlineModeState['status']) {
    super();
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'st-online-status';

    const indicator = document.createElement('span');
    indicator.className = `st-online-indicator st-online-indicator--${this.status}`;

    const statusText: Record<OnlineModeState['status'], string> = {
      disconnected: 'Offline',
      connecting: 'Verbinde...',
      online: 'Online',
      paused: 'Pausiert',
      error: 'Fehler',
    };

    indicator.textContent = statusText[this.status];
    wrapper.appendChild(indicator);

    return wrapper;
  }
}

// ============================================================================
// CSS Styles
// ============================================================================

export const liveValueStyles = EditorView.baseTheme({
  '.st-live-value-widget': {
    marginLeft: '16px',
    display: 'inline-flex',
    alignItems: 'center',
  },

  '.st-live-value': {
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: 'var(--st-live-bg, #2d2d30)',
    border: '1px solid var(--st-live-border, #3c3c3c)',
    minWidth: '60px',
    textAlign: 'right',
  },

  '.st-live-value--bool-true': {
    color: '#4ec9b0',
    backgroundColor: 'rgba(78, 201, 176, 0.1)',
    borderColor: '#4ec9b0',
  },

  '.st-live-value--bool-false': {
    color: '#808080',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderColor: '#808080',
  },

  '.st-live-value--int': {
    color: '#b5cea8',
  },

  '.st-live-value--real': {
    color: '#dcdcaa',
  },

  '.st-live-value--string': {
    color: '#ce9178',
  },

  '.st-live-value--invalid': {
    color: '#f44747',
    fontStyle: 'italic',
  },

  '.st-live-value--changed': {
    animation: 'st-value-flash 0.5s ease-out',
    boxShadow: '0 0 4px var(--st-change-glow, #569cd6)',
  },

  '@keyframes st-value-flash': {
    '0%': { backgroundColor: 'rgba(86, 156, 214, 0.3)' },
    '100%': { backgroundColor: 'var(--st-live-bg, #2d2d30)' },
  },

  '.st-online-status': {
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: '10',
  },

  '.st-online-indicator': {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },

  '.st-online-indicator--online': {
    backgroundColor: 'rgba(78, 201, 176, 0.2)',
    color: '#4ec9b0',
  },

  '.st-online-indicator--paused': {
    backgroundColor: 'rgba(220, 220, 170, 0.2)',
    color: '#dcdcaa',
  },

  '.st-online-indicator--disconnected': {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    color: '#808080',
  },

  '.st-online-indicator--connecting': {
    backgroundColor: 'rgba(86, 156, 214, 0.2)',
    color: '#569cd6',
  },

  '.st-online-indicator--error': {
    backgroundColor: 'rgba(244, 71, 71, 0.2)',
    color: '#f44747',
  },
});

// ============================================================================
// Extension Export
// ============================================================================

export function liveValuesExtension(): Extension {
  return [
    liveValueDecorations,
    liveValueStyles,
  ];
}

// ============================================================================
// Update Helper
// ============================================================================

export function updateLiveValues(
  view: EditorView,
  liveValues: Map<string, LiveValue>
): void {
  view.dispatch({
    effects: setLiveValuesEffect.of(liveValues),
  });
}
```

---

## frontend/src/online/online-toolbar.ts

```typescript
/**
 * Online Mode Toolbar Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { OnlineModeState, OnlineStatus } from './types';

@customElement('st-online-toolbar')
export class OnlineToolbar extends LitElement {
  @property({ type: Object }) state!: OnlineModeState;
  
  @state() private _showSettings: boolean = false;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border-bottom: 1px solid var(--divider-color);
    }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot--online {
      background: #4ec9b0;
      box-shadow: 0 0 4px #4ec9b0;
    }

    .status-dot--paused {
      background: #dcdcaa;
    }

    .status-dot--connecting {
      background: #569cd6;
      animation: pulse 1s infinite;
    }

    .status-dot--disconnected {
      background: #808080;
    }

    .status-dot--error {
      background: #f44747;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-text {
      font-size: 13px;
      font-weight: 500;
    }

    .controls {
      display: flex;
      gap: 8px;
    }

    button {
      padding: 6px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    button:hover {
      background: var(--secondary-background-color);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .spacer {
      flex: 1;
    }

    .stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .settings-panel {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 100;
    }

    .setting {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .setting:last-child {
      margin-bottom: 0;
    }

    .setting label {
      font-size: 13px;
    }
  `;

  private get statusText(): string {
    const texts: Record<OnlineStatus, string> = {
      disconnected: 'Offline',
      connecting: 'Verbinde...',
      online: 'Online',
      paused: 'Pausiert',
      error: 'Fehler',
    };
    return texts[this.state?.status || 'disconnected'];
  }

  private get isOnline(): boolean {
    return this.state?.status === 'online';
  }

  private get isPaused(): boolean {
    return this.state?.status === 'paused';
  }

  private get canConnect(): boolean {
    return ['disconnected', 'error'].includes(this.state?.status || 'disconnected');
  }

  render() {
    return html`
      <div class="status">
        <span class="status-dot status-dot--${this.state?.status || 'disconnected'}"></span>
        <span class="status-text">${this.statusText}</span>
      </div>

      <div class="controls">
        ${this.canConnect ? html`
          <button @click=${this._handleConnect}>
            ▶ Verbinden
          </button>
        ` : html`
          <button 
            @click=${this._handleTogglePause}
            class="${this.isPaused ? 'active' : ''}"
          >
            ${this.isPaused ? '▶ Fortsetzen' : '⏸ Pause'}
          </button>
          <button @click=${this._handleDisconnect}>
            ⏹ Beenden
          </button>
        `}
      </div>

      <div class="spacer"></div>

      <div class="stats">
        <div class="stat">
          📊 ${this.state?.liveValues?.size || 0} Variablen
        </div>
        <div class="stat">
          ⚡ ${this.state?.updateRate || 100}ms
        </div>
      </div>

      <div style="position: relative;">
        <button @click=${() => this._showSettings = !this._showSettings}>
          ⚙️
        </button>
        ${this._showSettings ? this._renderSettings() : ''}
      </div>
    `;
  }

  private _renderSettings() {
    return html`
      <div class="settings-panel">
        <div class="setting">
          <input 
            type="checkbox" 
            id="highlight"
            .checked=${this.state?.highlightChanges}
            @change=${this._handleHighlightChange}
          >
          <label for="highlight">Änderungen hervorheben</label>
        </div>
        <div class="setting">
          <input 
            type="checkbox" 
            id="conditions"
            .checked=${this.state?.showConditions}
            @change=${this._handleConditionsChange}
          >
          <label for="conditions">Bedingungen anzeigen</label>
        </div>
        <div class="setting">
          <label>Update-Rate:</label>
          <select @change=${this._handleRateChange}>
            <option value="50" ?selected=${this.state?.updateRate === 50}>50ms</option>
            <option value="100" ?selected=${this.state?.updateRate === 100}>100ms</option>
            <option value="250" ?selected=${this.state?.updateRate === 250}>250ms</option>
            <option value="500" ?selected=${this.state?.updateRate === 500}>500ms</option>
          </select>
        </div>
      </div>
    `;
  }

  private _handleConnect(): void {
    this.dispatchEvent(new CustomEvent('connect'));
  }

  private _handleDisconnect(): void {
    this.dispatchEvent(new CustomEvent('disconnect'));
  }

  private _handleTogglePause(): void {
    this.dispatchEvent(new CustomEvent('toggle-pause'));
  }

  private _handleHighlightChange(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(new CustomEvent('setting-change', {
      detail: { setting: 'highlightChanges', value: checked },
    }));
  }

  private _handleConditionsChange(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(new CustomEvent('setting-change', {
      detail: { setting: 'showConditions', value: checked },
    }));
  }

  private _handleRateChange(e: Event): void {
    const value = parseInt((e.target as HTMLSelectElement).value);
    this.dispatchEvent(new CustomEvent('setting-change', {
      detail: { setting: 'updateRate', value },
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'st-online-toolbar': OnlineToolbar;
  }
}
```

---

## Integration in Editor

```typescript
// In st-editor.ts erweitern

import { OnlineStateManager } from '../online/state-manager';
import { liveValuesExtension, updateLiveValues } from '../online/live-decorations';
import type { VariableBinding, OnlineModeState } from '../online/types';

@customElement('st-editor')
export class STEditor extends LitElement {
  // ... existing code ...
  
  private _onlineManager: OnlineStateManager | null = null;
  private _onlineUnsubscribe: (() => void) | null = null;

  @property({ type: Boolean, attribute: 'online-mode' })
  onlineMode: boolean = false;

  @state()
  private _onlineState: OnlineModeState | null = null;

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this._initEditor();
    
    // Add live values extension
    if (this.onlineMode) {
      this._enableOnlineMode();
    }
  }

  private _initEditor(): void {
    const extensions: Extension[] = [
      // ... existing extensions ...
      liveValuesExtension(),
    ];
    
    // ... rest of init ...
  }

  private _enableOnlineMode(): void {
    if (!this.hass?.connection) return;
    
    this._onlineManager = new OnlineStateManager(this.hass.connection);
    this._onlineUnsubscribe = this._onlineManager.subscribe(state => {
      this._onlineState = state;
      
      // Update editor decorations
      if (this._editor && state.liveValues) {
        updateLiveValues(this._editor, state.liveValues);
      }
    });
  }

  async startOnlineMode(bindings: VariableBinding[]): Promise<void> {
    if (!this._onlineManager) {
      this._enableOnlineMode();
    }
    await this._onlineManager?.start(bindings);
  }

  stopOnlineMode(): void {
    this._onlineManager?.stop();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._onlineUnsubscribe?.();
    this._onlineManager?.stop();
  }
}
```

---

## frontend/src/online/__tests__/state-manager.test.ts

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OnlineStateManager, ValueFormatter } from '../state-manager';
import type { VariableBinding } from '../types';

describe('OnlineStateManager', () => {
  let manager: OnlineStateManager;
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {
      subscribeEntities: vi.fn().mockResolvedValue(() => {}),
    };
    manager = new OnlineStateManager(mockConnection);
  });

  it('starts in disconnected state', () => {
    expect(manager.getState().status).toBe('disconnected');
  });

  it('transitions to online on start', async () => {
    const bindings: VariableBinding[] = [
      {
        variableName: 'motion',
        entityId: 'binary_sensor.motion',
        dataType: 'BOOL',
        line: 6,
        column: 5,
        endColumn: 40,
        isInput: true,
        isOutput: false,
        isPersistent: false,
      },
    ];

    await manager.start(bindings);
    expect(manager.getState().status).toBe('online');
  });

  it('notifies subscribers on state change', async () => {
    const callback = vi.fn();
    manager.subscribe(callback);

    await manager.start([]);
    expect(callback).toHaveBeenCalled();
  });

  it('stops and clears values', async () => {
    await manager.start([]);
    manager.stop();
    
    expect(manager.getState().status).toBe('disconnected');
    expect(manager.getState().liveValues.size).toBe(0);
  });

  it('pauses updates', async () => {
    await manager.start([]);
    manager.setPaused(true);
    
    expect(manager.getState().status).toBe('paused');
  });
});

describe('ValueFormatter', () => {
  
  it('formats BOOL true', () => {
    const result = ValueFormatter.format({
      raw: 'on',
      formatted: 'TRUE',
      isValid: true,
      dataType: 'BOOL',
    });
    
    expect(result.text).toBe('TRUE');
    expect(result.className).toContain('bool-true');
  });

  it('formats BOOL false', () => {
    const result = ValueFormatter.format({
      raw: 'off',
      formatted: 'FALSE',
      isValid: true,
      dataType: 'BOOL',
    });
    
    expect(result.text).toBe('FALSE');
    expect(result.className).toContain('bool-false');
  });

  it('formats invalid value', () => {
    const result = ValueFormatter.format({
      raw: 'unavailable',
      formatted: '—',
      isValid: false,
      dataType: 'UNKNOWN',
    });
    
    expect(result.text).toBe('—');
    expect(result.className).toContain('invalid');
  });

  it('formats REAL', () => {
    const result = ValueFormatter.format({
      raw: '21.5',
      formatted: '21.50',
      isValid: true,
      dataType: 'REAL',
    });
    
    expect(result.text).toBe('21.50');
    expect(result.className).toContain('real');
  });

  it('adds changed class when hasChanged', () => {
    const result = ValueFormatter.formatWithChange({
      binding: {} as any,
      currentValue: {
        raw: '10',
        formatted: '10',
        isValid: true,
        dataType: 'INT',
      },
      previousValue: {
        raw: '5',
        formatted: '5',
        isValid: true,
        dataType: 'INT',
      },
      hasChanged: true,
      lastUpdate: Date.now(),
    });
    
    expect(result.className).toContain('changed');
  });
});
```

---

## Erfolgskriterien

- [ ] WebSocket-Verbindung wird aufgebaut
- [ ] Entity-States werden in Echtzeit empfangen
- [ ] Live-Werte erscheinen neben Variablen
- [ ] BOOL zeigt TRUE/FALSE in Farbe
- [ ] Zahlen sind formatiert
- [ ] Änderungen werden hervorgehoben (Flash)
- [ ] Pause/Resume funktioniert
- [ ] Status-Indikator zeigt Verbindungsstatus
- [ ] Tooltip zeigt Entity-ID und Timestamp
- [ ] Alle Tests bestehen

---

## Nicht in diesem Task

- Condition-Evaluation im Live-Modus
- Force-Values (Werte manuell setzen)
- Breakpoints
- Schritt-für-Schritt Ausführung
