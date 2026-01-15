/**
 * Project Management Type Definitions
 */

// ============================================================================
// Project File
// ============================================================================

export interface ProjectFile {
  id: string; // Unique file identifier
  name: string; // Display name (e.g., "Kitchen_Light.st")
  path: string; // Virtual path in project (e.g., "automations/kitchen.st")
  content: string; // ST program content
  lastModified: number; // Timestamp
  isOpen: boolean; // Whether file is currently open in editor
  hasUnsavedChanges: boolean; // Whether file has unsaved changes
}

// ============================================================================
// Project Structure
// ============================================================================

export interface ProjectStructure {
  id: string; // Project identifier
  name: string; // Project display name
  files: ProjectFile[]; // All files in the project
  activeFileId: string | null; // Currently active/selected file
  createdAt: number; // Project creation timestamp
  lastModified: number; // Last modification timestamp
}

// ============================================================================
// File Operations
// ============================================================================

export interface FileOperation {
  type: "create" | "rename" | "delete" | "move";
  fileId: string;
  newName?: string; // For rename
  newPath?: string; // For move
  content?: string; // For create
}

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEY_PROJECT = "st_hass_project";
export const STORAGE_KEY_DEFAULT_PROJECT = "st_hass_default_project";
