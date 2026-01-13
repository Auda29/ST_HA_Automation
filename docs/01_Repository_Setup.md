# Task: Repository-Setup für ST for Home Assistant

## Kontext

Du erstellst die initiale Repository-Struktur für "ST for Home Assistant" - eine HACS-Integration, die Structured Text (IEC 61131-3) nach Home Assistant Automationen transpiliert.

**Projektpfad:** `C:\##\Projects\ST_HA_Automation`

## Ziel

Erstelle ein vollständiges, funktionsfähiges Repository mit:
- HACS-kompatible Custom Component Struktur
- Frontend Build-Pipeline (TypeScript + Vite)
- Entwicklungsumgebung-Konfiguration
- Basis-Dokumentation

---

## Repository-Struktur

```
ST_HA_Automation/
├── custom_components/
│   └── st_hass/
│       ├── __init__.py
│       ├── manifest.json
│       ├── config_flow.py
│       ├── const.py
│       ├── strings.json
│       ├── translations/
│       │   └── en.json
│       └── frontend/
│           └── .gitkeep
├── frontend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── editor/
│   │   │   └── .gitkeep
│   │   ├── parser/
│   │   │   └── .gitkeep
│   │   ├── analyzer/
│   │   │   └── .gitkeep
│   │   ├── transpiler/
│   │   │   └── .gitkeep
│   │   ├── deploy/
│   │   │   └── .gitkeep
│   │   └── panel/
│   │       └── st-panel.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .eslintrc.json
├── tests/
│   ├── frontend/
│   │   └── .gitkeep
│   └── integration/
│       └── .gitkeep
├── docs/
│   └── .gitkeep
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── .editorconfig
├── hacs.json
├── README.md
└── LICENSE
```

---

## Datei-Inhalte

### custom_components/st_hass/manifest.json

```json
{
  "domain": "st_hass",
  "name": "ST for Home Assistant",
  "version": "0.1.0",
  "documentation": "https://github.com/OWNER/st-hass",
  "issue_tracker": "https://github.com/OWNER/st-hass/issues",
  "dependencies": [],
  "codeowners": ["@OWNER"],
  "requirements": [],
  "iot_class": "local_push",
  "config_flow": true
}
```

### custom_components/st_hass/__init__.py

```python
"""ST for Home Assistant - Structured Text to HA Automations."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components import frontend

from .const import DOMAIN, PANEL_URL, PANEL_TITLE, PANEL_ICON

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the ST for Home Assistant component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ST for Home Assistant from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    
    # Register frontend panel
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "st-panel",
                "embed_iframe": False,
                "trust_external": False,
                "module_url": "/st_hass/frontend/st-panel.js",
            }
        },
        require_admin=True,
    )
    
    # Register static path for frontend files
    hass.http.register_static_path(
        "/st_hass/frontend",
        str(Path(__file__).parent / "frontend"),
        cache_headers=False,
    )
    
    _LOGGER.info("ST for Home Assistant setup complete")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    frontend.async_remove_panel(hass, PANEL_URL)
    _LOGGER.info("ST for Home Assistant unloaded")
    return True
```

### custom_components/st_hass/const.py

```python
"""Constants for ST for Home Assistant."""

DOMAIN = "st_hass"
PANEL_URL = "st-hass"
PANEL_TITLE = "ST Editor"
PANEL_ICON = "mdi:file-code"
VERSION = "0.1.0"
```

### custom_components/st_hass/config_flow.py

```python
"""Config flow for ST for Home Assistant."""
from __future__ import annotations

from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN


class STHassConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for ST for Home Assistant."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        
        if user_input is not None:
            return self.async_create_entry(
                title="ST for Home Assistant", 
                data={}
            )
        
        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow."""
        return STHassOptionsFlow(config_entry)


class STHassOptionsFlow(config_entries.OptionsFlow):
    """Handle options."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        return self.async_show_form(step_id="init")
```

### custom_components/st_hass/strings.json

```json
{
  "config": {
    "step": {
      "user": {
        "title": "ST for Home Assistant",
        "description": "Adds a Structured Text editor for creating Home Assistant automations."
      }
    },
    "abort": {
      "single_instance_allowed": "Only a single instance is allowed."
    }
  }
}
```

### frontend/package.json

```json
{
  "name": "st-hass-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:watch": "vite build --watch",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest --run"
  },
  "dependencies": {
    "@codemirror/autocomplete": "^6.12.0",
    "@codemirror/commands": "^6.3.3",
    "@codemirror/language": "^6.10.1",
    "@codemirror/lint": "^6.5.0",
    "@codemirror/search": "^6.5.5",
    "@codemirror/state": "^6.4.1",
    "@codemirror/view": "^6.26.0",
    "@lezer/highlight": "^1.2.0",
    "chevrotain": "^11.0.3",
    "codemirror": "^6.0.1",
    "home-assistant-js-websocket": "^9.1.0",
    "lit": "^3.1.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^8.56.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "vitest": "^1.2.2"
  }
}
```

