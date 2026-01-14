# Tasks Documentation

**Source of Truth:** `tasks.md`
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

## Active Tasks

### T-001: Align repository with foundation & CI plan

**Status**: COMPLETED  
**Assigned**: DevOps  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: -  

**Description**: Review the actual repo against `01_Repository_Setup.md` and `ST_HomeAssistant_Projektplan_final.md`, add/adjust the CI workflow, lint/typecheck/test scripts integration, and ensure HACS/HA metadata and basic docs match the agreed structure.

**Acceptance Criteria**:
- [x] `.github/workflows/ci.yml` runs lint, typecheck, tests and build for frontend
- [x] HACS/manifest metadata match current repository URLs and naming
- [x] README reflects current architecture and phases

**Technical Notes**: Focus on pipeline wiring and configuration, not on feature implementation.

**Files Changed**:
- `.github/workflows/ci.yml`
- `frontend/package.json`
- `README.md`

---

### T-002: Finalize CodeMirror ST editor and UX polish

**Status**: COMPLETED  
**Assigned**: DevOps  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: T-001  

**Description**: Ensure the CodeMirror 6 integration from `02_CodeMirror_Spike.md` matches the planned behavior: ST language mode, TwinCAT-like theme, `st-editor` web component, and updated `st-panel` wiring, including keyboard shortcuts and basic editor ergonomics.

**Acceptance Criteria**:
- [ ] ST keywords, types, pragmas and IO addresses are highlighted as specified
- [ ] `st-editor` wraps CodeMirror with config from the spike and emits `code-change` events
- [ ] `st-panel` uses `st-editor` instead of `<textarea>` and compiles with no TS errors
- [ ] Example program in the spike renders correctly and is editable without lag

**Technical Notes**: Keep bundle size reasonable; do not yet integrate parser/analyzers here.

**Files Changed**:
- `frontend/src/editor/*`
- `frontend/src/panel/st-panel.ts`

---

### T-003: Chevrotain ST parser MVP and tests

**Status**: COMPLETED  
**Assigned**: Dev1  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: T-001, T-002  

**Description**: Implement or align the Chevrotain-based parser as described in `03_Parser_Spike.md`, including tokens, lexer, parser, AST, CST→AST visitor and parser tests, and choose Chevrotain as the primary parser per the project plan.

**Acceptance Criteria**:
- [ ] `frontend/src/parser/*` matches the spike’s feature scope (PROGRAM/VAR blocks, IF/CASE/loops, expressions, pragmas, bindings)
- [ ] `parser.test.ts` covers the scenarios from the spike (pragmas, variables, statements, errors)
- [ ] Public `parse()` API returns AST and error list that downstream modules can consume

**Technical Notes**: Prioritize clear AST shapes that match analyzer/transpiler needs over strict 1:1 with spike types.

**Files Changed**:
- `frontend/src/parser/*`

---

### T-004: Dependency analyzer – automatic trigger generation

**Status**: COMPLETED  
**Assigned**: Dev1  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: T-003  

**Description**: Implement and refine the dependency analyzer from `04_Dependency_Analyzer.md` so it reliably extracts entity dependencies from the AST, applies `{trigger}` / `{no_trigger}` pragmas, detects R_TRIG/F_TRIG edge cases, and emits diagnostic codes as specified.

**Acceptance Criteria**:
- [ ] INPUT bindings with valid entity IDs generate state triggers with `not_from` / `not_to` filters
- [ ] `{trigger}` forces triggers and `{no_trigger}` suppresses them
- [ ] R_TRIG/F_TRIG calls produce rising/falling edge trigger configs where applicable
- [ ] Diagnostics cover NO_TRIGGERS, MANY_TRIGGERS, UNUSED_INPUT, WRITE_TO_INPUT, INVALID_ENTITY_ID with stable codes
- [ ] All tests in `dependency-analyzer.test.ts` pass

**Technical Notes**: Ensure the analyzer’s public types remain stable for the transpiler and UI.

**Files Changed**:
- `frontend/src/analyzer/*`

