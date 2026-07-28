# ST for Home Assistant - Project Overview

## Project Description

**ST for Home Assistant** is a HACS integration that enables programming Home Assistant automations in **Structured Text (IEC 61131-3)** - the language used in industrial PLCs (TwinCAT, Siemens, etc.).

**Core Concept:** ST code is **transpiled** (not interpreted) to native HA automations, resulting in zero runtime overhead.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ST for Home Assistant                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌───────────┐  │
│   │ ST Code     │───▶│ Parser       │───▶│ AST         │───▶│ Analyzers │  │
│   │ (Editor)    │    │ (Chevrotain) │    │             │    │           │  │
│   └─────────────┘    └──────────────┘    └─────────────┘    └─────┬─────┘  │
│                                                                    │        │
│                                                                    ▼        │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌───────────┐  │
│   │ HA Runtime  │◀───│ YAML Output  │◀───│ Transpiler  │◀───│ Triggers  │  │
│   │ (Automation)│    │              │    │             │    │ + Helpers │  │
│   └─────────────┘    └──────────────┘    └─────────────┘    └───────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology | Version | Status |
|-----------|------------|---------|--------|
| Editor | CodeMirror 6 | ^6.0 | ✅ Implemented |
| Parser | Chevrotain | ^11.0 | ✅ Implemented |
| Frontend | TypeScript + Lit | 5.x / 3.x | ✅ Implemented |
| Build | Vite | ^5.0 | ✅ Implemented |
| Backend | Python (HA Custom Component) | 3.11+ | ✅ Implemented |
| HA Integration | HACS | - | ✅ Implemented |

---

## Core Features

### Language Features
- **Data Types:** BOOL, INT, DINT, LINT, SINT, REAL, LREAL, STRING, TIME
- **Control Structures:** IF/ELSIF/ELSE, CASE, FOR, WHILE, REPEAT
- **Operators:** Arithmetic, comparison, logical (AND, OR, XOR, NOT)
- **Built-in Functions:** SEL, MUX, LIMIT, MIN, MAX, ABS, SQRT, etc.
- **Function Blocks:** R_TRIG, F_TRIG, TON, TOF, TP, SR, RS

### Entity Binding
```iecst
VAR
    motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';  // Input
    light AT %Q* : BOOL := 'light.kitchen';                  // Output
END_VAR
```

### Pragmas (ST-HA Extensions)
```iecst
{mode: restart}           // Script execution mode
{throttle: T#1s}          // Rate limiting
{debounce: T#500ms}       // Debouncing
{trigger}                 // This variable triggers automation
{no_trigger}              // Variable doesn't trigger
{persistent}              // Value persists across runs (→ Helper)
{transient}               // Only valid during run
{reset_on_restart}        // Always use initial value after HA restart
{require_restore}         // Error if no stored value exists
```

---

## MUST-DO's (Critical Requirements)

### 1. Cycle → Event Transformation
```
ST thinks:       "I continuously check"
HA thinks:       "I sleep until an event comes"
```

**MUST:** Implement Dependency Analysis
- Automatically register all read entity variables as triggers
- Respect `{trigger}` / `{no_trigger}` pragmas
- Warning when no triggers detected → program never runs

```typescript
// CORRECT
trigger:
  - platform: state
    entity_id: binary_sensor.motion  // Auto-generated from AT %I*
```

### 2. State Persistence with Helpers
```
ST:    Variables retain value between cycles
HA:    Variables only live milliseconds
```

**MUST:** Tiered Storage Strategy
- `DERIVED` → Entity-bound variables (no helper)
- `PERSISTENT` → Self-reference, FB instances, timers (→ input_* helper)
- `TRANSIENT` → Everything else (HA variables:)

**MUST:** Namespace Convention
```
input_number.st_<project>_<program>_<variable>
```

**MUST:** Cleanup mechanism for obsolete helpers

### 3. Defensive Jinja Generation
```
Sensor can be: "unavailable", "unknown", "none", ""
→ Jinja error or wrong result
```

**MUST:** Generate null-safe templates
```jinja
{{ states('sensor.temp') | float(default=0.0) 
   if states('sensor.temp') not in ['unavailable', 'unknown', 'none', ''] 
   else 0.0 }}
```

### 4. Loop Safety Guards
```
WHILE without exit → HA frozen
```

**MUST:** Automatic iteration limits
```yaml
repeat:
  while:
    - "{{ original_condition }}"
    - "{{ _safety_counter < 1000 }}"  # AUTO-INSERTED
```

