/**
 * Entity Browser Type Definitions
 */

// ============================================================================
// Entity Information
// ============================================================================

export interface EntityInfo {
  entityId: string;
  state: string;
  attributes: Record<string, unknown>;
  domain: string;
  friendlyName?: string;
  deviceClass?: string;
  icon?: string;
  lastChanged?: string;
  lastUpdated?: string;
}

// ============================================================================
// Domain Grouping
// ============================================================================

export interface DomainGroup {
  domain: string;
  entities: EntityInfo[];
  icon: string;
  expanded: boolean;
}

// ============================================================================
// Data Type Inference
// ============================================================================

export type InferredDataType = "BOOL" | "INT" | "REAL" | "STRING" | "UNKNOWN";

export interface DataTypeInference {
  dataType: InferredDataType;
  confidence: "high" | "medium" | "low";
  reason: string;
}

// ============================================================================
// Drag and Drop
// ============================================================================

export interface DragEntityData {
  entityId: string;
  dataType: InferredDataType;
  direction: "input" | "output";
  bindingSyntax: string;
}

// ============================================================================
// Filter State
// ============================================================================

export interface EntityFilter {
  searchQuery: string;
  selectedDomain: string | null; // null = all domains
  showInputsOnly: boolean;
  showOutputsOnly: boolean;
}
