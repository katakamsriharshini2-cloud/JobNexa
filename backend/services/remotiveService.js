import axios from 'axios';
import { stripHtml, extractSkills, normalizeLocation, categorizeJobTitle } from '../utils/deduplicateJobs.js';

const REMOTIVE_API_URL = 'https://remotive.com/api/remote-jobs?limit=50';

/**
 * Fetch real-time worldwide remote jobs from Remotive API
 * @param {number} maxResults 
 * @returns {Promise<Array<Object>>} Standardized job documents
 */
export const fetchRemotiveJobs = async (maxResults = 50) => {
  try {
    console.log('[Remotive Service] Fetching live remote developer jobs from Remotive API...');
    const response = await axios.get(REMOTIVE_API_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'JobNexa-Campus-Portal/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.data || !Array.isArray(response.data.jobs)) {
      console.warn('[Remotive Service] Unexpected API response shape.');
      return [];
    }

    const rawListings = response.data.jobs.slice(0, maxResults);
    const formattedJobs = rawListings.map((item) => {
      const cleanDesc = stripHtml(item.description);
      const skills = extractSkills(`${item.title} ${cleanDesc}`, item.tags || []);
      const locInfo = normalizeLocation(item.candidate_required_location || 'Remote', true);
      const category = categorizeJobTitle(item.title);

      return {
        title: item.title,
        companyName: item.company_name || 'Leading Tech Firm',
        description: cleanDesc || 'Remote software opportunity with global hiring capability.',
        category,
        requiredSkills: skills,
        location: locInfo.location,
        city: locInfo.city,
        country: locInfo.country,
        isRemote: true,
        salaryRange: item.salary ? item.salary.trim() : 'Competitive Tech Compensation',
        jobType: item.job_type === 'contract' ? 'Contract' : item.job_type === 'internship' ? 'Internship' : 'Remote',
        experienceLevel: 'Fresher / Entry-Level',
        vacancies: 1,
        isActive: true,
        isExternal: true,
        source: 'remotive',
        externalId: String(item.id),
        originalUrl: item.url,
        postedAt: item.publication_date ? new Date(item.publication_date) : new Date(),
        lastSyncedAt: new Date(),
      };
    });

    console.log(`[Remotive Service] Successfully processed ${formattedJobs.length} live jobs.`);
    return formattedJobs;
  } catch (error) {
    console.error(`[Remotive Service Error]: ${error.message}`);
    return [];
  }
};

export default fetchRemotiveJobs;
