/**
 * Source Map Generator
 * 
 * Records mappings between generated YAML paths and original ST source locations.
 */

import type {
  SourceLocation,
  SourceMapEntry,
  SourceMap,
  YAMLPath,
  EmbeddedSourceMap,
} from './source-map-types';

// ============================================================================
// Source Map Builder
// ============================================================================

export class SourceMapBuilder {
  private mappings: Map<YAMLPath, SourceMapEntry> = new Map();
  private currentPath: string[] = [];
  
  private project: string;
  private program: string;
  private sourceFile: string;
  private sourceHash: string;

  constructor(options: {
    project: string;
    program: string;
    sourceFile: string;
    sourceContent: string;
  }) {
    this.project = options.project;
    this.program = options.program;
    this.sourceFile = options.sourceFile;
    this.sourceHash = this.hashContent(options.sourceContent);
  }

  // ==========================================================================
  // Path Management
  // ==========================================================================

  /**
   * Push a path segment (e.g., entering an action array)
   */
  pushPath(segment: string | number): void {
    this.currentPath.push(String(segment));
  }

  /**
   * Pop the last path segment
   */
  popPath(): void {
    this.currentPath.pop();
  }

  /**
   * Get current YAML path as string
   */
  getCurrentPath(): YAMLPath {
    return this.currentPath.join('.');
  }

  /**
   * Execute function with temporary path segment
   */
  withPath<T>(segment: string | number, fn: () => T): T {
    this.pushPath(segment);
    try {
      return fn();
    } finally {
      this.popPath();
    }
  }

  // ==========================================================================
  // Recording Mappings
  // ==========================================================================

  /**
   * Record a mapping at the current path
   */
  record(location: Partial<SourceLocation> & { line: number; column: number }, description?: string): void {
    const path = this.getCurrentPath();
    if (path) {
      this.mappings.set(path, {
        st: {
          file: this.sourceFile,
          line: location.line,
          column: location.column,
          endLine: location.endLine,
          endColumn: location.endColumn,
        },
        description,
      });
    }
  }

  /**
   * Record a mapping at a specific path
   */
  recordAt(path: YAMLPath, location: Partial<SourceLocation> & { line: number; column: number }, description?: string): void {
    this.mappings.set(path, {
      st: {
        file: this.sourceFile,
        line: location.line,
        column: location.column,
        endLine: location.endLine,
        endColumn: location.endColumn,
      },
      description,
    });
  }

  /**
   * Record mapping for an AST node
   * Handles both parser SourceLocation (startLine/startColumn) and sourcemap SourceLocation (line/column)
   */
  recordNode(node: { location?: any }, description?: string): void {
    if (!node.location) return;
    
    // Convert parser SourceLocation format to sourcemap format
    const location: SourceLocation = {
      file: this.sourceFile,
      line: node.location.startLine ?? node.location.line ?? 1,
      column: node.location.startColumn ?? node.location.column ?? 1,
    };
    
    if (node.location.endLine) {
      location.endLine = node.location.endLine;
    }
    if (node.location.endColumn) {
      location.endColumn = node.location.endColumn;
    }
    
    this.record(location, description);
  }

  // ==========================================================================
  // Building Output
  // ==========================================================================

  /**
   * Build the complete source map
   */
  build(automationId: string, scriptId?: string): SourceMap {
    return {
      version: 1,
      project: this.project,
      program: this.program,
      automationId,
      scriptId,
      generatedAt: new Date().toISOString(),
      mappings: Object.fromEntries(this.mappings),
      sourceHash: this.sourceHash,
    };
  }

  /**
   * Build source map for embedding in YAML variables
   */
  buildEmbedded(): EmbeddedSourceMap {
    return {
      _st_source_map: Object.fromEntries(this.mappings),
      _st_source_file: this.sourceFile,
      _st_source_hash: this.sourceHash,
    };
  }

  /**
   * Export mappings as JSON string (for storage)
   */
  toJSON(): string {
    return JSON.stringify(this.build(''), null, 2);
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  private hashContent(content: string): string {
    // Simple hash for change detection
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

// ============================================================================
// Source Map Reader
// ============================================================================

export class SourceMapReader {
  private sourceMap: SourceMap;

  constructor(sourceMap: SourceMap) {
    this.sourceMap = sourceMap;
  }

  /**
   * Look up ST location for a YAML path
   */
  lookup(yamlPath: YAMLPath): SourceMapEntry | null {
    // Exact match
    if (this.sourceMap.mappings[yamlPath]) {
      return this.sourceMap.mappings[yamlPath];
    }

    // Try parent paths
    const parts = yamlPath.split('.');
    while (parts.length > 0) {
      parts.pop();
      const parentPath = parts.join('.');
      if (this.sourceMap.mappings[parentPath]) {
        return this.sourceMap.mappings[parentPath];
      }
    }

    return null;
  }

  /**
   * Find all mappings within a path prefix
   */
  findByPrefix(prefix: YAMLPath): Array<{ path: YAMLPath; entry: SourceMapEntry }> {
    const results: Array<{ path: YAMLPath; entry: SourceMapEntry }> = [];
    
    for (const [path, entry] of Object.entries(this.sourceMap.mappings)) {
      if (path.startsWith(prefix)) {
        results.push({ path, entry });
      }
    }

    return results;
  }

  /**
   * Get all mappings for a specific ST line
   */
  findByLine(file: string, line: number): Array<{ path: YAMLPath; entry: SourceMapEntry }> {
    const results: Array<{ path: YAMLPath; entry: SourceMapEntry }> = [];
    
    for (const [path, entry] of Object.entries(this.sourceMap.mappings)) {
      if (entry.st.file === file && entry.st.line === line) {
        results.push({ path, entry });
      }
    }

    return results;
  }

  /**
   * Validate source map against current source
   */
  validateHash(currentContent: string): boolean {
    if (!this.sourceMap.sourceHash) return true;
    
    let hash = 0;
    for (let i = 0; i < currentContent.length; i++) {
      const char = currentContent.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return hash.toString(16) === this.sourceMap.sourceHash;
  }
}

// ============================================================================
// Integration with Transpiler
// ============================================================================

/**
 * Create a source map builder integrated with transpiler context
 */
export function createSourceMapBuilder(
  project: string,
  program: string,
  sourceFile: string,
  sourceContent: string
): SourceMapBuilder {
  return new SourceMapBuilder({
    project,
    program,
    sourceFile,
    sourceContent,
  });
}
