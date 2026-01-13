/**
 * Chevrotain Lexer for Structured Text
 */

import { Lexer } from 'chevrotain';
import { allTokens } from './tokens';

export const STLexer = new Lexer(allTokens, {
  ensureOptimizations: true,
  positionTracking: 'full'  // For error reporting
});

export interface LexResult {
  tokens: ReturnType<typeof STLexer.tokenize>['tokens'];
  errors: ReturnType<typeof STLexer.tokenize>['errors'];
}

export function tokenize(code: string): LexResult {
  const result = STLexer.tokenize(code);
  return {
    tokens: result.tokens,
    errors: result.errors
  };
}
