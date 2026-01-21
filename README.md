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
- **Live Editor**: CodeMirror 6-based editor with syntax highlighting and autocomplete
- **Complete Parser**: Full Chevrotain-based parser supporting all IEC 61131-3 ST features
- **Online Mode**: Real-time entity value display in the editor
- **Transactional Deploy**: Atomic deployment with backup and rollback support

## Project Status

**Current Version**: 1.8.1  
**Status**: Stable, Ready for Production Use

### Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| Parser | 25 | ✅ Passing |
| Dependency Analyzer | 16 | ✅ Passing |
| Storage Analyzer | 23 | ✅ Passing |
| Transpiler | 24 | ✅ Passing |
| Deploy/Helper Manager | 5 | ✅ Passing |
| Restore/Migration | 20 | ✅ Passing |
| Online Mode | 10 | ✅ Passing |
| Error Mapping | 10 | ✅ Passing |
| Source Maps | 11 | ✅ Passing |
| **Total** | **194** | **✅ 100% Passing** |

### Build Status

- **TypeScript**: ✅ Passing (strict mode)
- **ESLint**: ✅ Passing (0 errors)
- **Bundle Size**: 214 KB (gzipped, initial load) with code splitting

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Integrations"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/Auda29/ST_HA_Automation`
6. Select "Integration" as the category
7. Click "Install" on the ST for Home Assistant card
8. Restart Home Assistant

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/Auda29/ST_HA_Automation/releases)
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

## Supported Language Features

### Data Types
- `BOOL` - Boolean values (mapped to entity on/off states)
- `INT`, `DINT`, `LINT`, `SINT` - Integer values with various bit widths
- `REAL`, `LREAL` - Floating point values
- `STRING`, `WSTRING` - Text values
- `TIME`, `DATE`, `TIME_OF_DAY`, `DATE_AND_TIME` - Time-related types

### Control Structures
- `IF/ELSIF/ELSE/END_IF` - Conditional branching
- `CASE...OF/END_CASE` - Multi-way branching with ranges
- `FOR...TO...BY...DO/END_FOR` - Counted loops
- `WHILE...DO/END_WHILE` - Pre-condition loops
- `REPEAT...UNTIL/END_REPEAT` - Post-condition loops
- `EXIT`, `RETURN` - Loop/function control

### Variable Sections
- `VAR` - Local variables
- `VAR_INPUT` - Input variables (entity reads)
- `VAR_OUTPUT` - Output variables (entity writes)
- `VAR_IN_OUT` - Bidirectional variables
- `VAR_GLOBAL` - Global variables (shared across programs)

### I/O Bindings
- `AT %I*` - Input entity binding (sensors, binary sensors)
- `AT %Q*` - Output entity binding (lights, switches, services)
- `AT %M*` - Memory/helper binding

### Pragmas (ST-HA Extensions)
| Pragma | Description |
|--------|-------------|
| `{trigger}` | Entity change triggers automation |
| `{no_trigger}` | Entity is read but doesn't trigger |
| `{persistent}` | Value stored in HA helper |
| `{transient}` | Value only during run (default) |
| `{reset_on_restart}` | Always use initial value after HA restart |
| `{require_restore}` | Error if no stored value exists |
| `{mode: restart\|single\|queued\|parallel}` | Script execution mode |
| `{throttle: T#duration}` | Rate limiting |
| `{debounce: T#duration}` | Debouncing |

### Function Blocks
- `R_TRIG` - Rising edge detection
- `F_TRIG` - Falling edge detection
- `SR` / `RS` - Set-Reset flip-flops
- `TON` - On-delay timer
- `TOF` - Off-delay timer
- `TP` - Pulse timer

### Built-in Functions
- **Selection**: `SEL`, `MUX`
- **Limits**: `LIMIT`, `MIN`, `MAX`
- **Math**: `ABS`, `SQRT`, `TRUNC`, `ROUND`
- **Conversion**: `TO_INT`, `TO_DINT`, `TO_REAL`, `TO_LREAL`, `TO_STRING`, `TO_BOOL`

### Expressions & Operators
- Arithmetic: `+`, `-`, `*`, `/`, `MOD`
- Comparison: `=`, `<>`, `<`, `<=`, `>`, `>=`
- Logical: `AND`, `OR`, `XOR`, `NOT`

## Documentation

Detailed documentation is available in the [docs](./docs) folder:

### Core Documentation
- [Project Overview](./docs/00_Project_Overview.md) - Architecture, design decisions, MUST-DO's and MUST-NOT-DO's
- [Product Requirements Document](./docs/PRD_ST_HomeAssistant.md) - Comprehensive specifications and implementation details

### Development Documentation
- [Agents Documentation](./docs/agents/agents.md) - Agent-based development workflow
- [Agent Tasks](./docs/agents/tasks.md) - Task list and status tracking

### Archived Documentation (Completed Tasks)
- [Repository Setup](./docs/archive/01_Repository_Setup.md) - Initial project structure
- [CodeMirror Integration](./docs/archive/02_CodeMirror_Spike.md) - Editor implementation
- [Parser Implementation](./docs/archive/03_Parser_Spike.md) - Chevrotain parser
- [Dependency Analyzer](./docs/archive/04_Dependency_Analyzer.md) - Trigger generation
- [Storage Analyzer](./docs/archive/05_Storage_Analyzer.md) - Persistence detection
- And more in the [archive folder](./docs/archive/)

