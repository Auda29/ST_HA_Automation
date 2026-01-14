# ST for Home Assistant - Product Requirements Document

## Project Overview

**Goal:** A HACS integration that enables programming Home Assistant automations using Structured Text (IEC 61131-3, oriented towards TwinCAT).

**Architecture Approach:** Transpilation (like CAFE) – ST code is translated into native HA automations, no runtime overhead.

---

## Tech Stack

| Component | Technology | Rationale | Status |
|-----------|------------|-----------|--------|
| Editor | CodeMirror 6 | Lightweight (~300KB), modular, highly extensible | ✅ Decided |
| Frontend | TypeScript + Lit | HA Panel Integration | ✅ Decided |
| Parser | Chevrotain | Modern parser generator for JS/TS, better error recovery & debugging (see `03_Parser_Spike.md`, T-003, T-016) | ✅ Decided |
| Backend | Python (HA Integration) | Native HA compatibility | ✅ Decided |
| Communication | HA WebSocket API | Entity access, live data | ✅ Decided |

### Decision: Parser Library (Chevrotain)

| Criterion | Chevrotain | Nearley.js |
|-----------|------------|------------|
| **Approach** | Hand-written parser class | Declarative BNF grammar |
| **Performance** | Very fast | Good |
| **Error Recovery** | Built-in | Manual |
| **Learning Curve** | Medium | Steep |
| **Debugging** | Good stack traces | More difficult |
| **Bundle Size** | ~100KB | ~50KB |

**Recommendation (historical):** Chevrotain for better error recovery and debugging.
**Decision (current):** Chevrotain was evaluated in the parser spike and selected as the parser library (implemented in T-003, documented in T-016).

---

## Language Features (Scope)

### Data Types
| Type | HA Mapping |
|------|------------|
| `BOOL` | `true/false`, Entity states `on/off` |
| `INT` | Integer templates |
| `REAL` | Float templates |
| `STRING` | String templates |

### Control Structures
| ST Feature | HA Equivalent |
|------------|---------------|
| `IF/ELSIF/ELSE/END_IF` | `choose` with conditions |
| `CASE...OF/END_CASE` | `choose` with multiple branches |
| `FOR...TO...DO/END_FOR` | `repeat` with count |
| `WHILE...DO/END_WHILE` | `repeat` with while-condition |

### Operators & Functions
| Category | Features |
|----------|----------|
| Arithmetic | `+`, `-`, `*`, `/`, `MOD` |
| Comparison | `=`, `<>`, `<`, `>`, `<=`, `>=` |
| Logical | `AND`, `OR`, `XOR`, `NOT` |
| Selection | `SEL` (2-way), `MUX` (n-way) |
| Mathematics | `ABS`, `SQRT`, `TRUNC`, `ROUND`, `MIN`, `MAX`, `LIMIT` |
| Conversion | `TO_INT`, `TO_DINT`, `TO_REAL`, `TO_LREAL`, `TO_STRING`, `TO_BOOL` |

### Function Blocks (Built-in)
| FB | Function | HA Implementation |
|----|----------|-------------------|
| `R_TRIG` | Rising edge | `trigger: state: from 'off' to 'on'` |
| `F_TRIG` | Falling edge | `trigger: state: from 'on' to 'off'` |
| `SR` | Set-dominant | Helper + Logic |
| `RS` | Reset-dominant | Helper + Logic |
| `TON` | On-delay timer | Timer entity + Event automation |
| `TOF` | Off-delay timer | Timer entity + Event automation |
| `TP` | Pulse timer | Timer entity + Event automation |

---

## Critical Design Decisions

### 1. Cycle vs. Event (The "Heartbeat" Problem)

**Problem:** ST programs "always check" (cyclically), HA automations "sleep until event".

**Solution: Dependency Analysis with Automatic Trigger Generation**

The transpiler statically analyzes the code and detects all read entity variables. A state-change trigger is automatically generated for each.

```typescript
// dependency-analyzer.ts
class DependencyAnalyzer {
  
  analyzeProgram(ast: Program): TriggerSet {
    const triggers = new TriggerSet();
    
    // Find all read entity variables
    const readEntities = this.findReadEntities(ast);
    
    // Generate a state trigger for each read entity
    for (const entity of readEntities) {
      triggers.add({
        platform: "state",
        entity_id: entity.entityId,
        not_from: ["unavailable", "unknown"],
        not_to: ["unavailable", "unknown"]
      });
    }
    
    // Explicit R_TRIG/F_TRIG override generic triggers
    const explicitTrigs = this.findExplicitTriggers(ast);
    triggers.mergeExplicit(explicitTrigs);
    
    return triggers;
  }
}
```

**Pragma for Manual Control:**
```iecst
PROGRAM Kitchen
VAR
    {trigger}  // Explicit: This input triggers the automation
    motion AT %I* : BOOL := 'binary_sensor.motion';
    
    {no_trigger}  // Explicit: No trigger, read only
    temperature AT %I* : REAL := 'sensor.temp';
END_VAR
```

**Compiler Warnings:**
- `W010`: No triggers detected - Program will never execute
- `I010`: Many triggers (>10) - Performance hint

---

### 2. State Management: Persistence vs. Amnesia

**Problem:** ST variables retain their value, HA variables only live milliseconds.

**Solution: Tiered Storage Strategy**

```typescript
enum StorageType {
  TRANSIENT,    // Only within a run (HA variables:)
  PERSISTENT,   // Survives runs (input_* helper)
  DERIVED       // Read from entity state
}
```

**Automatic Detection:**
- Entity-bound variables → `DERIVED`
- Self-reference (`counter := counter + 1`) → `PERSISTENT`
- FB instances → `PERSISTENT`
- Timer-related (TON, SR, etc.) → `PERSISTENT`
- Everything else → `TRANSIENT`

**Explicit Pragmas:**
```iecst
VAR
    {persistent}
    manualPersist : INT := 0;
    
    {transient}
    tempValue : INT := 0;
END_VAR
```

**Namespace Convention:**
```
input_number.st_<project>_<program>_<variable>
input_boolean.st_<project>_<program>_<variable>
```

**Automatic Cleanup:**
The helper manager synchronizes on each deploy:
1. Determine required helpers from code
2. Find existing ST helpers (`st_` prefix)
3. Calculate diff (create, delete, update)
4. Request user confirmation for deletions

---

### 3. Time Logic: Timers & Loops

#### Timers (TON, TOF, TP)

**Problem:** HA `delay` is not interruptible, ST timers are.

**Solution: Timer Entity + Separate Event Automation**

```
┌─────────────────────────────────────────────────────────────────┐
│  TON Implementation                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Required Entities:                                             │
│  • timer.st_<prog>_<instance>         (HA Timer)                │
│  • input_boolean.st_<prog>_<instance>_q  (Output State)         │
│                                                                 │
│  Main Automation:                                               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ IF IN = TRUE AND timer.idle:                              │ │
│  │   → timer.start(duration)                                 │ │
│  │ IF IN = FALSE:                                            │ │
│  │   → timer.cancel()                                        │ │
│  │   → output.turn_off()                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Timer-Finished Automation:                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ trigger: timer.finished                                   │ │
│  │ condition: IN still TRUE                                  │ │
│  │ action: output.turn_on()                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Loops (FOR, WHILE)

**Problem:** Loops block the execution thread, infinite loops freeze the system.

**Solution: Safety Guards**

```typescript
const MAX_ITERATIONS = 1000;

// WHILE gets automatic safety counter
repeat:
  while:
    - "{{ original_condition }}"
    - "{{ _safety_counter < 1000 }}"
  sequence:
    - variables:
        _safety_counter: "{{ _safety_counter + 1 }}"
    - # ... original body
```

**Compiler Warnings:**
- `W020`: WHILE without guaranteed exit condition
- `E020`: FOR with >1000 iterations

---

### 4. Transpilation & Jinja Safety

**Problem:** Sensors can be `unavailable`, `unknown`, `none` → Jinja errors.

**Solution: Defensive Jinja Generation**

```typescript
class JinjaGenerator {
  
