# Changelog

All notable changes to ST for Home Assistant will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2026-01-21

### Added
- **Entity Browser**: Sidebar panel listing all Home Assistant entities with WebSocket integration
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

### Changed
- Bundle size optimization: Reduced initial load from 980 KB to 856 KB (12.6% reduction)
- Implemented code splitting with 10 separate chunks for optimal loading
- Lazy loading for entity browser, project explorer, and transpiler/deploy modules

## [0.1.6.4] - 2026-01-14

### Fixed
- Fixed bug in `IF` statement autocomplete template that added an incorrect semicolon

## [0.1.6.3] - 2026-01-14

### Changed
- Made selection highlighting semi-transparent so text remains visible

## [0.1.6.2] - 2026-01-14

### Changed
- Improved selection highlighting CSS with multiple fallback selectors

## [0.1.6.1] - 2026-01-14

### Fixed
- Fixed selection highlighting visibility in editor

## [0.1.6] - 2026-01-14

### Fixed
- Fixed keyboard input issue where Home Assistant shortcuts (a, m, etc.) intercepted keystrokes in the editor

## [0.1.5] - 2026-01-14

### Fixed
- Fixed CodeMirror initialization with async/await
- Used direct shadowRoot query instead of @query decorator

## [0.1.2] - 2026-01-14

### Changed
- Included frontend files in git for HACS distribution

## [0.1.0] - 2026-01-14

### Added
- Initial release
- Structured Text (IEC 61131-3) code editor with syntax highlighting
- Full parser supporting all IEC 61131-3 ST features
- Dependency analyzer for automatic trigger generation
- Storage analyzer for persistent variable management
- Transpiler converting ST to Home Assistant automations
- Timer function blocks (TON, TOF, TP)
- Online mode with live entity value display
- Transactional deployment with backup and rollback
- Source maps for error mapping
- Error translation from HA errors to ST context

[1.7.0]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v1.7.0
[0.1.6.4]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6.4
[0.1.6.3]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6.3
[0.1.6.2]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6.2
[0.1.6.1]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6.1
[0.1.6]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6
[0.1.5]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.5
[0.1.2]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.2
[0.1.0]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.0
