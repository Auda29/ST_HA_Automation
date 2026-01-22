# E2E Tests

End-to-end tests for the ST for Home Assistant integration.

## Overview

These tests verify the complete workflow from writing ST code through deployment and execution in a real Home Assistant Docker environment.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+
- Home Assistant test container (see `docker-compose.test.yml`)

## Test Files

- **deploy.spec.ts**: Tests the full deploy workflow (Parse → Analyze → Transpile → Deploy) and rollback functionality
- **automation.spec.ts**: Tests automation execution, persistent variables, and timer function blocks
- **online-mode.spec.ts**: Tests online mode functionality and live entity value display

## Running Tests

### Local Development

```bash
# Ensure HA container is running
docker-compose -f ../../docker-compose.test.yml up -d

# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/deploy.spec.ts
```

### CI/CD

E2E tests run automatically on push/PR to `main` and `dev` branches via GitHub Actions (`.github/workflows/e2e.yml`).

## Test Setup

Tests use a real Home Assistant Docker container for authentic E2E testing. The setup process:

1. **Global Setup** (`setup.ts`): Ensures HA container is running and ready
2. **Test Execution**: Tests run against the real HA instance
3. **Global Teardown** (`teardown.ts`): Optional cleanup (container kept running by default for faster re-runs)

## Test Fixtures

The `fixtures.ts` file provides:
- Pre-configured test entities (from `docs/test_environment.md`)
- Authentication utilities
- Entity state management helpers
- State change waiting utilities

## Configuration

Test configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:8123` (configurable via `HA_URL` env var)
- Single worker to avoid HA connection conflicts
- Sequential test execution to avoid state conflicts
- Screenshots and videos on failure

## Troubleshooting

### Tests fail with "Cannot find module"

Run `npm install` to ensure all dependencies are installed.

### Browser not found

Run `npx playwright install chromium` to install Playwright browsers.

### Home Assistant not ready

- Check container is running: `docker ps | grep ha-test`
- Check logs: `docker-compose -f ../../docker-compose.test.yml logs`
- Wait longer: Increase timeout in `setup.ts` or wait manually

### Authentication fails

- Verify credentials in `fixtures.ts` match your HA test instance
- Check HA is fully initialized (may take 1-2 minutes on first start)

### Port already in use

The HA container uses port 8123. If it's in use:
- Stop conflicting container: `docker stop <container-name>`
- Or modify `docker-compose.test.yml` to use a different port

## Writing New Tests

When adding new E2E tests:

1. Create test file in `frontend/e2e/`
2. Use fixtures from `fixtures.ts` for HA interaction
3. Use pre-configured test entities from `TEST_ENTITIES`
4. Follow existing test patterns for consistency
5. Ensure tests are independent and can run in any order
6. Clean up any state changes after tests

## Test Entities

Pre-configured entities are available for testing (see `docs/test_environment.md`):
- Input booleans: `test_schalter_1`, `test_schalter_2`, etc.
- Input numbers: `helligkeitsstufe`, `lautstaerke`, `ziel_temperatur`
- Lights: `wohnzimmer_deckenlampe`
- Switches: `steckdose_kueche`, `steckdose_wohnzimmer`
- Scenes: `alles_aus`, `gemuetlich`, `kino`, `party`

Use these in tests via `TEST_ENTITIES` constant from `fixtures.ts`.
