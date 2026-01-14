/**
 * Backup Manager - Save and restore deployment state
 */

import type { Backup } from './types';
import type { HelperConfig } from '../analyzer/types';
import { HAApiClient } from './ha-api';
import { HelperManager } from './helper-manager';

const BACKUP_STORAGE_KEY = 'st_hass_backups';
const MAX_BACKUPS = 10;

export class BackupManager {
  private readonly api: HAApiClient;
  private readonly helperManager: HelperManager;

  constructor(api: HAApiClient) {
    this.api = api;
    this.helperManager = new HelperManager(api);
  }

  async createBackup(automationId: string, programName: string): Promise<Backup> {
    const automation = await this.api.getAutomation(automationId);

    const scriptId = `st_${automationId}_logic`;
    const script = await this.api.getScript(scriptId);

    const helpers = await this.helperManager.getExistingHelpers();
    const helperConfigs: HelperConfig[] = helpers.map((h) => ({
      id: h.entityId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: h.type as any,
      name: (h.attributes.friendly_name as string) || h.entityId,
    }));

    const helperIds = helperConfigs.map((h) => h.id);
    const helperStates = await this.helperManager.getHelperStates(helperIds);

    const backup: Backup = {
      id: this.generateId(),
      timestamp: new Date(),
      projectName: 'default',
      programName,
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        automation: automation as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        script: script as any,
        helpers: helperConfigs,
        helperStates,
      },
    };

    await this.saveBackup(backup);

    return backup;
  }

  async restoreBackup(backupId: string): Promise<void> {
    const backup = await this.loadBackup(backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    if (backup.data.automation) {
      await this.api.saveAutomation(
        backup.data.automation.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        backup.data.automation as any,
      );
    }

    if (backup.data.script && backup.data.automation) {
      const scriptId = `st_${backup.data.automation.id}_logic`;
      await this.api.saveScript(
        scriptId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        backup.data.script as any,
      );
    }

    for (const helper of backup.data.helpers) {
      try {
        await this.helperManager.createHelper(helper);
      } catch {
        // Helper might already exist
      }
    }

    await this.helperManager.restoreHelperStates(backup.data.helperStates);

    await this.api.reloadAutomations();
    await this.api.reloadScripts();
  }

  async listBackups(): Promise<Backup[]> {
    const stored = window.localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!stored) return [];

    try {
      const backups = JSON.parse(stored) as Backup[];
      return backups.map((b) => ({
        ...b,
        timestamp: new Date(b.timestamp),
      }));
    } catch {
      return [];
    }
  }

  async loadBackup(backupId: string): Promise<Backup | null> {
    const backups = await this.listBackups();
    return backups.find((b) => b.id === backupId) || null;
  }

  async deleteBackup(backupId: string): Promise<void> {
    const backups = await this.listBackups();
    const filtered = backups.filter((b) => b.id !== backupId);
    window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(filtered));
  }

  private async saveBackup(backup: Backup): Promise<void> {
    const backups = await this.listBackups();

    backups.unshift(backup);

    const trimmed = backups.slice(0, MAX_BACKUPS);

    window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(trimmed));
  }

  async cleanupOldBackups(keepCount: number = MAX_BACKUPS): Promise<number> {
    const backups = await this.listBackups();

    if (backups.length <= keepCount) return 0;

    const toDelete = backups.slice(keepCount);
    const remaining = backups.slice(0, keepCount);

    window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(remaining));

    return toDelete.length;
  }

  private generateId(): string {
    return `backup_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  }
}

