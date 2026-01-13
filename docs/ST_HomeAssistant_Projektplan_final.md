# ST for Home Assistant - Projektplan

## Projektübersicht

**Ziel:** Eine HACS-Integration die das Programmieren von Home Assistant Automationen in Structured Text (IEC 61131-3, orientiert an TwinCAT) ermöglicht.

**Architektur-Ansatz:** Transpilation (wie CAFE) – ST-Code wird in native HA-Automationen übersetzt, kein Runtime-Overhead.

---

## Tech Stack

| Komponente | Technologie | Begründung | Status |
|------------|-------------|------------|--------|
| Editor | CodeMirror 6 | Leichtgewichtig (~300KB), modular, gut erweiterbar | ✅ Entschieden |
| Frontend | TypeScript + Lit | HA-Panel Integration | ✅ Entschieden |
| Parser | **Chevrotain oder Nearley.js** | Moderner Parser-Generator für JS/TS | ⚠️ **Offen** |
| Backend | Python (HA Integration) | Native HA-Kompatibilität | ✅ Entschieden |
| Kommunikation | HA WebSocket API | Entity-Zugriff, Live-Daten | ✅ Entschieden |

### ⚠️ Offene Entscheidung: Parser-Bibliothek

| Kriterium | Chevrotain | Nearley.js |
|-----------|------------|------------|
| **Ansatz** | Handgeschriebene Parser-Klasse | Deklarative BNF-Grammatik |
| **Performance** | Sehr schnell | Gut |
| **Error Recovery** | Eingebaut | Manuell |
| **Lernkurve** | Mittel | Steil |
| **Debugging** | Gute Stack Traces | Schwieriger |
| **Bundle Size** | ~100KB | ~50KB |

**Empfehlung:** Chevrotain für bessere Error-Recovery und Debugging.
**Entscheidung:** Im Parser-Spike evaluieren, dann festlegen.

---

## Sprachfeatures (Scope)

### Datentypen
| Typ | HA-Mapping |
|-----|------------|
| `BOOL` | `true/false`, Entity-States `on/off` |
| `INT` | Integer-Templates |
| `REAL` | Float-Templates |
| `STRING` | String-Templates |

### Kontrollstrukturen
| ST-Feature | HA-Äquivalent |
|------------|---------------|
| `IF/ELSIF/ELSE/END_IF` | `choose` mit conditions |
| `CASE...OF/END_CASE` | `choose` mit mehreren branches |
| `FOR...TO...DO/END_FOR` | `repeat` mit count |
| `WHILE...DO/END_WHILE` | `repeat` mit while-condition |

### Operatoren & Funktionen
| Kategorie | Features |
|-----------|----------|
| Arithmetik | `+`, `-`, `*`, `/`, `MOD` |
| Vergleich | `=`, `<>`, `<`, `>`, `<=`, `>=` |
| Logisch | `AND`, `OR`, `XOR`, `NOT` |
| Auswahl | `SEL` (2-Wege), `MUX` (n-Wege) |
| Mathematik | `ABS`, `SQRT`, `TRUNC`, `ROUND`, `MIN`, `MAX`, `LIMIT` |
| Konvertierung | `TO_INT`, `TO_DINT`, `TO_REAL`, `TO_LREAL`, `TO_STRING`, `TO_BOOL` |

### Funktionsbausteine (Built-in)
| FB | Funktion | HA-Umsetzung |
|----|----------|--------------|
| `R_TRIG` | Steigende Flanke | `trigger: state: from 'off' to 'on'` |
| `F_TRIG` | Fallende Flanke | `trigger: state: from 'on' to 'off'` |
| `SR` | Setzen-dominant | Helper + Logik |
| `RS` | Rücksetzen-dominant | Helper + Logik |
| `TON` | Einschaltverzögerung | Timer-Entity + Event-Automation |
| `TOF` | Ausschaltverzögerung | Timer-Entity + Event-Automation |
| `TP` | Impuls | Timer-Entity + Event-Automation |

---

## Kritische Design-Entscheidungen

### 1. Zyklus vs. Event (Das "Herzschlag"-Problem)

**Problem:** ST-Programme "prüfen immer" (zyklisch), HA-Automationen "schlafen bis Event".

**Lösung: Dependency Analysis mit automatischer Trigger-Generierung**

Der Transpiler analysiert den Code statisch und erkennt alle gelesenen Entity-Variablen. Für jede wird automatisch ein State-Change-Trigger generiert.

```typescript
// dependency-analyzer.ts
class DependencyAnalyzer {
  
  analyzeProgram(ast: Program): TriggerSet {
    const triggers = new TriggerSet();
    
    // Alle gelesenen Entity-Variablen finden
    const readEntities = this.findReadEntities(ast);
    
    // Für jede gelesene Entity einen State-Trigger generieren
    for (const entity of readEntities) {
      triggers.add({
        platform: "state",
        entity_id: entity.entityId,
        not_from: ["unavailable", "unknown"],
        not_to: ["unavailable", "unknown"]
      });
    }
    
    // Explizite R_TRIG/F_TRIG überschreiben generische Trigger
    const explicitTrigs = this.findExplicitTriggers(ast);
    triggers.mergeExplicit(explicitTrigs);
    
    return triggers;
  }
}
```

**Pragma für manuelle Kontrolle:**
```iecst
PROGRAM Kitchen
VAR
    {trigger}  // Explizit: Dieser Input löst Automation aus
    motion AT %I* : BOOL := 'binary_sensor.motion';
    
    {no_trigger}  // Explizit: Kein Trigger, nur lesen
    temperature AT %I* : REAL := 'sensor.temp';
END_VAR
```

**Compiler-Warnungen:**
- `W010`: Keine Trigger erkannt - Programm wird nie ausgeführt
- `I010`: Viele Trigger (>10) - Performance-Hinweis

---

### 2. State Management: Persistenz vs. Amnesie

**Problem:** ST-Variablen behalten ihren Wert, HA-Variablen leben nur Millisekunden.

**Lösung: Tiered Storage Strategy**

```typescript
enum StorageType {
  TRANSIENT,    // Nur innerhalb eines Runs (HA variables:)
  PERSISTENT,   // Überlebt Runs (input_* Helper)
  DERIVED       // Wird aus Entity-State gelesen
}
```

**Automatische Erkennung:**
- Entity-gebundene Variablen → `DERIVED`
- Selbst-Referenz (`counter := counter + 1`) → `PERSISTENT`
- FB-Instanzen → `PERSISTENT`
- Timer-bezogen (TON, SR, etc.) → `PERSISTENT`
- Alles andere → `TRANSIENT`

**Explizite Pragmas:**
```iecst
VAR
    {persistent}
    manualPersist : INT := 0;
    
    {transient}
    tempValue : INT := 0;
END_VAR
```

**Namespace-Konvention:**
```
input_number.st_<projekt>_<programm>_<variable>
input_boolean.st_<projekt>_<programm>_<variable>
```

**Automatisches Cleanup:**
Der Helper-Manager synchronisiert bei jedem Deploy:
1. Benötigte Helper aus Code ermitteln
2. Existierende ST-Helper finden (`st_` Prefix)
3. Diff berechnen (create, delete, update)
4. User-Bestätigung für Löschungen einholen

---

### 3. Zeit-Logik: Timer & Loops

#### Timer (TON, TOF, TP)

**Problem:** HA `delay` ist nicht unterbrechbar, ST-Timer schon.

**Lösung: Timer-Entity + Separate Event-Automation**

```
┌─────────────────────────────────────────────────────────────────┐
│  TON Umsetzung                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Benötigte Entities:                                            │
│  • timer.st_<prog>_<instance>         (HA Timer)                │
│  • input_boolean.st_<prog>_<instance>_q  (Output-State)         │
│                                                                 │
│  Haupt-Automation:                                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ IF IN = TRUE AND timer.idle:                              │ │
│  │   → timer.start(duration)                                 │ │
│  │ IF IN = FALSE:                                            │ │
│  │   → timer.cancel()                                        │ │
│  │   → output.turn_off()                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Timer-Finished Automation:                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ trigger: timer.finished                                   │ │
│  │ condition: IN still TRUE                                  │ │
│  │ action: output.turn_on()                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Loops (FOR, WHILE)

**Problem:** Schleifen blockieren den Ausführungs-Thread, Endlosschleifen frieren ein.

**Lösung: Safety Guards**

```typescript
const MAX_ITERATIONS = 1000;

