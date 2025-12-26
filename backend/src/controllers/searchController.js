import fetch from 'node-fetch';
import dns from 'dns';

// Set DNS resolution to use system DNS (fixes Windows DNS issues)
dns.setDefaultResultOrder('verbatim');

// Providers
const REMOTIVE_API = 'https://remotive.com/api/remote-jobs';
// Adzuna base; country is chosen dynamically
const ADZUNA_API_BASE = 'https://api.adzuna.com/v1/api/jobs';
// RapidAPI JSearch
const JSEARCH_API = 'https://jsearch.p.rapidapi.com/search';
// Stack Overflow Jobs
const STACKOVERFLOW_API = 'https://api.stackexchange.com/2.3/jobs';
// Hacker News Jobs
const HACKERNEWS_API = 'https://hacker-news.firebaseapp.com/v0';

// Query synonym expansion for better matching
const expandQuery = (q) => {
  if (!q) return q;
  const synonyms = {
    developer: ['developer', 'engineer', 'programmer'],
    frontend: ['frontend', 'front-end', 'front end', 'ui'],
    backend: ['backend', 'back-end', 'back end', 'server'],
    fullstack: ['fullstack', 'full-stack', 'full stack'],
    remote: ['remote', 'work from home', 'wfh'],
    junior: ['junior', 'entry level', 'entry-level'],
    senior: ['senior', 'lead', 'principal'],
  };
  
  let expanded = q.toLowerCase();
  for (const [key, terms] of Object.entries(synonyms)) {
    if (expanded.includes(key)) {
      return q; // Keep original if already specific
    }
  }
  return q;
};

