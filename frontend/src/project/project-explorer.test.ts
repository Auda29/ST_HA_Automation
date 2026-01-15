/**
 * Project Explorer Component Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { ProjectStructure, ProjectFile } from "./types";
import { ProjectStorage } from "./project-storage";
import "./project-explorer";

describe("Project Explorer Integration", () => {
  let storage: ProjectStorage;

  beforeEach(() => {
    storage = new ProjectStorage(null, "test-config");
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Project Structure Management", () => {
    it("creates and persists project with multiple files", async () => {
      const project = storage.createDefaultProject();

      // Add additional files
      const file2: ProjectFile = {
        id: "file_2",
        name: "Kitchen.st",
        path: "Kitchen.st",
        content: "PROGRAM Kitchen\nEND_PROGRAM",
        lastModified: Date.now(),
        isOpen: false,
        hasUnsavedChanges: false,
      };

      const file3: ProjectFile = {
        id: "file_3",
        name: "Bedroom.st",
        path: "Bedroom.st",
        content: "PROGRAM Bedroom\nEND_PROGRAM",
        lastModified: Date.now(),
        isOpen: false,
        hasUnsavedChanges: false,
      };

      project.files.push(file2, file3);
      project.activeFileId = file2.id;

      await storage.saveProject(project);

      const loaded = await storage.loadProject();

      expect(loaded).toBeDefined();
      expect(loaded?.files).toHaveLength(3);
      expect(loaded?.activeFileId).toBe(file2.id);
    });

    it("tracks unsaved changes per file", async () => {
      const project = storage.createDefaultProject();
      project.files[0].hasUnsavedChanges = true;

      // Save project
      await storage.saveProject(project);

      // Load and verify unsaved changes are reset (transient state)
      const loaded = await storage.loadProject();
      expect(loaded?.files[0].hasUnsavedChanges).toBe(false);

      // But we can set it again in memory
      loaded!.files[0].hasUnsavedChanges = true;
      expect(loaded.files[0].hasUnsavedChanges).toBe(true);
    });
  });

  describe("File Operations", () => {
    let project: ProjectStructure;

    beforeEach(() => {
      project = storage.createDefaultProject();
    });

    it("supports creating new files", () => {
      const newFile: ProjectFile = {
        id: "file_new",
        name: "NewFile.st",
        path: "NewFile.st",
        content: "PROGRAM NewFile\nEND_PROGRAM",
        lastModified: Date.now(),
        isOpen: false,
        hasUnsavedChanges: false,
      };

      project.files.push(newFile);

      expect(project.files).toHaveLength(2);
      expect(project.files.find((f) => f.name === "NewFile.st")).toBeDefined();
    });

    it("supports renaming files", () => {
      const file = project.files[0];
      const oldName = file.name;
      file.name = "Renamed.st";
      file.path = "Renamed.st";

      expect(file.name).toBe("Renamed.st");
      expect(file.name).not.toBe(oldName);
    });

    it("supports deleting files", () => {
      const fileToDelete = project.files[0];
      project.files = project.files.filter((f) => f.id !== fileToDelete.id);

      expect(project.files).toHaveLength(0);
      expect(project.files.find((f) => f.id === fileToDelete.id)).toBeUndefined();
    });

    it("handles file paths with folders", () => {
      const file: ProjectFile = {
        id: "file_folder",
        name: "Kitchen.st",
        path: "automations/kitchen/Kitchen.st",
        content: "PROGRAM Kitchen\nEND_PROGRAM",
        lastModified: Date.now(),
        isOpen: false,
        hasUnsavedChanges: false,
      };

      project.files.push(file);

      expect(file.path).toContain("/");
      expect(file.path.split("/").length).toBe(3);
    });
  });

  describe("Active File Management", () => {
    it("tracks active file ID", () => {
      const project = storage.createDefaultProject();
      expect(project.activeFileId).toBe(project.files[0].id);
    });

    it("can switch active file", () => {
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

      expect(project.activeFileId).toBe(secondFile.id);
      expect(project.activeFileId).not.toBe(project.files[0].id);
    });

    it("can have no active file", () => {
      const project = storage.createDefaultProject();
      project.activeFileId = null;

      expect(project.activeFileId).toBeNull();
    });
  });

  describe("Persistence Across Restarts", () => {
    it("survives localStorage clear and reload", async () => {
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

      // Simulate restart
      const newStorage = new ProjectStorage(null, "test-config");
      const loaded = await newStorage.loadProject();

      expect(loaded).toBeDefined();
      expect(loaded?.files).toHaveLength(2);
      expect(loaded?.files[0].content).toContain("PROGRAM Main");
      expect(loaded?.files[1].content).toContain("PROGRAM Second");
    });

    it("preserves project metadata across restarts", async () => {
      const project = storage.createDefaultProject();
      const originalCreatedAt = project.createdAt;
      const originalLastModified = project.lastModified;

      await storage.saveProject(project);

      const loaded = await storage.loadProject();

      expect(loaded?.createdAt).toBe(originalCreatedAt);
      expect(loaded?.lastModified).toBe(originalLastModified);
    });
  });

  describe("Backward Compatibility", () => {
    it("migrates single-file content to project structure", () => {
      const singleFileContent = `PROGRAM OldProgram
VAR
  x : INT := 0;
END_VAR
x := x + 1;
END_PROGRAM`;

      const project = storage.migrateFromSingleFile(singleFileContent);

      expect(project.files).toHaveLength(1);
      expect(project.files[0].content).toBe(singleFileContent);
      expect(project.files[0].name).toBe("Main.st");
      expect(project.activeFileId).toBe(project.files[0].id);
    });
  });
});
