import jwt from 'jsonwebtoken';

/**
 * Generate a signed JSON Web Token (JWT)
 * @param {string} id - User ID
 * @param {string} role - User role ('student' | 'recruiter' | 'admin')
 * @returns {string} Signed JWT token
 */
export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'jobnexa_fallback_secret_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

export default generateToken;