---

### T-005: Storage analyzer – persistence decisions and helper mapping

**Status**: COMPLETED  
**Assigned**: Dev1  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: T-003, T-004  

**Description**: Implement the storage analyzer from `05_Storage_Analyzer.md` to classify variables as DERIVED/TRANSIENT/PERSISTENT, infer appropriate HA helper types, and produce helper configs plus diagnostics for suspicious persistence patterns.

**Acceptance Criteria**:
- [ ] Entity-bound variables are marked DERIVED and never get helpers
- [ ] Self-referencing, FB-instance, and timer-related vars become PERSISTENT by default
- [ ] `{persistent}` / `{transient}` pragmas override heuristics, with conflicts reported
- [ ] Helper configs follow the namespace convention and encode min/max/step correctly
- [ ] All tests in `storage-analyzer.test.ts` pass

**Technical Notes**: Coordinate helper IDs and types with the transpiler and helper manager.

**Files Changed**:
- `frontend/src/analyzer/*`

---

### T-006: Close gaps between archive specs and implementation

**Status**: COMPLETED  
**Assigned**: Dev1  
**Priority**: Medium  
**Created**: 2026-01-14  
**Dependencies**: T-001–T-005  

**Description**: Use `12_Archive_Feature_Gap_Analysis.md` to reconcile the current implementation with the original spike specs (01–04), deciding for each gap whether to bring code in line with the spec or to update the docs to reflect intentional changes.

**Acceptance Criteria**:
- [x] Each gap in the archive gap analysis is either fixed in code or explicitly updated in docs
- [x] R_TRIG/F_TRIG handling strategy is documented and implemented or explicitly deferred
- [x] Diagnostic code schemes are consistent and documented

**Technical Notes**: This is mainly planning/coordination plus small targeted changes, not a large refactor.

**Files Changed**:
- `docs/archive/*`
- `frontend/src/analyzer/*`

---

### T-007: Transpiler basis – ST AST to HA automation/script

**Status**: COMPLETED  
**Assigned**: Dev1  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: T-004, T-005  

**Description**: Implement the core transpiler as described in `06_Transpiler_Basis.md`: map ST control flow to HA `choose`/`repeat`, handle assignments to entities/helpers/variables, integrate dependency and storage analysis, and generate defensive Jinja templates.

**Acceptance Criteria**:
- [ ] IF/ELSIF/ELSE, CASE, FOR/WHILE/REPEAT map to the expected HA action structures
- [ ] Output assignments result in correct HA service calls; persistent vars use helper services; transient vars use `variables:`
- [ ] Mode/throttle/debounce pragmas influence automation/script as planned
- [ ] Example program from the doc round-trips to the shown YAML (modulo formatting)
- [ ] All `transpiler` tests and type checks pass

**Technical Notes**: Keep a clear separation between trigger automation and logic script per the project plan.

**Files Changed**:
- `frontend/src/transpiler/*`

---

### T-008: Helper manager and transactional deploy system

**Status**: WIP  
**Assigned**: Dev2  
**Priority**: High  
**Created**: 2026-01-14  
**Dependencies**: T-005, T-007  

**Description**: Implement the helper manager and deploy manager from `07_Helper_Manager_Deploy.md`, including HA WebSocket wrappers, helper sync (create/update/delete), backup/restore, and transactional deploy with rollback and verification.

**Acceptance Criteria**:
- [ ] Helper sync computes toCreate/toUpdate/toDelete for ST helpers based on transpiler output
- [ ] Deploy operation applies automation, script, and helper changes atomically, with rollback on error
- [ ] Backups can be created, listed, restored and pruned as described
- [ ] All deploy-related tests and type checks pass

**Technical Notes**: Absolutely no direct YAML file writes; all changes go through HA WebSocket APIs.

**Files Changed**:
- `frontend/src/deploy/*`

---

### T-009: Timer function blocks (TON/TOF/TP) to HA timers

