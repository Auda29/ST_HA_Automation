/**
 * Trigger Generator - Generates Home Assistant triggers
 *
 * This module contains functions to generate different types of HA triggers
 * based on entity types and pragmas found in the code.
 */

import type { TriggerConfig, ParsedPragma } from "./types";
import type { PragmaNode } from "../parser/ast";

/**
 * Generate a standard state trigger
 * Fires when an entity changes state (excluding unavailable/unknown states)
 */
export function generateStateTrigger(
  entityId: string,
  options?: { id?: string },
): TriggerConfig {
  return {
    platform: "state",
    entity_id: entityId,
    not_from: ["unavailable", "unknown"],
    not_to: ["unavailable", "unknown"],
    id: options?.id,
  };
}

/**
 * Generate a rising edge trigger (OFF -> ON)
 * Used for boolean entities with {trigger: rising} pragma
 */
export function generateRisingEdgeTrigger(
  entityId: string,
  id?: string,
): TriggerConfig {
  return {
    platform: "state",
    entity_id: entityId,
    from: "off",
    to: "on",
    edge: "rising",
    id,
  };
}

/**
 * Generate a falling edge trigger (ON -> OFF)
 * Used for boolean entities with {trigger: falling} pragma
 */
export function generateFallingEdgeTrigger(
  entityId: string,
  id?: string,
): TriggerConfig {
  return {
    platform: "state",
    entity_id: entityId,
    from: "on",
    to: "off",
    edge: "falling",
    id,
  };
}

/**
 * Generate a numeric state trigger
 * Fires when a numeric entity crosses a threshold
 */
export function generateNumericStateTrigger(
  entityId: string,
  options?: { above?: number; below?: number; id?: string },
): TriggerConfig {
  return {
    platform: "numeric_state",
    entity_id: entityId,
    above: options?.above,
    below: options?.below,
    id: options?.id,
  };
}

// ============================================================================
// Pragma Parsing
// ============================================================================

/**
 * Parse pragmas from AST nodes into a simpler format
 */
export function parsePragmas(pragmas: PragmaNode[]): ParsedPragma[] {
  return pragmas.map((p) => ({
    name: p.name.toLowerCase(),
    value: p.value,
  }));
}

/**
 * Check if a variable should trigger based on pragmas
 */
export function shouldTrigger(
  pragmas: PragmaNode[],
): boolean | "rising" | "falling" | null {
  const parsed = parsePragmas(pragmas);

  // Check for explicit no_trigger
  if (hasPragma(parsed, "no_trigger")) {
    return false;
  }

  // Check for edge pragmas
  const edge = getPragmaValue(parsed, "edge");
  if (edge === "rising" || edge === "falling") {
    return edge;
  }

  // Check for explicit trigger
  if (hasPragma(parsed, "trigger")) {
    return true;
  }

  // Return null to indicate no explicit decision (use default behavior)
  return null;
}

/**
 * Check if a pragma exists
 */
export function hasPragma(pragmas: ParsedPragma[], name: string): boolean {
  return pragmas.some((p) => p.name === name);
}

/**
 * Get pragma value as string
 */
export function getPragmaValue(
  pragmas: ParsedPragma[],
  name: string,
): string | undefined {
  const pragma = pragmas.find((p) => p.name === name);
  if (pragma?.value === undefined) return undefined;
  // Convert to string if not already
  return String(pragma.value);
}

// ============================================================================
// Entity Validation
// ============================================================================

const VALID_DOMAINS = [
  "sensor",
  "binary_sensor",
  "switch",
  "light",
  "input_boolean",
  "input_number",
  "input_select",
  "input_text",
  "number",
  "select",
  "button",
  "climate",
  "cover",
  "fan",
  "lock",
  "media_player",
  "automation",
  "script",
  "scene",
  "timer",
  "counter",
] as const;

/**
 * Validate entity ID format and domain
 *
 * Valid format: domain.entity_name
 * Examples: sensor.temperature, light.living_room
 */
export function isValidEntityId(entityId: string): boolean {
  if (!entityId || typeof entityId !== "string") {
    return false;
  }

  // Must contain exactly one dot
  const parts = entityId.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [domain, name] = parts;

  // Domain must be valid
  if (!VALID_DOMAINS.includes(domain as any)) {
    return false;
  }

  // Name must be non-empty and contain only valid chars
  if (!name || !/^[a-z0-9_]+$/.test(name)) {
    return false;
  }

  return true;
}

/**
 * Extract domain from entity ID
 */
export function getEntityDomain(entityId: string): string | null {
  const parts = entityId.split(".");
  return parts.length === 2 ? parts[0] : null;
}

/**
 * Check if an entity is a boolean type (binary_sensor, input_boolean, switch, light, etc.)
 */
export function isBooleanEntity(entityId: string): boolean {
  const domain = getEntityDomain(entityId);
  return (
    domain === "binary_sensor" ||
    domain === "input_boolean" ||
    domain === "switch" ||
    domain === "light"
  );
}

/**
 * Check if an entity is a numeric type (sensor, input_number, etc.)
 */
export function isNumericEntity(entityId: string): boolean {
  const domain = getEntityDomain(entityId);
  return (
    domain === "sensor" || domain === "input_number" || domain === "number"
  );
}
