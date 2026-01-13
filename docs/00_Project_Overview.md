# ST for Home Assistant - Projekt-Übersicht

## Projektbeschreibung

**ST for Home Assistant** ist eine HACS-Integration, die es ermöglicht, Home Assistant Automationen in **Structured Text (IEC 61131-3)** zu programmieren - der Sprache, die in industriellen SPSen (TwinCAT, Siemens, etc.) verwendet wird.

**Kernidee:** ST-Code wird zu nativen HA-Automationen **transpiliert** (nicht interpretiert), sodass kein Runtime-Overhead entsteht.

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`

---

## Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ST for Home Assistant                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌───────────┐  │
│   │ ST Code     │───▶│ Parser       │───▶│ AST         │───▶│ Analyzer  │  │
│   │ (Editor)    │    │ (Chevrotain) │    │             │    │           │  │
│   └─────────────┘    └──────────────┘    └─────────────┘    └─────┬─────┘  │
│                                                                    │        │
│                                                                    ▼        │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌───────────┐  │
│   │ HA Runtime  │◀───│ YAML Output  │◀───│ Transpiler  │◀───│ Triggers  │  │
│   │ (Automation)│    │              │    │             │    │ + Helpers │  │
│   └─────────────┘    └──────────────┘    └─────────────┘    └───────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Komponente | Technologie | Version | Status |
|------------|-------------|---------|--------|
| Editor | CodeMirror 6 | ^6.0 | ✅ Entschieden |
| Parser | **Chevrotain ODER Nearley.js** | ^11.0 / ^2.20 | ⚠️ **OFFEN** |
<!-- UPDATE 2025-01-13: Entscheidung für Chevrotain gefallen, vollständig implementiert mit 23/23 Tests -->
| Frontend | TypeScript + Lit | 5.x / 3.x | ✅ Entschieden |
| Build | Vite | ^5.0 | ✅ Entschieden |
| Backend | Python (HA Custom Component) | 3.11+ | ✅ Entschieden |
| HA Integration | HACS | - | ✅ Entschieden |

### ⚠️ Offene Entscheidung: Parser

| Kriterium | Chevrotain | Nearley.js |
|-----------|------------|------------|
| **Ansatz** | Handgeschriebene Parser-Klasse | Deklarative Grammatik (BNF) |
| **Performance** | Sehr schnell | Gut |
| **Error Recovery** | Eingebaut | Manuell |
| **Lernkurve** | Mittel | Steil (Grammatik-Syntax) |
| **Debugging** | Gute Stack Traces | Schwieriger |
| **Bundle Size** | ~100KB | ~50KB |

**Empfehlung:** Chevrotain für bessere Error-Recovery und Debugging.  
**Entscheidung:** Beim Parser-Spike evaluieren, dann festlegen.

<!-- UPDATE 2025-01-13: 
✅ Entscheidung: Chevrotain gewählt und vollständig implementiert
✅ Parser unterstützt vollständiges IEC 61131-3 ST (weit über ursprünglichen Scope hinaus)
✅ 23/23 Unit Tests bestanden
✅ Unterstützt: PROGRAM, VAR/VAR_INPUT/VAR_OUTPUT/VAR_IN_OUT/VAR_GLOBAL, 
   IF/ELSIF/ELSE, CASE, FOR, WHILE, REPEAT, alle Operatoren, Function Calls,
   I/O Bindings (AT %), Pragmas, komplexe Expressions
-->

---

## Kern-Features

### Sprachfeatures
- **Datentypen:** BOOL, INT, DINT, REAL, LREAL, STRING, TIME
- **Kontrollstrukturen:** IF/ELSIF/ELSE, CASE, FOR, WHILE, REPEAT
- **Operatoren:** Arithmetik, Vergleich, Logik (AND, OR, XOR, NOT)
- **Built-in Funktionen:** SEL, MUX, LIMIT, MIN, MAX, ABS, SQRT, etc.
- **Function Blocks:** R_TRIG, F_TRIG, TON, TOF, TP, SR, RS

### Entity-Binding
```iecst
VAR
    motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';  // Input
    light AT %Q* : BOOL := 'light.kitchen';                  // Output
