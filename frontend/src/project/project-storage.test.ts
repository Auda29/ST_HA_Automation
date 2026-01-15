/**
 * Project Storage Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ProjectStorage } from "./project-storage";
import type { ProjectStructure, ProjectFile } from "./types";
import { STORAGE_KEY_PROJECT } from "./types";

describe("ProjectStorage", () => {
  let storage: ProjectStorage;

  beforeEach(() => {
    storage = new ProjectStorage(null, "test-config");
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Project Creation", () => {
    it("creates a default project with Main.st file", () => {
      const project = storage.createDefaultProject();

      expect(project).toBeDefined();
      expect(project.id).toMatch(/^project_\d+_/);
      expect(project.name).toBe("My ST Project");
      expect(project.files).toHaveLength(1);
      expect(project.files[0].name).toBe("Main.st");
      expect(project.files[0].path).toBe("Main.st");
      expect(project.files[0].content).toContain("PROGRAM Main");
      expect(project.activeFileId).toBe(project.files[0].id);
      expect(project.files[0].isOpen).toBe(true);
      expect(project.files[0].hasUnsavedChanges).toBe(false);
    });

    it("generates unique project IDs", () => {
      const project1 = storage.createDefaultProject();
      const project2 = storage.createDefaultProject();

      expect(project1.id).not.toBe(project2.id);
    });

    it("generates unique file IDs", () => {
      const project = storage.createDefaultProject();
      const fileId1 = project.files[0].id;

      // Create another project
      const project2 = storage.createDefaultProject();
      const fileId2 = project2.files[0].id;

      expect(fileId1).not.toBe(fileId2);
    });
  });

  describe("Migration from Single File", () => {
    it("migrates single file content to project structure", () => {
      const singleFileContent = `PROGRAM Test
VAR
  x : INT;
END_VAR
x := 42;
END_PROGRAM`;

      const project = storage.migrateFromSingleFile(singleFileContent);

      expect(project).toBeDefined();
      expect(project.files).toHaveLength(1);
      expect(project.files[0].name).toBe("Main.st");
      expect(project.files[0].content).toBe(singleFileContent);
      expect(project.files[0].isOpen).toBe(true);
      expect(project.files[0].hasUnsavedChanges).toBe(false);
    });
  });

  describe("Persistence", () => {
    it("saves project to localStorage", async () => {
      const project = storage.createDefaultProject();
      await storage.saveProject(project);

      const stored = localStorage.getItem(STORAGE_KEY_PROJECT);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.id).toBe(project.id);
      expect(parsed.name).toBe(project.name);
      expect(parsed.files).toHaveLength(1);
    });

    it("loads project from localStorage", async () => {
      const project = storage.createDefaultProject();
      await storage.saveProject(project);

      const loaded = await storage.loadProject();

      expect(loaded).toBeDefined();
      expect(loaded?.id).toBe(project.id);
      expect(loaded?.name).toBe(project.name);
      expect(loaded?.files).toHaveLength(1);
      expect(loaded?.files[0].name).toBe(project.files[0].name);
      expect(loaded?.files[0].content).toBe(project.files[0].content);
    });

    it("returns null when no project is stored", async () => {
      const loaded = await storage.loadProject();
      expect(loaded).toBeNull();
    });

    it("handles corrupted localStorage data gracefully", async () => {
      localStorage.setItem(STORAGE_KEY_PROJECT, "invalid json");

      const loaded = await storage.loadProject();
      expect(loaded).toBeNull();
    });

    it("persists project structure across restarts", async () => {
      const project = storage.createDefaultProject();
      project.files.push({
        id: "file_2",
        name: "Second.st",
        path: "Second.st",
        content: "PROGRAM Second\nEND_PROGRAM",
        lastModified: Date.now(),
        isOpen: false,
        hasUnsavedChanges: false,
      });

      await storage.saveProject(project);

      // Simulate restart by creating new storage instance
      const newStorage = new ProjectStorage(null, "test-config");
      const loaded = await newStorage.loadProject();

      expect(loaded).toBeDefined();
      expect(loaded?.files).toHaveLength(2);
      expect(loaded?.files.find((f) => f.name === "Second.st")).toBeDefined();
    });

    it("resets transient state (isOpen, hasUnsavedChanges) on load", async () => {
      const project = storage.createDefaultProject();
      project.files[0].isOpen = true;
      project.files[0].hasUnsavedChanges = true;

      await storage.saveProject(project);

      const loaded = await storage.loadProject();

      expect(loaded?.files[0].isOpen).toBe(false);
      expect(loaded?.files[0].hasUnsavedChanges).toBe(false);
    });
  });

  describe("Serialization", () => {
    it("serializes project without transient state", async () => {
      const project = storage.createDefaultProject();
      project.files[0].isOpen = true;
      project.files[0].hasUnsavedChanges = true;

      await storage.saveProject(project);

      const stored = localStorage.getItem(STORAGE_KEY_PROJECT);
      const parsed = JSON.parse(stored!);

      // Transient state should not be in stored data
      expect(parsed.files[0].isOpen).toBeUndefined();
      expect(parsed.files[0].hasUnsavedChanges).toBeUndefined();
    });

    it("preserves all file content and metadata", async () => {
      const project = storage.createDefaultProject();
      const file = project.files[0];
      file.content = "PROGRAM Test\nEND_PROGRAM";
      file.lastModified = 1234567890;

      await storage.saveProject(project);

      const loaded = await storage.loadProject();

      expect(loaded?.files[0].content).toBe("PROGRAM Test\nEND_PROGRAM");
      expect(loaded?.files[0].lastModified).toBe(1234567890);
    });
  });

  describe("Multiple Files", () => {
    it("handles projects with multiple files", async () => {
      const project = storage.createDefaultProject();
      project.files.push({
        id: "file_2",
        name: "Kitchen.st",
        path: "automations/Kitchen.st",
        content: "PROGRAM Kitchen\nEND_PROGRAM",
        lastModified: Date.now(),
        isOpen: false,
        hasUnsavedChanges: false,
      });
      project.files.push({
        id: "file_3",
        name: "Bedroom.st",
        path: "automations/Bedroom.st",
        content: "PROGRAM Bedroom\nEND_PROGRAM",
        lastModified: Date.now(),
        isOpen: false,
        hasUnsavedChanges: false,
      });

      await storage.saveProject(project);

      const loaded = await storage.loadProject();

      expect(loaded?.files).toHaveLength(3);
      expect(loaded?.files.map((f) => f.name)).toEqual([
        "Main.st",
        "Kitchen.st",
        "Bedroom.st",
      ]);
    });

    it("preserves active file ID", async () => {
      const project = storage.createDefaultProject();
      const secondFile: ProjectFile = {
        id: "file_2",
        name: "Second.st",
        path: "Second.st",
        content: "PROGRAM Second\nEND_PROGRAM",
        lastModified: Date.now(),
        isOpen: false,
        hasUnsavedChanges: false,
      };
      project.files.push(secondFile);
      project.activeFileId = secondFile.id;

      await storage.saveProject(project);

      const loaded = await storage.loadProject();

      expect(loaded?.activeFileId).toBe(secondFile.id);
    });
  });
});
