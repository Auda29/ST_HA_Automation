/**
 * ST Data Type to HA Helper Type Mapping
 *
 * This module handles mapping between Structured Text data types and
 * Home Assistant helper entity types for persistent storage.
 */

import type { HelperType, HelperConfig } from "./types";

// ============================================================================
// Type Mapping
// ============================================================================

interface TypeMapping {
  helperType: HelperType;
  defaultMin?: number;
  defaultMax?: number;
  defaultStep?: number;
}

const TYPE_MAPPINGS: Record<string, TypeMapping> = {
  // Boolean types
  BOOL: { helperType: "input_boolean" },

  // Integer types
  SINT: {
    helperType: "input_number",
    defaultMin: -128,
    defaultMax: 127,
    defaultStep: 1,
  },
  INT: {
    helperType: "input_number",
    defaultMin: -32768,
    defaultMax: 32767,
    defaultStep: 1,
  },
  DINT: {
    helperType: "input_number",
    defaultMin: -2147483648,
    defaultMax: 2147483647,
    defaultStep: 1,
  },
  LINT: {
    helperType: "input_number",
    defaultMin: Number.MIN_SAFE_INTEGER,
    defaultMax: Number.MAX_SAFE_INTEGER,
    defaultStep: 1,
  },
  USINT: {
    helperType: "input_number",
    defaultMin: 0,
    defaultMax: 255,
    defaultStep: 1,
  },
  UINT: {
    helperType: "input_number",
    defaultMin: 0,
    defaultMax: 65535,
    defaultStep: 1,
  },
  UDINT: {
    helperType: "input_number",
    defaultMin: 0,
    defaultMax: 4294967295,
    defaultStep: 1,
  },
  ULINT: {
    helperType: "input_number",
    defaultMin: 0,
    defaultMax: Number.MAX_SAFE_INTEGER,
    defaultStep: 1,
  },

  // Real types
  REAL: {
    helperType: "input_number",
    defaultMin: -3.4e38,
    defaultMax: 3.4e38,
    defaultStep: 0.1,
  },
  LREAL: {
    helperType: "input_number",
    defaultMin: Number.MIN_SAFE_INTEGER,
    defaultMax: Number.MAX_SAFE_INTEGER,
    defaultStep: 0.01,
  },

  // String types
  STRING: { helperType: "input_text" },
  WSTRING: { helperType: "input_text" },

  // Time types
  TIME: { helperType: "input_text" }, // Stored as ISO duration string
  DATE: { helperType: "input_datetime" },
  TIME_OF_DAY: { helperType: "input_datetime" },
  TOD: { helperType: "input_datetime" },
  DATE_AND_TIME: { helperType: "input_datetime" },
  DT: { helperType: "input_datetime" },
};

// Function Block types that need special handling
const FB_TYPES = [
  "TON",
  "TOF",
  "TP",
  "R_TRIG",
  "F_TRIG",
  "SR",
  "RS",
  "CTU",
  "CTD",
  "CTUD",
];

/**
 * Get the appropriate HA helper type for an ST data type
 */
export function getHelperType(stType: string): HelperType | null {
  const normalizedType = stType.toUpperCase();
  const mapping = TYPE_MAPPINGS[normalizedType];
  return mapping?.helperType ?? null;
}

/**
 * Check if type is a Function Block
 */
export function isFunctionBlockType(stType: string): boolean {
  return FB_TYPES.includes(stType.toUpperCase());
}

/**
 * Check if type is numeric (INT, REAL variants)
 */
export function isNumericType(stType: string): boolean {
  const normalizedType = stType.toUpperCase();
  return [
    "SINT",
    "INT",
    "DINT",
    "LINT",
    "USINT",
    "UINT",
    "UDINT",
    "ULINT",
    "REAL",
    "LREAL",
  ].includes(normalizedType);
}

/**
 * Check if type is boolean
 */
export function isBooleanType(stType: string): boolean {
  return stType.toUpperCase() === "BOOL";
}

/**
 * Check if type is string
 */
export function isStringType(stType: string): boolean {
  const normalizedType = stType.toUpperCase();
  return ["STRING", "WSTRING"].includes(normalizedType);
}

/**
 * Check if type is time-related
 */
export function isTimeType(stType: string): boolean {
  const normalizedType = stType.toUpperCase();
  return ["TIME", "DATE", "TIME_OF_DAY", "TOD", "DATE_AND_TIME", "DT"].includes(
    normalizedType,
  );
}

// ============================================================================
// Helper Config Generation
// ============================================================================

/**
 * Generate Helper ID following namespace convention
 * Format: input_<type>.st_<project>_<program>_<variable>
 */
export function generateHelperId(
  projectName: string,
  programName: string,
  variableName: string,
  helperType: HelperType,
): string {
  const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "_");

  const id = `st_${sanitize(projectName)}_${sanitize(programName)}_${sanitize(variableName)}`;

  return `${helperType}.${id}`;
}

/**
 * Generate full helper configuration
 */
export function generateHelperConfig(
  projectName: string,
  programName: string,
  variableName: string,
  stType: string,
  initialValue?: unknown,
): HelperConfig | null {
  const helperType = getHelperType(stType);
  if (!helperType) {
    return null;
  }

  const id = generateHelperId(projectName, programName, variableName, helperType);
  const mapping = TYPE_MAPPINGS[stType.toUpperCase()];

  const config: HelperConfig = {
    id,
    type: helperType,
    name: `ST ${programName} - ${variableName}`,
  };

  // Set type-specific options
  if (helperType === "input_number" && mapping) {
    config.min = mapping.defaultMin;
    config.max = mapping.defaultMax;
    config.step = mapping.defaultStep;
    config.mode = "box";

    if (initialValue !== undefined && typeof initialValue === "number") {
      config.initial = initialValue;
    } else {
      config.initial = 0;
    }
  }

  if (helperType === "input_boolean") {
    config.initial = initialValue === true;
  }

  if (helperType === "input_text") {
    config.initial = typeof initialValue === "string" ? initialValue : "";
  }

  return config;
}

/**
 * Get default value for a data type
 */
export function getDefaultValue(stType: string): unknown {
  const normalizedType = stType.toUpperCase();

  if (isBooleanType(normalizedType)) return false;
  if (isNumericType(normalizedType)) return 0;
  if (isStringType(normalizedType)) return "";
  if (isTimeType(normalizedType)) return "PT0S";

  return null;
}

/**
 * Convert ST literal value to helper-compatible value
 */
export function convertToHelperValue(value: unknown, stType: string): unknown {
  const normalizedType = stType.toUpperCase();

  if (isBooleanType(normalizedType)) {
    return value === true || value === "TRUE" || value === 1;
  }

  if (isNumericType(normalizedType)) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return parseFloat(value) || 0;
    return 0;
  }

  if (isStringType(normalizedType)) {
    return String(value ?? "");
  }

  return value;
}
