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
      required: false, // Optional for external API jobs
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
    category: {
      type: String,
      default: 'Software Engineering',
      index: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide job location'],
      trim: true,
      index: true,
    },
    city: {
      type: String,
      trim: true,
      index: true, // Specific Indian cities: Hyderabad, Warangal, Bengaluru, Chennai, Mumbai
    },
    country: {
      type: String,
      default: 'India',
      index: true,
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'On-site',
      index: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    companyLogo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'closed'],
      default: 'published',
      index: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
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
    // ============================================================
    // REAL-TIME EXTERNAL JOB INTEGRATION FIELDS
    // ============================================================
    isExternal: {
      type: Boolean,
      default: false,
      index: true,
    },
    source: {
      type: String,
      enum: ['internal', 'arbeitnow', 'remotive', 'adzuna', 'jooble', 'other'],
      default: 'internal',
      index: true,
    },
    externalId: {
      type: String,
      trim: true,
      index: true,
    },
    originalUrl: {
      type: String,
      trim: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness for external jobs from specific sources
jobSchema.index(
  { source: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: { isExternal: true, externalId: { $type: 'string' } },
  }
);

// Multi-field text index for high-speed full-text searching
jobSchema.index(
  {
    title: 'text',
    companyName: 'text',
    category: 'text',
    location: 'text',
    requiredSkills: 'text',
    description: 'text',
  },
  {
    weights: {
      title: 10,
      requiredSkills: 8,
      category: 6,
      companyName: 5,
      location: 4,
      description: 1,
    },
    name: 'JobTextIndex',
  }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
