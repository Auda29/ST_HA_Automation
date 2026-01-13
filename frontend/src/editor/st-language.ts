/**
 * Structured Text Language Support for CodeMirror 6
 */

import { StreamLanguage } from "@codemirror/language";
import { completeFromList } from "@codemirror/autocomplete";

// ============================================================================
// Token Definitions
// ============================================================================

export const ST_KEYWORDS = [
  "PROGRAM",
  "END_PROGRAM",
  "FUNCTION",
  "END_FUNCTION",
  "FUNCTION_BLOCK",
  "END_FUNCTION_BLOCK",
  "VAR",
  "VAR_INPUT",
  "VAR_OUTPUT",
  "VAR_IN_OUT",
  "VAR_GLOBAL",
  "END_VAR",
  "CONSTANT",
  "IF",
  "THEN",
  "ELSIF",
  "ELSE",
  "END_IF",
  "CASE",
  "OF",
  "END_CASE",
  "FOR",
  "TO",
  "BY",
  "DO",
  "END_FOR",
  "WHILE",
  "END_WHILE",
  "REPEAT",
  "UNTIL",
  "END_REPEAT",
  "EXIT",
  "RETURN",
  "CONTINUE",
  "AND",
  "OR",
  "XOR",
  "NOT",
  "MOD",
  "TRUE",
  "FALSE",
  "AT",
];

export const ST_TYPES = [
  "BOOL",
  "BYTE",
  "WORD",
  "DWORD",
  "LWORD",
  "SINT",
  "INT",
  "DINT",
  "LINT",
  "USINT",
  "UINT",
  "UDINT",
  "ULINT",
  "REAL",
  "LREAL",
  "STRING",
  "WSTRING",
  "TIME",
  "DATE",
  "TIME_OF_DAY",
  "DATE_AND_TIME",
  "TOD",
  "DT",
];

export const ST_BUILTINS = [
  "SEL",
  "MUX",
  "MAX",
  "MIN",
  "LIMIT",
  "ABS",
  "SQRT",
  "LN",
  "LOG",
  "EXP",
  "SIN",
  "COS",
  "TAN",
  "TRUNC",
  "ROUND",
  "CEIL",
  "FLOOR",
  "TO_BOOL",
  "TO_INT",
  "TO_DINT",
  "TO_REAL",
  "TO_LREAL",
  "TO_STRING",
  "LEN",
  "LEFT",
  "RIGHT",
  "MID",
  "CONCAT",
  "FIND",
];

export const ST_FUNCTION_BLOCKS = [
  "R_TRIG",
  "F_TRIG",
  "SR",
  "RS",
  "TON",
  "TOF",
  "TP",
  "CTU",
  "CTD",
  "CTUD",
];

export const ST_PRAGMAS = [
  "trigger",
  "no_trigger",
  "persistent",
  "transient",
  "reset_on_restart",
  "require_restore",
  "mode",
  "max_queued",
  "max_parallel",
  "throttle",
  "debounce",
];

// ============================================================================
// Tokenizer (StreamLanguage)
// ============================================================================

interface TokenizerState {
  inBlockComment: boolean;
}

export const stLanguage = StreamLanguage.define<TokenizerState>({
  name: "structuredtext",

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
    if (stream.match("(*")) {
      state.inBlockComment = true;
    }
    if (state.inBlockComment) {
      while (!stream.eol()) {
        if (stream.match("*)")) {
          state.inBlockComment = false;
          return "comment";
        }
        stream.next();
      }
      return "comment";
    }

    // Line comment //
    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }

    // Pragmas {keyword} or {key: value}
    if (stream.match("{")) {
      let depth = 1;
      while (!stream.eol() && depth > 0) {
        const ch = stream.next();
        if (ch === "{") depth++;
        if (ch === "}") depth--;
      }
      return "meta";
    }

    // String literals
    if (stream.match("'")) {
      while (!stream.eol()) {
        if (stream.next() === "'" && !stream.match("'")) {
          return "string";
        }
      }
      return "string";
    }

    // Time literals T#...
    if (stream.match(/T#[\d_hmsdu]+/i) || stream.match(/TIME#[\d_hmsdu]+/i)) {
      return "number";
    }

    // Hex 16#, Binary 2#, Octal 8#
    if (
      stream.match(/16#[\da-fA-F_]+/) ||
      stream.match(/2#[01_]+/) ||
      stream.match(/8#[0-7_]+/)
    ) {
      return "number";
    }

    // Real numbers
    if (stream.match(/\d+\.\d+([eE][+-]?\d+)?/)) {
      return "number";
    }

    // Integers
    if (stream.match(/\d+/)) {
      return "number";
    }

    // Multi-char operators
    if (
      stream.match(":=") ||
      stream.match("<=") ||
      stream.match(">=") ||
      stream.match("<>") ||
      stream.match("=>")
    ) {
      return "operator";
    }

    // I/O Addresses %I*, %Q*, %M*
    if (stream.match(/%[IQM][XBWDLxbwdl]?\*?/i)) {
      return "keyword";
    }

    // Identifiers and keywords
    if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const word = stream.current().toUpperCase();

      if (ST_KEYWORDS.includes(word)) return "keyword";
      if (ST_TYPES.includes(word)) return "typeName";
      if (ST_BUILTINS.includes(word)) return "function.standard";
      if (ST_FUNCTION_BLOCKS.includes(word)) return "className";

      return "variableName";
    }

    // Single char operators/punctuation
    if (stream.match(/[+\-*=<>()[\];:,.]/)) {
      return "operator";
    }

    stream.next();
    return null;
  },

  languageData: {
    commentTokens: { line: "//", block: { open: "(*", close: "*)" } },
    closeBrackets: { brackets: ["(", "[", "{", "'"] },
  },
});

// ============================================================================
// Autocompletion
// ============================================================================

export const stCompletion = completeFromList([
  ...ST_KEYWORDS.map((k) => ({ label: k, type: "keyword" })),
  ...ST_TYPES.map((t) => ({ label: t, type: "type" })),
  ...ST_BUILTINS.map((f) => ({ label: f, type: "function" })),
  ...ST_FUNCTION_BLOCKS.map((fb) => ({ label: fb, type: "class" })),
  ...ST_PRAGMAS.map((p) => ({
    label: `{${p}}`,
    type: "keyword",
    detail: "pragma",
  })),
  {
    label: "PROGRAM",
    type: "keyword",
    apply: "PROGRAM ${name}\nVAR\n\t\nEND_VAR\n\n\nEND_PROGRAM",
    detail: "template",
  },
  {
    label: "IF",
    type: "keyword",
    apply: "IF ${cond} THEN\n\t\nEND_IF;",
    detail: "template",
  },
]);

// ============================================================================
// Language Support Export
// ============================================================================

import { LanguageSupport } from "@codemirror/language";

export function structuredText() {
  return new LanguageSupport(stLanguage, [
    stLanguage.data.of({ autocomplete: stCompletion }),
  ]);
}
