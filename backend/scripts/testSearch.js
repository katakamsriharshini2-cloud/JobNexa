import connectDB from '../config/db.js';
import Job from '../models/Job.js';

async function test() {
  await connectDB();
  const total = await Job.countDocuments();
  console.log('Total jobs in DB:', total);

  // Test location = 'Hyderabad'
  const locRegex = new RegExp('Hyderabad', 'i');
  const hydJobs = await Job.find({
    isActive: true,
    $or: [{ location: locRegex }, { city: locRegex }]
  });
  console.log('Hyderabad matches:', hydJobs.length);
  if (hydJobs.length > 0) {
    console.log('Sample:', hydJobs[0].title, 'City:', hydJobs[0].city, 'Location:', hydJobs[0].location);
  }

  // Check all cities
  const cities = ['Hyderabad', 'Warangal', 'Bengaluru', 'Chennai', 'Mumbai', 'Pune', 'Delhi NCR', 'Remote'];
  for (const c of cities) {
    const r = new RegExp(c, 'i');
    const cnt = await Job.countDocuments({
      $or: [{ location: r }, { city: r }]
    });
    console.log(`Count for ${c}:`, cnt);
  }

  process.exit(0);
}

test();