  generateEntityRead(entityId: string, expectedType: DataType): string {
    const state = `states('${entityId}')`;
    const invalid = `['unavailable', 'unknown', 'none', '']`;
    
    switch (expectedType) {
      case "BOOL":
        return `(${state} in ['on', 'true', 'True', '1'])`;
        
      case "INT":
        return `(${state} | int(default=0) if ${state} not in ${invalid} else 0)`;
        
      case "REAL":
        return `(${state} | float(default=0.0) if ${state} not in ${invalid} else 0.0)`;
        
      case "STRING":
        return `(${state} if ${state} not in ['unavailable', 'unknown'] else '')`;
    }
  }
}
```

**Built-in Functions with Null-Safety:**
```typescript
// LIMIT with fallback
LIMIT: `{% set _v = ${val} %}` +
       `{% if _v is number %}{{ [[${mn}, _v] | max, ${mx}] | min }}` +
       `{% else %}{{ ${mn} }}{% endif %}`

// SQRT with negative number check
SQRT: `{% set _v = ${arg} %}` +
      `{% if _v is number and _v >= 0 %}{{ _v | sqrt }}` +
      `{% else %}{{ 0 }}{% endif %}`
```

**Golden Master Tests:**
Each built-in function is tested with edge cases:
- Normal values
- `unavailable`, `unknown`, `none`, `""`
- Type coercion (`"5.5"` → `5.5`)
- Boundary values

---

### 5. Deployment Architecture

**Recommendation: Trigger Dispatcher + Logic Script (Hybrid)**

```
┌─────────────────────────────────────────────────────────────────┐
│  Architecture                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  automation:                      script:                       │
│  ┌─────────────────────┐         ┌─────────────────────────┐   │
│  │ [ST] Kitchen_Trigger│         │ [ST] Kitchen_Logic      │   │
│  │                     │         │                         │   │
│  │ trigger:            │         │ sequence:               │   │
│  │   - state change    │────────▶│   - choose: ...         │   │
│  │   - timer finished  │         │   - service: ...        │   │
│  │                     │         │                         │   │
│  │ action:             │         │                         │   │
│  │   - script.call     │         │                         │   │
│  │                     │         │                         │   │
│  │ mode: single        │         │ mode: restart           │   │
│  └─────────────────────┘         └─────────────────────────┘   │
│                                                                 │
│  Benefits:                                                      │
│  • Clean separation of triggers/logic                           │
│  • Scripts individually testable                                │
│  • Separate trace for debugging                                 │
│  • Reusable                                                     │
│  • Script mode: restart = PLC-like (new input takes priority)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Concurrency & Mode Strategy

**Problem:** What happens during trigger storms?

```
Trigger 1 ──▶ Script running (with delay)
Trigger 2 ──▶ ???
Trigger 3 ──▶ ???
```

**Mode Options in HA:**

| Mode | Behavior | PLC Analogy |
|------|----------|-------------|
| `single` | Ignores new triggers during run | ❌ Input loss |
| `restart` | Aborts, restarts | ✅ New value takes priority |
| `queued` | Queues (max 10) | For sequential tasks |
| `parallel` | Multiple instances simultaneously | ⚠️ Race conditions |

**Solution: Configurable with Default `restart`**

```iecst
// Pragma for mode control
{mode: restart}  // Default - PLC-like
PROGRAM Kitchen

// Or for special cases:
{mode: queued, max_queued: 5}
PROGRAM NotificationHandler

{mode: parallel, max_parallel: 3}
PROGRAM IndependentTasks
```

**Generated YAML:**
```yaml
# Trigger automation (dispatcher only)
alias: "[ST] Kitchen"
mode: single

# Logic script (this is what matters!)
alias: "[ST] Kitchen_Logic"
mode: restart
```

---

### 7. Trigger Throttling & Debounce

**Problem:** Dependency analysis on many entities + fast sensors = "disco"

```
5 entities detected:
- sensor.temperature (every 10s)
- sensor.humidity (every 10s)  
- binary_sensor.motion (flapping)
- sensor.power (every second!)
- light.status

→ Worst case: 60+ triggers per minute
```

**Solution: Program-Level Throttle/Debounce**

```iecst
// Throttle: Max 1 execution per second
{throttle: T#1s}
PROGRAM Kitchen

// Debounce: Wait until 500ms of quiet
{debounce: T#500ms}
PROGRAM MotionHandler
```

**Throttle Implementation:**
```typescript
class ThrottleGenerator {
  
  generateThrottledAutomation(program: Program, throttle: Duration): HAAutomation {
    const lastRunHelper = `input_datetime.st_${program.name}_last_run`;
    
    return {
      alias: `[ST] ${program.name}`,
      mode: "single",
      trigger: triggers,
      
      // IMPORTANT: Robust template with fallback for first run!
      condition: [{
        condition: "template",
        value_template: `{% set last = states('${lastRunHelper}') %}
{% if last in ['unknown', 'unavailable', 'none', ''] %}
  true
{% else %}
  {{ (now() - (last | as_datetime)).total_seconds() > ${throttle.seconds} }}
{% endif %}`
      }],
      
      action: [
        // Update timestamp
        {
          service: "input_datetime.set_datetime",
          target: { entity_id: lastRunHelper },
          data: { datetime: "{{ now().isoformat() }}" }
        },
        // Call script
        {
          service: "script.turn_on",
          target: { entity_id: `script.st_${program.name}_logic` }
        }
      ]
    };
  }
  
  // Initialize helper on deploy if not existing
  async ensureThrottleHelper(program: Program): Promise<void> {
    const helperId = `input_datetime.st_${program.name}_last_run`;
    const exists = await this.helperExists(helperId);
    
    if (!exists) {
      await this.createHelper({
        platform: 'input_datetime',
        name: `ST ${program.name} Last Run`,
        has_date: true,
        has_time: true,
        // Initial: Now minus 1 hour → first run allowed
        initial: new Date(Date.now() - 3600000).toISOString()
      });
    }
  }
}
```

**Debounce Implementation:**
```typescript
generateDebouncedAutomation(program: Program, debounce: Duration): HAAutomation {
  return {
    alias: `[ST] ${program.name}`,
    mode: "restart",  // Restart = Debounce effect!
    trigger: triggers,
    
    action: [
      // Wait (aborted on new trigger)
      { delay: { seconds: debounce.seconds } },
      // Then call script
      {
        service: "script.turn_on",
        target: { entity_id: `script.st_${program.name}_logic` }
      }
    ]
  };
}
```

**Combination with Trigger Pragmas:**
```iecst
{throttle: T#2s}
PROGRAM ClimateControl
VAR
    {trigger}
    temperature AT %I* : REAL := 'sensor.temp';
    {trigger}
    humidity AT %I* : REAL := 'sensor.humidity';
    {no_trigger}  // Read but doesn't trigger
    power AT %I* : REAL := 'sensor.power';
END_VAR
```

---

### 8. Deploy Mechanism: ONLY via HA APIs!

**⚠️ CRITICAL: NO direct YAML file manipulation!**

```python
# ❌ WRONG - Never do this!
with open('/config/automations.yaml', 'w') as f:
    yaml.dump(automation, f)

# ❌ WRONG - Not this either!
shutil.copy(generated_yaml, '/config/automations.yaml')
```

**Problems with File Manipulation:**
- Overwrites user comments and formatting
- HA doesn't track changes
- No rollback on error possible
- Race conditions with HA Core
- Security risk

**✅ CORRECT: HA Storage API / WebSocket Services**

