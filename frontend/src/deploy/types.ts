/**
 * Deploy System Type Definitions
 */

import type { HAAutomation, HAScript } from '../transpiler/types';
import type { HelperConfig } from '../analyzer/types';

// ============================================================================
// Deploy Operation Types
// ============================================================================

export type DeployOperationType = 'create' | 'update' | 'delete';
export type DeployEntityType = 'automation' | 'script' | 'helper';

export interface DeployOperation {
  id: string;
  type: DeployOperationType;
  entityType: DeployEntityType;
  entityId: string;
  previousState?: unknown;
  newState?: unknown;
  status: 'pending' | 'applied' | 'reverted' | 'failed';
  error?: string;
}

export interface DeployTransaction {
  id: string;
  timestamp: Date;
  projectName: string;
  programName: string;
  operations: DeployOperation[];
  status: 'pending' | 'in_progress' | 'committed' | 'rolled_back' | 'failed';
}

export interface DeployResult {
  success: boolean;
  transactionId: string;
  operations: DeployOperation[];
  errors: DeployError[];
}

export interface DeployError {
  operation?: DeployOperation;
  message: string;
  code: string;
}

// ============================================================================
// Helper Sync Types
// ============================================================================

export interface HelperSyncResult {
  toCreate: HelperConfig[];
  toUpdate: HelperConfig[];
  toDelete: string[];
  unchanged: string[];
}

export interface ExistingHelper {
  entityId: string;
  type: string;
  state: string;
  attributes: Record<string, unknown>;
}

// ============================================================================
// Backup Types
// ============================================================================

export interface Backup {
  id: string;
  timestamp: Date;
  projectName: string;
  programName: string;
  data: BackupData;
}

export interface BackupData {
  automation?: HAAutomation;
  script?: HAScript;
  helpers: HelperConfig[];
  helperStates: Record<string, unknown>;
}

// ============================================================================
// HA API Types
// ============================================================================

export interface HAConnection {
  callWS<T>(message: HAWSMessage): Promise<T>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void>;
  getStates(): Promise<HAState[]>;
}

export interface HAWSMessage {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export interface HAAutomationConfig {
  id: string;
  alias: string;
  description?: string;
  mode: string;
  trigger: unknown[];
  condition?: unknown[];
  action: unknown[];
}

export interface HAScriptConfig {
  alias: string;
  description?: string;
  mode: string;
  sequence: unknown[];
  fields?: Record<string, unknown>;
}

