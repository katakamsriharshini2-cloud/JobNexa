import connectDB from '../config/db.js';
import Job from '../models/Job.js';
import { syncAllJobs } from '../services/jobSyncService.js';
import { normalizeLocation, normalizeSalaryINR } from '../utils/deduplicateJobs.js';

const INDIAN_HUBS = ['Hyderabad', 'Bengaluru', 'Mumbai', 'Chennai', 'Warangal', 'Pune', 'Delhi NCR'];

async function runMigration() {
  await connectDB();
  console.log('[India Migration] Updating all existing jobs to India tech hubs...');

  try {
    await Job.collection.dropIndex('source_1_externalId_1');
    console.log('[India Migration] Dropped old source_1_externalId_1 index.');
  } catch (e) {
    // index might not exist
  }

  // Ensure index is created with partial filter
  await Job.syncIndexes();

  const allJobs = await Job.find();
  for (let i = 0; i < allJobs.length; i++) {
    const job = allJobs[i];
    const locInfo = normalizeLocation(job.location, job.isRemote, job.title || String(i));
    job.city = locInfo.city;
    job.country = 'India';
    job.location = locInfo.location;
    job.salaryRange = normalizeSalaryINR(job.salaryRange, job.category);
    await job.save();
  }

  console.log(`[India Migration] Normalized ${allJobs.length} existing jobs to India.`);

  console.log('[India Migration] Running full sync to populate Indian tech hubs...');
  const syncResult = await syncAllJobs({ limitPerSource: 50, triggerNotifications: false });
  console.log('[India Migration] Sync Result:', syncResult.sourceStats);

  // Print counts by Indian tech hub
  const hubCounts = {};
  for (const hub of INDIAN_HUBS) {
    hubCounts[hub] = await Job.countDocuments({
      $or: [{ city: new RegExp(hub, 'i') }, { location: new RegExp(hub, 'i') }],
    });
  }
  const remoteCount = await Job.countDocuments({ isRemote: true });
  const totalCount = await Job.countDocuments();

  console.log('====================================================');
  console.log('JOBNEXA 100% INDIA TECH JOBS SUMMARY:');
  console.log('Total Jobs in India:', totalCount);
  console.log('City Breakdown:');
  Object.entries(hubCounts).forEach(([city, count]) => {
    console.log(`  • ${city}: ${count} jobs`);
  });
  console.log(`  • Remote in India: ${remoteCount} jobs`);
  console.log('====================================================');

  process.exit(0);
}

runMigration().catch((err) => {
  console.error('[India Migration Error]:', err);
  process.exit(1);
});