// WHILE bekommt automatischen Safety Counter
repeat:
  while:
    - "{{ original_condition }}"
    - "{{ _safety_counter < 1000 }}"
  sequence:
    - variables:
        _safety_counter: "{{ _safety_counter + 1 }}"
    - # ... original body
```

**Compiler-Warnungen:**
- `W020`: WHILE ohne garantierte Exit-Bedingung
- `E020`: FOR mit >1000 Iterationen

---

### 4. Transpilation & Jinja-Sicherheit

**Problem:** Sensoren können `unavailable`, `unknown`, `none` sein → Jinja-Fehler.

**Lösung: Defensive Jinja-Generierung**

```typescript
class JinjaGenerator {
  
  generateEntityRead(entityId: string, expectedType: DataType): string {
    const state = `states('${entityId}')`;
    const invalid = `['unavailable', 'unknown', 'none', '']`;
    
    switch (expectedType) {
      case "BOOL":
        return `(${state} in ['on', 'true', 'True', '1'])`;
        
      case "INT":
        return `(${state} | int(default=0) if ${state} not in ${invalid} else 0)`;
        
      case "REAL":
        return `(${state} | float(default=0.0) if ${state} not in ${invalid} else 0.0)`;
        
      case "STRING":
        return `(${state} if ${state} not in ['unavailable', 'unknown'] else '')`;
    }
  }
}
```

**Built-in Funktionen mit Null-Safety:**
```typescript
// LIMIT mit Fallback
LIMIT: `{% set _v = ${val} %}` +
       `{% if _v is number %}{{ [[${mn}, _v] | max, ${mx}] | min }}` +
       `{% else %}{{ ${mn} }}{% endif %}`

// SQRT mit Negativzahl-Check
SQRT: `{% set _v = ${arg} %}` +
      `{% if _v is number and _v >= 0 %}{{ _v | sqrt }}` +
      `{% else %}{{ 0 }}{% endif %}`
```

**Golden Master Tests:**
Jede Built-in Funktion wird mit Edge Cases getestet:
- Normale Werte
- `unavailable`, `unknown`, `none`, `""`
- Typ-Coercion (`"5.5"` → `5.5`)
- Grenzwerte

---

### 5. Deployment-Architektur

**Empfehlung: Trigger-Dispatcher + Logic-Script (Hybrid)**

```
┌─────────────────────────────────────────────────────────────────┐
│  Architektur                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  automation:                      script:                       │
│  ┌─────────────────────┐         ┌─────────────────────────┐   │
│  │ [ST] Kitchen_Trigger│         │ [ST] Kitchen_Logic      │   │
│  │                     │         │                         │   │
│  │ trigger:            │         │ sequence:               │   │
│  │   - state change    │────────▶│   - choose: ...         │   │
│  │   - timer finished  │         │   - service: ...        │   │
│  │                     │         │                         │   │
│  │ action:             │         │                         │   │
│  │   - script.call     │         │                         │   │
│  │                     │         │                         │   │
│  │ mode: single        │         │ mode: restart           │   │
│  └─────────────────────┘         └─────────────────────────┘   │
│                                                                 │
│  Vorteile:                                                      │
│  • Saubere Trennung Trigger/Logik                               │
│  • Scripts einzeln testbar                                      │
│  • Separater Trace für Debugging                                │
│  • Wiederverwendbar                                             │
│  • Script mode: restart = SPS-like (neuer Input wichtiger)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Concurrency & Mode-Strategie

**Problem:** Was passiert bei Trigger-Stürmen?

```
Trigger 1 ──▶ Script läuft (mit delay)
Trigger 2 ──▶ ???
Trigger 3 ──▶ ???
```

**Mode-Optionen in HA:**

| Mode | Verhalten | SPS-Analogie |
|------|-----------|--------------|
| `single` | Ignoriert neue Trigger während Lauf | ❌ Input Loss |
| `restart` | Bricht ab, startet neu | ✅ Neuer Wert wichtiger |
| `queued` | Reiht ein (max 10) | Für sequentielle Aufgaben |
| `parallel` | Mehrere Instanzen gleichzeitig | ⚠️ Race Conditions |

**Lösung: Konfigurierbar mit Default `restart`**

```iecst
// Pragma für Mode-Kontrolle
{mode: restart}  // Default - SPS-like
PROGRAM Kitchen

// Oder für spezielle Fälle:
{mode: queued, max_queued: 5}
PROGRAM NotificationHandler

{mode: parallel, max_parallel: 3}
PROGRAM IndependentTasks
```

**Generierte YAML:**
```yaml
# Trigger-Automation (nur Dispatcher)
alias: "[ST] Kitchen"
mode: single

# Logic-Script (hier zählt es!)
alias: "[ST] Kitchen_Logic"
mode: restart
```

---

### 7. Trigger-Throttling & Debounce

**Problem:** Dependency Analysis auf viele Entities + schnelle Sensoren = "Disco"

```
5 Entities erkannt:
- sensor.temperature (alle 10s)
- sensor.humidity (alle 10s)  
- binary_sensor.motion (flattert)
- sensor.power (jede Sekunde!)
- light.status

→ Worst Case: 60+ Trigger pro Minute
```

**Lösung: Programm-Level Throttle/Debounce**

```iecst
// Throttle: Max 1 Ausführung pro Sekunde
{throttle: T#1s}
PROGRAM Kitchen

// Debounce: Warte bis 500ms Ruhe
{debounce: T#500ms}
PROGRAM MotionHandler
```

**Implementation Throttle:**
```typescript
class ThrottleGenerator {
  
  generateThrottledAutomation(program: Program, throttle: Duration): HAAutomation {
    const lastRunHelper = `input_datetime.st_${program.name}_last_run`;
    
    return {
      alias: `[ST] ${program.name}`,
      mode: "single",
      trigger: triggers,
      
      // WICHTIG: Robustes Template mit Fallback für ersten Run!
      condition: [{
        condition: "template",
        value_template: `{% set last = states('${lastRunHelper}') %}
{% if last in ['unknown', 'unavailable', 'none', ''] %}
  true
{% else %}
  {{ (now() - (last | as_datetime)).total_seconds() > ${throttle.seconds} }}
{% endif %}`
      }],
      
      action: [
        // Timestamp updaten
        {
          service: "input_datetime.set_datetime",
          target: { entity_id: lastRunHelper },
          data: { datetime: "{{ now().isoformat() }}" }
        },
        // Script aufrufen
        {
          service: "script.turn_on",
          target: { entity_id: `script.st_${program.name}_logic` }
        }
      ]
    };
  }
  
  // Helper beim Deploy initialisieren falls nicht existent
  async ensureThrottleHelper(program: Program): Promise<void> {
    const helperId = `input_datetime.st_${program.name}_last_run`;
    const exists = await this.helperExists(helperId);
    
    if (!exists) {
      await this.createHelper({
        platform: 'input_datetime',
        name: `ST ${program.name} Last Run`,
        has_date: true,
        has_time: true,
        // Initial: Jetzt minus 1 Stunde → erster Run erlaubt
        initial: new Date(Date.now() - 3600000).toISOString()
      });
    }
  }
}
```

**Implementation Debounce:**
```typescript
generateDebouncedAutomation(program: Program, debounce: Duration): HAAutomation {
  return {
    alias: `[ST] ${program.name}`,
    mode: "restart",  // Restart = Debounce-Effekt!
    trigger: triggers,
    
    action: [
      // Warte (wird bei neuem Trigger abgebrochen)
      { delay: { seconds: debounce.seconds } },
      // Erst dann Script
      {
        service: "script.turn_on",
        target: { entity_id: `script.st_${program.name}_logic` }
      }
    ]
  };
}
```

