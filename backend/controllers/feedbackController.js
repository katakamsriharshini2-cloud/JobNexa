import Feedback from '../models/Feedback.js';

/**
 * @desc    Submit user contact or feedback message
 * @route   POST /api/feedback
 * @access  Public
 */
export const submitFeedback = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email address, and message content.',
      });
    }

    const feedback = await Feedback.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received by JobNexa support.',
      data: feedback,
    });
  } catch (error) {
    console.error('[Feedback Controller Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again later.',
    });
  }
};

/**
 * @desc    Fetch all feedback messages (Admin only)
 * @route   GET /api/feedback
 * @access  Admin
 */
export const getAllFeedback = async (req, res) => {
  try {
    const messages = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback messages.',
    });
  }
};
