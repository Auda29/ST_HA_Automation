/**
 * Deploy Manager - Transactional deployment with rollback
 */

import type { TranspilerResult } from '../transpiler/types';
import type { HelperConfig } from '../analyzer/types';
import type {
  DeployTransaction,
  DeployOperation,
  DeployResult,
  DeployError,
} from './types';
import { HAApiClient } from './ha-api';
import { HelperManager } from './helper-manager';
import { BackupManager } from './backup-manager';
import {
  SchemaStorage,
  MigrationDetector,
} from '../restore/migration-handler';
import type { ProgramSchema, VariableSchema, MigrationPlan } from '../restore/migration-types';

export class DeployManager {
  private readonly api: HAApiClient;
  private readonly helperManager: HelperManager;
  private readonly backupManager: BackupManager;
  private readonly schemaStorage: SchemaStorage;
  private readonly migrationDetector: MigrationDetector;

  constructor(api: HAApiClient) {
    this.api = api;
    this.helperManager = new HelperManager(api);
    this.backupManager = new BackupManager(api);
    this.schemaStorage = new SchemaStorage();
    this.migrationDetector = new MigrationDetector();
  }

  async deploy(
    result: TranspilerResult,
    options: {
      createBackup?: boolean;
      dryRun?: boolean;
    } = {},
  ): Promise<DeployResult> {
    const transaction = this.createTransaction(result);

    try {
      await this.validateDeployment(result);

      if (options.createBackup) {
        await this.backupManager.createBackup(result.automation.id, result.automation.alias);
      }

      const operations = await this.calculateOperations(result);
      transaction.operations = operations;

      if (options.dryRun) {
        return {
          success: true,
          transactionId: transaction.id,
          operations,
          errors: [],
        };
      }

      transaction.status = 'in_progress';

      for (const op of operations) {
        try {
          await this.applyOperation(op);
          op.status = 'applied';
        } catch (error) {
          op.status = 'failed';
          op.error = error instanceof Error ? error.message : String(error);

          await this.rollback(transaction);

          return {
            success: false,
            transactionId: transaction.id,
            operations,
            errors: [
              {
                operation: op,
                message: op.error ?? 'Unknown deploy error',
                code: 'DEPLOY_FAILED',
              },
            ],
          };
        }
      }

      await this.reloadAll();

      const verified = await this.verifyDeployment(result);
      if (!verified) {
        await this.rollback(transaction);

        return {
          success: false,
          transactionId: transaction.id,
          operations,
          errors: [
            {
              message: 'Deployment verification failed',
              code: 'VERIFY_FAILED',
            },
          ],
        };
      }

      transaction.status = 'committed';

      return {
        success: true,
        transactionId: transaction.id,
        operations,
        errors: [],
      };
    } catch (error) {
      transaction.status = 'failed';

      const deployError: DeployError = {
        message: error instanceof Error ? error.message : String(error),
        code: 'DEPLOY_ERROR',
      };

      return {
        success: false,
        transactionId: transaction.id,
        operations: transaction.operations,
        errors: [deployError],
      };
    }
  }

