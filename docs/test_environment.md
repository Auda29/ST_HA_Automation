# Test Environment - Home Assistant

## Local Home Assistant Instance

**Docker Container:** `ha-test`
**URL (Host):** http://localhost:8123
**URL (from Docker):** http://host.docker.internal:8123

## Test Account Credentials

| Field    | Value          |
|----------|----------------|
| Name     | Test Admin     |
| Username | testadmin      |
| Password | TestHA2024!    |

## Configuration

- **Location:** Berlin, Germany
- **Language:** English
- **Analytics:** Disabled (all options)

## Pre-configured Entities

The test instance comes with pre-configured entities from this repository:

### Helpers (input_*)
- `input_text.benachrichtigung` - Notification text
- `input_text.benutzer_notiz` - User note
- `input_boolean.gastmodus` - Guest mode toggle
- `input_select.hausmodus` - House mode (Zuhause, Abwesend, Urlaub, Nacht, Gäste)
- `input_number.helligkeitsstufe` - Brightness level (0-100%)
- `input_select.klimamodus` - Climate mode (auto, heat, cool, off)
- `input_number.lautstaerke` - Volume (0-100%)
- `input_select.lichtszene` - Light scene (Normal, Gemütlich, Kino, Party, Konzentration)
- `input_boolean.nachtmodus` - Night mode toggle
- `input_boolean.test_schalter_1` - Test switch 1
- `input_boolean.test_schalter_2` - Test switch 2
- `input_boolean.urlaubsmodus` - Vacation mode toggle
- `input_number.ziel_temperatur` - Target temperature (16.0 °C default)

### Lights (light.*)
- `light.wohnzimmer_deckenlampe` - Living room ceiling light

### Scenes (scene.*)
- `scene.alles_aus` - Everything off
- `scene.gemuetlich` - Cozy
- `scene.kino` - Cinema
- `scene.party` - Party

### Switches (switch.*)
- `switch.steckdose_kueche` - Kitchen outlet
- `switch.steckdose_wohnzimmer` - Living room outlet

### Weather
- Weather forecast for Home location

## Starting the Test Environment

```bash
# Start the container
docker start ha-test

# Or using docker-compose (if available)
docker-compose up -d
```

## Stopping the Test Environment

```bash
docker stop ha-test
```
