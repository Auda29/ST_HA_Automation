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
  /** Trigger platform */
  platform: "state" | "numeric_state" | "event" | "time";

  /** Entity ID (e.g., 'sensor.temperature') */
  entity_id?: string;

  /** Optional: previous state to match */
  from?: string | string[];

  /** Optional: new state to match */
  to?: string | string[];

  /** Optional: states to exclude from triggering (from) */
  not_from?: string[];

  /** Optional: states to exclude from triggering (to) */
  not_to?: string[];

  /** Optional: trigger on attribute change */
  attribute?: string;

  /** Optional: duration constraint (e.g., '00:05:00') */
  for?: string;

  /** Optional: for numeric_state - trigger above this value */
  above?: number;

  /** Optional: for numeric_state - trigger below this value */
  below?: number;

  /** Optional: edge detection ('rising', 'falling') */
  edge?: "rising" | "falling";

  /** Optional: unique identifier for the trigger */
  id?: string;

  /** Optional: event type for event triggers */
  event_type?: string;

  /** Optional: event data filter for event triggers */
  event_data?: Record<string, unknown>;

  /** Optional: time for time-based triggers (e.g., '07:00:00') */
  at?: string;
}

/**
 * Edge trigger detection result
 * Identifies rising/falling edge patterns in the code
 */
export interface EdgeTrigger extends TriggerConfig {
  platform: "state";
  from: string;
  to: string;
  edge: "rising" | "falling";
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

  /** Direction: INPUT (%I*), OUTPUT (%Q*), or MEMORY (%M*) */
  direction: "INPUT" | "OUTPUT" | "MEMORY";

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
  /** Throttle value as ST-style time literal (e.g., 'T#1s') */
  throttle?: string;
  /** Debounce value as ST-style time literal (e.g., 'T#500ms') */
  debounce?: string;
}

/**
 * Diagnostic severity levels (PascalCase per IEC 61131-3 conventions)
 */
export type DiagnosticSeverity = "Error" | "Warning" | "Info" | "Hint";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  location?: { line: number; column: number };
  relatedInfo?: string;
}

/**
 * Standard diagnostic codes
 * Format: W0xx (Warning), I0xx (Info), E0xx (Error), H0xx (Hint)
 */
export const DiagnosticCodes = {
  // Warnings (W0xx)
  NO_TRIGGERS: "W001",
  MANY_TRIGGERS: "W002",
  UNUSED_INPUT: "W003",
  WRITE_TO_INPUT: "W004",
  READ_FROM_OUTPUT: "W005",

  // Info (I0xx)
  AUTO_TRIGGER: "I001",
  EXPLICIT_NO_TRIGGER: "I002",
  EDGE_TRIGGER_DETECTED: "I003",

  // Errors (E0xx)
  INVALID_ENTITY_ID: "E001",
  DUPLICATE_BINDING: "E002",
  CIRCULAR_DEPENDENCY: "E003",

  // Hints (H0xx)
  CONSIDER_NO_TRIGGER: "H001",
  CONSIDER_EDGE_TRIGGER: "H002",
} as const;

/**
 * Parsed pragma from code comments
 */
export interface ParsedPragma {
  name: string;
  value?: string | number | boolean;
}

export interface TriggerPragmaOptions {
  trigger?: boolean;
  no_trigger?: boolean;
  edge?: "rising" | "falling";
}

// ============================================================================
// Storage Types
// ============================================================================

export enum StorageType {
  /** Entity-bound variable - value comes from entity state */
  DERIVED = "DERIVED",

  /** Temporary variable - only valid during single run */
  TRANSIENT = "TRANSIENT",

  /** Persistent variable - survives across runs via HA helper */
  PERSISTENT = "PERSISTENT",
}

export interface StorageDecision {
  type: StorageType;
  reason: string;
  helperId?: string;
  helperType?: HelperType;
  initialValue?: unknown;
}

export type HelperType =
  | "input_boolean"
  | "input_number"
  | "input_text"
  | "input_datetime"
  | "input_select"
  | "counter"
  | "timer";

export interface HelperConfig {
  id: string;
  type: HelperType;
  name: string;
  initial?: unknown;
  min?: number;
  max?: number;
  step?: number;
  mode?: "box" | "slider";
  options?: string[];
  pattern?: string;
}

export interface StorageAnalysisResult {
  variables: VariableStorageInfo[];
  helpers: HelperConfig[];
  diagnostics: Diagnostic[];
}

export interface VariableStorageInfo {
  name: string;
  dataType: string;
  storage: StorageDecision;
  usageInfo: VariableUsageInfo;
}

export interface VariableUsageInfo {
  isRead: boolean;
  isWritten: boolean;
  hasSelfReference: boolean;
  isFBInstance: boolean;
  isTimerRelated: boolean;
  readCount: number;
  writeCount: number;
}

/**
 * Diagnostic Codes for Storage Analysis
 */
export const StorageDiagnosticCodes = {
  // Info
  AUTO_PERSISTENT: "I010",
  EXPLICIT_PERSISTENT: "I011",
  EXPLICIT_TRANSIENT: "I012",

  // Warnings
  SELF_REF_NOT_PERSISTENT: "W010",
  FB_INSTANCE_NOT_PERSISTENT: "W011",
  UNUSED_PERSISTENT: "W012",

  // Errors
  INVALID_HELPER_TYPE: "E010",
  CONFLICTING_PRAGMAS: "E011",
} as const;