```typescript
// Create/update automation
await hass.callWS({
  type: 'config/automation/config',
  automation_id: 'st_kitchen',
  config: generatedAutomation
});

// Create/update script  
await hass.callWS({
  type: 'config/script/config',
  script_id: 'st_kitchen_logic',
  config: generatedScript
});

// Create helper
await hass.callService('input_number', 'create', {
  name: 'ST Kitchen Counter',
  min: 0,
  max: 1000000,
  mode: 'box'
});

// Reload after changes
await hass.callService('automation', 'reload', {});
await hass.callService('script', 'reload', {});
```

**Benefits:**
- HA manages storage itself
- Changes are tracked
- Rollback via HA possible
- No conflicts with manual edits

---

### 9. Deploy Safety: Atomic & Rollback

**Problem:** Deploy process can run halfway and leave system in inconsistent state.

```
Deploy Process:
1. ✓ Helper A created
2. ✓ Helper B created  
3. ✓ Automation created
4. ✗ Script creation ERROR!

→ System in inconsistent state!
```

**Solution: Transactional Deploy with Rollback**

```typescript
// deploy-manager.ts
interface DeployTransaction {
  id: string;
  timestamp: Date;
  operations: DeployOperation[];
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
}

class DeployManager {
  
  async deploy(project: STProject): Promise<DeployResult> {
    const transaction: DeployTransaction = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      operations: [],
      status: 'pending'
    };
    
    try {
      // Phase 1: Validation (no changes)
      await this.validateAll(project);
      
      // Phase 2: Backup current state
      const backup = await this.createBackup(project);
      
      // Phase 3: Collect changes (don't apply yet)
      const changes = await this.calculateChanges(project);
      transaction.operations = changes;
      
      // Phase 4: Apply changes (with tracking)
      for (const op of changes) {
        try {
          await this.applyOperation(op);
          op.status = 'applied';
        } catch (error) {
          // Rollback all previous operations
          await this.rollback(transaction);
          throw new DeployError(`Failed at ${op.entityId}`, transaction);
        }
      }
      
      // Phase 5: Verification
      const verification = await this.verifyDeployment(project);
      if (!verification.success) {
        await this.rollback(transaction);
        throw new DeployError(`Verification failed`, transaction);
      }
      
      // Phase 6: Commit
      transaction.status = 'committed';
      await this.saveTransaction(transaction);
      
      return { success: true, transactionId: transaction.id };
      
    } catch (error) {
      transaction.status = 'failed';
      await this.saveTransaction(transaction);
      throw error;
    }
  }
  
  async rollback(transaction: DeployTransaction): Promise<void> {
    // Revert operations in reverse order
    const appliedOps = transaction.operations
      .filter(op => op.status === 'applied')
      .reverse();
    
    for (const op of appliedOps) {
      await this.revertOperation(op);
    }
    
    transaction.status = 'rolled_back';
  }
  
  private async revertOperation(op: DeployOperation): Promise<void> {
    switch (op.type) {
      case 'create':
        await this.deleteEntity(op.entityId);
        break;
      case 'update':
        await this.updateEntity(op.entityId, op.previousState);
        break;
      case 'delete':
        await this.createEntity(op.entityId, op.previousState);
        break;
    }
  }
}
```

**Backup Manager:**
```typescript
class BackupManager {
  
  async createBackup(project: STProject): Promise<Backup> {
    const backup: Backup = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      projectName: project.name,
      data: {
        helpers: await this.backupHelpers(project),
        automations: await this.backupAutomations(project),
        scripts: await this.backupScripts(project)
      }
    };
    
    await this.saveBackup(backup);
    return backup;
  }
  
  async restoreBackup(backupId: string): Promise<void> {
    const backup = await this.loadBackup(backupId);
    await this.deleteProjectEntities(backup.projectName);
    
    for (const helper of backup.data.helpers) {
      await this.createHelper(helper);
    }
    // ... automations, scripts
  }
  
  // Automatic backup rotation (keep last 5)
  async cleanupOldBackups(keepCount: number = 5): Promise<void> {
    const backups = await this.listBackups();
    const toDelete = backups
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(keepCount);
    
    for (const backup of toDelete) {
      await this.deleteBackup(backup.id);
    }
  }
}
```

**Deploy UI:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│  Deploy                                                         [×]     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📦 Deploy Preview                                                       │
│                                                                          │
│  Changes:                                                                │
│    ✚ input_number.st_kitchen_counter (create)                            │
│    ✎ automation.st_kitchen (update)                                      │
│    ✎ script.st_kitchen_logic (update)                                    │
│    ✖ input_boolean.st_kitchen_oldflag (delete)                           │
│                                                                          │
│  Settings:                                                               │
│    Mode: restart                                                         │
│    Throttle: 1s                                                          │
│                                                                          │
│  ☑ Create backup before deploy                                           │
│                                                                          │
│                                    [Cancel] [Deploy]                     │
└──────────────────────────────────────────────────────────────────────────┘
```

**After Failed Deploy:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│  ❌ Deploy Failed                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Error: Failed to create script.st_kitchen_logic                         │
│         Invalid YAML: unexpected key "squence"                           │
│                                                                          │
│  Rollback Status:                                                        │
│    ✓ input_number.st_kitchen_counter (deleted)                           │
│    ✓ automation.st_kitchen (reverted)                                    │
│                                                                          │
│  System restored to previous state.                                      │
│                                                                          │
│                                              [View Details] [OK]         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 10. Debugging & Error Mapping

**Problem:** HA errors show YAML line, not ST line.

**Solution: Source Maps**

```yaml
# Generated YAML
variables:
  _st_source_map:
    "action.0.choose.0": { st_line: 7, st_file: "kitchen.st" }
    "action.0.choose.0.sequence.0": { st_line: 8, st_file: "kitchen.st" }
```

**Error Translation:**
```typescript
const translations = [
  [/UndefinedError: '(\w+)' is undefined/, 
   "Variable '$1' not declared or entity not found"],
  [/could not convert string to float/,
   "Sensor value is not a valid number (possibly 'unavailable')"],
];
```

**UI Shows:**
```
❌ Error in kitchen.st line 7:
   Variable 'sensor_temp' not declared or entity not found
   
   7 │ IF sensor_temp > 25.0 THEN
       ^^^^^^^^^^^
```

---

### 11. Restart/Init Semantics

**Problem:** What happens to persistent variables after HA restart?

**Solution: Explicit Restore Policies via Pragmas**

```iecst
VAR
    // Default: Restore if available, otherwise initial value
    counter : INT := 0;
    
    // Always start with initial value
    {reset_on_restart}
    sessionCounter : INT := 0;
    
    // Must have previous value, error if not
    {require_restore}
    criticalState : BOOL;
