import fetch from 'node-fetch';

// Providers
const REMOTIVE_API = 'https://remotive.com/api/remote-jobs';
// Correct Adzuna base (page 1, US region)
const ADZUNA_API = 'https://api.adzuna.com/v1/api/jobs/us/search/1';
// RapidAPI JSearch
const JSEARCH_API = 'https://jsearch.p.rapidapi.com/search';

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

const mapAdzunaJob = (job) => ({
  id: `adzuna_${job.id}`,
  title: job.title,
  company_name: job.company.display_name,
  candidate_required_location: job.location.display_name || 'Worldwide',
  job_type: null,
  salary: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : null,
  publication_date: job.created,
  tags: [],
  url: job.redirect_url,
  source: 'adzuna',
  company_website_url: getCompanyWebsiteUrl(job.company.display_name, job.redirect_url),
});

const fetchAdzunaJobs = async ({ q, location, limit = 50 }) => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  try {
    const url = new URL(ADZUNA_API);
    const query = [q, location].filter(Boolean).join(' ').trim() || 'software engineer';
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', appKey);
    url.searchParams.set('what', query);
    url.searchParams.set('results_per_page', String(Math.min(limit, 50)));
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map(mapAdzunaJob);
  } catch (err) {
    console.error('Adzuna fetch error:', err.message);
    return [];
  }
};

// Remotive (free, no key)
const mapRemotiveJob = (job) => ({
  id: `remotive_${job.id}`,
  title: job.title,
  company_name: job.company_name,
  candidate_required_location: job.candidate_required_location || 'Worldwide',
  job_type: job.job_type || null,
  salary: job.salary || null,
  publication_date: job.publication_date,
  tags: job.tags || [],
  url: job.url,
  source: 'remotive',
  company_website_url: getCompanyWebsiteUrl(job.company_name, job.url),
});

const fetchRemotiveJobs = async ({ q, location, category, limit = 100 }) => {
  try {
    const url = new URL(REMOTIVE_API);
    if (q) url.searchParams.set('search', q);
    if (category && category !== 'any') url.searchParams.set('category', category);
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    let jobs = Array.isArray(data.jobs) ? data.jobs : [];
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
const mapJSearchJob = (job) => ({
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
  url: job.job_apply_link || job.job_google_link,
  source: 'jsearch',
  company_website_url: job.employer_website || null,
});

const fetchJSearchJobs = async ({ q, location, limit = 50 }) => {
  const apiKey = process.env.RAPIDAPI_KEY || process.env.JSEARCH_API_KEY;
  if (!apiKey) return [];
  try {
    const url = new URL(JSEARCH_API);
    const query = [q, location].filter(Boolean).join(' ').trim() || 'software engineer';
    url.searchParams.set('query', query);
    url.searchParams.set('num_pages', '1');
    url.searchParams.set('page', '1');
    const res = await fetch(url.toString(), {
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

export const searchJobs = async (req, res) => {
  try {
    const { q = '', location = '', min_salary } = req.query;
    let jobs = [];

    // Remotive (no key)
    try {
      const remotiveJobs = await fetchRemotiveJobs({ q, location });
      jobs = [...jobs, ...remotiveJobs];
    } catch (err) {
      console.error('Remotive search error:', err.message);
    }

    // JSearch (RapidAPI)
    try {
      const jsearchJobs = await fetchJSearchJobs({ q, location });
      jobs = [...jobs, ...jsearchJobs];
    } catch (err) {
      console.error('JSearch search error:', err.message);
    }

    // Adzuna (if keys present)
    try {
      const adzunaJobs = await fetchAdzunaJobs({ q, location });
      jobs = [...jobs, ...adzunaJobs];
    } catch (err) {
      console.error('Adzuna search error:', err.message);
    }

    // De-duplicate
    const seen = new Set();
    const unique = [];
    for (const job of jobs) {
      const key = (job.url || '').toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(job);
    }

    // Sort: prioritize company website URLs
    unique.sort((a, b) => {
      const aIsThirdParty = isThirdPartyJobBoard(a.url);
      const bIsThirdParty = isThirdPartyJobBoard(b.url);
      if (aIsThirdParty === bIsThirdParty) return 0;
      return aIsThirdParty ? 1 : -1;
    });

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
