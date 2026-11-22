/**
 * ============================================================================
 * JOBNEXA REAL-TIME JOB DEDUPLICATION & METADATA ENRICHMENT UTILITIES
 * ============================================================================
 */

// Comprehensive dictionary of recognized technical skills
const TECHNICAL_SKILLS_DICTIONARY = [
  'react', 'react.js', 'reactjs', 'node.js', 'nodejs', 'express', 'express.js',
  'mongodb', 'sql', 'mysql', 'postgresql', 'postgres', 'python', 'java', 'c++',
  'c#', '.net', 'javascript', 'typescript', 'html', 'html5', 'css', 'css3',
  'tailwind', 'tailwind css', 'bootstrap', 'aws', 'amazon web services', 'azure',
  'gcp', 'google cloud', 'docker', 'kubernetes', 'git', 'github', 'ci/cd',
  'rest api', 'graphql', 'next.js', 'nextjs', 'vue', 'vue.js', 'angular',
  'django', 'flask', 'fastapi', 'spring boot', 'redux', 'linux', 'redis',
  'kafka', 'devops', 'cybersecurity', 'machine learning', 'deep learning',
  'ai', 'nlp', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch'
];

/**
 * Strips HTML tags, handles entities, and normalizes text
 * @param {string} html 
 * @returns {string} clean text
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  let text = html;

  // Decode HTML entities (including double-escaped entities)
  text = text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ');

  // Convert line breaks and structural tags to newlines
  text = text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  // Clean repeated spaces and newlines
  text = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  return text;
};

/**
 * Creates a clean, concise, executive short description
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string} short readable summary
 */
export const generateShortDescription = (text = '', maxLength = 400) => {
  const clean = stripHtml(text);
  if (!clean) return 'Exciting technology role at leading Indian engineering organization.';
  if (clean.length <= maxLength) return clean;

  const slice = clean.slice(0, maxLength);
  const lastDot = slice.lastIndexOf('.');
  if (lastDot > 180) {
    return slice.slice(0, lastDot + 1).trim();
  }
  return slice.trim() + '...';
};

/**
 * Extracts normalized technical skills from title, tags, and description
 * @param {string} textToScan - Title, tags, or description
 * @param {Array<string>} existingTags - Tags provided directly by API
 * @returns {Array<string>} list of distinct capitalized technical skills
 */
export const extractSkills = (textToScan = '', existingTags = []) => {
  const foundSkills = new Set();

  // 1. Add existing tags if valid
  if (Array.isArray(existingTags)) {
    existingTags.forEach((t) => {
      if (t && typeof t === 'string' && t.trim().length > 1) {
        foundSkills.add(t.trim());
      }
    });
  }

  // 2. Scan text using technical dictionary
  const lowerText = ` ${textToScan.toLowerCase()} `;
  TECHNICAL_SKILLS_DICTIONARY.forEach((skill) => {
    // Regex boundary check for exact words
    const regex = new RegExp(`[\\s,./(-]${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s,./)-]`, 'i');
    if (regex.test(lowerText)) {
      // Capitalize skill cleanly
      const formatted = skill
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      foundSkills.add(formatted);
    }
  });

  // Guarantee at least foundational technical tags if none found
  if (foundSkills.size === 0) {
    foundSkills.add('Software Development');
    foundSkills.add('JavaScript');
  }

  return Array.from(foundSkills).slice(0, 8);
};

const INDIAN_TECH_CITIES = [
  'Hyderabad',
  'Bengaluru',
  'Mumbai',
  'Chennai',
  'Warangal',
  'Pune',
  'Delhi NCR',
];

/**
 * Detects or assigns Indian tech cities with 100% India locality
 * Priority Cities: Hyderabad, Warangal, Bengaluru, Chennai, Mumbai, Pune, Delhi NCR
 * @param {string} locationStr 
 * @param {boolean} isRemoteFlag 
 * @param {string} fallbackSeed
 * @returns {Object} { location, city, country, isRemote }
 */
