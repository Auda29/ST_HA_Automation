# Tutorial 5: Presence-Based Automation

This tutorial demonstrates how to create automations that respond to presence/occupancy, turning systems on when someone is home and off when everyone leaves.

## What You'll Learn

- Combining multiple presence sensors
- State-based logic for occupancy detection
- Delayed actions (turn off after everyone leaves)
- Coordinating multiple systems based on presence

## Prerequisites

- Completed [Tutorial 1: Motion Light](./01-motion-light.md)
- Understanding of boolean logic and timers
- Presence sensors (device trackers, motion sensors, or input_boolean helpers)
- Systems to control (lights, HVAC, etc.)

## Scenario: Smart Home Presence

You want to:
1. Detect when someone is home (any presence sensor active)
2. Turn on lights/HVAC when someone arrives
3. Turn off systems after everyone leaves (with delay to prevent false triggers)
4. Maintain different behavior for "home" vs "away" states

## Step 1: Basic Presence Detection

```iecst
{mode: restart}
PROGRAM Presence_Detection
VAR
    // Multiple presence sources
    {trigger}
    phone1 AT %I* : BOOL := 'device_tracker.phone_john';
    {trigger}
    phone2 AT %I* : BOOL := 'device_tracker.phone_mary';
    {trigger}
    motion_living AT %I* : BOOL := 'binary_sensor.living_room_motion';
    {trigger}
    motion_bedroom AT %I* : BOOL := 'binary_sensor.bedroom_motion';
    
    // Presence state (stored persistently)
    {persistent}
    someone_home : BOOL := FALSE;
    
    // Outputs
    away_mode AT %Q* : BOOL := 'input_boolean.away_mode';
END_VAR

// Someone is home if any sensor is active
someone_home := phone1 = 'home' OR 
                phone2 = 'home' OR 
                motion_living OR 
                motion_bedroom;

// Update away mode (inverted: TRUE when away)
away_mode := NOT someone_home;

END_PROGRAM
```

**Note:** Device trackers return strings like `'home'` or `'not_home'`, not boolean values. Compare with strings.

## Step 2: Enhanced - Delayed Away Detection

Add a delay before turning off systems (prevents turning off if someone briefly steps outside):

```iecst
{mode: restart}
PROGRAM Presence_With_Delay
VAR
    // Presence sources
    {trigger}
    phone1 AT %I* : STRING := 'device_tracker.phone_john';
    {trigger}
    phone2 AT %I* : STRING := 'device_tracker.phone_mary';
    {trigger}
    motion_living AT %I* : BOOL := 'binary_sensor.living_room_motion';
    
    // Presence state
    {persistent}
    someone_home : BOOL := FALSE;
    
    // Away delay timer
    away_timer : TOF;
    
    // Outputs
    away_mode AT %Q* : BOOL := 'input_boolean.away_mode';
END_VAR

// Detect if anyone is currently present
someone_home := phone1 = 'home' OR 
                phone2 = 'home' OR 
                motion_living;

// Start timer when presence is lost
away_timer(IN := someone_home, PT := T#15m);

// Away mode activates 15 minutes after last presence
away_mode := NOT (someone_home OR away_timer.Q);

END_PROGRAM
```

**Behavior:**
- When someone is detected: `someone_home := TRUE`, `away_mode := FALSE`
- When presence is lost: Timer starts (15 minutes)
- During timer: `away_mode` stays `FALSE` (still considered "home")
- After timer expires: `away_mode := TRUE` (everyone is away)

## Step 3: Advanced - Presence-Based Climate Control

Control HVAC based on presence with different setpoints:

```iecst
{mode: restart}
{throttle: T#5m}
PROGRAM Presence_Climate
VAR
    // Presence
    {trigger}
    phone1 AT %I* : STRING := 'device_tracker.phone_john';
    {trigger}
    phone2 AT %I* : STRING := 'device_tracker.phone_mary';
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.living_room_motion';
    
    // Climate
    {trigger}
    current_temp AT %I* : REAL := 'sensor.living_room_temperature';
    {no_trigger}
    target_home AT %I* : REAL := 'input_number.target_home';
    {no_trigger}
    target_away AT %I* : REAL := 'input_number.target_away';
    
    heater AT %Q* : BOOL := 'switch.heater';
    
    // State
    {persistent}
    someone_home : BOOL := FALSE;
    away_timer : TOF;
    
    {persistent}
    deadband : REAL := 0.5;
    
    away_mode : BOOL;
    target_temp : REAL;
END_VAR

// Presence detection
someone_home := phone1 = 'home' OR 
                phone2 = 'home' OR 
                motion;

// Away delay
away_timer(IN := someone_home, PT := T#15m);
away_mode := NOT (someone_home OR away_timer.Q);

// Select target temperature based on presence
IF away_mode THEN
    target_temp := target_away;
ELSE
    target_temp := target_home;
END_IF;

// Thermostat control
IF current_temp < (target_temp - deadband) THEN
    heater := TRUE;
ELSIF current_temp > (target_temp + deadband) THEN
    heater := FALSE;
END_IF;

END_PROGRAM
```

**Features:**
- Uses `target_home` when someone is home (e.g., 21°C)
- Uses `target_away` when everyone is away (e.g., 16°C)
- 15-minute delay before switching to away mode
- Saves energy by reducing heating when away

## Step 4: Advanced - Multi-Room Presence

Track presence in different rooms and control room-specific systems:

