/**
 * ST Parser Main Entry Point
 * Coordinates lexing, parsing, and AST transformation
 */

import { tokenize } from './lexer';
import { parserInstance } from './parser';
import { visitor } from './visitor';
import type { ProgramNode } from './ast';

export interface ParseResult {
  success: boolean;
  ast?: ProgramNode;
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
  offset?: number;
}

/**
 * Parse Structured Text code into an AST
 * @param code The ST source code to parse
 * @returns ParseResult with AST or errors
 */
export function parse(code: string): ParseResult {
  const errors: ParseError[] = [];

  // Step 1: Tokenize
  const lexResult = tokenize(code);

  if (lexResult.errors.length > 0) {
    lexResult.errors.forEach(error => {
      errors.push({
        message: error.message,
        line: error.line,
        column: error.column,
        offset: error.offset,
      });
    });
  }

  // If there are lexing errors, don't proceed to parsing
  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  // Step 2: Parse tokens into CST
  parserInstance.input = lexResult.tokens;
  const cst = parserInstance.program();

  // Step 3: Check for parser errors
  if (parserInstance.errors.length > 0) {
    parserInstance.errors.forEach(error => {
      errors.push({
        message: error.message,
        line: error.token.startLine,
        column: error.token.startColumn,
        offset: error.token.startOffset,
      });
    });

    return {
      success: false,
      errors,
    };
  }

  // Step 4: Transform CST to AST
  try {
    const ast = visitor.visit(cst) as ProgramNode;

    return {
      success: true,
      ast,
      errors: [],
    };
  } catch (error) {
    errors.push({
      message: error instanceof Error ? error.message : 'Unknown AST transformation error',
    });

    return {
      success: false,
      errors,
    };
  }
}

// Re-export types and utilities
export * from './ast';
export { tokenize } from './lexer';
export { parserInstance } from './parser';
export { visitor } from './visitor';
export { allTokens } from './tokens';
