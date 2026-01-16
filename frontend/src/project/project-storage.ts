/**
 * Project Storage Manager
 *
 * Handles persistence of project structure and file content using HA's storage API.
 * Falls back to localStorage for client-side caching.
 */

import type { ProjectStructure, ProjectFile } from "./types";
import { STORAGE_KEY_PROJECT } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HAConnection = any; // Home Assistant WebSocket connection

export class ProjectStorage {
  constructor(
    // Reserved for future HA storage API integration
    _connection: HAConnection | null,
    // Reserved for future HA storage API integration
    _configEntryId: string,
  ) {
    // Connection and configEntryId stored for future HA storage API integration
    void _connection;
    void _configEntryId;
  }

  /**
   * Load project structure from localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async loadProject(): Promise<ProjectStructure | null> {
    // Use localStorage (consistent with existing schema storage)
    const localData = localStorage.getItem(STORAGE_KEY_PROJECT);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        return this._deserializeProject(parsed);
      } catch (error) {
        console.error("Failed to parse localStorage project data", error);
      }
    }

    return null;
  }

  /**
   * Save project structure to localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async saveProject(project: ProjectStructure): Promise<void> {
    const serialized = this._serializeProject(project);
    localStorage.setItem(STORAGE_KEY_PROJECT, JSON.stringify(serialized));
  }

  /**
   * Create a new project with default structure
   */
  createDefaultProject(): ProjectStructure {
    const now = Date.now();
    const defaultFile: ProjectFile = {
      id: this._generateFileId(),
      name: "Main.st",
      path: "Main.st",
      content: `{mode: restart}
PROGRAM Main
VAR
END_VAR

(* Your ST code here *)

END_PROGRAM`,
      lastModified: now,
      isOpen: true,
      hasUnsavedChanges: false,
    };

    return {
      id: this._generateProjectId(),
      name: "My ST Project",
      files: [defaultFile],
      activeFileId: defaultFile.id,
      createdAt: now,
      lastModified: now,
    };
  }

  /**
   * Migrate from single-file mode to project mode
   */
  migrateFromSingleFile(content: string): ProjectStructure {
    const now = Date.now();
    const file: ProjectFile = {
      id: this._generateFileId(),
      name: "Main.st",
      path: "Main.st",
      content,
      lastModified: now,
      isOpen: true,
      hasUnsavedChanges: false,
    };

    return {
      id: this._generateProjectId(),
      name: "My ST Project",
      files: [file],
      activeFileId: file.id,
      createdAt: now,
      lastModified: now,
    };
  }

  /**
   * Serialize project for storage (exclude transient state)
   */
  private _serializeProject(project: ProjectStructure): unknown {
    return {
      id: project.id,
      name: project.name,
      files: project.files.map((file) => ({
        id: file.id,
        name: file.name,
        path: file.path,
        content: file.content,
        lastModified: file.lastModified,
        // Don't serialize isOpen and hasUnsavedChanges (transient state)
      })),
      activeFileId: project.activeFileId,
      createdAt: project.createdAt,
      lastModified: project.lastModified,
    };
  }

  /**
   * Deserialize project from storage
   */
  private _deserializeProject(data: unknown): ProjectStructure {
    const parsed = data as {
      id: string;
      name: string;
      files: Array<{
        id: string;
        name: string;
        path: string;
        content: string;
        lastModified: number;
      }>;
      activeFileId: string | null;
      createdAt: number;
      lastModified: number;
    };

    return {
      id: parsed.id,
      name: parsed.name,
      files: parsed.files.map((file) => ({
        ...file,
        isOpen: false, // Reset on load
        hasUnsavedChanges: false, // Reset on load
      })),
      activeFileId: parsed.activeFileId,
      createdAt: parsed.createdAt,
      lastModified: parsed.lastModified,
    };
  }

  /**
   * Generate unique file ID
   */
  private _generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique project ID
   */
  private _generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
