# Task: Source Maps & Error Mapping

## Kontext

Du implementierst Source Maps und Error Mapping für das "ST for Home Assistant" Projekt. Dies ermöglicht es, HA-Fehlermeldungen auf die ursprünglichen ST-Codezeilen zurückzuführen.

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`
**Voraussetzung:** Transpiler ist implementiert (Phase 3 abgeschlossen)

## ⚠️ Das Problem

```
HA-Fehler zeigt:    "Error in automation.yaml line 47"
User denkt:         "Welche ST-Zeile ist das??"
```

**Ohne Source Maps:** Debugging ist ein Albtraum - der User muss manuell YAML ↔ ST abgleichen.

**Mit Source Maps:** Fehler werden automatisch auf ST-Code gemappt.

---

## Architektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Error Mapping Flow                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Transpilation                                                            │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────────────────┐   │
│  │ ST Code     │──────▶│ Transpiler  │──────▶│ YAML + Source Map       │   │
│  │ Line 7      │       │             │       │ action.0.choose.0 → L7  │   │
│  └─────────────┘       └─────────────┘       └─────────────────────────┘   │
│                                                                              │
│  2. Runtime Error                                                            │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────────────────┐   │
│  │ HA Log      │──────▶│ Error       │──────▶│ Mapped Error            │   │
│  │ "line 47"   │       │ Mapper      │       │ "kitchen.st line 7"     │   │
│  └─────────────┘       └─────────────┘       └─────────────────────────┘   │
│                                                                              │
│  3. UI Display                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ❌ Fehler in kitchen.st Zeile 7:                                    │   │
│  │     Variable 'sensor_temp' nicht gefunden                            │   │
│  │                                                                      │   │
│  │     7 │ IF sensor_temp > 25.0 THEN                                   │   │
│  │           ^^^^^^^^^^^                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Zu erstellende Dateien

```
frontend/src/
├── sourcemap/
│   ├── source-map.ts           # Source Map Generator
│   ├── source-map-types.ts     # Type Definitions
│   └── index.ts
├── error-mapping/
│   ├── error-mapper.ts         # Error Translation
│   ├── error-patterns.ts       # Known Error Patterns
│   ├── error-types.ts          # Type Definitions
│   └── index.ts
└── __tests__/
    ├── source-map.test.ts
    └── error-mapper.test.ts
```

---

## frontend/src/sourcemap/source-map-types.ts

```typescript
/**
 * Source Map Type Definitions
 */

// ============================================================================
// Source Location Types
// ============================================================================

export interface SourceLocation {
  /** Source file name */
  file: string;
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column: number;
  /** End line (optional) */
  endLine?: number;
  /** End column (optional) */
  endColumn?: number;
}

export interface SourceMapEntry {
  /** Original ST source location */
  st: SourceLocation;
  /** Description of what this maps to */
  description?: string;
}

// ============================================================================
// YAML Path Types
// ============================================================================

/**
 * YAML path representation
 * Example: "action.0.choose.0.sequence.1"
 */
export type YAMLPath = string;

/**
 * Source map: YAML path → ST location
 */
export type SourceMapData = Record<YAMLPath, SourceMapEntry>;

// ============================================================================
// Source Map Container
// ============================================================================

export interface SourceMap {
  /** Version of source map format */
  version: 1;
  
  /** Project name */
  project: string;
  
  /** Program name */
  program: string;
  
  /** Generated automation ID */
  automationId: string;
  
  /** Generated script ID (if any) */
  scriptId?: string;
  
  /** Timestamp of generation */
  generatedAt: string;
  
  /** Mapping data */
  mappings: SourceMapData;
  
  /** Source file content hash (for validation) */
  sourceHash?: string;
}

// ============================================================================
// Embedded Source Map
// ============================================================================

/**
 * Source map embedded in generated YAML as a variable
 */