**Kombination mit Trigger-Pragmas:**
```iecst
{throttle: T#2s}
PROGRAM ClimateControl
VAR
    {trigger}
    temperature AT %I* : REAL := 'sensor.temp';
    {trigger}
    humidity AT %I* : REAL := 'sensor.humidity';
    {no_trigger}  // Wird gelesen, triggert aber nicht
    power AT %I* : REAL := 'sensor.power';
END_VAR
```

---

### 8. Deploy-Mechanismus: NUR über HA-APIs!

**⚠️ KRITISCH: KEINE direkte YAML-Datei-Manipulation!**

```python
# ❌ FALSCH - Niemals so!
with open('/config/automations.yaml', 'w') as f:
    yaml.dump(automation, f)

# ❌ FALSCH - Auch nicht so!
shutil.copy(generated_yaml, '/config/automations.yaml')
```

**Probleme bei Datei-Manipulation:**
- Überschreibt User-Kommentare und Formatierung
- HA trackt Änderungen nicht
- Kein Rollback bei Fehler möglich
- Race Conditions mit HA-Core
- Sicherheitsrisiko

**✅ RICHTIG: HA Storage API / WebSocket Services**

```typescript
// Automation erstellen/updaten
await hass.callWS({
  type: 'config/automation/config',
  automation_id: 'st_kitchen',
  config: generatedAutomation
});

// Script erstellen/updaten  
await hass.callWS({
  type: 'config/script/config',
  script_id: 'st_kitchen_logic',
  config: generatedScript
});

// Helper erstellen
await hass.callService('input_number', 'create', {
  name: 'ST Kitchen Counter',
  min: 0,
  max: 1000000,
  mode: 'box'
});

// Nach Änderungen reloaden
await hass.callService('automation', 'reload', {});
await hass.callService('script', 'reload', {});
```

**Vorteile:**
- HA verwaltet Speicherung selbst
- Änderungen werden getrackt
- Rollback über HA möglich
- Keine Konflikte mit manuellen Edits

---

### 9. Deploy-Sicherheit: Atomic & Rollback

**Problem:** Deploy-Prozess kann halb durchlaufen und System inkonsistent hinterlassen.

```
Deploy-Prozess:
1. ✓ Helper A erstellt
2. ✓ Helper B erstellt  
3. ✓ Automation erstellt
4. ✗ Script-Erstellung FEHLER!

→ System in inkonsistentem Zustand!
```

**Lösung: Transactional Deploy mit Rollback**

```typescript
// deploy-manager.ts
interface DeployTransaction {
  id: string;
  timestamp: Date;
  operations: DeployOperation[];
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
}

class DeployManager {
  
  async deploy(project: STProject): Promise<DeployResult> {
    const transaction: DeployTransaction = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      operations: [],
      status: 'pending'
    };
    
    try {
      // Phase 1: Validierung (keine Änderungen)
      await this.validateAll(project);
      
      // Phase 2: Backup aktueller Zustand
      const backup = await this.createBackup(project);
      
      // Phase 3: Änderungen sammeln (noch nicht anwenden)
      const changes = await this.calculateChanges(project);
      transaction.operations = changes;
      
      // Phase 4: Änderungen anwenden (mit Tracking)
      for (const op of changes) {
        try {
          await this.applyOperation(op);
          op.status = 'applied';
        } catch (error) {
          // Rollback aller bisherigen Operationen
          await this.rollback(transaction);
          throw new DeployError(`Failed at ${op.entityId}`, transaction);
        }
      }
      
      // Phase 5: Verifikation
      const verification = await this.verifyDeployment(project);
      if (!verification.success) {
        await this.rollback(transaction);
        throw new DeployError(`Verification failed`, transaction);
      }
      
      // Phase 6: Commit
      transaction.status = 'committed';
      await this.saveTransaction(transaction);
      
      return { success: true, transactionId: transaction.id };
      
    } catch (error) {
      transaction.status = 'failed';
      await this.saveTransaction(transaction);
      throw error;
    }
  }
  
  async rollback(transaction: DeployTransaction): Promise<void> {
    // Operationen in umgekehrter Reihenfolge rückgängig machen
    const appliedOps = transaction.operations
      .filter(op => op.status === 'applied')
      .reverse();
    
    for (const op of appliedOps) {
      await this.revertOperation(op);
    }
    
    transaction.status = 'rolled_back';
  }
  
  private async revertOperation(op: DeployOperation): Promise<void> {
    switch (op.type) {
      case 'create':
        await this.deleteEntity(op.entityId);
        break;
      case 'update':
        await this.updateEntity(op.entityId, op.previousState);
        break;
      case 'delete':
        await this.createEntity(op.entityId, op.previousState);
        break;
    }
  }
}
```

**Backup-Manager:**
```typescript
class BackupManager {
  
  async createBackup(project: STProject): Promise<Backup> {
    const backup: Backup = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      projectName: project.name,
      data: {
        helpers: await this.backupHelpers(project),
        automations: await this.backupAutomations(project),
        scripts: await this.backupScripts(project)
      }
    };
    
    await this.saveBackup(backup);
    return backup;
  }
  
  async restoreBackup(backupId: string): Promise<void> {
    const backup = await this.loadBackup(backupId);
    await this.deleteProjectEntities(backup.projectName);
    
    for (const helper of backup.data.helpers) {
      await this.createHelper(helper);
    }
    // ... automations, scripts
  }
  
  // Automatische Backup-Rotation (behalte letzte 5)
  async cleanupOldBackups(keepCount: number = 5): Promise<void> {
    const backups = await this.listBackups();
    const toDelete = backups
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(keepCount);
    
    for (const backup of toDelete) {
      await this.deleteBackup(backup.id);
    }
  }
}
```

**Deploy UI:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│  Deploy                                                         [×]     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📦 Deploy Preview                                                       │
│                                                                          │
│  Changes:                                                                │
│    ✚ input_number.st_kitchen_counter (create)                            │
│    ✎ automation.st_kitchen (update)                                      │
│    ✎ script.st_kitchen_logic (update)                                    │
│    ✖ input_boolean.st_kitchen_oldflag (delete)                           │
│                                                                          │
│  Settings:                                                               │
│    Mode: restart                                                         │
│    Throttle: 1s                                                          │
│                                                                          │
│  ☑ Create backup before deploy                                           │
│                                                                          │
│                                    [Cancel] [Deploy]                     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Nach fehlgeschlagenem Deploy:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│  ❌ Deploy Failed                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Error: Failed to create script.st_kitchen_logic                         │
│         Invalid YAML: unexpected key "squence"                           │
│                                                                          │
│  Rollback Status:                                                        │
│    ✓ input_number.st_kitchen_counter (deleted)                           │
│    ✓ automation.st_kitchen (reverted)                                    │
│                                                                          │
│  System restored to previous state.                                      │
│                                                                          │
│                                              [View Details] [OK]         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 9. Debugging & Error-Mapping

**Problem:** HA-Fehler zeigen YAML-Zeile, nicht ST-Zeile.

**Lösung: Source Maps**

```yaml
# Generiertes YAML
variables:
  _st_source_map:
    "action.0.choose.0": { st_line: 7, st_file: "kitchen.st" }
    "action.0.choose.0.sequence.0": { st_line: 8, st_file: "kitchen.st" }
```

**Error Translation:**
```typescript
const translations = [
  [/UndefinedError: '(\w+)' is undefined/, 
   "Variable '$1' nicht deklariert oder Entity nicht gefunden"],
  [/could not convert string to float/,
   "Sensor-Wert ist kein gültiger Zahlenwert (evtl. 'unavailable')"],
];
```

**UI zeigt:**
```
❌ Fehler in kitchen.st Zeile 7:
   Variable 'sensor_temp' nicht deklariert oder Entity nicht gefunden
   
   7 │ IF sensor_temp > 25.0 THEN
       ^^^^^^^^^^^
```

---

### 10. Restart/Init-Semantik

**Problem:** Was passiert mit persistenten Variablen nach HA-Restart?

