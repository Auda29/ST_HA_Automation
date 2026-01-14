/**
 * Storage Analyzer - Determine persistence requirements for variables
 *
 * Analyzes ST variables to determine which need HA helpers for
 * state persistence across automation runs.
 *
 * Storage Strategy (Tiered Storage):
 * - DERIVED: Entity-bound variables (value comes from entity state)
 * - TRANSIENT: Temporary variables (only valid during single run)
 * - PERSISTENT: Variables that need to survive across runs (via HA helpers)
 */

import type {
  ProgramNode,
  VariableDeclaration,
  Expression,
  AssignmentStatement,
} from "../parser/ast";
import type {
  StorageAnalysisResult,
  VariableStorageInfo,
  VariableUsageInfo,
  HelperConfig,
  Diagnostic,
  DiagnosticSeverity,
  StorageDecision,
} from "./types";
import { StorageType, StorageDiagnosticCodes } from "./types";
import { walkAST, expressionContainsVariable } from "./ast-visitor";
import {
  getHelperType,
  isFunctionBlockType,
  generateHelperConfig,
  getDefaultValue,
  convertToHelperValue,
} from "./helper-mapping";
import { parsePragmas, hasPragma } from "./trigger-generator";

// ============================================================================
// Main Analyzer Class
// ============================================================================

export class StorageAnalyzer {
  private ast: ProgramNode;
  private projectName: string;
  private diagnostics: Diagnostic[] = [];
  private usageMap: Map<string, VariableUsageInfo> = new Map();
  private variableMap: Map<string, VariableDeclaration> = new Map();

  constructor(ast: ProgramNode, projectName: string = "default") {
    this.ast = ast;
    this.projectName = projectName;
  }

  /**
   * Run full storage analysis
   */
  analyze(): StorageAnalysisResult {
    // Phase 1: Build variable map
    this.buildVariableMap();

    // Phase 2: Analyze variable usage
    this.analyzeUsage();

    // Phase 3: Determine storage type for each variable
    const variables = this.determineStorageTypes();

    // Phase 4: Generate helper configs for persistent variables
    const helpers = this.generateHelperConfigs(variables);

    // Phase 5: Validate
    this.validate(variables);

    return {
      variables,
      helpers,
      diagnostics: this.diagnostics,
    };
  }

  // ==========================================================================
  // Phase 1: Build Variable Map
  // ==========================================================================

  private buildVariableMap(): void {
    for (const varDecl of this.ast.variables) {
      this.variableMap.set(varDecl.name, varDecl);
    }
  }

  // ==========================================================================
  // Phase 2: Analyze Usage
  // ==========================================================================

  private analyzeUsage(): void {
    // Initialize usage info for all variables
    for (const varDecl of this.ast.variables) {
      this.usageMap.set(varDecl.name, {
        isRead: false,
        isWritten: false,
        hasSelfReference: false,
        isFBInstance: isFunctionBlockType(varDecl.dataType.name),
        isTimerRelated: this.isTimerRelatedType(varDecl.dataType.name),
        readCount: 0,
        writeCount: 0,
      });
    }

    // Track assignments to detect self-references
    const assignments: Map<string, Expression[]> = new Map();

    walkAST(this.ast, {
      onVariableRef: (node) => {
        const usage = this.usageMap.get(node.name);
        if (usage) {
          usage.isRead = true;
          usage.readCount++;
        }
      },

      onAssignment: (node) => {
        const targetName = this.getAssignmentTargetName(node);

        if (targetName) {
          const usage = this.usageMap.get(targetName);
          if (usage) {
            usage.isWritten = true;
            usage.writeCount++;
          }

          // Collect assignments for self-reference detection
          if (!assignments.has(targetName)) {
            assignments.set(targetName, []);
          }
          assignments.get(targetName)!.push(node.value);
        }
      },
    });

    // Detect self-references (e.g., counter := counter + 1)
    for (const [varName, expressions] of assignments) {
      for (const expr of expressions) {
        if (expressionContainsVariable(expr, varName)) {
          const usage = this.usageMap.get(varName);
          if (usage) {
            usage.hasSelfReference = true;
          }
        }
      }
    }
  }

  private getAssignmentTargetName(stmt: AssignmentStatement): string | null {
    const target = stmt.target;

    if (typeof target === "string") {
      return target;
    }

    // target is a MemberAccess - get root variable name
    // e.g., for fb.output, get 'fb'
    let current: Expression = target;
    while (current.type === "MemberAccess") {
      current = current.object;
    }
    if (current.type === "VariableRef") {
      return current.name;
    }

    return null;
  }

