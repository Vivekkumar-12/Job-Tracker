/**
 * Universal Search Service
 * Provides comprehensive search across all app content:
 * - Applications
 * - Resumes
 * - Cover Letters
 * - Reminders
 * - Job Listings
 * - And more...
 */

import { apiClient } from './apiClient';

/**
 * Advanced text matching with flexible logic
 * - Case insensitive
 * - Partial matches
 * - Multi-word matching (all words must be present)
 * - Fuzzy matching for typos
 */
const createMatcher = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);

  return {
    // Exact phrase match
    isExactMatch: (text) => {
      if (!text) return false;
      return String(text).toLowerCase().includes(normalizedQuery);
    },

    // All words must be present (in any order)
    isMultiWordMatch: (text) => {
      if (!text) return false;
      const normalizedText = String(text).toLowerCase();
      return queryWords.every(word => normalizedText.includes(word));
    },

    // Any word matches
    isAnyWordMatch: (text) => {
      if (!text) return false;
      const normalizedText = String(text).toLowerCase();
      return queryWords.some(word => normalizedText.includes(word));
    },

    // Fuzzy match - allows for small typos
    isFuzzyMatch: (text) => {
      if (!text) return false;
      const normalizedText = String(text).toLowerCase();
      // Simple fuzzy: if 80% of query words are present, it's a match
      const matchedWords = queryWords.filter(word => normalizedText.includes(word));
      return matchedWords.length >= Math.ceil(queryWords.length * 0.8);
    },

    // Get best match score for ranking
    getMatchScore: (text) => {
      if (!text) return 0;
      const normalizedText = String(text).toLowerCase();
      let score = 0;

      // Exact phrase match (highest priority)
      if (normalizedText === normalizedQuery) score += 100;
      else if (normalizedText.startsWith(normalizedQuery)) score += 90;
      else if (normalizedText.includes(normalizedQuery)) score += 80;

      // Word matches
      const matchedWords = queryWords.filter(word => normalizedText.includes(word));
      score += matchedWords.length * 10;

      return score;
    }
  };
};

/**
 * Flatten and extract all searchable text from an object
 */
const extractSearchableText = (obj) => {
  if (!obj) return '';
  
  let text = '';
  
  const extract = (val) => {
    if (val === null || val === undefined) return;
    
    if (typeof val === 'string') {
      text += ' ' + val;
    } else if (typeof val === 'number') {
      text += ' ' + val.toString();
    } else if (Array.isArray(val)) {
      val.forEach(item => extract(item));
    } else if (typeof val === 'object') {
      Object.values(val).forEach(v => extract(v));
    }
  };
  
  extract(obj);
  return text;
};

/**
 * Search applications by company, job title, location, status, etc.
 */
