# Tutorial 3: Multi-Zone HVAC Coordination

This tutorial shows how to coordinate multiple heating/cooling zones with a central system, demonstrating complex automation logic.

## What You'll Learn

- Coordinating multiple independent zones
- Central system control based on zone demands
- Using multiple triggers efficiently
- Managing complex state logic

## Prerequisites

- Completed [Tutorial 2: Thermostat](./02-thermostat.md)
- Multiple temperature sensors (one per zone)
- Zone control valves/switches
- Central HVAC system (boiler, heat pump, etc.)

## Scenario

You have a house with multiple zones:
- **Zone 1**: Living room
- **Zone 2**: Bedroom
- **Zone 3**: Kitchen

Each zone has:
- Temperature sensor
- Target temperature (input_number helper)
- Control valve

The central system (boiler/heat pump) should:
- Run when ANY zone needs heat
- Turn off when ALL zones are satisfied

## Step 1: Basic Multi-Zone Program

```iecst
{mode: restart}
{throttle: T#1m}
PROGRAM Multi_Zone_HVAC
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
    
    // Zone 3
    {trigger}
    temp3 AT %I* : REAL := 'sensor.zone3_temperature';
    {no_trigger}
    target3 AT %I* : REAL := 'input_number.zone3_target';
    valve3 AT %Q* : BOOL := 'switch.zone3_valve';
    
    // Central system
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

// Zone 3 control
IF temp3 < (target3 - deadband) THEN
    valve3 := TRUE;
ELSIF temp3 > (target3 + deadband) THEN
    valve3 := FALSE;
END_IF;

// Boiler runs if any zone needs heat
boiler := valve1 OR valve2 OR valve3;

END_PROGRAM
```

## Step 2: Understanding Multi-Trigger Logic

### Multiple Triggers

```iecst
{trigger}
temp1 AT %I* : REAL := 'sensor.zone1_temperature';
{trigger}
temp2 AT %I* : REAL := 'sensor.zone2_temperature';
{trigger}
temp3 AT %I* : REAL := 'sensor.zone3_temperature';
```

- Each zone's temperature sensor triggers the automation
- When ANY zone temperature changes, the entire program runs
- This ensures all zones are evaluated together

### Central System Logic

```iecst
boiler := valve1 OR valve2 OR valve3;
```

- Simple OR logic: if ANY zone valve is open, run the boiler
- More efficient than checking each zone's temperature separately
- The boiler automatically turns off when all zones are satisfied

## Step 3: Enhanced - Mode-Aware Control

Add support for different HVAC modes (heat, cool, off):

```iecst
{mode: restart}
{throttle: T#1m}
PROGRAM Multi_Zone_HVAC_Mode
VAR
    // Zones (same as before)
    {trigger}
    temp1 AT %I* : REAL := 'sensor.zone1_temperature';
    {no_trigger}
    target1 AT %I* : REAL := 'input_number.zone1_target';
    valve1 AT %Q* : BOOL := 'switch.zone1_valve';
    
    {trigger}
    temp2 AT %I* : REAL := 'sensor.zone2_temperature';
    {no_trigger}
    target2 AT %I* : REAL := 'input_number.zone2_target';
    valve2 AT %Q* : BOOL := 'switch.zone2_valve';
    
    {trigger}
    temp3 AT %I* : REAL := 'sensor.zone3_temperature';
    {no_trigger}
    target3 AT %I* : REAL := 'input_number.zone3_target';
    valve3 AT %Q* : BOOL := 'switch.zone3_valve';
    
    // System controls
    {no_trigger}
    hvac_mode AT %I* : STRING := 'input_select.hvac_mode';
    boiler AT %Q* : BOOL := 'switch.boiler';
    compressor AT %Q* : BOOL := 'switch.heat_pump';
    
    {persistent}
    deadband : REAL := 0.5;
    
    // Internal state
    zone1_needs_heat : BOOL;
    zone1_needs_cool : BOOL;
    zone2_needs_heat : BOOL;
    zone2_needs_cool : BOOL;
    zone3_needs_heat : BOOL;
    zone3_needs_cool : BOOL;
END_VAR

// Zone 1 logic
zone1_needs_heat := temp1 < (target1 - deadband);
zone1_needs_cool := temp1 > (target1 + deadband);

// Zone 2 logic
zone2_needs_heat := temp2 < (target2 - deadband);
zone2_needs_cool := temp2 > (target2 + deadband);

// Zone 3 logic
zone3_needs_heat := temp3 < (target3 - deadband);
zone3_needs_cool := temp3 > (target3 + deadband);

// Zone valve control
IF hvac_mode = 'heat' THEN
    valve1 := zone1_needs_heat;
    valve2 := zone2_needs_heat;
    valve3 := zone3_needs_heat;
ELSIF hvac_mode = 'cool' THEN
    valve1 := zone1_needs_cool;
    valve2 := zone2_needs_cool;
    valve3 := zone3_needs_cool;
ELSE
    valve1 := FALSE;
    valve2 := FALSE;
    valve3 := FALSE;
END_IF;

// Central system control
IF hvac_mode = 'heat' THEN
    boiler := valve1 OR valve2 OR valve3;
    compressor := FALSE;
ELSIF hvac_mode = 'cool' THEN
    compressor := valve1 OR valve2 OR valve3;
    boiler := FALSE;
ELSE
    boiler := FALSE;
    compressor := FALSE;
END_IF;

END_PROGRAM
```