END_VAR
```

**Restore Logic:**
```typescript
enum RestorePolicy {
  RESTORE_OR_INIT,  // Default
  ALWAYS_INIT,      // {reset_on_restart}
  REQUIRE_RESTORE   // {require_restore}
}
```

**Migration on Schema Changes:**

The transpiler detects:
- Type changes (`INT` → `REAL`)
- Removed variables
- Range changes

UI shows migration dialog with options:
- Convert value
- Reset to initial value
- Keep old helper (orphaned)

---

## Phase Plan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 1: Foundation                                                        │
│  ════════════════════                                                       │
│  • Project setup (HACS structure, build pipeline)                           │
│  • CodeMirror 6 integration with ST syntax highlighting                     │
│  • Basic parser (Lexer + AST) for core syntax                               │
│  • Simple transpilation: IF/ELSE → choose                                   │
│  • Proof-of-concept: One ST file → One HA automation                        │
│  • Dependency analyzer (automatic trigger generation)                       │
│  • Defensive Jinja generation for entity reads                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Phase 2: Core Features                                                     │
│  ══════════════════════                                                     │
│  • Entity browser with WebSocket connection                                 │
│  • Drag & drop entity binding (AT %I* / %Q* syntax)                         │
│  • Complete parser (CASE, FOR, WHILE, all operators)                        │
│  • Built-in functions with null-safety (SEL, MUX, LIMIT, etc.)              │
│  • Type conversions                                                         │
│  • R_TRIG / F_TRIG implementation                                           │
│  • Loop safety guards                                                       │
│  • Golden master test suite for built-ins                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Phase 3: FB & Project Structure                                            │
│  ══════════════════════════════                                             │
│  • FUNCTION_BLOCK definition and instantiation                              │
│  • FUNCTION support (without instance)                                      │
│  • Project explorer UI (programs, FBs, GVLs)                                │
│  • Multi-file support                                                       │
│  • SR/RS flip-flop FBs                                                      │
│  • Import/export of ST projects                                             │
│  • Storage analyzer (automatic persistence detection)                       │
│  • Helper manager with sync & cleanup                                       │
│  • Hybrid architecture (trigger automation + logic script)                  │
│  • Mode strategy (default: restart)                                         │
│  • Throttle/debounce generator                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Phase 4: Polish & Advanced                                                 │
│  ══════════════════════════                                                 │
│  • Timer FBs (TON, TOF, TP) with timer entity pattern                       │
│  • Source maps for error mapping                                            │
│  • Error translation (HA errors → ST context)                               │
│  • Restore policy system ({reset_on_restart}, {require_restore})            │
│  • Migration handler for schema changes                                     │
│  • Transactional deploy with rollback                                       │
│  • Backup manager                                                           │
│  • Live values in editor (online mode)                                      │
│  • Documentation and examples                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase ↔ Task Mapping (T-001–T-012)

This mapping describes how the phases 1–4 defined in the plan are covered by the concrete tasks T-001–T-012:

- **Phase 1: Foundation**
  - Project setup (HACS structure, build pipeline) → **T-001**
  - CodeMirror 6 integration with ST syntax highlighting → **T-002**
  - Basic parser (Lexer + AST) → **T-003**
  - Simple transpilation (IF/ELSE → `choose`) + defensive Jinja → **T-007**
  - Dependency analyzer (automatic trigger generation) → **T-004**
  - Consolidation with archive specs → **T-006**

- **Phase 2: Core Features**
  - Complete parser (CASE, FOR, WHILE, operators) → **T-003**, **T-016**
  - Built-in functions with null-safety, type conversions → **T-007**
  - R_TRIG / F_TRIG implementation → **T-004**, **T-007**
  - Loop safety guards → **T-007**
  - Golden master test suite for built-ins → **T-007**
  - Entity browser and drag & drop AT bindings → **Not fully implemented, planned UI/integration task outside T-001–T-012 (Backlog)** 

- **Phase 3: FB & Project Structure**
  - Storage analyzer (persistence detection) → **T-005**
  - Helper manager with sync & cleanup → **T-008**, **T-020**
  - Hybrid architecture (trigger automation + logic script) → **T-007**
  - Mode strategy (default: `restart`) → **T-007**
  - Throttle/debounce generator → **T-007**
  - Project explorer / multi-file structure → **Partially covered by existing panel/editor structure, UI-specific extensions remain in backlog**

- **Phase 4: Polish & Advanced**
  - Timer FBs (TON, TOF, TP) → **T-009**
  - Source maps for error mapping → **T-010**
  - Error translation (HA errors → ST context) → **T-010**
  - Restore policy system (`{reset_on_restart}`, `{require_restore}`) → **T-011**
  - Migration handler for schema changes → **T-011**
  - Transactional deploy + backup manager → **T-008**
  - Live values in editor (online mode) → **T-012**
  - Documentation and examples → Distributed across **T-006**, **T-015**, **T-019**, **T-020**

**Deviations from Original Plan:**
- UI-specific features like the **Entity Browser with Drag & Drop** are still described as goals in the project plan but are intentionally **not** covered by T-001–T-012 and remain in the backlog.
- Several specification topics (e.g., extended analyzer/transpiler APIs) were resolved in practice through additional documentation tasks (**T-006, T-015, T-019, T-020**) and are thus explicitly documented as design evolution compared to the early archive specs.

---

## Phase 1: Foundation - Detailed Plan

### 1.1 Project Setup

```
st-hass/
├── custom_components/
│   └── st_hass/
│       ├── __init__.py          # HA Integration Entry
│       ├── manifest.json        # HACS Manifest
│       ├── config_flow.py       # Setup Flow
│       └── panel.py             # Panel Registration
├── frontend/
│   ├── src/
│   │   ├── editor/
│   │   │   ├── st-editor.ts     # CodeMirror Wrapper
│   │   │   ├── st-language.ts   # ST Language Mode
│   │   │   └── st-theme.ts      # TwinCAT-like Theme
│   │   ├── parser/
│   │   │   ├── lexer.ts         # Token Definitions
│   │   │   ├── parser.ts        # AST Generator
│   │   │   └── ast.ts           # AST Node Types
│   │   ├── analyzer/
│   │   │   ├── dependency-analyzer.ts  # Trigger Detection
│   │   │   └── storage-analyzer.ts     # Persistence Detection
│   │   ├── transpiler/
│   │   │   ├── transpiler.ts    # AST → HA YAML
│   │   │   ├── jinja-generator.ts  # Defensive Jinja
│   │   │   └── templates.ts     # HA Action Templates
│   │   ├── deploy/
│   │   │   ├── deploy-manager.ts   # Transactional Deploy
│   │   │   ├── backup-manager.ts   # Backup & Restore
│   │   │   └── helper-manager.ts   # Helper Sync
│   │   └── panel/
│   │       └── st-panel.ts      # Main Panel Component
│   ├── package.json
│   └── tsconfig.json
├── hacs.json
└── README.md
```

### 1.2 CodeMirror 6 ST Mode

**Syntax Highlighting Rules:**

```typescript
// st-language.ts
const stKeywords = [
  "PROGRAM", "END_PROGRAM",
  "FUNCTION", "END_FUNCTION",
  "FUNCTION_BLOCK", "END_FUNCTION_BLOCK",
  "VAR", "VAR_INPUT", "VAR_OUTPUT", "VAR_IN_OUT", "END_VAR",
  "IF", "THEN", "ELSIF", "ELSE", "END_IF",
  "CASE", "OF", "END_CASE",
  "FOR", "TO", "BY", "DO", "END_FOR",
  "WHILE", "END_WHILE",
  "REPEAT", "UNTIL", "END_REPEAT",
  "TRUE", "FALSE",
  "AND", "OR", "XOR", "NOT", "MOD"
];

const stTypes = ["BOOL", "INT", "DINT", "REAL", "LREAL", "STRING", "TIME"];

const stBuiltins = [
  "SEL", "MUX", "LIMIT", "MIN", "MAX",
  "ABS", "SQRT", "TRUNC", "ROUND",
  "TO_INT", "TO_DINT", "TO_REAL", "TO_LREAL", "TO_STRING", "TO_BOOL",
  "R_TRIG", "F_TRIG", "SR", "RS", "TON", "TOF", "TP"
];

const stPragmas = [
  "trigger", "no_trigger",
  "persistent", "transient",
  "reset_on_restart", "require_restore",
  "mode", "max_queued", "max_parallel",
  "throttle", "debounce"
];
```

### 1.3 Parser Architecture

**Lexer Token Types:**

```typescript
enum TokenType {
  // Literals
  INTEGER_LITERAL,    // 42, 16#FF, 2#1010
  REAL_LITERAL,       // 3.14, 1.0E-5
  STRING_LITERAL,     // 'Hello'
  TIME_LITERAL,       // T#5s, T#1h30m
  BOOL_LITERAL,       // TRUE, FALSE
  
  // Identifiers
  IDENTIFIER,         // myVar, FB_Motor
  
  // Keywords
  KEYWORD,
  
  // Operators
  ASSIGN,             // :=
  PLUS, MINUS, STAR, SLASH, MOD,
  EQ, NEQ, LT, GT, LE, GE,
  AND, OR, XOR, NOT,
  
  // Punctuation
  LPAREN, RPAREN,     // ( )
  LBRACKET, RBRACKET, // [ ]
  SEMICOLON,          // ;
  COLON,              // :
  COMMA,              // ,
  DOT,                // .
  
