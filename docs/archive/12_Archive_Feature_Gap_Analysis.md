## Archive Feature Gap Analysis (01–04)

This document summarizes where the implementation deviates from the original spike specs in `docs/archive/01–04`, focusing **only on features that are already implemented** and where they do **not** fully match the archived design.

---

## 01_Repository_Setup.md

- **CI workflow**
  - **Spec**: `.github/workflows/ci.yml` with CI configuration.
  - **Current state**: A `ci.yml` workflow is present under `.github/workflows/` and runs `lint`, `typecheck`, `test` and `build` for the frontend, matching the intent of the spike.
  - **Impact**: Gap closed – CI is configured as planned. Any future changes should update both the workflow and the spike doc if they diverge.

- **ESLint configuration filename**
  - **Spec**: `frontend/.eslintrc.json`.
  - **Current state**: Project uses `frontend/eslint.config.js`.
  - **Impact**: Functionally fine for ESLint 8+, but does not match the filename/format shown in the archived spec.

---

## 02_CodeMirror_Spike.md (Editor / Syntax Highlighting)

The CodeMirror/ST editor stack (`st-language.ts`, `st-theme.ts`, `st-editor.ts`, updated `st-panel.ts`, `src/index.ts`) is effectively implemented as specified. Any differences are minor (e.g. formatting, exact sample code contents) and not tracked here because they do not constitute missing functionality.

---

## 03_Parser_Spike.md (Chevrotain ST Parser)

The Chevrotain-based parser (`frontend/src/parser/*`) implements the intended functionality (lexer, parser, AST, CST→AST visitor, error reporting, and tests). Differences are mostly in type shapes and naming:

- **Parse result / error shape**
  - **Spec**: `ParseResult` and error types as shown in the spike, with `ast` + `errors` including locations.
  - **Current state**:
    - Public `parse(code)` returns a slightly different `ParseResult` interface:
      - `success: boolean`
      - `ast?: ProgramNode`
      - `errors: { message, line?, column?, offset? }[]`
    - Internal `parser/ast.ts` also defines its own `ParseResult`/`ParseError` for other usage.
  - **Impact**: Callers should use the existing exported `parse` contract rather than the archived type shapes; error information (line/column) is available but property names differ from the spike text.

---

## 04_Dependency_Analyzer.md (Dependency Analyzer / Auto Triggers)

The analyzer module (`frontend/src/analyzer/*`) is largely implemented and, for several items, now matches or intentionally extends the original design.

- **R_TRIG / F_TRIG–based edge trigger detection**
  - **Spec**:
    - Detect usage of `R_TRIG` / `F_TRIG` function blocks in the AST.
    - Automatically generate rising/falling edge triggers for the referenced input variables.
    - Emit diagnostics like `EDGE_TRIGGER_DETECTED`.
  - **Current state**:
    - `DependencyAnalyzer` inspects function call names for `R_TRIG` / `F_TRIG`, records detected edge triggers per input variable, and generates rising/falling edge triggers via `generateRisingEdgeTrigger` / `generateFallingEdgeTrigger`.
    - A dedicated `EDGE_TRIGGER_DETECTED` diagnostic is emitted when such usage is found.
  - **Impact**: Gap closed – R_TRIG/F_TRIG usage is now automatically reflected in generated HA triggers, with a clear diagnostic trail.

- **Diagnostic codes and messages**
  - **Spec**:
    - Named codes like `W001`, `W002`, `W003`, `I001`, `I002`, `I003`, `E001`, etc., with specific meanings (NO_TRIGGERS, MANY_TRIGGERS, UNUSED_INPUT, AUTO_TRIGGER, EXPLICIT_NO_TRIGGER, EDGE_TRIGGER_DETECTED, INVALID_ENTITY_ID, …).
  - **Current state**:
    - `types.ts` defines `DiagnosticCodes` with the numeric scheme (`W0xx`, `I0xx`, `E0xx`, `H0xx`) and symbolic names (e.g. `NO_TRIGGERS`, `MANY_TRIGGERS`, `UNUSED_INPUT`, `AUTO_TRIGGER`, `EXPLICIT_NO_TRIGGER`, `EDGE_TRIGGER_DETECTED`, `INVALID_ENTITY_ID`, …).
    - The analyzer emits distinct diagnostics for AUTO_TRIGGER, EXPLICIT_NO_TRIGGER, EDGE_TRIGGER_DETECTED and the warning/error codes described in the spike.
  - **Impact**: Gap closed – diagnostics use the numeric code scheme from the archived spec and provide the intended granularity.

