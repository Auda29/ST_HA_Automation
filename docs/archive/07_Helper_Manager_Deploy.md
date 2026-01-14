# Task: Helper Manager & Deploy System

## Kontext

Du implementierst den Helper Manager und das Deploy-System für das "ST for Home Assistant" Projekt. Diese Komponenten sind verantwortlich für:

1. **Helper Manager**: Synchronisation von HA Helpers mit dem transpilierten Code
2. **Deploy Manager**: Transaktionales Deployment mit Rollback-Support

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`
**Voraussetzung:** Transpiler ist implementiert (Phase 3 abgeschlossen)

## ⚠️ KRITISCH: NUR über HA-APIs!

**NIEMALS** direkt YAML-Dateien editieren (`automations.yaml`, `scripts.yaml`).

```python
# ❌ FALSCH - Niemals!
with open('/config/automations.yaml', 'w') as f:
    yaml.dump(automation, f)
```

**Stattdessen:**
```typescript
// ✅ RICHTIG - HA WebSocket API
await hass.callWS({
  type: 'config/automation/config',
  automation_id: 'st_kitchen',
  config: { ... }
});
```

---

## Zu erstellende Dateien

```
frontend/src/deploy/
├── helper-manager.ts         # Helper Sync mit HA
├── deploy-manager.ts         # Transaktionales Deploy
├── backup-manager.ts         # Backup & Restore
├── ha-api.ts                 # HA WebSocket Wrapper
├── types.ts                  # Type Definitions
├── index.ts                  # Exports
└── __tests__/
    └── deploy-manager.test.ts
```

---

## frontend/src/deploy/types.ts

```typescript
/**
 * Deploy System Type Definitions
 */

import type { HAAutomation, HAScript, HelperConfig } from '../transpiler/types';

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
  [key: string]: unknown;
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
```

---

## frontend/src/deploy/ha-api.ts

```typescript
/**
 * Home Assistant WebSocket API Wrapper
 */

import type {
  HAConnection,
  HAWSMessage,
  HAState,
  HAAutomationConfig,
  HAScriptConfig,
} from './types';
import type { HelperConfig } from '../transpiler/types';

// ============================================================================
// API Wrapper Class
// ============================================================================

export class HAApiClient {
  private connection: HAConnection;

  constructor(connection: HAConnection) {
    this.connection = connection;
  }

  // ==========================================================================
  // Automation API
  // ==========================================================================

  /**
   * Get all automations
   */
  async getAutomations(): Promise<HAAutomationConfig[]> {
    return this.connection.callWS({
      type: 'config/automation/list',
    });
  }

  /**
   * Get single automation config
   */
  async getAutomation(automationId: string): Promise<HAAutomationConfig | null> {
    try {
      return await this.connection.callWS({
        type: 'config/automation/config',
        automation_id: automationId,
      });
    } catch {
      return null;
    }
  }

  /**
   * Create or update automation
   */
  async saveAutomation(automationId: string, config: HAAutomationConfig): Promise<void> {
    await this.connection.callWS({
      type: 'config/automation/config',
      automation_id: automationId,
      config,
    });
  }

  /**
   * Delete automation
   */
  async deleteAutomation(automationId: string): Promise<void> {
    await this.connection.callWS({
      type: 'config/automation/delete',
      automation_id: automationId,
    });
  }

  /**
   * Reload automations
   */
  async reloadAutomations(): Promise<void> {
    await this.connection.callService('automation', 'reload');
  }

  // ==========================================================================
  // Script API
  // ==========================================================================

  /**
   * Get all scripts
   */
  async getScripts(): Promise<Record<string, HAScriptConfig>> {
    return this.connection.callWS({
      type: 'config/script/list',
    });
  }

  /**
   * Get single script config
   */
  async getScript(scriptId: string): Promise<HAScriptConfig | null> {
    try {
      return await this.connection.callWS({
        type: 'config/script/config',
        script_id: scriptId,
      });
    } catch {
      return null;
    }
  }

  /**
   * Create or update script
   */
  async saveScript(scriptId: string, config: HAScriptConfig): Promise<void> {
    await this.connection.callWS({
      type: 'config/script/config',
      script_id: scriptId,
      config,
    });
  }

