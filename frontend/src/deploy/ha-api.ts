/**
 * Home Assistant WebSocket API Wrapper
 */

import type {
  HAConnection,
  HAState,
  HAAutomationConfig,
  HAScriptConfig,
} from './types';

// ============================================================================
// API Wrapper Class
// ============================================================================

export class HAApiClient {
  private readonly connection: HAConnection;

  constructor(connection: HAConnection) {
    this.connection = connection;
  }

  // ==========================================================================
  // Automation API
  // ==========================================================================

  async getAutomations(): Promise<HAAutomationConfig[]> {
    return this.connection.callWS({
      type: 'config/automation/list',
    });
  }

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

  async saveAutomation(automationId: string, config: HAAutomationConfig): Promise<void> {
    await this.connection.callWS({
      type: 'config/automation/config',
      automation_id: automationId,
      config,
    });
  }

  async deleteAutomation(automationId: string): Promise<void> {
    await this.connection.callWS({
      type: 'config/automation/delete',
      automation_id: automationId,
    });
  }

  async reloadAutomations(): Promise<void> {
    await this.connection.callService('automation', 'reload');
  }

  // ==========================================================================
  // Script API
  // ==========================================================================

  async getScripts(): Promise<Record<string, HAScriptConfig>> {
    return this.connection.callWS({
      type: 'config/script/list',
    });
  }

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

  async saveScript(scriptId: string, config: HAScriptConfig): Promise<void> {
    await this.connection.callWS({
      type: 'config/script/config',
      script_id: scriptId,
      config,
    });
  }

  async deleteScript(scriptId: string): Promise<void> {
    await this.connection.callWS({
      type: 'config/script/delete',
      script_id: scriptId,
    });
  }

  async reloadScripts(): Promise<void> {
    await this.connection.callService('script', 'reload');
  }

  // ==========================================================================
  // Helper API
  // ==========================================================================

  async getStates(): Promise<HAState[]> {
    return this.connection.getStates();
  }

  async getSTHelpers(prefix: string = 'st_'): Promise<HAState[]> {
    const states = await this.getStates();
    return states.filter((s) => {
      const name = s.entity_id.split('.')[1];
      return name?.startsWith(prefix);
    });
  }

  async deleteHelper(entityId: string): Promise<void> {
    const [domain, name] = entityId.split('.');
    await this.connection.callWS({
      type: `${domain}/delete`,
      // e.g. input_number_id, input_boolean_id, ...
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [`${domain}_id`]: name as any,
    });
  }

  async setHelperValue(entityId: string, value: unknown): Promise<void> {
    const [domain] = entityId.split('.');

    switch (domain) {
      case 'input_boolean':
        await this.connection.callService(
          'input_boolean',
          value ? 'turn_on' : 'turn_off',
          { entity_id: entityId },
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

      default:
        break;
    }
  }
}