const searchApplications = async (query) => {
  const matcher = createMatcher(query);
  
  try {
    const applications = await apiClient.applications.getAll();
    
    return (applications || [])
      .map(app => ({
        ...app,
        matchScore: Math.max(
          matcher.getMatchScore(app.companyName),
          matcher.getMatchScore(app.jobTitle),
          matcher.getMatchScore(app.location),
          matcher.getMatchScore(app.status),
          matcher.getMatchScore(app.jobType),
          matcher.getMatchScore(app.workMode),
          matcher.getMatchScore(app.notes),
          matcher.getMatchScore(extractSearchableText(app))
        )
      }))
      .filter(app => app.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(app => ({
        id: app._id,
        title: app.companyName || 'Untitled Application',
        subtitle: `${app.jobTitle || 'No title'} • ${app.status || 'N/A'}`,
        description: app.location || 'No location',
        type: 'application',
        path: `/applications/${app._id}`,
        icon: '📋',
        matchScore: app.matchScore,
        metadata: {
          company: app.companyName,
          jobTitle: app.jobTitle,
          status: app.status,
          location: app.location
        }
      }));
  } catch (error) {
    console.error('Error searching applications:', error);
    return [];
  }
};

/**
 * Search resumes by title, skills, experience, education, etc.
 */
const searchResumes = async (query) => {
  const matcher = createMatcher(query);
  
  try {
    const resumeResponse = await apiClient.resumes.getAll();
    const resumes = Array.isArray(resumeResponse?.data)
      ? resumeResponse.data
      : Array.isArray(resumeResponse)
        ? resumeResponse
        : [];
    
    return (resumes || [])
      .map(resume => ({
        ...resume,
        matchScore: Math.max(
          matcher.getMatchScore(resume.title),
          matcher.getMatchScore(resume.subtitle),
          matcher.getMatchScore(resume.professionalSummary),
          matcher.getMatchScore(resume.email),
          matcher.getMatchScore(resume.phone),
          matcher.getMatchScore(extractSearchableText(resume.skills)),
          matcher.getMatchScore(extractSearchableText(resume.experience)),
          matcher.getMatchScore(extractSearchableText(resume.education)),
          matcher.getMatchScore(extractSearchableText(resume))
        )
      }))
      .filter(resume => resume.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(resume => ({
        id: resume._id,
        title: resume.title || 'Untitled Resume',
        subtitle: resume.subtitle || 'No subtitle',
        description: `${resume.skills?.length || 0} skills • ${resume.experience?.length || 0} experiences`,
        type: 'resume',
        path: `/resumes/${resume._id}`,
        icon: '📄',
        matchScore: resume.matchScore,
        metadata: {
          skillsCount: resume.skills?.length || 0,
          experienceCount: resume.experience?.length || 0,
          educationCount: resume.education?.length || 0
        }
      }));
  } catch (error) {
    console.error('Error searching resumes:', error);
    return [];
  }
};

/**
 * Search cover letters by title, content, etc.
 */
const searchCoverLetters = async (query) => {
  const matcher = createMatcher(query);
  
  try {
    const coverLetterResponse = await apiClient.coverLetters.getAll();
    const coverLetters = Array.isArray(coverLetterResponse?.data)
      ? coverLetterResponse.data
      : Array.isArray(coverLetterResponse)
        ? coverLetterResponse
        : [];
    
    return (coverLetters || [])
      .map(cl => ({
        ...cl,
        matchScore: Math.max(
          matcher.getMatchScore(cl.title),
          matcher.getMatchScore(cl.companyName),
          matcher.getMatchScore(cl.content),
          matcher.getMatchScore(cl.jobTitle),
          matcher.getMatchScore(extractSearchableText(cl))
        )
      }))
      .filter(cl => cl.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(cl => ({
        id: cl._id,
        title: cl.companyName || 'Untitled Cover Letter',
        subtitle: cl.jobTitle || 'No job title',
        description: `${cl.content?.length || 0} characters`,
        type: 'coverLetter',
        path: `/cover-letters/${cl._id}`,
        icon: '📝',
        matchScore: cl.matchScore,
        metadata: {
          company: cl.companyName,
          jobTitle: cl.jobTitle,
          length: cl.content?.length || 0
        }
      }));
  } catch (error) {
    console.error('Error searching cover letters:', error);
    return [];
  }
};

/**
 * Search reminders by title, company, description, etc.
 */
const searchReminders = async (query) => {
  const matcher = createMatcher(query);
  
  try {
    const reminders = await apiClient.reminders.getAll();
    
    return (reminders || [])
      .map(reminder => ({
        ...reminder,
        matchScore: Math.max(
          matcher.getMatchScore(reminder.title),
          matcher.getMatchScore(reminder.company),
          matcher.getMatchScore(reminder.description),
          matcher.getMatchScore(reminder.type),
          matcher.getMatchScore(extractSearchableText(reminder))
        )
      }))
      .filter(reminder => reminder.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(reminder => ({
        id: reminder._id,
        title: reminder.title,
        subtitle: reminder.company || reminder.type || 'Reminder',
        description: new Date(reminder.reminderDate).toLocaleDateString(),
        type: 'reminder',
        path: `/reminders`,
        icon: '🔔',
        matchScore: reminder.matchScore,
        metadata: {
          company: reminder.company,
          reminderType: reminder.type,
          date: reminder.reminderDate,
          isCompleted: reminder.isCompleted
        }
      }));
  } catch (error) {
    console.error('Error searching reminders:', error);
    return [];
  }
};

/**
 * Search job listings by title, company, location, etc.
 */
const searchJobListings = async (query) => {
  const matcher = createMatcher(query);
  
  try {
    const jobListings = await apiClient.jobListings.getAll();
    
    return (jobListings || [])
      .map(job => ({
        ...job,
        matchScore: Math.max(
          matcher.getMatchScore(job.title),
          matcher.getMatchScore(job.company),
          matcher.getMatchScore(job.location),
          matcher.getMatchScore(job.description),
          matcher.getMatchScore(job.jobType),
          matcher.getMatchScore(extractSearchableText(job))
        )
      }))
      .filter(job => job.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(job => ({
        id: job._id,
        title: job.title || 'Untitled Job',
        subtitle: job.company || 'Unknown Company',
        description: job.location || 'Remote',
        type: 'jobListing',
        path: `/job-listings/${job._id}`,
        icon: '💼',
        matchScore: job.matchScore,
        metadata: {
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          salary: job.salary
        }
      }));
  } catch (error) {
    console.error('Error searching job listings:', error);
    return [];
  }
};

/**
 * Universal search across all content types
 * Returns results grouped by type and sorted by relevance
 */
export const universalSearch = async (query) => {
  if (!query || !query.trim()) {
    return {
      query: '',
      results: [],
      byType: {},
      total: 0,
      isEmpty: true
    };
  }

  try {
    // Search all content types in parallel
    const [
      applications,
      resumes,
      coverLetters,
      reminders,
      jobListings
    ] = await Promise.allSettled([
      searchApplications(query),
      searchResumes(query),
      searchCoverLetters(query),
      searchReminders(query),
      searchJobListings(query)
    ]);

    // Extract results from settled promises
    const appResults = applications.status === 'fulfilled' ? applications.value : [];
    const resumeResults = resumes.status === 'fulfilled' ? resumes.value : [];
    const clResults = coverLetters.status === 'fulfilled' ? coverLetters.value : [];
    const reminderResults = reminders.status === 'fulfilled' ? reminders.value : [];
    const jobResults = jobListings.status === 'fulfilled' ? jobListings.value : [];

    // Combine and sort by match score
    const allResults = [
      ...appResults,
      ...resumeResults,
      ...clResults,
      ...reminderResults,
      ...jobResults
    ].sort((a, b) => b.matchScore - a.matchScore);

    // Group by type
    const byType = {
      application: appResults,
      resume: resumeResults,
      coverLetter: clResults,
      reminder: reminderResults,
      jobListing: jobResults
    };

    return {
      query,
      results: allResults.slice(0, 20), // Limit to 20 results
      byType,
      total: allResults.length,
      isEmpty: allResults.length === 0,
      summary: {
        applications: appResults.length,
        resumes: resumeResults.length,
        coverLetters: clResults.length,
        reminders: reminderResults.length,
        jobListings: jobResults.length
      }
    };
  } catch (error) {
    console.error('Error performing universal search:', error);
    return {
      query,
      results: [],
      byType: {},
      total: 0,
      isEmpty: true,
      error: error.message
    };
  }
};

/**
 * Get search suggestions as user types
 */
export const getSearchSuggestions = async (query) => {
  if (!query || query.length < 2) return [];

  try {
    const results = await universalSearch(query);
    
    // Get top unique suggestions from each type
    const suggestions = [];
    const titles = new Set();

    results.results.forEach(result => {
      if (!titles.has(result.title) && suggestions.length < 8) {
        titles.add(result.title);
        suggestions.push({
          text: result.title,
          type: result.type,
          icon: result.icon
        });
      }
    });

    return suggestions;
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

/**
 * Get trending searches (most recently viewed/created items)
 */
export const getTrendingSearches = async () => {
  try {
    const [applications, resumes, reminders] = await Promise.allSettled([
      apiClient.applications.getAll(),
      apiClient.resumes.getAll(),
      apiClient.reminders.getAll()
    ]);

    const trending = [];

    // Add recent applications
    if (applications.status === 'fulfilled' && applications.value?.length > 0) {
      applications.value
        .slice(0, 3)
        .forEach(app => {
          trending.push({
            title: app.companyName || 'Application',
            type: 'application',
            icon: '📋'
          });
        });
    }

    // Add recent resumes
    if (resumes.status === 'fulfilled' && resumes.value?.length > 0) {
      resumes.value
        .slice(0, 3)
        .forEach(resume => {
          trending.push({
            title: resume.title || 'Resume',
            type: 'resume',
            icon: '📄'
          });
        });
    }

    // Add recent reminders
    if (reminders.status === 'fulfilled' && reminders.value?.length > 0) {
      reminders.value
        .slice(0, 2)
        .forEach(reminder => {
          trending.push({
            title: reminder.title || 'Reminder',
            type: 'reminder',
            icon: '🔔'
          });
        });
    }

    return trending.slice(0, 8);
  } catch (error) {
    console.error('Error getting trending searches:', error);
    return [];
  }
};
