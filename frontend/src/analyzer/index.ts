/**
 * Analyzer module - Public API
 *
 * This module exports the public API for the dependency and storage analyzers.
 */

// ============================================================================
// Dependency Analyzer
// ============================================================================

export { analyzeDependencies } from "./dependency-analyzer";

// Type definitions
export type {
  TriggerConfig,
  EntityDependency,
  AnalysisResult,
  AnalysisMetadata,
  Diagnostic,
  DiagnosticSeverity,
  EdgeTrigger,
  ParsedPragma,
  TriggerPragmaOptions,
} from "./types";

export { DiagnosticCodes } from "./types";

// Helper functions (may be useful for consumers)
export {
  isValidEntityId,
  isBooleanEntity,
  isNumericEntity,
  getEntityDomain,
} from "./trigger-generator";

// ============================================================================
// Storage Analyzer
// ============================================================================

export {
  StorageAnalyzer,
  analyzeStorage,
  getPersistentVariables,
  getRequiredHelpers,
} from "./storage-analyzer";

// Storage types
export type {
  StorageDecision,
  StorageAnalysisResult,
  VariableStorageInfo,
  VariableUsageInfo,
  HelperConfig,
  HelperType,
} from "./types";

export { StorageType, StorageDiagnosticCodes } from "./types";

// Helper mapping utilities
export {
  getHelperType,
  isFunctionBlockType,
  isNumericType,
  isBooleanType,
  isStringType,
  isTimeType,
  generateHelperId,
  generateHelperConfig,
  getDefaultValue,
  convertToHelperValue,
} from "./helper-mapping";

// ============================================================================
// AST Visitor Utilities
// ============================================================================

export {
  walkAST,
  findVariableRefs,
  expressionContainsVariable,
} from "./ast-visitor";

export type { VisitorContext, VisitorOptions, VisitorCallback } from "./ast-visitor";
