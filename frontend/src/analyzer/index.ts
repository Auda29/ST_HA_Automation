/**
 * Analyzer module - Public API
 *
 * This module exports the public API for the dependency analyzer.
 */

// Main analyzer function
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
