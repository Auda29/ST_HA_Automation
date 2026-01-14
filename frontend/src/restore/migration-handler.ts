/**
 * Migration Handler
 *
 * Handles schema changes between deployments with optional user interaction.
 */

import type {
  VariableSchema,
  ProgramSchema,
  MigrationIssue,
  MigrationOption,
  MigrationPlan,
  MigrationResolution,
  MigrationResult,
  StoredSchemas,
} from "./migration-types";

// ============================================================================
// Schema Storage
// ============================================================================

const SCHEMA_STORAGE_KEY = "st_hass_schemas";

export class SchemaStorage {
  save(programId: string, schema: ProgramSchema): void {
    const stored = this.loadAll();
    stored[programId] = schema;
    // localStorage is available in HA panel (browser) context
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(stored));
  }

  load(programId: string): ProgramSchema | null {
    const stored = this.loadAll();
    return stored[programId] || null;
  }

  loadAll(): StoredSchemas {
    const raw = localStorage.getItem(SCHEMA_STORAGE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as StoredSchemas;
    } catch {
      return {};
    }
  }

  delete(programId: string): void {
    const stored = this.loadAll();
    delete stored[programId];
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(stored));
  }

  clear(): void {
    localStorage.removeItem(SCHEMA_STORAGE_KEY);
  }
}

// ============================================================================
// Migration Detector
// ============================================================================

export class MigrationDetector {
  /**
   * Detect migration issues between old and new schema
   */
  detectIssues(
    oldSchema: ProgramSchema | null,
    newSchema: ProgramSchema,
  ): MigrationPlan {
    const issues: MigrationIssue[] = [];

    if (!oldSchema) {
      // First deployment, no migration needed
      return {
        issues: [],
        hasDestructiveChanges: false,
        requiresUserInput: false,
      };
    }

    const oldVars = new Map(oldSchema.variables.map((v) => [v.name, v]));
    const newVars = new Map(newSchema.variables.map((v) => [v.name, v]));

    // Check for removed variables
    for (const [name, oldVar] of oldVars) {
      if (!newVars.has(name)) {
        issues.push(this.createRemovedIssue(oldVar));
      }
    }

    // Check for added and changed variables
    for (const [name, newVar] of newVars) {
      const oldVar = oldVars.get(name);

      if (!oldVar) {
        issues.push(this.createAddedIssue(newVar));
      } else {
        // Check for changes
        const changeIssues = this.detectChanges(oldVar, newVar);
        issues.push(...changeIssues);
      }
    }

    return {
      issues,
      hasDestructiveChanges: issues.some((i) =>
        i.options.some((o) => o.isDestructive),
      ),
      requiresUserInput: issues.some(
        (i) => i.type === "removed" || i.type === "type_changed",
      ),
    };
  }

  private createRemovedIssue(oldVar: VariableSchema): MigrationIssue {
    return {
      type: "removed",
      variable: oldVar.name,
      helperId: oldVar.helperId,
      details: `Variable '${oldVar.name}' wurde aus dem Code entfernt`,
      oldSchema: oldVar,
      options: [
        {
          id: "delete",
          label: "Helper löschen",
          description: "Entfernt den Helper und seinen Wert",
          isDestructive: true,
        },
        {
          id: "keep",
          label: "Helper behalten (orphaned)",
          description: "Behält den Helper, wird aber nicht mehr verwendet",
        },
      ],
      defaultOption: "delete",
    };
  }

  private createAddedIssue(newVar: VariableSchema): MigrationIssue {
    return {
      type: "added",
      variable: newVar.name,
      helperId: newVar.helperId,
      details: `Neue Variable '${newVar.name}' hinzugefügt`,
      newSchema: newVar,
      options: [
        {
          id: "create",
          label: "Helper erstellen",
          description: `Erstellt neuen Helper mit Initialwert ${JSON.stringify(
            newVar.initialValue,
          )}`,
        },
      ],
      defaultOption: "create",
    };
  }