**Status**: TODO  
**Assigned**: Dev1  
**Priority**: Medium  
**Created**: 2026-01-14  
**Dependencies**: T-007, T-008  

**Description**: Implement the timer FB transpiler described in `08_Timer_FBs.md`, mapping TON/TOF/TP instances to HA `timer.*` entities, boolean helper outputs, and dedicated `timer.finished` automations, plus integration into the main transpiler.

**Acceptance Criteria**:
- [ ] TON, TOF and TP generate the expected timer entities, helper IDs and automations
- [ ] `timerInstance.Q` and `ET` are usable in expressions via output mappings
- [ ] Example in the doc (off-delay light) is transpiled into the shown YAML pattern
- [ ] All timer transpiler tests pass

**Technical Notes**: Coordinate helper naming with storage/helper manager and avoid blocking delays.

**Files Changed**:
- `frontend/src/transpiler/*`

---

### T-010: Source maps and HA error mapping to ST

**Status**: TODO  
**Assigned**: Dev1  
**Priority**: Medium  
**Created**: 2026-01-14  
**Dependencies**: T-007, T-008  

**Description**: Implement source-map generation and error mapping per `09_Source_Maps_Error_Mapping.md`, so HA automation/script errors can be translated back to ST file/line with contextual snippets and human-friendly messages.

**Acceptance Criteria**:
- [ ] Transpiler records YAML path → ST source mappings and embeds them where specified
- [ ] Error mapper translates common HA/template errors into German explanations with suggestions
- [ ] Code snippet rendering (console/UI) highlights the relevant ST line and column range
- [ ] All source-map and error-mapper tests pass

**Technical Notes**: Keep the source map format stable for future tooling; avoid heavy runtime overhead.

**Files Changed**:
- `frontend/src/sourcemap/*`
- `frontend/src/error-mapping/*`

---

### T-011: Restore policy and schema migration handling

**Status**: TODO  
**Assigned**: Dev1  
**Priority**: Medium  
**Created**: 2026-01-14  
**Dependencies**: T-005, T-008  

**Description**: Implement the restore-policy system and migration handler from `10_Restore_Policy_Migration.md`, including `{reset_on_restart}` / `{require_restore}` semantics, schema storage, migration detection, and the migration dialog component.

**Acceptance Criteria**:
- [ ] Restore policies are inferred from pragmas and applied to helper-backed variables
- [ ] Schema changes (add/remove/type/range) are detected and surfaced as migration issues
- [ ] `st-migration-dialog` lets users select resolutions and passes them to the executor
- [ ] Migration executor applies conversions/resets/deletions as chosen and reports results

**Technical Notes**: Integrate with helper manager and deploy flow without breaking existing deployments.

**Files Changed**:
- `frontend/src/restore/*`

---

### T-012: Live values and online mode in editor

**Status**: TODO  
**Assigned**: Dev2  
**Priority**: Medium  
**Created**: 2026-01-14  
**Dependencies**: T-007, T-008  

**Description**: Implement the online mode described in `11_Live_Values_Online_Mode.md`, including entity state subscriptions, live value widgets in the editor, an online toolbar, and pause/resume and settings controls.

**Acceptance Criteria**:
- [ ] `OnlineStateManager` subscribes to HA entity updates and tracks bound variable values
- [ ] CodeMirror decorations display formatted live values next to variable declarations
- [ ] Toolbar shows connection status, lets the user connect, pause, stop, and tweak settings
- [ ] All online mode tests pass and the UI remains responsive

**Technical Notes**: Start with read-only live display; force-values and breakpoints are out of scope here.

**Files Changed**:
- `frontend/src/online/*`
- `frontend/src/editor/st-editor.ts`

---

### T-013: Align implementation with high-level project plan

**Status**: TODO  
**Assigned**: Dev2  
**Priority**: Medium  
**Created**: 2026-01-14  
**Dependencies**: T-001–T-012  

**Description**: Use `ST_HomeAssistant_Projektplan_final.md` to ensure the overall implementation (phases, features, and risks) matches the agreed roadmap, updating either code or documentation where reality diverges from the plan.

