import JobListing from '../models/JobListing.js';
import url from 'url';

// Get all job listings
export const getJobListings = async (req, res) => {
  try {
    const { search, location, source } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (source) {
      query.source = source;
    }

    const listings = await JobListing.find(query).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single job listing
export const getJobListing = async (req, res) => {
  try {
    const listing = await JobListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Job listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create job listing
export const createJobListing = async (req, res) => {
  try {
    const listing = new JobListing(req.body);
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update job listing
export const updateJobListing = async (req, res) => {
  try {
    const listing = await JobListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!listing) return res.status(404).json({ error: 'Job listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete job listing
export const deleteJobListing = async (req, res) => {
  try {
    const listing = await JobListing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Job listing not found' });
    res.json({ message: 'Job listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const listing = await JobListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Job listing not found' });
    listing.isBookmarked = !listing.isBookmarked;
    await listing.save();
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enrich job details from a public job URL (best-effort)
export const enrichFromUrl = async (req, res) => {
  try {
    const { jobUrl } = req.body || {};
    if (!jobUrl) return res.status(400).json({ error: 'jobUrl is required' });

    // Fetch HTML
    const response = await fetch(jobUrl, { redirect: 'follow' });
    const html = await response.text();

    // Helper to extract meta content
    const meta = (prop) => {
      const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)`, 'i');
      const m = html.match(re);
      return m ? m[1] : '';
    };

    // Title from og:title, twitter:title, or <title>
    const ogTitle = meta('og:title') || meta('twitter:title');
    let title = ogTitle;
    if (!title) {
      const m = html.match(/<title>([^<]+)<\/title>/i);
      title = m ? m[1] : '';
    }

    // Company from og:site_name or domain with special-case mapping
    let company = meta('og:site_name');
    let hostname = '';
    try {
      hostname = new URL(jobUrl).hostname.replace(/^www\./, '');
    } catch {}

    if (!company) {
      try {
        company = hostname.split('.')[0];
        company = company.charAt(0).toUpperCase() + company.slice(1);
      } catch {}
    }

    // Special-case: Talent500 acts as an application platform; company should be ANSR
    if (hostname.includes('talent500')) {
      company = 'ANSR';
    }

    // Try basic location extraction heuristics
    let location = '';
    const locMatch = html.match(/Location\s*[:\-]\s*<[^>]*>|Location\s*[:\-]\s*([^<\n]+)/i);
    if (locMatch) {
      location = (locMatch[1] || '').trim();
    }

    // Try salary extraction heuristics
    let salary = '';
    const salMatch = html.match(/\$\s?\d{2,3}[,\d]*\s?(?:-\s?\$?\d{2,3}[,\d]*)?|₹\s?\d+[,\d]*|€\s?\d+[.,\d]*/);
    if (salMatch) salary = salMatch[0];

    // Clean title if it contains separators
    if (title && company && title.toLowerCase().includes(company.toLowerCase())) {
      // remove company prefix/suffix like "Company - Job Title"
      title = title.replace(new RegExp(`^${company}\s*[-|–|•]\s*`, 'i'), '').trim();
    }

    return res.json({
      jobTitle: title || '',
      company: company || '',
      location: location || '',
      salary: salary || '',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
