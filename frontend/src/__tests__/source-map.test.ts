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
