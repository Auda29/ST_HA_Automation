/**
 * Main Transpiler - ST AST to HA Automation/Script
 */

import type { ProgramNode } from "../parser/ast";
import type { AnalysisResult } from "../analyzer/types";
import type {
  StorageAnalysisResult,
  HelperConfig,
} from "../analyzer/types";
import type {
  TranspilerResult,
  HAAutomation,
  HAScript,
  TranspilerContext,
  VariableInfo,
  EntityInfo,
  TranspilerDiagnostic,
  HATrigger,
  HAAction,
} from "./types";
import { analyzeDependencies } from "../analyzer/dependency-analyzer";
import { analyzeStorage } from "../analyzer/storage-analyzer";
import { ActionGenerator } from "./action-generator";
import { parsePragmas } from "../analyzer/trigger-generator";
import { TimerTranspiler, TimerOutputResolver } from "./timer-transpiler";
import { walkAST } from "../analyzer/ast-visitor";
import type { TimerInstance, TimerInputs } from "./timer-types";
import { SourceMapBuilder } from "../sourcemap/source-map";

export class Transpiler {
  private ast: ProgramNode;
  private projectName: string;
  private depAnalysis!: AnalysisResult;
  private storageAnalysis!: StorageAnalysisResult;
  private context!: TranspilerContext;
  private sourceMapBuilder?: SourceMapBuilder;
  private diagnostics: TranspilerDiagnostic[] = [];
  private timerTranspiler?: TimerTranspiler;
  private timerResolver?: TimerOutputResolver;
  private timerHelpers: HelperConfig[] = [];
  private additionalAutomations: HAAutomation[] = [];
  private timerMainActions: HAAction[] = [];

  constructor(ast: ProgramNode, projectName: string = 'default', sourceContent?: string) {
    this.ast = ast;
    this.projectName = projectName;
    
    // Initialize source map builder if source content is provided
    if (sourceContent) {
      this.sourceMapBuilder = new SourceMapBuilder({
        project: projectName,
        program: ast.name,
        sourceFile: `${ast.name}.st`,
        sourceContent: sourceContent, // Explicitly use parameter to avoid TS6133
      });
    }
  }

  /**
   * Transpile AST to HA automation and script
   */
  transpile(): TranspilerResult {
    // Phase 1: Run analyzers
    this.depAnalysis = analyzeDependencies(this.ast);
    this.storageAnalysis = analyzeStorage(this.ast, this.projectName);

    // Collect diagnostics from analyzers
    this.diagnostics.push(
      ...this.depAnalysis.diagnostics.map(d => ({
        severity: d.severity as 'Error' | 'Warning' | 'Info',
        code: d.code,
        message: d.message,
        stLine: d.location?.line,
      })),
      ...this.storageAnalysis.diagnostics.map(d => ({
        severity: d.severity as 'Error' | 'Warning' | 'Info',
        code: d.code,
        message: d.message,
        stLine: d.location?.line,
      }))
    );

    // Phase 2: Build transpiler context
    this.buildContext();

    // Phase 3: Initialize timer transpiler and process timer FBs
    this.timerTranspiler = new TimerTranspiler(this.context);
    this.timerResolver = new TimerOutputResolver();
    this.processTimerFBs();

    // Phase 4: Generate automation (triggers)
    const automation = this.generateAutomation();

    // Phase 5: Generate script (logic)
    const script = this.generateScript();

    // Phase 6: Collect helpers (storage + timers)
    const helpers = [...this.storageAnalysis.helpers, ...this.timerHelpers];

    // Phase 7: Build source map
    const sourceMap = this.sourceMapBuilder
      ? this.sourceMapBuilder.build(automation.id, script.alias.replace(/\[ST\]\s*/, '').toLowerCase().replace(/[^a-z0-9_]/g, '_'))
      : {
          version: 1 as const,
          project: this.projectName,
          program: this.ast.name,
          automationId: automation.id,
          generatedAt: new Date().toISOString(),
          mappings: {},
        };

    return {
      automation,
      script,
      helpers,
      additionalAutomations: this.additionalAutomations,
      sourceMap,
      diagnostics: this.diagnostics,
    };
  }

  // ==========================================================================
  // Context Building
  // ==========================================================================

