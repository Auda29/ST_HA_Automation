# Task: CodeMirror 6 Spike - ST Syntax-Highlighting

## Kontext

Du implementierst Syntax-Highlighting für Structured Text (IEC 61131-3) in CodeMirror 6 für das "ST for Home Assistant" Projekt.
Dieses Spike-Dokument fokussiert primär auf den Editor (Language, Theme, Web Component) und das Panel-Wiring.
Die eigentliche Parser- und Analyzer-Logik wird in separaten Tasks und Dokumenten beschrieben.

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`
**Voraussetzung:** Repository ist aufgesetzt (01_Repository_Setup.md abgeschlossen)

## Ziel

Erstelle eine CodeMirror 6 Language Extension für Structured Text mit:
- Syntax-Highlighting für alle ST-Elemente
- Custom Pragmas (`{trigger}`, `{persistent}`, etc.)
- TwinCAT-ähnliches Dark Theme
- Integration in das bestehende Panel

---

## Zu erstellende Dateien

```
frontend/src/editor/
├── st-language.ts      # Language Definition + Tokenizer
├── st-theme.ts         # TwinCAT-ähnliches Theme  
├── st-editor.ts        # Editor Web Component
└── index.ts            # Exports
```

---

## frontend/src/editor/st-language.ts

```typescript
/**
 * Structured Text Language Support for CodeMirror 6
 */

import { StreamLanguage } from '@codemirror/language';
import { completeFromList } from '@codemirror/autocomplete';

// ============================================================================
// Token Definitions
// ============================================================================

export const ST_KEYWORDS = [
  'PROGRAM', 'END_PROGRAM',
  'FUNCTION', 'END_FUNCTION',
  'FUNCTION_BLOCK', 'END_FUNCTION_BLOCK',
  'VAR', 'VAR_INPUT', 'VAR_OUTPUT', 'VAR_IN_OUT', 'VAR_GLOBAL', 'END_VAR',
  'CONSTANT',
  'IF', 'THEN', 'ELSIF', 'ELSE', 'END_IF',
  'CASE', 'OF', 'END_CASE',
  'FOR', 'TO', 'BY', 'DO', 'END_FOR',
  'WHILE', 'END_WHILE',
  'REPEAT', 'UNTIL', 'END_REPEAT',
  'EXIT', 'RETURN', 'CONTINUE',
  'AND', 'OR', 'XOR', 'NOT', 'MOD',
  'TRUE', 'FALSE',
  'AT'
];

export const ST_TYPES = [
  'BOOL', 'BYTE', 'WORD', 'DWORD', 'LWORD',
  'SINT', 'INT', 'DINT', 'LINT',
  'USINT', 'UINT', 'UDINT', 'ULINT',
  'REAL', 'LREAL',
  'STRING', 'WSTRING',
  'TIME', 'DATE', 'TIME_OF_DAY', 'DATE_AND_TIME', 'TOD', 'DT'
];

export const ST_BUILTINS = [
  'SEL', 'MUX', 'MAX', 'MIN', 'LIMIT',
  'ABS', 'SQRT', 'LN', 'LOG', 'EXP', 'SIN', 'COS', 'TAN',
  'TRUNC', 'ROUND', 'CEIL', 'FLOOR',
  'TO_BOOL', 'TO_INT', 'TO_DINT', 'TO_REAL', 'TO_LREAL', 'TO_STRING',
  'LEN', 'LEFT', 'RIGHT', 'MID', 'CONCAT', 'FIND'
];

export const ST_FUNCTION_BLOCKS = [
  'R_TRIG', 'F_TRIG', 'SR', 'RS', 'TON', 'TOF', 'TP', 'CTU', 'CTD', 'CTUD'
];

export const ST_PRAGMAS = [
  'trigger', 'no_trigger', 'persistent', 'transient',
  'reset_on_restart', 'require_restore',
  'mode', 'max_queued', 'max_parallel', 'throttle', 'debounce'
];

// ============================================================================
// Tokenizer (StreamLanguage)
// ============================================================================

interface TokenizerState {
  inBlockComment: boolean;
}

