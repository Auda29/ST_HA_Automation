## Archive Feature Gap Analysis (01–04)

This document summarizes where the implementation deviates from the original spike specs in `docs/archive/01–04`, focusing **only on features that are already implemented** and where they do **not** fully match the archived design.

---

## 01_Repository_Setup.md

- **CI workflow**
  - **Spec**: `.github/workflows/ci.yml` with CI configuration.
  - **Current state**: No `ci.yml` workflow is present under `.github/workflows/`.
  - **Impact**: CI must be added manually if desired; local scripts (`lint`, `typecheck`, `test`, `build`) exist and can be wired into CI.

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

The analyzer module (`frontend/src/analyzer/*`) is largely implemented, but several parts of the original design are either simplified or not yet wired in.

- **R_TRIG / F_TRIG–based edge trigger detection**
  - **Spec**:
    - Detect usage of `R_TRIG` / `F_TRIG` function blocks in the AST.
    - Automatically generate rising/falling edge triggers for the referenced input variables.
    - Emit diagnostics like `EDGE_TRIGGER_DETECTED`.
  - **Current state**:
    - Edge triggers can be expressed via pragmas (e.g. `{edge: rising}`), and helper functions like `generateRisingEdgeTrigger` / `generateFallingEdgeTrigger` exist.
    - The analyzer does **not** yet inspect function call names for `R_TRIG` / `F_TRIG` and does not convert those into edge triggers.
  - **Impact**: R_TRIG/F_TRIG usage is not automatically reflected in generated HA triggers; edge behavior must currently be driven via pragmas or added later.

- **Diagnostic codes and messages**
  - **Spec**:
    - Named codes like `W001`, `W002`, `W003`, `I001`, `I002`, `I003`, `E001`, etc., with specific meanings (NO_TRIGGERS, MANY_TRIGGERS, UNUSED_INPUT, AUTO_TRIGGER, EXPLICIT_NO_TRIGGER, EDGE_TRIGGER_DETECTED, INVALID_ENTITY_ID, …).
  - **Current state**:
    - `types.ts` defines simpler string codes (e.g. `NO_TRIGGERS`, `MANY_TRIGGERS`, `UNUSED_INPUT`, `WRITE_TO_INPUT`, `INVALID_ENTITY_ID`, …).
    - Some informational diagnostics described in the spike (e.g. separate infos for AUTO_TRIGGER / EXPLICIT_NO_TRIGGER / EDGE_TRIGGER_DETECTED) are not all emitted.
  - **Impact**: Diagnostics are present and useful, but consumers cannot rely on the numeric code scheme from the archived spec and some informational messages are coarser than designed.

- **Entity binding model**
  - **Spec**:
    - Clear separation between:
      - IO binding (`%I*`, `%Q*`, `%M*`) with direction.
      - Entity ID stored in the initializer string (e.g. `'binary_sensor.kitchen_motion'`).
    - Analyzer uses both binding direction and the entity id to build `EntityDependency`.
  - **Current state**:
    - AST/visitor tracks `EntityBinding`, but `DependencyAnalyzer` primarily:
      - Infers direction from `VarSection` (e.g. `VAR_INPUT`, `VAR_OUTPUT`) or `binding.direction`.
      - Uses the initializer string as the entity id when available.
    - Binding and entity id are not always modeled exactly as in the spike text (e.g. some assumptions in `parseIoAddress` and metadata around persistent vars).
  - **Impact**: Behavior is correct for the common `{ AT %I* : TYPE := 'domain.entity'; }` pattern, but low-level representation does not perfectly mirror the archived design.

- **Metadata details**
  - **Spec**:
    - `metadata.hasPersistentVars` driven by presence of `{persistent}` pragmas.
    - `mode`, `throttle`, `debounce` stored as ST-style values (e.g. `'restart'`, `'T#1s'`).
  - **Current state**:
    - `hasPersistentVars` is currently approximated (e.g. based on outputs) and not strictly tied to `{persistent}`.
    - `mode`/`throttle`/`debounce` are parsed differently (e.g. throttle/debounce interpreted as numbers instead of raw time literals).
  - **Impact**: High-level metadata exists but does not yet reflect all the semantics/encodings from the archived spike.

- **Panel integration**
  - **Spec**:
    - `st-panel.ts` calls `parse(this._code)` and `analyzeDependencies(ast)` on the current ST source, and surfaces:
      - Generated triggers.
      - Combined diagnostics (parser + analyzer).
  - **Current state**:
    - `st-panel.ts` still only logs the code in `_handleDeploy` and does **not** invoke the parser/analyzer yet.
  - **Impact**: Dependency analysis currently runs only in tests or via direct API calls in code; the UI does not yet display triggers/diagnostics as outlined in the spike.

- **EntityDependency direction type**
  - **Spec**:
    - `direction: 'INPUT' | 'OUTPUT' | 'MEMORY'` to cover `%I*`, `%Q*`, and `%M*` bindings.
  - **Current state**:
    - `types.ts` defines `direction: 'INPUT' | 'OUTPUT'` only; `'MEMORY'` is missing.
  - **Impact**: Memory-mapped variables (`%M*`) are not explicitly represented; they would fall through or be misclassified.

- **TriggerConfig extended fields**
  - **Spec**:
    - `TriggerConfig` includes additional optional fields:
      - `not_from?: string[]`, `not_to?: string[]` (exclusion filters)
      - `attribute?: string` (trigger on attribute change)
      - `for?: string` (duration constraint)
      - `event_type?: string`, `event_data?: Record<string, unknown>` (event triggers)
      - `at?: string` (time-based triggers)
  - **Current state**:
    - Only core fields are present: `platform`, `entity_id`, `from`, `to`, `above`, `below`, `edge`, `id`.
  - **Impact**: Advanced trigger configurations (attribute-based, time-based, event-based) cannot be generated; current implementation covers only state triggers.

- **Diagnostic severity casing**
  - **Spec**:
    - `DiagnosticSeverity = 'Error' | 'Warning' | 'Info' | 'Hint'` (PascalCase).
  - **Current state**:
    - `DiagnosticSeverity = 'error' | 'warning' | 'info'` (lowercase), no `'hint'`.
  - **Impact**: Minor inconsistency; consumers expecting the archived casing will need adjustment. Functionally equivalent.

---

## How to Use This Document

- When aligning implementation with the original spikes, treat the items above as a **to‑do list of refinement tasks** rather than blockers: the core editor, parser, and analyzer are already in place.
- New work should either:
  - Bring the implementation **closer to the archived spec** (e.g. implement R_TRIG/F_TRIG detection, add CI workflow), or
  - **Update the archived docs** to match intentional design changes if deviations are kept.