  // Special
  AT,                 // AT
  PERCENT_I,          // %I*
  PERCENT_Q,          // %Q*
  PRAGMA,             // {keyword} or {key: value}
  
  // Comments
  COMMENT_LINE,       // // comment
  COMMENT_BLOCK,      // (* comment *)
  
  EOF
}
```

**AST Node Structure:**

```typescript
// ast.ts
interface ASTNode {
  type: string;
  location: SourceLocation;
  pragmas?: Pragma[];
}

interface Pragma {
  name: string;
  value?: string | number | Duration;
}

interface Program extends ASTNode {
  type: "Program";
  name: string;
  variables: VariableDeclaration[];
  body: Statement[];
}

interface VariableDeclaration extends ASTNode {
  type: "VariableDeclaration";
  name: string;
  dataType: DataType;
  initialValue?: Expression;
  binding?: EntityBinding;
  section: "VAR" | "VAR_INPUT" | "VAR_OUTPUT" | "VAR_IN_OUT";
}

interface EntityBinding extends ASTNode {
  type: "EntityBinding";
  direction: "INPUT" | "OUTPUT";
  entityId: string;
}

interface IfStatement extends ASTNode {
  type: "IfStatement";
  condition: Expression;
  thenBranch: Statement[];
  elsifBranches: { condition: Expression; body: Statement[] }[];
  elseBranch?: Statement[];
}

interface CaseStatement extends ASTNode {
  type: "CaseStatement";
  selector: Expression;
  cases: { values: Expression[]; body: Statement[] }[];
  elseCase?: Statement[];
}

interface ForStatement extends ASTNode {
  type: "ForStatement";
  variable: string;
  from: Expression;
  to: Expression;
  by?: Expression;
  body: Statement[];
}

interface WhileStatement extends ASTNode {
  type: "WhileStatement";
  condition: Expression;
  body: Statement[];
}

interface Assignment extends ASTNode {
  type: "Assignment";
  target: string;
  value: Expression;
}

interface FunctionCall extends ASTNode {
  type: "FunctionCall";
  name: string;
  arguments: Expression[];
}
```

### 1.4 Dependency Analyzer

```typescript
// dependency-analyzer.ts
interface TriggerConfig {
  platform: string;
  entity_id: string;
  from?: string;
  to?: string;
  id?: string;
}

class DependencyAnalyzer {
  
  analyzeProgram(ast: Program): AnalysisResult {
    const triggers: TriggerConfig[] = [];
    const diagnostics: Diagnostic[] = [];
    
    // 1. Find all entity reads
    const readEntities = this.findReadEntities(ast);
    
    // 2. Pragma-controlled triggers
    for (const entity of readEntities) {
      const varDecl = this.lookupVariable(ast, entity.varName);
      
      if (varDecl.pragmas?.some(p => p.name === "no_trigger")) continue;
      
      if (varDecl.pragmas?.some(p => p.name === "trigger") || 
          varDecl.binding?.direction === "INPUT") {
        triggers.push({
          platform: "state",
          entity_id: entity.entityId,
          id: `dep_${entity.varName}`
        });
      }
    }
    
    // 3. Explicit R_TRIG/F_TRIG
    const explicitTrigs = this.findExplicitTriggers(ast);
    for (const trig of explicitTrigs) {
      const idx = triggers.findIndex(t => t.entity_id === trig.entity_id);
      if (idx >= 0) triggers[idx] = trig;
      else triggers.push(trig);
    }
    
    // 4. Warnings
    if (triggers.length === 0) {
      diagnostics.push({
        severity: "Warning",
        code: "W010",
        message: "No triggers detected. Program will never execute.",
        location: ast.location
      });
    }
    
    if (triggers.length > 10) {
      diagnostics.push({
        severity: "Info",
        code: "I010",
        message: `Program triggers on ${triggers.length} entities. Consider using {trigger} pragma.`,
        location: ast.location
      });
    }
    
    return { triggers, diagnostics };
  }
}
```

### 1.5 Defensive Jinja Generator

```typescript
// jinja-generator.ts
class JinjaGenerator {
  
  generateEntityRead(entityId: string, expectedType: DataType): string {
    const state = `states('${entityId}')`;
    const invalid = `['unavailable', 'unknown', 'none', '']`;
    
    switch (expectedType) {
      case "BOOL":
        return `(${state} in ['on', 'true', 'True', '1'])`;
        
      case "INT":
      case "DINT":
        return `(${state} | int(default=0) if ${state} not in ${invalid} else 0)`;
        
      case "REAL":
      case "LREAL":
        return `(${state} | float(default=0.0) if ${state} not in ${invalid} else 0.0)`;
        
      case "STRING":
        return `(${state} if ${state} not in ['unavailable', 'unknown'] else '')`;
        
      default:
        return state;
    }
  }
  
