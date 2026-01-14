/**
 * Error Mapping Type Definitions
 */

import type { SourceLocation } from '../sourcemap/source-map-types';

// ============================================================================
// HA Error Types
// ============================================================================

export interface HALogEntry {
  /** Log level */
  level: 'ERROR' | 'WARNING' | 'INFO';
  
  /** Timestamp */
  timestamp: string;
  
  /** Logger name */
  logger: string;
  
  /** Error message */
  message: string;
  
  /** Exception info (if any) */
  exception?: string;
  
  /** Context data */
  context?: Record<string, unknown>;
}

export interface HAAutomationError {
  /** Automation ID that caused the error */
  automationId: string;
  
  /** Error message */
  message: string;
  
  /** YAML path where error occurred (if available) */
  yamlPath?: string;
  
  /** Original log entry */
  logEntry: HALogEntry;
}

// ============================================================================
// Mapped Error Types
// ============================================================================

export interface MappedError {
  /** Original HA error */
  original: HAAutomationError;
  
  /** Translated error message (user-friendly) */
  translatedMessage: string;
  
  /** ST source location */
  stLocation?: SourceLocation;
  
  /** Code snippet around error */
  codeSnippet?: CodeSnippet;
  
  /** Suggested fixes */
  suggestions?: string[];
  
  /** Related documentation links */
  docLinks?: string[];
}

export interface CodeSnippet {
  /** Lines of code around error */
  lines: Array<{
    number: number;
    content: string;
    isError: boolean;
  }>;
  
  /** Column range to highlight */
  highlightRange?: {
    start: number;
    end: number;
  };
}

// ============================================================================
// Error Pattern Types
// ============================================================================

export interface ErrorPattern {
  /** Regex pattern to match error message */
  pattern: RegExp;
  
  /** Template for translated message ($1, $2 for captures) */
  translation: string;
  
  /** Error category */
  category: ErrorCategory;
  
  /** Suggested fixes */
  suggestions?: string[];
  
  /** Related documentation */
  docLinks?: string[];
}

export type ErrorCategory =
  | 'syntax'
  | 'type'
  | 'entity'
  | 'template'
  | 'service'
  | 'runtime'
  | 'unknown';