### frontend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "experimentalDecorators": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### frontend/vite.config.ts

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'STHass',
      fileName: 'st-panel',
      formats: ['es'],
    },
    outDir: '../custom_components/st_hass/frontend',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
      },
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

### frontend/src/index.ts

```typescript
/**
 * ST for Home Assistant - Frontend Entry Point
 */
import './panel/st-panel';

console.log('ST for Home Assistant loaded');
```

### frontend/src/panel/st-panel.ts

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('st-panel')
export class STPanel extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @property({ type: Boolean }) public narrow = false;
  
  @state() private _code: string = `{mode: restart}
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

END_PROGRAM`;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--primary-background-color);
    }
    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--app-header-background-color);
      color: var(--app-header-text-color);
      border-bottom: 1px solid var(--divider-color);
    }
    .toolbar h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    .editor-container {
      flex: 1;
      overflow: auto;
      padding: 16px;
    }
    .editor {
      width: 100%;
      height: 100%;
      min-height: 400px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 14px;
      padding: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      resize: none;
    }
    .status-bar {
      display: flex;
      gap: 16px;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border-top: 1px solid var(--divider-color);
      font-size: 12px;
    }
    .status-ok { color: var(--success-color, #4caf50); }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <div class="container">
        <div class="toolbar">
          <h1>ST for Home Assistant</h1>
          <button @click=${this._handleDeploy}>▶ Deploy</button>
        </div>
        <div class="editor-container">
          <textarea class="editor" .value=${this._code} @input=${this._handleCodeChange} spellcheck="false"></textarea>
        </div>
        <div class="status-bar">
          <span class="status-ok">✓ Syntax OK</span>
          <span>Triggers: 1</span>
          <span>Entities: 2</span>
        </div>
      </div>
    `;
  }

  private _handleCodeChange(e: Event) {
    this._code = (e.target as HTMLTextAreaElement).value;
  }

  private _handleDeploy() {
    console.log('Deploy:', this._code);
  }
}
```

### hacs.json

```json
{
  "name": "ST for Home Assistant",
  "render_readme": true
}
```

### .gitignore

```
node_modules/
__pycache__/
*.py[cod]
dist/
custom_components/st_hass/frontend/*.js
custom_components/st_hass/frontend/*.map
.idea/
.vscode/
*.swp
.DS_Store
coverage/
.env
*.log
```

---

## Ausführungsschritte

```bash
cd "C:\##\Projects\ST_HA_Automation"

# Verzeichnisse erstellen
mkdir -p custom_components/st_hass/frontend
mkdir -p custom_components/st_hass/translations
mkdir -p frontend/src/{editor,parser,analyzer,transpiler,deploy,panel}
mkdir -p tests/{frontend,integration}
mkdir -p .github/workflows

# Dateien erstellen (wie oben definiert)

# Git initialisieren
git init

# Frontend setup
cd frontend
npm install
npm run build

# Commit
cd ..
git add .
git commit -m "Initial repository setup"
```

---

## Erfolgskriterien

- [ ] Alle Dateien und Verzeichnisse existieren
- [ ] `npm install` erfolgreich
- [ ] `npm run build` erstellt `st-panel.js`
- [ ] `npm run typecheck` ohne Fehler
- [ ] manifest.json ist HACS-valide
- [ ] Panel erscheint in HA Sidebar nach Installation

---

## Nicht in diesem Task

- CodeMirror Integration (→ 02_CodeMirror_Spike.md)
- Parser Implementation (→ 03_Parser_Spike.md)
- Transpiler Logic
- WebSocket Entity-Kommunikation

---

## ⚠️ Wichtige Design-Entscheidungen (für spätere Tasks)

### Deploy-Mechanismus: NUR über HA-APIs!

**NIEMALS** direkt YAML-Dateien editieren (`automations.yaml`, `scripts.yaml`).

**Stattdessen:**
```typescript
// Automation über HA Storage API
await hass.callWS({
  type: 'config/automation/config',
  automation_id: 'st_kitchen',
  config: { ... }
});

// Helper über Services
await hass.callService('input_number', 'create', { ... });

// Reload nach Änderungen
await hass.callService('automation', 'reload', {});
```

**Warum:**
- HA trackt Änderungen korrekt
- Keine Konflikte mit User-Editierungen  
- Rollback möglich
- Keine Race Conditions mit HA-Core