  /**
   * Delete script
   */
  async deleteScript(scriptId: string): Promise<void> {
    await this.connection.callWS({
      type: 'config/script/delete',
      script_id: scriptId,
    });
  }

  /**
   * Reload scripts
   */
  async reloadScripts(): Promise<void> {
    await this.connection.callService('script', 'reload');
  }

  // ==========================================================================
  // Helper API
  // ==========================================================================

  /**
   * Get all states (to find helpers)
   */
  async getStates(): Promise<HAState[]> {
    return this.connection.getStates();
  }

  /**
   * Get helpers by prefix
   */
  async getSTHelpers(prefix: string = 'st_'): Promise<HAState[]> {
    const states = await this.getStates();
    return states.filter(s => {
      const name = s.entity_id.split('.')[1];
      return name?.startsWith(prefix);
    });
  }

  /**
   * Create input_boolean helper
   */
  async createInputBoolean(config: {
    name: string;
    initial?: boolean;
    icon?: string;
  }): Promise<void> {
    await this.connection.callWS({
      type: 'input_boolean/create',
      ...config,
    });
  }

  /**
   * Create input_number helper
   */
  async createInputNumber(config: {
    name: string;
    min: number;
    max: number;
    step?: number;
    initial?: number;
    mode?: 'box' | 'slider';
    unit_of_measurement?: string;
    icon?: string;
  }): Promise<void> {
    await this.connection.callWS({
      type: 'input_number/create',
      ...config,
    });
  }

  /**
   * Create input_text helper
   */
  async createInputText(config: {
    name: string;
    initial?: string;
    min?: number;
    max?: number;
    pattern?: string;
    mode?: 'text' | 'password';
    icon?: string;
  }): Promise<void> {
    await this.connection.callWS({
      type: 'input_text/create',
      ...config,
    });
  }

  /**
   * Create input_datetime helper
   */
  async createInputDatetime(config: {
    name: string;
    has_date?: boolean;
    has_time?: boolean;
    initial?: string;
    icon?: string;
  }): Promise<void> {
    await this.connection.callWS({
      type: 'input_datetime/create',
      ...config,
    });
  }

  /**
   * Delete helper by entity ID
   */
  async deleteHelper(entityId: string): Promise<void> {
    const [domain, name] = entityId.split('.');
    await this.connection.callWS({
      type: `${domain}/delete`,
      [`${domain}_id`]: name,
    });
  }

  /**
   * Set helper value
   */
  async setHelperValue(entityId: string, value: unknown): Promise<void> {
    const [domain] = entityId.split('.');

    switch (domain) {
      case 'input_boolean':
        await this.connection.callService(
          'input_boolean',
          value ? 'turn_on' : 'turn_off',
          { entity_id: entityId }
        );
        break;

      case 'input_number':
        await this.connection.callService('input_number', 'set_value', {
          entity_id: entityId,
          value: value as number,
        });
        break;

      case 'input_text':
        await this.connection.callService('input_text', 'set_value', {
          entity_id: entityId,
          value: value as string,
        });
        break;

      case 'input_datetime':
        await this.connection.callService('input_datetime', 'set_datetime', {
          entity_id: entityId,
          datetime: value as string,
        });
        break;

      case 'counter':
        await this.connection.callService('counter', 'set_value', {
          entity_id: entityId,
          value: value as number,
        });
        break;
    }
  }
}
```

---

## Helper ID Naming Convention

The helper ID format used throughout the system is:

```
<helperType>.st_<project>_<program>_<variable>
```

Where:
- `<helperType>` is the HA helper type (e.g., `input_number`, `input_boolean`, `input_text`)
- All components are sanitized: converted to lowercase with non-alphanumeric characters replaced by underscores

**Examples:**
- `input_number.st_home_kitchen_light_counter`
- `input_boolean.st_default_test_flag`
- `input_text.st_myproject_program_message`

**Implementation:**
The `generateHelperId()` function in `frontend/src/analyzer/helper-mapping.ts` implements this convention and should be used consistently across the codebase.

**Note on Function Block Instances:**
Timer FBs (TON, TOF, TP) generate their own helper entities with a slightly different pattern:
- Timer entity: `timer.st_<project>_<program>_<instance>`
- Q output helper: `input_boolean.st_<project>_<program>_<instance>_q`
- ET output helper (if used): `input_number.st_<project>_<program>_<instance>_et`

These are generated by the Timer Transpiler, not the Storage Analyzer.

---

## frontend/src/deploy/helper-manager.ts

```typescript
/**
 * Helper Manager - Sync ST helpers with Home Assistant
 */

