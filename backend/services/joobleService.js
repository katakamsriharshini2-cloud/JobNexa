import axios from 'axios';
import { stripHtml, extractSkills, normalizeLocation, categorizeJobTitle } from '../utils/deduplicateJobs.js';

/**
 * Fetch tech vacancies from Jooble API if API key is provided
 * @returns {Promise<Array<Object>>} Standardized job documents
 */
export const fetchJoobleJobs = async () => {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    console.log('[Jooble Service] JOOBLE_API_KEY not configured; skipping Jooble query.');
    return [];
  }

  try {
    const url = `https://jooble.org/api/${apiKey}`;
    const response = await axios.post(
      url,
      {
        keywords: 'software engineer developer',
        location: 'India',
        page: 1,
      },
      { timeout: 8000 }
    );

    if (response.data && Array.isArray(response.data.jobs)) {
      return response.data.jobs.map((item) => {
        const cleanDesc = stripHtml(item.snippet);
        const skills = extractSkills(`${item.title} ${cleanDesc}`);
        const locInfo = normalizeLocation(item.location, false);
        const category = categorizeJobTitle(item.title);

        return {
          title: item.title,
          companyName: item.company || 'Enterprise Hiring Partner',
          description: cleanDesc,
          category,
          requiredSkills: skills,
          location: locInfo.location,
          city: locInfo.city,
          country: locInfo.country,
          isRemote: locInfo.isRemote,
          salaryRange: item.salary || 'Competitive',
          jobType: 'Full-time',
          experienceLevel: 'Fresher / Entry-Level',
          vacancies: 1,
          isActive: true,
          isExternal: true,
          source: 'jooble',
          externalId: String(item.id),
          originalUrl: item.link,
          postedAt: item.updated ? new Date(item.updated) : new Date(),
          lastSyncedAt: new Date(),
        };
      });
    }

    return [];
  } catch (error) {
    console.warn(`[Jooble Service Notice]: ${error.message}`);
    return [];
  }
};

export default fetchJoobleJobs;
