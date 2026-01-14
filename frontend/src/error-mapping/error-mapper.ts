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
import type { SourceMap } from '../sourcemap/source-map-types';
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