export interface EmbeddedSourceMap {
  _st_source_map: SourceMapData;
  _st_source_file: string;
  _st_source_hash: string;
}
```

---

## frontend/src/sourcemap/source-map.ts

```typescript
/**
 * Source Map Generator
 * 
 * Records mappings between generated YAML paths and original ST source locations.
 */

import type {
  SourceLocation,
  SourceMapEntry,
  SourceMapData,
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
  record(location: SourceLocation, description?: string): void {
    const path = this.getCurrentPath();
    if (path) {
      this.mappings.set(path, {
        st: {
          file: this.sourceFile,
          ...location,
        },
        description,
      });
    }
  }

  /**
   * Record a mapping at a specific path
   */
  recordAt(path: YAMLPath, location: SourceLocation, description?: string): void {
    this.mappings.set(path, {
      st: {
        file: this.sourceFile,
        ...location,
      },
      description,
    });
  }

  /**
   * Record mapping for an AST node
   */
  recordNode(node: { location?: SourceLocation }, description?: string): void {
    if (node.location) {
      this.record(node.location, description);
    }
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
```

---

## frontend/src/error-mapping/error-types.ts

```typescript
/**
 * Error Mapping Type Definitions
 */

import type { SourceLocation } from '../sourcemap/source-map-types';

// ============================================================================
// HA Error Types
// ============================================================================

export interface HALogEntry {
  /** Log level */
  level: 'ERROR' | 'WARNING' | 'INFO';
  
  /** Timestamp */
  timestamp: string;
  
  /** Logger name */
  logger: string;
  
  /** Error message */
  message: string;
  
  /** Exception info (if any) */
  exception?: string;
  
  /** Context data */
  context?: Record<string, unknown>;
}

export interface HAAutomationError {
  /** Automation ID that caused the error */
  automationId: string;
  
  /** Error message */
  message: string;
  
  /** YAML path where error occurred (if available) */
  yamlPath?: string;
  
  /** Original log entry */
  logEntry: HALogEntry;
}

// ============================================================================
// Mapped Error Types
// ============================================================================

export interface MappedError {
  /** Original HA error */
  original: HAAutomationError;
  
  /** Translated error message (user-friendly) */
  translatedMessage: string;
  
  /** ST source location */
  stLocation?: SourceLocation;
  
  /** Code snippet around error */
  codeSnippet?: CodeSnippet;
  
  /** Suggested fixes */
  suggestions?: string[];
  
  /** Related documentation links */
  docLinks?: string[];
}

export interface CodeSnippet {
  /** Lines of code around error */
  lines: Array<{
    number: number;
    content: string;
    isError: boolean;
  }>;
  
  /** Column range to highlight */
  highlightRange?: {
    start: number;
    end: number;
  };
}

// ============================================================================
// Error Pattern Types
// ============================================================================

export interface ErrorPattern {
  /** Regex pattern to match error message */
  pattern: RegExp;
  
  /** Template for translated message ($1, $2 for captures) */
  translation: string;
  
  /** Error category */
  category: ErrorCategory;
  
  /** Suggested fixes */
  suggestions?: string[];
  
  /** Related documentation */
  docLinks?: string[];
}

export type ErrorCategory =
  | 'syntax'
  | 'type'
  | 'entity'
  | 'template'
  | 'service'
  | 'runtime'
  | 'unknown';
```

---

## frontend/src/error-mapping/error-patterns.ts

```typescript
/**
 * Known Error Patterns for Translation
 */

import type { ErrorPattern } from './error-types';

// ============================================================================
// Jinja/Template Errors
// ============================================================================

export const TEMPLATE_ERRORS: ErrorPattern[] = [
  {
    pattern: /UndefinedError: '(\w+)' is undefined/,
    translation: "Variable '$1' ist nicht definiert oder Entity nicht gefunden",
    category: 'template',
    suggestions: [
      "Prüfen Sie, ob die Variable deklariert ist",
      "Prüfen Sie, ob die Entity-ID korrekt ist",
      "Stellen Sie sicher, dass die Entity in Home Assistant existiert",
    ],
  },
  {
    pattern: /could not convert string to float: '([^']+)'/,
    translation: "Wert '$1' kann nicht in eine Zahl konvertiert werden",
    category: 'type',
    suggestions: [
      "Der Sensor liefert möglicherweise 'unavailable' oder 'unknown'",
      "Verwenden Sie einen Default-Wert: | float(default=0)",
    ],
  },
  {
    pattern: /TemplateSyntaxError: (.+)/,
    translation: "Template-Syntaxfehler: $1",
    category: 'syntax',
    suggestions: [
      "Prüfen Sie die Jinja2-Syntax",
      "Achten Sie auf korrekte Klammerung",
    ],
  },
  {
    pattern: /TypeError: unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/,
    translation: "Typfehler: Operation '$1' nicht möglich zwischen '$2' und '$3'",
    category: 'type',
    suggestions: [
      "Stellen Sie sicher, dass beide Operanden den korrekten Typ haben",
      "Verwenden Sie Typkonvertierungen wie | int oder | float",
    ],
  },
  {
    pattern: /ZeroDivisionError/,
    translation: "Division durch Null",
    category: 'runtime',
    suggestions: [
      "Prüfen Sie den Divisor vor der Division",
      "Verwenden Sie eine Bedingung: {% if divisor != 0 %}",
    ],
  },
];