export const stLanguage = StreamLanguage.define<TokenizerState>({
  name: 'structuredtext',
  
  startState(): TokenizerState {
    return { inBlockComment: false };
  },
  
  copyState(state: TokenizerState): TokenizerState {
    return { inBlockComment: state.inBlockComment };
  },
  
  token(stream, state): string | null {
    // Whitespace
    if (stream.eatSpace()) return null;
    
    // Block comment (* ... *)
    if (stream.match('(*')) {
      state.inBlockComment = true;
    }
    if (state.inBlockComment) {
      while (!stream.eol()) {
        if (stream.match('*)')) {
          state.inBlockComment = false;
          return 'comment';
        }
        stream.next();
      }
      return 'comment';
    }
    
    // Line comment //
    if (stream.match('//')) {
      stream.skipToEnd();
      return 'comment';
    }
    
    // Pragmas {keyword} or {key: value}
    if (stream.match('{')) {
      let depth = 1;
      while (!stream.eol() && depth > 0) {
        const ch = stream.next();
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
      return 'meta';
    }
    
    // String literals
    if (stream.match("'")) {
      while (!stream.eol()) {
        if (stream.next() === "'" && !stream.match("'")) {
          return 'string';
        }
      }
      return 'string';
    }
    
    // Time literals T#...
    if (stream.match(/T#[\d_hmsdu]+/i) || stream.match(/TIME#[\d_hmsdu]+/i)) {
      return 'number';
    }
    
    // Hex 16#, Binary 2#, Octal 8#
    if (stream.match(/16#[\da-fA-F_]+/) || 
        stream.match(/2#[01_]+/) || 
        stream.match(/8#[0-7_]+/)) {
      return 'number';
    }
    
    // Real numbers
    if (stream.match(/\d+\.\d+([eE][+-]?\d+)?/)) {
      return 'number';
    }
    
    // Integers
    if (stream.match(/\d+/)) {
      return 'number';
    }
    
    // Multi-char operators
    if (stream.match(':=') || stream.match('<=') || stream.match('>=') || 
        stream.match('<>') || stream.match('=>')) {
      return 'operator';
    }
    
    // I/O Addresses %I*, %Q*, %M*
    if (stream.match(/%[IQM][XBWDLxbwdl]?\*?/i)) {
      return 'keyword';
    }
    
    // Identifiers and keywords
    if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const word = stream.current().toUpperCase();
      
      if (ST_KEYWORDS.includes(word)) return 'keyword';
      if (ST_TYPES.includes(word)) return 'typeName';
      if (ST_BUILTINS.includes(word)) return 'function(standard)';
      if (ST_FUNCTION_BLOCKS.includes(word)) return 'className';
      
      return 'variableName';
    }
    
    // Single char operators/punctuation
    if (stream.match(/[+\-*\/=<>()[\];:,.]/)) {
      return 'operator';
    }
    
    stream.next();
    return null;
  },
  
  languageData: {
    commentTokens: { line: '//', block: { open: '(*', close: '*)' } },
    closeBrackets: { brackets: ['(', '[', '{', "'"] }
  }
});

// ============================================================================
// Autocompletion
// ============================================================================

export const stCompletion = completeFromList([
  ...ST_KEYWORDS.map(k => ({ label: k, type: 'keyword' })),
  ...ST_TYPES.map(t => ({ label: t, type: 'type' })),
  ...ST_BUILTINS.map(f => ({ label: f, type: 'function' })),
  ...ST_FUNCTION_BLOCKS.map(fb => ({ label: fb, type: 'class' })),
  ...ST_PRAGMAS.map(p => ({ label: `{${p}}`, type: 'keyword', detail: 'pragma' })),
  { label: 'PROGRAM', type: 'keyword', apply: 'PROGRAM ${name}\nVAR\n\t\nEND_VAR\n\n\nEND_PROGRAM', detail: 'template' },
  { label: 'IF', type: 'keyword', apply: 'IF ${cond} THEN\n\t\nEND_IF;', detail: 'template' },
]);

// ============================================================================
// Language Support Export
// ============================================================================

import { LanguageSupport } from '@codemirror/language';

export function structuredText() {
  return new LanguageSupport(stLanguage, [
    stLanguage.data.of({ autocomplete: stCompletion })
  ]);
}
```

---

## frontend/src/editor/st-theme.ts

```typescript
/**
 * TwinCAT-inspired Dark Theme for ST Editor
 */

import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// Color Palette
const colors = {
  bg: '#1e1e1e',
  bgLight: '#252526',
  fg: '#d4d4d4',
  fgDim: '#808080',
  keyword: '#569cd6',
  type: '#4ec9b0',
  function: '#dcdcaa',
  variable: '#9cdcfe',
  string: '#ce9178',
  number: '#b5cea8',
  comment: '#6a9955',
  pragma: '#c586c0',
  selection: '#264f78',
  cursor: '#aeafad',
  lineHighlight: '#2a2d2e',
  gutterBg: '#1e1e1e',
  gutterFg: '#858585',
  border: '#404040',
};

// Editor Theme
export const stEditorTheme = EditorView.theme({
  '&': {
    color: colors.fg,
    backgroundColor: colors.bg,
    fontSize: '14px',
    fontFamily: '"Fira Code", "Consolas", monospace',
  },
  '.cm-content': {
    caretColor: colors.cursor,
  },
  '.cm-cursor': {
    borderLeftColor: colors.cursor,
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: colors.selection,
  },
  '.cm-activeLine': {
    backgroundColor: colors.lineHighlight,
  },
  '.cm-gutters': {
    backgroundColor: colors.gutterBg,
    color: colors.gutterFg,
    border: 'none',
    borderRight: `1px solid ${colors.border}`,
  },
  '.cm-activeLineGutter': {
    backgroundColor: colors.lineHighlight,
    color: colors.fg,
  },
  '.cm-foldGutter .cm-gutterElement': {
    cursor: 'pointer',
  },
  '.cm-tooltip': {
    backgroundColor: colors.bgLight,
    border: `1px solid ${colors.border}`,
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: colors.selection,
  },
}, { dark: true });

// Syntax Highlighting
export const stHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: colors.keyword, fontWeight: 'bold' },
  { tag: t.typeName, color: colors.type },
  { tag: [t.function(t.variableName), t.standard(t.function(t.variableName))], color: colors.function },
  { tag: t.className, color: colors.type },
  { tag: t.variableName, color: colors.variable },
  { tag: t.propertyName, color: colors.variable },
  { tag: t.string, color: colors.string },
  { tag: t.number, color: colors.number },
  { tag: t.comment, color: colors.comment, fontStyle: 'italic' },
  { tag: t.meta, color: colors.pragma },
  { tag: t.operator, color: colors.fg },
  { tag: t.invalid, color: '#ff0000', textDecoration: 'underline wavy' },
]);

// Combined Theme Export
export function stTheme(): Extension {
  return [stEditorTheme, syntaxHighlighting(stHighlightStyle)];
}
```

---

## frontend/src/editor/st-editor.ts

```typescript
/**
 * ST Editor Web Component (CodeMirror 6 Wrapper)
 */

import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { EditorState, Extension, Compartment } from '@codemirror/state';
import { 
  EditorView, keymap, lineNumbers, highlightActiveLineGutter,
  highlightSpecialChars, drawSelection, highlightActiveLine
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';

import { structuredText } from './st-language';
import { stTheme } from './st-theme';

@customElement('st-editor')
export class STEditor extends LitElement {
  @property({ type: String }) code: string = '';
  @property({ type: Boolean, attribute: 'read-only' }) readOnly: boolean = false;
  
  @query('#editor-container') private _container!: HTMLDivElement;
  
  private _editor: EditorView | null = null;
  private _readOnlyCompartment = new Compartment();

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    #editor-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 4px;
    }
    #editor-container .cm-editor {
      height: 100%;
    }
    #editor-container .cm-scroller {
      overflow: auto;
    }
  `;

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this._initEditor();
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('readOnly') && this._editor) {
      this._editor.dispatch({
        effects: this._readOnlyCompartment.reconfigure(EditorState.readOnly.of(this.readOnly))
      });
    }
    if (changedProperties.has('code') && this._editor) {
      const currentCode = this._editor.state.doc.toString();
      if (currentCode !== this.code) {
        this._editor.dispatch({
          changes: { from: 0, to: currentCode.length, insert: this.code }
        });
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._editor?.destroy();
  }

  private _initEditor(): void {
    if (!this._container) return;

    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        indentWithTab
      ]),
      structuredText(),
      stTheme(),
      this._readOnlyCompartment.of(EditorState.readOnly.of(this.readOnly)),
      EditorState.tabSize.of(4),
    ];

    this._editor = new EditorView({
      state: EditorState.create({ doc: this.code, extensions }),
      parent: this._container,
      dispatch: (tr) => {
        this._editor!.update([tr]);
        if (tr.docChanged) {
          this.dispatchEvent(new CustomEvent('code-change', {
            detail: { code: tr.newDoc.toString() },
            bubbles: true, composed: true
          }));
        }
      }
    });
  }

  getCode(): string {
    return this._editor?.state.doc.toString() ?? this.code;
  }

  setCode(code: string): void {
    this.code = code;
  }

  focus(): void {
    this._editor?.focus();
  }

  render() {
    return html`<div id="editor-container"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'st-editor': STEditor;
  }
}
```

---

## frontend/src/editor/index.ts

```typescript
/**
 * ST Editor Module Exports
 */

