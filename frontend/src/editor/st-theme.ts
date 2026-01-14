/**
 * TwinCAT-inspired Dark Theme for ST Editor
 */

import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Color Palette
const colors = {
  bg: "#1e1e1e",
  bgLight: "#252526",
  fg: "#d4d4d4",
  fgDim: "#808080",
  keyword: "#569cd6",
  type: "#4ec9b0",
  function: "#dcdcaa",
  variable: "#9cdcfe",
  string: "#ce9178",
  number: "#b5cea8",
  comment: "#6a9955",
  pragma: "#c586c0",
  selection: "#264f78",
  cursor: "#aeafad",
  lineHighlight: "#2a2d2e",
  gutterBg: "#1e1e1e",
  gutterFg: "#858585",
  border: "#404040",
};

// Editor Theme
export const stEditorTheme = EditorView.theme(
  {
    "&": {
      color: colors.fg,
      backgroundColor: colors.bg,
      fontSize: "14px",
      fontFamily: '"Fira Code", "Consolas", monospace',
    },
    ".cm-content": {
      caretColor: colors.cursor,
    },
    ".cm-cursor": {
      borderLeftColor: colors.cursor,
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: `${colors.selection} !important`,
    },
    ".cm-selectionMatch": {
      backgroundColor: "#3a3d41",
    },
    "& .cm-line ::selection": {
      backgroundColor: `${colors.selection} !important`,
    },
    "& .cm-line::selection": {
      backgroundColor: `${colors.selection} !important`,
    },
    ".cm-activeLine": {
      backgroundColor: colors.lineHighlight,
    },
    ".cm-gutters": {
      backgroundColor: colors.gutterBg,
      color: colors.gutterFg,
      border: "none",
      borderRight: `1px solid ${colors.border}`,
    },
    ".cm-activeLineGutter": {
      backgroundColor: colors.lineHighlight,
      color: colors.fg,
    },
    ".cm-foldGutter .cm-gutterElement": {
      cursor: "pointer",
    },
    ".cm-tooltip": {
      backgroundColor: colors.bgLight,
      border: `1px solid ${colors.border}`,
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: colors.selection,
    },
  },
  { dark: true },
);

// Syntax Highlighting
export const stHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: colors.keyword, fontWeight: "bold" },
  { tag: t.typeName, color: colors.type },
  {
    tag: [t.function(t.variableName), t.standard(t.function(t.variableName))],
    color: colors.function,
  },
  { tag: t.className, color: colors.type },
  { tag: t.variableName, color: colors.variable },
  { tag: t.propertyName, color: colors.variable },
  { tag: t.string, color: colors.string },
  { tag: t.number, color: colors.number },
  { tag: t.comment, color: colors.comment, fontStyle: "italic" },
  { tag: t.meta, color: colors.pragma },
  { tag: t.operator, color: colors.fg },
  { tag: t.invalid, color: "#ff0000", textDecoration: "underline wavy" },
]);

// Combined Theme Export
export function stTheme(): Extension {
  return [stEditorTheme, syntaxHighlighting(stHighlightStyle)];
}