// ============================================================================
// Entity Errors
// ============================================================================

export const ENTITY_ERRORS: ErrorPattern[] = [
  {
    pattern: /Entity not found: (.+)/,
    translation: "Entity '$1' wurde nicht gefunden",
    category: 'entity',
    suggestions: [
      "Prüfen Sie, ob die Entity-ID korrekt geschrieben ist",
      "Stellen Sie sicher, dass die Entity in Home Assistant existiert",
      "Die Entity könnte durch eine Integration deaktiviert sein",
    ],
  },
  {
    pattern: /Unable to find service (.+)/,
    translation: "Service '$1' wurde nicht gefunden",
    category: 'service',
    suggestions: [
      "Prüfen Sie, ob die Integration geladen ist",
      "Der Service-Name könnte falsch sein",
    ],
  },
  {
    pattern: /Invalid entity ID: (.+)/,
    translation: "Ungültige Entity-ID: '$1'",
    category: 'entity',
    suggestions: [
      "Entity-IDs müssen das Format 'domain.name' haben",
      "Nur Kleinbuchstaben, Zahlen und Unterstriche erlaubt",
    ],
  },
  {
    pattern: /state of (.+) is unavailable/i,
    translation: "Entity '$1' ist nicht verfügbar (unavailable)",
    category: 'entity',
    suggestions: [
      "Die Entity ist möglicherweise offline",
      "Prüfen Sie die Verbindung zum Gerät",
      "Verwenden Sie Fallback-Werte für unavailable States",
    ],
  },
];

// ============================================================================
// Automation/Script Errors
// ============================================================================

export const AUTOMATION_ERRORS: ErrorPattern[] = [
  {
    pattern: /Error while executing automation (.+)/,
    translation: "Fehler bei Ausführung der Automation '$1'",
    category: 'runtime',
  },
  {
    pattern: /Timeout while executing script/,
    translation: "Timeout bei Script-Ausführung (möglicherweise Endlosschleife)",
    category: 'runtime',
    suggestions: [
      "Prüfen Sie WHILE/REPEAT Schleifen auf Exit-Bedingungen",
      "Der Safety Counter (max 1000 Iterationen) wurde möglicherweise erreicht",
    ],
  },
  {
    pattern: /Error rendering (.+) template/,
    translation: "Fehler beim Rendern des '$1' Templates",
    category: 'template',
  },
  {
    pattern: /Condition (.+) error/,
    translation: "Fehler in Bedingung '$1'",
    category: 'template',
  },
];

// ============================================================================
// Timer Errors
// ============================================================================

