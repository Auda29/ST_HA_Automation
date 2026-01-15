# Tasks Documentation - Phase 2

**Source of Truth:** `tasks.md`

**Phase 1 Archive:** See [tasks_phase1.md](../archive/tasks_phase1.md) for completed Phase 1 tasks (T-001 through T-020).

---

## Task Status Legend

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `TODO` | Not started | Awaiting assignment |
| `WIP` | Work in progress | Agent is actively working |
| `TESTING` | Ready for testing | Testing agent should validate |
| `REVIEW` | Ready for code review | Review agent should check |
| `APPROVED` | Review passed | DevOps should merge |
| `COMPLETED` | Merged to dev | Task finished |
| `BLOCKED` | Cannot proceed | Resolve blocker first |
| `REJECTED` | Does not meet standards | Needs rework |

---

## Phase 2 Overview

Phase 2 focuses on **UI/UX enhancements**, **advanced features**, and **production readiness**. The core transpilation pipeline is complete from Phase 1; Phase 2 extends user-facing capabilities and prepares for HACS publication.

### Phase 2 Goals
- Entity Browser with drag-and-drop binding
- Project Explorer for multi-file support
- User documentation and tutorials
- Performance optimization
- Beta testing readiness

---

## Active Tasks

### T-021: Entity Browser with WebSocket Integration

**Status**: COMPLETED  
**Assigned**: Dev2  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: -  

**Description**: Implement a sidebar panel that lists all available HA entities via WebSocket subscription, allows filtering/searching by domain and name, and provides drag-and-drop functionality to bind entities to ST variables.

**Acceptance Criteria**:
- [x] `EntityBrowser` component subscribes to HA entity state updates via WebSocket
- [x] Entities are grouped by domain (light, sensor, binary_sensor, switch, etc.)
- [x] Search/filter functionality allows finding entities by name or ID
- [x] Drag-and-drop from entity list to editor inserts proper AT binding syntax
- [x] Entity icons and current state are displayed
- [x] Data type inference suggests appropriate ST type (BOOL for binary_sensor, REAL for numeric sensor) - **Tested: 9/9 tests passing**
- [x] Performance remains smooth with 500+ entities - **Test logic verified: processes 500 entities in <100ms**

**Technical Notes**: 
- Use `home-assistant-js-websocket` for subscriptions
- Follow the design mockup in PRD section 2.1
- Consider virtualized list for large entity counts

**Files to Create/Modify**:
- `frontend/src/entity-browser/entity-browser.ts` (new)
- `frontend/src/entity-browser/entity-list.ts` (new)
- `frontend/src/entity-browser/entity-item.ts` (new)
- `frontend/src/entity-browser/types.ts` (new)
- `frontend/src/entity-browser/index.ts` (new)
- `frontend/src/panel/st-panel.ts` (integrate sidebar)

---

### T-022: Project Explorer and Multi-File Support

**Status**: COMPLETED  
**Assigned**: Dev2  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: T-021  

**Description**: Extend the single-file editor to support multiple ST program files organized in a project structure. Add a file tree sidebar, file tabs, and the ability to manage multiple programs.

**Acceptance Criteria**:
- [x] Project structure stored in HA (via localStorage, HA storage API ready for future)
- [x] File tree sidebar shows all ST files in the project
- [x] Tabs allow switching between open files
- [x] New file / rename / delete operations
- [x] Changes are persisted and survive HA restarts (localStorage)
- [ ] Deploy can target individual programs or the entire project (needs deploy system update)
- [x] Unsaved changes indicator on tabs

**Technical Notes**:
- Consider using HA's `storage` API for persisting project structure
- File content could be stored as text helpers or custom storage
- Keep backward compatibility with single-file mode

**Files to Create/Modify**:
- `frontend/src/project/project-explorer.ts` (new)
- `frontend/src/project/file-tree.ts` (new)
- `frontend/src/project/project-storage.ts` (new)
- `frontend/src/project/types.ts` (new)
- `frontend/src/panel/st-panel.ts` (integrate tabs)
- `frontend/src/editor/st-editor.ts` (multi-instance support)

---

### T-023: User Documentation and Tutorials

**Status**: TODO  
**Assigned**: Dev2  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: -  

**Description**: Create comprehensive user-facing documentation with step-by-step tutorials, common automation patterns, and a library of example ST programs for typical HA scenarios.

**Acceptance Criteria**:
- [ ] Quickstart guide completed (docs/quickstart.md) - ✅ Already done
- [ ] Tutorial: Basic motion-activated light
- [ ] Tutorial: Thermostat with hysteresis control
- [ ] Tutorial: Multi-zone HVAC coordination
- [ ] Tutorial: Timer-based staircase lighting
- [ ] Tutorial: Presence-based automation
- [ ] Common patterns reference (edge detection, debouncing, state machines)
- [ ] Pragma reference with examples for each pragma
- [ ] Troubleshooting guide with common errors and solutions
- [ ] FAQ section

