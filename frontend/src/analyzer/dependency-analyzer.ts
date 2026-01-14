/**
 * Dependency Analyzer - Main Analysis Engine
 *
 * This module analyzes Structured Text code to:
 * 1. Extract entity dependencies from variable bindings
 * 2. Analyze variable usage patterns (reads/writes)
 * 3. Automatically generate Home Assistant triggers
 * 4. Detect edge triggers (rising/falling)
 * 5. Validate usage patterns and report diagnostics
 */

import type {
  ProgramNode,
  VariableDeclaration,
  AssignmentStatement,
  FunctionCall,
  VariableRef,
  Expression,
  Literal,
} from "../parser/ast";
import type {
  TriggerConfig,
  EntityDependency,
  AnalysisResult,
  AnalysisMetadata,
  Diagnostic,
  EdgeTrigger,
} from "./types";
import { DiagnosticCodes } from "./types";
import { walkAST, findVariableRefs } from "./ast-visitor";
import {
  generateStateTrigger,
  generateRisingEdgeTrigger,
  generateFallingEdgeTrigger,
  shouldTrigger,
  isValidEntityId,
  isBooleanEntity,
  parsePragmas,
  getPragmaValue,
} from "./trigger-generator";

/**
 * Main dependency analyzer class
 */
class DependencyAnalyzer {
  private ast: ProgramNode;
  private dependencies: EntityDependency[] = [];
  private triggers: TriggerConfig[] = [];
  private diagnostics: Diagnostic[] = [];
  private readVariables = new Set<string>();
  private writtenVariables = new Set<string>();
  private variableMap = new Map<string, VariableDeclaration>();

  constructor(ast: ProgramNode) {
    this.ast = ast;
  }

  /**
   * Main analysis entry point
   */
  public analyze(): AnalysisResult {
    // Step 1: Build variable map for quick lookup
    this.buildVariableMap();

    // Step 2: Extract entity dependencies from variable bindings
    this.extractDependencies();

    // Step 3: Analyze variable usage (reads/writes)
    this.analyzeUsage();

    // Step 4: Generate triggers for INPUT variables
    this.generateTriggers();

    // Step 5: Validate and generate diagnostics
    this.validate();

    // Step 6: Build metadata
    const metadata = this.buildMetadata();

    return {
      triggers: this.triggers,
      dependencies: this.dependencies,
      diagnostics: this.diagnostics,
      metadata,
    };
  }

  /**
   * Build a map of variable names to declarations for quick lookup
   */
  private buildVariableMap(): void {
    if (!this.ast || !this.ast.variables) {
      return;
    }
    for (const varDecl of this.ast.variables) {
      this.variableMap.set(varDecl.name, varDecl);
    }
  }

  /**
   * Extract entity dependencies from variable bindings
   */
  private extractDependencies(): void {
    if (!this.ast.variables) {
      return;
    }
    for (const varDecl of this.ast.variables) {
      const entityId = this.extractEntityId(varDecl);

      // Only process variables with entity bindings (those with entity IDs)
      if (!entityId && !varDecl.binding) {
        continue;
      }

      // Determine direction from VAR section or binding
      let direction: "INPUT" | "OUTPUT" | "MEMORY";
      if (varDecl.section === "VAR_INPUT") {
        direction = "INPUT";
      } else if (varDecl.section === "VAR_OUTPUT") {
        direction = "OUTPUT";
      } else if (varDecl.binding) {
        direction = varDecl.binding.direction;
      } else {
        // Variable has entity ID but no clear direction, skip
        continue;
      }

      const dependency: EntityDependency = {
        variableName: varDecl.name,
        entityId,
        direction,
        dataType: varDecl.dataType.name,
        isTrigger: false, // Will be determined later
        location: varDecl.location
          ? {
              line: varDecl.location.startLine,
              column: varDecl.location.startColumn,
            }
          : undefined,
      };

      // Validate entity ID
      if (entityId && !isValidEntityId(entityId)) {
        this.addDiagnostic(
          "error",
          DiagnosticCodes.INVALID_ENTITY_ID,
          `Invalid entity ID format: ${entityId}`,
          dependency.location,
        );
      }

      this.dependencies.push(dependency);
    }
  }

  private extractEntityId(varDecl: VariableDeclaration): string | undefined {
    // Entity ID is stored in initialValue as a string literal
    // Example: motion AT %I* : BOOL := 'binary_sensor.motion';
    if (!varDecl.initialValue) return undefined;

    if (
      varDecl.initialValue.type === "Literal" &&
      varDecl.initialValue.kind === "string"
    ) {
      return varDecl.initialValue.value as string;
    }

    return undefined;
  }

  /**
   * Analyze variable usage patterns throughout the code
   */
  private analyzeUsage(): void {
    walkAST(this.ast, {
      onVariableRef: (ref) => {
        this.readVariables.add(ref.name);
      },

      onAssignment: (stmt) => {
        // Mark target as written
        if (typeof stmt.target === "string") {
          this.writtenVariables.add(stmt.target);
        } else {
          // For member access (e.g., fb.output), mark the base variable
          let current: any = stmt.target;
          while (current.type === "MemberAccess") {
            current = current.object;
          }
          if (current.type === "VariableRef") {
            this.writtenVariables.add(current.name);
          }
        }

        // Check for edge trigger pattern: IF NOT oldValue AND newValue THEN
        this.handleEdgeTrigger(stmt);
      },

      onFunctionCall: (call) => {
        // Some FBs might modify their inputs (IN_OUT parameters)
        const name = call.name.toUpperCase();
        // Timer FBs (TON, TOF, TP) don't modify state, but TON_EDGE does
        // We'll handle this in a more sophisticated way later
      },
    });
  }

