/**
 * Type definitions for the dependency analyzer
 *
 * This module defines the interfaces and types used throughout the analyzer
 * for analyzing Structured Text code and generating Home Assistant triggers.
 */

/**
 * Represents a single Home Assistant automation trigger
 * Generated from analyzed input variables
 */
export interface TriggerConfig {
  /** Trigger platform (always 'state' for now) */
  platform: "state" | "numeric_state";

  /** Entity ID (e.g., 'sensor.temperature') */
  entity_id: string;

  /** Optional: previous state to match */
  from?: string;

  /** Optional: new state to match */
  to?: string;

  /** Optional: for numeric_state - trigger above this value */
  above?: number;

  /** Optional: for numeric_state - trigger below this value */
  below?: number;

  /** Optional: edge detection ('rising', 'falling') */
  edge?: "rising" | "falling";

  /** Optional: unique identifier for the trigger */
  id?: string;
}

/**
 * Edge trigger detection result
 * Identifies rising/falling edge patterns in the code
 */
export interface EdgeTrigger {
  variableName: string;
  edge: "rising" | "falling";
  location?: { line: number; column: number };
}

/**
 * Represents a dependency on a Home Assistant entity
 * Extracted from variable bindings in the code
 */
export interface EntityDependency {
  /** Variable name in ST code */
  variableName: string;

  /** Entity ID bound to this variable */
  entityId?: string;

  /** Direction: INPUT (read) or OUTPUT (write) */
  direction: "INPUT" | "OUTPUT";

  /** Data type of the variable */
  dataType: string;

  /** Whether this variable should trigger automation */
  isTrigger: boolean;

  /** Location in source code */
  location?: { line: number; column: number };
}

/**
 * Complete analysis result
 */
export interface AnalysisResult {
  triggers: TriggerConfig[];
  dependencies: EntityDependency[];
  diagnostics: Diagnostic[];
  metadata: AnalysisMetadata;
}

/**
 * Metadata about the analyzed program
 */
export interface AnalysisMetadata {
  programName?: string;
  inputCount: number;
  outputCount: number;
  triggerCount: number;
  hasPersistentVars: boolean;
  hasTimers: boolean;
  mode?: "single" | "restart" | "queued" | "parallel";
  throttle?: number;
  debounce?: number;
}

/**
 * Diagnostic severity levels
 */
export type DiagnosticSeverity = "error" | "warning" | "info";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  location?: { line: number; column: number };
}

/**
 * Standard diagnostic codes
 */
export const DiagnosticCodes = {
  // Warnings
  NO_TRIGGERS: "NO_TRIGGERS",
  MANY_TRIGGERS: "MANY_TRIGGERS",
  UNUSED_INPUT: "UNUSED_INPUT",
  WRITE_TO_INPUT: "WRITE_TO_INPUT",
  READ_FROM_OUTPUT: "READ_FROM_OUTPUT",

  // Info
  AUTO_TRIGGER: "AUTO_TRIGGER",
  EXPLICIT_NO_TRIGGER: "EXPLICIT_NO_TRIGGER",
  EDGE_TRIGGER_DETECTED: "EDGE_TRIGGER_DETECTED",

  // Errors
  INVALID_ENTITY_ID: "INVALID_ENTITY_ID",
  DUPLICATE_BINDING: "DUPLICATE_BINDING",
  CIRCULAR_DEPENDENCY: "CIRCULAR_DEPENDENCY",
} as const;

/**
 * Parsed pragma from code comments
 */
export interface ParsedPragma {
  name: string;
  value?: string;
}

export interface TriggerPragmaOptions {
  trigger?: boolean;
  no_trigger?: boolean;
  edge?: "rising" | "falling";
}