**MUST:** Compiler warning for WHILE without guaranteed exit

### 5. Script Mode: restart (Default)
```
mode: single   → Input loss (bad!)
mode: restart  → New value takes priority (PLC-like, good!)
```

**MUST:** Default `mode: restart` for all generated scripts

### 6. Transactional Deploy
```
Deploy halfway through + error → Inconsistent state
```

**MUST:** 
- Backup before deploy
- Rollback on error
- All changes or none

### 7. Source Maps for Debugging
```
HA error shows: "Error in automation.yaml line 47"
User thinks:    "Which ST line is that?"
```

**MUST:** Source maps in generated YAML
```yaml
variables:
  _st_source_map:
    "action.0.choose.0": { st_line: 7, st_file: "kitchen.st" }
```

### 8. Timer as Entity + Event
```
HA delay is NOT interruptible
ST timers (TON) are resettable
```

**MUST:** Implement timer FBs with `timer.*` entity + `timer.finished` event

### 9. Deploy via HA Services (NOT File Manipulation!)
```
WRONG:   Directly edit automations.yaml
CORRECT: Use HA services
```

**MUST:** Deployment exclusively via HA APIs
- **REST API** (`hass.callApi`) for automation and script configs
- **WebSocket API** for helper entity creation (`input_*/create`, `timer/create`)
- `automation.reload` / `script.reload` after changes
- `input_number.set_value` for helper values

**WHY:** 
- File manipulation is fragile (formatting, comments, merges)
- HA cannot track changes
- No rollback possible with direct file changes
- User edits get overwritten

**Which transport for what?** Automation and script configs are *not* available over
the WebSocket API. In HA Core they are served by HTTP views
(`EditIdBasedConfigView` in `homeassistant/components/config/`), so they must be
written via REST. Helper creation and service calls *are* WebSocket commands.

```typescript
// ✅ CORRECT - automation/script config via REST
await hass.callApi(
  'POST',
  `config/automation/config/${automationId}`,
  generatedAutomation
);
await hass.callApi('POST', `config/script/config/${scriptId}`, generatedScript);

// ✅ CORRECT - helper creation via WebSocket
await hass.connection.sendMessagePromise({
  type: 'input_number/create',
  name: 'ST Kitchen activationCount',
});
```

```typescript
// ❌ WRONG - there is no such WebSocket command; HA answers `unknown_command`
await hass.callWS({
  type: 'config/automation/config',
  automation_id: 'st_kitchen',
  config: generatedAutomation
});
```

### 10. Throttle Helper Initialization
```
First run: input_datetime is empty/unavailable
→ Template crashes or gives wrong result
```

**MUST:** Robust throttle condition with fallback
```jinja
{# WRONG - crashes with empty helper #}
{{ (now() - states('input_datetime.st_last_run') | as_datetime).total_seconds() > 1 }}

{# WRONG - `now()` is timezone-aware, but an input_datetime state is naive
   ("2026-07-28 13:00:00"). Subtracting them raises:
   TypeError: can't subtract offset-naive and offset-aware datetimes #}
{% set last = states('input_datetime.st_last_run') %}
{% if last in ['unknown', 'unavailable', ''] %}
  true
{% else %}
  {{ (now() - (last | as_datetime)).total_seconds() > 1 }}
{% endif %}

{# CORRECT - fallback for first run AND timezone-safe comparison.
   as_timestamp() reads a naive helper state as local time and takes a
   default for the uninitialised case. #}
{% set last = states('input_datetime.st_last_run') %}
{% if last in ['unknown', 'unavailable', 'none', ''] %}
  true
{% else %}
  {{ (as_timestamp(now()) - as_timestamp(last, 0)) > 1 }}
{% endif %}
```

**MUST:** Initialize helper on deploy if not existing

---

## MUST-NOT-DO's (Avoid These!)

### 1. NO Polling / Cycle-Time Pattern
```python
# WRONG - Anti-pattern in HA!
while True:
    check_conditions()
    sleep(0.1)  # 100ms cycle time
```

**WHY:** Blocks HA, performance killer, unnecessary CPU usage

**INSTEAD:** Event-based triggers from dependency analysis

### 2. NO Helper Explosion
```yaml
# WRONG - Every variable as helper
input_number.st_temp_var_1
input_number.st_temp_var_2
input_number.st_loop_counter
# ... 50+ helpers for one program
```

**WHY:** Clutters HA instance, hard to maintain