  private detectChanges(
    oldVar: VariableSchema,
    newVar: VariableSchema,
  ): MigrationIssue[] {
    const issues: MigrationIssue[] = [];

    // Type change
    if (oldVar.dataType !== newVar.dataType) {
      issues.push({
        type: "type_changed",
        variable: oldVar.name,
        helperId: oldVar.helperId,
        details: `Typ geändert: ${oldVar.dataType} → ${newVar.dataType}`,
        oldSchema: oldVar,
        newSchema: newVar,
        options: this.getTypeChangeOptions(oldVar, newVar),
        defaultOption: "convert",
      });
    }

    // Range change (for numbers)
    if (
      oldVar.helperType === "input_number" &&
      newVar.helperType === "input_number"
    ) {
      if (oldVar.min !== newVar.min || oldVar.max !== newVar.max) {
        issues.push({
          type: "range_changed",
          variable: oldVar.name,
          helperId: oldVar.helperId,
          details: `Bereich geändert: [${oldVar.min}, ${oldVar.max}] → [${newVar.min}, ${newVar.max}]`,
          oldSchema: oldVar,
          newSchema: newVar,
          options: [
            {
              id: "update_range",
              label: "Bereich aktualisieren",
              description:
                "Aktualisiert min/max, Wert wird ggf. begrenzt",
            },
            {
              id: "reset",
              label: "Auf Initialwert zurücksetzen",
              description: `Setzt auf ${newVar.initialValue}`,
            },
          ],
          defaultOption: "update_range",
        });
      }
    }

    return issues;
  }

  private getTypeChangeOptions(
    oldVar: VariableSchema,
    newVar: VariableSchema,
  ): MigrationOption[] {
    const options: MigrationOption[] = [];

    // Check if conversion is possible
    if (this.canConvert(oldVar.dataType, newVar.dataType)) {
      options.push({
        id: "convert",
        label: "Wert konvertieren",
        description: `Konvertiert ${oldVar.dataType} zu ${newVar.dataType}`,
      });
    }

    options.push({
      id: "reset",
      label: "Auf Initialwert zurücksetzen",
      description: `Setzt auf ${JSON.stringify(newVar.initialValue)}`,
      isDestructive: true,
    });

    options.push({
      id: "keep_helper",
      label: "Alten Helper behalten, neuen erstellen",
      description: "Erstellt neuen Helper, alter wird orphaned",
    });

    return options;
  }

  private canConvert(fromType: string, toType: string): boolean {
    const conversions: Record<string, string[]> = {
      INT: ["DINT", "REAL", "LREAL", "STRING"],
      DINT: ["REAL", "LREAL", "STRING"],
      REAL: ["LREAL", "STRING"],
      LREAL: ["STRING"],
      BOOL: ["INT", "STRING"],
    };

    return conversions[fromType]?.includes(toType) ?? false;
  }
}

// ============================================================================
// Migration Executor
// ============================================================================

