import cron from 'node-cron';
import { syncAllJobs } from '../services/jobSyncService.js';

/**
 * Initialize automatic background job synchronization
 */
export const initJobSyncCron = () => {
  // Default: every 6 hours ("0 */6 * * *"). Can be overridden in .env
  const cronExpression = process.env.SYNC_CRON_SCHEDULE || '0 */6 * * *';

  console.log(`[JobNexa Cron] Initializing real-time job sync schedule: "${cronExpression}"`);

  // Schedule recurring cron job
  cron.schedule(cronExpression, async () => {
    console.log(`[JobNexa Cron] Running scheduled job synchronization at ${new Date().toISOString()}...`);
    try {
      await syncAllJobs();
    } catch (err) {
      console.error('[JobNexa Cron Error] Failed to complete scheduled synchronization:', err.message);
    }
  });

  // Run initial lightweight sync 4 seconds after server boot if external sync enabled
  if (process.env.AUTO_SYNC_ON_START !== 'false') {
    setTimeout(async () => {
      console.log('[JobNexa Cron] Performing initial startup job synchronization...');
      try {
        await syncAllJobs({ limitPerSource: 25, triggerNotifications: false });
      } catch (err) {
        console.warn('[JobNexa Cron] Startup sync notice:', err.message);
      }
    }, 4000);
  }
};

export default initJobSyncCron;
