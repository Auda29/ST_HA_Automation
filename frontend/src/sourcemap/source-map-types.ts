/**
 * Source Map Type Definitions
 */

// ============================================================================
// Source Location Types
// ============================================================================

export interface SourceLocation {
  /** Source file name */
  file: string;
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column: number;
  /** End line (optional) */
  endLine?: number;
  /** End column (optional) */
  endColumn?: number;
}

export interface SourceMapEntry {
  /** Original ST source location */
  st: SourceLocation;
  /** Description of what this maps to */
  description?: string;
}

// ============================================================================
// YAML Path Types
// ============================================================================

/**
 * YAML path representation
 * Example: "action.0.choose.0.sequence.1"
 */
export type YAMLPath = string;

/**
 * Source map: YAML path → ST location
 */
export type SourceMapData = Record<YAMLPath, SourceMapEntry>;

// ============================================================================
// Source Map Container
// ============================================================================

export interface SourceMap {
  /** Version of source map format */
  version: 1;
  
  /** Project name */
  project: string;
  
  /** Program name */
  program: string;
  
  /** Generated automation ID */
  automationId: string;
  
  /** Generated script ID (if any) */
  scriptId?: string;
  
  /** Timestamp of generation */
  generatedAt: string;
  
  /** Mapping data */
  mappings: SourceMapData;
  
  /** Source file content hash (for validation) */
  sourceHash?: string;
}

// ============================================================================
// Embedded Source Map
// ============================================================================

/**
 * Source map embedded in generated YAML as a variable
 */
export interface EmbeddedSourceMap {
  _st_source_map: SourceMapData;
  _st_source_file: string;
  _st_source_hash: string;
}