import type { HelperConfig } from '../transpiler/types';
import type { HelperSyncResult, ExistingHelper, HAState } from './types';
import { HAApiClient } from './ha-api';

export class HelperManager {
  private api: HAApiClient;
  private projectPrefix: string;

  constructor(api: HAApiClient, projectPrefix: string = 'st_') {
    this.api = api;
    this.projectPrefix = projectPrefix;
  }

  /**
   * Calculate sync operations needed
   */
  async calculateSync(required: HelperConfig[]): Promise<HelperSyncResult> {
    const existing = await this.getExistingHelpers();
    const existingIds = new Set(existing.map(h => h.entityId));
    const requiredIds = new Set(required.map(h => h.id));

    const result: HelperSyncResult = {
      toCreate: [],
      toUpdate: [],
      toDelete: [],
      unchanged: [],
    };

    // Find helpers to create
    for (const helper of required) {
      if (!existingIds.has(helper.id)) {
        result.toCreate.push(helper);
      } else {
        // Check if update needed
        const existingHelper = existing.find(h => h.entityId === helper.id);
        if (existingHelper && this.needsUpdate(helper, existingHelper)) {
          result.toUpdate.push(helper);
        } else {
          result.unchanged.push(helper.id);
        }
      }
    }

    // Find helpers to delete (ST helpers not in required list)
    for (const helper of existing) {
      if (!requiredIds.has(helper.entityId)) {
        result.toDelete.push(helper.entityId);
      }
    }

    return result;
  }

  /**
   * Get existing ST helpers from HA
   */
  async getExistingHelpers(): Promise<ExistingHelper[]> {
    const states = await this.api.getSTHelpers(this.projectPrefix);
    
    return states.map(s => ({
      entityId: s.entity_id,
      type: s.entity_id.split('.')[0],
      state: s.state,
      attributes: s.attributes,
    }));
  }

  /**
   * Check if helper needs update
   */
  private needsUpdate(required: HelperConfig, existing: ExistingHelper): boolean {
    // Check type mismatch
    if (required.type !== existing.type) {
      return true;
    }

    // Check attributes for input_number
    if (required.type === 'input_number') {
      const attrs = existing.attributes;
      if (required.min !== attrs.min || required.max !== attrs.max) {
        return true;
      }
    }

    return false;
  }

  /**
   * Apply sync operations
   */
  async applySync(
    syncResult: HelperSyncResult,
    options: { skipDeletes?: boolean } = {}
  ): Promise<void> {
    // Create new helpers
    for (const helper of syncResult.toCreate) {
      await this.createHelper(helper);
    }

    // Update existing helpers (delete + recreate)
    for (const helper of syncResult.toUpdate) {
      await this.api.deleteHelper(helper.id);
      await this.createHelper(helper);
    }

    // Delete orphaned helpers
    if (!options.skipDeletes) {
      for (const entityId of syncResult.toDelete) {
        await this.api.deleteHelper(entityId);
      }
    }
  }

  /**
   * Create a helper based on config
   */
  async createHelper(config: HelperConfig): Promise<void> {
    const name = config.name || this.extractName(config.id);

    switch (config.type) {
      case 'input_boolean':
        await this.api.createInputBoolean({
          name,
          initial: config.initial as boolean,
        });
        break;

      case 'input_number':
        await this.api.createInputNumber({
          name,
          min: config.min ?? 0,
          max: config.max ?? 1000000,
          step: config.step ?? 1,
          initial: config.initial as number ?? 0,
          mode: 'box',
        });
        break;

      case 'input_text':
        await this.api.createInputText({
          name,
          initial: config.initial as string ?? '',
        });
        break;

      case 'input_datetime':
        await this.api.createInputDatetime({
          name,
          has_date: true,
          has_time: true,
          initial: config.initial as string,
        });
        break;

      default:
        throw new Error(`Unknown helper type: ${config.type}`);
    }
  }

