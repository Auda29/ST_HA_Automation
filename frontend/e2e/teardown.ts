/**
 * Global teardown for E2E tests
 * 
 * Cleanup after all tests complete
 */

export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Cleaning up E2E test environment...');
  
  // Optionally stop HA container (commented out to keep it running for faster re-runs)
  // if (process.env.STOP_HA_AFTER_TESTS === 'true') {
  //   try {
  //     execSync('docker-compose -f ../../docker-compose.test.yml stop', { stdio: 'inherit' });
  //   } catch (error) {
  //     console.warn('Could not stop HA container:', error);
  //   }
  // }
  
  console.log('✅ E2E test environment cleanup complete');
}