  private isTimerRelatedType(typeName: string): boolean {
    return ["TON", "TOF", "TP", "TIME"].includes(typeName.toUpperCase());
  }

  // ==========================================================================
  // Phase 3: Determine Storage Types
  // ==========================================================================

  private determineStorageTypes(): VariableStorageInfo[] {
    const results: VariableStorageInfo[] = [];

    for (const varDecl of this.ast.variables) {
      const usage = this.usageMap.get(varDecl.name)!;
      const storage = this.determineStorageType(varDecl, usage);

      results.push({
        name: varDecl.name,
        dataType: varDecl.dataType.name,
        storage,
        usageInfo: usage,
      });
    }

    return results;
  }

  private determineStorageType(
    varDecl: VariableDeclaration,
    usage: VariableUsageInfo,
  ): StorageDecision {
    const pragmas = parsePragmas(varDecl.pragmas);

    // 1. Entity-bound variables → DERIVED
    if (varDecl.binding) {
      return {
        type: StorageType.DERIVED,
        reason: "Entity-bound variable - value comes from entity state",
      };
    }

    // 2. Check explicit pragmas
    if (hasPragma(pragmas, "transient")) {
      this.addDiagnostic(
        "Info",
        StorageDiagnosticCodes.EXPLICIT_TRANSIENT,
        `Variable '${varDecl.name}' explicitly marked as transient`,
        varDecl.location,
      );

      return {
        type: StorageType.TRANSIENT,
        reason: "Explicit {transient} pragma",
      };
    }

    if (hasPragma(pragmas, "persistent")) {
      this.addDiagnostic(
        "Info",
        StorageDiagnosticCodes.EXPLICIT_PERSISTENT,
        `Variable '${varDecl.name}' explicitly marked as persistent`,
        varDecl.location,
      );

      return this.createPersistentDecision(varDecl, "Explicit {persistent} pragma");
    }

    // 3. Auto-detect persistence needs

    // Self-reference (counter := counter + 1) → PERSISTENT
    if (usage.hasSelfReference) {
      this.addDiagnostic(
        "Info",
        StorageDiagnosticCodes.AUTO_PERSISTENT,
        `Variable '${varDecl.name}' auto-detected as persistent (self-reference)`,
        varDecl.location,
      );

      return this.createPersistentDecision(varDecl, "Self-reference detected");
    }

    // FB instances → PERSISTENT (they have internal state)
    // Note: FBs require special serialization - helper config may not be available
    if (usage.isFBInstance) {
      this.addDiagnostic(
        "Info",
        StorageDiagnosticCodes.AUTO_PERSISTENT,
        `Variable '${varDecl.name}' auto-detected as persistent (FB instance)`,
        varDecl.location,
      );

      return this.createFBPersistentDecision(varDecl, "Function Block instance");
    }

    // Timer-related (TIME type) → PERSISTENT
    // Note: TIME types are stored as input_text with ISO duration format
    if (usage.isTimerRelated) {
      this.addDiagnostic(
        "Info",
        StorageDiagnosticCodes.AUTO_PERSISTENT,
        `Variable '${varDecl.name}' auto-detected as persistent (timer-related)`,
        varDecl.location,
      );

      return this.createPersistentDecision(varDecl, "Timer-related variable");
    }

    // 4. Default → TRANSIENT
    return {
      type: StorageType.TRANSIENT,
      reason: "No persistence requirement detected",
    };
  }

  private createPersistentDecision(
    varDecl: VariableDeclaration,
    reason: string,
  ): StorageDecision {
    const helperType = getHelperType(varDecl.dataType.name);

    if (!helperType) {
      this.addDiagnostic(
        "Warning",
        StorageDiagnosticCodes.INVALID_HELPER_TYPE,
        `Cannot create helper for type '${varDecl.dataType.name}' - using transient storage`,
        varDecl.location,
      );

      return {
        type: StorageType.TRANSIENT,
        reason: `No helper type available for ${varDecl.dataType.name}`,
      };
    }

    const helperId =
      `input_${helperType.replace("input_", "")}.st_${this.projectName}_${this.ast.name}_${varDecl.name}`.toLowerCase();

    // Extract initial value
    let initialValue = getDefaultValue(varDecl.dataType.name);
    if (varDecl.initialValue?.type === "Literal") {
      initialValue = convertToHelperValue(
        varDecl.initialValue.value,
        varDecl.dataType.name,
      );
    }

    return {
      type: StorageType.PERSISTENT,
      reason,
      helperId,
      helperType,
      initialValue,
    };
  }