// Retry utility for API calls
const fetchWithRetry = async (url, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (i === retries) return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

// Detect if URL is a third-party job board (not company website)
const isThirdPartyJobBoard = (url) => {
  if (!url) return false;
  const thirdParty = [
    'linkedin.com', 'indeed.com', 'glassdoor.com', 'hired.com', 'angel.co',
    'wellfound.com', 'monster.com', 'dice.com', 'ziprecruiter.com',
    'builtin.com', 'workable.com', 'greenhouse.io', 'bamboohr.com',
    'smartrecruiters.com', 'lever.co', 'jobvite.com', 'otta.com', 'tech.eu',
    'crunchboard.com', 'remotive.com', 'weworkremotely.com', 'authenticjobs.com',
    'stackoverflow.com/jobs', 'github.com/jobs', 'twitter.com', 'facebook.com',
    'instagram.com', 'google.com/careers',
  ];
  const urlLower = url.toLowerCase();
  return thirdParty.some((board) => urlLower.includes(board));
};

const ADZUNA_COUNTRY_HINTS = {
  us: ['united states', 'usa', 'us', 'america'],
  gb: ['united kingdom', 'uk', 'england', 'scotland', 'wales', 'london'],
  ca: ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa'],
  au: ['australia', 'sydney', 'melbourne', 'brisbane'],
  in: ['india', 'delhi', 'mumbai', 'bangalore', 'bengaluru', 'hyderabad', 'pune'],
  sg: ['singapore'],
  de: ['germany', 'berlin', 'munich'],
  fr: ['france', 'paris'],
  es: ['spain', 'madrid', 'barcelona'],
  it: ['italy', 'rome', 'milan'],
  nl: ['netherlands', 'amsterdam', 'rotterdam'],
  ie: ['ireland', 'dublin'],
  nz: ['new zealand', 'auckland'],
  za: ['south africa', 'johannesburg', 'cape town'],
  pl: ['poland', 'warsaw', 'krakow'],
  ro: ['romania', 'bucharest'],
};

const isValidAdzunaCountry = (code) => Boolean(ADZUNA_COUNTRY_HINTS[code]);

// Resolve Adzuna country code using explicit query > location inference > fallback env > US
const resolveAdzunaCountry = ({ explicitCountry, location }) => {
  const fallback = (process.env.ADZUNA_COUNTRY || 'us').toLowerCase();
  if (explicitCountry && isValidAdzunaCountry(explicitCountry)) return explicitCountry;
  if (location) {
    const loc = location.toLowerCase();
    for (const [code, hints] of Object.entries(ADZUNA_COUNTRY_HINTS)) {
      if (hints.some((hint) => loc.includes(hint))) return code;
    }
  }
  return isValidAdzunaCountry(fallback) ? fallback : 'us';
};

// Get company website URL
const getCompanyWebsiteUrl = (companyName, jobUrl) => {
  if (!isThirdPartyJobBoard(jobUrl)) return jobUrl;
  const knownPatterns = {
    microsoft: 'https://careers.microsoft.com',
    google: 'https://careers.google.com',
    amazon: 'https://amazon.jobs',
    apple: 'https://apple.com/careers',
    meta: 'https://metacareers.com',
    netflix: 'https://jobs.netflix.com',
    tesla: 'https://tesla.com/careers',
    nvidia: 'https://nvidia.com/careers',
    github: 'https://github.com/careers',
    stripe: 'https://stripe.com/careers',
    figma: 'https://figma.com/careers',
    notion: 'https://notion.so/careers',
    airbnb: 'https://careers.airbnb.com',
    uber: 'https://uber.com/careers',
    airbus: 'https://airbus.com/careers',
    ibm: 'https://ibm.com/careers',
    intel: 'https://intel.com/careers',
    oracle: 'https://oracle.com/careers',
    salesforce: 'https://salesforce.com/careers',
    accenture: 'https://accenture.com/careers',
    deloitte: 'https://deloitte.com/careers',
    pwc: 'https://pwc.com/careers',
    jpmorgan: 'https://jpmorgan.com/careers',
  };
  const companyKey = companyName.toLowerCase().replace(/\s+/g, '').split(/[\-&]/)[0];
  return knownPatterns[companyKey] || jobUrl;
};

const mapAdzunaJob = (job) => {
  const companyWebsite = getCompanyWebsiteUrl(job.company.display_name, job.redirect_url);
  return {
    id: `adzuna_${job.id}`,
    title: job.title,
    company_name: job.company.display_name,
    candidate_required_location: job.location.display_name || 'Worldwide',
    job_type: null,
    salary: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : null,
    publication_date: job.created,
    tags: [],
    url: companyWebsite || job.redirect_url,
    source: 'adzuna',
    company_website_url: companyWebsite,
  };
};

const fetchAdzunaJobs = async ({ q, location, adzunaCountry, limit = 100 }) => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  try {
    const country = resolveAdzunaCountry({ explicitCountry: adzunaCountry, location });
    const url = new URL(`${ADZUNA_API_BASE}/${country}/search/1`);
    // Build query: if no q and no location, search all jobs; if only location, use location; if only q, use q
    let query = '';
    if (q && location) {
      query = [q, location].filter(Boolean).join(' ').trim();
    } else if (q) {
      query = q.trim();
    } else if (location) {
      query = location.trim();
    } else {
      query = 'jobs'; // Default fallback for worldwide search
    }
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', appKey);
    url.searchParams.set('what', query);
    url.searchParams.set('results_per_page', String(Math.min(limit, 50)));
    const res = await fetchWithRetry(url.toString());
    if (!res.ok) {
      // Check for region-specific errors
      const errorText = await res.text().catch(() => '');
      if (errorText.includes('not available') || errorText.includes('region')) {
        console.warn('Adzuna region restriction detected for country:', country);
      }
      return [];
    }
    const data = await res.json();
    // Handle error responses that indicate region blocks
    if (data.error || data.exception) {
      console.warn('Adzuna error response:', data.error || data.exception);
      return [];
    }
    return (data.results || []).map(mapAdzunaJob);
  } catch (err) {
    console.error('Adzuna fetch error:', err.message);
    return [];
  }
};

// Remotive (free, no key)
const mapRemotiveJob = (job) => {
  const companyWebsite = getCompanyWebsiteUrl(job.company_name, job.url);
  return {
    id: `remotive_${job.id}`,
    title: job.title,
    company_name: job.company_name,
    candidate_required_location: job.candidate_required_location || 'Worldwide',
    job_type: job.job_type || null,
    salary: job.salary || null,
    publication_date: job.publication_date,
    tags: job.tags || [],
    url: companyWebsite || job.url,
    source: 'remotive',
    company_website_url: companyWebsite,
  };
};