**Lösung: Explizite Restore-Policies via Pragmas**

```iecst
VAR
    // Default: Restore wenn vorhanden, sonst Initialwert
    counter : INT := 0;
    
    // Immer mit Initialwert starten
    {reset_on_restart}
    sessionCounter : INT := 0;
    
    // Muss vorherigen Wert haben, Fehler wenn nicht
    {require_restore}
    criticalState : BOOL;
END_VAR
```

**Restore-Logik:**
```typescript
enum RestorePolicy {
  RESTORE_OR_INIT,  // Default
  ALWAYS_INIT,      // {reset_on_restart}
  REQUIRE_RESTORE   // {require_restore}
}
```

**Migration bei Schema-Änderungen:**

Der Transpiler erkennt:
- Typ-Änderungen (`INT` → `REAL`)
- Entfernte Variablen
- Range-Änderungen

UI zeigt Migration-Dialog mit Optionen:
- Wert konvertieren
- Auf Initialwert zurücksetzen
- Alten Helper behalten (orphaned)

---

## Phasenplan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 1: Foundation                                                        │
│  ════════════════════                                                       │
│  • Projekt-Setup (HACS-Struktur, Build-Pipeline)                            │
│  • CodeMirror 6 Integration mit ST Syntax-Highlighting                      │
│  • Basis-Parser (Lexer + AST) für Kern-Syntax                               │
│  • Einfache Transpilation: IF/ELSE → choose                                 │
│  • Proof-of-Concept: Eine ST-Datei → Eine HA-Automation                     │
│  • Dependency Analyzer (automatische Trigger-Generierung)                   │
│  • Defensive Jinja-Generierung für Entity-Reads                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Phase 2: Core Features                                                     │
│  ══════════════════════                                                     │
│  • Entity-Browser mit WebSocket-Anbindung                                   │
│  • Drag & Drop Entity-Binding (AT %I* / %Q* Syntax)                         │
│  • Vollständiger Parser (CASE, FOR, WHILE, alle Operatoren)                 │
│  • Built-in Funktionen mit Null-Safety (SEL, MUX, LIMIT, etc.)              │
│  • Typkonvertierungen                                                       │
│  • R_TRIG / F_TRIG Umsetzung                                                │
│  • Loop Safety Guards                                                       │
│  • Golden Master Test Suite für Built-ins                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Phase 3: FB & Projekt-Struktur                                             │
│  ══════════════════════════════                                             │
│  • FUNCTION_BLOCK Definition und Instanziierung                             │
│  • FUNCTION Support (ohne Instanz)                                          │
│  • Projekt-Explorer UI (Programme, FBs, GVLs)                               │
│  • Multi-File Support                                                       │
│  • SR/RS Flip-Flop FBs                                                      │
│  • Import/Export von ST-Projekten                                           │
│  • Storage Analyzer (automatische Persistenz-Erkennung)                     │
│  • Helper Manager mit Sync & Cleanup                                        │
│  • Hybrid-Architektur (Trigger-Automation + Logic-Script)                   │
│  • Mode-Strategie (default: restart)                                        │
│  • Throttle/Debounce Generator                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Phase 4: Polish & Advanced                                                 │
│  ══════════════════════════                                                 │
│  • Timer-FBs (TON, TOF, TP) mit Timer-Entity Pattern                        │
│  • Source Maps für Error-Mapping                                            │
│  • Error Translation (HA-Fehler → ST-Kontext)                               │
│  • Restore-Policy System ({reset_on_restart}, {require_restore})            │
│  • Migration-Handler für Schema-Änderungen                                  │
│  • Transactional Deploy mit Rollback                                        │
│  • Backup-Manager                                                           │
│  • Live-Werte im Editor (Online-Modus)                                      │
│  • Dokumentation und Beispiele                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation - Detailplan

### 1.1 Projekt-Setup

```
st-hass/
├── custom_components/
│   └── st_hass/
│       ├── __init__.py          # HA Integration Entry
│       ├── manifest.json        # HACS Manifest
│       ├── config_flow.py       # Setup Flow
│       └── panel.py             # Panel Registration
├── frontend/
│   ├── src/
│   │   ├── editor/
│   │   │   ├── st-editor.ts     # CodeMirror Wrapper
│   │   │   ├── st-language.ts   # ST Language Mode
│   │   │   └── st-theme.ts      # TwinCAT-ähnliches Theme
│   │   ├── parser/
│   │   │   ├── lexer.ts         # Token-Definitionen
│   │   │   ├── parser.ts        # AST-Generator
│   │   │   └── ast.ts           # AST Node Types
│   │   ├── analyzer/
│   │   │   ├── dependency-analyzer.ts  # Trigger-Erkennung
│   │   │   └── storage-analyzer.ts     # Persistenz-Erkennung
│   │   ├── transpiler/
│   │   │   ├── transpiler.ts    # AST → HA YAML
│   │   │   ├── jinja-generator.ts  # Defensive Jinja
│   │   │   └── templates.ts     # HA Action Templates
│   │   ├── deploy/
│   │   │   ├── deploy-manager.ts   # Transactional Deploy
│   │   │   ├── backup-manager.ts   # Backup & Restore
│   │   │   └── helper-manager.ts   # Helper Sync
│   │   └── panel/
│   │       └── st-panel.ts      # Haupt-Panel Komponente
│   ├── package.json
│   └── tsconfig.json
├── hacs.json
└── README.md
```

### 1.2 CodeMirror 6 ST-Mode

**Syntax-Highlighting Regeln:**

```typescript
// st-language.ts
const stKeywords = [
  "PROGRAM", "END_PROGRAM",
  "FUNCTION", "END_FUNCTION",
  "FUNCTION_BLOCK", "END_FUNCTION_BLOCK",
  "VAR", "VAR_INPUT", "VAR_OUTPUT", "VAR_IN_OUT", "END_VAR",
  "IF", "THEN", "ELSIF", "ELSE", "END_IF",
  "CASE", "OF", "END_CASE",
  "FOR", "TO", "BY", "DO", "END_FOR",
  "WHILE", "END_WHILE",
  "REPEAT", "UNTIL", "END_REPEAT",
  "TRUE", "FALSE",
  "AND", "OR", "XOR", "NOT", "MOD"
];

const stTypes = ["BOOL", "INT", "DINT", "REAL", "LREAL", "STRING", "TIME"];

const stBuiltins = [
  "SEL", "MUX", "LIMIT", "MIN", "MAX",
  "ABS", "SQRT", "TRUNC", "ROUND",
  "TO_INT", "TO_DINT", "TO_REAL", "TO_LREAL", "TO_STRING", "TO_BOOL",
  "R_TRIG", "F_TRIG", "SR", "RS", "TON", "TOF", "TP"
];

const stPragmas = [
  "trigger", "no_trigger",
  "persistent", "transient",
  "reset_on_restart", "require_restore",
  "mode", "max_queued", "max_parallel",
  "throttle", "debounce"
];
```

### 1.3 Parser-Architektur

**Lexer Token-Typen:**

```typescript
enum TokenType {
  // Literals
  INTEGER_LITERAL,    // 42, 16#FF, 2#1010
  REAL_LITERAL,       // 3.14, 1.0E-5
  STRING_LITERAL,     // 'Hello'
  TIME_LITERAL,       // T#5s, T#1h30m
  BOOL_LITERAL,       // TRUE, FALSE
  
  // Identifiers
  IDENTIFIER,         // myVar, FB_Motor
  
  // Keywords
  KEYWORD,
  
  // Operators
  ASSIGN,             // :=
  PLUS, MINUS, STAR, SLASH, MOD,
  EQ, NEQ, LT, GT, LE, GE,
  AND, OR, XOR, NOT,
  
  // Punctuation
  LPAREN, RPAREN,     // ( )
  LBRACKET, RBRACKET, // [ ]
  SEMICOLON,          // ;
  COLON,              // :
  COMMA,              // ,
  DOT,                // .
  
  // Special
  AT,                 // AT
  PERCENT_I,          // %I*
  PERCENT_Q,          // %Q*
  PRAGMA,             // {keyword} oder {key: value}
  
  // Comments
  COMMENT_LINE,       // // comment
  COMMENT_BLOCK,      // (* comment *)
  
  EOF
}
```

