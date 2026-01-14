/**
 * Chevrotain Token Definitions for Structured Text
 */

import { createToken, Lexer, TokenType } from "chevrotain";

// Helper to create keyword tokens with word boundaries
const keyword = (name: string, text: string) =>
  createToken({ name, pattern: new RegExp(`\\b${text}\\b`, "i") });

// ============================================================================
// Whitespace & Comments (skipped)
// ============================================================================

export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

export const LineComment = createToken({
  name: "LineComment",
  pattern: /\/\/.*/,
  group: Lexer.SKIPPED,
});

export const BlockComment = createToken({
  name: "BlockComment",
  pattern: /\(\*[\s\S]*?\*\)/,
  group: Lexer.SKIPPED,
});

// ============================================================================
// Pragmas
// ============================================================================

export const Pragma = createToken({
  name: "Pragma",
  pattern: /\{[^}]+\}/,
});

// ============================================================================
// Keywords (order matters - longer first)
// ============================================================================

export const EndProgram = createToken({
  name: "EndProgram",
  pattern: /END_PROGRAM/i,
  longer_alt: undefined,
});
export const EndFunction = createToken({
  name: "EndFunction",
  pattern: /END_FUNCTION/i,
});
export const EndFunctionBlock = createToken({
  name: "EndFunctionBlock",
  pattern: /END_FUNCTION_BLOCK/i,
});
export const FunctionBlock = createToken({
  name: "FunctionBlock",
  pattern: /FUNCTION_BLOCK/i,
});
export const EndVar = createToken({ name: "EndVar", pattern: /END_VAR/i });
export const VarInput = createToken({
  name: "VarInput",
  pattern: /VAR_INPUT/i,
});
export const VarOutput = createToken({
  name: "VarOutput",
  pattern: /VAR_OUTPUT/i,
});
export const VarInOut = createToken({
  name: "VarInOut",
  pattern: /VAR_IN_OUT/i,
});
export const VarGlobal = createToken({
  name: "VarGlobal",
  pattern: /VAR_GLOBAL/i,
});
export const EndIf = createToken({ name: "EndIf", pattern: /END_IF/i });
export const EndCase = createToken({ name: "EndCase", pattern: /END_CASE/i });
export const EndFor = createToken({ name: "EndFor", pattern: /END_FOR/i });
export const EndWhile = createToken({
  name: "EndWhile",
  pattern: /END_WHILE/i,
});
export const EndRepeat = createToken({
  name: "EndRepeat",
  pattern: /END_REPEAT/i,
});

export const Program = keyword("Program", "PROGRAM");
export const Function = keyword("Function", "FUNCTION");
export const Var = keyword("Var", "VAR");
export const Constant = keyword("Constant", "CONSTANT");

export const If = keyword("If", "IF");
export const Then = keyword("Then", "THEN");
export const Elsif = keyword("Elsif", "ELSIF");
export const Else = keyword("Else", "ELSE");

export const Case = keyword("Case", "CASE");
export const Of = keyword("Of", "OF");

export const For = keyword("For", "FOR");
export const To = keyword("To", "TO");
export const By = keyword("By", "BY");
export const Do = keyword("Do", "DO");

export const While = keyword("While", "WHILE");
export const Repeat = keyword("Repeat", "REPEAT");
export const Until = keyword("Until", "UNTIL");

export const Return = keyword("Return", "RETURN");
export const Exit = keyword("Exit", "EXIT");
export const Continue = keyword("Continue", "CONTINUE");

export const At = keyword("At", "AT");

// Logical operators (before Identifier!)
export const And = keyword("And", "AND");
export const Or = keyword("Or", "OR");
export const Xor = keyword("Xor", "XOR");
export const Not = keyword("Not", "NOT");
export const Mod = keyword("Mod", "MOD");

// Boolean literals
export const True = keyword("True", "TRUE");
export const False = keyword("False", "FALSE");

// ============================================================================
// Data Types
// ============================================================================

export const TypeBool = keyword("TypeBool", "BOOL");
export const TypeInt = createToken({
  name: "TypeInt",
  pattern: /\b(DINT|LINT|SINT|USINT|UINT|UDINT|ULINT|INT)\b/i,
});
export const TypeReal = createToken({
  name: "TypeReal",
  pattern: /\b(LREAL|REAL)\b/i,
});
export const TypeString = createToken({
  name: "TypeString",
  pattern: /\b(WSTRING|STRING)\b/i,
});
export const TypeTime = createToken({
  name: "TypeTime",
  pattern: /\b(TIME_OF_DAY|DATE_AND_TIME|TIME|DATE|TOD|DT)\b/i,
});
export const TypeByte = createToken({
  name: "TypeByte",
  pattern: /\b(LWORD|DWORD|WORD|BYTE)\b/i,
});

