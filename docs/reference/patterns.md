# Common Patterns Reference

This document describes common automation patterns you can use in ST programs.

## Table of Contents

1. [Edge Detection](#edge-detection)
2. [Debouncing](#debouncing)
3. [State Machines](#state-machines)
4. [Hysteresis Control](#hysteresis-control)
5. [Priority Logic](#priority-logic)
6. [Sequential Control](#sequential-control)
7. [Counting and Accumulation](#counting-and-accumulation)

---

## Edge Detection

Edge detection identifies when a signal transitions from one state to another (rising or falling edge).

### Rising Edge (R_TRIG)

Detects when a signal goes from FALSE to TRUE:

```iecst
VAR
    {trigger}
    button AT %I* : BOOL := 'binary_sensor.button';
    
    rising_edge : R_TRIG;
    
    counter : INT;
END_VAR

// Detect rising edge
rising_edge(CLK := button);

// Action on rising edge (executes once per button press)
IF rising_edge.Q THEN
    counter := counter + 1;
END_IF;

END_PROGRAM
```

**Use Cases:**
- Count button presses
- Trigger action once per event
- Detect state changes

### Falling Edge (F_TRIG)

Detects when a signal goes from TRUE to FALSE:

```iecst
VAR
    {trigger}
    door AT %I* : BOOL := 'binary_sensor.door';
    
    falling_edge : F_TRIG;
    
    door_closed_count : INT;
END_VAR

// Detect falling edge (door closes)
falling_edge(CLK := door);

// Count door closings
IF falling_edge.Q THEN
    door_closed_count := door_closed_count + 1;
END_IF;

END_PROGRAM
```

### Combined Edge Detection

Detect both rising and falling edges:

```iecst
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.motion';
    
    motion_start : R_TRIG;
    motion_end : F_TRIG;
    
    motion_count : INT;
END_VAR

motion_start(CLK := motion);
motion_end(CLK := motion);

IF motion_start.Q THEN
    motion_count := motion_count + 1;
    // Turn on light, start timer, etc.
END_IF;

IF motion_end.Q THEN
    // Turn off light after delay, etc.
END_IF;

END_PROGRAM
```

---

## Debouncing

Debouncing prevents rapid state changes from triggering actions multiple times. Use when sensors are "noisy" (rapidly changing state).

### Software Debounce (Timer-Based)

```iecst
VAR
    {trigger}
    noisy_sensor AT %I* : BOOL := 'binary_sensor.noisy_button';
    
    debounce_timer : TON;
    {persistent}
    debounced_state : BOOL := FALSE;
END_VAR

// Wait for stable state (500ms)
debounce_timer(IN := noisy_sensor, PT := T#500ms);

// Update debounced state only after timer elapses
IF debounce_timer.Q THEN
    debounced_state := noisy_sensor;
END_IF;

// Use debounced_state instead of noisy_sensor
// ... your logic here ...

END_PROGRAM
```

### Program-Level Debounce (Pragma)

For simpler cases, use the `{debounce}` pragma:

```iecst
{debounce: T#500ms}
PROGRAM Debounced_Handler
VAR
    {trigger}
    sensor AT %I* : BOOL := 'binary_sensor.noisy';
    // ... rest of program
END_VAR
```

**When to Use:**
- Noisy sensors (buttons, motion sensors with interference)
- Preventing multiple triggers from single event
- Reducing automation execution frequency

---

## State Machines

State machines manage complex behavior with distinct states and transitions.

### Simple Two-State Machine

```iecst
VAR
    {trigger}
    button AT %I* : BOOL := 'binary_sensor.button';
    
    {persistent}
    state : INT := 0;  // 0 = OFF, 1 = ON
    
    light AT %Q* : BOOL := 'light.example';
END_VAR

CASE state OF
    0:  // OFF state
        IF button THEN
            state := 1;
            light := TRUE;
        END_IF;
    
    1:  // ON state
        IF button THEN
            state := 0;
            light := FALSE;
        END_IF;
END_CASE;

END_PROGRAM
```

### Multi-State Machine

```iecst
VAR
    {trigger}
    start_button AT %I* : BOOL := 'binary_sensor.start';
    {trigger}
    stop_button AT %I* : BOOL := 'binary_sensor.stop';
    {trigger}
    reset_button AT %I* : BOOL := 'binary_sensor.reset';
    
    {persistent}
    state : INT := 0;  // 0 = IDLE, 1 = RUNNING, 2 = PAUSED
    
    motor AT %Q* : BOOL := 'switch.motor';
    indicator AT %Q* : BOOL := 'light.status';
END_VAR

CASE state OF
    0:  // IDLE
        motor := FALSE;
        indicator := FALSE;
        IF start_button THEN
            state := 1;
        END_IF;
    
    1:  // RUNNING
        motor := TRUE;
        indicator := TRUE;
        IF stop_button THEN
            state := 2;
        ELSIF reset_button THEN
            state := 0;
        END_IF;
    
    2:  // PAUSED
        motor := FALSE;
        indicator := TRUE;
        IF start_button THEN
            state := 1;
        ELSIF reset_button THEN
            state := 0;
        END_IF;
END_CASE;

END_PROGRAM
```

### State Machine with Timers

```iecst
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.motion';
    
    {persistent}
    state : INT := 0;  // 0 = IDLE, 1 = ACTIVE, 2 = WARNING
    
    idle_timer : TON;
    warning_timer : TON;
    
    light AT %Q* : BOOL := 'light.example';
    alarm AT %Q* : BOOL := 'switch.alarm';
END_VAR

CASE state OF
    0:  // IDLE
        light := FALSE;
        alarm := FALSE;
        IF motion THEN
            state := 1;
        END_IF;
    
    1:  // ACTIVE
        light := TRUE;
        idle_timer(IN := NOT motion, PT := T#5m);
        IF idle_timer.Q THEN
            state := 2;
        END_IF;
    
    2:  // WARNING
        light := TRUE;
        alarm := TRUE;
        warning_timer(IN := TRUE, PT := T#1m);
        IF motion THEN
            state := 1;
        ELSIF warning_timer.Q THEN
            state := 0;
        END_IF;
END_CASE;

END_PROGRAM
```

**When to Use:**
- Complex control sequences
- Multi-step processes
- Systems with distinct operating modes

---

## Hysteresis Control

Hysteresis creates a "deadband" to prevent rapid switching. See [Tutorial 2: Thermostat](../tutorials/02-thermostat.md) for detailed examples.

### Basic Hysteresis

```iecst
VAR
    {trigger}
    sensor AT %I* : REAL := 'sensor.temperature';
    {no_trigger}
    target AT %I* : REAL := 'input_number.target';
    
    output AT %Q* : BOOL := 'switch.heater';
    
    {persistent}
    deadband : REAL := 0.5;
END_VAR

IF sensor < (target - deadband) THEN
    output := TRUE;
ELSIF sensor > (target + deadband) THEN
    output := FALSE;
END_IF;

END_PROGRAM
```

**Key Points:**
- Prevents rapid on/off cycling
- Maintains current state within deadband
- Essential for temperature control

---

## Priority Logic

Priority logic ensures certain conditions take precedence over others.

### Simple Priority

```iecst
VAR
    {trigger}
    high_priority AT %I* : BOOL := 'binary_sensor.emergency';
    {trigger}
    low_priority AT %I* : BOOL := 'binary_sensor.normal';
    
    output AT %Q* : BOOL := 'switch.output';
END_VAR

// High priority overrides low priority
IF high_priority THEN
    output := TRUE;
ELSIF low_priority THEN
    output := FALSE;
ELSE
    output := FALSE;
END_IF;

END_PROGRAM
```

### Multi-Level Priority

```iecst
VAR
    {trigger}
    critical AT %I* : BOOL := 'binary_sensor.critical';
    {trigger}
    high AT %I* : BOOL := 'binary_sensor.high';
    {trigger}
    normal AT %I* : BOOL := 'binary_sensor.normal';
    
    output AT %Q* : INT := 'input_number.output_level';
END_VAR

// Priority: critical > high > normal
IF critical THEN
    output := 100;
ELSIF high THEN
    output := 75;
ELSIF normal THEN
    output := 50;
ELSE
    output := 0;
END_IF;

END_PROGRAM
```

---

## Sequential Control

Sequential control executes actions in a specific order, often with timing.

### Simple Sequence

```iecst
VAR
    {trigger}
    start AT %I* : BOOL := 'binary_sensor.start';
    
    {persistent}
    step : INT := 0;
    
    step1_timer : TON;
    step2_timer : TON;
    
    valve1 AT %Q* : BOOL := 'switch.valve1';
    valve2 AT %Q* : BOOL := 'switch.valve2';
    pump AT %Q* : BOOL := 'switch.pump';
END_VAR

CASE step OF
    0:  // IDLE
        valve1 := FALSE;
        valve2 := FALSE;
        pump := FALSE;
        IF start THEN
            step := 1;
        END_IF;
    
    1:  // Step 1: Open valve 1
        valve1 := TRUE;
        step1_timer(IN := TRUE, PT := T#10s);
        IF step1_timer.Q THEN
            step := 2;
        END_IF;
    
    2:  // Step 2: Start pump
        pump := TRUE;
        step2_timer(IN := TRUE, PT := T#30s);
        IF step2_timer.Q THEN
            step := 3;
        END_IF;
    
    3:  // Step 3: Open valve 2
        valve2 := TRUE;
        // Sequence complete, wait for reset
        IF start THEN
            step := 0;
        END_IF;
END_CASE;

END_PROGRAM
```

### Sequence with Conditions

```iecst
VAR
    {trigger}
    start AT %I* : BOOL := 'binary_sensor.start';
    {no_trigger}
    pressure AT %I* : REAL := 'sensor.pressure';
    
    {persistent}
    step : INT := 0;
    
    timer : TON;
    
    valve AT %Q* : BOOL := 'switch.valve';
    pump AT %Q* : BOOL := 'switch.pump';
END_VAR

CASE step OF
    0:  // IDLE
        IF start THEN
            step := 1;
        END_IF;
    
    1:  // Open valve and wait for pressure
        valve := TRUE;
        IF pressure > 10.0 THEN
            step := 2;
        END_IF;
    
    2:  // Start pump for 60 seconds
        pump := TRUE;
        timer(IN := TRUE, PT := T#60s);
        IF timer.Q THEN
            step := 3;
        END_IF;
    
    3:  // Close valve
        valve := FALSE;
        pump := FALSE;
        step := 0;  // Return to idle
END_CASE;

END_PROGRAM
```

---

## Counting and Accumulation

Count events, accumulate values, or track statistics.

### Event Counter

```iecst
VAR
    {trigger}
    event AT %I* : BOOL := 'binary_sensor.event';
    
    event_trigger : R_TRIG;
    
    {persistent}
    event_count : INT := 0;
END_VAR

event_trigger(CLK := event);

IF event_trigger.Q THEN
    event_count := event_count + 1;
END_IF;

END_PROGRAM
```

### Accumulator

```iecst
VAR
    {trigger}
    value AT %I* : REAL := 'sensor.energy';
    
    {persistent}
    total_energy : REAL := 0.0;
    
    prev_value : REAL;
    delta : REAL;
END_VAR

// Calculate change since last reading
delta := value - prev_value;

// Only accumulate positive changes
IF delta > 0.0 THEN
    total_energy := total_energy + delta;
END_IF;

prev_value := value;

END_PROGRAM
```

### Rate Calculation

```iecst
VAR
    {trigger}
    count AT %I* : INT := 'sensor.pulse_count';
    
    {persistent}
    prev_count : INT := 0;
    {persistent}
    last_reset_time : TIME;
    
    rate : REAL;
    time_delta : REAL;
END_VAR

// Calculate rate (counts per minute)
// Note: This is simplified; real implementation needs time tracking
time_delta := 1.0;  // Assume 1 minute between readings
rate := (count - prev_count) / time_delta;

prev_count := count;

END_PROGRAM
```

---

## Combining Patterns

Real-world automations often combine multiple patterns:

### Example: Debounced State Machine with Hysteresis

```iecst
VAR
    {trigger}
    sensor AT %I* : REAL := 'sensor.temperature';
    {no_trigger}
    target AT %I* : REAL := 'input_number.target';
    
    {persistent}
    state : INT := 0;  // 0 = OFF, 1 = ON
    {persistent}
    deadband : REAL := 0.5;
    
    debounce_timer : TON;
    output AT %Q* : BOOL := 'switch.heater';
END_VAR

CASE state OF
    0:  // OFF
        IF sensor < (target - deadband) THEN
            debounce_timer(IN := TRUE, PT := T#10s);
            IF debounce_timer.Q THEN
                state := 1;
            END_IF;
        END_IF;
    
    1:  // ON
        IF sensor > (target + deadband) THEN
            debounce_timer(IN := TRUE, PT := T#10s);
            IF debounce_timer.Q THEN
                state := 0;
            END_IF;
        END_IF;
END_CASE;

output := (state = 1);

END_PROGRAM
```

---

## Best Practices

1. **Use persistent variables** for state that must survive restarts
2. **Use edge detection** for one-time actions
3. **Add debouncing** for noisy sensors
4. **Use state machines** for complex multi-step processes
5. **Apply hysteresis** to prevent rapid switching
6. **Test edge cases** - what happens at boundaries?
7. **Document state meanings** with comments

---

**Related:**
- [Tutorial 2: Thermostat](../tutorials/02-thermostat.md) - Hysteresis example
- [Tutorial 4: Staircase Timer](../tutorials/04-staircase-timer.md) - Timer patterns
- [Pragma Reference](./pragmas.md) - Program-level controls
