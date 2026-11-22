import connectDB from '../config/db.js';
import Job from '../models/Job.js';
import { generateShortDescription } from '../utils/deduplicateJobs.js';

async function cleanAllDescriptions() {
  await connectDB();
  console.log('[Clean Descriptions] Sanitizing and shortening all job descriptions...');

  const jobs = await Job.find();
  let count = 0;

  for (const job of jobs) {
    const shortDesc = generateShortDescription(job.description, 450);
    if (job.description !== shortDesc) {
      job.description = shortDesc;
      await job.save();
      count++;
    }
  }

  console.log(`[Clean Descriptions] Successfully cleaned and shortened ${count} job descriptions.`);
  process.exit(0);
}

cleanAllDescriptions().catch((err) => {
  console.error('[Clean Descriptions Error]:', err);
  process.exit(1);
});
