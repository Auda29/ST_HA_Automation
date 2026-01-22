# Tutorial 1: Basic Motion-Activated Light

This tutorial will guide you through creating a simple automation that turns on a light when motion is detected.

## What You'll Learn

- How to bind ST variables to Home Assistant entities
- Using the `{trigger}` pragma to detect state changes
- Basic conditional logic with `IF/THEN/ELSE`
- Deploying your first ST program

## Prerequisites

- ST for Home Assistant installed and configured
- A motion sensor (binary_sensor) in your Home Assistant
- A light you want to control
- Basic understanding of entity IDs

## Step 1: Identify Your Entities

Before writing code, identify the entity IDs you'll use:

1. Open **Settings** → **Devices & Services** → **Entities**
2. Find your motion sensor (e.g., `binary_sensor.hallway_motion`)
3. Find your light (e.g., `light.hallway_ceiling`)

**Tip:** You can also use the Entity Browser in the ST Editor sidebar to drag-and-drop entities into your code!

## Step 2: Write the Basic Program

Open the ST Editor and create a new program:

```iecst
{mode: restart}
PROGRAM Motion_Light
VAR
    // Motion sensor - triggers the automation when state changes
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.hallway_motion';
    
    // Light to control
    light AT %Q* : BOOL := 'light.hallway_ceiling';
END_VAR

// Simple logic: Light follows motion
IF motion THEN
    light := TRUE;
ELSE
    light := FALSE;
END_IF;

END_PROGRAM
```

## Step 3: Understanding the Code

### Program Structure

- `{mode: restart}` - When a new motion event occurs while the program is running, it restarts with the new value (recommended for most cases)
- `PROGRAM Motion_Light` - Names your automation
- `VAR...END_VAR` - Variable declarations section

### Variable Declarations

```iecst
{trigger}
motion AT %I* : BOOL := 'binary_sensor.hallway_motion';
```

- `{trigger}` - This entity's state changes will trigger the automation
- `motion` - Variable name (you can use any valid identifier)
- `AT %I*` - Input binding (reads from HA entity)
- `: BOOL` - Data type (boolean: TRUE/FALSE)
- `:= 'binary_sensor.hallway_motion'` - Entity ID to bind to

```iecst
light AT %Q* : BOOL := 'light.hallway_ceiling';
```

- `AT %Q*` - Output binding (controls HA entity)
- When you set `light := TRUE`, the light turns on
- When you set `light := FALSE`, the light turns off

### Logic Section

```iecst
IF motion THEN
    light := TRUE;
ELSE
    light := FALSE;
END_IF;
```

This is straightforward: if motion is detected (TRUE), turn the light on. Otherwise, turn it off.

## Step 4: Replace Entity IDs

Replace the example entity IDs with your actual entities:

- `binary_sensor.hallway_motion` → Your motion sensor entity ID
- `light.hallway_ceiling` → Your light entity ID

**Tip:** Use the Entity Browser sidebar to drag entities into your code!

## Step 5: Deploy

1. Check the status bar - it should show "✓ Syntax OK" and "Triggers: 1"
2. Click the **Deploy** button
3. Review the deployment preview
4. Click **Deploy** to confirm

Your automation is now active!

## Step 6: Test

1. Trigger your motion sensor (walk in front of it)
2. The light should turn on immediately
3. Wait for motion to clear (sensor goes to `off`)
4. The light should turn off

## Enhancements

### Add a Timeout (Light Stays On After Motion Stops)

Use a timer to keep the light on for a period after motion stops:

```iecst
{mode: restart}
PROGRAM Motion_Light_Timeout
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.hallway_motion';
    
    light AT %Q* : BOOL := 'light.hallway_ceiling';
    
    // Off-delay timer: keeps output on for 2 minutes after input goes off
    off_timer : TOF;
END_VAR

// Start timer when motion stops
off_timer(IN := motion, PT := T#2m);

// Light is on while motion detected OR timer is running
light := motion OR off_timer.Q;

END_PROGRAM
```

**Explanation:**
- `TOF` (Timer Off-Delay) - Output stays TRUE for the preset time after input goes FALSE
- `off_timer(IN := motion, PT := T#2m)` - Timer input follows motion, preset time is 2 minutes
- `off_timer.Q` - Timer output (TRUE while timer is running)
- `light := motion OR off_timer.Q` - Light is on if motion is detected OR timer is still running

### Only Activate in Darkness

Add a light sensor to only turn on the light when it's dark:

```iecst
{mode: restart}
PROGRAM Motion_Light_Dark
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.hallway_motion';
    
    {no_trigger}
    lux AT %I* : REAL := 'sensor.hallway_illuminance';
    
    light AT %Q* : BOOL := 'light.hallway_ceiling';
    
    {persistent}
    lux_threshold : REAL := 50.0;  // Turn on if below 50 lux
    
    off_timer : TOF;
END_VAR

// Only activate if dark enough
IF lux < lux_threshold THEN
    off_timer(IN := motion, PT := T#2m);
    light := motion OR off_timer.Q;
ELSE
    light := FALSE;
END_IF;

END_PROGRAM
```

**Key Changes:**
- `{no_trigger}` on `lux` - Reads the sensor but doesn't trigger the automation (only motion triggers)
- `lux < lux_threshold` - Only activates when it's dark
- `{persistent}` on `lux_threshold` - Value is stored in a helper and persists across restarts

## Common Issues

### Light Doesn't Turn On

1. **Check entity IDs** - Ensure they match exactly (case-sensitive)
2. **Check trigger** - Status bar should show "Triggers: 1" or more
3. **Check automation** - Go to Settings → Automations & Scenes and verify your automation exists
4. **Check automation trace** - View the trace to see if it's running and what values it receives

### Light Flickers

If the light turns on and off rapidly:

1. **Add debounce** - Use `{debounce: T#500ms}` to wait for stable state
2. **Check sensor** - The motion sensor might be flapping (rapidly changing state)

### Program Never Runs

1. **No triggers** - Ensure at least one variable has `{trigger}` pragma
2. **Entity unavailable** - Check that the entity exists and is available in HA
3. **Check logs** - Look for errors in Settings → System → Logs

## Next Steps

- Try the [Thermostat Tutorial](./02-thermostat.md) to learn about hysteresis control
- Learn about [Common Patterns](../reference/patterns.md) like edge detection
- Explore [Pragmas Reference](../reference/pragmas.md) for advanced features

---

**Related:**
- [Quickstart Guide](../quickstart.md)
- [Pragma Reference](../reference/pragmas.md)
- [Common Patterns](../reference/patterns.md)