export class MigrationExecutor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private haApi: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(haApi: any) {
    this.haApi = haApi;
  }

  /**
   * Execute migration with user-provided resolutions
   */
  async execute(
    plan: MigrationPlan,
    resolutions: MigrationResolution[],
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      appliedChanges: [],
      errors: [],
    };

    // Create resolution map
    const resolutionMap = new Map(
      resolutions.map((r) => [r.issueId, r.selectedOption]),
    );

    for (const issue of plan.issues) {
      const selectedOption =
        resolutionMap.get(issue.variable) ?? issue.defaultOption;

      try {
        await this.applyResolution(issue, selectedOption);
        result.appliedChanges.push(`${issue.variable}: ${selectedOption}`);
      } catch (error) {
        result.success = false;
        result.errors.push(
          `${issue.variable}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return result;
  }

  private async applyResolution(
    issue: MigrationIssue,
    option: string,
  ): Promise<void> {
    switch (issue.type) {
      case "added":
        if (option === "create") {
          await this.createHelper(issue.newSchema!);
        }
        break;

      case "removed":
        if (option === "delete") {
          await this.deleteHelper(issue.helperId);
        }
        // 'keep' does nothing
        break;

      case "type_changed":
        await this.handleTypeChange(issue, option);
        break;

      case "range_changed":
        await this.handleRangeChange(issue, option);
        break;

      default:
        break;
    }
  }

  private async handleTypeChange(
    issue: MigrationIssue,
    option: string,
  ): Promise<void> {
    switch (option) {
      case "convert": {
        const currentValue = await this.getHelperValue(issue.helperId);
        const convertedValue = this.convertValue(
          currentValue,
          issue.oldSchema!.dataType,
          issue.newSchema!.dataType,
        );
        await this.deleteHelper(issue.helperId);
        await this.createHelper(issue.newSchema!, convertedValue);
        break;
      }

      case "reset":
        await this.deleteHelper(issue.helperId);
        await this.createHelper(issue.newSchema!);
        break;

      case "keep_helper": {
        // Create new helper with different ID
        const newHelperId = `${issue.newSchema!.helperId}_v2`;
        await this.createHelper({
          ...issue.newSchema!,
          helperId: newHelperId,
        });
        break;
      }

      default:
        break;
    }
  }

  private async handleRangeChange(
    issue: MigrationIssue,
    option: string,
  ): Promise<void> {
    if (option === "update_range") {
      const currentValue = await this.getHelperValue(issue.helperId);
      const clampedValue = Math.max(
        issue.newSchema!.min ?? Number.MIN_SAFE_INTEGER,
        Math.min(issue.newSchema!.max ?? Number.MAX_SAFE_INTEGER, Number(currentValue)),
      );

      await this.deleteHelper(issue.helperId);
      await this.createHelper(issue.newSchema!, clampedValue);
    } else if (option === "reset") {
      await this.deleteHelper(issue.helperId);
      await this.createHelper(issue.newSchema!);
    }
  }

  private convertValue(value: unknown, _fromType: string, toType: string): unknown {
    switch (toType) {
      case "INT":
      case "DINT":
        return Math.round(Number(value));
      case "REAL":
      case "LREAL":
        return Number(value);
      case "STRING":
        return String(value);
      case "BOOL":
        return Boolean(value);
      default:
        return value;
    }
  }

  private async createHelper(schema: VariableSchema, value?: unknown): Promise<void> {
    const initialValue = value ?? schema.initialValue;

    switch (schema.helperType) {
      case "input_boolean":
        await this.haApi.createInputBoolean?.({
          name: this.extractHelperName(schema.helperId),
          initial: Boolean(initialValue),
        });
        break;

      case "input_number":
        await this.haApi.createInputNumber?.({
          name: this.extractHelperName(schema.helperId),
          initial: Number(initialValue),
          min: schema.min,
          max: schema.max,
          step: schema.step,
          mode: "box",
        });
        break;

      case "input_text":
        await this.haApi.createInputText?.({
          name: this.extractHelperName(schema.helperId),
          initial: String(initialValue),
        });
        break;

      case "input_datetime":
        await this.haApi.createInputDateTime?.({
          name: this.extractHelperName(schema.helperId),
          initial: String(initialValue),
        });
        break;

      default:
        break;
    }
  }

  private async deleteHelper(helperId: string): Promise<void> {
    await this.haApi.deleteHelper?.(helperId);
  }

  private async getHelperValue(helperId: string): Promise<unknown> {
    return this.haApi.getState
      ? this.haApi.getState(helperId)
      : this.haApi.getHelperValue?.(helperId);
  }

  private extractHelperName(helperId: string): string {
    // input_number.st_prog_var → ST Prog Var
    const parts = helperId.split(".");
    if (parts.length > 1) {
      return parts[1]
        .replace(/^st_/, "ST ")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
    }
    return helperId;
  }
}