**INSTEAD:** Only PERSISTENT variables as helpers, rest in `variables:`

### 3. NO mode: single for Logic Scripts
```yaml
# WRONG
script:
  st_kitchen_logic:
    mode: single  # ← Triggers are ignored during run!
```

**WHY:** Input loss, not PLC-like

**INSTEAD:** `mode: restart` (or `queued` for special cases)

### 4. NO Naive Jinja Without Null Checks
```jinja
# WRONG
{{ states('sensor.temp') * 2 }}  # Crashes on "unavailable"
```

**WHY:** Jinja errors, wrong results (e.g., "unavailable" * 2)

**INSTEAD:** Always defensive templates with `| float(default=0.0)`

### 5. NO Infinite Loops Without Safety
```iecst
// WRONG - Can freeze HA
WHILE NOT sensor DO
    // wait...
END_WHILE;
```

**WHY:** Blocks automation thread

**INSTEAD:** Automatic safety counter, max 1000 iterations

### 6. NO Hardcoded Entity IDs in Transpiler
```typescript
// WRONG
const trigger = { entity_id: "binary_sensor.motion" };
```

**WHY:** Not portable, hard to test

**INSTEAD:** Extract from AST EntityBinding

### 7. NO Deploy Without Backup
```python
# WRONG
async def deploy():
    await delete_old_helpers()
    await create_new_helpers()  # ← Error here = data loss!
```

**WHY:** Inconsistent state, data loss

**INSTEAD:** Backup → Changes → Verify → Commit (or Rollback)

### 8. NO Direct HA API Manipulation Without Abstraction
```typescript
// WRONG
await hass.callService('input_number', 'set_value', {...});
```

**WHY:** Hard to test, API changes break code

**INSTEAD:** Helper Manager abstraction layer

### 9. NO Direct YAML File Manipulation
```python
# WRONG - Never!
with open('/config/automations.yaml', 'w') as f:
    yaml.dump(automation, f)
```

**WHY:** 
- Overwrites user comments and formatting
- HA doesn't track changes
- No rollback on error
- Race conditions with HA Core
- Security risk

**INSTEAD:** HA Storage API / WebSocket services

### 10. NO Unchecked Throttle Templates
```jinja
# WRONG - crashes on first run
{{ (now() - states('input_datetime.x') | as_datetime).total_seconds() }}
```

**WHY:** `input_datetime` can be `unknown`/`unavailable`

**INSTEAD:** Always fallback for empty/new helper

---

## Implementation Status

### Completed Features (All 20 Core Tasks)

| Task | Description | Status |
|------|-------------|--------|
| T-001 | Repository Setup (HACS structure) | ✅ Complete |
| T-002 | CodeMirror 6 ST Editor | ✅ Complete |
| T-003 | Chevrotain Parser | ✅ Complete |
| T-004 | Dependency Analyzer | ✅ Complete |
| T-005 | Storage Analyzer | ✅ Complete |
| T-006 | Archive Gap Analysis | ✅ Complete |
| T-007 | Transpiler Basis | ✅ Complete |
| T-008 | Helper Manager & Deploy | ✅ Complete |
| T-009 | Timer FBs (TON/TOF/TP) | ✅ Complete |
| T-010 | Source Maps & Error Mapping | ✅ Complete |
| T-011 | Restore Policy & Migration | ✅ Complete |
| T-012 | Live Values & Online Mode | ✅ Complete |

### Test Coverage

| Module | Tests | Status |
|--------|-------|--------|
| Parser | 25 | ✅ Passing |
| Dependency Analyzer | 16 | ✅ Passing |
| Storage Analyzer | 23 | ✅ Passing |
| Transpiler | 15 | ✅ Passing |
| Timer Transpiler | 9 | ✅ Passing |
| Deploy Manager | 2 | ✅ Passing |
| Helper Manager | 2 | ✅ Passing |
| Restore/Migration | 20 | ✅ Passing |
| Online Mode | 10 | ✅ Passing |
| Error Mapping | 10 | ✅ Passing |
| Source Maps | 11 | ✅ Passing |
| **Total** | **145** | **✅ 100% Passing** |

### Build Status

- **TypeScript Compilation:** ✅ Passing (strict mode)
- **ESLint:** ✅ Passing (0 errors)
- **Bundle Size:** 923.60 KB (245.16 KB gzipped)
- **Build Time:** ~2s

---