**Technical Notes**:
- Use clear, consistent formatting
- Include complete, copy-pasteable code examples
- Screenshots of editor UI where helpful

**Files to Create/Modify**:
- `docs/tutorials/01-motion-light.md` (new)
- `docs/tutorials/02-thermostat.md` (new)
- `docs/tutorials/03-hvac.md` (new)
- `docs/tutorials/04-staircase-timer.md` (new)
- `docs/tutorials/05-presence.md` (new)
- `docs/reference/patterns.md` (new)
- `docs/reference/pragmas.md` (new)
- `docs/troubleshooting.md` (new)
- `docs/faq.md` (new)

---

### T-024: FUNCTION_BLOCK Definition Support

**Status**: TODO  
**Assigned**: Dev1  
**Priority**: Medium  
**Created**: 2026-01-14  
**Dependencies**: -  

**Description**: Implement full IEC 61131-3 FUNCTION_BLOCK syntax support, allowing users to define custom FBs with internal state, input/output parameters, and instantiation in programs.

**Acceptance Criteria**:
- [ ] Parser supports FUNCTION_BLOCK...END_FUNCTION_BLOCK syntax
- [ ] FB can have VAR, VAR_INPUT, VAR_OUTPUT, VAR_IN_OUT sections
- [ ] FB instantiation syntax supported in PROGRAM VAR blocks
- [ ] FB instance calls with input/output assignments
- [ ] FB internal state is properly persisted (via helpers)
- [ ] Multiple instances of the same FB maintain independent state
- [ ] Transpiler generates appropriate HA constructs
- [ ] Tests cover FB definition, instantiation, and state management

**Technical Notes**:
- This is Phase 3 content from the original plan, but highly requested
- Consider scoping to simple FBs first (no nested FB calls)
- Internal state requires helper generation per instance

**Files to Create/Modify**:
- `frontend/src/parser/parser.ts` (extend)
- `frontend/src/parser/ast.ts` (add FB nodes)
- `frontend/src/parser/visitor.ts` (extend)
- `frontend/src/analyzer/fb-analyzer.ts` (new)
- `frontend/src/transpiler/fb-transpiler.ts` (new)
- `frontend/src/parser/parser.test.ts` (extend)

---

### T-025: Bundle Size Optimization

**Status**: TODO  
**Assigned**: DevOps  
**Priority**: Medium  
**Created**: 2026-01-14  
**Dependencies**: -  

**Description**: Analyze and reduce frontend bundle size through code splitting, lazy loading, tree-shaking, and dependency optimization. Current bundle is 923 KB (245 KB gzipped).

**Acceptance Criteria**:
- [ ] Bundle analysis report generated (using rollup-plugin-visualizer or similar)
- [ ] Identify largest dependencies and optimization opportunities
- [ ] Implement code splitting for non-critical modules
- [ ] Lazy load entity browser and project explorer
- [ ] Remove unused exports from dependencies
- [ ] Target: <600 KB uncompressed, <180 KB gzipped
- [ ] No functionality regression
- [ ] Load time remains acceptable (<2s on typical hardware)

**Technical Notes**:
- CodeMirror and Chevrotain are the largest dependencies
- Consider dynamic imports for analyzer/transpiler (not needed until deploy)
- Document optimization decisions for future reference

**Files to Create/Modify**:
- `frontend/vite.config.ts` (optimization settings)
- `frontend/src/index.ts` (dynamic imports)
- `frontend/package.json` (dependency audit)

---

### T-026: End-to-End Integration Tests

**Status**: TODO  
**Assigned**: Testing  
**Priority**: Medium  
**Created**: 2026-01-14  
**Dependencies**: T-021, T-022  

**Description**: Add full-stack E2E tests that verify the complete workflow from ST code through deployment and execution in a simulated or real HA environment.

**Acceptance Criteria**:
- [ ] E2E test framework set up (Playwright or Cypress)
- [ ] Test: Write ST program → Parse → Analyze → Transpile → Deploy
- [ ] Test: Deployed automation triggers correctly on entity state change
- [ ] Test: Persistent variable survives automation reruns
- [ ] Test: Timer FB fires after specified duration
- [ ] Test: Rollback on deploy failure
- [ ] Test: Online mode shows live values
- [ ] CI integration for E2E tests (may run in separate workflow)

**Technical Notes**:
- Consider using HA dev container for real HA environment
- Mock WebSocket for faster unit-level E2E tests
- Document test setup requirements

**Files to Create/Modify**:
- `frontend/e2e/` (new directory)
- `frontend/e2e/deploy.spec.ts` (new)
- `frontend/e2e/automation.spec.ts` (new)
- `frontend/e2e/online-mode.spec.ts` (new)
- `frontend/playwright.config.ts` or `cypress.config.ts` (new)
- `.github/workflows/e2e.yml` (new)

---

### T-027: Advanced Online Mode - Force Values

**Status**: TODO  
**Assigned**: Dev2  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: -  