  /**
   * Create persistent decision for Function Block instances.
   * FB types (TON, R_TRIG, etc.) have internal state that requires
   * special serialization - full helper generation is handled by
   * the Helper Manager in a later phase.
   */
  private createFBPersistentDecision(
    _varDecl: VariableDeclaration,
    reason: string,
  ): StorageDecision {
    // FBs are persistent but don't have a simple helper mapping.
    // The Helper Manager will handle state serialization for these.
    return {
      type: StorageType.PERSISTENT,
      reason,
      // No helperId/helperType for FBs - requires special handling
    };
  }

  // ==========================================================================
  // Phase 4: Generate Helper Configs
  // ==========================================================================

  private generateHelperConfigs(variables: VariableStorageInfo[]): HelperConfig[] {
    const helpers: HelperConfig[] = [];

    for (const varInfo of variables) {
      if (varInfo.storage.type !== StorageType.PERSISTENT) {
        continue;
      }

      const config = generateHelperConfig(
        this.projectName,
        this.ast.name,
        varInfo.name,
        varInfo.dataType,
        varInfo.storage.initialValue,
      );

      if (config) {
        helpers.push(config);
      }
    }

    return helpers;
  }

  // ==========================================================================
  // Phase 5: Validation
  // ==========================================================================

  private validate(variables: VariableStorageInfo[]): void {
    for (const varInfo of variables) {
      const usage = varInfo.usageInfo;
      const varDecl = this.variableMap.get(varInfo.name)!;
      const pragmas = parsePragmas(varDecl.pragmas);

      // Warn about self-referencing variables not marked as persistent
      if (usage.hasSelfReference && varInfo.storage.type === StorageType.TRANSIENT) {
        this.addDiagnostic(
          "Warning",
          StorageDiagnosticCodes.SELF_REF_NOT_PERSISTENT,
          `Variable '${varInfo.name}' has self-reference but is transient - value will reset each run`,
          varDecl.location,
        );
      }

      // Warn about FB instances not marked as persistent
      if (usage.isFBInstance && varInfo.storage.type === StorageType.TRANSIENT) {
        this.addDiagnostic(
          "Warning",
          StorageDiagnosticCodes.FB_INSTANCE_NOT_PERSISTENT,
          `Function Block '${varInfo.name}' is transient - internal state will reset each run`,
          varDecl.location,
        );
      }

      // Warn about persistent variables that are never written
      if (varInfo.storage.type === StorageType.PERSISTENT && !usage.isWritten) {
        this.addDiagnostic(
          "Warning",
          StorageDiagnosticCodes.UNUSED_PERSISTENT,
          `Persistent variable '${varInfo.name}' is never written - consider making it transient`,
          varDecl.location,
        );
      }

      // Check for conflicting pragmas
      if (hasPragma(pragmas, "persistent") && hasPragma(pragmas, "transient")) {
        this.addDiagnostic(
          "Error",
          StorageDiagnosticCodes.CONFLICTING_PRAGMAS,
          `Variable '${varInfo.name}' has conflicting {persistent} and {transient} pragmas`,
          varDecl.location,
        );
      }
    }
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private addDiagnostic(
    severity: DiagnosticSeverity,
    code: string,
    message: string,
    location?: { startLine: number; startColumn: number },
  ): void {
    this.diagnostics.push({
      severity,
      code,
      message,
      location: location
        ? { line: location.startLine, column: location.startColumn }
        : undefined,
    });
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Analyze storage requirements for a program AST
 */
export function analyzeStorage(
  ast: ProgramNode,
  projectName?: string,
): StorageAnalysisResult {
  const analyzer = new StorageAnalyzer(ast, projectName);
  return analyzer.analyze();
}

/**
 * Get only the variables that need helpers
 */
export function getPersistentVariables(
  ast: ProgramNode,
  projectName?: string,
): VariableStorageInfo[] {
  const result = analyzeStorage(ast, projectName);
  return result.variables.filter((v) => v.storage.type === StorageType.PERSISTENT);
}

/**
 * Get helper configs for a program
 */
export function getRequiredHelpers(
  ast: ProgramNode,
  projectName?: string,
): HelperConfig[] {
  const result = analyzeStorage(ast, projectName);
  return result.helpers;
}
