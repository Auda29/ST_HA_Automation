# Tutorial 2: Thermostat with Hysteresis Control

This tutorial demonstrates how to create a thermostat that controls heating/cooling with hysteresis to prevent rapid switching.

## What You'll Learn

- Using numeric sensors (REAL type)
- Hysteresis control pattern
- Persistent variables for configuration
- Throttling to reduce execution frequency

## Prerequisites

- Completed [Tutorial 1: Motion Light](./01-motion-light.md)
- A temperature sensor in Home Assistant
- A heater, AC, or climate entity to control
- Understanding of REAL (decimal) numbers in ST

## The Problem: Rapid Switching

A simple thermostat might look like this:

```iecst
IF current_temp < target_temp THEN
    heater := TRUE;
ELSE
    heater := FALSE;
END_IF;
```

**Problem:** If the temperature hovers right at the target, the heater will rapidly turn on and off, causing:
- Wear on equipment
- Energy waste
- Annoying behavior

## Solution: Hysteresis (Deadband)

Hysteresis creates a "deadband" around the target temperature:

```
Target: 20°C, Hysteresis: 0.5°C

Turn ON when:  temp < 19.5°C  (target - hysteresis)
Turn OFF when: temp > 20.5°C  (target + hysteresis)

Between 19.5°C and 20.5°C: No change (maintains current state)
```

This prevents rapid switching!

## Step 1: Basic Thermostat Program

```iecst
{mode: restart}
{throttle: T#30s}
PROGRAM Simple_Thermostat
VAR
    // Current temperature - triggers when it changes
    {trigger}
    current_temp AT %I* : REAL := 'sensor.living_room_temperature';
    
    // Target temperature - read but doesn't trigger
    {no_trigger}
    target_temp AT %I* : REAL := 'input_number.target_temperature';
    
    // Heater output
    heater AT %Q* : BOOL := 'switch.heater';
    
    // Hysteresis value - stored persistently
    {persistent}
    hysteresis : REAL := 0.5;
END_VAR

// Hysteresis control logic
IF current_temp < (target_temp - hysteresis) THEN
    heater := TRUE;
ELSIF current_temp > (target_temp + hysteresis) THEN
    heater := FALSE;
END_IF;

END_PROGRAM
```

## Step 2: Understanding the Code

### Throttling

```iecst
{throttle: T#30s}
```

- Limits execution to once every 30 seconds maximum
- Prevents excessive automation runs if the temperature sensor updates frequently
- Reduces load on Home Assistant

### Variable Types

```iecst
current_temp AT %I* : REAL := 'sensor.living_room_temperature';
```

- `REAL` - Decimal number type (for temperatures like 21.5°C)
- Use `INT` for whole numbers only
- Temperature sensors typically return REAL values

### No-Trigger Input

```iecst
{no_trigger}
target_temp AT %I* : REAL := 'input_number.target_temperature';
```

- `{no_trigger}` - Reads the value but doesn't trigger the automation
- Only `current_temp` changes trigger the automation
- This is more efficient than triggering on both temperature and target changes

### Persistent Configuration

```iecst
{persistent}
hysteresis : REAL := 0.5;
```

- `{persistent}` - Value is stored in a Home Assistant helper
- Survives Home Assistant restarts
- Can be modified in Developer Tools → States
- Initial value is `0.5` (degrees)

### Hysteresis Logic

```iecst
IF current_temp < (target_temp - hysteresis) THEN
    heater := TRUE;
ELSIF current_temp > (target_temp + hysteresis) THEN
    heater := FALSE;
END_IF;
```

**Behavior:**
- If temp drops below (target - 0.5), turn heater ON
- If temp rises above (target + 0.5), turn heater OFF
- If temp is between these bounds, do nothing (maintains current state)

## Step 3: Create the Target Temperature Helper

Before deploying, create an input_number helper for the target temperature:

1. Go to **Settings** → **Devices & Services** → **Helpers**
2. Click **Create Helper** → **Number**
3. Name: "Target Temperature"
4. Min: 10, Max: 30, Step: 0.5, Unit: °C
5. Save

