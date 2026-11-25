import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    college: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    hasResumeUploaded: {
      type: Boolean,
      default: false,
    },
    resumeName: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    profilePicturePublicId: {
      type: String,
      trim: true,
    },
    profileCompletion: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Calculates profile completion percentage based on filled fields
 */
studentProfileSchema.methods.calculateCompletion = function () {
  let score = 20; // Base score for having an account
  if (this.fullName) score += 10;
  if (this.phone) score += 10;
  if (this.college) score += 10;
  if (this.degree) score += 5;
  if (this.branch) score += 5;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.hasResumeUploaded) score += 15;
  if (this.experience) score += 5;
  if (this.linkedinUrl || this.githubUrl) score += 5;
  this.profileCompletion = Math.min(100, score);
  return this.profileCompletion;
};

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
