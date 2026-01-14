/**
 * Dependency Analyzer - Main Analysis Engine
 *
 * This module analyzes Structured Text code to:
 * 1. Extract entity dependencies from variable bindings
 * 2. Analyze variable usage patterns (reads/writes)
 * 3. Automatically generate Home Assistant triggers
 * 4. Detect edge triggers (rising/falling) including R_TRIG/F_TRIG
 * 5. Validate usage patterns and report diagnostics
 */

import type {
  ProgramNode,
  VariableDeclaration,
  FunctionCall,
} from "../parser/ast";
import type {
  TriggerConfig,
  EntityDependency,
  AnalysisResult,
  AnalysisMetadata,
  Diagnostic,
  DiagnosticSeverity,
} from "./types";
import { DiagnosticCodes } from "./types";
import { walkAST, findVariableRefs } from "./ast-visitor";
import {
  generateStateTrigger,
  generateRisingEdgeTrigger,
  generateFallingEdgeTrigger,
  shouldTrigger,
  isValidEntityId,
  parsePragmas,
  getPragmaValue,
  hasPragma,
} from "./trigger-generator";

/**
 * Detected edge trigger from R_TRIG/F_TRIG function block usage
 */
interface DetectedEdgeTrigger {
  variableName: string;
  edge: "rising" | "falling";
  location?: { line: number; column: number };
}

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
  private detectedEdgeTriggers: DetectedEdgeTrigger[] = [];

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

    // Step 3: Analyze variable usage (reads/writes) and detect R_TRIG/F_TRIG
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
      // Use enriched EntityBinding if available, otherwise extract from initialValue
      const entityId = varDecl.binding?.entityId || this.extractEntityId(varDecl);

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
          "Error",
          DiagnosticCodes.INVALID_ENTITY_ID,
          `Invalid entity ID format: ${entityId}`,
          dependency.location,
        );
      }

      this.dependencies.push(dependency);
    }
  }

  /**
   * Fallback method to extract entity ID from initialValue
   * Used when EntityBinding doesn't have entityId set (backward compatibility)
   */
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
   * Also detects R_TRIG/F_TRIG function block usage for edge triggers
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

        // Track variable refs in assignment value
        const refs = findVariableRefs(stmt.value, {
          scope: "PROGRAM",
          inCondition: false,
          inLoop: false,
          path: [],
        });
        for (const ref of refs) {
          this.readVariables.add(ref.name);
        }
      },

      onFunctionCall: (call) => {
        const name = call.name.toUpperCase();

        // Detect R_TRIG / F_TRIG function block usage
        if (name === "R_TRIG" || name === "F_TRIG") {
          this.handleEdgeTriggerFB(call, name === "R_TRIG" ? "rising" : "falling");
        }
      },
    });
  }

  /**
   * Handle R_TRIG/F_TRIG function block detection
   * When these FBs are used on input variables, automatically generate edge triggers
   */
  private handleEdgeTriggerFB(call: FunctionCall, edge: "rising" | "falling"): void {
    // R_TRIG/F_TRIG typically take an input variable as first argument
    // or are called as: myRTrig(CLK := inputVar)
    if (call.arguments.length > 0) {
      const refs = findVariableRefs(call.arguments[0].value, {
        scope: "PROGRAM",
        inCondition: false,
        inLoop: false,
        path: [],
      });

      for (const ref of refs) {
        const dep = this.dependencies.find((d) => d.variableName === ref.name);
        if (dep && dep.direction === "INPUT") {
          // Record the detected edge trigger
          this.detectedEdgeTriggers.push({
            variableName: ref.name,
            edge,
            location: dep.location,
          });

          // Emit diagnostic
          this.addDiagnostic(
            "Info",
            DiagnosticCodes.EDGE_TRIGGER_DETECTED,
            `${edge === "rising" ? "R_TRIG" : "F_TRIG"} detected on '${ref.name}' - will generate ${edge} edge trigger`,
            dep.location,
          );
        }
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
      const parsedPragmas = parsePragmas(varDecl.pragmas);

      // Emit info diagnostic for explicit pragmas
      if (hasPragma(parsedPragmas, "trigger")) {
        this.addDiagnostic(
          "Info",
          DiagnosticCodes.AUTO_TRIGGER,
          `Variable '${dep.variableName}' explicitly marked as trigger`,
          dep.location,
        );
      }
      if (hasPragma(parsedPragmas, "no_trigger")) {
        this.addDiagnostic(
          "Info",
          DiagnosticCodes.EXPLICIT_NO_TRIGGER,
          `Variable '${dep.variableName}' explicitly excluded from triggers`,
          dep.location,
        );
      }

      if (triggerDecision === false) {
        // Explicit no_trigger
        continue;
      }

      if (!dep.entityId) {
        continue;
      }

      // Check if R_TRIG/F_TRIG was detected for this variable
      const detectedEdge = this.detectedEdgeTriggers.find(
        (e) => e.variableName === dep.variableName,
      );

      const trigger = this.createTrigger(dep, triggerDecision, detectedEdge?.edge);
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
      const fromStr = Array.isArray(t.from) ? t.from.join(",") : t.from || "";
      const toStr = Array.isArray(t.to) ? t.to.join(",") : t.to || "";
      const key = `${t.platform}:${t.entity_id}:${fromStr}:${toStr}:${t.edge || ""}`;
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
    detectedEdge?: "rising" | "falling",
  ): TriggerConfig | null {
    if (!dep.entityId) return null;

    // Priority: pragma edge > detected edge (R_TRIG/F_TRIG) > default state trigger
    const edge = triggerDecision === "rising" || triggerDecision === "falling"
      ? triggerDecision
      : detectedEdge;

    // Handle edge triggers
    if (edge === "rising") {
      return generateRisingEdgeTrigger(dep.entityId, dep.variableName);
    }
    if (edge === "falling") {
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
        "Warning",
        DiagnosticCodes.NO_TRIGGERS,
        "No triggers detected. Program will never execute automatically. " +
          "Add {trigger} pragma to input variables or ensure inputs are read in code.",
      );
    }

    // Check for too many triggers
    if (this.triggers.length > 10) {
      this.addDiagnostic(
        "Info",
        DiagnosticCodes.MANY_TRIGGERS,
        `Program triggers on ${this.triggers.length} entities. ` +
          "Consider using {no_trigger} pragma on less important inputs.",
      );
    }

    // Check for unused INPUT variables
    for (const dep of this.dependencies) {
      if (
        dep.direction === "INPUT" &&
        !this.readVariables.has(dep.variableName)
      ) {
        this.addDiagnostic(
          "Warning",
          DiagnosticCodes.UNUSED_INPUT,
          `Input variable '${dep.variableName}' is declared but never read`,
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
          "Warning",
          DiagnosticCodes.WRITE_TO_INPUT,
          `Writing to input variable '${dep.variableName}' - this may not update the entity`,
          dep.location,
        );
      }
    }

    // Check for reads from OUTPUT without writes
    for (const dep of this.dependencies) {
      if (
        dep.direction === "OUTPUT" &&
        this.readVariables.has(dep.variableName) &&
        !this.writtenVariables.has(dep.variableName)
      ) {
        this.addDiagnostic(
          "Warning",
          DiagnosticCodes.READ_FROM_OUTPUT,
          `Reading from output variable '${dep.variableName}' without writing - value may be stale`,
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

    // Check for {persistent} pragma on any variable
    const hasPersistentVars = this.ast.variables.some((v) => {
      const varPragmas = parsePragmas(v.pragmas);
      return hasPragma(varPragmas, "persistent");
    });

    return {
      programName: this.ast.name,
      inputCount: deps.filter((d) => d.direction === "INPUT").length,
      outputCount: deps.filter((d) => d.direction === "OUTPUT").length,
      triggerCount: this.triggers.length,
      hasPersistentVars,
      hasTimers: this.hasTimerUsage(),
      mode: getPragmaValue(programPragmas, "mode") as
        | "single"
        | "restart"
        | "queued"
        | "parallel"
        | undefined,
      // Keep throttle/debounce as ST-style time literals (strings)
      throttle: getPragmaValue(programPragmas, "throttle"),
      debounce: getPragmaValue(programPragmas, "debounce"),
    };
  }

  private hasTimerUsage(): boolean {
    let hasTimer = false;
    const timerTypes = new Set(["TON", "TOF", "TP", "TON_EDGE"]);

    walkAST(this.ast, {
      onFunctionCall: (call) => {
        if (hasTimer) {
          return;
        }

        const callNameUpper = call.name.toUpperCase();

        // Direct calls using FB type name (e.g. TON(IN := ...)
        if (timerTypes.has(callNameUpper)) {
          hasTimer = true;
          return;
        }

        // Instance calls (e.g. myTimer(IN := ..., PT := ...))
        const varDecl = this.variableMap.get(call.name);
        if (varDecl) {
          const typeNameUpper = varDecl.dataType.name.toUpperCase();
          if (timerTypes.has(typeNameUpper)) {
            hasTimer = true;
          }
        }
      },
    });

    return hasTimer;
  }

  /**
   * Add a diagnostic message
   */
  private addDiagnostic(
    severity: DiagnosticSeverity,
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