export const TIMER_ERRORS: ErrorPattern[] = [
  {
    pattern: /Timer (.+) not found/,
    translation: "Timer '$1' wurde nicht gefunden",
    category: 'entity',
    suggestions: [
      "Der Timer-Helper muss zuerst erstellt werden",
      "Führen Sie einen erneuten Deploy aus",
    ],
  },
  {
    pattern: /Timer (.+) is already running/,
    translation: "Timer '$1' läuft bereits",
    category: 'runtime',
  },
];

// ============================================================================
// All Patterns Combined
// ============================================================================

export const ALL_ERROR_PATTERNS: ErrorPattern[] = [
  ...TEMPLATE_ERRORS,
  ...ENTITY_ERRORS,
  ...AUTOMATION_ERRORS,
  ...TIMER_ERRORS,
];

// ============================================================================
// Pattern Matcher Helper
// ============================================================================

export function findMatchingPattern(message: string): {
  pattern: ErrorPattern;
  matches: RegExpMatchArray;
} | null {
  for (const pattern of ALL_ERROR_PATTERNS) {
    const matches = message.match(pattern.pattern);
    if (matches) {
      return { pattern, matches };
    }
  }
  return null;
}

export function translateMessage(message: string): string {
  const result = findMatchingPattern(message);
  if (!result) {
    return message; // Return original if no pattern matches
  }

  const { pattern, matches } = result;
  let translation = pattern.translation;

  // Replace $1, $2, etc. with captured groups
  for (let i = 1; i < matches.length; i++) {
    translation = translation.replace(`$${i}`, matches[i] || '');
  }

  return translation;
}
```

---

## frontend/src/error-mapping/error-mapper.ts

```typescript
/**
 * Error Mapper
 * 
 * Maps HA errors to ST source locations and provides user-friendly messages.
 */

import type {
  HALogEntry,
  HAAutomationError,
  MappedError,
  CodeSnippet,
} from './error-types';
import type { SourceMap, SourceMapEntry } from '../sourcemap/source-map-types';
import { SourceMapReader } from '../sourcemap/source-map';
import { findMatchingPattern, translateMessage } from './error-patterns';

// ============================================================================
// Error Mapper
// ============================================================================

export class ErrorMapper {
  private sourceMapsByAutomation: Map<string, SourceMapReader> = new Map();
  private sourceFileContents: Map<string, string> = new Map();

  // ==========================================================================
  // Registration
  // ==========================================================================

  /**
   * Register a source map for an automation
   */
  registerSourceMap(automationId: string, sourceMap: SourceMap): void {
    this.sourceMapsByAutomation.set(automationId, new SourceMapReader(sourceMap));
  }

  /**
   * Register source file content for code snippets
   */
  registerSourceFile(fileName: string, content: string): void {
    this.sourceFileContents.set(fileName, content);
  }

  // ==========================================================================
  // Error Parsing
  // ==========================================================================

  /**
   * Parse a raw HA log entry into structured error
   */
  parseLogEntry(entry: HALogEntry): HAAutomationError | null {
    // Extract automation ID from message or context
    const automationId = this.extractAutomationId(entry);
    if (!automationId) return null;

    // Only process ST-generated automations
    if (!automationId.startsWith('st_')) return null;

    return {
      automationId,
      message: entry.message,
      yamlPath: this.extractYamlPath(entry),
      logEntry: entry,
    };
  }

  /**
   * Extract automation ID from log entry
   */
  private extractAutomationId(entry: HALogEntry): string | null {
    // Try context first
    if (entry.context?.automation_id) {
      return String(entry.context.automation_id);
    }

    // Try to extract from message
    const patterns = [
      /automation[:\s]+([a-z0-9_]+)/i,
      /Error while executing automation ([a-z0-9_]+)/i,
      /\[ST\]\s+(\w+)/,
    ];

    for (const pattern of patterns) {
      const match = entry.message.match(pattern);
      if (match) {
        return match[1].toLowerCase();
      }
    }

    return null;
  }