## Risk Matrix

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| Cycle→Event incorrect | 🔴 High | Medium | Dependency Analyzer + Tests | ✅ Solved |
| State loss without persistence | 🔴 High | High | Storage Analyzer + Helpers | ✅ Solved |
| Timer not interruptible | 🟡 Medium | High | Timer Entity Pattern | ✅ Solved |
| Jinja errors on unavailable | 🟡 Medium | High | Defensive Templates | ✅ Solved |
| Loop blocking | 🔴 High | Medium | Safety Guards | ✅ Solved |
| Deploy inconsistency | 🟡 Medium | Low | Transactional Deploy | ✅ Solved |
| Parser complexity | 🟡 Medium | Medium | Iterative expansion | ✅ Solved |
| File manipulation instead of API | 🔴 High | Low | Only HA Storage API | ✅ Solved |
| Throttle helper empty | 🟡 Medium | High | Fallback in template | ✅ Solved |
| Parser choice wrong | 🟡 Medium | Low | Spike with evaluation | ✅ Solved |

---

## File Structure

```
ST_HA_Automation/
├── custom_components/
│   └── st_hass/
│       ├── __init__.py
│       ├── manifest.json
│       ├── config_flow.py
│       ├── const.py
│       ├── strings.json
│       └── frontend/
│           └── st-panel.js (built)
├── frontend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── editor/
│   │   │   ├── st-language.ts
│   │   │   ├── st-theme.ts
│   │   │   ├── st-editor.ts
│   │   │   └── index.ts
│   │   ├── parser/
│   │   │   ├── tokens.ts
│   │   │   ├── lexer.ts
│   │   │   ├── ast.ts
│   │   │   ├── parser.ts
│   │   │   ├── visitor.ts
│   │   │   └── index.ts
│   │   ├── analyzer/
│   │   │   ├── dependency-analyzer.ts
│   │   │   ├── storage-analyzer.ts
│   │   │   ├── trigger-generator.ts
│   │   │   ├── helper-mapping.ts
│   │   │   └── index.ts
│   │   ├── transpiler/
│   │   │   ├── transpiler.ts
│   │   │   ├── action-generator.ts
│   │   │   ├── jinja-generator.ts
│   │   │   ├── timer-transpiler.ts
│   │   │   └── index.ts
│   │   ├── deploy/
│   │   │   ├── deploy-manager.ts
│   │   │   ├── backup-manager.ts
│   │   │   ├── helper-manager.ts
│   │   │   ├── ha-api.ts
│   │   │   └── index.ts
│   │   ├── online/
│   │   │   ├── state-manager.ts
│   │   │   ├── live-decorations.ts
│   │   │   └── index.ts
│   │   ├── restore/
│   │   │   ├── restore-policy.ts
│   │   │   ├── migration-handler.ts
│   │   │   └── index.ts
│   │   ├── error-mapping/
│   │   │   ├── error-mapper.ts
│   │   │   └── index.ts
│   │   ├── sourcemap/
│   │   │   ├── source-map.ts
│   │   │   └── index.ts
│   │   └── panel/
│   │       └── st-panel.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/
│   ├── 00_Project_Overview.md (this file)
│   ├── PRD_ST_HomeAssistant.md
│   ├── agents/
│   │   ├── agents.md
│   │   └── tasks.md
│   └── archive/
│       ├── 01_Repository_Setup.md
│       ├── 02_CodeMirror_Spike.md
│       ├── 03_Parser_Spike.md
│       └── ... (completed task documentation)
├── hacs.json
├── README.md
└── LICENSE
```

---

## Reference Links

- **Chevrotain:** https://chevrotain.io/
- **CodeMirror 6:** https://codemirror.net/
- **HA WebSocket API:** https://developers.home-assistant.io/docs/api/websocket
- **HACS:** https://hacs.xyz/docs/publish/start
- **IEC 61131-3:** Wikipedia / Beckhoff Infosys
- **CAFE (Reference):** https://github.com/FezVrasta/cafe-hass

---

## Checklist for New Developers

- [ ] Repository cloned
- [ ] Node.js 20+ installed
- [ ] `cd frontend && npm install` executed
- [ ] `npm run build` successful
- [ ] Home Assistant development environment (optional)
- [ ] 00_Project_Overview.md read
- [ ] MUST-DO's and MUST-NOT-DO's understood
- [ ] PRD_ST_HomeAssistant.md reviewed for detailed specifications

---

## Contact & Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Documentation:** `/docs` folder

---

*Last updated: January 2026*
