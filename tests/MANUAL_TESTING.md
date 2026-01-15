# ST Editor Manual Testing Checklist

This document provides a comprehensive testing checklist for the st-editor component in Home Assistant.

## Core Editor Functionality

### Basic Editing
- [x] Type code and verify it appears correctly
- [x] Undo (Ctrl+Z)
- [x] Redo (Ctrl+Y)
- [x] Copy/Paste operations
- [ ] Multi-cursor editing (Ctrl+Click)

### Line Features
- [x] Line numbers display correctly
- [x] Active line highlighting (both gutter and editor background)
- [ ] Code folding (Ctrl+Shift+[ to fold, Ctrl+Shift+] to unfold)

---

## Syntax Highlighting

- [x] **Keywords** appear blue/bold: `IF`, `THEN`, `ELSE`, `FOR`, `WHILE`, `PROGRAM`, etc.
- [x] **Data types** appear cyan: `BOOL`, `INT`, `REAL`, `STRING`, `TIME`
- [x] **Functions** appear yellow: `ABS`, `SQRT`, `MAX`, `MIN`, `LEN`
- [x] **Function blocks** appear purple: `TON`, `TOF`, `R_TRIG`, `F_TRIG`, `CTU`
- [x] **Comments** appear green/italic: `// line comment` and `(* block comment *)`
- [x] **Strings** appear orange: `'hello world'`
- [x] **Numbers** appear light green: `42`, `3.14`, `16#FF`, `T#5s`
- [x] **I/O addresses** recognized: `%IX0.0`, `%QW10`, `%MD100`

---

## Autocompletion (Ctrl+Space)

- [x] Keywords autocomplete
- [x] Data types autocomplete
- [x] Built-in functions autocomplete
- [x] Function blocks autocomplete
- [x] **Pragmas** autocomplete: `{trigger}`, `{persistent}`, `{throttle}`, etc.
- [ ] **Templates** work:
  - [x] Type `PROGRAM` and select template - should insert full skeleton
  - [ ] Type `IF` and select template - should insert IF/THEN/END_IF structure
     - Semicolons are added at the end of END_IF which doesnt work
---

## Bracket Features

- [x] **Auto-closing** brackets: type `(` and `)` auto-appears
- [x] **Bracket matching**: cursor on `(` highlights matching `)`
- [x] Works for `()`, `[]`, `{}`, `''`

---

## Search (Ctrl+F)

- [x] Search dialog opens
- [x] Find next (Ctrl+G or F3)
- [x] Find previous (Shift+Ctrl+G)
- [x] Occurrences highlight in editor

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
