/**
 * Migration System Type Definitions
 */

// NOTE: We keep DataType as a simple string alias here to avoid
// tight coupling to parser/transpiler internals.
export type DataType = string;

// ============================================================================
// Restore Policy
// ============================================================================

export enum RestorePolicy {
  /** Default: Restore if available, otherwise use initial value */
  RESTORE_OR_INIT = 'RESTORE_OR_INIT',

  /** Always use initial value on restart */
  ALWAYS_INIT = 'ALWAYS_INIT',

  /** Require restored value, error if not available */
  REQUIRE_RESTORE = 'REQUIRE_RESTORE',
}

export interface RestorePolicyConfig {
  policy: RestorePolicy;
  variableName: string;
  helperId: string;
  initialValue: any;
  dataType: DataType;
}

// ============================================================================
// Schema Definition
// ============================================================================

export interface VariableSchema {
  name: string;
  dataType: DataType;
  helperId: string;
  helperType: 'input_boolean' | 'input_number' | 'input_text' | 'input_datetime';
  initialValue: any;
  restorePolicy: RestorePolicy;

  // For numeric types
  min?: number;
  max?: number;
  step?: number;
}

export interface ProgramSchema {
  programName: string;
  projectName: string;
  variables: VariableSchema[];
  version: string;
  generatedAt: string;
}

// ============================================================================
// Migration
// ============================================================================

export type MigrationIssueType =
  | 'added'
  | 'removed'
  | 'type_changed'
  | 'range_changed'
  | 'initial_changed';

export interface MigrationIssue {
  type: MigrationIssueType;
  variable: string;
  helperId: string;

  /** Details about the change */
  details?: string;

  /** Old schema (for updates/deletes) */
  oldSchema?: VariableSchema;

  /** New schema (for updates/adds) */
  newSchema?: VariableSchema;

  /** Available resolution options */
  options: MigrationOption[];

  /** Default/recommended option */
  defaultOption: string;
}

export interface MigrationOption {
  id: string;
  label: string;
  description?: string;
  isDestructive?: boolean;
}

export interface MigrationResolution {
  issueId: string;
  selectedOption: string;
}

export interface MigrationPlan {
  issues: MigrationIssue[];
  hasDestructiveChanges: boolean;
  requiresUserInput: boolean;
}

export interface MigrationResult {
  success: boolean;
  appliedChanges: string[];
  errors: string[];
}

// ============================================================================
// Schema Storage
// ============================================================================

export interface StoredSchemas {
  [programId: string]: ProgramSchema;
}

