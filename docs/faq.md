# Frequently Asked Questions (FAQ)

Common questions about ST for Home Assistant.

## Table of Contents

1. [General Questions](#general-questions)
2. [Syntax and Language](#syntax-and-language)
3. [Entities and Bindings](#entities-and-bindings)
4. [Execution and Performance](#execution-and-performance)
5. [Pragmas and Configuration](#pragmas-and-configuration)
6. [Timers and Timing](#timers-and-timing)
7. [Troubleshooting](#troubleshooting)

---

## General Questions

### What is ST for Home Assistant?

ST (Structured Text) for Home Assistant is a visual programming tool that lets you write automation logic using IEC 61131-3 Structured Text syntax. Your ST programs are transpiled to Home Assistant automations and scripts.

### Do I need programming experience?

Basic programming concepts help (variables, conditions, loops), but the tutorials guide you step-by-step. Start with [Tutorial 1: Motion Light](./tutorials/01-motion-light.md).

### Is this compatible with standard Home Assistant automations?

Yes! ST programs are transpiled to standard Home Assistant automations and scripts. You can mix ST automations with YAML automations.

### Can I edit the generated YAML?

The generated YAML is managed by the transpiler. Edit your ST code instead - changes are automatically reflected in the generated automation.

### How do I update ST for Home Assistant?

If installed via HACS, updates appear in HACS. If manual installation, download the latest release and replace the files.

---

## Syntax and Language

### What data types are supported?

- `BOOL` - Boolean (TRUE/FALSE)
- `INT` - Integer (whole numbers)
- `REAL` - Real number (decimals)
- `STRING` - Text strings
- `TIME` - Time duration (for timers)

### How do I write comments?

```iecst
// Single-line comment

(*
   Multi-line comment
   Can span multiple lines
*)
```

### What operators are available?

**Arithmetic:**
- `+`, `-`, `*`, `/`, `MOD`

**Comparison:**
- `=`, `<>`, `<`, `>`, `<=`, `>=`

**Logical:**
- `AND`, `OR`, `XOR`, `NOT`

### Can I use functions?

Yes! Built-in functions include:
- `ABS`, `SQRT`, `TRUNC`, `ROUND`
- `MIN`, `MAX`, `LIMIT`
- `TO_INT`, `TO_REAL`, `TO_STRING`, `TO_BOOL`
- `SEL`, `MUX` (selection functions)

### What control structures are supported?

- `IF/THEN/ELSIF/ELSE/END_IF`
- `CASE...OF/END_CASE`
- `FOR...TO...DO/END_FOR`
- `WHILE...DO/END_WHILE`
- `REPEAT...UNTIL/END_REPEAT`

---

## Entities and Bindings

### What's the difference between %I*, %Q*, and %M*?

- `%I*` - Input binding (read from HA entity)
- `%Q*` - Output binding (control HA entity)
- `%M*` - Memory binding (persistent storage via helpers)

### How do I find entity IDs?

1. Go to **Settings** → **Devices & Services** → **Entities**
2. Search for your entity
3. Copy the entity ID
4. Or use the Entity Browser in the ST Editor sidebar

### Can I use device_tracker entities?

Yes! Device trackers return strings like `'home'` or `'not_home'`:

```iecst
VAR
    {trigger}
    phone AT %I* : STRING := 'device_tracker.phone_john';
END_VAR

IF phone = 'home' THEN
    // Someone is home
END_IF;
```

### What if an entity is unavailable?

The transpiler generates defensive templates that handle `unavailable` and `unknown` states. If you still see errors, check that the entity is online and working.

### Can I bind to climate entities?

Yes, but climate entities have complex states. You might need to read specific attributes:

```iecst
VAR
    {trigger}
    temp AT %I* : REAL := 'climate.thermostat';
    // Note: This reads the current_temperature attribute
END_VAR
```

---

## Execution and Performance

### How often does my program run?

Your program runs when a trigger entity changes state. Use `{throttle}` to limit the maximum rate.

### What's the difference between throttle and debounce?

- **Throttle**: Maximum execution rate (e.g., once per 30 seconds)
- **Debounce**: Wait for quiet period (e.g., wait 500ms after last trigger)

### Why does my program run too often?

1. Too many entities have `{trigger}` pragma
2. Fast-updating sensors
3. No throttling

**Solution:** Use `{no_trigger}` on entities that shouldn't trigger, and add `{throttle}`.

### Can I control execution order?

Use `{mode: queued}` to queue triggers and execute in order. Use `{mode: single}` to ignore new triggers while running.

### What happens if the program is still running when a new trigger arrives?

Depends on `{mode}`:
- `restart` (default): Aborts current execution and restarts
- `single`: Ignores new trigger
- `queued`: Queues the trigger
- `parallel`: Runs in parallel (use with caution)

---

## Pragmas and Configuration

### What are pragmas?

Pragmas are special directives that control program behavior. They're written in curly braces: `{pragma_name}` or `{pragma_name: value}`.

### Do I need to use pragmas?

Some pragmas are required:
- `{trigger}` - At least one variable must trigger the automation
- `{mode}` - Recommended (defaults to `restart`)

Others are optional but useful:
- `{throttle}` - Limit execution rate
- `{persistent}` - Store values across restarts

### What's the difference between persistent and transient?

- `{persistent}`: Value stored in HA helper, survives restarts
- `{transient}`: Value resets each run (default)

### When should I use reset_on_restart?

Use `{reset_on_restart}` when you want a value stored but always start with the initial value after HA restarts (e.g., daily counters).

### Can I combine pragmas?

Yes, but some combinations are invalid:
- ✅ `{persistent}` + `{reset_on_restart}`
- ❌ `{trigger}` + `{no_trigger}` (contradictory)

---

## Timers and Timing

### What timer types are available?

- `TON` - Timer On-Delay (output after input on for preset time)
- `TOF` - Timer Off-Delay (output stays on for preset time after input off)
- `TP` - Timer Pulse (output on for exactly preset time)

### How do I write time literals?

Use `T#<value><unit>`:
- `T#5s` - 5 seconds
- `T#2m` - 2 minutes
- `T#1h` - 1 hour
- `T#500ms` - 500 milliseconds
- `T#1h30m` - 1 hour 30 minutes

### Why doesn't my timer work?

1. Timer must be called every cycle (not conditionally)
2. Check timer type (TON vs TOF vs TP)
3. Verify time literal syntax

### Can I use timers with persistent variables?

Yes! Timer instances can be persistent if needed:

```iecst
VAR
    {persistent}
    my_timer : TON;
END_VAR
```

---

## Troubleshooting

### My program never runs

1. Check that at least one variable has `{trigger}` pragma
2. Verify trigger entity actually changes state
3. Check status bar shows "Triggers: X" where X > 0

### I get "Entity not found" errors

1. Check entity ID spelling (case-sensitive)
2. Verify entity exists in Home Assistant
3. Use Entity Browser to drag-and-drop entities

### Variables reset after restart

Add `{persistent}` pragma to variables that must persist:

```iecst
VAR
    {persistent}
    counter : INT := 0;
END_VAR
```

### My automation runs too often

1. Use `{no_trigger}` on entities that shouldn't trigger
2. Add `{throttle: T#30s}` to limit execution rate
3. Use `{debounce: T#500ms}` for noisy sensors

### How do I debug my program?

1. **Use Online Mode** - See live entity values
2. **Check Automation Traces** - View execution history
3. **Check Logs** - Look for errors in Settings → System → Logs
4. **Simplify** - Remove complex logic and test incrementally

### Where can I get help?

1. **Documentation:**
   - [Quickstart Guide](./quickstart.md)
   - [Tutorials](./tutorials/)
   - [Troubleshooting Guide](./troubleshooting.md)

2. **Community:**
   - [GitHub Issues](https://github.com/Auda29/ST_HA_Automation/issues)
   - [GitHub Discussions](https://github.com/Auda29/ST_HA_Automation/discussions)

---

## Advanced Questions

### Can I define custom function blocks?

Not yet - this is planned for Phase 3. Currently, only built-in function blocks (TON, TOF, TP, R_TRIG, F_TRIG, SR, RS) are supported.

### Can I use multiple programs?

Yes! Use the Project Explorer to manage multiple ST files in a project.

### Can I import/export programs?

Import/export functionality is planned (T-029). Currently, programs are stored in browser localStorage.

### How do I share my programs?

You can copy-paste ST code, or wait for import/export functionality. Programs are stored locally in your browser.

### Is there a way to version control my programs?

Currently, programs are stored in browser localStorage. For version control, you can:
1. Copy-paste code to files
2. Use browser developer tools to export localStorage
3. Wait for import/export functionality (T-029)

---

## Still Have Questions?

- Check the [Troubleshooting Guide](./troubleshooting.md)
- Browse [GitHub Issues](https://github.com/Auda29/ST_HA_Automation/issues)
- Ask in [GitHub Discussions](https://github.com/Auda29/ST_HA_Automation/discussions)
- Review the [Tutorials](./tutorials/) for step-by-step examples

---

**Related:**
- [Quickstart Guide](./quickstart.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Tutorials](./tutorials/)