- **Entity binding model**
  - **Spec**:
    - Clear separation between:
      - IO binding (`%I*`, `%Q*`, `%M*`) with direction.
      - Entity ID stored in the initializer string (e.g. `'binary_sensor.kitchen_motion'`).
    - Analyzer uses both binding direction and the entity id to build `EntityDependency`.
  - **Current state**:
    - The AST/visitor exposes an `EntityBinding` that carries both binding direction and `entityId`; `DependencyAnalyzer` uses this enriched binding (falling back to the initializer string when needed) to build `EntityDependency`.
  - **Impact**: Behavior and data model now match the spike for the intended `%I*` / `%Q*` / `%M*` binding patterns; remaining differences are minor implementation details only.

- **Metadata details**
  - **Spec**:
    - `metadata.hasPersistentVars` driven by presence of `{persistent}` pragmas.
    - `mode`, `throttle`, `debounce` stored as ST-style values (e.g. `'restart'`, `'T#1s'`).
  - **Current state**:
    - `hasPersistentVars` is computed based on `{persistent}` pragmas on variable declarations.
    - `mode`, `throttle`, and `debounce` are taken from program pragmas and kept as ST-style strings (e.g. `restart`, `T#1s`, `T#500ms`) in `AnalysisMetadata`.
  - **Impact**: Gap closed – metadata now follows the encoding described in the spikes.

- **Panel integration**
  - **Spec**:
    - `st-panel.ts` calls `parse(this._code)` and `analyzeDependencies(ast)` on the current ST source, and surfaces:
      - Generated triggers.
      - Combined diagnostics (parser + analyzer).
  - **Current state**:
    - `st-panel.ts` invokes the Chevrotain parser and `analyzeDependencies` on every code change, combines parser and analyzer diagnostics, and exposes triggers and metadata to the UI state; deployment is still a TODO handled by later tasks.
  - **Impact**: Gap closed for analysis and diagnostics; only deploy wiring remains open and is tracked by other tasks.

- **EntityDependency direction type**
  - **Spec**:
    - `direction: 'INPUT' | 'OUTPUT' | 'MEMORY'` to cover `%I*`, `%Q*`, and `%M*` bindings.
  - **Current state**:
    - `EntityDependency` in `types.ts` uses exactly this union type, and `%M*` bindings are represented as `MEMORY`.
  - **Impact**: Gap closed – all three binding classes are modeled explicitly.

- **TriggerConfig extended fields**
  - **Spec**:
    - `TriggerConfig` includes additional optional fields:
      - `not_from?: string[]`, `not_to?: string[]` (exclusion filters)
      - `attribute?: string` (trigger on attribute change)
      - `for?: string` (duration constraint)
      - `event_type?: string`, `event_data?: Record<string, unknown>` (event triggers)
      - `at?: string` (time-based triggers)
  - **Current state**:
    - `TriggerConfig` in `types.ts` declares all of these fields, and helper functions in `trigger-generator.ts` are ready to populate them as features are needed.
  - **Impact**: Gap closed at the type level; current analyzer usage focuses on state triggers but is forward-compatible with attribute/time/event triggers.

- **Diagnostic severity casing**
  - **Spec**:
    - `DiagnosticSeverity = 'Error' | 'Warning' | 'Info' | 'Hint'` (PascalCase).
  - **Current state**:
    - `DiagnosticSeverity` in `types.ts` matches the PascalCase union and includes `'Hint'`; diagnostics use these values consistently.
  - **Impact**: Gap closed – severity casing is consistent with the archived design.

---

## How to Use This Document

- The items above now document **where the current implementation intentionally evolved beyond the original spikes** and where gaps have been explicitly closed in code or documentation.
- For future work, treat this file as a **reference for design evolution**, not as a list of open bugs:
  - If you change analyzer behavior or public types, update both `04_Dependency_Analyzer.md` and this gap analysis to keep them in sync.
  - When adding new features, prefer extending the existing public API (as documented in `frontend/src/analyzer/index.ts` and `types.ts`) and then reflecting those changes here if they diverge from the original spike sketches.

