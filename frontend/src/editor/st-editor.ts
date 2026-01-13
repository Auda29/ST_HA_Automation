/**
 * ST Editor Web Component (CodeMirror 6 Wrapper)
 */

import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
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
