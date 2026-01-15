# ST for Home Assistant

**Current Version: 0.1.6.4**

## Recent Changes

### 0.1.6.4
- Fixed bug in `IF` statement autocomplete template that added an incorrect semicolon.

### 0.1.6.3
- Made selection highlighting semi-transparent so text remains visible

### 0.1.6.2
- Improved selection highlighting CSS with multiple fallback selectors

### 0.1.6.1
- Fixed selection highlighting visibility in editor

### 0.1.6
- Fixed keyboard input issue where Home Assistant shortcuts (a, m, etc.) intercepted keystrokes in the editor

### 0.1.5
- Fixed CodeMirror initialization with async/await
- Used direct shadowRoot query instead of @query decorator

### 0.1.2
- Included frontend files in git for HACS distribution

## Features

- Structured Text (IEC 61131-3) code editor
- Syntax highlighting for ST keywords, types, functions
- Autocompletion with templates
- TwinCAT-inspired dark theme
- Live value display in online mode
