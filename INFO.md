# ST for Home Assistant

Program Home Assistant automations using **Structured Text (IEC 61131-3)** - the industrial PLC language used in TwinCAT, Siemens, and other industrial controllers.

## What is this?

ST for Home Assistant transpiles Structured Text code into native Home Assistant automations. Write your automations using the same language as industrial PLCs, with full support for:

- **Industrial Control Patterns**: Edge detection, state machines, timers, flip-flops
- **Native HA Integration**: Code is transpiled to standard HA automations (no runtime overhead)
- **Visual Editor**: CodeMirror-based editor with syntax highlighting, autocomplete, and live value display
- **Entity Browser**: Drag-and-drop entity binding with automatic type inference
- **Multi-File Projects**: Organize complex automations across multiple ST program files

## Key Features

### Industrial PLC Language
Write automations using Structured Text (IEC 61131-3) with full support for:
- All standard data types (BOOL, INT, REAL, STRING, TIME, etc.)
- Control structures (IF/ELSE, CASE, FOR, WHILE, REPEAT)
- Function blocks (TON, TOF, TP timers, R_TRIG, F_TRIG edge detection)
- Built-in functions (MIN, MAX, LIMIT, ABS, SQRT, etc.)

### Smart Transpilation
- **Event-Driven**: Automatic trigger generation from entity dependencies
- **State Persistence**: Smart helper management for persistent variables
- **Safety Features**: Loop guards, defensive Jinja generation, null-safety
- **Timer Support**: TON, TOF, TP function blocks using HA timer entities

### Professional Editor
- **Syntax Highlighting**: TwinCAT-inspired dark theme
- **Autocomplete**: Template-based code completion
- **Online Mode**: Real-time entity value display in the editor
- **Entity Browser**: Visual entity selection with drag-and-drop
- **Project Explorer**: Multi-file project support with tabs

### Deployment
- **Transactional Deploy**: Atomic deployment with backup and rollback
- **Source Maps**: Error messages point back to ST source code
- **Error Translation**: HA errors translated to ST context

## Example

```iecst
{mode: restart}
{throttle: T#1s}
PROGRAM Kitchen_Light
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';
    
    light AT %Q* : BOOL := 'light.kitchen';
    
    {persistent}
    activationCount : INT := 0;
END_VAR

IF motion THEN
    light := TRUE;
    activationCount := activationCount + 1;
ELSE
    light := FALSE;
END_IF;

END_PROGRAM
```

This creates an automation that:
- Triggers on motion sensor state changes (max once per second)
- Controls the kitchen light based on motion
- Counts activations persistently using an HA helper

## Installation

1. Install via HACS (this repository)
2. Restart Home Assistant
3. Open the "ST Editor" panel from the sidebar
4. Start writing Structured Text automations!

## Documentation

- [Quick Start Guide](https://github.com/Auda29/ST_HA_Automation/blob/main/docs/quickstart.md)
- [Full Documentation](https://github.com/Auda29/ST_HA_Automation/tree/main/docs)
- [Project Overview](https://github.com/Auda29/ST_HA_Automation/blob/main/docs/00_Project_Overview.md)

## Requirements

- Home Assistant 2024.1.0 or later
- HACS installed (for installation via HACS)

## Support

- **Issues**: [GitHub Issues](https://github.com/Auda29/ST_HA_Automation/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Auda29/ST_HA_Automation/discussions)

## License

MIT License
