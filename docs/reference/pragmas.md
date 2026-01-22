# Pragma Reference

Pragmas are special directives that control how your ST program behaves. They are written in curly braces: `{pragma_name}` or `{pragma_name: value}`.

## Table of Contents

1. [Program-Level Pragmas](#program-level-pragmas)
   - [mode](#mode)
   - [throttle](#throttle)
   - [debounce](#debounce)
   - [max_queued](#max_queued)
   - [max_parallel](#max_parallel)
2. [Variable-Level Pragmas](#variable-level-pragmas)
   - [trigger](#trigger)
   - [no_trigger](#no_trigger)
   - [persistent](#persistent)
   - [transient](#transient)
   - [reset_on_restart](#reset_on_restart)
   - [require_restore](#require_restore)

---

## Program-Level Pragmas

Program-level pragmas are placed at the top of your program, before `PROGRAM`.

### mode

Controls how the automation handles new triggers while running.

**Syntax:**
```iecst
{mode: restart}    // Default - recommended
{mode: single}
{mode: queued}
{mode: parallel}
```

**Options:**

| Mode | Behavior | Use Case |
|------|----------|----------|
| `restart` | New trigger aborts current execution and restarts | **Recommended** - Most PLC-like behavior |
| `single` | Ignores new triggers while running | Sequential tasks that must complete |
| `queued` | Queues triggers (up to max_queued) | Tasks that must run in order |
| `parallel` | Runs multiple instances simultaneously | Independent, non-conflicting tasks |

**Example:**
```iecst
{mode: restart}
PROGRAM Motion_Light
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.motion';
    light AT %Q* : BOOL := 'light.example';
END_VAR

// If motion triggers again while this is running,
// it will restart with the new value
light := motion;

END_PROGRAM
```

**When to Use:**
- `restart`: Most automations (default, recommended)
- `single`: Critical tasks that must not be interrupted
- `queued`: Sequential processing (e.g., notifications)
- `parallel`: Independent tasks (use with caution)

---

### throttle

Limits the maximum execution rate of the automation.

**Syntax:**
```iecst
{throttle: T#30s}   // Maximum once per 30 seconds
{throttle: T#1m}    // Maximum once per minute
{throttle: T#5s}    // Maximum once per 5 seconds
```

**Example:**
```iecst
{throttle: T#30s}
PROGRAM Climate_Control
VAR
    {trigger}
    temperature AT %I* : REAL := 'sensor.temperature';
    // ... rest of program
END_VAR
```

**When to Use:**
- Fast-updating sensors (temperature updates every second)
- Reducing load on Home Assistant
- Preventing excessive automation runs
- Rate-limiting expensive operations

**Note:** Throttle is a maximum rate. If triggers are less frequent, the automation runs normally.

---

### debounce

Waits for a period of no triggers before executing.

**Syntax:**
```iecst
{debounce: T#500ms}   // Wait 500ms after last trigger
{debounce: T#2s}       // Wait 2 seconds after last trigger
```

**Example:**
```iecst
{debounce: T#500ms}
PROGRAM Noisy_Sensor
VAR
    {trigger}
    button AT %I* : BOOL := 'binary_sensor.noisy_button';
    // ... rest of program
END_VAR
```

**Behavior:**
- When a trigger occurs, wait for the debounce period
- If another trigger occurs during the wait, restart the wait
- Only execute after the full debounce period with no new triggers

**When to Use:**
- Noisy sensors (rapid state changes)
- Buttons with contact bounce
- Motion sensors with interference
- Preventing multiple triggers from single event

**Difference from throttle:**
- `throttle`: Maximum rate (executes at most once per period)
- `debounce`: Wait for quiet period (executes after no triggers for period)

---

### max_queued

Maximum number of queued triggers when using `{mode: queued}`.

**Syntax:**
```iecst
{mode: queued, max_queued: 10}   // Default: 10
{mode: queued, max_queued: 5}    // Queue up to 5 triggers
```

**Example:**
```iecst
{mode: queued, max_queued: 5}
PROGRAM Notification_Handler
VAR
    {trigger}
    event AT %I* : BOOL := 'binary_sensor.event';
    // ... rest of program
END_VAR
```

**When to Use:**
- With `{mode: queued}` only
- Limiting memory usage
- Preventing unbounded queue growth

---

### max_parallel

Maximum number of parallel instances when using `{mode: parallel}`.

**Syntax:**
```iecst
{mode: parallel, max_parallel: 3}   // Run up to 3 instances
{mode: parallel, max_parallel: 1}   // Effectively same as single
```

**Example:**
```iecst
{mode: parallel, max_parallel: 3}
PROGRAM Independent_Task
VAR
    {trigger}
    task AT %I* : BOOL := 'binary_sensor.task';
    // ... rest of program
END_VAR
```

**When to Use:**
- With `{mode: parallel}` only
- Limiting resource usage
- Preventing too many simultaneous instances

**Warning:** Use parallel mode with caution. Ensure your logic is thread-safe and doesn't conflict with concurrent executions.

---

## Variable-Level Pragmas

Variable-level pragmas are placed directly above variable declarations.

### trigger

Marks a variable as a trigger source. When this entity's state changes, the automation runs.

**Syntax:**
```iecst
{trigger}
variable_name AT %I* : TYPE := 'entity.id';
```

**Example:**
```iecst
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.motion';
    
    {no_trigger}
    temperature AT %I* : REAL := 'sensor.temperature';
END_VAR
```

**When to Use:**
- Entities that should trigger the automation
- Primary inputs that drive the logic
- State changes that require immediate response

**Note:** At least one variable must have `{trigger}` for the automation to run.

---

### no_trigger

Marks a variable as read-only (doesn't trigger the automation).

**Syntax:**
```iecst
{no_trigger}
variable_name AT %I* : TYPE := 'entity.id';
```

**Example:**
```iecst
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.motion';
    
    {no_trigger}
    target_temp AT %I* : REAL := 'input_number.target';
END_VAR
```

**When to Use:**
- Configuration values (targets, thresholds)
- Entities that change infrequently
- Reducing unnecessary automation triggers
- Improving performance

**Note:** Variables without `{trigger}` or `{no_trigger}` default to triggering behavior (for backward compatibility).

---

### persistent

Stores the variable's value in a Home Assistant helper, persisting across restarts.

**Syntax:**
```iecst
{persistent}
variable_name : TYPE := initial_value;
```

**Example:**
```iecst
VAR
    {persistent}
    counter : INT := 0;
    
    {persistent}
    threshold : REAL := 20.0;
    
    {persistent}
    state : BOOL := FALSE;
END_VAR
```

**Behavior:**
- Value is stored in an `input_number`, `input_boolean`, or `input_text` helper
- Survives Home Assistant restarts
- Can be modified in Developer Tools → States
- Helper name: `input_<type>.st_<project>_<program>_<variable>`

**When to Use:**
- Counters and accumulators
- Configuration values
- State variables
- Any value that must survive restarts

**Note:** Only works with variables that are self-referencing (assigned to themselves or used in logic). Simple constants don't need persistence.

---

### transient

Explicitly marks a variable as non-persistent (default behavior).

**Syntax:**
```iecst
{transient}
variable_name : TYPE := initial_value;
```

**Example:**
```iecst
VAR
    {transient}
    temp_calculation : REAL := 0.0;
    
    {transient}
    intermediate_result : INT;
END_VAR
```

**When to Use:**
- Temporary calculations
- Intermediate values
- Values that should reset each run
- Making intent explicit (documentation)

**Note:** This is the default behavior. You only need `{transient}` if you want to be explicit.

---

### reset_on_restart

Variable always uses its initial value after Home Assistant restarts, even if a stored value exists.

**Syntax:**
```iecst
{reset_on_restart}
variable_name : TYPE := initial_value;
```

**Example:**
```iecst
VAR
    {reset_on_restart}
    session_counter : INT := 0;
    
    {reset_on_restart}
    daily_reset_flag : BOOL := FALSE;
END_VAR
```

**Behavior:**
- Variable is stored persistently (like `{persistent}`)
- But always starts with initial value after restart
- Useful for session counters, daily resets, etc.

**When to Use:**
- Session counters (reset each day/restart)
- Temporary flags that should reset
- Values that should start fresh after restart

**Difference from persistent:**
- `persistent`: Retains last value across restarts
- `reset_on_restart`: Always uses initial value after restart

---

### require_restore

Causes an error if no stored value exists for a persistent variable.

**Syntax:**
```iecst
{persistent}
{require_restore}
variable_name : TYPE := initial_value;
```

**Example:**
```iecst
VAR
    {persistent}
    {require_restore}
    critical_state : INT := 0;
END_VAR
```

**Behavior:**
- Variable must have a stored value (from previous run)
- If no stored value exists, the automation fails
- Prevents using default initial value when a stored value is required

**When to Use:**
- Critical state that must be restored
- Preventing accidental use of default values
- Ensuring continuity after restarts

**Note:** Use with caution. If the variable has never been set, the automation will fail.

---

## Combining Pragmas

You can combine multiple pragmas:

**Program-level:**
```iecst
{mode: restart}
{throttle: T#30s}
PROGRAM Example
```

**Variable-level:**
```iecst
VAR
    {trigger}
    {no_trigger}  // This is contradictory - don't do this!
    
    {persistent}
    {reset_on_restart}
    counter : INT := 0;  // Valid combination
END_VAR
```

**Valid Combinations:**
- `{persistent}` + `{reset_on_restart}` - Stored but reset on restart
- `{persistent}` + `{require_restore}` - Must have stored value
- `{trigger}` or `{no_trigger}` (mutually exclusive)

**Invalid Combinations:**
- `{trigger}` + `{no_trigger}` - Contradictory
- `{transient}` + `{persistent}` - Contradictory

---

## Quick Reference

| Pragma | Level | Purpose |
|--------|-------|---------|
| `mode` | Program | Control trigger handling |
| `throttle` | Program | Limit execution rate |
| `debounce` | Program | Wait for quiet period |
| `max_queued` | Program | Limit queue size (with queued mode) |
| `max_parallel` | Program | Limit parallel instances |
| `trigger` | Variable | Entity triggers automation |
| `no_trigger` | Variable | Entity doesn't trigger |
| `persistent` | Variable | Store value in helper |
| `transient` | Variable | Don't store value (default) |
| `reset_on_restart` | Variable | Always use initial value after restart |
| `require_restore` | Variable | Error if no stored value exists |

---

## Examples

### Complete Example: Thermostat with All Features

```iecst
{mode: restart}
{throttle: T#30s}
PROGRAM Advanced_Thermostat
VAR
    // Triggers
    {trigger}
    current_temp AT %I* : REAL := 'sensor.temperature';
    
    // Non-triggers
    {no_trigger}
    target_temp AT %I* : REAL := 'input_number.target';
    
    // Outputs
    heater AT %Q* : BOOL := 'switch.heater';
    
    // Persistent configuration
    {persistent}
    hysteresis : REAL := 0.5;
    
    // Session counter (resets on restart)
    {persistent}
    {reset_on_restart}
    session_count : INT := 0;
    
    // Critical state (must restore)
    {persistent}
    {require_restore}
    last_mode : INT := 0;
END_VAR

// Thermostat logic
IF current_temp < (target_temp - hysteresis) THEN
    heater := TRUE;
ELSIF current_temp > (target_temp + hysteresis) THEN
    heater := FALSE;
END_IF;

// Session counter
session_count := session_count + 1;

END_PROGRAM
```

---

**Related:**
- [Quickstart Guide](../quickstart.md) - Basic pragma usage
- [Tutorial 2: Thermostat](../tutorials/02-thermostat.md) - Practical examples
- [Common Patterns](./patterns.md) - Using pragmas with patterns
