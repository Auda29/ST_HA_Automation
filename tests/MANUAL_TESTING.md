# ST Editor Manual Testing Checklist

This document provides a comprehensive testing checklist for the st-editor component in Home Assistant.

## Core Editor Functionality

### Basic Editing
- [x] Type code and verify it appears correctly
- [x] Undo (Ctrl+Z)
- [x] Redo (Ctrl+Y)
- [x] Copy/Paste operations
- [x] Multi-cursor editing (Ctrl+Click) - **WORKS** (tested 2025-01-21)

### Line Features
- [x] Line numbers display correctly
- [x] Active line highlighting (both gutter and editor background)
- [ ] Code folding (Ctrl+Shift+[ to fold, Ctrl+Shift+] to unfold) - **NOT WORKING** (tested 2025-01-21)

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
- [x] **Templates** work:
  - [x] Type `PROGRAM` and select template - should insert full skeleton
  - [x] Type `IF` and select template - inserts IF/THEN/END_IF structure - **WORKS** (tested 2025-01-21)
     - Note: Template inserts `IF ${cond} THEN` with placeholder

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

- [x] Editor becomes non-editable when `readOnly` property is set to true - **WORKS** (tested 2025-01-21)
- [x] Can still scroll and select text

---

## Online Mode (Live Value Display)

- [ ] `startOnlineMode()` displays live values next to variables
- [ ] BOOL values show TRUE/FALSE with color coding
- [ ] Numeric values format correctly (INT as integer, REAL with decimals)
- [ ] Values highlight/flash when they change
- [ ] `stopOnlineMode()` removes decorations
- [ ] Pause/resume works with `setOnlinePaused()`

**Note:** Online mode testing deferred - requires working WebSocket connection to Home Assistant.

---

## Events & Integration

- [x] `code-change` event fires when you modify code - **WORKS** (tested 2025-01-21)
- [x] `getCode()` returns current content - **WORKS** (tested 2025-01-21)
- [x] `setCode()` updates editor content - **WORKS** (tested 2025-01-21)
- [x] `focus()` brings cursor to editor - **WORKS** (tested 2025-01-21)

---

## Edge Cases

- [x] Large files (100+ lines) perform well
- [x] Special characters display correctly (German umlauts: äöü ÄÖÜ ß, symbols: €@#$%^&*()) - **WORKS** (tested 2025-01-21)
- [x] Time literals parse: `T#10h30m`, `T#5s`, `T#500ms` - **WORKS** (tested 2025-01-21)
- [x] Hex/binary literals: `16#FF`, `2#10101010` - **WORKS** (tested 2025-01-21)

---

## Keyboard Shortcuts Reference

| Shortcut | Action | Status |
|----------|--------|--------|
| Ctrl+Space | Autocompletion | WORKS |
| Ctrl+F | Search | WORKS |
| Ctrl+G / F3 | Find next | WORKS |
| Shift+Ctrl+G | Find previous | WORKS |
| Ctrl+Z | Undo | WORKS |
| Ctrl+Y | Redo | WORKS |
| Ctrl+Shift+[ | Fold code | NOT WORKING |
| Ctrl+Shift+] | Unfold code | NOT WORKING |
| Tab | Indent | **WORKS** (tested 2025-01-21) |
| Shift+Tab | Unindent | **WORKS** (tested 2025-01-21) |
| Ctrl+/ | Toggle comment | **WORKS** (tested 2025-01-21) |

---

## Deploy Functionality

- [ ] Deploy button creates Home Assistant automation
- [ ] Backup is created before deployment
- [ ] Helper entities are created correctly
- [ ] Error messages display properly

**Note:** Deploy testing deferred - WebSocket API integration needs fixes (sendMessagePromise vs callWS issue partially fixed, but automation creation API format still has issues).

---

## Test Results Log

| Date | Tester | Version | Issues Found |
|------|--------|---------|--------------|
| 2025-01-21 | Claude | dev | Code folding not working (Ctrl+Shift+[/]) |
| 2025-01-21 | Claude | dev | Deploy fails - automation creation API format issue |

---

## Known Issues

1. **Code Folding**: Ctrl+Shift+[ and Ctrl+Shift+] do not fold/unfold code blocks. May need to verify if folding extension is properly configured in CodeMirror setup.

2. **Deploy Functionality**: WebSocket API calls updated from `callWS` to `sendMessagePromise`, but automation creation still fails with `[object Object]` error. The API message format for `config/automation/config/{id}` may need adjustment.
