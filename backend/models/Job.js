import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide job title'],
      trim: true,
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide job description'],
      trim: true,
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Please provide at least one required technical skill'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide job location'],
      trim: true,
      index: true,
    },
    salaryRange: {
      type: String,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'],
      default: 'Full-time',
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher / Entry-Level', '1-3 Years', '3-5 Years', '5+ Years'],
      default: 'Fresher / Entry-Level',
      index: true,
    },
    vacancies: {
      type: Number,
      default: 1,
      min: [1, 'Vacancies must be at least 1'],
    },
    deadline: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast multi-field searching
jobSchema.index({ title: 'text', description: 'text', companyName: 'text', requiredSkills: 'text' });

const Job = mongoose.model('Job', jobSchema);
export default Job;
