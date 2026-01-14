/**
 * Helper Manager - Sync ST helpers with Home Assistant
 */

import type { HelperConfig } from '../analyzer/types';
import type { HelperSyncResult, ExistingHelper, HAState } from './types';
import { HAApiClient } from './ha-api';

export class HelperManager {
  private readonly api: HAApiClient;
  private readonly projectPrefix: string;

  constructor(api: HAApiClient, projectPrefix: string = 'st_') {
    this.api = api;
    this.projectPrefix = projectPrefix;
  }

  async calculateSync(required: HelperConfig[]): Promise<HelperSyncResult> {
    const existing = await this.getExistingHelpers();
    const existingIds = new Set(existing.map((h) => h.entityId));
    const requiredIds = new Set(required.map((h) => h.id));

    const result: HelperSyncResult = {
      toCreate: [],
      toUpdate: [],
      toDelete: [],
      unchanged: [],
    };

    for (const helper of required) {
      if (!existingIds.has(helper.id)) {
        result.toCreate.push(helper);
      } else {
        const existingHelper = existing.find((h) => h.entityId === helper.id);
        if (existingHelper && this.needsUpdate(helper, existingHelper)) {
          result.toUpdate.push(helper);
        } else {
          result.unchanged.push(helper.id);
        }
      }
    }

    for (const helper of existing) {
      if (!requiredIds.has(helper.entityId)) {
        result.toDelete.push(helper.entityId);
      }
    }

    return result;
  }

  async getExistingHelpers(): Promise<ExistingHelper[]> {
    const states = await this.api.getSTHelpers(this.projectPrefix);

    return states.map((s) => ({
      entityId: s.entity_id,
      type: s.entity_id.split('.')[0],
      state: s.state,
      attributes: s.attributes,
    }));
  }

  private needsUpdate(required: HelperConfig, existing: ExistingHelper): boolean {
    if (required.type !== existing.type) {
      return true;
    }

    if (required.type === 'input_number') {
      const attrs = existing.attributes;
      const min = attrs.min as number | undefined;
      const max = attrs.max as number | undefined;
      if (required.min !== min || required.max !== max) {
        return true;
      }
    }

    return false;
  }

  async applySync(
    syncResult: HelperSyncResult,
    options: { skipDeletes?: boolean } = {},
  ): Promise<void> {
    for (const helper of syncResult.toCreate) {
      await this.createHelper(helper);
    }

    for (const helper of syncResult.toUpdate) {
      await this.api.deleteHelper(helper.id);
      await this.createHelper(helper);
    }

    if (!options.skipDeletes) {
      for (const entityId of syncResult.toDelete) {
        await this.api.deleteHelper(entityId);
      }
    }
  }

  async createHelper(config: HelperConfig): Promise<void> {
    const name = config.name || this.extractName(config.id);

    switch (config.type) {
      case 'input_boolean':
        await this.api.setHelperValue(config.id, config.initial ?? false);
        break;

      case 'input_number':
        await this.api.setHelperValue(config.id, config.initial ?? config.min ?? 0);
        break;

      case 'input_text':
        await this.api.setHelperValue(config.id, config.initial ?? '');
        break;

      case 'input_datetime':
        await this.api.setHelperValue(config.id, config.initial ?? '');
        break;

      default:
        throw new Error(`Unknown helper type: ${config.type} (${name})`);
    }
  }

  private extractName(entityId: string): string {
    const parts = entityId.split('.');
    if (parts.length !== 2) return entityId;

    return parts[1]
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async getHelperStates(helperIds: string[]): Promise<Record<string, unknown>> {
    const states = await this.api.getStates();
    const result: Record<string, unknown> = {};

    for (const id of helperIds) {
      const state = states.find((s) => s.entity_id === id);
      if (state) {
        result[id] = this.parseHelperValue(state);
      }
    }

    return result;
  }

  private parseHelperValue(state: HAState): unknown {
    const domain = state.entity_id.split('.')[0];

    switch (domain) {
      case 'input_boolean':
        return state.state === 'on';

      case 'input_number':
      case 'counter':
        return Number.isNaN(Number(state.state)) ? 0 : Number(state.state);

      case 'input_text':
      case 'input_datetime':
      default:
        return state.state;
    }
  }

  async restoreHelperStates(states: Record<string, unknown>): Promise<void> {
    for (const [entityId, value] of Object.entries(states)) {
      try {
        await this.api.setHelperValue(entityId, value);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to restore ${entityId}:`, error);
      }
    }
  }
}