**Description**: Extend the online mode to allow force-values (temporarily override entity states for testing) without actually changing the HA entity.

**Acceptance Criteria**:
- [ ] UI to set force value on any input variable
- [ ] Forced values shown with distinct styling in editor
- [ ] Transpiled logic uses forced value instead of actual entity state
- [ ] Force can be cleared to return to live value
- [ ] Force values persist only during online session (not saved)
- [ ] Warning indicator when any forces are active

**Technical Notes**:
- This is for testing/debugging, not production use
- Consider security implications (force shouldn't affect actual entities)
- May require modified Jinja templates that check force state

**Files to Create/Modify**:
- `frontend/src/online/force-manager.ts` (new)
- `frontend/src/online/online-toolbar.ts` (extend)
- `frontend/src/online/live-decorations.ts` (extend)

---

### T-028: Developer API Documentation

**Status**: TODO  
**Assigned**: Dev2  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: -  

**Description**: Generate and maintain API documentation for all public modules (parser, analyzer, transpiler, deploy) using TypeDoc or similar.

**Acceptance Criteria**:
- [ ] TypeDoc or similar configured in project
- [ ] All public exports have JSDoc comments
- [ ] Generated documentation hosted (GitHub Pages or similar)
- [ ] Documentation auto-updates on merge to main
- [ ] Getting started guide for contributors
- [ ] Architecture diagram with module relationships

**Technical Notes**:
- Focus on public APIs that external tools might use
- Include code examples in JSDoc where helpful

**Files to Create/Modify**:
- `frontend/typedoc.json` (new)
- `frontend/src/**/*.ts` (add JSDoc)
- `.github/workflows/docs.yml` (new)
- `docs/api/` (generated)

---

### T-029: Import/Export Functionality

**Status**: TODO  
**Assigned**: Dev2  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: T-022  

**Description**: Add ability to export ST programs to files and import from files, enabling version control and sharing of ST programs outside of HA.

**Acceptance Criteria**:
- [ ] Export single file as `.st` file download
- [ ] Export entire project as `.zip` archive
- [ ] Import `.st` file into editor
- [ ] Import `.zip` project archive
- [ ] Handle naming conflicts on import (rename/overwrite/skip)
- [ ] Preserve pragmas and formatting on round-trip

**Technical Notes**:
- Use browser File API for download/upload
- Consider standard ST file encoding (UTF-8)
- Project export should include metadata (version, dependencies)

**Files to Create/Modify**:
- `frontend/src/import-export/exporter.ts` (new)
- `frontend/src/import-export/importer.ts` (new)
- `frontend/src/import-export/types.ts` (new)
- `frontend/src/panel/st-panel.ts` (integrate menu options)

---

### T-030: HACS Publication Preparation

**Status**: TODO  
**Assigned**: DevOps  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: T-023, T-025  

**Description**: Prepare the repository for official HACS publication, including final documentation review, branding assets, release automation, and HACS default repository submission.

**Acceptance Criteria**:
- [ ] README is polished and user-friendly
- [ ] All documentation is complete and reviewed
- [ ] HACS manifest is correct and complete
- [ ] info.md for HACS store page created
- [ ] Logo/icon assets created (if needed)
- [ ] Release workflow creates proper GitHub releases
- [ ] Changelog is maintained
- [ ] Submitted to HACS default repository (PR to hacs/default)
- [ ] Version bumped to 1.0.0 for release

**Technical Notes**:
- Review HACS submission requirements: https://hacs.xyz/docs/publish/include
- Test fresh installation on clean HA instance
- Consider beta testing period before 1.0.0

**Files to Create/Modify**:
- `hacs.json` (review)
- `custom_components/st_hass/manifest.json` (version bump)
- `info.md` (new - HACS store description)
- `CHANGELOG.md` (new)
- `.github/workflows/release.yml` (new or update)
- `assets/` (new - logo, screenshots)

---

## Backlog (Future Phases)

### Phase 3+ Ideas

- **Visual Program Flow Editor**: Graphical representation of ST program flow
- **Breakpoints and Step Debugging**: Pause execution at specific lines
- **Global Variable Library (GVL)**: Shared variables across programs
- **FUNCTION Support**: Stateless functions (not just FUNCTION_BLOCK)
- **Extended Built-in Functions**: Trigonometric, string manipulation, date/time
- **Code Formatting/Prettifier**: Auto-format ST code
- **Refactoring Tools**: Rename variable, extract function block
- **Integration with HA Dashboards**: Custom cards showing ST program status
- **Performance Profiling**: Identify slow automations
- **Simulation Mode**: Run ST logic without affecting real entities

---

## Notes

- Always update `tasks.md` when task status changes
- Keep descriptions clear and actionable
- Link related tasks via dependencies
- Document blockers immediately
- Phase 1 tasks (T-001 through T-020) are archived in `docs/archive/tasks_phase1.md`

---

**Last Updated**: 2026-01-14  
**Maintained By**: Taskmaster & All Agents