The entity ID will be something like `input_number.target_temperature`.

## Step 4: Deploy and Test

1. Replace entity IDs with your actual entities
2. Deploy the program
3. Set the target temperature in the helper
4. Watch the heater turn on/off with hysteresis

## Step 5: Advanced - Cooling Mode

Add support for both heating and cooling:

```iecst
{mode: restart}
{throttle: T#30s}
PROGRAM Climate_Control
VAR
    {trigger}
    current_temp AT %I* : REAL := 'sensor.room_temperature';
    
    {no_trigger}
    target_temp AT %I* : REAL := 'input_number.target_temperature';
    mode AT %I* : STRING := 'input_select.climate_mode';  // "heat", "cool", "off"
    
    heater AT %Q* : BOOL := 'switch.heater';
    ac AT %Q* : BOOL := 'switch.air_conditioner';
    
    {persistent}
    deadband : REAL := 0.5;
END_VAR

// Heating mode
IF mode = 'heat' THEN
    IF current_temp < (target_temp - deadband) THEN
        heater := TRUE;
        ac := FALSE;
    ELSIF current_temp > (target_temp + deadband) THEN
        heater := FALSE;
        ac := FALSE;
    END_IF;

// Cooling mode
ELSIF mode = 'cool' THEN
    IF current_temp > (target_temp + deadband) THEN
        ac := TRUE;
        heater := FALSE;
    ELSIF current_temp < (target_temp - deadband) THEN
        ac := FALSE;
        heater := FALSE;
    END_IF;

// Off mode
ELSE
    heater := FALSE;
    ac := FALSE;
END_IF;

END_PROGRAM
```

## Step 6: Advanced - Multi-Zone Control

Control multiple zones independently:

```iecst
{mode: restart}
{throttle: T#1m}
PROGRAM Multi_Zone_Thermostat
VAR
    // Zone 1
    {trigger}
    temp1 AT %I* : REAL := 'sensor.zone1_temperature';
    {no_trigger}
    target1 AT %I* : REAL := 'input_number.zone1_target';
    valve1 AT %Q* : BOOL := 'switch.zone1_valve';
    
    // Zone 2
    {trigger}
    temp2 AT %I* : REAL := 'sensor.zone2_temperature';
    {no_trigger}
    target2 AT %I* : REAL := 'input_number.zone2_target';
    valve2 AT %Q* : BOOL := 'switch.zone2_valve';
    
    // Main system
    {no_trigger}
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

## Common Issues

### Heater Never Turns On

1. **Check temperature values** - Use Online Mode to see actual sensor values
2. **Check target temperature** - Ensure the helper has a valid value
3. **Check comparison** - Verify the temperature is actually below (target - hysteresis)

### Heater Rapidly Cycles

1. **Increase hysteresis** - Try 1.0 or 2.0 instead of 0.5
2. **Check sensor accuracy** - The sensor might be noisy
3. **Add more throttling** - Increase throttle time to reduce execution frequency

### Temperature Not Updating

1. **Check trigger** - Ensure `{trigger}` is on the temperature sensor
2. **Check entity availability** - Sensor might be `unavailable`
3. **Check automation trace** - See if the automation is running

## Tips

- **Adjust hysteresis** - Larger values = less switching, but wider temperature range
- **Use throttling** - Prevents excessive runs with fast-updating sensors
- **Monitor with Online Mode** - See live values while developing
- **Test with different targets** - Verify behavior at various temperatures

## Next Steps

- Try [Multi-Zone HVAC Tutorial](./03-hvac.md) for complex climate control
- Learn about [Edge Detection](../reference/patterns.md#edge-detection) for state changes
- Explore [Timer Function Blocks](../quickstart.md#staircase-timer-ton) for time-based logic

---

**Related:**
- [Tutorial 1: Motion Light](./01-motion-light.md)
- [Tutorial 3: Multi-Zone HVAC](./03-hvac.md)
- [Common Patterns](../reference/patterns.md)