```iecst
{mode: restart}
PROGRAM Multi_Room_Presence
VAR
    // Living room presence
    {trigger}
    motion_living AT %I* : BOOL := 'binary_sensor.living_room_motion';
    {trigger}
    phone_living AT %I* : STRING := 'device_tracker.phone_john';
    
    // Bedroom presence
    {trigger}
    motion_bedroom AT %I* : BOOL := 'binary_sensor.bedroom_motion';
    {trigger}
    phone_bedroom AT %I* : STRING := 'device_tracker.phone_mary';
    
    // Room lights
    light_living AT %Q* : BOOL := 'light.living_room';
    light_bedroom AT %Q* : BOOL := 'light.bedroom';
    
    // Room timers
    living_timer : TOF;
    bedroom_timer : TOF;
    
    // Room presence states
    {persistent}
    living_occupied : BOOL := FALSE;
    {persistent}
    bedroom_occupied : BOOL := FALSE;
END_VAR

// Living room presence
living_occupied := motion_living OR phone_living = 'home';
living_timer(IN := living_occupied, PT := T#10m);
light_living := living_occupied OR living_timer.Q;

// Bedroom presence
bedroom_occupied := motion_bedroom OR phone_bedroom = 'home';
bedroom_timer(IN := bedroom_occupied, PT := T#10m);
light_bedroom := bedroom_occupied OR bedroom_timer.Q;

END_PROGRAM
```

## Step 5: Advanced - Arrival/Departure Actions

Trigger specific actions when someone arrives or leaves:

```iecst
{mode: restart}
PROGRAM Arrival_Departure
VAR
    // Presence
    {trigger}
    phone1 AT %I* : STRING := 'device_tracker.phone_john';
    {trigger}
    phone2 AT %I* : STRING := 'device_tracker.phone_mary';
    
    // Previous state (for edge detection)
    {persistent}
    prev_someone_home : BOOL := FALSE;
    
    // Current state
    someone_home : BOOL;
    
    // Edge detection
    arrival_trigger : R_TRIG;
    departure_trigger : F_TRIG;
    
    // Outputs
    welcome_light AT %Q* : BOOL := 'light.entryway';
    security_mode AT %Q* : BOOL := 'input_boolean.security_mode';
END_VAR

// Current presence
someone_home := phone1 = 'home' OR phone2 = 'home';

// Edge detection
arrival_trigger(CLK := someone_home);
departure_trigger(CLK := someone_home);

// Arrival actions
IF arrival_trigger.Q THEN
    welcome_light := TRUE;
    security_mode := FALSE;
END_IF;

// Departure actions
IF departure_trigger.Q THEN
    welcome_light := FALSE;
    security_mode := TRUE;
END_IF;

// Update previous state
prev_someone_home := someone_home;

END_PROGRAM
```

**Edge Detection:**
- `R_TRIG` - Rising edge (detects transition from FALSE to TRUE)
- `F_TRIG` - Falling edge (detects transition from TRUE to FALSE)
- `arrival_trigger.Q` - TRUE for one cycle when someone arrives
- `departure_trigger.Q` - TRUE for one cycle when everyone leaves

## Step 6: Advanced - Manual Override

Allow manual control while maintaining presence logic:

```iecst
{mode: restart}
PROGRAM Presence_With_Override
VAR
    // Presence
    {trigger}
    phone1 AT %I* : STRING := 'device_tracker.phone_john';
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.living_room_motion';
    
    // Manual control
    {no_trigger}
    manual_away AT %I* : BOOL := 'input_boolean.manual_away';
    
    // Systems
    light AT %Q* : BOOL := 'light.living_room';
    heater AT %Q* : BOOL := 'switch.heater';
    
    // State
    {persistent}
    someone_home : BOOL := FALSE;
    away_timer : TOF;
    
    away_mode : BOOL;
    auto_light : BOOL;
END_VAR

// Presence detection
someone_home := phone1 = 'home' OR motion;

// Away delay
away_timer(IN := someone_home, PT := T#15m);

// Away mode: manual override OR automatic detection
away_mode := manual_away OR (NOT (someone_home OR away_timer.Q));

// Automatic light control (disabled if manual away)
auto_light := someone_home OR away_timer.Q;
light := auto_light AND NOT away_mode;

// Heater always respects away mode
IF away_mode THEN
    heater := FALSE;
ELSE
    heater := TRUE;  // Or use thermostat logic
END_IF;

END_PROGRAM
```

## Common Issues

### Presence Never Detected

1. **Check device tracker states** - Use `'home'` not `'Home'` or `TRUE`
2. **Check string comparison** - Device trackers return strings, use `= 'home'`
3. **Check motion sensors** - Ensure they're actually triggering

### Systems Turn Off Immediately

1. **Add away delay** - Use TOF timer to delay away mode
2. **Check timer logic** - Ensure timer is called every cycle
3. **Increase delay time** - Try 15-30 minutes instead of 5 minutes

### False Away Detection

1. **Combine multiple sensors** - Use phones + motion + other sensors
2. **Increase delay** - Longer away delay reduces false triggers
3. **Check sensor reliability** - Some sensors may be unreliable

## Tips

- **Combine sensors** - Multiple presence sources increase reliability
- **Use delays** - Away delays prevent false triggers from brief absences
- **Store state** - Use `{persistent}` for presence state to survive restarts
- **Test thoroughly** - Presence logic can be tricky; test arrival and departure
- **Monitor with Online Mode** - Watch presence states change in real-time

## Next Steps

- Review [Common Patterns](../reference/patterns.md) for edge detection and state machines
- Explore [Pragma Reference](../reference/pragmas.md) for advanced features
- Try combining presence with other tutorials for complex automations

---

**Related:**
- [Tutorial 1: Motion Light](./01-motion-light.md)
- [Tutorial 4: Staircase Timer](./04-staircase-timer.md)
- [Common Patterns](../reference/patterns.md)