  /**
   * Extract human-readable name from entity ID
   */
  private extractName(entityId: string): string {
    const parts = entityId.split('.');
    if (parts.length !== 2) return entityId;
    
    // Convert st_project_program_variable to "ST Project Program Variable"
    return parts[1]
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get helper states for backup
   */
  async getHelperStates(helperIds: string[]): Promise<Record<string, unknown>> {
    const states = await this.api.getStates();
    const result: Record<string, unknown> = {};

    for (const id of helperIds) {
      const state = states.find(s => s.entity_id === id);
      if (state) {
        result[id] = this.parseHelperValue(state);
      }
    }

    return result;
  }

  /**
   * Parse helper state to typed value
   */
  private parseHelperValue(state: HAState): unknown {
    const domain = state.entity_id.split('.')[0];

    switch (domain) {
      case 'input_boolean':
        return state.state === 'on';

      case 'input_number':
      case 'counter':
        return parseFloat(state.state) || 0;

      case 'input_text':
        return state.state;

      case 'input_datetime':
        return state.state;

      default:
        return state.state;
    }
  }

  /**
   * Restore helper states from backup
   */
  async restoreHelperStates(states: Record<string, unknown>): Promise<void> {
    for (const [entityId, value] of Object.entries(states)) {
      try {
        await this.api.setHelperValue(entityId, value);
      } catch (error) {
        console.warn(`Failed to restore ${entityId}:`, error);
      }
    }
  }
}
```

---

## frontend/src/deploy/deploy-manager.ts

```typescript
/**
 * Deploy Manager - Transactional deployment with rollback
 */

import type { TranspilerResult, HAAutomation, HAScript, HelperConfig } from '../transpiler/types';
import type {
  DeployTransaction,
  DeployOperation,
  DeployResult,
  DeployError,
  Backup,
} from './types';
import { HAApiClient } from './ha-api';
import { HelperManager } from './helper-manager';
import { BackupManager } from './backup-manager';

export class DeployManager {
  private api: HAApiClient;
  private helperManager: HelperManager;
  private backupManager: BackupManager;

  constructor(api: HAApiClient) {
    this.api = api;
    this.helperManager = new HelperManager(api);
    this.backupManager = new BackupManager(api);
  }

  /**
   * Deploy transpiler result to Home Assistant
   */
  async deploy(
    result: TranspilerResult,
    options: {
      createBackup?: boolean;
      dryRun?: boolean;
    } = {}
  ): Promise<DeployResult> {
    const transaction = this.createTransaction(result);

    try {
      // Phase 1: Validation
      await this.validateDeployment(result);

      // Phase 2: Create backup if requested
      let backup: Backup | undefined;
      if (options.createBackup) {
        backup = await this.backupManager.createBackup(
          result.automation.id,
          result.script.alias
        );
      }

      // Phase 3: Calculate operations
      const operations = await this.calculateOperations(result);
      transaction.operations = operations;

      // Dry run - return without applying
      if (options.dryRun) {
        return {
          success: true,
          transactionId: transaction.id,
          operations,
          errors: [],
        };
      }

      // Phase 4: Apply operations
      transaction.status = 'in_progress';
      
      for (const op of operations) {
        try {
          await this.applyOperation(op);
          op.status = 'applied';
        } catch (error) {
          op.status = 'failed';
          op.error = error instanceof Error ? error.message : String(error);
          
          // Rollback all applied operations
          await this.rollback(transaction);
          
          return {
            success: false,
            transactionId: transaction.id,
            operations,
            errors: [{
              operation: op,
              message: op.error,
              code: 'DEPLOY_FAILED',
            }],
          };
        }
      }

      // Phase 5: Reload
      await this.reloadAll();

      // Phase 6: Verify
      const verified = await this.verifyDeployment(result);
      if (!verified) {
        await this.rollback(transaction);
        
        return {
          success: false,
          transactionId: transaction.id,
          operations,
          errors: [{
            message: 'Deployment verification failed',
            code: 'VERIFY_FAILED',
          }],
        };
      }

      // Success
      transaction.status = 'committed';

      return {
        success: true,
        transactionId: transaction.id,
        operations,
        errors: [],
      };

    } catch (error) {
      transaction.status = 'failed';
      
      return {
        success: false,
        transactionId: transaction.id,
        operations: transaction.operations,
        errors: [{
          message: error instanceof Error ? error.message : String(error),
          code: 'DEPLOY_ERROR',
        }],
      };
    }
  }