  async rollback(transaction: DeployTransaction): Promise<void> {
    const appliedOps = transaction.operations.filter((op) => op.status === 'applied').reverse();

    for (const op of appliedOps) {
      try {
        await this.revertOperation(op);
        op.status = 'reverted';
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to revert operation ${op.id}:`, error);
      }
    }

    transaction.status = 'rolled_back';
  }

  private createTransaction(result: TranspilerResult): DeployTransaction {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      projectName: 'default',
      programName: result.automation.alias.replace('[ST] ', ''),
      operations: [],
      status: 'pending',
    };
  }

  private async validateDeployment(result: TranspilerResult): Promise<void> {
    const errors = result.diagnostics.filter((d) => d.severity === 'Error');
    if (errors.length > 0) {
      throw new Error(`Transpilation errors: ${errors.map((e) => e.message).join(', ')}`);
    }

    if (result.automation.trigger.length === 0) {
      throw new Error('Automation has no triggers - it will never execute');
    }
  }

  private async calculateOperations(result: TranspilerResult): Promise<DeployOperation[]> {
    const operations: DeployOperation[] = [];

    const existingAutomation = await this.api.getAutomation(result.automation.id);
    operations.push({
      id: this.generateId(),
      type: existingAutomation ? 'update' : 'create',
      entityType: 'automation',
      entityId: result.automation.id,
      previousState: existingAutomation ?? undefined,
      newState: result.automation,
      status: 'pending',
    });

    const scriptId = `st_${result.automation.id}_logic`;
    const existingScript = await this.api.getScript(scriptId);
    operations.push({
      id: this.generateId(),
      type: existingScript ? 'update' : 'create',
      entityType: 'script',
      entityId: scriptId,
      previousState: existingScript ?? undefined,
      newState: result.script,
      status: 'pending',
    });

    const helperSync = await this.helperManager.calculateSync(result.helpers);

    for (const helper of helperSync.toCreate) {
      operations.push({
        id: this.generateId(),
        type: 'create',
        entityType: 'helper',
        entityId: helper.id,
        newState: helper,
        status: 'pending',
      });
    }

    for (const helper of helperSync.toUpdate) {
      operations.push({
        id: this.generateId(),
        type: 'update',
        entityType: 'helper',
        entityId: helper.id,
        newState: helper,
        status: 'pending',
      });
    }

    for (const helperId of helperSync.toDelete) {
      operations.push({
        id: this.generateId(),
        type: 'delete',
        entityType: 'helper',
        entityId: helperId,
        status: 'pending',
      });
    }

    return operations;
  }

  /**
   * Build a ProgramSchema from current helper configuration.
   * This does not change deploy behaviour and can be used by UI code
   * to drive migration flows.
   */
  public buildProgramSchema(result: TranspilerResult): ProgramSchema {
    const programName = result.automation.alias.replace('[ST] ', '');
    const projectName = 'default';

    const variables: VariableSchema[] = result.helpers.map((helper) => ({
      name: helper.id,
      dataType: helper.type,
      helperId: helper.id,
      helperType: helper.type === 'counter' ? 'input_number' : (helper.type as VariableSchema['helperType']),
      initialValue: helper.initial,
      restorePolicy: 0 as never, // restore policy is assigned at analysis time; not wired here yet
      min: helper.min,
      max: helper.max,
      step: helper.step,
    }));

    return {
      programName,
      projectName,
      variables,
      version: '1.0',
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Create a migration plan based on previous and current schemas.
   * Intended to be called by higher-level UI logic before executing a deploy.
   */
  public createMigrationPlan(result: TranspilerResult): MigrationPlan {
    const schema = this.buildProgramSchema(result);
    const programId = result.automation.id;
    const previous = this.schemaStorage.load(programId);
    const plan = this.migrationDetector.detectIssues(previous, schema);
    this.schemaStorage.save(programId, schema);
    return plan;
  }

  private generateId(): string {
    return `op_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  }

  private async applyOperation(op: DeployOperation): Promise<void> {
    switch (op.entityType) {
      case 'automation':
        if (op.type === 'delete') {
          await this.api.deleteAutomation(op.entityId);
        } else {
          await this.api.saveAutomation(op.entityId, op.newState as never);
        }
        break;

      case 'script':
        if (op.type === 'delete') {
          await this.api.deleteScript(op.entityId);
        } else {
          await this.api.saveScript(op.entityId, op.newState as never);
        }
        break;

      case 'helper':
        if (op.type === 'delete') {
          await this.api.deleteHelper(op.entityId);
        } else {
          await this.helperManager.createHelper(op.newState as HelperConfig);
        }
        break;

      default:
        break;
    }
  }

  private async revertOperation(op: DeployOperation): Promise<void> {
    switch (op.type) {
      case 'create':
        if (op.entityType === 'automation') {
          await this.api.deleteAutomation(op.entityId);
        } else if (op.entityType === 'script') {
          await this.api.deleteScript(op.entityId);
        } else if (op.entityType === 'helper') {
          await this.api.deleteHelper(op.entityId);
        }
        break;

      case 'update':
        if (!op.previousState) return;
        if (op.entityType === 'automation') {
          await this.api.saveAutomation(op.entityId, op.previousState as never);
        } else if (op.entityType === 'script') {
          await this.api.saveScript(op.entityId, op.previousState as never);
        } else if (op.entityType === 'helper') {
          await this.api.deleteHelper(op.entityId);
          await this.helperManager.createHelper(op.previousState as HelperConfig);
        }
        break;

      case 'delete':
        if (!op.previousState) return;
        if (op.entityType === 'automation') {
          await this.api.saveAutomation(op.entityId, op.previousState as never);
        } else if (op.entityType === 'script') {
          await this.api.saveScript(op.entityId, op.previousState as never);
        } else if (op.entityType === 'helper') {
          await this.helperManager.createHelper(op.previousState as HelperConfig);
        }
        break;

      default:
        break;
    }
  }

  private async reloadAll(): Promise<void> {
    await this.api.reloadAutomations();
    await this.api.reloadScripts();
  }

  private async verifyDeployment(result: TranspilerResult): Promise<boolean> {
    const automation = await this.api.getAutomation(result.automation.id);
    if (!automation) return false;

    const scriptId = `st_${result.automation.id}_logic`;
    const script = await this.api.getScript(scriptId);
    if (!script) return false;

    const states = await this.api.getStates();
    for (const helper of result.helpers) {
      const exists = states.some((s) => s.entity_id === helper.id);
      if (!exists) return false;
    }

    return true;
  }
}

export async function deploy(
  api: HAApiClient,
  result: TranspilerResult,
  options?: { createBackup?: boolean; dryRun?: boolean },
): Promise<DeployResult> {
  const manager = new DeployManager(api);
  return manager.deploy(result, options);
}

