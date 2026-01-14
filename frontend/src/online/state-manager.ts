/**
 * Entity State Manager for Online Mode
 *
 * Manages WebSocket subscriptions and entity state updates.
 */

import type {
  EntityState,
  VariableBinding,
  LiveValue,
  ParsedValue,
  OnlineModeState,
  OnlineStatus,
} from "./types";

// ============================================================================
// State Manager
// ============================================================================

export class OnlineStateManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly connection: any; // HomeAssistant WebSocket connection
  private readonly bindings: Map<string, VariableBinding> = new Map();
  private readonly entityStates: Map<string, EntityState> = new Map();
  private readonly liveValues: Map<string, LiveValue> = new Map();
  private readonly subscribers: Set<(state: OnlineModeState) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  private status: OnlineStatus = "disconnected";
  private updateRate: number = 100;
  private showConditions: boolean = true;
  private highlightChanges: boolean = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(connection: any) {
    this.connection = connection;
  }

  /**
   * Start online mode with given variable bindings
   */
  async start(bindings: VariableBinding[]): Promise<void> {
    this.status = "connecting";
    this.notifySubscribers();

    // Store bindings
    this.bindings.clear();
    for (const binding of bindings) {
      this.bindings.set(binding.variableName, binding);
    }

    try {
      // Subscribe to entity state changes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.unsubscribe = await this.connection.subscribeEntities(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (entities: Record<string, EntityState>) => {
          this.handleEntityUpdate(entities);
        },
      );

      this.status = "online";
      this.notifySubscribers();
    } catch (error) {
      this.status = "error";
      this.notifySubscribers();
      throw error;
    }
  }

  /**
   * Stop online mode
   */
  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.status = "disconnected";
    this.liveValues.clear();
    this.notifySubscribers();
  }

  /**
   * Pause/resume updates
   */
  setPaused(paused: boolean): void {
    this.status = paused ? "paused" : "online";
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: OnlineModeState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Get current state
   */
  getState(): OnlineModeState {
    return {
      status: this.status,
      bindings: Array.from(this.bindings.values()),
      liveValues: this.liveValues,
      updateRate: this.updateRate,
      showConditions: this.showConditions,
      highlightChanges: this.highlightChanges,
    };
  }

  /**
   * Get live value for a variable
   */
  getLiveValue(variableName: string): LiveValue | null {
    return this.liveValues.get(variableName) || null;
  }

  // ==========================================================================
  // Internal Methods
  // ==========================================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleEntityUpdate(entities: Record<string, EntityState>): void {
    if (this.status === "paused") return;

    const now = Date.now();

    // Update entity states
    for (const [entityId, state] of Object.entries(entities)) {
      this.entityStates.set(entityId, state);
    }

    // Update live values for bound variables
    for (const [varName, binding] of this.bindings) {
      const entityState = this.entityStates.get(binding.entityId);
      if (!entityState) continue;

      const currentValue = this.parseValue(entityState.state, binding.dataType);
      const existingLive = this.liveValues.get(varName);

      const liveValue: LiveValue = {
        binding,
        currentValue,
        previousValue: existingLive?.currentValue,
        hasChanged: existingLive
          ? existingLive.currentValue.raw !== currentValue.raw
          : false,
        lastUpdate: now,
      };

      this.liveValues.set(varName, liveValue);
    }

    this.notifySubscribers();
  }

  private parseValue(raw: string, expectedType: string): ParsedValue {
    const invalid = ["unavailable", "unknown", "none", ""];

    if (invalid.includes(raw.toLowerCase())) {
      return {
        raw,
        formatted: "—",
        isValid: false,
        dataType: "UNKNOWN",
      };
    }

    switch (expectedType.toUpperCase()) {
      case "BOOL": {
        const boolValue = ["on", "true", "1"].includes(raw.toLowerCase());
        return {
          raw,
          formatted: boolValue ? "TRUE" : "FALSE",
          isValid: true,
          dataType: "BOOL",
        };
      }

      case "INT":
      case "DINT": {
        const intValue = Number.parseInt(raw, 10);
        return {
          raw,
          formatted: Number.isNaN(intValue) ? "—" : String(intValue),
          isValid: !Number.isNaN(intValue),
          dataType: "INT",
        };
      }

      case "REAL":
      case "LREAL": {
        const floatValue = Number.parseFloat(raw);
        return {
          raw,
          formatted: Number.isNaN(floatValue) ? "—" : floatValue.toFixed(2),
          isValid: !Number.isNaN(floatValue),
          dataType: "REAL",
        };
      }

      case "STRING":
        return {
          raw,
          formatted: raw.length > 20 ? raw.substring(0, 17) + "..." : raw,
          isValid: true,
          dataType: "STRING",
        };

      case "TIME":
        return {
          raw,
          formatted: raw,
          isValid: true,
          dataType: "TIME",
        };

      default:
        return {
          raw,
          formatted: raw,
          isValid: true,
          dataType: "UNKNOWN",
        };
    }
  }

  private notifySubscribers(): void {
    const state = this.getState();
    for (const callback of this.subscribers) {
      callback(state);
    }
  }
}

// ============================================================================
// Value Formatter
// ============================================================================

export class ValueFormatter {
  /**
   * Format value for display with appropriate styling
   */
  static format(value: ParsedValue): { text: string; className: string } {
    if (!value.isValid) {
      return { text: value.formatted, className: "st-live-value--invalid" };
    }

    switch (value.dataType) {
      case "BOOL":
        return {
          text: value.formatted,
          className:
            value.formatted === "TRUE"
              ? "st-live-value--bool-true"
              : "st-live-value--bool-false",
        };

      case "INT":
        return { text: value.formatted, className: "st-live-value--int" };

      case "REAL":
        return { text: value.formatted, className: "st-live-value--real" };

      case "STRING":
        return {
          text: `"${value.formatted}"`,
          className: "st-live-value--string",
        };

      default:
        return { text: value.formatted, className: "st-live-value--unknown" };
    }
  }

  /**
   * Format with change highlight
   */
  static formatWithChange(live: LiveValue): { text: string; className: string } {
    const base = this.format(live.currentValue);

    if (live.hasChanged) {
      base.className += " st-live-value--changed";
    }

    return base;
  }
}
