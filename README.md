# ST for Home Assistant

A HACS integration that enables programming Home Assistant automations in **Structured Text (IEC 61131-3)** - the language used in industrial PLCs like TwinCAT and Siemens controllers.

## Overview

**ST for Home Assistant** transpiles Structured Text code into native Home Assistant automations, bringing industrial control logic patterns to home automation without any runtime overhead.

### Key Features

- **Industrial PLC Language**: Write automations using Structured Text (IEC 61131-3)
- **Native HA Automations**: Code is transpiled to standard HA automations (no interpreter)
- **Event-Driven**: Automatic trigger generation from entity dependencies
- **State Persistence**: Smart helper management for stateful variables
- **Built-in Safety**: Loop guards and defensive Jinja generation
- **Timer Support**: TON, TOF, TP function blocks using HA timer entities
- **Live Editor**: CodeMirror-based editor with syntax highlighting

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Integrations"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL and select "Integration" as the category
6. Click "Install" on the ST for Home Assistant card
7. Restart Home Assistant

### Manual Installation

1. Download the latest release from the releases page
2. Copy the `custom_components/st_hass` folder to your Home Assistant `custom_components` directory
3. Restart Home Assistant

## Quick Start

After installation, a new "ST Editor" panel will appear in your Home Assistant sidebar.

### Example Program

```iecst
{mode: restart}
{throttle: T#1s}
PROGRAM Kitchen_Light
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';
    light AT %Q* : BOOL := 'light.kitchen';
END_VAR

IF motion THEN
    light := TRUE;
ELSE
    light := FALSE;
END_IF;

END_PROGRAM
```

This creates an automation that:
- Triggers on motion sensor state changes
- Throttles execution to max once per second
- Controls the kitchen light based on motion

## Supported Language Features

### Data Types
- `BOOL` - Boolean values (mapped to entity on/off states)
- `INT`, `DINT` - Integer values
- `REAL`, `LREAL` - Floating point values
- `STRING` - Text values
- `TIME` - Time durations (T#5s, T#1h30m)

### Control Structures
- `IF/ELSIF/ELSE/END_IF` - Conditional branching
- `CASE...OF/END_CASE` - Multi-way branching
- `FOR...TO...DO/END_FOR` - Counted loops
- `WHILE...DO/END_WHILE` - Conditional loops
- `REPEAT...UNTIL/END_REPEAT` - Post-test loops

### Function Blocks
- `R_TRIG`, `F_TRIG` - Edge detection
- `SR`, `RS` - Set/Reset flip-flops
- `TON`, `TOF`, `TP` - Timers

### Built-in Functions
- Arithmetic: `ABS`, `SQRT`, `MIN`, `MAX`, `LIMIT`
- Logic: `SEL`, `MUX`
- Conversion: `TO_INT`, `TO_REAL`, `TO_STRING`, `TO_BOOL`
- Math: `TRUNC`, `ROUND`, `CEIL`, `FLOOR`

### Pragmas (ST-HA Extensions)
- `{trigger}` - Mark variable as automation trigger
- `{no_trigger}` - Exclude from auto-trigger generation
- `{persistent}` - Persist value across runs (creates helper)
- `{mode: restart}` - Set script execution mode
- `{throttle: T#1s}` - Rate limiting
- `{debounce: T#500ms}` - Debouncing

## Documentation

See the [docs](./docs) folder for detailed documentation:
- [Project Overview](./docs/00_Project_Overview.md)
- [Repository Setup](./docs/01_Repository_Setup.md)
- [CodeMirror Integration](./docs/02_CodeMirror_Spike.md)
- [Parser Implementation](./docs/03_Parser_Spike.md)

## Development

### Prerequisites
- Node.js 20+
- Python 3.11+
- Home Assistant development environment (optional)

### Setup

```bash
# Clone repository
git clone https://github.com/Auda29/ST_HA_Automation.git
cd ST_HA_Automation

# Install frontend dependencies
cd frontend
npm install

# Build frontend
npm run build

# Watch mode for development
npm run build:watch
```

### Testing

```bash
cd frontend
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
npm run test       # Run tests
```

## Architecture

ST for Home Assistant uses a **transpilation approach**:

```
ST Code → Parser → AST → Analyzer → Transpiler → HA YAML
```

Key components:
- **Dependency Analyzer**: Extracts triggers from entity reads
- **Storage Analyzer**: Determines which variables need helpers
- **Jinja Generator**: Creates defensive, null-safe templates
- **Deploy Manager**: Transactional deployment with rollback

## Project Status

**Current Version**: 0.1.0 (Alpha)

This project is in early development. Phase 1 (Foundation) is complete:
- ✅ Repository structure
- ✅ Basic editor with syntax highlighting
- ✅ Core parser implementation
- ✅ Simple transpilation (IF/ELSE → choose)

## Contributing

Contributions are welcome! Please read the documentation in the `docs` folder to understand the architecture and design decisions.

## License

MIT License - See [LICENSE](LICENSE) file for details

## Credits

Inspired by industrial PLC programming and the [CAFE](https://github.com/FezVrasta/cafe-hass) project.

## Support

- **Issues**: [GitHub Issues](https://github.com/Auda29/ST_HA_Automation/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Auda29/ST_HA_Automation/discussions)