**Acceptance Criteria**:
- [ ] Each phase in the plan (1–4) maps cleanly to concrete tasks (T-001–T-012)
- [ ] Any intentional deviations from the plan are documented in the docs
- [ ] Open decisions (e.g. parser library choice) are resolved and recorded

**Technical Notes**: This is an umbrella coordination task; it may spawn follow-up tasks if needed.

**Files Changed**:
- `docs/ST_HomeAssistant_Projektplan_final.md`
- `docs/archive/*`

---

### T-014: Align README Python version with CI configuration

**Status**: COMPLETED  
**Assigned**: DevOps  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: T-001  

**Description**: Adjust the documented Python version in `README.md` so it explicitly matches or clearly explains the CI configuration (currently using Python 3.12), keeping developer setup and pipeline expectations consistent.

**Acceptance Criteria**:
- [ ] README states a Python version range that is consistent with the CI `python-version` configuration
- [ ] No other docs contradict the chosen Python version requirement
- [ ] Dev environment instructions remain valid for both local dev and CI

**Technical Notes**: Pure documentation change; no code or CI workflow behavior changes required.

**Files Changed**:
- `README.md`

---

### T-015: Document CodeMirror spike scope vs analyzer integration

**Status**: COMPLETED  
**Assigned**: Dev2  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: T-002, T-004, T-005  

**Description**: Update the spike/docs (especially `02_CodeMirror_Spike.md` and related analyzer docs) to acknowledge that `st-panel.ts` already integrates parsing and dependency analysis, even though the original spike listed that as “Nicht in diesem Task”, and clarify how this relates to analyzer tasks.

**Acceptance Criteria**:
- [x] `02_CodeMirror_Spike.md` notes that parser/analyzer integration in `st-panel.ts` is an intentional scope extension and references the relevant analyzer/transpiler tasks
- [x] Any conflicting “out of scope” statements are reconciled with the current implementation
- [x] The relationship between editor, parser, and analyzer responsibilities is clearly described

**Technical Notes**: This is a documentation/architecture-alignment task; do not change runtime behavior.

**Files Changed**:
- `docs/archive/02_CodeMirror_Spike.md`
- `docs/archive/04_Dependency_Analyzer.md`

---

### T-016: Parser docs and entity binding enhancements

**Status**: COMPLETED  
**Assigned**: Dev1  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: T-003, T-004  

**Description**: Follow up on the T-003 review by (a) enriching entity binding information so analyzers can easily access both IO binding and the bound entity ID string, and (b) filling in the Chevrotain vs Nearley evaluation table in `03_Parser_Spike.md` with the decision to use Chevrotain and its rationale.

**Acceptance Criteria**:
- [ ] AST/analyzer surface a clear representation that ties IO binding (`%I*`, `%Q*`, etc.) together with the initializer entity ID string (e.g. `'binary_sensor.xxx'`) without needing to re-parse expressions downstream
- [ ] Parser/analyzer tests cover the enriched entity binding shape
- [ ] The evaluation table in `03_Parser_Spike.md` is completed with Chevrotain’s evaluation and the explicit decision to keep it

**Technical Notes**: Keep changes backward-compatible for existing analyzer/transpiler usage where possible; document any AST shape adjustments in the parser docs.

**Files Changed**:
- `docs/archive/03_Parser_Spike.md`
- `frontend/src/parser/*`
- `frontend/src/analyzer/*`

---

### T-017: Repository-wide language audit (German → English)

**Status**: COMPLETED  
**Assigned**: DevOps  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: T-001  

**Description**: Scan the entire repository (code, tests, docs, comments, and user-facing strings) for German words/phrases and systematically convert them to clear, idiomatic English, except where German is intentionally required (e.g. user-facing German copy or examples).

**Acceptance Criteria**:
- [ ] No unintended German words remain in code identifiers, comments, commit-facing docs, or UI strings
- [ ] Intentional German text (e.g. example error translations) is explicitly documented as such
- [ ] A repeatable check (e.g. documented `rg` patterns or a script) is described so future German terms can be spotted

