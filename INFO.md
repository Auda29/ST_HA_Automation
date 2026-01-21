# ST for Home Assistant

**Current Version: 1.8.0**

## Recent Changes

### 1.8.0
- **WebSocket API Fix**: Changed from deprecated `callWS` to `sendMessagePromise` for Home Assistant WebSocket communication
- **Comprehensive Manual Testing**: All core editor features tested and verified working:
  - Multi-cursor editing (Ctrl+Click): WORKS
  - IF template autocomplete: WORKS
  - Read-only mode (`editor.readOnly = true`): WORKS
  - API methods (`getCode()`, `setCode()`, `focus()`): WORKS
  - `code-change` event firing: WORKS
  - Special characters (German umlauts äöü, symbols €@#$%): WORKS
  - IEC 61131-3 literals (TIME T#5s, HEX 16#FF, BINARY 2#10101010): WORKS
  - Keyboard shortcuts (Tab, Shift+Tab, Ctrl+/): WORKS
- **Known Issues Documented**:
  - Code folding (Ctrl+Shift+[/]) not working - CodeMirror extension may need configuration
  - Deploy functionality requires further investigation

### 1.7.1
- Fixed Entity Browser WebSocket connection issue (subscribeEntities API)
- Fixed sidebar visibility with improved CSS handling
- Rebuilt frontend bundle with TypeScript build error fixes

### 1.7.0
- **Entity Browser**: New sidebar panel listing all Home Assistant entities with WebSocket integration
  - Real-time entity state updates via WebSocket subscription
  - Entities grouped by domain (light, sensor, binary_sensor, switch, etc.)
  - Search and filter functionality to find entities by name or ID
  - Drag-and-drop from entity list to editor inserts proper AT binding syntax
  - Entity icons and current state displayed
  - Automatic data type inference (BOOL for binary_sensor, REAL for numeric sensor)
  - Optimized performance for 500+ entities
- **Project Explorer and Multi-File Support**: Extended editor to support multiple ST program files
  - File tree sidebar showing all ST files in the project
  - Tabbed interface for switching between open files
  - New file, rename, and delete operations
  - Project structure persisted in localStorage (survives HA restarts)
  - Unsaved changes indicator on tabs
  - Backward compatible with single-file mode

### 0.1.6.4
- Fixed bug in `IF` statement autocomplete template that added an incorrect semicolon.

### 0.1.6.3
- Made selection highlighting semi-transparent so text remains visible

### 0.1.6.2
- Improved selection highlighting CSS with multiple fallback selectors

### 0.1.6.1
- Fixed selection highlighting visibility in editor

### 0.1.6
- Fixed keyboard input issue where Home Assistant shortcuts (a, m, etc.) intercepted keystrokes in the editor

### 0.1.5
- Fixed CodeMirror initialization with async/await
- Used direct shadowRoot query instead of @query decorator

### 0.1.2
- Included frontend files in git for HACS distribution

## Features

- Structured Text (IEC 61131-3) code editor
- Syntax highlighting for ST keywords, types, functions
- Autocompletion with templates
- TwinCAT-inspired dark theme
- Live value display in online mode
- Entity Browser with drag-and-drop entity binding
- Multi-file project support with file tree and tabs