  /**
   * Rollback a transaction
   */
  async rollback(transaction: DeployTransaction): Promise<void> {
    const appliedOps = transaction.operations
      .filter(op => op.status === 'applied')
      .reverse();

    for (const op of appliedOps) {
      try {
        await this.revertOperation(op);
        op.status = 'reverted';
      } catch (error) {
        console.error(`Failed to revert operation ${op.id}:`, error);
      }
    }

    transaction.status = 'rolled_back';
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private createTransaction(result: TranspilerResult): DeployTransaction {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      projectName: 'default',
      programName: result.automation.alias.replace('[ST] ', ''),
      operations: [],
      status: 'pending',
    };
  }

  private async validateDeployment(result: TranspilerResult): Promise<void> {
    // Check for errors in transpiler result
    const errors = result.diagnostics.filter(d => d.severity === 'Error');
    if (errors.length > 0) {
      throw new Error(`Transpilation errors: ${errors.map(e => e.message).join(', ')}`);
    }

    // Validate automation has triggers
    if (result.automation.trigger.length === 0) {
      throw new Error('Automation has no triggers - it will never execute');
    }
  }

  private async calculateOperations(result: TranspilerResult): Promise<DeployOperation[]> {
    const operations: DeployOperation[] = [];

    // Automation operation
    const existingAutomation = await this.api.getAutomation(result.automation.id);
    operations.push({
      id: crypto.randomUUID(),
      type: existingAutomation ? 'update' : 'create',
      entityType: 'automation',
      entityId: result.automation.id,
      previousState: existingAutomation,
      newState: result.automation,
      status: 'pending',
    });

    // Script operation
    const scriptId = `st_${result.automation.id}_logic`;
    const existingScript = await this.api.getScript(scriptId);
    operations.push({
      id: crypto.randomUUID(),
      type: existingScript ? 'update' : 'create',
      entityType: 'script',
      entityId: scriptId,
      previousState: existingScript,
      newState: result.script,
      status: 'pending',
    });

    // Helper operations
    const helperSync = await this.helperManager.calculateSync(result.helpers);
    
    for (const helper of helperSync.toCreate) {
      operations.push({
        id: crypto.randomUUID(),
        type: 'create',
        entityType: 'helper',
        entityId: helper.id,
        newState: helper,
        status: 'pending',
      });
    }

    for (const helper of helperSync.toUpdate) {
      operations.push({
        id: crypto.randomUUID(),
        type: 'update',
        entityType: 'helper',
        entityId: helper.id,
        newState: helper,
        status: 'pending',
      });
    }

    for (const helperId of helperSync.toDelete) {
      operations.push({
        id: crypto.randomUUID(),
        type: 'delete',
        entityType: 'helper',
        entityId: helperId,
        status: 'pending',
      });
    }

    return operations;
  }

  private async applyOperation(op: DeployOperation): Promise<void> {
    switch (op.entityType) {
      case 'automation':
        if (op.type === 'delete') {
          await this.api.deleteAutomation(op.entityId);
        } else {
          await this.api.saveAutomation(op.entityId, op.newState as any);
        }
        break;

      case 'script':
        if (op.type === 'delete') {
          await this.api.deleteScript(op.entityId);
        } else {
          await this.api.saveScript(op.entityId, op.newState as any);
        }
        break;

      case 'helper':
        if (op.type === 'delete') {
          await this.api.deleteHelper(op.entityId);
        } else {
          await this.helperManager.createHelper(op.newState as HelperConfig);
        }
        break;
    }
  }

