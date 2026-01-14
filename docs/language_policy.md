## Language Policy

This repository is maintained primarily in **English**. The goal of this policy is to ensure that all
code, tests, and user-facing text are consistently understandable for an international audience, while
still allowing **intentional German examples** where they are part of the product behavior.

### Scope

- **Must be English** (no unintended German):
  - Source code (`frontend/**`, `custom_components/**`)
  - Tests (`tests/**`)
  - UI strings and labels
  - `README.md`
  - CI messages and commit messages
- **May contain intentional German text (documented below)**:
  - Historical / design documentation
  - Example error messages that are _supposed_ to be shown to users in German

### Intentional German Documents

The following documents intentionally contain German prose or examples:

- `docs/00_Project_Overview.md` – original high‑level project description for the (German‑speaking) team
- `docs/ST_HomeAssistant_Projektplan_final.md` – project plan in German
- `docs/archive/*.md` – archived spike documents and analyses in their original language

These are considered **intentional** and are therefore excluded from the “no German” requirement.
Any new, non‑historical documentation should be written in English by default.

### How to Check for Unintended German

When working on T‑017 or future language‑cleanup tasks, use these commands from the repo root:

```bash
# 1) Find umlauts / sharp‑s in non‑docs files
rg "[ÄÖÜäöüß]" . \
  --glob '!docs/**'

# 2) Heuristic search for common German words in non‑docs files
rg "\b(nicht|und|oder|aber|werden|sollte|kann|muss|dürfen)\b" . \
  -i \
  --glob '!docs/**'
```

If any matches show up in code, tests, UI strings, or other English‑only areas, they should either:

1. Be **translated to English**, or  
2. Be explicitly documented as intentional German (for example, when adding localized error messages).

### Adding New German Text

If you need to add German text (for example, localized HA error explanations):

1. Keep the **implementation, comments, and API** in English.
2. Restrict German to the **user‑visible copy** or example blocks.
3. Add a short note to the relevant doc (or to this file) that this German text is **intentional**.

