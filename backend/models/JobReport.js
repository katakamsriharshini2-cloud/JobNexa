import mongoose from 'mongoose';

const jobReportSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reporterEmail: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Please specify a reason for reporting'],
      enum: ['Fake Job Listing', 'Expired Posting', 'Misleading Information', 'Suspicious / Scam', 'Inappropriate Content', 'Other'],
      default: 'Suspicious / Scam',
    },
    details: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const JobReport = mongoose.model('JobReport', jobReportSchema);
export default JobReport;
