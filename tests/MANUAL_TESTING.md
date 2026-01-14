# ST Editor Manual Testing Checklist

This document provides a comprehensive testing checklist for the st-editor component in Home Assistant.

## Core Editor Functionality

### Basic Editing
- [x] Type code and verify it appears correctly
- [x] Undo (Ctrl+Z)
- [x] Redo (Ctrl+Y)
- [x] Copy/Paste operations  - Works partially the copy/paste works but the highlighting of the marked code doesnt work
- [ ] Multi-cursor editing (Ctrl+Click)

### Line Features
- [ ] Line numbers display correctly
- [ ] Active line highlighting (both gutter and editor background)
- [ ] Code folding (Ctrl+Shift+[ to fold, Ctrl+Shift+] to unfold)

---

## Syntax Highlighting

- [ ] **Keywords** appear blue/bold: `IF`, `THEN`, `ELSE`, `FOR`, `WHILE`, `PROGRAM`, etc.
- [ ] **Data types** appear cyan: `BOOL`, `INT`, `REAL`, `STRING`, `TIME`
- [ ] **Functions** appear yellow: `ABS`, `SQRT`, `MAX`, `MIN`, `LEN`
- [ ] **Function blocks** appear purple: `TON`, `TOF`, `R_TRIG`, `F_TRIG`, `CTU`
- [ ] **Comments** appear green/italic: `// line comment` and `(* block comment *)`
- [ ] **Strings** appear orange: `'hello world'`
- [ ] **Numbers** appear light green: `42`, `3.14`, `16#FF`, `T#5s`
- [ ] **I/O addresses** recognized: `%IX0.0`, `%QW10`, `%MD100`

---

## Autocompletion (Ctrl+Space)

- [ ] Keywords autocomplete
- [ ] Data types autocomplete
- [ ] Built-in functions autocomplete
- [ ] Function blocks autocomplete
- [ ] **Pragmas** autocomplete: `{trigger}`, `{persistent}`, `{throttle}`, etc.
- [ ] **Templates** work:
  - [ ] Type `PROGRAM` and select template - should insert full skeleton
  - [ ] Type `IF` and select template - should insert IF/THEN/END_IF structure

---

## Bracket Features

- [ ] **Auto-closing** brackets: type `(` and `)` auto-appears
- [ ] **Bracket matching**: cursor on `(` highlights matching `)`
- [ ] Works for `()`, `[]`, `{}`, `''`

---

## Search (Ctrl+F)

- [ ] Search dialog opens
- [ ] Find next (Ctrl+G or F3)
- [ ] Find previous (Shift+Ctrl+G)
- [ ] Occurrences highlight in editor

---

## Read-Only Mode

- [ ] Editor becomes non-editable when `read-only` is set
- [ ] Can still scroll and select text

---

## Online Mode (Live Value Display)

- [ ] `startOnlineMode()` displays live values next to variables
- [ ] BOOL values show TRUE/FALSE with color coding
- [ ] Numeric values format correctly (INT as integer, REAL with decimals)
- [ ] Values highlight/flash when they change
- [ ] `stopOnlineMode()` removes decorations
- [ ] Pause/resume works with `setOnlinePaused()`

---

## Events & Integration

- [ ] `code-change` event fires when you modify code
- [ ] `getCode()` returns current content
- [ ] `setCode()` updates editor content
- [ ] `focus()` brings cursor to editor

---

## Edge Cases

- [ ] Large files (100+ lines) perform well
- [ ] Special characters display correctly
- [ ] Time literals parse: `T#10h30m`, `TIME#5s`
- [ ] Hex/binary literals: `16#FF`, `2#1010`

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| Ctrl+Space | Autocompletion |
| Ctrl+F | Search |
| Ctrl+G / F3 | Find next |
| Shift+Ctrl+G | Find previous |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+Shift+[ | Fold code |
| Ctrl+Shift+] | Unfold code |
| Tab | Indent |
| Shift+Tab | Unindent |
| Ctrl+/ | Toggle comment |

---

## Test Results Log

| Date | Tester | Version | Issues Found |
|------|--------|---------|--------------|
| | | | |