  /**
   * Extract YAML path from log entry
   */
  private extractYamlPath(entry: HALogEntry): string | undefined {
    // Some errors include the path
    const pathMatch = entry.message.match(/at path[:\s]+([a-z0-9_.]+)/i);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Check context
    if (entry.context?.path) {
      return String(entry.context.path);
    }

    return undefined;
  }

  // ==========================================================================
  // Error Mapping
  // ==========================================================================

  /**
   * Map an HA error to ST source location
   */
  mapError(error: HAAutomationError): MappedError {
    const reader = this.sourceMapsByAutomation.get(error.automationId);
    
    // Get source location
    let stLocation: MappedError['stLocation'];
    if (reader && error.yamlPath) {
      const entry = reader.lookup(error.yamlPath);
      if (entry) {
        stLocation = entry.st;
      }
    }

    // Translate message
    const patternMatch = findMatchingPattern(error.message);
    const translatedMessage = translateMessage(error.message);

    // Generate code snippet
    let codeSnippet: CodeSnippet | undefined;
    if (stLocation) {
      codeSnippet = this.generateCodeSnippet(stLocation);
    }

    return {
      original: error,
      translatedMessage,
      stLocation,
      codeSnippet,
      suggestions: patternMatch?.pattern.suggestions,
      docLinks: patternMatch?.pattern.docLinks,
    };
  }

  /**
   * Map a raw log entry directly
   */
  mapLogEntry(entry: HALogEntry): MappedError | null {
    const error = this.parseLogEntry(entry);
    if (!error) return null;
    return this.mapError(error);
  }

  // ==========================================================================
  // Code Snippets
  // ==========================================================================

  /**
   * Generate a code snippet around the error location
   */
  private generateCodeSnippet(
    location: MappedError['stLocation'],
    contextLines: number = 2
  ): CodeSnippet | undefined {
    if (!location) return undefined;

    const content = this.sourceFileContents.get(location.file);
    if (!content) return undefined;

    const allLines = content.split('\n');
    const errorLine = location.line;
    
    const startLine = Math.max(1, errorLine - contextLines);
    const endLine = Math.min(allLines.length, errorLine + contextLines);

    const lines: CodeSnippet['lines'] = [];
    for (let i = startLine; i <= endLine; i++) {
      lines.push({
        number: i,
        content: allLines[i - 1] || '',
        isError: i === errorLine,
      });
    }

    return {
      lines,
      highlightRange: location.column && location.endColumn
        ? { start: location.column, end: location.endColumn }
        : undefined,
    };
  }
}

// ============================================================================
// Error Display Formatter
// ============================================================================

export class ErrorDisplayFormatter {
  
