import mongoose from 'mongoose';

const jobAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preferredSkills: {
      type: [String],
      default: [],
    },
    preferredLocations: {
      type: String,
      default: '',
    },
    jobType: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const JobAlert = mongoose.model('JobAlert', jobAlertSchema);
export default JobAlert;
