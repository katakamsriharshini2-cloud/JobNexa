import connectDB from '../config/db.js';
import Job from '../models/Job.js';

async function check() {
  await connectDB();
  const all = await Job.find().select('title location city country');
  console.log('Total jobs:', all.length);
  const byCity = {};
  all.forEach(j => {
    const k = `${j.city || 'No City'} (${j.country || 'No Country'})`;
    byCity[k] = (byCity[k] || 0) + 1;
  });
  console.log('By City:', byCity);
  process.exit(0);
}
check();