  /**
   * Format error for console/log display
   */
  formatForConsole(error: MappedError): string {
    const lines: string[] = [];
    
    // Header
    if (error.stLocation) {
      lines.push(`❌ Fehler in ${error.stLocation.file} Zeile ${error.stLocation.line}:`);
    } else {
      lines.push(`❌ Fehler:`);
    }
    
    // Translated message
    lines.push(`   ${error.translatedMessage}`);
    lines.push('');
    
    // Code snippet
    if (error.codeSnippet) {
      for (const line of error.codeSnippet.lines) {
        const prefix = line.isError ? ' → ' : '   ';
        const lineNum = String(line.number).padStart(3, ' ');
        lines.push(`${prefix}${lineNum} │ ${line.content}`);
        
        // Highlight marker
        if (line.isError && error.codeSnippet.highlightRange) {
          const { start, end } = error.codeSnippet.highlightRange;
          const marker = ' '.repeat(start + 7) + '^'.repeat(end - start);
          lines.push(`   ${marker}`);
        }
      }
      lines.push('');
    }
    
    // Suggestions
    if (error.suggestions && error.suggestions.length > 0) {
      lines.push('💡 Vorschläge:');
      for (const suggestion of error.suggestions) {
        lines.push(`   • ${suggestion}`);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Format error for UI display (HTML)
   */
  formatForUI(error: MappedError): string {
    let html = '<div class="st-error">';
    
    // Header
    if (error.stLocation) {
      html += `<div class="st-error-header">`;
      html += `<span class="st-error-icon">❌</span>`;
      html += `<span class="st-error-location">${error.stLocation.file}:${error.stLocation.line}</span>`;
      html += `</div>`;
    }
    
    // Message
    html += `<div class="st-error-message">${this.escapeHtml(error.translatedMessage)}</div>`;
    
    // Code snippet
    if (error.codeSnippet) {
      html += '<pre class="st-error-code">';
      for (const line of error.codeSnippet.lines) {
        const cls = line.isError ? 'st-error-line' : '';
        html += `<code class="${cls}">`;
        html += `<span class="st-line-number">${line.number}</span>`;
        html += this.escapeHtml(line.content);
        html += '</code>\n';
      }
      html += '</pre>';
    }
    
    // Suggestions
    if (error.suggestions && error.suggestions.length > 0) {
      html += '<div class="st-error-suggestions">';
      html += '<div class="st-suggestions-header">💡 Vorschläge:</div>';
      html += '<ul>';
      for (const suggestion of error.suggestions) {
        html += `<li>${this.escapeHtml(suggestion)}</li>`;
      }
      html += '</ul></div>';
    }
    
    html += '</div>';
    return html;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

// ============================================================================
// Live Error Monitor
// ============================================================================

export class LiveErrorMonitor {
  private errorMapper: ErrorMapper;
  private formatter: ErrorDisplayFormatter;
  private callbacks: Array<(error: MappedError) => void> = [];
  private wsConnection: any; // HA WebSocket connection

  constructor(errorMapper: ErrorMapper) {
    this.errorMapper = errorMapper;
    this.formatter = new ErrorDisplayFormatter();
  }

  /**
   * Connect to HA log stream
   */
  async connect(hass: any): Promise<void> {
    this.wsConnection = hass.connection;
    
    // Subscribe to system log
    await this.wsConnection.subscribeMessage(
      (message: any) => this.handleLogMessage(message),
      { type: 'system_log/subscribe' }
    );
  }

  /**
   * Register callback for new errors
   */
  onError(callback: (error: MappedError) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const idx = this.callbacks.indexOf(callback);
      if (idx >= 0) this.callbacks.splice(idx, 1);
    };
  }

  /**
   * Handle incoming log message
   */
  private handleLogMessage(message: any): void {
    if (message.level !== 'ERROR' && message.level !== 'WARNING') {
      return;
    }

    const entry: HALogEntry = {
      level: message.level,
      timestamp: message.timestamp,
      logger: message.name,
      message: message.message,
      exception: message.exception,
    };

    const mappedError = this.errorMapper.mapLogEntry(entry);
    if (mappedError) {
      for (const callback of this.callbacks) {
        callback(mappedError);
      }
    }
  }
}
```

---

## frontend/src/__tests__/source-map.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { SourceMapBuilder, SourceMapReader } from '../sourcemap/source-map';

describe('Source Map', () => {
  
  describe('SourceMapBuilder', () => {
    
    it('records mappings at current path', () => {
      const builder = new SourceMapBuilder({
        project: 'home',
        program: 'Test',
        sourceFile: 'test.st',
        sourceContent: 'PROGRAM Test\nEND_PROGRAM',
      });
      
      builder.pushPath('action');
      builder.pushPath('0');
      builder.record({ file: 'test.st', line: 5, column: 1 }, 'IF statement');
      
      const result = builder.build('st_test');
      
      expect(result.mappings['action.0']).toBeDefined();
      expect(result.mappings['action.0'].st.line).toBe(5);
    });

    it('handles nested paths', () => {
      const builder = new SourceMapBuilder({
        project: 'home',
        program: 'Test',
        sourceFile: 'test.st',
        sourceContent: '',
      });
      
      builder.withPath('action', () => {
        builder.withPath('0', () => {
          builder.withPath('choose', () => {
            builder.record({ file: 'test.st', line: 10, column: 1 });
          });
        });
      });
      
      const result = builder.build('st_test');
      expect(result.mappings['action.0.choose']).toBeDefined();
    });

    it('generates source hash', () => {
      const builder = new SourceMapBuilder({
        project: 'home',
        program: 'Test',
        sourceFile: 'test.st',
        sourceContent: 'some content',
      });
      
      const result = builder.build('st_test');
      expect(result.sourceHash).toBeDefined();
    });
  });

  describe('SourceMapReader', () => {
    
    it('looks up exact path', () => {
      const sourceMap = {
        version: 1 as const,
        project: 'home',
        program: 'Test',
        automationId: 'st_test',
        generatedAt: new Date().toISOString(),
        mappings: {
          'action.0': { st: { file: 'test.st', line: 5, column: 1 } },
        },
      };
      
      const reader = new SourceMapReader(sourceMap);
      const result = reader.lookup('action.0');
      
      expect(result?.st.line).toBe(5);
    });

    it('falls back to parent path', () => {
      const sourceMap = {
        version: 1 as const,
        project: 'home',
        program: 'Test',
        automationId: 'st_test',
        generatedAt: new Date().toISOString(),
        mappings: {
          'action.0': { st: { file: 'test.st', line: 5, column: 1 } },
        },
      };
      
      const reader = new SourceMapReader(sourceMap);
      const result = reader.lookup('action.0.choose.0.sequence');
      
      expect(result?.st.line).toBe(5);
    });

    it('returns null for unknown path', () => {
      const sourceMap = {
        version: 1 as const,
        project: 'home',
        program: 'Test',
        automationId: 'st_test',
        generatedAt: new Date().toISOString(),
        mappings: {},
      };
      
      const reader = new SourceMapReader(sourceMap);
      const result = reader.lookup('unknown.path');
      
      expect(result).toBeNull();
    });
  });
});
```

---

## frontend/src/__tests__/error-mapper.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { ErrorMapper, ErrorDisplayFormatter } from '../error-mapping/error-mapper';
import { translateMessage, findMatchingPattern } from '../error-mapping/error-patterns';

describe('Error Mapping', () => {
  
  describe('Error Patterns', () => {
    
    it('translates undefined variable error', () => {
      const message = "UndefinedError: 'sensor_temp' is undefined";
      const result = translateMessage(message);
      
      expect(result).toContain('sensor_temp');
      expect(result).toContain('nicht definiert');
    });

    it('translates float conversion error', () => {
      const message = "could not convert string to float: 'unavailable'";
      const result = translateMessage(message);
      
      expect(result).toContain('unavailable');
      expect(result).toContain('Zahl');
    });

    it('provides suggestions for known errors', () => {
      const message = "UndefinedError: 'myVar' is undefined";
      const result = findMatchingPattern(message);
      
      expect(result).not.toBeNull();
      expect(result?.pattern.suggestions).toBeDefined();
      expect(result?.pattern.suggestions?.length).toBeGreaterThan(0);
    });

    it('returns original for unknown errors', () => {
      const message = "Some completely unknown error";
      const result = translateMessage(message);
      
      expect(result).toBe(message);
    });
  });

  describe('ErrorMapper', () => {
    
    it('maps errors with source maps', () => {
      const mapper = new ErrorMapper();
      
      mapper.registerSourceMap('st_test', {
        version: 1,
        project: 'home',
        program: 'Test',
        automationId: 'st_test',
        generatedAt: new Date().toISOString(),
        mappings: {
          'action.0': { st: { file: 'test.st', line: 7, column: 1 } },
        },
      });
      
      const error = mapper.mapError({
        automationId: 'st_test',
        message: "UndefinedError: 'x' is undefined",
        yamlPath: 'action.0',
        logEntry: {
          level: 'ERROR',
          timestamp: new Date().toISOString(),
          logger: 'homeassistant',
          message: "UndefinedError: 'x' is undefined",
        },
      });
      
      expect(error.stLocation?.line).toBe(7);
    });

    it('generates code snippets', () => {
      const mapper = new ErrorMapper();
      
      mapper.registerSourceFile('test.st', 
`PROGRAM Test
VAR
    x : INT;
END_VAR

IF x > 5 THEN
    y := x;
END_IF;

END_PROGRAM`);
      
      mapper.registerSourceMap('st_test', {
        version: 1,
        project: 'home',
        program: 'Test',
        automationId: 'st_test',
        generatedAt: new Date().toISOString(),
        mappings: {
          'action.0': { st: { file: 'test.st', line: 7, column: 5 } },
        },
      });
      
      const error = mapper.mapError({
        automationId: 'st_test',
        message: "UndefinedError: 'y' is undefined",
        yamlPath: 'action.0',
        logEntry: {
          level: 'ERROR',
          timestamp: new Date().toISOString(),
          logger: 'homeassistant',
          message: "UndefinedError: 'y' is undefined",
        },
      });
      
      expect(error.codeSnippet).toBeDefined();
      expect(error.codeSnippet?.lines.find(l => l.isError)).toBeDefined();
    });
  });

  describe('ErrorDisplayFormatter', () => {
    
    it('formats error for console', () => {
      const formatter = new ErrorDisplayFormatter();
      
      const output = formatter.formatForConsole({
        original: {
          automationId: 'st_test',
          message: 'test error',
          logEntry: { level: 'ERROR', timestamp: '', logger: '', message: '' },
        },
        translatedMessage: 'Übersetzter Fehler',
        stLocation: { file: 'test.st', line: 7, column: 1 },
        suggestions: ['Suggestion 1'],
      });
      
      expect(output).toContain('test.st');
      expect(output).toContain('7');
      expect(output).toContain('Übersetzter Fehler');
    });
  });
});
```

---

## Integration in Transpiler

```typescript
// In transpiler.ts erweitern

import { SourceMapBuilder } from '../sourcemap/source-map';

class Transpiler {
  private sourceMap: SourceMapBuilder;

  transpile(ast: ProgramNode, sourceContent: string): TranspilerResult {
    // Source Map initialisieren
    this.sourceMap = new SourceMapBuilder({
      project: this.context.projectName,
      program: this.context.programName,
      sourceFile: `${this.context.programName}.st`,
      sourceContent,
    });

    // Bei jeder Action die Location aufzeichnen
    this.sourceMap.pushPath('action');
    const actions = this.transpileStatements(ast.body);
    this.sourceMap.popPath();

    // Source Map in Variables einbetten
    const variables = {
      ...this.generateVariables(),
      ...this.sourceMap.buildEmbedded(),
    };

    return {
      automation,
      script: { ...script, variables },
      helpers,
      sourceMap: this.sourceMap.build(automationId, scriptId),
      diagnostics: this.diagnostics,
    };
  }

  private transpileIfStatement(stmt: IfStatement): HAAction {
    // Location aufzeichnen
    this.sourceMap.recordNode(stmt, 'IF statement');
    
    // ... rest of transpilation
  }
}
```

---

## Erfolgskriterien

- [ ] Source Map wird während Transpilation generiert
- [ ] YAML Pfade werden korrekt auf ST Zeilen gemappt
- [ ] Bekannte Fehlermuster werden übersetzt
- [ ] Code Snippets zeigen relevanten Kontext
- [ ] Suggestions werden für bekannte Fehler angezeigt
- [ ] Source Hash validiert Änderungen
- [ ] Alle Tests bestehen

---

## Nicht in diesem Task

- Live Error Monitor WebSocket Integration (erfordert HA Log Subscription)
- Historische Fehleranalyse
- Automatische Fix-Vorschläge
