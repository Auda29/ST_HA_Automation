# ST for Home Assistant - Quickstart Guide

This guide will help you get ST for Home Assistant up and running in your Home Assistant instance.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [First Program](#first-program)
4. [Understanding the Editor](#understanding-the-editor)
5. [Entity Bindings](#entity-bindings)
6. [Using Pragmas](#using-pragmas)
7. [Deploying Your Program](#deploying-your-program)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Home Assistant** 2024.1.0 or newer
- **HACS** (Home Assistant Community Store) installed - [Installation Guide](https://hacs.xyz/docs/setup/download)
- Basic understanding of Home Assistant entities (sensors, lights, switches)
- Familiarity with programming concepts (variables, conditions, loops)

---

## Installation

### Option 1: HACS Installation (Recommended)

1. Open Home Assistant and navigate to **HACS** in the sidebar

2. Click on **Integrations**

3. Click the **three dots** (⋮) in the top right corner

4. Select **Custom repositories**

5. Add the repository:
   - **Repository URL:** `https://github.com/Auda29/ST_HA_Automation`
   - **Category:** Integration

6. Click **Add**

7. Search for "ST for Home Assistant" in HACS

8. Click **Install**

9. **Restart Home Assistant**
   - Go to **Settings** → **System** → **Restart**

10. After restart, go to **Settings** → **Devices & Services** → **Add Integration**

11. Search for "ST for Home Assistant" and add it

12. The **ST Editor** panel will appear in your sidebar

### Option 2: Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/Auda29/ST_HA_Automation/releases)

2. Extract the archive

3. Copy the `custom_components/st_hass` folder to your Home Assistant `config/custom_components/` directory:
   ```
   config/
   └── custom_components/
       └── st_hass/
           ├── __init__.py
           ├── manifest.json
           ├── config_flow.py
           ├── const.py
           ├── strings.json
           └── frontend/
               └── st-panel.js
   ```

4. **Restart Home Assistant**

5. Add the integration via **Settings** → **Devices & Services** → **Add Integration**

---

## First Program

Let's create a simple automation that turns on a light when motion is detected.

### Step 1: Open the ST Editor

Click on **ST Editor** in your Home Assistant sidebar.

### Step 2: Write Your First Program

Enter the following code in the editor:

```iecst
{mode: restart}
PROGRAM Motion_Light
VAR
    // Input: Motion sensor (read-only)
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.living_room_motion';
    
    // Output: Light to control
    light AT %Q* : BOOL := 'light.living_room';
END_VAR

// Simple logic: Light follows motion
IF motion THEN
    light := TRUE;
ELSE
    light := FALSE;
END_IF;

END_PROGRAM
```

### Step 3: Replace Entity IDs

Replace the example entity IDs with your actual entities:
- `binary_sensor.living_room_motion` → Your motion sensor
- `light.living_room` → Your light

**Tip:** You can find your entity IDs in **Settings** → **Devices & Services** → **Entities**

### Step 4: Deploy

Click the **Deploy** button to create the automation in Home Assistant.

### Step 5: Test

Trigger your motion sensor and watch the light turn on!

---

## Understanding the Editor

### Editor Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ST for Home Assistant                              [● ONLINE] [Deploy] │
├──────────────────────────────────────────────────────────────────────────┤
│  1 │ {mode: restart}                                                     │
│  2 │ PROGRAM Motion_Light                                                │
│  3 │ VAR                                                                 │
│  4 │   {trigger}                                                         │
│  5 │   motion AT %I* : BOOL := 'binary_sensor.motion';  │ TRUE  │       │
│  6 │   light AT %Q* : BOOL := 'light.living_room';      │ ON    │       │
│  7 │ END_VAR                                                             │
│    │ ...                                                                 │
├──────────────────────────────────────────────────────────────────────────┤
│  ✓ Syntax OK │ Triggers: 1 │ Mode: restart                              │
└──────────────────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Description |
|---------|-------------|
| **Syntax Highlighting** | Keywords, types, and values are color-coded |
| **Online Mode** | Shows live entity values next to variables |
| **Status Bar** | Displays syntax status, trigger count, and mode |
| **Deploy Button** | Creates/updates the automation in HA |
| **Autocomplete** | Press `Ctrl+Space` for suggestions |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Trigger autocomplete |
| `Ctrl+S` | Save (if enabled) |
| `Ctrl+/` | Toggle comment |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |

---

## Entity Bindings

Entity bindings connect ST variables to Home Assistant entities.

### Input Bindings (`%I*`)

Read values from sensors and other read-only entities:

```iecst
VAR
    // Binary sensors
    motion AT %I* : BOOL := 'binary_sensor.hallway_motion';
    door_open AT %I* : BOOL := 'binary_sensor.front_door';
    
    // Numeric sensors
    temperature AT %I* : REAL := 'sensor.living_room_temperature';
    humidity AT %I* : REAL := 'sensor.living_room_humidity';
    
    // Input helpers (for reading user input)
    threshold AT %I* : REAL := 'input_number.temperature_threshold';
END_VAR
```

### Output Bindings (`%Q*`)

Control lights, switches, and other actuators:

```iecst
VAR
    // Lights
    ceiling_light AT %Q* : BOOL := 'light.living_room_ceiling';
    
    // Switches
    fan AT %Q* : BOOL := 'switch.ceiling_fan';
    
    // Covers
    blinds AT %Q* : BOOL := 'cover.living_room_blinds';
END_VAR
```

### Memory Bindings (`%M*`)

Use HA helpers for persistent storage:

```iecst
VAR
    // Counter stored in input_number helper
    counter AT %M* : INT := 'input_number.activation_counter';
    
    // State stored in input_boolean helper
    night_mode AT %M* : BOOL := 'input_boolean.night_mode';
END_VAR
```

### Data Type Mapping

| ST Type | HA Entity State | Example |
|---------|-----------------|---------|
| `BOOL` | `on`/`off`, `true`/`false` | `binary_sensor.*`, `light.*`, `switch.*` |
| `INT` | Integer number | `sensor.*` with numeric state |
| `REAL` | Decimal number | `sensor.temperature` |
| `STRING` | Text | `sensor.*` with text state |

---

## Using Pragmas

Pragmas are special directives that control how your program behaves.

### Trigger Control

```iecst
VAR
    // This entity change triggers the automation
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.motion';
    
    // This entity is read but doesn't trigger
    {no_trigger}
    temperature AT %I* : REAL := 'sensor.temperature';
END_VAR
```

### Persistence

```iecst
VAR
    // Value is stored in an HA helper (survives restarts)
    {persistent}
    activation_count : INT := 0;
    
    // Value is reset each run (default behavior)
    {transient}
    temp_calculation : REAL := 0.0;
    
    // Always start with initial value after HA restart
    {reset_on_restart}
    session_counter : INT := 0;
END_VAR
```

### Execution Mode

```iecst
// Applied to the entire program
{mode: restart}      // New trigger restarts execution (recommended)
{mode: single}       // Ignore new triggers during execution
{mode: queued}       // Queue triggers (max 10)
{mode: parallel}     // Run multiple instances (use with caution)

PROGRAM MyProgram
...
END_PROGRAM
```

### Rate Limiting

```iecst
// Maximum one execution per second
{throttle: T#1s}
PROGRAM Climate_Control
...
END_PROGRAM

// Wait for 500ms of no triggers before executing
{debounce: T#500ms}
PROGRAM Motion_Handler
...
END_PROGRAM
```

---

## Deploying Your Program

### Before Deploying

1. **Check Syntax**: The status bar shows "✓ Syntax OK" when your code is valid
2. **Verify Entities**: Ensure all entity IDs exist in your HA instance
3. **Review Triggers**: Check the trigger count in the status bar

### Deploy Process

1. Click the **Deploy** button

2. Review the deployment preview:
   ```
   ┌──────────────────────────────────────────────────────────────────┐
   │  Deploy Preview                                                  │
   ├──────────────────────────────────────────────────────────────────┤
   │  Changes:                                                        │
   │    ✚ automation.st_motion_light (create)                         │
   │    ✚ script.st_motion_light_logic (create)                       │
   │    ✚ input_number.st_motion_light_counter (create)               │
   │                                                                  │
   │  ☑ Create backup before deploy                                   │
   │                                                                  │
   │                              [Cancel] [Deploy]                   │
   └──────────────────────────────────────────────────────────────────┘
   ```

3. Click **Deploy** to confirm

4. The system will:
   - Create a backup of existing entities
   - Create/update the automation
   - Create/update the logic script
   - Create any required helpers
   - Reload automations and scripts

### After Deploying

Your automation is now active! You can:

- View it in **Settings** → **Automations & Scenes**
- Check the automation trace for debugging
- Monitor helper values in **Developer Tools** → **States**

### Rollback

If something goes wrong, the system automatically rolls back to the previous state. You can also manually restore from a backup.

---

## Example Programs

### Thermostat Control

```iecst
{mode: restart}
{throttle: T#30s}
PROGRAM Simple_Thermostat
VAR
    {trigger}
    current_temp AT %I* : REAL := 'sensor.living_room_temperature';
    
    {no_trigger}
    target_temp AT %I* : REAL := 'input_number.target_temperature';
    
    heater AT %Q* : BOOL := 'switch.heater';
    
    {persistent}
    hysteresis : REAL := 0.5;
END_VAR

// Hysteresis control to prevent rapid switching
IF current_temp < (target_temp - hysteresis) THEN
    heater := TRUE;
ELSIF current_temp > (target_temp + hysteresis) THEN
    heater := FALSE;
END_IF;

END_PROGRAM
```

### Staircase Timer (TON)

```iecst
{mode: restart}
PROGRAM Staircase_Light
VAR
    {trigger}
    button AT %I* : BOOL := 'binary_sensor.staircase_button';
    
    light AT %Q* : BOOL := 'light.staircase';
    
    // On-delay timer: light stays on for 3 minutes after button release
    timer : TON;
END_VAR

// Start timer when button is pressed
timer(IN := button, PT := T#3m);

// Light is on while button pressed OR timer running
light := button OR timer.Q;

END_PROGRAM
```

### Motion Light with Timeout

```iecst
{mode: restart}
PROGRAM Motion_Light_Timeout
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.hallway_motion';
    
    {no_trigger}
    lux AT %I* : REAL := 'sensor.hallway_illuminance';
    
    light AT %Q* : BOOL := 'light.hallway';
    
    // Off-delay timer: light stays on 2 minutes after motion stops
    off_timer : TOF;
    
    {persistent}
    lux_threshold : REAL := 50.0;
END_VAR

// Only activate if dark enough
IF lux < lux_threshold THEN
    off_timer(IN := motion, PT := T#2m);
    light := off_timer.Q;
ELSE
    light := FALSE;
END_IF;

END_PROGRAM
```

### Multi-Zone HVAC

```iecst
{mode: restart}
{throttle: T#1m}
PROGRAM Multi_Zone_HVAC
VAR
    // Zone 1
    {trigger}
    temp1 AT %I* : REAL := 'sensor.zone1_temperature';
    target1 AT %I* : REAL := 'input_number.zone1_target';
    valve1 AT %Q* : BOOL := 'switch.zone1_valve';
    
    // Zone 2
    {trigger}
    temp2 AT %I* : REAL := 'sensor.zone2_temperature';
    target2 AT %I* : REAL := 'input_number.zone2_target';
    valve2 AT %Q* : BOOL := 'switch.zone2_valve';
    
    // Main system
    {no_trigger}
    hvac_mode AT %I* : STRING := 'climate.main_hvac';
    boiler AT %Q* : BOOL := 'switch.boiler';
    
    {persistent}
    deadband : REAL := 0.5;
END_VAR

// Zone 1 control
IF temp1 < (target1 - deadband) THEN
    valve1 := TRUE;
ELSIF temp1 > (target1 + deadband) THEN
    valve1 := FALSE;
END_IF;

// Zone 2 control
IF temp2 < (target2 - deadband) THEN
    valve2 := TRUE;
ELSIF temp2 > (target2 + deadband) THEN
    valve2 := FALSE;
END_IF;

// Boiler runs if any zone needs heat
boiler := valve1 OR valve2;

END_PROGRAM
```

---

## Troubleshooting

### Common Issues

#### "Entity not found" Error

**Cause:** The entity ID in your code doesn't exist in Home Assistant.

**Solution:**
1. Check the exact entity ID in **Developer Tools** → **States**
2. Entity IDs are case-sensitive
3. Ensure the entity is available (not `unavailable` or `unknown`)

#### Program Never Runs

**Cause:** No triggers are defined.

**Solution:**
1. Add `{trigger}` pragma to at least one input variable
2. Check the status bar shows "Triggers: X" where X > 0
3. Ensure the trigger entity actually changes state

#### Helper Not Created

**Cause:** The `{persistent}` pragma is missing or the variable isn't self-referencing.

**Solution:**
1. Add `{persistent}` pragma to variables that need to persist
2. Ensure the variable name follows naming rules (alphanumeric, underscore)

#### Automation Runs Too Often

**Cause:** Too many entities trigger the automation.

**Solution:**
1. Use `{no_trigger}` on entities that shouldn't trigger
2. Add `{throttle: T#Xs}` to limit execution rate
3. Use `{debounce: T#Xms}` for noisy sensors

#### Jinja Template Error in Logs

**Cause:** An entity returned `unavailable` or `unknown`.

**Solution:**
The transpiler generates defensive templates, but if you see errors:
1. Check if the source entity is available
2. Report the issue if defensive templates aren't working

### Getting Help

1. **Check the Logs:** Go to **Settings** → **System** → **Logs**
2. **Automation Traces:** View detailed execution in **Settings** → **Automations** → Your Automation → Traces
3. **GitHub Issues:** Report bugs at [GitHub Issues](https://github.com/Auda29/ST_HA_Automation/issues)
4. **Discussions:** Ask questions in [GitHub Discussions](https://github.com/Auda29/ST_HA_Automation/discussions)

---

## Next Steps

Now that you have your first program running:

1. **Read the PRD:** [PRD_ST_HomeAssistant.md](./PRD_ST_HomeAssistant.md) for detailed specifications
2. **Explore Pragmas:** Learn all available pragmas in the [Pragma Reference](./PRD_ST_HomeAssistant.md#pragma-reference)
3. **Try Timers:** Use TON, TOF, TP for time-based logic
4. **Use Online Mode:** Monitor live values while developing
5. **Join the Community:** Share your programs and get help

---

## Quick Reference Card

### Program Structure
```iecst
{mode: restart}
{throttle: T#1s}
PROGRAM Program_Name
VAR
    // Variables here
END_VAR

// Logic here

END_PROGRAM
```

### Variable Declaration
```iecst
{pragma}
name AT %X* : TYPE := 'entity.id';
```

### Binding Types
| Binding | Direction | Use For |
|---------|-----------|---------|
| `%I*` | Input | Sensors, binary sensors |
| `%Q*` | Output | Lights, switches, covers |
| `%M*` | Memory | Helpers for storage |

### Essential Pragmas
| Pragma | Purpose |
|--------|---------|
| `{trigger}` | This entity triggers the automation |
| `{no_trigger}` | Read but don't trigger |
| `{persistent}` | Store in HA helper |
| `{mode: restart}` | Restart on new trigger |
| `{throttle: T#Xs}` | Limit execution rate |

---

*Happy automating with Structured Text!*