// ============================================================================
// Literals
// ============================================================================

export const TimeLiteral = createToken({
  name: "TimeLiteral",
  pattern: /T(IME)?#[\d_]+(\.[\d_]+)?([a-z]+)?/i,
});

export const HexLiteral = createToken({
  name: "HexLiteral",
  pattern: /16#[\da-fA-F_]+/,
});

export const BinaryLiteral = createToken({
  name: "BinaryLiteral",
  pattern: /2#[01_]+/,
});

export const OctalLiteral = createToken({
  name: "OctalLiteral",
  pattern: /8#[0-7_]+/,
});

export const RealLiteral = createToken({
  name: "RealLiteral",
  pattern: /\d+\.\d+([eE][+-]?\d+)?/,
});

export const IntegerLiteral = createToken({
  name: "IntegerLiteral",
  pattern: /\d+/,
});

export const StringLiteral = createToken({
  name: "StringLiteral",
  pattern: /'([^']|'')*'/,
});

// ============================================================================
// I/O Addresses
// ============================================================================

export const IoAddress = createToken({
  name: "IoAddress",
  pattern: /%[IQM][XBWDLxbwdl]?(?:[\d.]+|\*)/i,
});

// ============================================================================
// Operators & Punctuation
// ============================================================================

export const Assign = createToken({ name: "Assign", pattern: /:=/ });
export const Output = createToken({ name: "Output", pattern: /=>/ });
export const LessEqual = createToken({ name: "LessEqual", pattern: /<=/ });
export const GreaterEqual = createToken({
  name: "GreaterEqual",
  pattern: />=/,
});
export const NotEqual = createToken({ name: "NotEqual", pattern: /<>/ });
export const Less = createToken({ name: "Less", pattern: /</ });
export const Greater = createToken({ name: "Greater", pattern: />/ });
export const Equal = createToken({ name: "Equal", pattern: /=/ });

export const Plus = createToken({ name: "Plus", pattern: /\+/ });
export const Minus = createToken({ name: "Minus", pattern: /-/ });
export const Star = createToken({ name: "Star", pattern: /\*/ });
export const Slash = createToken({ name: "Slash", pattern: /\// });

export const LParen = createToken({ name: "LParen", pattern: /\(/ });
export const RParen = createToken({ name: "RParen", pattern: /\)/ });
export const LBracket = createToken({ name: "LBracket", pattern: /\[/ });
export const RBracket = createToken({ name: "RBracket", pattern: /\]/ });

export const Colon = createToken({ name: "Colon", pattern: /:/ });
export const Semicolon = createToken({ name: "Semicolon", pattern: /;/ });
export const Comma = createToken({ name: "Comma", pattern: /,/ });
export const Dot = createToken({ name: "Dot", pattern: /\./ });
export const Range = createToken({ name: "Range", pattern: /\.\./ });

// ============================================================================
// Identifier (MUST be last!)
// ============================================================================

export const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});

// ============================================================================
// Token List (ORDER MATTERS!)
// ============================================================================

export const allTokens: TokenType[] = [
  // Skipped
  WhiteSpace,
  LineComment,
  BlockComment,

  // Pragmas
  Pragma,

  // Multi-word keywords first
  EndFunctionBlock,
  FunctionBlock,
  EndFunction,
  EndProgram,
  VarInput,
  VarOutput,
  VarInOut,
  VarGlobal,
  EndVar,
  EndIf,
  EndCase,
  EndFor,
  EndWhile,
  EndRepeat,

  // Keywords
  Program,
  Function,
  Var,
  Constant,
  If,
  Then,
  Elsif,
  Else,
  Case,
  Of,
  For,
  To,
  By,
  Do,
  While,
  Repeat,
  Until,
  Return,
  Exit,
  Continue,
  At,

  // Logical
  And,
  Or,
  Xor,
  Not,
  Mod,
  True,
  False,

  // Types
  TypeBool,
  TypeInt,
  TypeReal,
  TypeString,
  TypeTime,
  TypeByte,

  // Literals (order: specific before general)
  TimeLiteral,
  HexLiteral,
  BinaryLiteral,
  OctalLiteral,
  RealLiteral,
  IntegerLiteral,
  StringLiteral,

  // I/O
  IoAddress,

  // Multi-char operators
  Assign,
  Output,
  Range,
  LessEqual,
  GreaterEqual,
  NotEqual,

  // Single-char operators
  Less,
  Greater,
  Equal,
  Plus,
  Minus,
  Star,
  Slash,
  LParen,
  RParen,
  LBracket,
  RBracket,
  Colon,
  Semicolon,
  Comma,
  Dot,

  // Identifier last
  Identifier,
];
