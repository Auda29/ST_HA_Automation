/**
 * ST Editor Web Component (CodeMirror 6 Wrapper)
 */

import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
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

  @query("#editor-container") private _container!: HTMLDivElement;

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
  `;

  constructor() {
    super();
    this.code = "";
    this.readOnly = false;
  }

  protected async firstUpdated(
    _changedProperties: PropertyValues,
  ): Promise<void> {
    // Wait for the update to complete, then initialize editor
    await this.updateComplete;
    // Additional frame to ensure DOM is painted
    await new Promise((resolve) => requestAnimationFrame(resolve));
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
    console.log("STEditor._initEditor called, container:", this._container);
    if (!this._container) {
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
      parent: this._container,
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