  private buildContext(): void {
    const variables = new Map<string, VariableInfo>();
    const entityBindings = new Map<string, EntityInfo>();

    // Build variable info map
    for (const varDecl of this.ast.variables) {
      const storageInfo = this.storageAnalysis.variables.find(v => v.name === varDecl.name);
      const depInfo = this.depAnalysis.dependencies.find(d => d.variableName === varDecl.name);

      const varInfo: VariableInfo = {
        name: varDecl.name,
        dataType: varDecl.dataType.name,
        isInput: varDecl.binding?.direction === 'INPUT' || varDecl.section === 'VAR_INPUT',
        isOutput: varDecl.binding?.direction === 'OUTPUT' || varDecl.section === 'VAR_OUTPUT',
        isPersistent: storageInfo?.storage.type === 'PERSISTENT',
        helperId: storageInfo?.storage.helperId,
        entityId: depInfo?.entityId || varDecl.binding?.entityId,
      };

      variables.set(varDecl.name, varInfo);

      // Build entity binding map
      if (depInfo && depInfo.entityId) {
        // Only include INPUT/OUTPUT, skip MEMORY for now
        if (depInfo.direction === 'INPUT' || depInfo.direction === 'OUTPUT') {
          entityBindings.set(varDecl.name, {
            entityId: depInfo.entityId,
            variableName: varDecl.name,
            direction: depInfo.direction,
            dataType: varDecl.dataType.name,
          });
        }
      }
    }

    this.context = {
      programName: this.ast.name,
      projectName: this.projectName,
      variables,
      entityBindings,
      currentPath: [],
      loopDepth: 0,
      safetyCounters: 0,
    };
  }

  // ==========================================================================
  // Timer FB Processing
  // ==========================================================================

  private processTimerFBs(): void {
    if (!this.timerTranspiler || !this.timerResolver) {
      return;
    }

    const timerVars = new Map<string, TimerInstance["type"]>();
    for (const varDecl of this.ast.variables) {
      const typeName = varDecl.dataType.name.toUpperCase();
      if (typeName === "TON" || typeName === "TOF" || typeName === "TP") {
        timerVars.set(varDecl.name, typeName as TimerInstance["type"]);
      }
    }

    if (timerVars.size === 0) {
      return;
    }

    walkAST(this.ast, {
      onFunctionCall: (call) => {
        const timerType = timerVars.get(call.name);
        if (!timerType) {
          return;
        }

        const instance: TimerInstance = {
          name: call.name,
          type: timerType,
          programName: this.ast.name,
          projectName: this.projectName,
        };

        const parsed = this.timerTranspiler!.parseTimerCall(call.name, call);
        const inputs: TimerInputs = {
          IN: parsed.inputs.IN ?? "true",
          PT: parsed.inputs.PT ?? "0",
        };

        const result = this.timerTranspiler!.transpileTimer(instance, inputs);

        this.timerHelpers.push(...result.helpers);
        this.additionalAutomations.push(result.finishedAutomation);
        this.timerMainActions.push(...result.mainActions);
        this.timerResolver!.registerTimer(instance.name, result.outputMappings);
      },
    });
  }

  // ==========================================================================
  // Automation Generation
  // ==========================================================================

  private generateAutomation(): HAAutomation {
    const pragmas = parsePragmas(this.ast.pragmas);
    const throttle = pragmas.find(p => p.name === 'throttle')?.value as string | undefined;
    const debounce = pragmas.find(p => p.name === 'debounce')?.value as string | undefined;

    const automation: HAAutomation = {
      id: `st_${this.projectName}_${this.ast.name}`.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      alias: `[ST] ${this.ast.name}`,
      description: `Generated from ST program: ${this.ast.name}`,
      mode: 'single', // Automation is just dispatcher
      trigger: this.depAnalysis.triggers.map(t => this.mapTriggerConfig(t)),
      action: [],
    };

    // Add throttle condition if specified
    if (throttle) {
      const throttleHelper = `input_datetime.st_${this.projectName}_${this.ast.name}_last_run`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const throttleSeconds = this.parseTimeToSeconds(throttle);

      automation.condition = [{
        condition: 'template',
        value_template: this.generateThrottleCondition(throttleHelper, throttleSeconds),
      }];

      // Add action to update last run time
      automation.action.push({
        service: 'input_datetime.set_datetime',
        target: { entity_id: throttleHelper },
        data: { datetime: '{{ now().isoformat() }}' },
      });
    }

    // Add debounce delay if specified
    if (debounce) {
      automation.mode = 'restart'; // Restart = debounce effect
      const debounceSeconds = this.parseTimeToSeconds(debounce);
      automation.action.push({
        delay: { seconds: debounceSeconds },
      });
    }

    // Call the logic script
    automation.action.push({
      service: 'script.turn_on',
      target: {
        entity_id: `script.st_${this.projectName}_${this.ast.name}_logic`.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      },
    });

    return automation;
  }