export { structuredText, ST_KEYWORDS, ST_TYPES, ST_BUILTINS, ST_FUNCTION_BLOCKS, ST_PRAGMAS } from './st-language';
export { stTheme, stEditorTheme, stHighlightStyle } from './st-theme';
export { STEditor } from './st-editor';
```

---

## Aktualisiertes Panel (frontend/src/panel/st-panel.ts)

Ersetze das bestehende Panel:

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../editor';

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
          <st-editor .code=${this._code} @code-change=${this._handleCodeChange}></st-editor>
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
    console.log('Deploy:', this._code);
  }
}
```

---

## Aktualisierter Index (frontend/src/index.ts)

```typescript
export * from './editor';
import './panel/st-panel';
console.log('ST for Home Assistant loaded');
```

---

## Ausführungsschritte

```bash
cd "C:\##\Projects\ST_HA_Automation\frontend"

# Dateien in src/editor/ erstellen

# Build
npm run build

# Dev-Server (optional)
npm run dev
```

---

## Erfolgskriterien

- [ ] Keywords (IF, THEN, PROGRAM) sind blau + fett
- [ ] Datentypen (BOOL, INT, REAL) sind cyan/teal
- [ ] Strings sind orange
- [ ] Zahlen sind hellgrün
- [ ] Kommentare sind grün + kursiv
- [ ] Pragmas ({trigger}) sind pink/magenta
- [ ] %I* und %Q* sind als Keywords erkannt
- [ ] Autocomplete funktioniert
- [ ] Editor responsive ohne Lag

---

## Nicht in diesem Task (ursprünglicher Scope)

- Parser Implementation (→ 03_Parser_Spike.md)
- Linting/Fehleranzeige
- Entity-Browser Integration

> **Hinweis (Stand: Implementierung)**  
> Die aktuelle `st-panel.ts`-Implementierung integriert bereits:
> - den **Parser** (`parse` aus `frontend/src/parser`) und  
> - den **Dependency Analyzer** (`analyzeDependencies` aus `frontend/src/analyzer`)  
> um Syntaxfehler, Triggers, Metadaten und Diagnostik im Panel anzuzeigen.
>
> Das ist eine **bewusste Scope-Erweiterung** gegenüber diesem ursprünglichen Spike:
> - Der Editor-Spike definiert weiterhin nur den ST-Editor (CodeMirror Language/Theme/Component)  
> - Die Analyse- und Trigger-Logik bleibt fachlich in den Analyzer‑Tasks (`T-004`, `T-005`, `T-007` usw.)  
> - `st-panel.ts` fungiert als Integrationspunkt, der Editor, Parser und Analyzer zusammenführt, ohne deren Verantwortlichkeiten zu vermischen.

