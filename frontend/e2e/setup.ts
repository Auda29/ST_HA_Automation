/**
 * Global setup for E2E tests
 * 
 * Ensures Home Assistant Docker container is running and ready
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HA_URL = process.env.HA_URL || 'http://localhost:8123';
const HA_USERNAME = process.env.HA_USERNAME || 'testadmin';
const HA_PASSWORD = process.env.HA_PASSWORD || 'TestHA2024!';

async function checkHAHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${HA_URL}/api/`);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForHA(maxAttempts = 30, delayMs = 2000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkHAHealth()) {
      console.log('✅ Home Assistant is ready');
      return;
    }
    console.log(`⏳ Waiting for Home Assistant... (${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error('Home Assistant did not become ready in time');
}

async function startHAContainer(): Promise<void> {
  const composeFile = join(__dirname, '../../docker-compose.test.yml');
  if (!existsSync(composeFile)) {
    console.warn('⚠️  docker-compose.test.yml not found, assuming HA is already running');
    return;
  }

  try {
    // Check if container is already running
    execSync('docker ps --filter name=ha-test --format "{{.Names}}"', { encoding: 'utf-8' });
    const isRunning = execSync('docker ps --filter name=ha-test --format "{{.Names}}"', { encoding: 'utf-8' })
      .trim()
      .includes('ha-test');
    
    if (isRunning) {
      console.log('✅ HA container is already running');
      return;
    }

    console.log('🚀 Starting HA container...');
    execSync(`docker-compose -f ${composeFile} up -d`, { stdio: 'inherit' });
    
    // Wait for container to be healthy
    await waitForHA();
  } catch (error) {
    console.warn('⚠️  Could not start HA container, assuming it is already running:', error);
  }
}

export default async function globalSetup(): Promise<void> {
  console.log('🔧 Setting up E2E test environment...');
  
  // Start HA container if needed
  if (process.env.SKIP_HA_START !== 'true') {
    await startHAContainer();
  }
  
  // Wait for HA to be ready
  await waitForHA();
  
  console.log('✅ E2E test environment ready');
}