  private generateThrottleCondition(helperId: string, seconds: number): string {
    return `{% set last = states('${helperId}') %}
{% if last in ['unknown', 'unavailable', 'none', ''] %}
  true
{% else %}
  {{ (now() - (last | as_datetime)).total_seconds() > ${seconds} }}
{% endif %}`;
  }

  private parseTimeToSeconds(timeLiteral: string): number {
    // Parse T#1h30m15s format
    const match = timeLiteral.match(/T#(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:(\d+)ms)?/i);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    const ms = parseInt(match[4] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds + ms / 1000;
  }

  // ==========================================================================
  // Trigger Mapping
  // ==========================================================================

  private mapTriggerConfig(t: import('../analyzer/types').TriggerConfig): HATrigger {
    switch (t.platform) {
      case 'state':
        return {
          platform: 'state',
          entity_id: t.entity_id!,
          from: t.from,
          to: t.to,
          not_from: t.not_from,
          not_to: t.not_to,
          attribute: t.attribute,
          for: t.for,
          id: t.id,
        };
      case 'numeric_state':
        return {
          platform: 'numeric_state',
          entity_id: t.entity_id!,
          above: t.above,
          below: t.below,
          attribute: t.attribute,
          for: t.for,
          id: t.id,
        };
      case 'event':
        return {
          platform: 'event',
          event_type: t.event_type!,
          event_data: t.event_data,
          id: t.id,
        };
      case 'time':
        return {
          platform: 'time',
          at: t.at!,
          id: t.id,
        };
      default:
        // Fallback to state trigger
        return {
          platform: 'state',
          entity_id: t.entity_id || '',
          id: t.id,
        };
    }
  }

  // ==========================================================================
  // Script Generation
  // ==========================================================================

  private generateScript(): HAScript {
    const pragmas = parsePragmas(this.ast.pragmas);
    const mode =
      (pragmas.find((p) => p.name === "mode")?.value as string) || "restart";

    const actionGenerator = new ActionGenerator(this.context, this.timerResolver, this.sourceMapBuilder);

    const script: HAScript = {
      alias: `[ST] ${this.ast.name} Logic`,
      description: `Logic script for ST program: ${this.ast.name}`,
      mode: mode as HAScript['mode'],
      sequence: [],
    };

    // Initialize transient variables
    const initVars = this.generateVariableInitializers();
    if (Object.keys(initVars).length > 0) {
      script.variables = initVars;
    }

    // Generate actions from body and prepend timer main actions
    // Set up source map path context for script sequence
    if (this.sourceMapBuilder) {
      this.sourceMapBuilder.pushPath('sequence');
    }
    const bodyActions = actionGenerator.generateActions(this.ast.body);
    if (this.sourceMapBuilder) {
      this.sourceMapBuilder.popPath();
    }
    script.sequence = [...this.timerMainActions, ...bodyActions];

    // Embed source map in script variables if available
    // Note: Embedded source map is stored as JSON string to match Record<string, string> type
    if (this.sourceMapBuilder) {
      const embedded = this.sourceMapBuilder.buildEmbedded();
      if (script.variables) {
        script.variables = {
          ...script.variables,
          _st_source_map: JSON.stringify(embedded._st_source_map),
          _st_source_file: embedded._st_source_file,
          _st_source_hash: embedded._st_source_hash,
        };
      } else {
        script.variables = {
          _st_source_map: JSON.stringify(embedded._st_source_map),
          _st_source_file: embedded._st_source_file,
          _st_source_hash: embedded._st_source_hash,
        };
      }
    }

    return script;
  }

  private generateVariableInitializers(): Record<string, string> {
    const vars: Record<string, string> = {};

    for (const storageInfo of this.storageAnalysis.variables) {
      // Only initialize transient variables
      if (storageInfo.storage.type !== 'TRANSIENT') {
        continue;
      }

      const varDecl = this.ast.variables.find(v => v.name === storageInfo.name);
      if (!varDecl?.initialValue) {
        continue;
      }

      if (varDecl.initialValue.type === 'Literal') {
        // Convert literal to string representation
        if (varDecl.initialValue.kind === 'string') {
          vars[storageInfo.name] = String(varDecl.initialValue.value);
        } else if (varDecl.initialValue.kind === 'boolean') {
          vars[storageInfo.name] = varDecl.initialValue.value ? 'true' : 'false';
        } else {
          vars[storageInfo.name] = String(varDecl.initialValue.value);
        }
      }
    }

    return vars;
  }
}

// ============================================================================
// Convenience Function
// ============================================================================

/**
 * Transpile an ST program to HA automation and script
 */
export function transpile(ast: ProgramNode, projectName?: string, sourceContent?: string): TranspilerResult {
  const transpiler = new Transpiler(ast, projectName, sourceContent);
  return transpiler.transpile();
}
