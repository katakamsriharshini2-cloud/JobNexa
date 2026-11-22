import Job from '../models/Job.js';
import JobAlert from '../models/JobAlert.js';
import Notification from '../models/Notification.js';
import { fetchArbeitnowJobs } from './arbeitnowService.js';
import { fetchRemotiveJobs } from './remotiveService.js';
import { fetchAdzunaJobs } from './adzunaService.js';
import { fetchJoobleJobs } from './joobleService.js';
import { getCuratedIndianJobs } from './indianTechJobsService.js';
import { deduplicateJobBatch } from '../utils/deduplicateJobs.js';
import { calculateJobMatch } from '../utils/calculateJobMatch.js';

/**
 * Coordinate multi-source job synchronization
 * @param {Object} options { limitPerSource: number, triggerNotifications: boolean }
 * @returns {Promise<Object>} Synchronization metrics
 */
export const syncAllJobs = async (options = {}) => {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('[JobNexa Sync Engine] Starting real-time job synchronization...');
  console.log('====================================================');

  const { limitPerSource = 50, triggerNotifications = true } = options;

  // 1. Fetch from all sources in parallel
  const [arbeitnowRes, remotiveRes, adzunaRes, joobleRes] = await Promise.allSettled([
    fetchArbeitnowJobs(limitPerSource),
    fetchRemotiveJobs(limitPerSource),
    fetchAdzunaJobs(),
    fetchJoobleJobs(),
  ]);

  const rawJobs = [];
  const sourceStats = {
    arbeitnow: arbeitnowRes.status === 'fulfilled' ? arbeitnowRes.value.length : 0,
    remotive: remotiveRes.status === 'fulfilled' ? remotiveRes.value.length : 0,
    adzuna: adzunaRes.status === 'fulfilled' ? adzunaRes.value.length : 0,
    jooble: joobleRes.status === 'fulfilled' ? joobleRes.value.length : 0,
  };

  if (arbeitnowRes.status === 'fulfilled') rawJobs.push(...arbeitnowRes.value);
  if (remotiveRes.status === 'fulfilled') rawJobs.push(...remotiveRes.value);
  if (adzunaRes.status === 'fulfilled') rawJobs.push(...adzunaRes.value);
  if (joobleRes.status === 'fulfilled') rawJobs.push(...joobleRes.value);

  // Guarantee high-volume Indian tech hub vacancies
  const curatedIndianJobs = getCuratedIndianJobs();
  rawJobs.push(...curatedIndianJobs);
  sourceStats.indianTechHubs = curatedIndianJobs.length;

  console.log(`[JobNexa Sync Engine] Total raw jobs gathered: ${rawJobs.length}`);

  // 2. In-memory deduplication
  const uniqueJobs = deduplicateJobBatch(rawJobs);
  console.log(`[JobNexa Sync Engine] Unique jobs after deduplication: ${uniqueJobs.length}`);

  if (uniqueJobs.length === 0) {
    return {
      success: true,
      message: 'No external jobs fetched during this cycle.',
      sourceStats,
      timeTakenMs: Date.now() - startTime,
    };
  }

  // 3. Upsert to MongoDB using bulkWrite
  const bulkOps = uniqueJobs.map((job) => ({
    updateOne: {
      filter: { source: job.source, externalId: job.externalId },
      update: { $set: job },
      upsert: true,
    },
  }));

  const bulkResult = await Job.bulkWrite(bulkOps, { ordered: false });
  console.log(`[JobNexa Sync Engine] BulkWrite Result: ${bulkResult.upsertedCount} inserted, ${bulkResult.modifiedCount} updated.`);

  // 4. Remove expired external listings older than 60 days
  const expirationThreshold = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const deleteResult = await Job.deleteMany({
    isExternal: true,
    postedAt: { $lt: expirationThreshold },
  });
  if (deleteResult.deletedCount > 0) {
    console.log(`[JobNexa Sync Engine] Purged ${deleteResult.deletedCount} expired external listings.`);
  }

  // 5. Trigger In-App Job Alerts for newly added jobs
  if (triggerNotifications && bulkResult.upsertedCount > 0) {
    try {
      const activeAlerts = await JobAlert.find({ isActive: true });
      if (activeAlerts.length > 0) {
        // Sample up to 5 newly synced jobs to avoid notification floods
        const sampleJobs = uniqueJobs.slice(0, 5);
        for (const alert of activeAlerts) {
          for (const job of sampleJobs) {
            const match = calculateJobMatch(alert.preferredSkills, job.requiredSkills);
            const matchesSkill = alert.preferredSkills.length === 0 || match.matchPercentage >= 40;
            const matchesLocation =
              !alert.preferredLocations ||
              job.location.toLowerCase().includes(alert.preferredLocations.toLowerCase()) ||
              job.isRemote;

            if (matchesSkill && matchesLocation) {
              await Notification.create({
                user: alert.user,
                title: `New Real-Time Job Alert: ${job.title}`,
                message: `${job.companyName} listed a vacancy matching your skills in ${job.location}.`,
                type: 'job_alert',
                link: `/jobs/${job._id}`,
              });
              break; // One notification per alert cycle per student
            }
          }
        }
      }
    } catch (notifErr) {
      console.warn('[JobNexa Sync Engine] Notification alert trigger notice:', notifErr.message);
    }
  }

  const activeJobsInDb = await Job.countDocuments({ isActive: true });

  const summary = {
    success: true,
    message: 'Real-time job synchronization completed successfully.',
    sourceStats,
    totalRawFetched: rawJobs.length,
    uniqueProcessed: uniqueJobs.length,
    newJobsInserted: bulkResult.upsertedCount,
    existingJobsUpdated: bulkResult.modifiedCount,
    totalActiveJobsInDatabase: activeJobsInDb,
    timeTakenMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };

  console.log('====================================================');
  console.log(`[JobNexa Sync Engine] Sync Finished. Total Active Jobs in DB: ${activeJobsInDb}`);
  console.log('====================================================');

  return summary;
};

export default syncAllJobs;
