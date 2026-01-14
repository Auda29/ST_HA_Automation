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
{trigger: state_change}
{mode: restart}
PROGRAM Kitchen_Light
VAR_INPUT
    motion AT %I0.0 : BOOL := 'binary_sensor.kitchen_motion';
END_VAR

VAR_OUTPUT
    light AT %Q0.0 : BOOL := 'light.kitchen';
END_VAR

VAR
    {persistent}
    timer: TIME;
END_VAR

IF motion THEN
    light := TRUE;
    timer := T#5m;
ELSE
    light := FALSE;
END_IF;

END_PROGRAM
```

This creates an automation that:
- Triggers on motion sensor state changes
- Controls the kitchen light based on motion
- Stores timer value persistently using HA helpers

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
- `{trigger: state_change}` - Trigger on any variable state change
- `{trigger: time}` - Time-based trigger
- `{no_trigger}` - Exclude variable from trigger generation
- `{persistent}` - Persist value across runs (creates input_number/input_boolean)
- `{transient}` - Don't persist value (default)
- `{mode: restart}` - Set automation mode (restart, single, queued, parallel)
- `{throttle: T#1s}` - Rate limiting
- `{debounce: T#500ms}` - Debouncing

### Expressions & Operators
- Arithmetic: `+`, `-`, `*`, `/`, `MOD`
- Comparison: `=`, `<>`, `<`, `<=`, `>`, `>=`
- Logical: `AND`, `OR`, `XOR`, `NOT`
- Function calls with arguments
- Parenthesized expressions
- Member access for structured data types

## Documentation

Detailed documentation is available in the [docs](./docs) folder:

### Archived (Completed Tasks)
- [Repository Setup](./docs/archive/01_Repository_Setup.md) - Initial project structure
- [CodeMirror Integration](./docs/archive/02_CodeMirror_Spike.md) - Editor implementation
- [Parser Implementation](./docs/archive/03_Parser_Spike.md) - Chevrotain parser
- [Dependency Analyzer](./docs/archive/04_Dependency_Analyzer.md) - Automatic trigger generation and entity dependency analysis

### Active Documentation
- [Project Overview](./docs/00_Project_Overview.md) - High-level architecture and design decisions

## Development

### Prerequisites
- Node.js 20+
- npm 10+
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
│   │   │   ├── st-language.ts   # Syntax highlighting
│   │   │   ├── st-theme.ts      # Editor theme
│   │   │   └── st-editor.ts     # Editor component
│   │   ├── parser/              # Chevrotain parser
│   │   │   ├── tokens.ts        # Token definitions
│   │   │   ├── lexer.ts         # Lexer
│   │   │   ├── parser.ts        # Parser rules
│   │   │   ├── visitor.ts       # CST → AST
│   │   │   ├── ast.ts           # AST types
│   │   │   └── index.ts         # Public API
│   │   ├── analyzer/            # ✅ Dependency analyzer
│   │   │   ├── types.ts         # Analysis types
│   │   │   ├── ast-visitor.ts   # AST traversal
│   │   │   ├── trigger-generator.ts  # HA trigger generation
│   │   │   ├── dependency-analyzer.ts  # Main analyzer
│   │   │   └── index.ts         # Public API
│   │   ├── transpiler/          # (TODO) ST → HA YAML
│   │   ├── deploy/              # (TODO) Deployment
│   │   └── panel/               # Main UI panel
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                         # Documentation
└── tests/                        # Integration tests
```

## Architecture

ST for Home Assistant uses a **compile-time transpilation approach**:

```
┌─────────────┐
│   ST Code   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│   Lexer     │────▶│   Tokens     │
└─────────────┘     └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Parser     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │     AST      │
                    └──────┬───────┘
                           │
       ┌───────────────────┴───────────────────┐
       │                                       │
       ▼                                       ▼
┌─────────────────┐                   ┌─────────────────┐
│ Dependency      │                   │ Storage         │
│ Analyzer        │                   │ Analyzer        │
└────────┬────────┘                   └────────┬────────┘
         │                                     │
         └─────────────┬───────────────────────┘
                       │
                       ▼
                ┌──────────────┐
                │  Transpiler  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │  HA YAML     │
                │  (Automation)│
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │Deploy Manager│
                └──────────────┘
```

### Key Components

1. **Lexer/Parser**: Chevrotain-based parser with full IEC 61131-3 ST support
2. **AST**: Strongly-typed Abstract Syntax Tree representing the program structure
3. **Dependency Analyzer**: Extracts entity dependencies and generates triggers
4. **Storage Analyzer**: Determines which variables need persistent helpers
5. **Transpiler**: Converts ST logic to Home Assistant YAML/Jinja2
6. **Deploy Manager**: Handles transactional deployment with rollback support

## Project Status

**Current Version**: 0.1.0 (Alpha)

### Phase 1: Foundation ✅ **COMPLETE**

- ✅ Repository structure and build pipeline
- ✅ HACS-compatible custom component
- ✅ Frontend panel integration
- ✅ CodeMirror 6 editor with ST syntax highlighting
- ✅ TwinCAT-inspired theme with autocomplete
- ✅ Complete Chevrotain parser (23/23 tests passing)
- ✅ Full lexer with token definitions
- ✅ AST type definitions
- ✅ CST to AST visitor transformation

### Phase 2: Analyzer (Next)

- ⏳ Dependency analysis (trigger extraction)
- ⏳ Storage analysis (helper determination)
- ⏳ Type checking
- ⏳ Semantic validation

### Phase 3: Transpiler (Planned)

- ⏳ ST → Jinja2 expression transpilation
- ⏳ Control flow → HA automation actions
- ⏳ Entity I/O binding resolution
- ⏳ Helper entity generation

### Phase 4: Deployment (Planned)

- ⏳ WebSocket API integration
- ⏳ Transactional deployment
- ⏳ Rollback support
- ⏳ Validation and testing

## Test Coverage

**Parser Tests**: 23/23 passing ✅
- Program structure parsing
- Variable declarations (VAR, VAR_INPUT, VAR_OUTPUT, VAR_IN_OUT, VAR_GLOBAL)
- I/O bindings
- Pragmas
- Control flow (IF/ELSIF/ELSE, CASE, FOR, WHILE, REPEAT)
- Expressions (arithmetic, comparison, logical)
- Function calls
- Error reporting

**Build Status**:
- TypeScript compilation: ✅ Passing
- ESLint: ✅ Passing (0 errors, warnings are expected `any` types in Chevrotain visitor)
- Bundle size: 602.79 KB (169.88 KB gzipped)

## Contributing

Contributions are welcome! Please:

1. Read the [Project Overview](./docs/00_Project_Overview.md) to understand design decisions
2. Check archived documentation for implementation details
3. Follow the existing code style (TypeScript + Lit)
4. Add tests for new features
5. Update documentation as needed

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
npm run build:watch  # In one terminal
# Edit code in another terminal

# Test changes
npm run typecheck
npm run lint
npm test

# Commit and push
git add .
git commit -m "feat: description"
git push origin feature/my-feature
```

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

---

**Note**: This project is in active development. The transpiler and analyzer components are not yet implemented. Currently functional: editor with syntax highlighting and complete parser.
