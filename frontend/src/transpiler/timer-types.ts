/**
 * Timer Function Block Type Definitions
 */

import type { HAAutomation, HAAction } from "./types";
import type { HelperConfig } from "../analyzer/types";

// ============================================================================
// Timer FB Types
// ============================================================================

export type TimerFBType = "TON" | "TOF" | "TP";

export interface TimerInstance {
  name: string;
  type: TimerFBType;
  programName: string;
  projectName: string;
}

export interface TimerInputs {
  IN: string; // Jinja expression for input condition
  PT: string; // Duration in seconds (as string expression)
}

export interface TimerEntities {
  timerId: string; // timer.st_prog_timer1
  outputHelperId: string; // input_boolean.st_prog_timer1_q
  elapsedHelperId?: string; // input_number.st_prog_timer1_et (optional)
}

export interface TimerOutputMappings {
  /** Q output - is timer done? */
  Q: string;
  /** ET output - elapsed time (optional) */
  ET?: string;
}

export interface TimerTranspileResult {
  /** Entities needed for this timer */
  entities: TimerEntities;

  /** Helper configs to create */
  helpers: HelperConfig[];

  /** Actions to add to main automation/script */
  mainActions: HAAction[];

  /** Separate automation for timer.finished event */
  finishedAutomation: HAAutomation;

  /** Jinja expression mappings for timer outputs */
  outputMappings: TimerOutputMappings;
}

// ============================================================================
// Parsed FB Call
// ============================================================================

export interface ParsedTimerCall {
  instanceName: string;
  type: TimerFBType;
  inputs: {
    IN?: string;
    PT?: string;
    R?: string; // Reset for TP (not yet used)
  };
}

