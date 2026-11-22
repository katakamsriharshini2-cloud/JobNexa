import axios from 'axios';
import {
  stripHtml,
  generateShortDescription,
  extractSkills,
  normalizeLocation,
  categorizeJobTitle,
  normalizeSalaryINR,
} from '../utils/deduplicateJobs.js';

const ARBEITNOW_API_URL = 'https://www.arbeitnow.com/api/job-board-api';

/**
 * Fetch real-time tech and engineering jobs from Arbeitnow API
 * @param {number} maxResults 
 * @returns {Promise<Array<Object>>} Standardized job documents
 */
export const fetchArbeitnowJobs = async (maxResults = 50) => {
  try {
    console.log('[Arbeitnow Service] Fetching live tech listings from Arbeitnow API...');
    const response = await axios.get(ARBEITNOW_API_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'JobNexa-Campus-Portal/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.data || !Array.isArray(response.data.data)) {
      console.warn('[Arbeitnow Service] Unexpected API response shape.');
      return [];
    }

    const rawListings = response.data.data.slice(0, maxResults);
    const formattedJobs = rawListings.map((item) => {
      const cleanDesc = stripHtml(item.description);
      const skills = extractSkills(`${item.title} ${cleanDesc}`, item.tags || []);
      const category = categorizeJobTitle(item.title);
      const locInfo = normalizeLocation(item.location, item.remote, item.title);

      return {
        title: item.title,
        companyName: item.company_name || 'Tech Innovators India',
        description: generateShortDescription(cleanDesc, 450),
        category,
        requiredSkills: skills,
        location: locInfo.location,
        city: locInfo.city,
        country: 'India',
        isRemote: locInfo.isRemote,
        salaryRange: normalizeSalaryINR('', category),
        jobType: locInfo.isRemote ? 'Remote' : 'Full-time',
        experienceLevel: 'Fresher / Entry-Level',
        vacancies: 1,
        isActive: true,
        isExternal: true,
        source: 'arbeitnow',
        externalId: item.slug || `${item.created_at}_${item.company_name}`,
        originalUrl: item.url,
        postedAt: item.created_at ? new Date(item.created_at * 1000) : new Date(),
        lastSyncedAt: new Date(),
      };
    });

    console.log(`[Arbeitnow Service] Successfully processed ${formattedJobs.length} live jobs.`);
    return formattedJobs;
  } catch (error) {
    console.error(`[Arbeitnow Service Error]: ${error.message}`);
    return [];
  }
};

export default fetchArbeitnowJobs;
