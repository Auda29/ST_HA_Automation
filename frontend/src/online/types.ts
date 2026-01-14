/**
 * Online Mode Type Definitions
 */

// ============================================================================
// Entity State
// ============================================================================

export interface EntityState {
  entityId: string;
  state: string;
  lastChanged: string;
  attributes: Record<string, unknown>;
}

export interface ParsedValue {
  raw: string;
  formatted: string;
  isValid: boolean;
  dataType: "BOOL" | "INT" | "REAL" | "STRING" | "TIME" | "UNKNOWN";
}

// ============================================================================
// Variable Mapping
// ============================================================================

export interface VariableBinding {
  variableName: string;
  entityId: string;
  dataType: string;
  line: number;
  column: number;
  endColumn: number;
  isInput: boolean;
  isOutput: boolean;
  isPersistent: boolean;
}

export interface LiveValue {
  binding: VariableBinding;
  currentValue: ParsedValue;
  previousValue?: ParsedValue;
  hasChanged: boolean;
  lastUpdate: number;
}

// ============================================================================
// Online Mode State
// ============================================================================

export type OnlineStatus = "disconnected" | "connecting" | "online" | "paused" | "error";

export interface OnlineModeState {
  status: OnlineStatus;
  bindings: VariableBinding[];
  liveValues: Map<string, LiveValue>;
  updateRate: number; // ms between updates
  showConditions: boolean;
  highlightChanges: boolean;
  error?: string;
}

// ============================================================================
// Condition Evaluation
// ============================================================================

export interface ConditionValue {
  line: number;
  expression: string;
  result: boolean | null;
  error?: string;
}
