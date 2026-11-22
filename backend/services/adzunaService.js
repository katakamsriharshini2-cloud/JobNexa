import axios from 'axios';
import { stripHtml, extractSkills, normalizeLocation, categorizeJobTitle } from '../utils/deduplicateJobs.js';

/**
 * Fetch Indian city jobs from Adzuna API (or configured Indian tech hub queries)
 * Target Cities: Hyderabad, Warangal, Bengaluru, Chennai, Mumbai
 * @returns {Promise<Array<Object>>} Standardized job documents
 */
export const fetchAdzunaJobs = async () => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.log('[Adzuna Service] ADZUNA_APP_ID and ADZUNA_APP_KEY not provided in environment; skipping Adzuna query.');
    return [];
  }

  const indianTechCities = ['Hyderabad', 'Warangal', 'Bengaluru', 'Chennai', 'Mumbai'];
  const results = [];

  for (const city of indianTechCities) {
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=10&what=developer%20engineer&where=${encodeURIComponent(city)}&content-type=application/json`;
      const response = await axios.get(url, { timeout: 8000 });

      if (response.data && Array.isArray(response.data.results)) {
        const jobs = response.data.results.map((item) => {
          const cleanDesc = stripHtml(item.description);
          const skills = extractSkills(`${item.title} ${cleanDesc}`);
          const locInfo = normalizeLocation(city, false);
          const category = categorizeJobTitle(item.title);

          return {
            title: item.title,
            companyName: item.company?.display_name || 'Top Indian IT Firm',
            description: cleanDesc,
            category,
            requiredSkills: skills,
            location: `${city}, India`,
            city,
            country: 'India',
            isRemote: false,
            salaryRange: item.salary_min && item.salary_max ? `₹${(item.salary_min / 100000).toFixed(1)} - ${(item.salary_max / 100000).toFixed(1)} LPA` : '₹6 - 12 LPA',
            jobType: 'Full-time',
            experienceLevel: 'Fresher / Entry-Level',
            vacancies: 2,
            isActive: true,
            isExternal: true,
            source: 'adzuna',
            externalId: String(item.id),
            originalUrl: item.redirect_url,
            postedAt: item.created ? new Date(item.created) : new Date(),
            lastSyncedAt: new Date(),
          };
        });

        results.push(...jobs);
      }
    } catch (err) {
      console.warn(`[Adzuna Service Notice] City ${city} query: ${err.message}`);
    }
  }

  console.log(`[Adzuna Service] Successfully retrieved ${results.length} jobs for Indian cities.`);
  return results;
};

export default fetchAdzunaJobs;
