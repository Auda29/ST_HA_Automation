/**
 * Restore Policy System
 *
 * Manages how persistent variables behave after HA restarts.
 */

import type { VariableDeclaration } from '../parser/ast';
import type {
  RestorePolicy,
  RestorePolicyConfig,
  VariableSchema,
} from './migration-types';
import { RestorePolicy as RP } from './migration-types';

// ============================================================================
// Policy Extraction
// ============================================================================

/**
 * Extract restore policy from variable declaration pragmas
 */
export function extractRestorePolicy(varDecl: VariableDeclaration): RestorePolicy {
  const pragmas = varDecl.pragmas || [];

  for (const pragma of pragmas) {
    switch (pragma.name.toLowerCase()) {
      case 'reset_on_restart':
        return RP.ALWAYS_INIT;
      case 'require_restore':
        return RP.REQUIRE_RESTORE;
    }
  }

  return RP.RESTORE_OR_INIT;
}

// ============================================================================
// Policy Evaluation
// ============================================================================

export interface RestoreResult {
  value: any;
  source: 'restored' | 'initial' | 'error';
  message?: string;
}

/**
 * Evaluate restore policy and determine value to use
 */
export function evaluateRestorePolicy(
  config: RestorePolicyConfig,
  currentHelperValue: any | null,
  isHelperAvailable: boolean
): RestoreResult {
  switch (config.policy) {
    case RP.ALWAYS_INIT:
      // Always use initial value
      return {
        value: config.initialValue,
        source: 'initial',
        message: `Variable '${config.variableName}' auf Initialwert gesetzt (reset_on_restart)`,
      };

    case RP.REQUIRE_RESTORE:
      // Must have restored value
      if (!isHelperAvailable) {
        return {
          value: null,
          source: 'error',
          message: `Variable '${config.variableName}' erfordert gespeicherten Wert, aber Helper '${config.helperId}' nicht gefunden (require_restore)`,
        };
      }
      if (currentHelperValue === null || currentHelperValue === undefined) {
        return {
          value: null,
          source: 'error',
          message: `Variable '${config.variableName}' erfordert gespeicherten Wert, aber Helper ist leer (require_restore)`,
        };
      }
      return {
        value: currentHelperValue,
        source: 'restored',
      };

    case RP.RESTORE_OR_INIT:
    default:
      // Restore if available, otherwise initial
      if (isHelperAvailable && currentHelperValue !== null && currentHelperValue !== undefined) {
        return {
          value: currentHelperValue,
          source: 'restored',
        };
      }
      return {
        value: config.initialValue,
        source: 'initial',
      };
  }
}

// ============================================================================
// Jinja Generation for Restore
// ============================================================================

/**
 * Generate Jinja template for variable initialization based on restore policy
 */
export function generateRestoreJinja(config: RestorePolicyConfig): string {
  const helperId = config.helperId;
  const initial = JSON.stringify(config.initialValue);

  switch (config.policy) {
    case RP.ALWAYS_INIT:
      // Always return initial value
      return initial;

    case RP.REQUIRE_RESTORE:
      // Return helper value, error handled at automation level
      return `{{ states('${helperId}') }}`;

    case RP.RESTORE_OR_INIT:
    default:
      // Return helper value if available, otherwise initial
      return `{% set _h = states('${helperId}') %}{{ _h if _h not in ['unknown', 'unavailable', ''] else ${initial} }}`;
  }
}

// ============================================================================
// Automation Condition for require_restore
// ============================================================================

/**
 * Generate condition that checks all require_restore variables
 */
export function generateRequireRestoreCondition(
  configs: RestorePolicyConfig[]
): object | null {
  const requireRestoreConfigs = configs.filter(
    (c) => c.policy === RP.REQUIRE_RESTORE,
  );

  if (requireRestoreConfigs.length === 0) {
    return null;
  }

  // Generate condition that checks all required helpers are available
  const checks = requireRestoreConfigs.map(
    (c) => `states('${c.helperId}') not in ['unknown', 'unavailable', '']`,
  );

  return {
    condition: 'template',
    value_template: `{{ ${checks.join(' and ')} }}`,
  };
}

// ============================================================================
// Schema Builder
// ============================================================================

/**
 * Build variable schema from declaration
 */
export function buildVariableSchema(
  varDecl: VariableDeclaration,
  helperId: string,
  helperType: VariableSchema['helperType'],
): VariableSchema {
  const schema: VariableSchema = {
    name: varDecl.name,
    dataType: varDecl.dataType.name,
    helperId,
    helperType,
    initialValue: extractInitialValue(varDecl),
    restorePolicy: extractRestorePolicy(varDecl),
  };

  // Add numeric constraints
  if (helperType === 'input_number') {
    schema.min = extractNumericConstraint(varDecl, 'min') ?? -1000000;
    schema.max = extractNumericConstraint(varDecl, 'max') ?? 1000000;
    schema.step = extractNumericConstraint(varDecl, 'step') ?? 1;
  }

  return schema;
}

function extractInitialValue(varDecl: VariableDeclaration): any {
  if (!varDecl.initialValue) {
    // Default by type
    switch (varDecl.dataType.name.toUpperCase()) {
      case 'BOOL':
        return false;
      case 'INT':
      case 'DINT':
      case 'REAL':
      case 'LREAL':
        return 0;
      case 'STRING':
        return '';
      default:
        return null;
    }
  }

  // Extract from literal
  if (varDecl.initialValue.type === 'Literal') {
    return varDecl.initialValue.value;
  }

  return null;
}

function extractNumericConstraint(
  varDecl: VariableDeclaration,
  constraint: 'min' | 'max' | 'step',
): number | null {
  const pragma = varDecl.pragmas?.find(
    (p) => p.name.toLowerCase() === constraint,
  );
  if (pragma && pragma.value) {
    return Number(pragma.value);
  }
  return null;
}

