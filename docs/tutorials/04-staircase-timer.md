# Tutorial 4: Timer-Based Staircase Lighting

This tutorial demonstrates time-based control using timer function blocks (TON, TOF, TP) for staircase lighting that stays on for a period after activation.

## What You'll Learn

- Using timer function blocks (TON, TOF, TP)
- Time literals (T#5s, T#2m, etc.)
- Combining timer outputs with logic
- Creating user-friendly time-based automations

## Prerequisites

- Completed [Tutorial 1: Motion Light](./01-motion-light.md)
- Understanding of basic ST logic
- A button, switch, or motion sensor to trigger the light
- A light to control

## Scenario: Staircase Lighting

You want a light that:
1. Turns on when a button is pressed (or motion detected)
2. Stays on for 3 minutes after the button is released (or motion stops)
3. Can be manually turned off

This is perfect for staircases, hallways, or any area where you want temporary lighting.

## Timer Function Blocks Overview

ST provides three timer types:

| Timer | Name | Function | Use Case |
|-------|------|----------|----------|
| `TON` | Timer On-Delay | Output turns ON after input has been ON for preset time | Delay before action |
| `TOF` | Timer Off-Delay | Output stays ON for preset time after input goes OFF | Keep output on after input stops |
| `TP` | Timer Pulse | Output is ON for exactly preset time when input goes ON | Fixed-duration pulse |

For staircase lighting, we use **TOF** (Timer Off-Delay).

## Step 1: Basic Staircase Timer

```iecst
{mode: restart}
PROGRAM Staircase_Light
VAR
    // Trigger: button press or motion
    {trigger}
    button AT %I* : BOOL := 'binary_sensor.staircase_button';
    
    // Light output
    light AT %Q* : BOOL := 'light.staircase';
    
    // Off-delay timer: keeps output on for 3 minutes after input goes off
    off_timer : TOF;
END_VAR

// Start timer when button is pressed
off_timer(IN := button, PT := T#3m);

// Light is on while button pressed OR timer running
light := button OR off_timer.Q;

END_PROGRAM
```

## Step 2: Understanding the Code

### Timer Declaration

```iecst
off_timer : TOF;
```

- `off_timer` - Variable name for the timer instance
- `TOF` - Timer Off-Delay type
- Each timer needs its own variable

### Timer Call

```iecst
off_timer(IN := button, PT := T#3m);
```

- `IN` - Input signal (follows the button state)
- `PT` - Preset Time (how long to keep output on after input goes off)
- `T#3m` - Time literal: 3 minutes
  - `T#5s` = 5 seconds
  - `T#2m` = 2 minutes
  - `T#1h30m` = 1 hour 30 minutes
  - `T#500ms` = 500 milliseconds

### Timer Output

```iecst
off_timer.Q
```

- `Q` - Timer output (TRUE while timer is running)
- For TOF: Q is TRUE while input is ON, and stays TRUE for PT after input goes OFF

### Light Logic

```iecst
light := button OR off_timer.Q;
```

- Light is ON if:
  - Button is currently pressed, OR
  - Timer is still running (button was recently pressed)

## Step 3: Time Literal Syntax

Time literals use the format `T#<value><unit>`:

| Format | Example | Meaning |
|--------|---------|---------|
| `T#<n>s` | `T#5s` | Seconds |
| `T#<n>m` | `T#2m` | Minutes |
| `T#<n>h` | `T#1h` | Hours |
| `T#<n>ms` | `T#500ms` | Milliseconds |
| Combined | `T#1h30m` | 1 hour 30 minutes |
| Combined | `T#2m30s` | 2 minutes 30 seconds |

**Examples:**
```iecst
off_timer(IN := button, PT := T#30s);   // 30 seconds
off_timer(IN := button, PT := T#5m);    // 5 minutes
off_timer(IN := button, PT := T#2h);    // 2 hours
off_timer(IN := button, PT := T#1h15m); // 1 hour 15 minutes
```

## Step 4: Enhanced - Motion Sensor with Timeout

Use a motion sensor instead of a button:

```iecst
{mode: restart}
PROGRAM Staircase_Motion
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.staircase_motion';
    
    light AT %Q* : BOOL := 'light.staircase';
    
    off_timer : TOF;
    
    {persistent}
    timeout_duration : TIME := T#3m;  // Configurable timeout
END_VAR

// Timer starts when motion is detected
off_timer(IN := motion, PT := timeout_duration);

// Light follows motion or timer
light := motion OR off_timer.Q;

END_PROGRAM
```

**Key Change:**
- `{persistent} timeout_duration` - Stored in helper, can be changed without redeploying
- Use `TIME` type for time values (not REAL or INT)

## Step 5: Advanced - Multiple Buttons

Control the same light from multiple buttons (top and bottom of stairs):

```iecst
{mode: restart}
PROGRAM Staircase_Multi_Button
VAR
    {trigger}
    button_top AT %I* : BOOL := 'binary_sensor.staircase_top';
    {trigger}
    button_bottom AT %I* : BOOL := 'binary_sensor.staircase_bottom';
    
    light AT %Q* : BOOL := 'light.staircase';
    
    off_timer : TOF;
    
    any_button : BOOL;
END_VAR

// Any button pressed
any_button := button_top OR button_bottom;

// Timer starts on any button
off_timer(IN := any_button, PT := T#3m);

// Light follows any button or timer
light := any_button OR off_timer.Q;

END_PROGRAM
```

## Step 6: Advanced - Manual Override

Allow manual control while keeping timer functionality:

```iecst
{mode: restart}
PROGRAM Staircase_With_Override
VAR
    {trigger}
    button AT %I* : BOOL := 'binary_sensor.staircase_button';
    
    {no_trigger}
    light_switch AT %I* : BOOL := 'switch.staircase_light';
    
    light AT %Q* : BOOL := 'light.staircase';
    
    off_timer : TOF;
    
    timer_active : BOOL;
END_VAR

// Timer logic
off_timer(IN := button, PT := T#3m);
timer_active := button OR off_timer.Q;

// Light control: manual switch OR timer
light := light_switch OR timer_active;

END_PROGRAM
```

**Behavior:**
- Manual switch can turn light on/off anytime
- Button press starts timer (light stays on 3 minutes)
- Manual switch overrides timer

## Step 7: Advanced - TON (On-Delay) Example

Use TON to delay an action (e.g., turn on fan 30 seconds after light turns on):

```iecst
{mode: restart}
PROGRAM Light_With_Delayed_Fan
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.bathroom_motion';
    
    light AT %Q* : BOOL := 'light.bathroom';
    fan AT %Q* : BOOL := 'switch.bathroom_fan';
    
    off_timer : TOF;
    on_delay_timer : TON;
END_VAR

// Light follows motion with timeout
off_timer(IN := motion, PT := T#5m);
light := motion OR off_timer.Q;

// Fan turns on 30 seconds after light turns on
on_delay_timer(IN := light, PT := T#30s);
fan := on_delay_timer.Q;

END_PROGRAM
```

**TON Behavior:**
- Input must be ON for the preset time before output goes ON
- If input goes OFF before time elapses, timer resets
- Output goes OFF immediately when input goes OFF

## Step 8: Advanced - TP (Pulse Timer) Example

Use TP for a fixed-duration pulse (e.g., doorbell chime):

```iecst
{mode: restart}
PROGRAM Doorbell_Chime
VAR
    {trigger}
    doorbell AT %I* : BOOL := 'binary_sensor.doorbell';
    
    chime AT %Q* : BOOL := 'switch.doorbell_chime';
    
    pulse_timer : TP;
END_VAR

// Generate 2-second pulse on doorbell press
pulse_timer(IN := doorbell, PT := T#2s);
chime := pulse_timer.Q;

END_PROGRAM
```

**TP Behavior:**
- When input goes ON, output immediately goes ON
- Output stays ON for exactly PT duration, then goes OFF
- Input can go OFF before PT elapses; output still runs for full duration

## Common Issues

### Light Doesn't Turn On

1. **Check timer input** - Ensure the trigger entity is actually changing state
2. **Check timer call** - Timer must be called every cycle: `off_timer(IN := ..., PT := ...);`
3. **Check logic** - Verify `light := button OR off_timer.Q;` is correct

### Light Stays On Forever

1. **Check timer type** - Ensure you're using TOF (not TON)
2. **Check preset time** - Verify `PT := T#3m` is correct
3. **Check timer call** - Timer must be called every cycle

### Timer Doesn't Work

1. **Timer must be called** - You must call the timer function every cycle
2. **Check time format** - Use `T#3m` not `3m` or `180`
3. **Check timer type** - TOF vs TON vs TP have different behaviors

## Tips

- **TOF for "stay on after"** - Use TOF when you want output to continue after input stops
- **TON for "delay before"** - Use TON when you want to wait before acting
- **TP for "fixed duration"** - Use TP for precise timing regardless of input duration
- **Test with short times** - Use `T#5s` during development, change to `T#3m` for production
- **Combine timers** - You can use multiple timers for complex sequences

## Next Steps

- Try [Presence-Based Automation](./05-presence.md) for occupancy-aware systems
- Learn about [State Machines](../reference/patterns.md#state-machines) for complex control flows
- Explore [Common Patterns](../reference/patterns.md) for more automation ideas

---

**Related:**
- [Tutorial 1: Motion Light](./01-motion-light.md)
- [Tutorial 5: Presence-Based](./05-presence.md)
- [Common Patterns](../reference/patterns.md)