const fetchRemotiveJobs = async ({ q, location, category, job_type, limit = 100 }) => {
  try {
    const url = new URL(REMOTIVE_API);
    // Only add search param if q is provided
    if (q && q.trim()) url.searchParams.set('search', expandQuery(q));
    if (category && category !== '') url.searchParams.set('category', category);
    const res = await fetchWithRetry(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    let jobs = Array.isArray(data.jobs) ? data.jobs : [];
    // Filter by job_type if provided
    if (job_type && job_type !== '') {
      jobs = jobs.filter((j) => (j.job_type || '').toLowerCase() === job_type.toLowerCase());
    }
    if (location) {
      const loc = location.toLowerCase();
      jobs = jobs.filter((j) => (j.candidate_required_location || '').toLowerCase().includes(loc));
    }
    return jobs.slice(0, limit).map(mapRemotiveJob);
  } catch (err) {
    console.error('Remotive fetch error:', err.message);
    return [];
  }
};

// JSearch via RapidAPI (uses RAPIDAPI_KEY or JSEARCH_API_KEY)
const mapJSearchJob = (job) => {
  const companyWebsite = job.employer_website || getCompanyWebsiteUrl(job.employer_name, job.job_apply_link || job.job_google_link);
  return {
    id: `jsearch_${job.job_id}`,
    title: job.job_title,
    company_name: job.employer_name,
    candidate_required_location: [job.job_city, job.job_country].filter(Boolean).join(', ') || 'Worldwide',
    job_type: job.job_employment_type || null,
    salary: job.job_min_salary || job.job_max_salary
      ? `$${job.job_min_salary || ''}${job.job_max_salary ? ' - $' + job.job_max_salary : ''}`
      : null,
    publication_date: job.job_posted_at_datetime_utc,
    tags: Array.isArray(job.job_required_skills) ? job.job_required_skills : [],
    url: companyWebsite || job.job_apply_link || job.job_google_link,
    source: 'jsearch',
    company_website_url: companyWebsite,
  };
};

// Stack Overflow Jobs
const mapStackOverflowJob = (job) => {
  const companyWebsite = job.company_url || getCompanyWebsiteUrl(job.company_name, job.link);
  return {
    id: `stackoverflow_${job.job_id}`,
    title: job.title,
    company_name: job.company_name,
    candidate_required_location: job.location || 'Worldwide',
    job_type: null,
    salary: null,
    publication_date: new Date(job.creation_date * 1000).toISOString(),
    tags: job.tags || [],
    url: companyWebsite || job.link,
    source: 'stackoverflow',
    company_website_url: companyWebsite,
  };
};

const fetchStackOverflowJobs = async ({ q, limit = 100 }) => {
  try {
    const url = new URL(STACKOVERFLOW_API);
    url.searchParams.set('site', 'stackoverflow');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('sort', 'activity');
    url.searchParams.set('pagesize', String(Math.min(limit, 100)));
    if (q && q.trim()) {
      url.searchParams.set('intitle', q.trim());
    }
    const res = await fetchWithRetry(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).slice(0, limit).map(mapStackOverflowJob);
  } catch (err) {
    console.error('Stack Overflow Jobs fetch error:', err.message);
    return [];
  }
};

const fetchJSearchJobs = async ({ q, location, limit = 100 }) => {
  const apiKey = process.env.RAPIDAPI_KEY || process.env.JSEARCH_API_KEY;
  if (!apiKey) return [];
  try {
    const url = new URL(JSEARCH_API);
    // Build query: support designation only, location only, both, or default
    let query = '';
    if (q && location) {
      query = [q, location].filter(Boolean).join(' ').trim();
    } else if (q) {
      query = q.trim();
    } else if (location) {
      query = `jobs in ${location.trim()}`;
    } else {
      query = 'remote jobs'; // Default for worldwide
    }
    url.searchParams.set('query', query);
    url.searchParams.set('num_pages', '2');
    url.searchParams.set('page', '1');
    const res = await fetchWithRetry(url.toString(), {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = Array.isArray(data.data) ? data.data : [];
    return results.slice(0, limit).map(mapJSearchJob);
  } catch (err) {
    console.error('JSearch fetch error:', err.message);
    return [];
  }
};

// Hacker News Jobs
const mapHackerNewsJob = (job) => {
  const companyWebsite = getCompanyWebsiteUrl(job.company || job.title, job.url);
  return {
    id: `hackernews_${job.id}`,
    title: job.title,
    company_name: job.company || 'Unknown',
    candidate_required_location: 'Worldwide',
    job_type: null,
    salary: null,
    publication_date: new Date(job.time * 1000).toISOString(),
    tags: [],
    url: companyWebsite || job.url,
    source: 'hackernews',
    company_website_url: companyWebsite,
  };
};

const fetchHackerNewsJobs = async ({ q, limit = 100 }) => {
  try {
    // HN Jobs endpoint - returns job post IDs
    const jobsUrl = `${HACKERNEWS_API}/jobstories.json`;
    const res = await fetchWithRetry(jobsUrl);
    if (!res.ok) return [];
    const jobIds = await res.json();
    
    const jobs = [];
    const searchTerm = (q || '').toLowerCase();
    
    // Fetch details for first 50 job IDs (limited to avoid excessive requests)
    for (const id of jobIds.slice(0, 50)) {
      if (jobs.length >= limit) break;
      try {
        const jobRes = await fetch(`${HACKERNEWS_API}/item/${id}.json`);
        if (!jobRes.ok) continue;
        const job = await jobRes.json();
        
        // Filter by search term if provided
        if (searchTerm && !job.title?.toLowerCase().includes(searchTerm) && !job.text?.toLowerCase().includes(searchTerm)) {
          continue;
        }
        
        jobs.push(mapHackerNewsJob(job));
      } catch (err) {
        // Skip individual job fetch errors
        continue;
      }
    }
    return jobs;
  } catch (err) {
    console.error('Hacker News Jobs fetch error:', err.message);
    return [];
  }
};

export const searchJobs = async (req, res) => {
  try {
    const { q = '', location = '', job_type = '', category = '', min_salary, adzuna_country } = req.query;
    
    // Parallel API calls for better performance - 5 sources for maximum coverage
    const [remotiveJobs, jsearchJobs, adzunaJobs, stackoverflowJobs, hackerNewsJobs] = await Promise.allSettled([
      fetchRemotiveJobs({ q, location, category, job_type }),
      fetchJSearchJobs({ q, location }),
      fetchAdzunaJobs({
        q,
        location,
        adzunaCountry: (adzuna_country || '').toLowerCase().trim() || null,
      }),
      fetchStackOverflowJobs({ q }),
      fetchHackerNewsJobs({ q }),
    ]);

    let jobs = [
      ...(remotiveJobs.status === 'fulfilled' ? remotiveJobs.value : []),
      ...(jsearchJobs.status === 'fulfilled' ? jsearchJobs.value : []),
      ...(adzunaJobs.status === 'fulfilled' ? adzunaJobs.value : []),
      ...(stackoverflowJobs.status === 'fulfilled' ? stackoverflowJobs.value : []),
      ...(hackerNewsJobs.status === 'fulfilled' ? hackerNewsJobs.value : []),
    ];

    // Log any failures
    if (remotiveJobs.status === 'rejected') console.error('Remotive error:', remotiveJobs.reason?.message);
    if (jsearchJobs.status === 'rejected') console.error('JSearch error:', jsearchJobs.reason?.message);
    if (adzunaJobs.status === 'rejected') console.error('Adzuna error:', adzunaJobs.reason?.message);
    if (stackoverflowJobs.status === 'rejected') console.error('Stack Overflow error:', stackoverflowJobs.reason?.message);
    if (hackerNewsJobs.status === 'rejected') console.error('Hacker News error:', hackerNewsJobs.reason?.message);

    // Calculate relevance score
    const calculateRelevance = (job) => {
      let score = 0;
      const title = (job.title || '').toLowerCase();
      const company = (job.company_name || '').toLowerCase();
      const searchTerm = (q || '').toLowerCase();
      
      // If there's a search term, prioritize matches
      if (searchTerm) {
        // Title match (highest weight)
        if (title.includes(searchTerm)) score += 10;
        if (title.startsWith(searchTerm)) score += 5;
        
        // Company match
        if (company.includes(searchTerm)) score += 3;
      }
      
      // Recency (jobs posted recently rank higher)
      if (job.publication_date) {
        const daysAgo = (Date.now() - new Date(job.publication_date)) / (1000 * 60 * 60 * 24);
        if (daysAgo <= 7) score += 5;
        else if (daysAgo <= 30) score += 2;
      }
      
      // Direct company links preferred
      if (!isThirdPartyJobBoard(job.url)) score += 8;
      
      // Has salary info
      if (job.salary) score += 2;
      
      return score;
    };

    // De-duplicate and score
    const seen = new Set();
    const unique = [];
    for (const job of jobs) {
      const key = (job.url || '').toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      job.relevanceScore = calculateRelevance(job);
      unique.push(job);
    }

    // Sort by relevance score (descending)
    unique.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // Apply salary filter
    let filtered = unique;
    if (min_salary) {
      const min = Number(min_salary) || 0;
      filtered = unique.filter((j) => {
        if (!j.salary) return false;
        const nums = String(j.salary).match(/\d+/g);
        if (!nums || !nums.length) return false;
        const values = nums.map((n) => Number(n)).filter((n) => !Number.isNaN(n));
        if (!values.length) return false;
        const maxv = Math.max(...values);
        return maxv >= min;
      });
    }

    res.json({ jobs: filtered });
  } catch (err) {
    console.error('searchJobs error', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export default searchJobs;