END_VAR
```

### Pragmas (ST-HASS Erweiterungen)
```iecst
{mode: restart}           // Script-Ausführungsmodus
{throttle: T#1s}          // Rate-Limiting
{debounce: T#500ms}       // Debounce
{trigger}                 // Diese Variable triggert Automation
{no_trigger}              // Variable triggert nicht
{persistent}              // Wert überdauert Runs (→ Helper)
{transient}               // Nur während Run gültig
{reset_on_restart}        // Immer Initialwert nach HA-Restart
{require_restore}         // Fehler wenn kein gespeicherter Wert
```

---

## ⚠️ MUST-DO's (Kritisch!)

### 1. Zyklus → Event Transformation
```
ST denkt:        "Ich prüfe kontinuierlich"
HA denkt:        "Ich schlafe bis ein Event kommt"
```

**MUST:** Dependency Analysis implementieren
- Alle gelesenen Entity-Variablen automatisch als Trigger registrieren
- `{trigger}` / `{no_trigger}` Pragmas respektieren
- Warnung wenn keine Trigger erkannt → Programm läuft nie

```typescript
// RICHTIG
trigger:
  - platform: state
    entity_id: binary_sensor.motion  // Auto-generiert aus AT %I*
```

### 2. State-Persistenz mit Helpers
```
ST:    Variablen behalten Wert zwischen Zyklen
HA:    Variablen leben nur Millisekunden
```

**MUST:** Tiered Storage Strategy
- `DERIVED` → Entity-gebundene Variablen (kein Helper)
- `PERSISTENT` → Self-Reference, FB-Instanzen, Timer (→ input_* Helper)
- `TRANSIENT` → Alles andere (HA variables:)

**MUST:** Namespace-Konvention
```
input_number.st_<projekt>_<programm>_<variable>
```

**MUST:** Cleanup-Mechanismus für nicht mehr benötigte Helper

### 3. Defensive Jinja-Generierung
```
Sensor kann sein: "unavailable", "unknown", "none", ""
→ Jinja-Fehler oder falsches Ergebnis
```

**MUST:** Null-Safe Templates generieren
```jinja
{{ states('sensor.temp') | float(default=0.0) 
   if states('sensor.temp') not in ['unavailable', 'unknown', 'none', ''] 
   else 0.0 }}
```

### 4. Loop Safety Guards
```
WHILE ohne Exit → HA eingefroren
```

**MUST:** Automatische Iteration-Limits
```yaml
repeat:
  while:
    - "{{ original_condition }}"
    - "{{ _safety_counter < 1000 }}"  # AUTO-EINGEFÜGT
```

**MUST:** Compiler-Warnung bei WHILE ohne garantiertem Exit

### 5. Script Mode: restart (Default)
```
mode: single   → Input Loss (schlecht!)
mode: restart  → Neuer Wert wichtiger (SPS-like, gut!)
```

**MUST:** Default `mode: restart` für alle generierten Scripts

### 6. Transactional Deploy
```
Deploy halb durch + Fehler → Inkonsistenter Zustand
```

**MUST:** 
- Backup vor Deploy
- Rollback bei Fehler
- Alle Änderungen oder keine

### 7. Source Maps für Debugging
```
HA-Fehler zeigt: "Error in automation.yaml line 47"
User denkt:      "Welche ST-Zeile ist das?"
```

**MUST:** Source Maps in generiertem YAML
```yaml
variables:
  _st_source_map:
    "action.0.choose.0": { st_line: 7, st_file: "kitchen.st" }
```

### 8. Timer als Entity + Event
```
HA delay ist NICHT unterbrechbar
ST Timer (TON) sind rücksetzbar
```

**MUST:** Timer-FBs mit `timer.*` Entity + `timer.finished` Event implementieren

### 9. Deploy über HA-Services (NICHT Datei-Manipulation!)
```
FALSCH:  Direkt automations.yaml editieren
RICHTIG: HA-Services nutzen
```

**MUST:** Deployment ausschließlich über HA-APIs
- `automation.reload` nach Änderungen
- `input_number.set_value` für Helper
- WebSocket API für Entity-Erstellung

**WARUM:** 
- Datei-Manipulation ist fragil (Formatierung, Kommentare, Merges)
- HA kann Änderungen nicht tracken
- Kein Rollback möglich bei direkter Datei-Änderung
- User-Editierungen werden überschrieben

```typescript
// RICHTIG - Über HA Storage API
await hass.callWS({
  type: 'config/automation/config',
  automation_id: 'st_kitchen',
  config: generatedAutomation
});
```

### 10. Throttle-Helper Initialisierung
```
Erster Run: input_datetime ist leer/unavailable
→ Template crasht oder gibt falsches Ergebnis
```

**MUST:** Robuste Throttle-Condition mit Fallback
```jinja
{# FALSCH - crasht bei leerem Helper #}
{{ (now() - states('input_datetime.st_last_run') | as_datetime).total_seconds() > 1 }}

{# RICHTIG - mit Fallback für ersten Run #}
{% set last = states('input_datetime.st_last_run') %}
{% if last in ['unknown', 'unavailable', ''] %}
  true
{% else %}
  {{ (now() - (last | as_datetime)).total_seconds() > 1 }}
{% endif %}
```

**MUST:** Helper bei Deploy initialisieren wenn nicht existent

---

## 🚫 MUST-NOT-DO's (Vermeiden!)

### 1. KEIN Polling / Cycle-Time Pattern
```python
# FALSCH - Anti-Pattern in HA!
while True:
    check_conditions()
    sleep(0.1)  # 100ms cycle time
```

**WARUM:** Blockiert HA, Performance-Killer, unnötiger CPU-Verbrauch

**STATTDESSEN:** Event-basierte Trigger aus Dependency Analysis

### 2. KEINE Helper-Explosion
```yaml
# FALSCH - Jede Variable als Helper
input_number.st_temp_var_1
input_number.st_temp_var_2
input_number.st_loop_counter
# ... 50+ Helper für ein Programm
```

**WARUM:** Müllt HA-Instanz voll, schwer zu warten

**STATTDESSEN:** Nur PERSISTENT Variablen als Helper, Rest in `variables:`

### 3. KEINE mode: single für Logic-Scripts
```yaml
# FALSCH
script:
  st_kitchen_logic:
    mode: single  # ← Trigger werden ignoriert während Lauf!
```

**WARUM:** Input Loss, nicht SPS-like

**STATTDESSEN:** `mode: restart` (oder `queued` für spezielle Fälle)

### 4. KEIN naives Jinja ohne Null-Checks
```jinja
# FALSCH
{{ states('sensor.temp') * 2 }}  # Crasht bei "unavailable"
```

**WARUM:** Jinja-Fehler, falsches Ergebnis (z.B. "unavailable" * 2)

**STATTDESSEN:** Immer defensive Templates mit `| float(default=0.0)`

### 5. KEINE Endlos-Loops ohne Safety
```iecst
// FALSCH - Kann HA einfrieren
WHILE NOT sensor DO
    // warte...
END_WHILE;
```

**WARUM:** Blockiert Automation-Thread

**STATTDESSEN:** Automatischer Safety-Counter, max 1000 Iterationen

### 6. KEINE hartcodierten Entity-IDs im Transpiler
```typescript
// FALSCH
const trigger = { entity_id: "binary_sensor.motion" };
```

**WARUM:** Nicht portabel, schwer zu testen

**STATTDESSEN:** Aus AST EntityBinding extrahieren

### 7. KEIN Deploy ohne Backup
```python
# FALSCH
async def deploy():
    await delete_old_helpers()
    await create_new_helpers()  # ← Fehler hier = Datenverlust!
```

**WARUM:** Inkonsistenter Zustand, Datenverlust

**STATTDESSEN:** Backup → Änderungen → Verify → Commit (oder Rollback)

### 8. KEINE direkte HA-API Manipulation ohne Abstraktion
```typescript
// FALSCH
await hass.callService('input_number', 'set_value', {...});
```

**WARUM:** Schwer zu testen, API-Änderungen brechen Code

**STATTDESSEN:** Helper-Manager Abstraction Layer

### 9. KEINE direkte YAML-Datei-Manipulation
```python
# FALSCH - Niemals!
with open('/config/automations.yaml', 'w') as f:
    yaml.dump(automation, f)
```

**WARUM:** 
- Überschreibt User-Kommentare und Formatierung
- HA trackt Änderungen nicht
- Kein Rollback bei Fehler
- Race Conditions mit HA-Core
- Sicherheitsrisiko

**STATTDESSEN:** HA Storage API / WebSocket Services

### 10. KEINE ungeprüften Throttle-Templates
```jinja
# FALSCH - crasht bei erstem Run
{{ (now() - states('input_datetime.x') | as_datetime).total_seconds() }}
```

**WARUM:** `input_datetime` kann `unknown`/`unavailable` sein

**STATTDESSEN:** Immer Fallback für leeren/neuen Helper

---

## Phasenplan

### Phase 1: Foundation
<!-- STATUS 2025-01-13: 3 von 5 Tasks abgeschlossen -->
- ✅ Repository-Setup (HACS-Struktur) <!-- COMPLETE: manifest.json, __init__.py, config_flow.py, translations -->
- ✅ CodeMirror 6 mit ST Syntax-Highlighting <!-- COMPLETE: st-language.ts, st-theme.ts, st-editor.ts, TwinCAT-inspired theme -->
- ✅ Chevrotain Parser (PROGRAM, VAR, IF/ELSE, Assignments) <!-- COMPLETE: Vollständiger Parser mit CASE, Loops, 23/23 Tests -->
- ❌ Basis-Transpilation: IF → choose <!-- TODO: transpiler/ Verzeichnis existiert, aber leer -->
- ❌ Dependency Analyzer (Trigger-Generierung) <!-- TODO: analyzer/ Verzeichnis existiert, aber leer -->

### Phase 2: Core Features
<!-- ANMERKUNG 2025-01-13: "Vollständiger Parser" wurde bereits in Phase 1 implementiert -->
- Entity-Browser mit WebSocket
- Drag & Drop Entity-Binding
- ✅ Vollständiger Parser (CASE, FOR, WHILE) <!-- Bereits in Phase 1 abgeschlossen -->
- Built-in Funktionen mit Null-Safety
- R_TRIG / F_TRIG
- Loop Safety Guards
- Golden Master Tests

### Phase 3: FB & Projekt-Struktur
- FUNCTION_BLOCK Support
- Projekt-Explorer UI
- Storage Analyzer (Persistenz-Erkennung)
- Helper Manager mit Sync & Cleanup
- Hybrid-Architektur (Automation + Script)
- Throttle/Debounce Generator

### Phase 4: Polish & Advanced
- Timer-FBs (TON, TOF, TP)
- Source Maps & Error Mapping
- Restore-Policy System
- Migration-Handler
- Transactional Deploy + Rollback
- Live-Werte im Editor

---

## Risiko-Matrix

| Risiko | Impact | Wahrscheinlichkeit | Mitigation |
|--------|--------|-------------------|------------|
| Zyklus→Event nicht korrekt | 🔴 Hoch | Mittel | Dependency Analyzer + Tests |
| State-Verlust ohne Persistenz | 🔴 Hoch | Hoch | Storage Analyzer + Helper |
| Timer nicht unterbrechbar | 🟡 Mittel | Hoch | Timer-Entity Pattern |
| Jinja-Fehler bei unavailable | 🟡 Mittel | Hoch | Defensive Templates |
| Loop-Blockierung | 🔴 Hoch | Mittel | Safety Guards |
| Deploy-Inkonsistenz | 🟡 Mittel | Niedrig | Transactional Deploy |
| Parser-Komplexität | 🟡 Mittel | Mittel | Iterativ erweitern |
| **Datei-Manipulation statt API** | 🔴 Hoch | Niedrig | Nur HA Storage API verwenden |
| **Throttle-Helper leer** | 🟡 Mittel | Hoch | Fallback in Template |
| **Parser-Wahl falsch** | 🟡 Mittel | Niedrig | Spike mit Evaluation |

---

## Dateistruktur (Ziel)

```
ST_HA_Automation/
├── custom_components/
│   └── st_hass/
│       ├── __init__.py
│       ├── manifest.json
│       ├── config_flow.py
│       ├── const.py
│       ├── translations/
│       └── frontend/
│           └── st-panel.js (gebaut)
├── frontend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── editor/
│   │   │   ├── st-language.ts
│   │   │   ├── st-theme.ts
│   │   │   ├── st-editor.ts
│   │   │   └── index.ts
│   │   ├── parser/
│   │   │   ├── tokens.ts
│   │   │   ├── lexer.ts
│   │   │   ├── ast.ts
│   │   │   ├── parser.ts
│   │   │   ├── visitor.ts
│   │   │   └── index.ts
│   │   ├── analyzer/
│   │   │   ├── dependency-analyzer.ts
│   │   │   ├── storage-analyzer.ts
│   │   │   └── index.ts
│   │   ├── transpiler/
│   │   │   ├── transpiler.ts
│   │   │   ├── jinja-generator.ts
│   │   │   ├── trigger-generator.ts
│   │   │   ├── timer-transpiler.ts
│   │   │   └── index.ts
│   │   ├── deploy/
│   │   │   ├── deploy-manager.ts
│   │   │   ├── backup-manager.ts
│   │   │   ├── helper-manager.ts
│   │   │   └── index.ts
│   │   └── panel/
│   │       └── st-panel.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── tests/
│   ├── frontend/
│   │   ├── parser.test.ts
│   │   ├── transpiler.test.ts
│   │   └── builtins.test.ts
│   └── integration/
├── docs/
│   ├── 00_Project_Overview.md (diese Datei)
│   ├── archive/  <!-- UPDATE 2025-01-13: Abgeschlossene Dokumentation verschoben -->
│   │   ├── 01_Repository_Setup.md  <!-- ✅ Phase 1 abgeschlossen -->
│   │   ├── 02_CodeMirror_Spike.md  <!-- ✅ Phase 1 abgeschlossen -->
│   │   └── 03_Parser_Spike.md      <!-- ✅ Phase 1 abgeschlossen -->
├── hacs.json
├── README.md
└── LICENSE
```

---

## Referenz-Links

- **Chevrotain:** https://chevrotain.io/
- **CodeMirror 6:** https://codemirror.net/
- **HA WebSocket API:** https://developers.home-assistant.io/docs/api/websocket
- **HACS:** https://hacs.xyz/docs/publish/start
- **IEC 61131-3:** Wikipedia / Beckhoff Infosys
- **CAFE (Referenz):** https://github.com/FezVrasta/cafe-hass

---

## Checkliste für neue Entwickler

- [ ] Repository geklont
- [ ] Node.js 20+ installiert
- [ ] `cd frontend && npm install` ausgeführt
- [ ] `npm run build` erfolgreich
- [ ] Home Assistant Entwicklungsumgebung (optional)
- [ ] 00_Project_Overview.md gelesen
- [ ] MUST-DO's und MUST-NOT-DO's verstanden

---

## Kontakt & Support

- **Issues:** GitHub Issues
- **Diskussionen:** GitHub Discussions
- **Dokumentation:** `/docs` Ordner

---

---

<!-- 
======================================================================================
IMPLEMENTATION STATUS UPDATE - 2025-01-13
======================================================================================

PHASE 1 ZUSAMMENFASSUNG:
- Status: 3 von 5 Tasks abgeschlossen (60%)
- Implementierte Features übertreffen ursprünglichen Scope deutlich

ABGESCHLOSSEN:
✅ Repository-Setup (HACS-Struktur)
   - custom_components/st_hass mit manifest.json, __init__.py, config_flow.py
   - Moderne HA 2024+ APIs (async_register_static_paths, module_url)
   - Translations, HACS-kompatibel

✅ CodeMirror 6 Editor
   - st-language.ts: Vollständige ST Syntax-Highlighting
   - st-theme.ts: TwinCAT-inspiriertes Theme (Dark Blue)
   - st-editor.ts: Editor-Komponente mit Autocomplete
   - Integration in Lit-basiertes Panel

✅ Chevrotain Parser (deutlich über Scope hinaus)
   - Vollständiger IEC 61131-3 ST Parser
   - 23/23 Unit Tests bestehen
   - Unterstützt: PROGRAM, alle VAR-Typen, IF/ELSIF/ELSE, CASE, FOR, WHILE, REPEAT
   - Expressions: Arithmetik, Vergleich, Logik, Function Calls, Unary
   - I/O Bindings: AT %I*, AT %Q*, AT %M*
   - Pragmas: {mode}, {trigger}, {persistent}, etc.
   - CST → AST Visitor vollständig implementiert
   - Token-Lexer mit Word Boundaries für Keywords
   - Error Recovery eingebaut

NOCH OFFEN (für Phase 2):
❌ Basis-Transpilation (IF → choose)
   - Verzeichnis frontend/src/transpiler/ existiert (leer)
   
❌ Dependency Analyzer (Trigger-Generierung)
   - Verzeichnis frontend/src/analyzer/ existiert (leer)

BUILD STATUS:
- TypeScript Compilation: ✅ Pass
- ESLint: ✅ Pass (0 Errors, expected warnings in Chevrotain visitor)
- Tests: ✅ 23/23 passing
- Bundle: 602.79 kB (169.88 kB gzipped)

NÄCHSTE SCHRITTE:
1. Dependency Analyzer implementieren (kritisch für MUST-DO #1)
2. Basis-Transpilation IF → choose
3. Storage Analyzer (MUST-DO #2)
4. Jinja-Generator mit Null-Safety (MUST-DO #3)

======================================================================================
-->

*Letzte Aktualisierung: Januar 2025*