  private handleEdgeTrigger(stmt: AssignmentStatement): void {
    // TODO: Detect pattern like "IF NOT prev AND curr THEN" for rising edge
    // For now, we rely on pragmas
    const refs = findVariableRefs(stmt.value, {
      scope: "PROGRAM",
      inCondition: false,
      inLoop: false,
      path: [],
    });
    for (const ref of refs) {
      const dep = this.dependencies.find((d) => d.variableName === ref.name);
      if (dep) {
        // Mark as read
        this.readVariables.add(ref.name);
      }
    }
  }

  /**
   * Generate triggers based on INPUT variables and pragmas
   */
  private generateTriggers(): void {
    for (const dep of this.dependencies) {
      // Only INPUT variables can be triggers
      if (dep.direction !== "INPUT") {
        continue;
      }

      const varDecl = this.variableMap.get(dep.variableName);
      if (!varDecl) continue;

      // Check pragma for explicit trigger control
      const triggerDecision = shouldTrigger(varDecl.pragmas);

      if (triggerDecision === false) {
        // Explicit no_trigger
        continue;
      }

      if (!dep.entityId) {
        continue;
      }

      const trigger = this.createTrigger(dep, triggerDecision);
      if (trigger) {
        this.triggers.push(trigger);
        dep.isTrigger = true;
      }
    }

    // Deduplicate triggers
    this.triggers = this.deduplicateTriggers(this.triggers);
  }

  private deduplicateTriggers(triggers: TriggerConfig[]): TriggerConfig[] {
    const seen = new Set<string>();
    return triggers.filter((t) => {
      // Create a unique key based on platform, entity_id, from, to
      const key = `${t.platform}:${t.entity_id}:${t.from || ""}:${t.to || ""}:${t.edge || ""}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private createTrigger(
    dep: EntityDependency,
    triggerDecision: boolean | "rising" | "falling" | null,
  ): TriggerConfig | null {
    if (!dep.entityId) return null;

    // Handle edge triggers
    if (triggerDecision === "rising") {
      return generateRisingEdgeTrigger(dep.entityId, dep.variableName);
    }
    if (triggerDecision === "falling") {
      return generateFallingEdgeTrigger(dep.entityId, dep.variableName);
    }

    // Default: generate state trigger
    return generateStateTrigger(dep.entityId, { id: dep.variableName });
  }

  /**
   * Validate usage patterns and generate diagnostics
   */
  private validate(): void {
    // Check if any triggers were generated
    if (this.triggers.length === 0) {
      this.addDiagnostic(
        "warning",
        DiagnosticCodes.NO_TRIGGERS,
        "No triggers detected. Program may not run automatically.",
      );
    }

    // Check for too many triggers
    if (this.triggers.length > 10) {
      this.addDiagnostic(
        "warning",
        DiagnosticCodes.MANY_TRIGGERS,
        `Many triggers detected (${this.triggers.length}). Consider using fewer inputs or explicit {no_trigger} pragmas.`,
      );
    }

    // Check for unused INPUT variables
    for (const dep of this.dependencies) {
      if (
        dep.direction === "INPUT" &&
        !this.readVariables.has(dep.variableName)
      ) {
        this.addDiagnostic(
          "warning",
          DiagnosticCodes.UNUSED_INPUT,
          `Input variable '${dep.variableName}' is never read.`,
          dep.location,
        );
      }
    }

    // Check for writes to INPUT variables
    for (const dep of this.dependencies) {
      if (
        dep.direction === "INPUT" &&
        this.writtenVariables.has(dep.variableName)
      ) {
        this.addDiagnostic(
          "warning",
          DiagnosticCodes.WRITE_TO_INPUT,
          `Input variable '${dep.variableName}' should not be written to.`,
          dep.location,
        );
      }
    }
  }

  /**
   * Build metadata about the program
   */
  private buildMetadata(): AnalysisMetadata {
    const deps = this.dependencies;
    const programPragmas = parsePragmas(this.ast.pragmas);

    return {
      programName: this.ast.name,
      inputCount: deps.filter((d) => d.direction === "INPUT").length,
      outputCount: deps.filter((d) => d.direction === "OUTPUT").length,
      triggerCount: this.triggers.length,
      hasPersistentVars: deps.some((d) => d.direction === "OUTPUT"),
      hasTimers: this.hasTimerUsage(),
      mode: getPragmaValue(programPragmas, "mode") as any,
      throttle: getPragmaValue(programPragmas, "throttle")
        ? parseInt(getPragmaValue(programPragmas, "throttle")!)
        : undefined,
      debounce: getPragmaValue(programPragmas, "debounce")
        ? parseInt(getPragmaValue(programPragmas, "debounce")!)
        : undefined,
    };
  }

  private hasTimerUsage(): boolean {
    let hasTimer = false;

    walkAST(this.ast, {
      onFunctionCall: (call) => {
        const name = call.name.toUpperCase();
        if (
          name === "TON" ||
          name === "TOF" ||
          name === "TP" ||
          name === "TON_EDGE"
        ) {
          hasTimer = true;
        }
      },
    });

    return hasTimer;
  }

  /**
   * Add a diagnostic message
   */
  private addDiagnostic(
    severity: "error" | "warning" | "info",
    code: string,
    message: string,
    location?: { line: number; column: number },
  ): void {
    this.diagnostics.push({ severity, code, message, location });
  }
}

/**
 * Public API - Analyze a parsed AST
 */
export function analyzeDependencies(ast: ProgramNode): AnalysisResult {
  const analyzer = new DependencyAnalyzer(ast);
  return analyzer.analyze();
}
