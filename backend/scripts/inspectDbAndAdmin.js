import mongoose from 'mongoose';
import connectDB, { getRawMongoUri } from '../config/db.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

async function run() {
  console.log('--- JobNexa Database & Authentication Inspector ---');
  try {
    const rawUri = getRawMongoUri();
    console.log('1. Connection String Detection:');
    console.log('   - Has URI:', Boolean(rawUri));
    console.log('   - Scheme:', rawUri ? rawUri.split('://')[0] : 'None');
    console.log('   - Host target:', (rawUri && rawUri.includes('@')) ? rawUri.split('@')[1].split('/')[0] : 'None');

    const conn = await connectDB();
    console.log('2. MongoDB Atlas Connection:');
    console.log('   - Status: CONNECTED');
    console.log('   - Host:', conn.connection.host);
    console.log('   - Database:', conn.connection.name);
    console.log('   - Ready State:', mongoose.connection.readyState);

    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();
    const appCount = await Application.countDocuments();

    console.log('3. Existing Records Count:');
    console.log('   - Total Users:', userCount);
    console.log('   - Total Jobs:', jobCount);
    console.log('   - Total Applications:', appCount);

    console.log('4. Checking Admin Account: "admin@ecosphere.org"');
    const ecosphereAdmin = await User.findOne({ email: 'admin@ecosphere.org' }).select('+password');
    if (ecosphereAdmin) {
      console.log('   - Found admin@ecosphere.org:', {
        id: ecosphereAdmin._id,
        name: ecosphereAdmin.name,
        role: ecosphereAdmin.role,
        status: ecosphereAdmin.status,
        hasPasswordHash: Boolean(ecosphereAdmin.password),
      });
    } else {
      console.log('   - admin@ecosphere.org does NOT exist in database.');
    }

    console.log('5. Checking All Existing Users:');
    const allUsers = await User.find().select('name email role status createdAt');
    allUsers.forEach((u) => {
      console.log(`   - [${u.role.toUpperCase()}] ${u.email} (${u.name}) - Status: ${u.status}`);
    });

    await mongoose.disconnect();
    console.log('--- Inspection Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('--- Inspection Failed ---');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    process.exit(1);
  }
}

run();