**Technical Notes**: Be conservative with renaming public APIs; if any exported names change, update all call sites and note the change in docs or changelog.

**Files Changed**:
- `**/*` (as needed)

---

### T-018: Enable timer detection in dependency analyzer once parser supports named args

**Status**: TODO  
**Assigned**: Dev1  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: T-003, T-004, T-016  

**Description**: Once the ST parser supports named arguments for timer function blocks, enable and adapt the currently skipped `hasTimers`-related tests in the dependency analyzer so timer usage is reliably detected and surfaced in analyzer metadata.

**Acceptance Criteria**:
- [ ] Parser gains support for the named-argument constructs needed by the timer detection tests
- [ ] The skipped `hasTimers`/timer-detection test in the dependency analyzer test suite is enabled and passes
- [ ] Analyzer metadata correctly reports `hasTimers` for programs using timer FBs, and this is covered by tests

**Technical Notes**: Keep the change localized to parser support and analyzer tests/metadata; do not change the acceptance criteria of T-004 itself.

**Files Changed**:
- `frontend/src/parser/*`
- `frontend/src/analyzer/*`

---

### T-019: Reconcile analyzer public API shape with archive specifications

**Status**: WIP  
**Assigned**: Dev1  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: T-004, T-006  

**Description**: Compare the current dependency analyzer public types (e.g. enriched trigger metadata, edge fields, extended diagnostics) with the minimal shapes in `04_Dependency_Analyzer.md` and `12_Archive_Feature_Gap_Analysis.md`, then either update the docs to reflect the richer, stabilized API or adjust the implementation where necessary for consistency.

**Acceptance Criteria**:
- [ ] All public analyzer types used by downstream modules are documented in the archive/spec docs
- [ ] Any intentional divergences from the original archive type shapes are explicitly called out as design evolutions
- [ ] No consumers rely on undocumented or ambiguous analyzer fields

**Technical Notes**: Prefer updating docs to match the richer, backward-compatible API rather than dumbing down types, unless a clear simplification benefit is identified.

**Files Changed**:
- `docs/archive/04_Dependency_Analyzer.md`
- `docs/archive/12_Archive_Feature_Gap_Analysis.md`
- `frontend/src/analyzer/*`

---

### T-020: Document storage analyzer & helper ID conventions

**Status**: TODO  
**Assigned**: Dev1  
**Priority**: Low  
**Created**: 2026-01-14  
**Dependencies**: T-005, T-008, T-019  

**Description**: Update the storage analyzer and helper-related docs to clarify (a) that FB instances (TON, R_TRIG, etc.) are marked PERSISTENT but do not generate helpers because they are serialized by the Helper Manager later, and (b) the exact helper ID format used in `helper-mapping.ts` so specs and implementation are aligned.

**Acceptance Criteria**:
- [ ] Docs explicitly describe why FB instances are PERSISTENT without direct helper configs and how the Helper Manager handles their serialization
- [ ] The helper ID naming convention (including the current `input_${helperType.replace("input_", "")}.st_...` pattern) is documented and consistent across code and docs
- [ ] Any discrepancies between archived examples and current ID format are resolved or clearly called out as intentional

**Technical Notes**: Prefer adjusting docs to match the existing, stable implementation over changing IDs, unless a strong reason emerges during review.

**Files Changed**:
- `docs/archive/05_Storage_Analyzer.md`
- `docs/archive/07_Helper_Manager_Deploy.md`
- `frontend/src/analyzer/helper-mapping.ts`

---

## Backlog

Ideas and future tasks that are not yet scheduled:

- Implement authentication system
- Add logging framework
- Create deployment pipeline
- Setup monitoring
- Add API documentation generator

---

## Notes

- Always update `tasks.md` when task status changes
- Keep descriptions clear and actionable
- Link related tasks
- Document blockers immediately

---

**Last Updated**: 2025-11-26
**Maintained By**: Taskmaster & All Agents
