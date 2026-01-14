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
} from "@codemirror/view";
import { StateField, StateEffect, Extension } from "@codemirror/state";
import type { LiveValue, OnlineModeState } from "./types";
import { ValueFormatter } from "./state-manager";

// ============================================================================
// State Effects
// ============================================================================

export const setLiveValuesEffect = StateEffect.define<Map<string, LiveValue>>();
export const setOnlineStatusEffect = StateEffect.define<OnlineModeState["status"]>();

// ============================================================================
// Live Value Widget
// ============================================================================

class LiveValueWidget extends WidgetType {
  constructor(
    private readonly value: LiveValue,
    private readonly showChange: boolean,
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement("span");
    wrapper.className = "st-live-value-widget";

    const formatted = this.showChange
      ? ValueFormatter.formatWithChange(this.value)
      : ValueFormatter.format(this.value.currentValue);

    const valueSpan = document.createElement("span");
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

  provide: (field) => EditorView.decorations.from(field),
});

// ============================================================================
// Build Decorations
// ============================================================================

function buildDecorations(
  doc: string,
  liveValues: Map<string, LiveValue>,
): DecorationSet {
  const decorations: Array<{ from: number; to: number; decoration: Decoration }> = [];
  const lines = doc.split("\n");
  let pos = 0;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const lineEnd = pos + line.length;

    // Find variable declarations on this line
    for (const [, liveValue] of liveValues) {
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
    decorations.map((d) => d.decoration.range(d.from, d.to)),
  );
}

// ============================================================================
// CSS Styles
// ============================================================================

export const liveValueStyles = EditorView.baseTheme({
  ".st-live-value-widget": {
    marginLeft: "16px",
    display: "inline-flex",
    alignItems: "center",
  },

  ".st-live-value": {
    padding: "2px 8px",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "var(--st-live-bg, #2d2d30)",
    border: "1px solid var(--st-live-border, #3c3c3c)",
    minWidth: "60px",
    textAlign: "right",
  },

  ".st-live-value--bool-true": {
    color: "#4ec9b0",
    backgroundColor: "rgba(78, 201, 176, 0.1)",
    borderColor: "#4ec9b0",
  },

  ".st-live-value--bool-false": {
    color: "#808080",
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderColor: "#808080",
  },

  ".st-live-value--int": {
    color: "#b5cea8",
  },

  ".st-live-value--real": {
    color: "#dcdcaa",
  },

  ".st-live-value--string": {
    color: "#ce9178",
  },

  ".st-live-value--invalid": {
    color: "#f44747",
    fontStyle: "italic",
  },

  ".st-live-value--changed": {
    animation: "st-value-flash 0.5s ease-out",
    boxShadow: "0 0 4px var(--st-change-glow, #569cd6)",
  },

  "@keyframes st-value-flash": {
    "0%": { backgroundColor: "rgba(86, 156, 214, 0.3)" },
    "100%": { backgroundColor: "var(--st-live-bg, #2d2d30)" },
  },
});

// ============================================================================
// Extension Export
// ============================================================================

export function liveValuesExtension(): Extension {
  return [liveValueDecorations, liveValueStyles];
}

// ============================================================================
// Update Helper
// ============================================================================

export function updateLiveValues(
  view: EditorView,
  liveValues: Map<string, LiveValue>,
): void {
  view.dispatch({
    effects: setLiveValuesEffect.of(liveValues),
  });
}