export const normalizeLocation = (locationStr = '', isRemoteFlag = false, fallbackSeed = '') => {
  const lower = (locationStr || '').toLowerCase();
  let city = '';
  let isRemote = Boolean(isRemoteFlag);

  // Check Indian priority cities
  if (lower.includes('hyderabad') || lower.includes('telangana')) {
    city = 'Hyderabad';
  } else if (lower.includes('warangal')) {
    city = 'Warangal';
  } else if (lower.includes('bengaluru') || lower.includes('bangalore') || lower.includes('karnataka')) {
    city = 'Bengaluru';
  } else if (lower.includes('chennai') || lower.includes('tamil nadu')) {
    city = 'Chennai';
  } else if (lower.includes('mumbai') || lower.includes('maharashtra') || lower.includes('bombay')) {
    city = 'Mumbai';
  } else if (lower.includes('pune')) {
    city = 'Pune';
  } else if (lower.includes('delhi') || lower.includes('noida') || lower.includes('gurgaon') || lower.includes('gurugram')) {
    city = 'Delhi NCR';
  } else {
    // Deterministic distribution across priority Indian hubs for any generic/international listings
    const hash = (locationStr + fallbackSeed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    city = INDIAN_TECH_CITIES[hash % INDIAN_TECH_CITIES.length];
  }

  if (
    lower.includes('remote') ||
    lower.includes('work from home') ||
    lower.includes('telecommute') ||
    lower.includes('anywhere') ||
    lower.includes('worldwide') ||
    isRemoteFlag
  ) {
    isRemote = true;
  }

  // Format strictly for India
  const country = 'India';
  const location = `${city}, India${isRemote ? ' (Remote Available)' : ''}`;

  return { location, city, country, isRemote };
};

/**
 * Normalizes salary range to Indian Rupees (LPA)
 * @param {string|number} rawSalary 
 * @param {string} category 
 * @returns {string} E.g. "₹8 - 14 LPA"
 */
export const normalizeSalaryINR = (rawSalary = '', category = 'Software Engineering') => {
  if (rawSalary && typeof rawSalary === 'string' && rawSalary.includes('₹')) {
    return rawSalary.trim();
  }

  // Map category to standard competitive Indian fresher/entry-level tech compensation
  switch (category) {
    case 'Data & AI / ML':
      return '₹9 - 16 LPA';
    case 'Cloud & DevOps':
      return '₹8 - 15 LPA';
    case 'Cybersecurity':
      return '₹9 - 17 LPA';
    case 'Frontend & UI/UX':
      return '₹7 - 12 LPA';
    case 'Product & Tech Sales':
      return '₹6 - 11 LPA';
    case 'Software Engineering':
    default:
      return '₹8 - 14 LPA';
  }
};

/**
 * Categorizes job title into one of JobNexa's standard 6 categories
 * @param {string} title 
 * @returns {string} Standard category
 */
export const categorizeJobTitle = (title = '') => {
  const lower = title.toLowerCase();
  if (lower.includes('data') || lower.includes('machine learning') || lower.includes('ai') || lower.includes('ml') || lower.includes('analyst')) {
    return 'Data & AI / ML';
  }
  if (lower.includes('frontend') || lower.includes('ui') || lower.includes('ux') || lower.includes('react') || lower.includes('web design')) {
    return 'Frontend & UI/UX';
  }
  if (lower.includes('devops') || lower.includes('cloud') || lower.includes('aws') || lower.includes('docker') || lower.includes('infrastructure')) {
    return 'Cloud & DevOps';
  }
  if (lower.includes('security') || lower.includes('cyber') || lower.includes('infosec')) {
    return 'Cybersecurity';
  }
  if (lower.includes('product') || lower.includes('sales') || lower.includes('marketing') || lower.includes('manager')) {
    return 'Product & Tech Sales';
  }
  return 'Software Engineering';
};

/**
 * Deduplicates an array of external job objects by fingerprint hash
 * @param {Array<Object>} jobs 
 * @returns {Array<Object>} unique jobs
 */
export const deduplicateJobBatch = (jobs = []) => {
  const seen = new Set();
  const unique = [];

  for (const job of jobs) {
    // Generate normalized fingerprint key: source + externalId OR (title + company)
    const fingerprint = job.externalId
      ? `${job.source}:${job.externalId}`
      : `${job.title.toLowerCase().trim()}:${job.companyName.toLowerCase().trim()}`;

    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      unique.push(job);
    }
  }

  return unique;
};
