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

    // Add drag-and-drop support for entity browser
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._handleDrop(e);
    });
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
