/**
 * ST Editor Web Component (CodeMirror 6 Wrapper)
 */

import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EditorState, Extension, Compartment } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from "@codemirror/language";
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";

import { structuredText } from "./st-language";
import { stTheme } from "./st-theme";
import {
  liveValuesExtension,
  updateLiveValues,
} from "../online/live-decorations";
import { OnlineStateManager } from "../online/state-manager";
import type { VariableBinding, OnlineModeState } from "../online/types";
import { parse, tokenize } from "../parser";
import { EndVar, Identifier, Program, Var, VarInput, VarOutput } from "../parser/tokens";

import { ENTITY_BINDING_MIME_TYPE } from "../entity-binding";

@customElement("st-editor")
export class STEditor extends LitElement {
  @property({ type: String }) declare code: string;
  @property({ type: Boolean, attribute: "read-only" })
  declare readOnly: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @property({ attribute: false }) declare hass?: any;

  private _editor: EditorView | null = null;
  private _readOnlyCompartment = new Compartment();
  private _onlineManager: OnlineStateManager | null = null;
  private _onlineUnsubscribe: (() => void) | null = null;

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
    /* Ensure selection highlighting is visible but not covering text */
    #editor-container .cm-selectionBackground {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
    #editor-container .cm-focused .cm-selectionBackground {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
    #editor-container .cm-selectionLayer .cm-selectionBackground {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
    /* Native selection as fallback */
    #editor-container .cm-content ::selection {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
    #editor-container .cm-line ::selection {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
  `;

  constructor() {
    super();
    this.code = "";
    this.readOnly = false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) this._initEditor();
  }

  protected updated(changedProperties: PropertyValues): void {
    if (!this._editor) {
      if (this.isConnected) this._initEditor();
      return;
    }
    if (changedProperties.has("readOnly")) {
      this._editor.dispatch({
        effects: this._readOnlyCompartment.reconfigure(
          EditorState.readOnly.of(this.readOnly),
        ),
      });
    }
    if (changedProperties.has("code") && this.getCode() !== this.code) {
      this._editor.setState(this._createEditorState());
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopOnlineMode();
    this._editor?.destroy();
    this._editor = null;
  }

  /**
   * Start online mode with variable bindings
   */
  async startOnlineMode(bindings: VariableBinding[]): Promise<void> {
    if (!this.hass?.connection) {
      throw new Error("Home Assistant connection not available");
    }

    if (!this._onlineManager) {
      this._onlineManager = new OnlineStateManager(this.hass.connection);
      this._onlineUnsubscribe = this._onlineManager.subscribe((state) => {
        if (this._editor && state.liveValues) {
          updateLiveValues(this._editor, state.liveValues);
        }
      });
    }

    await this._onlineManager.start(bindings);
  }

  /**
   * Stop online mode
   */
  stopOnlineMode(): void {
    this._onlineManager?.stop();
    this._onlineUnsubscribe?.();
    this._onlineManager = null;
    this._onlineUnsubscribe = null;
  }

  /**
   * Pause/resume online mode
   */
  setOnlinePaused(paused: boolean): void {
    this._onlineManager?.setPaused(paused);
  }

  setOnlineSettings(settings: {
    updateRate?: number;
    showConditions?: boolean;
    highlightChanges?: boolean;
  }): void {
    if (!this._onlineManager) return;

    if (typeof settings.updateRate === "number") {
      this._onlineManager.setUpdateRate(settings.updateRate);
    }
    if (typeof settings.showConditions === "boolean") {
      this._onlineManager.setShowConditions(settings.showConditions);
    }
    if (typeof settings.highlightChanges === "boolean") {
      this._onlineManager.setHighlightChanges(settings.highlightChanges);
    }
  }

  /**
   * Get current online state
   */
  getOnlineState(): OnlineModeState | null {
    return this._onlineManager?.getState() || null;
  }

  private _initEditor(): void {
    const container = this.shadowRoot?.querySelector<HTMLDivElement>("#editor-container");
    if (!container) return;

    this._editor = new EditorView({
      state: this._createEditorState(),
      parent: container,
      dispatchTransactions: (transactions, view) => {
        view.update(transactions);
        if (transactions.some((transaction) => transaction.docChanged)) {
          this.code = view.state.doc.toString();
          this.dispatchEvent(
            new CustomEvent("code-change", {
              detail: { code: this.code },
              bubbles: true,
              composed: true,
            }),
          );
        }
      },
    });
  }

  private _createEditorState(): EditorState {
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
        indentWithTab,
      ]),
      structuredText(),
      stTheme(),
      liveValuesExtension(),
      EditorView.domEventHandlers({
        keydown: this._stopKeyPropagation,
        keyup: this._stopKeyPropagation,
        keypress: this._stopKeyPropagation,
        dragover: (event: DragEvent) => {
          if (!event.dataTransfer?.types.includes(ENTITY_BINDING_MIME_TYPE)) return false;
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = "copy";
          return true;
        },
        drop: (event: DragEvent) => {
          const bindingSyntax = event.dataTransfer?.getData(ENTITY_BINDING_MIME_TYPE);
          if (!bindingSyntax) return false;
          event.preventDefault();
          event.stopPropagation();
          this.dispatchEvent(new CustomEvent("binding-feedback", {
            detail: this.insertBinding(bindingSyntax),
            bubbles: true,
            composed: true,
          }));
          return true;
        },
      }),
      this._readOnlyCompartment.of(EditorState.readOnly.of(this.readOnly)),
      EditorState.tabSize.of(4),
    ];

    return EditorState.create({ doc: this.code, extensions });
  }

  private _stopKeyPropagation(event: Event): boolean {
    // Home Assistant handles single-letter shortcuts outside the editor.
    event.stopPropagation();
    return false;
  }

  insertBinding(bindingSyntax: string): string {
    if (!this._editor || this.readOnly) return "Open an editable file to insert a binding.";

    const declaration = bindingSyntax.trim().match(/^(\w+)\s+AT\s+(%[IQ]\*)\s*:\s*\w+\s*:=\s*'([^']+)'\s*;$/i);
    if (!declaration) return "This entity binding could not be inserted.";

    const code = this.getCode();
    const { ast } = parse(code);
    if (!ast) return "Fix the Structured Text syntax before inserting a binding.";

    const [, requestedName, address, entityId] = declaration;
    const direction = address.toUpperCase() === "%I*" ? "INPUT" : "OUTPUT";
    if (ast.variables.some((variable) =>
      variable.binding?.entityId === entityId && variable.binding.direction === direction
    )) {
      return `${entityId} already has an ${direction.toLowerCase()} binding.`;
    }

    const nameTokens = tokenize(requestedName).tokens;
    const baseName = nameTokens.length === 1 && nameTokens[0].tokenType === Identifier
      ? requestedName
      : `entity_${requestedName}`;
    const usedNames = new Set(ast.variables.map((variable) => variable.name.toLowerCase()));
    let name = baseName;
    for (let suffix = 2; usedNames.has(name.toLowerCase()); suffix++) {
      name = `${baseName}_${suffix}`;
    }
    const syntax = name + declaration[0].slice(requestedName.length);
    const { insertPos, content } = this._getBindingInsertTarget(code, syntax, direction);

    this._editor.dispatch({
      changes: { from: insertPos, insert: content },
      selection: { anchor: insertPos + content.length },
    });
    this._editor.focus();
    return `Inserted ${direction.toLowerCase()} binding for ${entityId} as ${name}.`;
  }

  removeBinding(entityId: string): string {
    if (!this._editor || this.readOnly) return "Open an editable file to remove a binding.";

    const code = this.getCode();
    const { ast } = parse(code);
    if (!ast) return "Fix the Structured Text syntax before removing a binding.";

    const changes = ast.variables.flatMap((variable) => {
      const end = variable.location;
      const start = variable.pragmas[0]?.location ?? end;
      if (variable.binding?.entityId !== entityId || !start || !end) return [];

      const firstLine = this._editor!.state.doc.line(start.startLine);
      const lastLine = this._editor!.state.doc.line(end.endLine);
      const from = firstLine.from + start.startColumn - 1;
      const to = lastLine.from + end.endColumn;

      // Remove the line break when the declaration occupies the whole line.
      if (!code.slice(firstLine.from, from).trim() && !code.slice(to, lastLine.to).trim()) {
        return [{ from: firstLine.from, to: Math.min(code.length, lastLine.to + 1) }];
      }
      return [{ from, to }];
    });

    if (!changes.length) return `No binding found for ${entityId}.`;
    this._editor.dispatch({ changes });
    this._editor.focus();
    return `Removed binding for ${entityId}.`;
  }

  private _getBindingInsertTarget(
    code: string,
    bindingSyntax: string,
    direction: "INPUT" | "OUTPUT",
  ): { insertPos: number; content: string } {
    const { tokens } = tokenize(code);
    const directionSection = direction === "INPUT" ? VarInput : VarOutput;
    const section = tokens.findIndex((token) =>
      token.tokenType === Var || token.tokenType === directionSection
    );

    if (section !== -1) {
      const end = tokens.slice(section + 1).find((token) => token.tokenType === EndVar)!;
      const lineStart = code.lastIndexOf("\n", end.startOffset - 1) + 1;
      const leading = code.slice(lineStart, end.startOffset);
      const firstDeclaration = tokens[section + 1];
      const declarationLine = code.lastIndexOf("\n", firstDeclaration.startOffset - 1) + 1;
      const declarationIndent = code.slice(declarationLine, firstDeclaration.startOffset);
      const indent = firstDeclaration !== end && !declarationIndent.trim()
        ? declarationIndent
        : "    ";
      return leading.trim()
        ? { insertPos: end.startOffset, content: `\n${indent}${bindingSyntax}\n` }
        : { insertPos: lineStart, content: `${indent}${bindingSyntax}\n` };
    }

    const program = tokens.findIndex((token) => token.tokenType === Program);
    const insertPos = tokens[program + 2].startOffset;
    const lineStart = code.lastIndexOf("\n", insertPos - 1) + 1;
    const inline = code.slice(lineStart, insertPos).trim();
    return {
      insertPos: inline ? insertPos : lineStart,
      content: `${inline ? "\n" : ""}VAR\n    ${bindingSyntax}\nEND_VAR\n`,
    };
  }

  getCode(): string {
    return this._editor?.state.doc.toString() ?? this.code;
  }

  setCode(code: string): void {
    this.code = code;
    this._editor?.setState(this._createEditorState());
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
    "st-editor": STEditor;
  }
}