## Architecture

ST for Home Assistant uses a **compile-time transpilation approach**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ST for Home Assistant Pipeline                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ST Code Editor        Parser          Analyzers      Transpiler       │
│  (CodeMirror 6)       (Chevrotain)    (Dependency)   (AST → YAML)     │
│                                       (Storage)                        │
│       ↓                  ↓               ↓              ↓              │
│    Editor UI         AST Nodes       Analysis       HA Automation     │
│                                      Results       + Script Config    │
│                                                     + Helpers         │
│                        ↓────────────────────────────────┘             │
│                                                         ↓             │
│                                     Deploy Manager                    │
│                                     (Backup/Restore/Rollback)        │
│                                            ↓                          │
│                                    Home Assistant                     │
│                                    (WebSocket API)                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **Lexer/Parser** | Chevrotain-based parser with full IEC 61131-3 ST support |
| **Dependency Analyzer** | Extracts entity dependencies and generates triggers |
| **Storage Analyzer** | Determines which variables need persistent helpers |
| **Transpiler** | Converts ST logic to Home Assistant YAML/Jinja2 |
| **Timer Transpiler** | Handles TON/TOF/TP using HA timer entities |
| **Deploy Manager** | Transactional deployment with backup and rollback |
| **Helper Manager** | Synchronizes helpers with code requirements |
| **Source Mapper** | Maps YAML paths back to ST source lines |
| **Error Mapper** | Translates HA errors to ST context |
| **Online Mode** | Real-time entity state display in editor |

## Development

### Prerequisites
- Node.js 20+
- npm 10+
- Python 3.12+
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

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix  # Auto-fix issues

# Unit tests
npm test          # Watch mode
npm run test:run  # Single run
```

### Project Structure

```
ST_HA_Automation/
├── custom_components/st_hass/    # Python backend
│   ├── __init__.py               # Integration setup
│   ├── config_flow.py            # Configuration UI
│   ├── const.py                  # Constants
│   └── frontend/                 # Built frontend files
├── frontend/                     # TypeScript frontend
│   ├── src/
│   │   ├── editor/              # CodeMirror editor
│   │   ├── parser/              # Chevrotain parser
│   │   ├── analyzer/            # Dependency & storage analysis
│   │   ├── transpiler/          # ST → HA YAML conversion
│   │   ├── deploy/              # Deployment & helper management
│   │   ├── online/              # Live value updates
│   │   ├── restore/             # Migration & restore
│   │   ├── error-mapping/       # Error translation
│   │   ├── sourcemap/           # Source map generation
│   │   └── panel/               # Main UI panel
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                         # Documentation
└── tests/                        # Integration tests
```

## Contributing

Contributions are welcome! Please:

1. Read the [Project Overview](./docs/00_Project_Overview.md) to understand design decisions
2. Review the [PRD](./docs/PRD_ST_HomeAssistant.md) for detailed specifications
3. Check archived documentation for implementation details
4. Follow the existing code style (TypeScript + Lit)
5. Add tests for new features
6. Update documentation as needed

### Language Policy

The **codebase, tests, UI strings, and README** are maintained in English. See `docs/language_policy.md` for details.

### Development Workflow

This project uses an **agent-based development workflow** with specialized roles:

- **Taskmaster**: Plans tasks, assigns work, monitors progress
- **Dev1 (Core)**: Implements core business logic
- **Dev2 (Integration)**: Builds APIs, UI, integrations
- **Testing**: Writes and executes tests
- **Review**: Reviews code quality
- **DevOps**: Handles merges and deployment

See [Agents Documentation](./docs/agents/agents.md) for details.

## Critical Design Decisions

The project follows strict guidelines documented in [00_Project_Overview.md](./docs/00_Project_Overview.md):

### MUST-DO's
1. Cycle → Event transformation via dependency analysis
2. State persistence with tiered storage strategy
3. Defensive Jinja generation for null-safety
4. Loop safety guards with iteration limits
5. Script mode: restart as default
6. Transactional deploy with rollback
7. Source maps for debugging
8. Timer as entity + event pattern
9. Deploy via HA APIs only (no file manipulation)
10. Throttle helper initialization with fallback

### MUST-NOT-DO's
1. No polling/cycle-time patterns
2. No helper explosion
3. No mode: single for logic scripts
4. No naive Jinja without null checks
5. No infinite loops without safety
6. No hardcoded entity IDs
7. No deploy without backup
8. No direct HA API without abstraction
9. No direct YAML file manipulation
10. No unchecked throttle templates

## License

MIT License - See [LICENSE](LICENSE) file for details

## Credits

- Inspired by industrial PLC programming (TwinCAT, Siemens, etc.)
- Parser built with [Chevrotain](https://chevrotain.io/)
- Editor powered by [CodeMirror 6](https://codemirror.net/)
- UI components using [Lit](https://lit.dev/)

## Related Projects

- [CAFE](https://github.com/FezVrasta/cafe-hass) - Python-based ST integration (archived)
- [PLCopen](https://www.plcopen.org/) - IEC 61131-3 standards organization

## Support

- **Issues**: [GitHub Issues](https://github.com/Auda29/ST_HA_Automation/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Auda29/ST_HA_Automation/discussions)
- **Documentation**: [docs folder](./docs)
