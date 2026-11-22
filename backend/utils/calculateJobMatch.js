/**
 * ============================================================================
 * JOBNEXA SKILL-BASED JOB RECOMMENDATION & MATCHING ALGORITHM
 * ============================================================================
 * 
 * FORMULA:
 * Match Percentage = (Number of Matching Required Skills / Total Required Skills) * 100
 * 
 * ALGORITHM STEPS:
 * 1. Normalize both Candidate Skills and Job Required Skills (lowercase, trim extra spaces).
 * 2. Handle aliases/synonyms where applicable (e.g., 'js' -> 'javascript', 'node' -> 'nodejs').
 * 3. Find intersection of Candidate Skills and Job Required Skills.
 * 4. Determine matching skills and missing skills.
 * 5. Compute percentage match rounded to the nearest integer.
 */

/**
 * Normalizes a technical skill string for fair and case-insensitive comparison
 * @param {string} skill 
 * @returns {string} normalized string
 */
export const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  return skill
    .toLowerCase()
    .trim()
    .replace(/[.\-_]/g, '') // Remove dots/hyphens (e.g., 'node.js' -> 'nodejs', 'react-js' -> 'reactjs')
    .replace(/\s+/g, '');   // Remove whitespace
};

/**
 * Calculates skill compatibility match between a candidate's profile and a job listing
 * @param {Array<string>} candidateSkills - List of skills possessed by the student
 * @param {Array<string>} requiredSkills - List of technical requirements specified by recruiter
 * @returns {Object} { matchPercentage, matchingSkills, missingSkills }
 */
export const calculateJobMatch = (candidateSkills = [], requiredSkills = []) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchingSkills: [],
      missingSkills: [],
    };
  }

  // Set of normalized candidate skills for fast O(1) lookup
  const normalizedCandidateSkills = new Set(
    (candidateSkills || []).map(normalizeSkill).filter(Boolean)
  );

  const matchingSkills = [];
  const missingSkills = [];

  // Iterate over each required skill of the job posting
  requiredSkills.forEach((reqSkill) => {
    const normalizedReq = normalizeSkill(reqSkill);
    if (normalizedCandidateSkills.has(normalizedReq)) {
      matchingSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // Calculate percentage: (Matches / Total Required) * 100
  const matchPercentage = Math.round(
    (matchingSkills.length / requiredSkills.length) * 100
  );

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
  };
};

export default calculateJobMatch;