  private async revertOperation(op: DeployOperation): Promise<void> {
    switch (op.type) {
      case 'create':
        // Revert create = delete
        if (op.entityType === 'automation') {
          await this.api.deleteAutomation(op.entityId);
        } else if (op.entityType === 'script') {
          await this.api.deleteScript(op.entityId);
        } else if (op.entityType === 'helper') {
          await this.api.deleteHelper(op.entityId);
        }
        break;

      case 'update':
        // Revert update = restore previous
        if (op.previousState) {
          if (op.entityType === 'automation') {
            await this.api.saveAutomation(op.entityId, op.previousState as any);
          } else if (op.entityType === 'script') {
            await this.api.saveScript(op.entityId, op.previousState as any);
          } else if (op.entityType === 'helper') {
            await this.api.deleteHelper(op.entityId);
            await this.helperManager.createHelper(op.previousState as HelperConfig);
          }
        }
        break;

      case 'delete':
        // Revert delete = recreate
        if (op.previousState) {
          if (op.entityType === 'automation') {
            await this.api.saveAutomation(op.entityId, op.previousState as any);
          } else if (op.entityType === 'script') {
            await this.api.saveScript(op.entityId, op.previousState as any);
          } else if (op.entityType === 'helper') {
            await this.helperManager.createHelper(op.previousState as HelperConfig);
          }
        }
        break;
    }
  }

  private async reloadAll(): Promise<void> {
    await this.api.reloadAutomations();
    await this.api.reloadScripts();
  }

  private async verifyDeployment(result: TranspilerResult): Promise<boolean> {
    // Verify automation exists
    const automation = await this.api.getAutomation(result.automation.id);
    if (!automation) return false;

    // Verify script exists
    const scriptId = `st_${result.automation.id}_logic`;
    const script = await this.api.getScript(scriptId);
    if (!script) return false;

    // Verify helpers exist
    const states = await this.api.getStates();
    for (const helper of result.helpers) {
      const exists = states.some(s => s.entity_id === helper.id);
      if (!exists) return false;
    }

    return true;
  }
}

// ============================================================================
// Convenience Function
// ============================================================================

export async function deploy(
  api: HAApiClient,
  result: TranspilerResult,
  options?: { createBackup?: boolean; dryRun?: boolean }
): Promise<DeployResult> {
  const manager = new DeployManager(api);
  return manager.deploy(result, options);
}
```

---

## frontend/src/deploy/backup-manager.ts

```typescript
/**
 * Backup Manager - Save and restore deployment state
 */

import type { Backup, BackupData } from './types';
import type { HAAutomation, HAScript, HelperConfig } from '../transpiler/types';
import { HAApiClient } from './ha-api';
import { HelperManager } from './helper-manager';

const BACKUP_STORAGE_KEY = 'st_hass_backups';
const MAX_BACKUPS = 10;

export class BackupManager {
  private api: HAApiClient;
  private helperManager: HelperManager;

  constructor(api: HAApiClient) {
    this.api = api;
    this.helperManager = new HelperManager(api);
  }

  /**
   * Create a backup of current state
   */
  async createBackup(automationId: string, scriptName: string): Promise<Backup> {
    // Get current automation
    const automation = await this.api.getAutomation(automationId);

    // Get current script
    const scriptId = automationId.replace('st_', 'st_') + '_logic';
    const script = await this.api.getScript(scriptId);

    // Get current helpers
    const helpers = await this.helperManager.getExistingHelpers();
    const helperConfigs: HelperConfig[] = helpers
      .filter(h => h.entityId.includes(automationId.replace('st_', '')))
      .map(h => ({
        id: h.entityId,
        type: h.type as any,
        name: h.attributes.friendly_name as string || h.entityId,
      }));

    // Get helper states
    const helperIds = helperConfigs.map(h => h.id);
    const helperStates = await this.helperManager.getHelperStates(helperIds);

    const backup: Backup = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      projectName: 'default',
      programName: scriptName,
      data: {
        automation: automation as any,
        script: script as any,
        helpers: helperConfigs,
        helperStates,
      },
    };

    // Save to storage
    await this.saveBackup(backup);

