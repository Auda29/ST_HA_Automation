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

  protected async firstUpdated(
    _changedProperties: PropertyValues,
  ): Promise<void> {
    console.log("STEditor.firstUpdated called");
    // Wait for the update to complete, then initialize editor
    await this.updateComplete;
    console.log("STEditor: updateComplete resolved");
    // Additional frame to ensure DOM is painted
    await new Promise((resolve) => requestAnimationFrame(resolve));
    console.log("STEditor: requestAnimationFrame resolved");
    this._initEditor();
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("readOnly") && this._editor) {
      this._editor.dispatch({
        effects: this._readOnlyCompartment.reconfigure(
          EditorState.readOnly.of(this.readOnly),
        ),
      });
    }
    if (changedProperties.has("code") && this._editor) {
      const currentCode = this._editor.state.doc.toString();
      if (currentCode !== this.code) {
        this._editor.dispatch({
          changes: { from: 0, to: currentCode.length, insert: this.code },
        });
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._onlineUnsubscribe?.();
    this._onlineManager?.stop();
    this._editor?.destroy();
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
    // Query the shadow DOM directly instead of relying on @query decorator
    const container = this.shadowRoot?.querySelector(
      "#editor-container",
    ) as HTMLDivElement | null;
    console.log("STEditor._initEditor called, container:", container);
    if (!container) {
      console.error("STEditor: container not found!");
      return;
    }

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
        dragover: (event: DragEvent) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "copy";
          }
          return true;
        },
        drop: (event: DragEvent) => {
          event.preventDefault();
          event.stopPropagation();
          this._handleDrop(event);
          return true;
        },
      }),
      this._readOnlyCompartment.of(EditorState.readOnly.of(this.readOnly)),
      EditorState.tabSize.of(4),
    ];

    this._editor = new EditorView({
      state: EditorState.create({ doc: this.code, extensions }),
      parent: container,
      dispatch: (tr) => {
        this._editor!.update([tr]);
        if (tr.docChanged) {
          this.dispatchEvent(
            new CustomEvent("code-change", {
              detail: { code: tr.newDoc.toString() },
              bubbles: true,
              composed: true,
            }),
          );
        }
      },
    });

    // Stop keyboard events from propagating to Home Assistant's global handlers
    // HA uses shortcuts like 'a' for assistant, 'm' for menu, etc.
    container.addEventListener("keydown", (e) => e.stopPropagation());
    container.addEventListener("keyup", (e) => e.stopPropagation());
    container.addEventListener("keypress", (e) => e.stopPropagation());

  }

  /**
   * Handle drop event from entity browser
   */
  private _handleDrop(e: DragEvent): void {
    if (!this._editor || !e.dataTransfer) return;

    // Try to get the binding syntax from the drag data
    let bindingSyntax = e.dataTransfer.getData("text/plain");
    
    // If no text data, try JSON data
    if (!bindingSyntax) {
      try {
        const jsonData = e.dataTransfer.getData("application/json");
        if (jsonData) {
          const dragData = JSON.parse(jsonData);
          bindingSyntax = dragData.bindingSyntax;
        }
      } catch (err) {
        console.error("Failed to parse drag data", err);
        return;
      }
    }

    if (!bindingSyntax) return;

    // Get cursor position from mouse coordinates
    const pos = this._editor.posAtCoords({
      x: e.clientX,
      y: e.clientY,
    });

    if (pos === null) {
      // Fallback to current selection or end of document
      const selection = this._editor.state.selection.main;
      const insertPos = selection.empty ? selection.head : selection.from;
      this._editor.dispatch({
        changes: { from: insertPos, insert: bindingSyntax },
        selection: { anchor: insertPos + bindingSyntax.length },
      });
    } else {
      // Insert at the drop position
      this._editor.dispatch({
        changes: { from: pos, insert: bindingSyntax },
        selection: { anchor: pos + bindingSyntax.length },
      });
    }

    // Focus the editor after insertion
    this._editor.focus();
  }

  insertBinding(bindingSyntax: string): void {
    if (!this._editor || !bindingSyntax) return;

    const code = this.getCode();
    if (code.includes(bindingSyntax)) {
      return;
    }

    const { insertPos, content } = this._getBindingInsertTarget(code, bindingSyntax);

    this._editor.dispatch({
      changes: { from: insertPos, insert: content },
      selection: { anchor: insertPos + content.length },
    });
    this._editor.focus();
  }

  removeBinding(entityId: string): void {
    if (!this._editor || !entityId) return;

    const doc = this.getCode();
    const lines = doc.split("\n");
    const nextLines = lines.filter((line) => !line.includes(`'${entityId}'`));

    if (nextLines.length === lines.length) {
      return;
    }

    this._editor.dispatch({
      changes: { from: 0, to: doc.length, insert: nextLines.join("\n") },
    });
    this._editor.focus();
  }

  private _getBindingInsertTarget(
    code: string,
    bindingSyntax: string,
  ): { insertPos: number; content: string } {
    const lines = code.split("\n");
    const lineStarts = this._getLineStarts(lines);
    const declarationBlock = this._findDeclarationBlock(lines);

    if (declarationBlock) {
      const indent = this._getDeclarationIndent(
        lines,
        declarationBlock.startLine,
        declarationBlock.endLine,
      );
      return {
        insertPos: lineStarts[declarationBlock.endLine],
        content: `${indent}${bindingSyntax}\n`,
      };
    }

    const headerLine = lines.findIndex((line) =>
      /^\s*(PROGRAM|FUNCTION_BLOCK|FUNCTION)\b/i.test(line),
    );
    if (headerLine !== -1) {
      const insertAtLine = Math.min(headerLine + 1, lines.length - 1);
      return {
        insertPos: lineStarts[insertAtLine],
        content: `VAR\n    ${bindingSyntax}\nEND_VAR\n`,
      };
    }

    const prefix = code.length > 0 && !code.endsWith("\n") ? "\n" : "";
    return {
      insertPos: code.length,
      content: `${prefix}VAR\n    ${bindingSyntax}\nEND_VAR\n`,
    };
  }

  private _findDeclarationBlock(
    lines: string[],
  ): { startLine: number; endLine: number } | null {
    let startLine = -1;
    for (let index = 0; index < lines.length; index += 1) {
      const trimmed = lines[index].trim().toUpperCase();
      if (/^VAR(?:_(INPUT|OUTPUT|IN_OUT|GLOBAL|TEMP))?$/.test(trimmed)) {
        startLine = index;
        continue;
      }

      if (trimmed === "END_VAR" && startLine !== -1) {
        return { startLine, endLine: index };
      }
    }

    return null;
  }

  private _getDeclarationIndent(
    lines: string[],
    startLine: number,
    endLine: number,
  ): string {
    for (let index = startLine + 1; index < endLine; index += 1) {
      const match = lines[index].match(/^(\s*)\S/);
      if (match) {
        return match[1];
      }
    }

    return "    ";
  }

  private _getLineStarts(lines: string[]): number[] {
    const starts: number[] = [];
    let offset = 0;

    for (const line of lines) {
      starts.push(offset);
      offset += line.length + 1;
    }

    return starts;
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
    "st-editor": STEditor;
  }
}
