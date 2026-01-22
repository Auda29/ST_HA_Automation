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

### Using Docker Compose (Recommended for E2E Tests)

```bash
# Start the container using docker-compose
docker-compose -f docker-compose.test.yml up -d

# Check container status
docker-compose -f docker-compose.test.yml ps

# View logs
docker-compose -f docker-compose.test.yml logs -f
```

### Using Docker Directly

```bash
# Start the container
docker start ha-test

# Or create a new container if it doesn't exist
docker run -d \
  --name ha-test \
  -p 8123:8123 \
  -v ha-test-data:/config \
  --restart unless-stopped \
  homeassistant/home-assistant:stable
```

### Waiting for Home Assistant to be Ready

After starting the container, wait for Home Assistant to be fully ready:

```bash
# Wait for API to be available
until curl -f http://localhost:8123/api/; do
  echo "Waiting for Home Assistant..."
  sleep 5
done
```

Or use the health check:

```bash
docker-compose -f docker-compose.test.yml ps
# Wait until health status shows "healthy"
```

## Stopping the Test Environment

```bash
# Using docker-compose
docker-compose -f docker-compose.test.yml stop

# Or using Docker directly
docker stop ha-test
```

## E2E Test Setup

For running E2E tests, the environment is automatically set up by Playwright's global setup:

```bash
cd frontend
npm run test:e2e
```

The setup script (`frontend/e2e/setup.ts`) will:
1. Check if HA container is running
2. Start it if needed using `docker-compose.test.yml`
3. Wait for HA to be ready before running tests

### Environment Variables

You can customize the test environment using environment variables:

- `HA_URL`: Home Assistant URL (default: `http://localhost:8123`)
- `HA_USERNAME`: Test account username (default: `testadmin`)
- `HA_PASSWORD`: Test account password (default: `TestHA2024!`)
- `SKIP_HA_START`: Set to `true` to skip automatic container startup
- `STOP_HA_AFTER_TESTS`: Set to `true` to stop container after tests complete
