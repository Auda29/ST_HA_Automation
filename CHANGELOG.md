# Changelog

All notable changes to ST for Home Assistant will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2026-04-22

### Fixed
- Deploy now surfaces visible error feedback even when users click Deploy with syntax errors or no Home Assistant connection
- Restored projects immediately reopen the active file tab and refresh diagnostics, trigger counts, and entity analysis on load
- Project files no longer stay permanently marked as unsaved after a successful save cycle

## [2.1.1] - 2026-04-22

### Fixed
- File deletion from the project explorer now reaches the panel state correctly, so trash-button and `Delete` key flows work again in multi-file projects
- Deploy now creates the logic script under the entity ID actually referenced by the generated automation
- Timer follow-up automations returned by the transpiler are now included in deployment operations
- `{throttle: ...}` now creates the required `input_datetime` helper instead of referencing a missing entity at runtime
- GitHub E2E runs now boot against a tracked prepared Home Assistant fixture instead of an ignored local-only config, making CI reproducible and green

## [2.1.0] - 2026-04-22

### Changed
- Reworked the Home Assistant panel shell into the intended industrial UI treatment instead of the previous mostly-legacy layout
- Redesigned the top toolbar, online mode controls, project explorer, file tree, entity browser, and entity list so the shipped interface now reflects the new visual direction end to end
- Consolidated the shared frontend design tokens in `colors_and_type.css` and wired them into the panel components that actually render in Home Assistant

### Fixed
- File rename propagation remains correct after the project explorer redesign
- Entity data-type inference still returns the expected `INT`/`REAL`/`STRING` classifications after the UI refactor
- Frontend release artifacts were rebuilt so the HACS package matches the updated UI implementation

## [2.0.3] - 2026-04-22

### Fixed
- Home Assistant panel assets now use a versioned `module_url`, so HACS/browser updates actually load the new frontend bundle instead of serving a stale cached `st-panel.js`

## [2.0.2] - 2026-04-22

### Fixed
- The Claude design-system polish is now actually loaded in Home Assistant instead of being left as an unused frontend CSS file
- Panel, online toolbar, and project explorer styling now use the shared UI variables so the shipped HACS build matches the intended visual refresh

## [2.0.1] - 2026-04-22

### Fixed
- Deploy and online mode now use the active file in multi-file projects instead of a stale legacy buffer
- Online mode can now be started from the UI because the toolbar is visible in the disconnected state
- Frontend test/build configuration no longer fails hard when `rollup-plugin-visualizer` is not installed
- E2E Docker test setup now mounts the repository `custom_components` so release smoke tests exercise the current integration build

### Changed
- Frontend test suite now scopes Vitest to `src/**/*.test.ts`, avoiding accidental execution of Playwright specs
- CI and E2E workflow triggers now include `master` in addition to `main` and `dev`
- Documentation and manual testing notes were updated to match the current panel, online toolbar, and release process

## [2.0.0] - 2026-01-26

### Added
- **End-to-End Integration Tests**: Full-stack E2E tests with Docker Home Assistant instance
  - 7 E2E tests covering deploy workflow, automation execution, and online mode
  - Docker-based test environment with pre-configured entities
  - CI integration for automated E2E testing
- **HACS Publication Preparation**: Repository ready for HACS default repository submission
  - Complete HACS manifest and store description
  - Release workflow automation
  - HACS Action and Hassfest validation in CI

### Changed
- Version bumped to 2.0.0 for official HACS release milestone
- All 194 unit tests passing
- CI pipeline fully green (Frontend Tests and Python Validation)

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

[2.1.2]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v2.1.2
[2.1.1]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v2.1.1
[2.1.0]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v2.1.0
[2.0.3]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v2.0.3
[2.0.0]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v2.0.0
[2.0.2]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v2.0.2
[2.0.1]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v2.0.1
[1.7.0]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v1.7.0
[0.1.6.4]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6.4
[0.1.6.3]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6.3
[0.1.6.2]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6.2
[0.1.6.1]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6.1
[0.1.6]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.6
[0.1.5]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.5
[0.1.2]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.2
[0.1.0]: https://github.com/Auda29/ST_HA_Automation/releases/tag/v0.1.0