**AST Node-Struktur:**

```typescript
// ast.ts
interface ASTNode {
  type: string;
  location: SourceLocation;
  pragmas?: Pragma[];
}

interface Pragma {
  name: string;
  value?: string | number | Duration;
}

interface Program extends ASTNode {
  type: "Program";
  name: string;
  variables: VariableDeclaration[];
  body: Statement[];
}

interface VariableDeclaration extends ASTNode {
  type: "VariableDeclaration";
  name: string;
  dataType: DataType;
  initialValue?: Expression;
  binding?: EntityBinding;
  section: "VAR" | "VAR_INPUT" | "VAR_OUTPUT" | "VAR_IN_OUT";
}

interface EntityBinding extends ASTNode {
  type: "EntityBinding";
  direction: "INPUT" | "OUTPUT";
  entityId: string;
}

interface IfStatement extends ASTNode {
  type: "IfStatement";
  condition: Expression;
  thenBranch: Statement[];
  elsifBranches: { condition: Expression; body: Statement[] }[];
  elseBranch?: Statement[];
}

interface CaseStatement extends ASTNode {
  type: "CaseStatement";
  selector: Expression;
  cases: { values: Expression[]; body: Statement[] }[];
  elseCase?: Statement[];
}

interface ForStatement extends ASTNode {
  type: "ForStatement";
  variable: string;
  from: Expression;
  to: Expression;
  by?: Expression;
  body: Statement[];
}

interface WhileStatement extends ASTNode {
  type: "WhileStatement";
  condition: Expression;
  body: Statement[];
}

interface Assignment extends ASTNode {
  type: "Assignment";
  target: string;
  value: Expression;
}

interface FunctionCall extends ASTNode {
  type: "FunctionCall";
  name: string;
  arguments: Expression[];
}
```

### 1.4 Dependency Analyzer

```typescript
// dependency-analyzer.ts
interface TriggerConfig {
  platform: string;
  entity_id: string;
  from?: string;
  to?: string;
  id?: string;
}

class DependencyAnalyzer {
  
  analyzeProgram(ast: Program): AnalysisResult {
    const triggers: TriggerConfig[] = [];
    const diagnostics: Diagnostic[] = [];
    
    // 1. Alle Entity-Reads finden
    const readEntities = this.findReadEntities(ast);
    
    // 2. Pragma-gesteuerte Trigger
    for (const entity of readEntities) {
      const varDecl = this.lookupVariable(ast, entity.varName);
      
      if (varDecl.pragmas?.some(p => p.name === "no_trigger")) continue;
      
      if (varDecl.pragmas?.some(p => p.name === "trigger") || 
          varDecl.binding?.direction === "INPUT") {
        triggers.push({
          platform: "state",
          entity_id: entity.entityId,
          id: `dep_${entity.varName}`
        });
      }
    }
    
    // 3. Explizite R_TRIG/F_TRIG
    const explicitTrigs = this.findExplicitTriggers(ast);
    for (const trig of explicitTrigs) {
      const idx = triggers.findIndex(t => t.entity_id === trig.entity_id);
      if (idx >= 0) triggers[idx] = trig;
      else triggers.push(trig);
    }
    
    // 4. Warnungen
    if (triggers.length === 0) {
      diagnostics.push({
        severity: "Warning",
        code: "W010",
        message: "No triggers detected. Program will never execute.",
        location: ast.location
      });
    }
    
    if (triggers.length > 10) {
      diagnostics.push({
        severity: "Info",
        code: "I010",
        message: `Program triggers on ${triggers.length} entities. Consider using {trigger} pragma.`,
        location: ast.location
      });
    }
    
    return { triggers, diagnostics };
  }
}
```

### 1.5 Defensive Jinja Generator

```typescript
// jinja-generator.ts
class JinjaGenerator {
  
  generateEntityRead(entityId: string, expectedType: DataType): string {
    const state = `states('${entityId}')`;
    const invalid = `['unavailable', 'unknown', 'none', '']`;
    
    switch (expectedType) {
      case "BOOL":
        return `(${state} in ['on', 'true', 'True', '1'])`;
        
      case "INT":
      case "DINT":
        return `(${state} | int(default=0) if ${state} not in ${invalid} else 0)`;
        
      case "REAL":
      case "LREAL":
        return `(${state} | float(default=0.0) if ${state} not in ${invalid} else 0.0)`;
        
      case "STRING":
        return `(${state} if ${state} not in ['unavailable', 'unknown'] else '')`;
        
      default:
        return state;
    }
  }
  
  generateBuiltin(name: string, args: string[]): string {
    switch (name) {
      case "SEL":
        return `{% if ${args[0]} %}${args[2]}{% else %}${args[1]}{% endif %}`;
        
      case "LIMIT":
        return `{% set _v = ${args[1]} %}` +
               `{% if _v is number %}{{ [[${args[0]}, _v] | max, ${args[2]}] | min }}` +
               `{% else %}{{ ${args[0]} }}{% endif %}`;
               
      case "MIN":
        return `{{ min(${args[0]}, ${args[1]}) }}`;
        
      case "MAX":
        return `{{ max(${args[0]}, ${args[1]}) }}`;
        
      case "ABS":
        return `{{ ${args[0]} | abs }}`;
        
      case "SQRT":
        return `{% set _v = ${args[0]} %}` +
               `{% if _v is number and _v >= 0 %}{{ _v | sqrt }}` +
               `{% else %}{{ 0 }}{% endif %}`;
               
      case "TRUNC":
        return `{{ ${args[0]} | int }}`;
        
      case "ROUND":
        return `{{ ${args[0]} | round }}`;
        
      case "TO_INT":
        return `{{ ${args[0]} | int(default=0) }}`;
        
      case "TO_REAL":
        return `{{ ${args[0]} | float(default=0.0) }}`;
        
      case "TO_STRING":
        return `{{ ${args[0]} | string }}`;
        
      case "TO_BOOL":
        return `{{ ${args[0]} | bool }}`;
        
      default:
        throw new Error(`Unknown builtin: ${name}`);
    }
  }
}
```

### 1.6 Transpiler Basis

**Beispiel-Transformation:**

```
ST-Code                          HA-YAML Output
═══════════════════════════════  ═══════════════════════════════════════
{mode: restart}                  # Automation (Dispatcher)
{throttle: T#1s}                 alias: "[ST] Test"
PROGRAM Test                     id: "st_test"
VAR                              mode: single
  {trigger}                      trigger:
  motion AT %I* : BOOL             - platform: state
    := 'binary_sensor.pir';          entity_id: binary_sensor.pir
  light AT %Q* : BOOL                id: dep_motion
    := 'light.lamp';             condition:
END_VAR                            - condition: template
                                     value_template: >-
IF motion THEN                         {{ (now() - states('input_datetime...
  light := TRUE;                 action:
ELSE                               - service: input_datetime.set_datetime
  light := FALSE;                    ...
END_IF;                            - service: script.turn_on
                                     target:
END_PROGRAM                            entity_id: script.st_test_logic

                                 # Script (Logic)
                                 alias: "[ST] Test_Logic"
                                 mode: restart
                                 sequence:
                                   - choose:
                                       - conditions:
                                           - condition: template
                                             value_template: >-
                                               {{ states('binary_sensor.pir') 
                                                  in ['on', 'true', '1'] }}
                                         sequence:
                                           - service: light.turn_on
                                             target:
                                               entity_id: light.lamp
                                     default:
                                       - service: light.turn_off
                                         target:
                                           entity_id: light.lamp
```

