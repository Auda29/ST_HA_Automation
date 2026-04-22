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

  async calculateSync(
    required: HelperConfig[],
    existing?: ExistingHelper[],
  ): Promise<HelperSyncResult> {
    const currentHelpers = existing ?? (await this.getExistingHelpers());
    const existingIds = new Set(currentHelpers.map((h) => h.entityId));
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
        const existingHelper = currentHelpers.find((h) => h.entityId === helper.id);
        if (existingHelper && this.needsUpdate(helper, existingHelper)) {
          result.toUpdate.push(helper);
        } else {
          result.unchanged.push(helper.id);
        }
      }
    }

    for (const helper of currentHelpers) {
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

  toHelperConfig(existing: ExistingHelper): HelperConfig {
    const name =
      (typeof existing.attributes.friendly_name === 'string' &&
        existing.attributes.friendly_name) ||
      this.extractName(existing.entityId);

    switch (existing.type) {
      case 'input_boolean':
        return {
          id: existing.entityId,
          type: 'input_boolean',
          name,
          initial: existing.state === 'on',
        };

      case 'input_number':
        return {
          id: existing.entityId,
          type: 'input_number',
          name,
          initial: this.parseNumericValue(existing.state),
          min: this.parseOptionalNumber(existing.attributes.min),
          max: this.parseOptionalNumber(existing.attributes.max),
          step: this.parseOptionalNumber(existing.attributes.step),
          mode:
            existing.attributes.mode === 'slider' ||
            existing.attributes.mode === 'box'
              ? existing.attributes.mode
              : undefined,
        };

      case 'input_text':
        return {
          id: existing.entityId,
          type: 'input_text',
          name,
          initial: existing.state,
          pattern:
            typeof existing.attributes.pattern === 'string'
              ? existing.attributes.pattern
              : undefined,
        };

      case 'input_datetime':
        return {
          id: existing.entityId,
          type: 'input_datetime',
          name,
          initial: existing.state,
        };

      case 'input_select':
        return {
          id: existing.entityId,
          type: 'input_select',
          name,
          initial: existing.state,
          options: Array.isArray(existing.attributes.options)
            ? existing.attributes.options.filter(
                (option): option is string => typeof option === 'string',
              )
            : undefined,
        };

      case 'counter':
        return {
          id: existing.entityId,
          type: 'counter',
          name,
          initial: this.parseNumericValue(existing.state),
          min: this.parseOptionalNumber(existing.attributes.minimum),
          max: this.parseOptionalNumber(existing.attributes.maximum),
          step: this.parseOptionalNumber(existing.attributes.step),
        };

      case 'timer':
        return {
          id: existing.entityId,
          type: 'timer',
          name,
          initial:
            (typeof existing.attributes.duration === 'string' &&
              existing.attributes.duration) ||
            existing.state,
        };

      default:
        return {
          id: existing.entityId,
          type: existing.type as HelperConfig['type'],
          name,
          initial: existing.state,
        };
    }
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
        await this.api.createInputBoolean({
          name,
          initial: Boolean(config.initial ?? false),
        });
        break;

      case 'input_number':
        await this.api.createInputNumber({
          name,
          initial: Number(config.initial ?? config.min ?? 0),
          min: config.min,
          max: config.max,
          step: config.step,
          mode: config.mode,
        });
        break;

      case 'input_text':
        await this.api.createInputText({
          name,
          initial: String(config.initial ?? ''),
          pattern: config.pattern,
        });
        break;

      case 'input_datetime':
        await this.api.createInputDateTime({
          name,
          initial: String(config.initial ?? ''),
        });
        break;

      case 'timer':
        await this.api.createTimer({
          name,
          duration: String(config.initial ?? '00:00:00'),
        });
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

  private parseOptionalNumber(value: unknown): number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  private parseNumericValue(value: string): number {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
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