    return backup;
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<void> {
    const backup = await this.loadBackup(backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    // Restore automation
    if (backup.data.automation) {
      await this.api.saveAutomation(
        backup.data.automation.id,
        backup.data.automation as any
      );
    }

    // Restore script
    if (backup.data.script) {
      const scriptId = backup.data.automation?.id.replace('st_', 'st_') + '_logic';
      await this.api.saveScript(scriptId, backup.data.script as any);
    }

    // Restore helpers
    for (const helper of backup.data.helpers) {
      try {
        await this.helperManager.createHelper(helper);
      } catch {
        // Helper might already exist
      }
    }

    // Restore helper states
    await this.helperManager.restoreHelperStates(backup.data.helperStates);

    // Reload
    await this.api.reloadAutomations();
    await this.api.reloadScripts();
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<Backup[]> {
    const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!stored) return [];

    try {
      const backups = JSON.parse(stored) as Backup[];
      // Convert date strings back to Date objects
      return backups.map(b => ({
        ...b,
        timestamp: new Date(b.timestamp),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Load a specific backup
   */
  async loadBackup(backupId: string): Promise<Backup | null> {
    const backups = await this.listBackups();
    return backups.find(b => b.id === backupId) || null;
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    const backups = await this.listBackups();
    const filtered = backups.filter(b => b.id !== backupId);
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Save backup to storage
   */
  private async saveBackup(backup: Backup): Promise<void> {
    const backups = await this.listBackups();
    
    // Add new backup at beginning
    backups.unshift(backup);
    
    // Trim to max backups
    const trimmed = backups.slice(0, MAX_BACKUPS);
    
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(trimmed));
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups(keepCount: number = MAX_BACKUPS): Promise<number> {
    const backups = await this.listBackups();
    
    if (backups.length <= keepCount) return 0;
    
    const toDelete = backups.slice(keepCount);
    const remaining = backups.slice(0, keepCount);
    
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(remaining));
    
    return toDelete.length;
  }
}
```

---

## frontend/src/deploy/index.ts

```typescript
/**
 * Deploy Module Exports
 */

export * from './types';
export * from './ha-api';
export * from './helper-manager';
export * from './deploy-manager';
export * from './backup-manager';

// Convenience exports
export { HAApiClient } from './ha-api';
export { HelperManager } from './helper-manager';
export { DeployManager, deploy } from './deploy-manager';
export { BackupManager } from './backup-manager';
```

---

## Ausführungsschritte

```bash
cd "C:\##\Projects\ST_HA_Automation\frontend"

# Dateien in src/deploy/ erstellen

# Type-Check
npm run typecheck

# Build
npm run build
```

---

## Erfolgskriterien

- [ ] Helper Manager erkennt bestehende ST-Helper
- [ ] Helper-Sync berechnet create/update/delete
- [ ] Deploy Manager führt transaktionales Deployment durch
- [ ] Rollback bei Fehlern funktioniert
- [ ] Backup erstellt Snapshot des aktuellen Zustands
- [ ] Restore stellt aus Backup wieder her
- [ ] Alle API-Calls nutzen HA WebSocket (keine Datei-Manipulation!)
- [ ] Automation + Script werden erstellt
- [ ] Helper werden erstellt
- [ ] Reload wird nach Deploy aufgerufen
- [ ] Verification prüft erfolgreiche Erstellung

---

## Nicht in diesem Task

- Live-Werte im Editor
- Source Maps für Debugging
- Timer FB Implementation
- Migration bei Schema-Änderungen

---

## Integration in Panel

```typescript
// In st-panel.ts
import { parse } from '../parser';
import { transpile } from '../transpiler';
import { deploy, HAApiClient } from '../deploy';

async _handleDeploy() {
  const { ast, errors } = parse(this._code);
  if (!ast || errors.length > 0) {
    this._showErrors(errors);
    return;
  }

  const result = transpile(ast, 'home');
  if (result.diagnostics.some(d => d.severity === 'Error')) {
    this._showDiagnostics(result.diagnostics);
    return;
  }

  const api = new HAApiClient(this.hass.connection);
  const deployResult = await deploy(api, result, { createBackup: true });

  if (deployResult.success) {
    this._showSuccess('Deployed successfully!');
  } else {
    this._showErrors(deployResult.errors);
  }
}
```