### 1.7 Minimal UI

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ST for Home Assistant                                    [▶ Deploy] [⚙]│
├──────────────────────────────────────────────────────────────────────────┤
│  1 │ {mode: restart}                                                     │
│  2 │ {throttle: T#1s}                                                    │
│  3 │ PROGRAM Kitchen_Light                                               │
│  4 │ VAR                                                                 │
│  5 │   {trigger}                                                         │
│  6 │   motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';           │
│  7 │   light AT %Q* : BOOL := 'light.kitchen';                           │
│  8 │ END_VAR                                                             │
│  9 │                                                                     │
│ 10 │ IF motion THEN                                                      │
│ 11 │   light := TRUE;                                                    │
│ 12 │ ELSE                                                                │
│ 13 │   light := FALSE;                                                   │
│ 14 │ END_IF;                                                             │
│ 15 │                                                                     │
│ 16 │ END_PROGRAM                                                         │
├──────────────────────────────────────────────────────────────────────────┤
│  ✓ Syntax OK │ Triggers: 1 │ Mode: restart │ Throttle: 1s               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Core Features - Detailplan

### 2.1 Entity-Browser

**WebSocket Integration:**

```typescript
// entity-browser.ts
class EntityBrowser {
  private connection: HomeAssistantConnection;
  private entities: Map<string, EntityState>;
  
  async connect() {
    this.connection = await createConnection({ auth: getAuth() });
    
    subscribeEntities(this.connection, (entities) => {
      this.entities = entities;
      this.updateUI();
    });
  }
  
  getEntitiesByDomain(domain: string): EntityState[] {
    return Array.from(this.entities.values())
      .filter(e => e.entity_id.startsWith(domain + "."));
  }
  
  inferDataType(entityId: string): DataType {
    const domain = entityId.split('.')[0];
    const state = this.entities.get(entityId)?.state;
    
    if (['binary_sensor', 'switch', 'light', 'input_boolean'].includes(domain)) {
      return 'BOOL';
    }
    if (domain === 'input_number' || domain === 'number') {
      return 'REAL';
    }
    if (domain === 'sensor') {
      if (!isNaN(parseFloat(state))) return 'REAL';
      return 'STRING';
    }
    return 'STRING';
  }
  
  onDragStart(entityId: string, direction: "input" | "output"): string {
    const varName = this.entityIdToVarName(entityId);
    const dataType = this.inferDataType(entityId);
    const binding = direction === "input" ? "%I*" : "%Q*";
    
    return `${varName} AT ${binding} : ${dataType} := '${entityId}';`;
  }
}
```

**UI-Komponente:**

```
┌─────────────────────────────────┐
│  🔍 Filter entities...          │
├─────────────────────────────────┤
│  Domain: [All ▼]                │
├─────────────────────────────────┤
│ ▼ 💡 light (12)                 │
│   │ ○ light.kitchen        ON   │ ← Drag für Output
│   │ ○ light.bedroom        OFF  │
│                                 │
│ ▼ 📡 binary_sensor (8)          │
│   │ ● binary_sensor.motion ON   │ ← Drag für Input
│   │ ● binary_sensor.door   OFF  │
│                                 │
│ ▶ 🌡️ sensor (24)                │
│ ▶ 🔌 switch (6)                 │
│ ▶ 🎚️ input_boolean (3)          │
│ ▶ 🔢 input_number (2)           │
├─────────────────────────────────┤
│ [+ Create Helper]               │
└─────────────────────────────────┘

● = Input (read-only)
○ = Output (controllable)
```

### 2.2 Vollständiger Parser

**Operator-Precedence (IEC 61131-3):**

| Priorität | Operatoren |
|-----------|------------|
| 1 (höchste) | `()`, Funktionsaufruf |
| 2 | `NOT`, `-` (unär) |
| 3 | `*`, `/`, `MOD` |
| 4 | `+`, `-` |
| 5 | `<`, `>`, `<=`, `>=` |
| 6 | `=`, `<>` |
| 7 | `AND`, `&` |
| 8 | `XOR` |
| 9 (niedrigste) | `OR` |

### 2.3 Loop Safety Guards

```typescript
// loop-transpiler.ts
const MAX_ITERATIONS = 1000;

class LoopTranspiler {
  
  transpileWhile(stmt: WhileStatement, ctx: Context): HAAction {
    const safetyVar = `_loop_safety_${ctx.getUniqueId()}`;
    
    ctx.diagnostics.push({
      severity: "Warning",
      code: "W020",
      message: `WHILE loop has safety limit of ${MAX_ITERATIONS} iterations.`,
      location: stmt.location
    });
    
    return {
      variables: { [safetyVar]: 0 },
      repeat: {
        while: [
          { condition: "template", value_template: this.transpileExpr(stmt.condition) },
          { condition: "template", value_template: `{{ ${safetyVar} < ${MAX_ITERATIONS} }}` }
        ],
        sequence: [
          { variables: { [safetyVar]: `{{ ${safetyVar} + 1 }}` } },
          ...this.transpileStatements(stmt.body, ctx)
        ]
      }
    };
  }
  
  transpileFor(stmt: ForStatement, ctx: Context): HAAction {
    const iterations = this.calculateIterations(stmt);
    
    if (iterations > MAX_ITERATIONS) {
      ctx.diagnostics.push({
        severity: "Error",
        code: "E020",
        message: `FOR loop exceeds ${MAX_ITERATIONS} iterations (${iterations}).`,
        location: stmt.location
      });
    }
    
    return {
      repeat: {
        count: Math.min(iterations, MAX_ITERATIONS),
        sequence: this.transpileStatements(stmt.body, ctx)
      }
    };
  }
}
```

### 2.4 Golden Master Test Suite

```typescript
// tests/builtins.test.ts
describe('Built-in Functions', () => {
  
  const testRunner = new HATemplateTestRunner();
  
  describe('LIMIT', () => {
    const cases = [
      // Normal
      { args: [0, 5, 10], expected: 5 },
      { args: [0, -5, 10], expected: 0 },
      { args: [0, 15, 10], expected: 10 },
      // Edge cases
      { args: [0, 'unavailable', 10], expected: 0 },
      { args: [0, 'unknown', 10], expected: 0 },
      { args: [0, null, 10], expected: 0 },
      // Type coercion
      { args: [0, '5.5', 10], expected: 5.5 },
    ];
    
    cases.forEach(({ args, expected }) => {
      it(`LIMIT(${args.join(', ')}) = ${expected}`, async () => {
        const jinja = generator.generateBuiltin('LIMIT', args.map(String));
        const result = await testRunner.evaluate(jinja);
        expect(result).toBeCloseTo(expected);
      });
    });
  });
  
  // Weitere Built-ins...
});
```

---

## Phase 3: FB & Projekt-Struktur - Detailplan

### 3.1 Storage Analyzer

```typescript
// storage-analyzer.ts
enum StorageType {
  TRANSIENT,
  PERSISTENT,
  DERIVED
}

class StorageAnalyzer {
  
  analyzeVariable(varDecl: VariableDeclaration, usages: Usage[]): StorageDecision {
    
    // 1. Entity-gebunden → DERIVED
    if (varDecl.binding) {
      return { type: StorageType.DERIVED };
    }
    
    // 2. Explizite Pragmas
    if (varDecl.pragmas?.some(p => p.name === "persistent")) {
      return { type: StorageType.PERSISTENT, reason: "Explicit pragma" };
    }
    if (varDecl.pragmas?.some(p => p.name === "transient")) {
      return { type: StorageType.TRANSIENT, reason: "Explicit pragma" };
    }
    
    // 3. Automatische Erkennung
    const needsPersistence = 
      this.hasSelfReference(varDecl, usages) ||
      this.isFBInstance(varDecl) ||
      this.isTimerRelated(varDecl);
    
    if (needsPersistence) {
      return { 
        type: StorageType.PERSISTENT, 
        reason: "Auto-detected: self-reference or stateful FB" 
      };
    }
    
    return { type: StorageType.TRANSIENT };
  }
}
```

### 3.2 Helper Manager

```typescript
// helper-manager.ts
class HelperManager {
  
  async syncHelpers(project: STProject): Promise<SyncResult> {
    const required = this.analyzeRequiredHelpers(project);
    const existing = await this.findExistingSTHelpers();
    
    const toCreate = required.filter(h => !existing.has(h.id));
    const toDelete = [...existing.values()].filter(h => !required.has(h.id));
    const toUpdate = required.filter(h => this.needsUpdate(h, existing.get(h.id)));
    
    if (toDelete.length > 0) {
      return { status: "confirmation_required", toCreate, toDelete, toUpdate };
    }
    
    await this.applyChanges(toCreate, toDelete, toUpdate);
    return { status: "success" };
  }
  
  private getHelperId(project: string, program: string, variable: string): string {
    return `st_${project}_${program}_${variable}`.toLowerCase();
  }
}
```

### 3.3 Throttle/Debounce Generator

```typescript
// throttle-generator.ts
class ThrottleGenerator {
  
  generateThrottledAutomation(
    program: Program, 
    triggers: TriggerConfig[],
    throttle: Duration
  ): HAAutomation {
    
    const lastRunHelper = `input_datetime.st_${program.name}_last_run`;
    
    return {
      alias: `[ST] ${program.name}`,
      mode: "single",
      trigger: triggers,
      
      condition: [{
        condition: "template",
        value_template: `{{ 
          (now() - states('${lastRunHelper}') | as_datetime).total_seconds() 
          > ${throttle.seconds} 
        }}`
      }],
      
      action: [
        {
          service: "input_datetime.set_datetime",
          target: { entity_id: lastRunHelper },
          data: { datetime: "{{ now().isoformat() }}" }
        },
        {
          service: "script.turn_on",
          target: { entity_id: `script.st_${program.name}_logic` }
        }
      ]
    };
  }
  
  generateDebouncedAutomation(
    program: Program,
    triggers: TriggerConfig[], 
    debounce: Duration
  ): HAAutomation {
    
    return {
      alias: `[ST] ${program.name}`,
      mode: "restart",  // Restart = Debounce!
      trigger: triggers,
      
      action: [
        { delay: { seconds: debounce.seconds } },
        {
          service: "script.turn_on",
          target: { entity_id: `script.st_${program.name}_logic` }
        }
      ]
    };
  }
}
```

### 3.4 Projekt-Explorer UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ST for Home Assistant                              [▶ Deploy All] [⚙] [?] │
├────────────────────┬────────────────────────────────────────────────────────┤
│ 📁 Project         │  Kitchen_Automation.st                    [×]         │
│ ├─ 📂 Programs     ├────────────────────────────────────────────────────────┤
│ │  ├─ 📄 Kitchen   │  1 │ {mode: restart}                                   │
│ │  ├─ 📄 Bedroom   │  2 │ {throttle: T#1s}                                  │
│ │  └─ 📄 Garden    │  3 │ PROGRAM Kitchen_Automation                        │
│ ├─ 📂 FBs          │  4 │ VAR                                               │
│ │  ├─ 📄 FB_Motion │  5 │   {trigger}                                       │
│ │  ├─ 📄 FB_Dimmer │  6 │   motion AT %I* : BOOL                            │
│ │  └─ 📄 FB_Thermo │  7 │     := 'binary_sensor.kitchen_motion';            │
│ ├─ 📂 Functions    │  8 │                                                   │
│ │  └─ 📄 FC_Scale  │  9 │   {persistent}                                    │
│ └─ 📂 GVL          │ 10 │   counter : INT := 0;                             │
│    └─ 📄 Entities  │ 11 │                                                   │
│                    │ 12 │   mainLight AT %Q* : BOOL := 'light.kitchen';     │
│ ──────────────────│ 13 │ END_VAR                                           │
│ 🏠 Entities       │ 14 │                                                   │
│ ├─ 💡 Lights      │ 15 │ IF motion THEN                                    │
│ ├─ 📡 Sensors     │ 16 │   mainLight := TRUE;                              │
│ └─ 🔌 Switches    │ 17 │   counter := counter + 1;                         │
│                    │ 18 │ END_IF;                                           │
│ [+ New Program]    │ 19 │                                                   │
│ [+ New FB]         │ 20 │ END_PROGRAM                                       │
├────────────────────┼────────────────────────────────────────────────────────┤
│ Problems     │ Output     │ Helpers     │ Generated YAML                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ ✓ No problems found                                                         │
│ ℹ Triggers: 1 (motion) │ Mode: restart │ Throttle: 1s                       │
│ ℹ Persistent: 1 (counter → input_number.st_project_kitchen_counter)         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 4: Polish & Advanced - Detailplan

### 4.1 Timer-FB Transpiler

```typescript
// timer-transpiler.ts
class TimerTranspiler {
  
  transpileTON(instance: FBInstance, ctx: Context): TimerResult {
    const timerId = `timer.st_${ctx.program}_${instance.name}`;
    const outputId = `input_boolean.st_${ctx.program}_${instance.name}_q`;
    
    return {
      helpers: [
        { platform: "timer", id: timerId },
        { platform: "input_boolean", id: outputId }
      ],
      
      mainActions: [{
        choose: [
          {
            conditions: [
              { condition: "template", value_template: `{{ ${instance.inputs.IN} }}` },
              { condition: "state", entity_id: timerId, state: "idle" }
            ],
            sequence: [{
              service: "timer.start",
              target: { entity_id: timerId },
              data: { duration: this.timeToSeconds(instance.inputs.PT) }
            }]
          },
          {
            conditions: [
              { condition: "template", value_template: `{{ not ${instance.inputs.IN} }}` }
            ],
            sequence: [
              { service: "timer.cancel", target: { entity_id: timerId } },
              { service: "input_boolean.turn_off", target: { entity_id: outputId } }
            ]
          }
        ]
      }],
      
      additionalAutomation: {
        alias: `[ST] ${ctx.program} - ${instance.name} finished`,
        trigger: [{
          platform: "event",
          event_type: "timer.finished",
          event_data: { entity_id: timerId }
        }],
        condition: [{
          condition: "template",
          value_template: `{{ ${this.getEntityState(instance.inputs.IN)} }}`
        }],
        action: [{
          service: "input_boolean.turn_on",
          target: { entity_id: outputId }
        }]
      },
      
      outputMapping: {
        Q: `states('${outputId}') == 'on'`
      }
    };
  }
}
```

### 4.2 Deploy Manager (Transactional)

```typescript
// deploy-manager.ts
class DeployManager {
  
  async deploy(project: STProject): Promise<DeployResult> {
    const transaction: DeployTransaction = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      operations: [],
      status: 'pending'
    };
    
    try {
      // Phase 1: Validierung
      await this.validateAll(project);
      
      // Phase 2: Backup
      const backup = await this.backupManager.createBackup(project);
      
      // Phase 3: Änderungen berechnen
      const changes = await this.calculateChanges(project);
      transaction.operations = changes;
      
      // Phase 4: Anwenden mit Tracking
      for (const op of changes) {
        try {
          await this.applyOperation(op);
          op.status = 'applied';
        } catch (error) {
          await this.rollback(transaction);
          throw new DeployError(`Failed at ${op.entityId}`, transaction);
        }
      }
      
      // Phase 5: Verifikation
      const verification = await this.verifyDeployment(project);
      if (!verification.success) {
        await this.rollback(transaction);
        throw new DeployError(`Verification failed`, transaction);
      }
      
      // Phase 6: Commit
      transaction.status = 'committed';
      await this.saveTransaction(transaction);
      
      return { success: true, transactionId: transaction.id };
      
    } catch (error) {
      transaction.status = 'failed';
      await this.saveTransaction(transaction);
      throw error;
    }
  }
  
  async rollback(transaction: DeployTransaction): Promise<void> {
    const appliedOps = transaction.operations
      .filter(op => op.status === 'applied')
      .reverse();
    
    for (const op of appliedOps) {
      await this.revertOperation(op);
    }
    
    transaction.status = 'rolled_back';
  }
}
```

### 4.3 Source Maps & Error Mapping

```typescript
// source-map.ts
class SourceMapper {
  private map: Map<string, SourceMapEntry> = new Map();
  
  record(yamlPath: string, stLocation: SourceLocation): void {
    this.map.set(yamlPath, {
      st_file: stLocation.file,
      st_line: stLocation.line
    });
  }
  
  toJSON(): Record<string, SourceMapEntry> {
    return Object.fromEntries(this.map);
  }
}

// error-mapper.ts
class ErrorMapper {
  
  private translations: [RegExp, string][] = [
    [/UndefinedError: '(\w+)' is undefined/,
     "Variable '$1' nicht deklariert oder Entity nicht gefunden"],
    [/could not convert string to float/,
     "Sensor-Wert ist kein gültiger Zahlenwert (evtl. 'unavailable')"],
  ];
  
  async mapError(haError: HALogEntry): Promise<MappedError | null> {
    const automationId = this.extractAutomationId(haError);
    if (!automationId?.startsWith('st_')) return null;
    
    const sourceMap = await this.loadSourceMap(automationId);
    const yamlPath = this.extractYamlPath(haError);
    const stLocation = sourceMap?.[yamlPath];
    
    return {
      originalError: haError.message,
      translatedError: this.translate(haError.message),
      stFile: stLocation?.st_file,
      stLine: stLocation?.st_line
    };
  }
}
```

### 4.4 Restore Policy & Migration

```typescript
// restore-handler.ts
enum RestorePolicy {
  RESTORE_OR_INIT,
  ALWAYS_INIT,
  REQUIRE_RESTORE
}

class RestoreHandler {
  
  getPolicy(varDecl: VariableDeclaration): RestorePolicy {
    if (varDecl.pragmas?.some(p => p.name === "reset_on_restart")) {
      return RestorePolicy.ALWAYS_INIT;
    }
    if (varDecl.pragmas?.some(p => p.name === "require_restore")) {
      return RestorePolicy.REQUIRE_RESTORE;
    }
    return RestorePolicy.RESTORE_OR_INIT;
  }
}

// migration-handler.ts
class MigrationHandler {
  
  detectIssues(oldSchema: VarSchema[], newSchema: VarSchema[]): MigrationIssue[] {
    const issues: MigrationIssue[] = [];
    
    for (const oldVar of oldSchema) {
      const newVar = newSchema.find(v => v.name === oldVar.name);
      
      if (!newVar) {
        issues.push({
          type: 'removed',
          variable: oldVar.name,
          options: [
            { id: 'delete', label: 'Delete helper' },
            { id: 'keep', label: 'Keep (orphaned)' }
          ]
        });
        continue;
      }
      
      if (oldVar.dataType !== newVar.dataType) {
        issues.push({
          type: 'type_change',
          variable: oldVar.name,
          details: `${oldVar.dataType} → ${newVar.dataType}`,
          options: [
            { id: 'convert', label: 'Convert value' },
            { id: 'reset', label: 'Reset to initial' }
          ]
        });
      }
    }
    
    return issues;
  }
}
```

### 4.5 Live-Werte / Online-Modus

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Kitchen_Automation.st                          [● ONLINE] [⏸ Pause]    │
├──────────────────────────────────────────────────────────────────────────┤
│  1 │ {mode: restart}                                                     │
│  2 │ {throttle: T#1s}                                                    │
│  3 │ PROGRAM Kitchen_Automation                                          │
│  4 │ VAR                                                                 │
│  5 │   {trigger}                                                         │
│  6 │   motion AT %I* : BOOL := '...';            │ TRUE  │ ← Live       │
│  7 │   temperature AT %I* : REAL := '...';       │ 21.5  │              │
│  8 │                                                                     │
│  9 │   {persistent}                                                      │
│ 10 │   counter : INT := 0;                       │ 42    │              │
│ 11 │                                                                     │
│ 12 │   mainLight AT %Q* : BOOL := '...';         │ TRUE  │              │
│ 13 │ END_VAR                                                             │
│ 14 │                                                                     │
│ 15 │ IF motion THEN  ─────────────────────────▶  │ TRUE  │              │
│ 16 │   mainLight := TRUE;                                                │
│ 17 │   counter := counter + 1;                                           │
│ 18 │ END_IF;                                                             │
│ 19 │                                                                     │
│ 20 │ END_PROGRAM                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Pragma-Referenz

### Trigger-Kontrolle
| Pragma | Kontext | Beschreibung |
|--------|---------|--------------|
| `{trigger}` | Variable | Entity-Änderung löst Automation aus |
| `{no_trigger}` | Variable | Entity wird gelesen, löst aber nicht aus |

### Persistenz
| Pragma | Kontext | Beschreibung |
|--------|---------|--------------|
| `{persistent}` | Variable | Wert wird in Helper gespeichert |
| `{transient}` | Variable | Wert nur während Run (default) |
| `{reset_on_restart}` | Variable | Immer Initialwert nach HA-Restart |
| `{require_restore}` | Variable | Fehler wenn kein gespeicherter Wert |

### Concurrency & Throttling
| Pragma | Kontext | Beschreibung | Default |
|--------|---------|--------------|---------|
| `{mode: restart\|single\|queued\|parallel}` | Program | Script-Ausführungsmodus | `restart` |
| `{max_queued: N}` | Program | Max Queue-Größe (bei `queued`) | `10` |
| `{max_parallel: N}` | Program | Max parallele Instanzen | `3` |
| `{throttle: TIME}` | Program | Min. Zeit zwischen Ausführungen | - |
| `{debounce: TIME}` | Program | Warte auf Ruhe vor Ausführung | - |

---

## Risiken & Mitigationen

| Risiko | Status | Mitigation |
|--------|--------|------------|
| Zyklus vs Event | 🟢 Gelöst | Dependency Analysis + Trigger-Pragmas |
| State Persistenz | 🟢 Gelöst | Tiered Storage + Auto-Cleanup + Pragmas |
| Timer-Komplexität | 🟡 Mittel | Timer-Entity Pattern + separate Automations |
| Loop-Blockierung | 🟢 Gelöst | Safety Guards + Compiler-Warnings |
| Jinja-Fallen | 🟢 Gelöst | Defensive Generation + Golden Master Tests |
| Debugging | 🟢 Gelöst | Source Maps + Error Translation |
| Restart-Semantik | 🟢 Gelöst | Explizite Pragmas + Migration UI |
| Trigger-Stürme | 🟢 Gelöst | Throttle/Debounce Pragmas |
| Race Conditions | 🟢 Gelöst | Mode-Strategie (default: restart) |
| Deploy-Inkonsistenz | 🟢 Gelöst | Transactional Deploy + Rollback + Backup |
| Parser-Komplexität | 🟡 Mittel | Iterativ erweitern, mit Minimum starten |
| **YAML-Datei-Manipulation** | 🟢 Gelöst | **NUR HA Storage API verwenden** |
| **Throttle-Helper leer** | 🟢 Gelöst | **Fallback in Template + Init bei Deploy** |
| **Parser-Wahl** | 🟡 Offen | **Im Spike evaluieren (Chevrotain vs Nearley)** |

---

## Ressourcen & Links

**Parser:**
- Chevrotain: https://chevrotain.io/
- Nearley.js: https://nearley.js.org/
- IEC 61131-3 Grammatik-Referenz

**CodeMirror 6:**
- Dokumentation: https://codemirror.net/
- Language Support: https://codemirror.net/examples/lang-package/

**Home Assistant:**
- WebSocket API: https://developers.home-assistant.io/docs/api/websocket
- Custom Panels: https://developers.home-assistant.io/docs/frontend/custom-ui/creating-custom-panels
- HACS: https://hacs.xyz/docs/publish/start

**Referenz-Projekte:**
- CAFE: https://github.com/FezVrasta/cafe-hass
- HA Frontend: https://github.com/home-assistant/frontend

---

## Nächste Schritte

1. **Repository erstellen** mit Basis-Struktur
2. **Dev-Environment aufsetzen** (Node, Python, HA Dev Container)
3. **CodeMirror 6 Spike** - ST Syntax-Highlighting PoC
4. **Parser Spike** - Minimaler IF/THEN Parser mit Chevrotain
5. **Dependency Analyzer Spike** - Automatische Trigger-Erkennung
