# Troubleshooting Guide

This guide helps you diagnose and fix common issues when using ST for Home Assistant.

## Table of Contents

1. [Syntax and Parsing Errors](#syntax-and-parsing-errors)
2. [Entity and Binding Issues](#entity-and-binding-issues)
3. [Execution Problems](#execution-problems)
4. [Timer and Timing Issues](#timer-and-timing-issues)
5. [Performance Problems](#performance-problems)
6. [Deployment Issues](#deployment-issues)
7. [Debugging Techniques](#debugging-techniques)

---

## Syntax and Parsing Errors

### "Syntax Error" or "Parse Error"

**Symptoms:**
- Red error indicators in the editor
- Status bar shows "Syntax Error"
- Cannot deploy

**Common Causes:**

1. **Missing semicolon**
   ```iecst
   // ❌ Wrong
   VAR
       x : INT := 5
   END_VAR
   
   // ✅ Correct
   VAR
       x : INT := 5;
   END_VAR
   ```

2. **Mismatched keywords**
   ```iecst
   // ❌ Wrong
   IF condition THEN
       action;
   END_IF  // Missing semicolon or wrong keyword
   
   // ✅ Correct
   IF condition THEN
       action;
   END_IF;
   ```

3. **Invalid pragma syntax**
   ```iecst
   // ❌ Wrong
   {mode restart}  // Missing colon
   {throttle: 30s}  // Missing T#
   
   // ✅ Correct
   {mode: restart}
   {throttle: T#30s}
   ```

4. **Type mismatch**
   ```iecst
   // ❌ Wrong
   VAR
       x : BOOL := 5;  // BOOL cannot be 5
   END_VAR
   
   // ✅ Correct
   VAR
       x : INT := 5;
   END_VAR
   ```

**Solution:**
- Check the error message for line numbers
- Verify syntax matches examples in documentation
- Use the editor's syntax highlighting to spot issues
- Check for typos in keywords (IF vs IF, THEN vs THAN, etc.)

---

### "Unexpected Token" Error

**Symptoms:**
- Parser stops at a specific character
- Error points to a specific line/column

**Common Causes:**

1. **Invalid operator**
   ```iecst
   // ❌ Wrong
   x := y && z;  // Use AND, not &&
   
   // ✅ Correct
   x := y AND z;
   ```

2. **Invalid time literal**
   ```iecst
   // ❌ Wrong
   timer(IN := x, PT := 30s);
   timer(IN := x, PT := T#30);
   
   // ✅ Correct
   timer(IN := x, PT := T#30s);
   ```

3. **Invalid entity binding**
   ```iecst
   // ❌ Wrong
   x AT %I : BOOL := 'entity.id';
   
   // ✅ Correct
   x AT %I* : BOOL := 'entity.id';
   ```

**Solution:**
- Check the exact syntax for operators, literals, and bindings
- Refer to the [Quickstart Guide](./quickstart.md) for correct syntax

---

## Entity and Binding Issues

### "Entity not found" Error

**Symptoms:**
- Error during deployment or execution
- Entity ID not recognized

**Common Causes:**

1. **Typo in entity ID**
   ```iecst
   // ❌ Wrong
   motion AT %I* : BOOL := 'binary_sensor.livingroom_motion';
   
   // ✅ Correct (check exact ID)
   motion AT %I* : BOOL := 'binary_sensor.living_room_motion';
   ```

2. **Case sensitivity**
   ```iecst
   // ❌ Wrong (if entity is lowercase)
   motion AT %I* : BOOL := 'Binary_Sensor.Living_Room_Motion';
   
   // ✅ Correct
   motion AT %I* : BOOL := 'binary_sensor.living_room_motion';
   ```

3. **Entity doesn't exist**
   - Entity was removed or renamed
   - Integration not loaded

**Solution:**
1. Go to **Settings** → **Devices & Services** → **Entities**
2. Search for your entity
3. Copy the exact entity ID
4. Use the Entity Browser in the ST Editor to drag-and-drop entities

---

### Entity Returns "unavailable" or "unknown"

**Symptoms:**
- Automation runs but gets unexpected values
- Jinja template errors in logs
- Variables show `unavailable` in Online Mode

**Common Causes:**

1. **Entity is offline**
   - Device disconnected
   - Integration not working
   - Network issue

2. **Entity state is invalid**
   - Sensor returning `unknown`
   - Entity not initialized

**Solution:**
1. Check entity state in **Developer Tools** → **States**
2. Verify device is online and working
3. Check integration status
4. The transpiler generates defensive templates, but verify entity availability

---

### Wrong Data Type

**Symptoms:**
- Type conversion errors
- Unexpected behavior
- Comparison failures

**Common Causes:**

1. **String vs Boolean**
   ```iecst
   // ❌ Wrong (device_tracker returns STRING)
   IF phone = TRUE THEN
   
   // ✅ Correct
   IF phone = 'home' THEN
   ```

2. **REAL vs INT**
   ```iecst
   // ❌ Wrong (temperature is REAL)
   temp : INT := 'sensor.temperature';
   
   // ✅ Correct
   temp : REAL := 'sensor.temperature';
   ```

**Solution:**
- Check entity state type in **Developer Tools** → **States**
- Use correct ST type:
  - `BOOL` for on/off, true/false
  - `INT` for whole numbers
  - `REAL` for decimals
  - `STRING` for text (like device_tracker states)

---

## Execution Problems

### Program Never Runs

**Symptoms:**
- Automation doesn't execute
- No traces in automation history
- Status bar shows "Triggers: 0"

**Common Causes:**

1. **No triggers defined**
   ```iecst
   // ❌ Wrong (no trigger pragma)
   VAR
       motion AT %I* : BOOL := 'binary_sensor.motion';
   END_VAR
   
   // ✅ Correct
   VAR
       {trigger}
       motion AT %I* : BOOL := 'binary_sensor.motion';
   END_VAR
   ```

2. **Trigger entity never changes**
   - Entity state is constant
   - Entity is unavailable

3. **All entities marked as no_trigger**
   ```iecst
   // ❌ Wrong
   VAR
       {no_trigger}
       motion AT %I* : BOOL := 'binary_sensor.motion';
   END_VAR
   ```

**Solution:**
1. Add `{trigger}` pragma to at least one input variable
2. Verify trigger entity actually changes state
3. Check status bar shows "Triggers: X" where X > 0
4. Test by manually changing the entity state

---

### Automation Runs Too Often

**Symptoms:**
- Excessive automation executions
- High CPU usage
- Logs flooded with automation traces

**Common Causes:**

1. **Too many trigger entities**
   ```iecst
   // ❌ Problem: Every entity triggers
   VAR
       {trigger}
       temp1 AT %I* : REAL := 'sensor.temp1';
       {trigger}
       temp2 AT %I* : REAL := 'sensor.temp2';
       {trigger}
       temp3 AT %I* : REAL := 'sensor.temp3';
   END_VAR
   ```

2. **Fast-updating sensors**
   - Temperature sensor updates every second
   - Power sensor updates frequently

3. **No throttling**

**Solution:**
1. Use `{no_trigger}` on entities that shouldn't trigger
   ```iecst
   VAR
       {trigger}
       temp1 AT %I* : REAL := 'sensor.temp1';
       {no_trigger}  // ✅ Doesn't trigger
       target AT %I* : REAL := 'input_number.target';
   END_VAR
   ```

2. Add throttling
   ```iecst
   {throttle: T#30s}  // ✅ Max once per 30 seconds
   PROGRAM Example
   ```

3. Use debouncing for noisy sensors
   ```iecst
   {debounce: T#500ms}  // ✅ Wait for quiet period
   PROGRAM Example
   ```

---

### Variable Value Not Persisting

**Symptoms:**
- Counter resets to 0 after restart
- State lost between runs
- Helper not created

**Common Causes:**

1. **Missing persistent pragma**
   ```iecst
   // ❌ Wrong (resets each run)
   VAR
       counter : INT := 0;
   END_VAR
   
   // ✅ Correct
   VAR
       {persistent}
       counter : INT := 0;
   END_VAR
   ```

2. **Variable not self-referencing**
   - Simple constants don't need persistence
   - Only variables used in logic need `{persistent}`

**Solution:**
1. Add `{persistent}` pragma to variables that must persist
2. Verify helper is created (check **Developer Tools** → **States**)
3. Helper name: `input_<type>.st_<project>_<program>_<variable>`

---

## Timer and Timing Issues

### Timer Doesn't Work

**Symptoms:**
- Timer output never changes
- Timer doesn't start
- Timer runs forever

**Common Causes:**

1. **Timer not called every cycle**
   ```iecst
   // ❌ Wrong (timer only called conditionally)
   IF condition THEN
       timer(IN := x, PT := T#5s);
   END_IF;
   
   // ✅ Correct (timer called every cycle)
   timer(IN := x, PT := T#5s);
   ```

2. **Wrong timer type**
   - Using TON instead of TOF
   - Using TOF instead of TON

3. **Invalid time literal**
   ```iecst
   // ❌ Wrong
   timer(IN := x, PT := 5s);
   timer(IN := x, PT := T#5);
   
   // ✅ Correct
   timer(IN := x, PT := T#5s);
   ```

**Solution:**
1. Timer must be called every cycle (not conditionally)
2. Use correct timer type:
   - `TON` - On-delay (output after input on for PT)
   - `TOF` - Off-delay (output stays on for PT after input off)
   - `TP` - Pulse (output on for exactly PT)
3. Verify time literal syntax: `T#<value><unit>`

---

### Timer Runs Forever

**Symptoms:**
- Timer output stays TRUE
- Never resets

**Common Causes:**

1. **TOF timer with input always ON**
   ```iecst
   // If input never goes OFF, TOF never starts countdown
   off_timer(IN := always_true, PT := T#5s);
   ```

2. **Timer not reset properly**

**Solution:**
1. Understand timer behavior:
   - `TON`: Output goes ON after input is ON for PT
   - `TOF`: Output stays ON for PT after input goes OFF
   - `TP`: Output is ON for exactly PT when input goes ON
2. Check input signal - timer behavior depends on input state
3. Use Online Mode to monitor timer state

---

## Performance Problems

### Slow Execution

**Symptoms:**
- Automation takes long to complete
- Delayed responses
- High CPU usage

**Common Causes:**

1. **Too many entity reads**
2. **Complex calculations**
3. **No throttling**

**Solution:**
1. Add throttling to limit execution rate
2. Use `{no_trigger}` to reduce triggers
3. Optimize calculations (avoid unnecessary operations)
4. Check automation traces for bottlenecks

---

### High Memory Usage

**Symptoms:**
- Home Assistant slow
- High memory consumption

**Common Causes:**

1. **Too many persistent variables**
2. **Large helper values**
3. **Many automations**

**Solution:**
1. Review persistent variables - only persist what's needed
2. Clean up unused helpers
3. Consolidate similar automations

---

## Deployment Issues

### Deployment Fails

**Symptoms:**
- Error during deployment
- Preview shows errors
- Rollback occurs

**Common Causes:**

1. **Syntax errors** (see [Syntax Errors](#syntax-and-parsing-errors))
2. **Entity errors** (see [Entity Issues](#entity-and-binding-issues))
3. **Helper creation fails**
4. **Permission issues**

**Solution:**
1. Fix all syntax errors first
2. Verify all entity IDs exist
3. Check Home Assistant logs for specific errors
4. Try deploying a simpler version first

---

### Helpers Not Created

**Symptoms:**
- Persistent variables don't have helpers
- Values reset after restart

**Common Causes:**

1. **Missing persistent pragma**
2. **Invalid variable name**
3. **Helper creation failed**

**Solution:**
1. Add `{persistent}` pragma
2. Ensure variable name is valid (alphanumeric, underscore)
3. Check logs for helper creation errors
4. Manually create helper if needed

---

## Debugging Techniques

### Use Online Mode

**Online Mode** shows live entity values next to variables in the editor:

1. Click the **● ONLINE** button in the editor
2. See actual values from Home Assistant
3. Monitor state changes in real-time
4. Verify entity bindings are correct

**When to Use:**
- Verifying entity values
- Debugging logic issues
- Testing entity bindings
- Monitoring state changes

---

### Check Automation Traces

**Automation Traces** show detailed execution history:

1. Go to **Settings** → **Automations & Scenes**
2. Find your automation
3. Click **Traces**
4. View execution history, inputs, outputs, and errors

**What to Look For:**
- Did the automation run?
- What were the input values?
- What were the output values?
- Any errors or warnings?

---

### Check Home Assistant Logs

**Logs** show errors and warnings:

1. Go to **Settings** → **System** → **Logs**
2. Filter for your automation name
3. Look for errors, warnings, or template issues

**Common Log Messages:**
- Entity not found
- Template errors
- Service call failures
- Type conversion errors

---

### Simplify and Test

When debugging:

1. **Start simple** - Remove complex logic
2. **Test incrementally** - Add features one at a time
3. **Use Online Mode** - Verify values at each step
4. **Check traces** - See what's actually happening
5. **Add logging** - Use persistent variables to track state

**Example:**
```iecst
VAR
    {trigger}
    input AT %I* : BOOL := 'binary_sensor.input';
    
    {persistent}
    debug_count : INT := 0;  // Track executions
    
    output AT %Q* : BOOL := 'switch.output';
END_VAR

// Debug: Count executions
debug_count := debug_count + 1;

// Simple logic
output := input;

END_PROGRAM
```

---

## Getting More Help

If you're still stuck:

1. **Check Documentation:**
   - [Quickstart Guide](./quickstart.md)
   - [Tutorials](./tutorials/)
   - [Pragma Reference](./reference/pragmas.md)
   - [Common Patterns](./reference/patterns.md)

2. **Search Issues:**
   - [GitHub Issues](https://github.com/Auda29/ST_HA_Automation/issues)
   - [GitHub Discussions](https://github.com/Auda29/ST_HA_Automation/discussions)

3. **Report Issues:**
   - Include your ST code
   - Include error messages
   - Include automation traces
   - Include Home Assistant logs

4. **Ask Questions:**
   - Use GitHub Discussions
   - Provide minimal reproducible example
   - Describe expected vs actual behavior

---

**Related:**
- [Quickstart Guide](./quickstart.md) - Basic usage
- [FAQ](./faq.md) - Common questions
- [Tutorials](./tutorials/) - Step-by-step guides