  generateBuiltin(name: string, args: string[]): string {
    switch (name) {
      case "SEL":
        return `{% if ${args[0]} %}${args[2]}{% else %}${args[1]}{% endif %}`;
        
      case "LIMIT":
        return `{% set _v = ${args[1]} %}` +
               `{% if _v is number %}{{ [[${args[0]}, _v] | max, ${args[2]}] | min }}` +
               `{% else %}{{ ${args[0]} }}{% endif %}`;
               
      case "MIN":
        return `{{ min(${args[0]}, ${args[1]}) }}`;
        
      case "MAX":
        return `{{ max(${args[0]}, ${args[1]}) }}`;
        
      case "ABS":
        return `{{ ${args[0]} | abs }}`;
        
      case "SQRT":
        return `{% set _v = ${args[0]} %}` +
               `{% if _v is number and _v >= 0 %}{{ _v | sqrt }}` +
               `{% else %}{{ 0 }}{% endif %}`;
               
      case "TRUNC":
        return `{{ ${args[0]} | int }}`;
        
      case "ROUND":
        return `{{ ${args[0]} | round }}`;
        
      case "TO_INT":
        return `{{ ${args[0]} | int(default=0) }}`;
        
      case "TO_REAL":
        return `{{ ${args[0]} | float(default=0.0) }}`;
        
      case "TO_STRING":
        return `{{ ${args[0]} | string }}`;
        
      case "TO_BOOL":
        return `{{ ${args[0]} | bool }}`;
        
      default:
        throw new Error(`Unknown builtin: ${name}`);
    }
  }
}
```

### 1.6 Transpiler Basics

**Example Transformation:**

```
ST Code                              HA YAML Output
═══════════════════════════════      ═══════════════════════════════════════
{mode: restart}                      # Automation (Dispatcher)
{throttle: T#1s}                     alias: "[ST] Test"
PROGRAM Test                         id: "st_test"
VAR                                  mode: single
  {trigger}                          trigger:
  motion AT %I* : BOOL                 - platform: state
    := 'binary_sensor.pir';              entity_id: binary_sensor.pir
  light AT %Q* : BOOL                    id: dep_motion
    := 'light.lamp';                 condition:
END_VAR                                - condition: template
                                         value_template: >-
IF motion THEN                             {{ (now() - states('input_datetime...
  light := TRUE;                     action:
ELSE                                   - service: input_datetime.set_datetime
  light := FALSE;                        ...
END_IF;                                - service: script.turn_on
                                         target:
END_PROGRAM                                entity_id: script.st_test_logic

                                     # Script (Logic)
                                     alias: "[ST] Test_Logic"
                                     mode: restart
                                     sequence:
                                       - choose:
                                           - conditions:
                                               - condition: template
                                                 value_template: >-
                                                   {{ states('binary_sensor.pir') 
                                                      in ['on', 'true', '1'] }}
                                             sequence:
                                               - service: light.turn_on
                                                 target:
                                                   entity_id: light.lamp
                                         default:
                                           - service: light.turn_off
                                             target:
                                               entity_id: light.lamp
```

### 1.7 Minimal UI

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ST for Home Assistant                                    [▶ Deploy] [⚙]│
├──────────────────────────────────────────────────────────────────────────┤
│  1 │ {mode: restart}                                                     │
│  2 │ {throttle: T#1s}                                                    │
│  3 │ PROGRAM Kitchen_Light                                               │
│  4 │ VAR                                                                 │
│  5 │   {trigger}                                                         │
│  6 │   motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';           │
│  7 │   light AT %Q* : BOOL := 'light.kitchen';                           │
│  8 │ END_VAR                                                             │
│  9 │                                                                     │
│ 10 │ IF motion THEN                                                      │
│ 11 │   light := TRUE;                                                    │
│ 12 │ ELSE                                                                │
│ 13 │   light := FALSE;                                                   │
│ 14 │ END_IF;                                                             │
│ 15 │                                                                     │
│ 16 │ END_PROGRAM                                                         │
├──────────────────────────────────────────────────────────────────────────┤
│  ✓ Syntax OK │ Triggers: 1 │ Mode: restart │ Throttle: 1s               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Core Features - Detailed Plan

### 2.1 Entity Browser

**WebSocket Integration:**

```typescript
// entity-browser.ts
class EntityBrowser {
  private connection: HomeAssistantConnection;
  private entities: Map<string, EntityState>;
  
  async connect() {
    this.connection = await createConnection({ auth: getAuth() });
    
    subscribeEntities(this.connection, (entities) => {
      this.entities = entities;
      this.updateUI();
    });
  }
  
  getEntitiesByDomain(domain: string): EntityState[] {
    return Array.from(this.entities.values())
      .filter(e => e.entity_id.startsWith(domain + "."));
  }
  
  inferDataType(entityId: string): DataType {
    const domain = entityId.split('.')[0];
    const state = this.entities.get(entityId)?.state;
    
    if (['binary_sensor', 'switch', 'light', 'input_boolean'].includes(domain)) {
      return 'BOOL';
    }
    if (domain === 'input_number' || domain === 'number') {
      return 'REAL';
    }
    if (domain === 'sensor') {
      if (!isNaN(parseFloat(state))) return 'REAL';
      return 'STRING';
    }
    return 'STRING';
  }
  
  onDragStart(entityId: string, direction: "input" | "output"): string {
    const varName = this.entityIdToVarName(entityId);
    const dataType = this.inferDataType(entityId);
    const binding = direction === "input" ? "%I*" : "%Q*";
    
    return `${varName} AT ${binding} : ${dataType} := '${entityId}';`;
  }
}
```

**UI Component:**

```
┌─────────────────────────────────┐
│  🔍 Filter entities...          │
├─────────────────────────────────┤
│  Domain: [All ▼]                │
├─────────────────────────────────┤
│ ▼ 💡 light (12)                 │
│   │ ○ light.kitchen        ON   │ ← Drag for output
│   │ ○ light.bedroom        OFF  │
│                                 │
│ ▼ 📡 binary_sensor (8)          │
│   │ ● binary_sensor.motion ON   │ ← Drag for input
│   │ ● binary_sensor.door   OFF  │
│                                 │
│ ▶ 🌡️ sensor (24)                │
│ ▶ 🔌 switch (6)                 │
│ ▶ 🎚️ input_boolean (3)          │
│ ▶ 🔢 input_number (2)           │
├─────────────────────────────────┤
│ [+ Create Helper]               │
└─────────────────────────────────┘

● = Input (read-only)
○ = Output (controllable)
```

### 2.2 Complete Parser

**Operator Precedence (IEC 61131-3):**

| Priority | Operators |
|----------|-----------|
| 1 (highest) | `()`, function call |
| 2 | `NOT`, `-` (unary) |
| 3 | `*`, `/`, `MOD` |
| 4 | `+`, `-` |
| 5 | `<`, `>`, `<=`, `>=` |
| 6 | `=`, `<>` |
| 7 | `AND`, `&` |
| 8 | `XOR` |
| 9 (lowest) | `OR` |

### 2.3 Loop Safety Guards

```typescript
// loop-transpiler.ts
const MAX_ITERATIONS = 1000;

class LoopTranspiler {
  
  transpileWhile(stmt: WhileStatement, ctx: Context): HAAction {
    const safetyVar = `_loop_safety_${ctx.getUniqueId()}`;
    
    ctx.diagnostics.push({
      severity: "Warning",
      code: "W020",
      message: `WHILE loop has safety limit of ${MAX_ITERATIONS} iterations.`,
      location: stmt.location
    });
    
    return {
      variables: { [safetyVar]: 0 },
      repeat: {
        while: [
          { condition: "template", value_template: this.transpileExpr(stmt.condition) },
          { condition: "template", value_template: `{{ ${safetyVar} < ${MAX_ITERATIONS} }}` }
        ],
        sequence: [
          { variables: { [safetyVar]: `{{ ${safetyVar} + 1 }}` } },
          ...this.transpileStatements(stmt.body, ctx)
        ]
      }
    };
  }
  
  transpileFor(stmt: ForStatement, ctx: Context): HAAction {
    const iterations = this.calculateIterations(stmt);
    
    if (iterations > MAX_ITERATIONS) {
      ctx.diagnostics.push({
        severity: "Error",
        code: "E020",
        message: `FOR loop exceeds ${MAX_ITERATIONS} iterations (${iterations}).`,
        location: stmt.location
      });
    }
    
    return {
      repeat: {
        count: Math.min(iterations, MAX_ITERATIONS),
        sequence: this.transpileStatements(stmt.body, ctx)
      }
    };
  }
}
```

### 2.4 Golden Master Test Suite

```typescript
// tests/builtins.test.ts
describe('Built-in Functions', () => {
  
  const testRunner = new HATemplateTestRunner();
  
  describe('LIMIT', () => {
    const cases = [
      // Normal
      { args: [0, 5, 10], expected: 5 },
      { args: [0, -5, 10], expected: 0 },
      { args: [0, 15, 10], expected: 10 },
      // Edge cases
      { args: [0, 'unavailable', 10], expected: 0 },
      { args: [0, 'unknown', 10], expected: 0 },
      { args: [0, null, 10], expected: 0 },
      // Type coercion
      { args: [0, '5.5', 10], expected: 5.5 },
    ];
    
    cases.forEach(({ args, expected }) => {
      it(`LIMIT(${args.join(', ')}) = ${expected}`, async () => {
        const jinja = generator.generateBuiltin('LIMIT', args.map(String));
        const result = await testRunner.evaluate(jinja);
        expect(result).toBeCloseTo(expected);
      });
    });
  });
  
  // Additional built-ins...
});
```

---

## Phase 3: FB & Project Structure - Detailed Plan

### 3.1 Storage Analyzer

```typescript
// storage-analyzer.ts
enum StorageType {
  TRANSIENT,
  PERSISTENT,
  DERIVED
}

class StorageAnalyzer {
  
  analyzeVariable(varDecl: VariableDeclaration, usages: Usage[]): StorageDecision {
    
    // 1. Entity-bound → DERIVED
    if (varDecl.binding) {
      return { type: StorageType.DERIVED };
    }
    
    // 2. Explicit pragmas
    if (varDecl.pragmas?.some(p => p.name === "persistent")) {
      return { type: StorageType.PERSISTENT, reason: "Explicit pragma" };
    }
    if (varDecl.pragmas?.some(p => p.name === "transient")) {
      return { type: StorageType.TRANSIENT, reason: "Explicit pragma" };
    }
    
    // 3. Automatic detection
    const needsPersistence = 
      this.hasSelfReference(varDecl, usages) ||
      this.isFBInstance(varDecl) ||
      this.isTimerRelated(varDecl);
    
    if (needsPersistence) {
      return { 
        type: StorageType.PERSISTENT, 
        reason: "Auto-detected: self-reference or stateful FB" 
      };
    }
    
    return { type: StorageType.TRANSIENT };
  }
}
```

### 3.2 Helper Manager

```typescript
// helper-manager.ts
class HelperManager {
  
  async syncHelpers(project: STProject): Promise<SyncResult> {
    const required = this.analyzeRequiredHelpers(project);
    const existing = await this.findExistingSTHelpers();
    
    const toCreate = required.filter(h => !existing.has(h.id));
    const toDelete = [...existing.values()].filter(h => !required.has(h.id));
    const toUpdate = required.filter(h => this.needsUpdate(h, existing.get(h.id)));
    
    if (toDelete.length > 0) {
      return { status: "confirmation_required", toCreate, toDelete, toUpdate };
    }
    
    await this.applyChanges(toCreate, toDelete, toUpdate);
    return { status: "success" };
  }
  
  private getHelperId(project: string, program: string, variable: string): string {
    return `st_${project}_${program}_${variable}`.toLowerCase();
  }
}
```

### 3.3 Throttle/Debounce Generator

```typescript
// throttle-generator.ts
class ThrottleGenerator {
  
  generateThrottledAutomation(
    program: Program, 
    triggers: TriggerConfig[],
    throttle: Duration
  ): HAAutomation {
    
    const lastRunHelper = `input_datetime.st_${program.name}_last_run`;
    
    return {
      alias: `[ST] ${program.name}`,
      mode: "single",
      trigger: triggers,
      
      condition: [{
        condition: "template",
        value_template: `{{ 
          (now() - states('${lastRunHelper}') | as_datetime).total_seconds() 
          > ${throttle.seconds} 
        }}`
      }],
      
      action: [
        {
          service: "input_datetime.set_datetime",
          target: { entity_id: lastRunHelper },
          data: { datetime: "{{ now().isoformat() }}" }
        },
        {
          service: "script.turn_on",
          target: { entity_id: `script.st_${program.name}_logic` }
        }
      ]
    };
  }
  
  generateDebouncedAutomation(
    program: Program,
    triggers: TriggerConfig[], 
    debounce: Duration
  ): HAAutomation {
    
    return {
      alias: `[ST] ${program.name}`,
      mode: "restart",  // Restart = Debounce!
      trigger: triggers,
      
      action: [
        { delay: { seconds: debounce.seconds } },
        {
          service: "script.turn_on",
          target: { entity_id: `script.st_${program.name}_logic` }
        }
      ]
    };
  }
}
```

### 3.4 Project Explorer UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ST for Home Assistant                              [▶ Deploy All] [⚙] [?] │
├────────────────────┬────────────────────────────────────────────────────────┤
│ 📁 Project         │  Kitchen_Automation.st                    [×]         │
│ ├─ 📂 Programs     ├────────────────────────────────────────────────────────┤
│ │  ├─ 📄 Kitchen   │  1 │ {mode: restart}                                   │
│ │  ├─ 📄 Bedroom   │  2 │ {throttle: T#1s}                                  │
│ │  └─ 📄 Garden    │  3 │ PROGRAM Kitchen_Automation                        │
│ ├─ 📂 FBs          │  4 │ VAR                                               │
│ │  ├─ 📄 FB_Motion │  5 │   {trigger}                                       │
│ │  ├─ 📄 FB_Dimmer │  6 │   motion AT %I* : BOOL                            │
│ │  └─ 📄 FB_Thermo │  7 │     := 'binary_sensor.kitchen_motion';            │
│ ├─ 📂 Functions    │  8 │                                                   │
│ │  └─ 📄 FC_Scale  │  9 │   {persistent}                                    │
│ └─ 📂 GVL          │ 10 │   counter : INT := 0;                             │
│    └─ 📄 Entities  │ 11 │                                                   │
│                    │ 12 │   mainLight AT %Q* : BOOL := 'light.kitchen';     │
│ ──────────────────│ 13 │ END_VAR                                           │
│ 🏠 Entities       │ 14 │                                                   │
│ ├─ 💡 Lights      │ 15 │ IF motion THEN                                    │
│ ├─ 📡 Sensors     │ 16 │   mainLight := TRUE;                              │
│ └─ 🔌 Switches    │ 17 │   counter := counter + 1;                         │
│                    │ 18 │ END_IF;                                           │
│ [+ New Program]    │ 19 │                                                   │
│ [+ New FB]         │ 20 │ END_PROGRAM                                       │
├────────────────────┼────────────────────────────────────────────────────────┤
│ Problems     │ Output     │ Helpers     │ Generated YAML                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ ✓ No problems found                                                         │
│ ℹ Triggers: 1 (motion) │ Mode: restart │ Throttle: 1s                       │
│ ℹ Persistent: 1 (counter → input_number.st_project_kitchen_counter)         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 4: Polish & Advanced - Detailed Plan

### 4.1 Timer FB Transpiler

```typescript
// timer-transpiler.ts
class TimerTranspiler {
  
  transpileTON(instance: FBInstance, ctx: Context): TimerResult {
    const timerId = `timer.st_${ctx.program}_${instance.name}`;
    const outputId = `input_boolean.st_${ctx.program}_${instance.name}_q`;
    
    return {
      helpers: [
        { platform: "timer", id: timerId },
        { platform: "input_boolean", id: outputId }
      ],
      
      mainActions: [{
        choose: [
          {
            conditions: [
              { condition: "template", value_template: `{{ ${instance.inputs.IN} }}` },
              { condition: "state", entity_id: timerId, state: "idle" }
            ],
            sequence: [{
              service: "timer.start",
              target: { entity_id: timerId },
              data: { duration: this.timeToSeconds(instance.inputs.PT) }
            }]
          },
          {
            conditions: [
              { condition: "template", value_template: `{{ not ${instance.inputs.IN} }}` }
            ],
            sequence: [
              { service: "timer.cancel", target: { entity_id: timerId } },
              { service: "input_boolean.turn_off", target: { entity_id: outputId } }
            ]
          }
        ]
      }],
      
      additionalAutomation: {
        alias: `[ST] ${ctx.program} - ${instance.name} finished`,
        trigger: [{
          platform: "event",
          event_type: "timer.finished",
          event_data: { entity_id: timerId }
        }],
        condition: [{
          condition: "template",
          value_template: `{{ ${this.getEntityState(instance.inputs.IN)} }}`
        }],
        action: [{
          service: "input_boolean.turn_on",
          target: { entity_id: outputId }
        }]
      },
      
      outputMapping: {
        Q: `states('${outputId}') == 'on'`
      }
    };
  }
}
```

### 4.2 Deploy Manager (Transactional)

```typescript
// deploy-manager.ts
class DeployManager {
  
  async deploy(project: STProject): Promise<DeployResult> {
    const transaction: DeployTransaction = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      operations: [],
      status: 'pending'
    };
    
    try {
      // Phase 1: Validation
      await this.validateAll(project);
      
      // Phase 2: Backup
      const backup = await this.backupManager.createBackup(project);
      
      // Phase 3: Calculate changes
      const changes = await this.calculateChanges(project);
      transaction.operations = changes;
      
      // Phase 4: Apply with tracking
      for (const op of changes) {
        try {
          await this.applyOperation(op);
          op.status = 'applied';
        } catch (error) {
          await this.rollback(transaction);
          throw new DeployError(`Failed at ${op.entityId}`, transaction);
        }
      }
      
      // Phase 5: Verification
      const verification = await this.verifyDeployment(project);
      if (!verification.success) {
        await this.rollback(transaction);
        throw new DeployError(`Verification failed`, transaction);
      }
      
      // Phase 6: Commit
      transaction.status = 'committed';
      await this.saveTransaction(transaction);
      
      return { success: true, transactionId: transaction.id };
      
    } catch (error) {
      transaction.status = 'failed';
      await this.saveTransaction(transaction);
      throw error;
    }
  }
  
  async rollback(transaction: DeployTransaction): Promise<void> {
    const appliedOps = transaction.operations
      .filter(op => op.status === 'applied')
      .reverse();
    
    for (const op of appliedOps) {
      await this.revertOperation(op);
    }
    
    transaction.status = 'rolled_back';
  }
}
```

### 4.3 Source Maps & Error Mapping

```typescript
// source-map.ts
class SourceMapper {
  private map: Map<string, SourceMapEntry> = new Map();
  
  record(yamlPath: string, stLocation: SourceLocation): void {
    this.map.set(yamlPath, {
      st_file: stLocation.file,
      st_line: stLocation.line
    });
  }
  
  toJSON(): Record<string, SourceMapEntry> {
    return Object.fromEntries(this.map);
  }
}

// error-mapper.ts
class ErrorMapper {
  
  private translations: [RegExp, string][] = [
    [/UndefinedError: '(\w+)' is undefined/,
     "Variable '$1' not declared or entity not found"],
    [/could not convert string to float/,
     "Sensor value is not a valid number (possibly 'unavailable')"],
  ];
  
  async mapError(haError: HALogEntry): Promise<MappedError | null> {
    const automationId = this.extractAutomationId(haError);
    if (!automationId?.startsWith('st_')) return null;
    
    const sourceMap = await this.loadSourceMap(automationId);
    const yamlPath = this.extractYamlPath(haError);
    const stLocation = sourceMap?.[yamlPath];
    
    return {
      originalError: haError.message,
      translatedError: this.translate(haError.message),
      stFile: stLocation?.st_file,
      stLine: stLocation?.st_line
    };
  }
}
```

### 4.4 Restore Policy & Migration

```typescript
// restore-handler.ts
enum RestorePolicy {
  RESTORE_OR_INIT,
  ALWAYS_INIT,
  REQUIRE_RESTORE
}

class RestoreHandler {
  
  getPolicy(varDecl: VariableDeclaration): RestorePolicy {
    if (varDecl.pragmas?.some(p => p.name === "reset_on_restart")) {
      return RestorePolicy.ALWAYS_INIT;
    }
    if (varDecl.pragmas?.some(p => p.name === "require_restore")) {
      return RestorePolicy.REQUIRE_RESTORE;
    }
    return RestorePolicy.RESTORE_OR_INIT;
  }
}

// migration-handler.ts
class MigrationHandler {
  
  detectIssues(oldSchema: VarSchema[], newSchema: VarSchema[]): MigrationIssue[] {
    const issues: MigrationIssue[] = [];
    
    for (const oldVar of oldSchema) {
      const newVar = newSchema.find(v => v.name === oldVar.name);
      
      if (!newVar) {
        issues.push({
          type: 'removed',
          variable: oldVar.name,
          options: [
            { id: 'delete', label: 'Delete helper' },
            { id: 'keep', label: 'Keep (orphaned)' }
          ]
        });
        continue;
      }
      
      if (oldVar.dataType !== newVar.dataType) {
        issues.push({
          type: 'type_change',
          variable: oldVar.name,
          details: `${oldVar.dataType} → ${newVar.dataType}`,
          options: [
            { id: 'convert', label: 'Convert value' },
            { id: 'reset', label: 'Reset to initial' }
          ]
        });
      }
    }
    
    return issues;
  }
}
```

### 4.5 Live Values / Online Mode

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Kitchen_Automation.st                          [● ONLINE] [⏸ Pause]    │
├──────────────────────────────────────────────────────────────────────────┤
│  1 │ {mode: restart}                                                     │
│  2 │ {throttle: T#1s}                                                    │
│  3 │ PROGRAM Kitchen_Automation                                          │
│  4 │ VAR                                                                 │
│  5 │   {trigger}                                                         │
│  6 │   motion AT %I* : BOOL := '...';            │ TRUE  │ ← Live       │
│  7 │   temperature AT %I* : REAL := '...';       │ 21.5  │              │
│  8 │                                                                     │
│  9 │   {persistent}                                                      │
│ 10 │   counter : INT := 0;                       │ 42    │              │
│ 11 │                                                                     │
│ 12 │   mainLight AT %Q* : BOOL := '...';         │ TRUE  │              │
│ 13 │ END_VAR                                                             │
│ 14 │                                                                     │
│ 15 │ IF motion THEN  ─────────────────────────▶  │ TRUE  │              │
│ 16 │   mainLight := TRUE;                                                │
│ 17 │   counter := counter + 1;                                           │
│ 18 │ END_IF;                                                             │
│ 19 │                                                                     │
│ 20 │ END_PROGRAM                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Pragma Reference

### Trigger Control
| Pragma | Context | Description |
|--------|---------|-------------|
| `{trigger}` | Variable | Entity change triggers automation |
| `{no_trigger}` | Variable | Entity is read but doesn't trigger |

### Persistence
| Pragma | Context | Description |
|--------|---------|-------------|
| `{persistent}` | Variable | Value is stored in helper |
| `{transient}` | Variable | Value only during run (default) |
| `{reset_on_restart}` | Variable | Always use initial value after HA restart |
| `{require_restore}` | Variable | Error if no stored value exists |

### Concurrency & Throttling
| Pragma | Context | Description | Default |
|--------|---------|-------------|---------|
| `{mode: restart\|single\|queued\|parallel}` | Program | Script execution mode | `restart` |
| `{max_queued: N}` | Program | Max queue size (with `queued`) | `10` |
| `{max_parallel: N}` | Program | Max parallel instances | `3` |
| `{throttle: TIME}` | Program | Min time between executions | - |
| `{debounce: TIME}` | Program | Wait for quiet before execution | - |

---

## Risks & Mitigations

| Risk | Status | Mitigation |
|------|--------|------------|
| Cycle vs Event | 🟢 Solved | Dependency Analysis + Trigger Pragmas |
| State Persistence | 🟢 Solved | Tiered Storage + Auto-Cleanup + Pragmas |
| Timer Complexity | 🟡 Medium | Timer Entity Pattern + Separate Automations |
| Loop Blocking | 🟢 Solved | Safety Guards + Compiler Warnings |
| Jinja Pitfalls | 🟢 Solved | Defensive Generation + Golden Master Tests |
| Debugging | 🟢 Solved | Source Maps + Error Translation |
| Restart Semantics | 🟢 Solved | Explicit Pragmas + Migration UI |
| Trigger Storms | 🟢 Solved | Throttle/Debounce Pragmas |
| Race Conditions | 🟢 Solved | Mode Strategy (default: restart) |
| Deploy Inconsistency | 🟢 Solved | Transactional Deploy + Rollback + Backup |
| Parser Complexity | 🟡 Medium | Extend iteratively, start with minimum |
| **YAML File Manipulation** | 🟢 Solved | **ONLY use HA Storage API** |
| **Throttle Helper Empty** | 🟢 Solved | **Fallback in template + Init on deploy** |
| **Parser Choice** | 🟢 Solved | Chevrotain selected (see `03_Parser_Spike.md`, T-003, T-016) |

---

## Resources & Links

**Parser:**
- Chevrotain: https://chevrotain.io/
- Nearley.js: https://nearley.js.org/
- IEC 61131-3 Grammar Reference

**CodeMirror 6:**
- Documentation: https://codemirror.net/
- Language Support: https://codemirror.net/examples/lang-package/

**Home Assistant:**
- WebSocket API: https://developers.home-assistant.io/docs/api/websocket
- Custom Panels: https://developers.home-assistant.io/docs/frontend/custom-ui/creating-custom-panels
- HACS: https://hacs.xyz/docs/publish/start

**Reference Projects:**
- CAFE: https://github.com/FezVrasta/cafe-hass
- HA Frontend: https://github.com/home-assistant/frontend

---

## Next Steps

1. **Create repository** with basic structure
2. **Set up dev environment** (Node, Python, HA Dev Container)
3. **CodeMirror 6 spike** - ST syntax highlighting PoC
4. **Parser spike** - Minimal IF/THEN parser with Chevrotain
5. **Dependency analyzer spike** - Automatic trigger detection