## Step 4: Advanced - Priority Zones

Some zones might be more important (e.g., bedrooms at night):

```iecst
{mode: restart}
{throttle: T#1m}
PROGRAM Priority_Zone_HVAC
VAR
    // Zones
    {trigger}
    temp_bedroom AT %I* : REAL := 'sensor.bedroom_temperature';
    {no_trigger}
    target_bedroom AT %I* : REAL := 'input_number.bedroom_target';
    valve_bedroom AT %Q* : BOOL := 'switch.bedroom_valve';
    
    {trigger}
    temp_living AT %I* : REAL := 'sensor.living_room_temperature';
    {no_trigger}
    target_living AT %I* : REAL := 'input_number.living_room_target';
    valve_living AT %Q* : BOOL := 'switch.living_room_valve';
    
    // Priority control
    {no_trigger}
    priority_mode AT %I* : STRING := 'input_select.priority_zone';
    
    boiler AT %Q* : BOOL := 'switch.boiler';
    
    {persistent}
    deadband : REAL := 0.5;
    
    bedroom_needs_heat : BOOL;
    living_needs_heat : BOOL;
END_VAR

// Calculate needs
bedroom_needs_heat := temp_bedroom < (target_bedroom - deadband);
living_needs_heat := temp_living < (target_living - deadband);

// Priority logic: bedroom gets priority at night
IF priority_mode = 'bedroom' THEN
    valve_bedroom := bedroom_needs_heat;
    // Living room only gets heat if bedroom is satisfied
    valve_living := living_needs_heat AND NOT bedroom_needs_heat;
ELSE
    // Normal mode: both zones independent
    valve_bedroom := bedroom_needs_heat;
    valve_living := living_needs_heat;
END_IF;

boiler := valve_bedroom OR valve_living;

END_PROGRAM
```

## Step 5: Advanced - Minimum Runtime Protection

Prevent short cycling by ensuring the boiler runs for at least 5 minutes:

```iecst
{mode: restart}
{throttle: T#1m}
PROGRAM HVAC_Min_Runtime
VAR
    // Zones (simplified)
    {trigger}
    temp1 AT %I* : REAL := 'sensor.zone1_temperature';
    {no_trigger}
    target1 AT %I* : REAL := 'input_number.zone1_target';
    valve1 AT %Q* : BOOL := 'switch.zone1_valve';
    
    boiler AT %Q* : BOOL := 'switch.boiler';
    
    {persistent}
    deadband : REAL := 0.5;
    
    // Minimum runtime timer
    min_runtime_timer : TON;
    {persistent}
    boiler_state : BOOL := FALSE;
    zone_demand : BOOL;
END_VAR

// Zone control
zone_demand := temp1 < (target1 - deadband);
valve1 := zone_demand;

// Minimum runtime logic
IF zone_demand AND NOT boiler_state THEN
    // Start boiler and timer
    boiler := TRUE;
    boiler_state := TRUE;
    min_runtime_timer(IN := TRUE, PT := T#5m);
ELSIF NOT zone_demand AND boiler_state AND min_runtime_timer.Q THEN
    // Zone satisfied AND minimum runtime elapsed
    boiler := FALSE;
    boiler_state := FALSE;
ELSIF zone_demand AND boiler_state THEN
    // Keep boiler running
    boiler := TRUE;
    min_runtime_timer(IN := TRUE, PT := T#5m);
END_IF;

END_PROGRAM
```

## Performance Considerations

### Throttling

```iecst
{throttle: T#1m}
```

- With multiple zones, temperature changes can be frequent
- Throttling limits execution to once per minute maximum
- Reduces load while maintaining responsiveness

### Trigger Strategy

- **Trigger on zone temperatures** - Most responsive
- **Don't trigger on targets** - Targets change infrequently, use `{no_trigger}`
- **Don't trigger on mode** - Mode changes are rare

## Common Issues

### Boiler Runs When No Zones Need Heat

1. **Check zone logic** - Verify all zone comparisons are correct
2. **Check OR logic** - Ensure `boiler := valve1 OR valve2 OR valve3` is correct
3. **Use Online Mode** - See actual valve states

### Some Zones Never Get Heat

1. **Check valve assignments** - Ensure each zone has its own valve
2. **Check target temperatures** - Verify helpers have valid values
3. **Check deadband** - Might be too large

### Boiler Cycles Too Frequently

1. **Increase deadband** - Larger hysteresis reduces switching
2. **Add minimum runtime** - Use timer to prevent short cycles
3. **Increase throttle** - Reduce execution frequency

## Tips

- **Start simple** - Begin with 2 zones, add more as needed
- **Use Online Mode** - Monitor all zone temperatures simultaneously
- **Test each zone** - Verify each zone works independently
- **Monitor boiler runtime** - Check automation traces to see behavior

## Next Steps

- Try [Timer-Based Tutorial](./04-staircase-timer.md) for time-based logic
- Learn about [State Machines](../reference/patterns.md#state-machines) for complex control
- Explore [Presence-Based Automation](./05-presence.md) for occupancy-aware systems

---

**Related:**
- [Tutorial 2: Thermostat](./02-thermostat.md)
- [Tutorial 4: Staircase Timer](./04-staircase-timer.md)
- [Common Patterns](../reference/patterns.md)
