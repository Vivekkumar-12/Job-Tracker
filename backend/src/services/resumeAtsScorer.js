/**
 * Resume ATS Scorer Service
 * Calculates ATS score based on:
 * - Keyword match with job description
 * - Resume completeness
 * - Formatting compliance
 */

class ResumeAtsScorer {
  constructor() {
    // Common ATS-compliant fonts
    this.ATSFonts = [
      'Arial', 'Calibri', 'Cambria', 'Courier', 'Courier New',
      'Garamond', 'Georgia', 'Helvetica', 'Times New Roman', 'Verdana'
    ];

    // Common resume keywords by role
    this.roleKeywords = {
      'SDE': ['algorithm', 'data structure', 'system design', 'backend', 'frontend', 'fullstack', 'debugging'],
      'DataAnalyst': ['sql', 'tableau', 'power bi', 'excel', 'statistics', 'data visualization', 'analytics'],
      'ProductManager': ['product strategy', 'roadmap', 'stakeholder management', 'metrics', 'user research'],
      'QA': ['test automation', 'qa', 'testing', 'selenium', 'api testing', 'bug tracking', 'agile']
    };

    // Action verbs for strong resume
    this.actionVerbs = [
      'achieved', 'managed', 'developed', 'implemented', 'designed', 'created',
      'optimized', 'improved', 'increased', 'decreased', 'reduced', 'enhanced',
      'accelerated', 'collaborated', 'coordinated', 'led', 'directed', 'established',
      'executed', 'produced', 'simplified', 'streamlined', 'built', 'deployed'
    ];
  }

  /**
   * Main scoring function
   */
  async scoreResume(resume, jobDescription = null) {
    const scores = {
      keywordMatch: 0,
      completeness: this.scoreCompleteness(resume),
      formatting: this.scoreFormatting(resume),
      overallScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      suggestions: []
    };

    if (jobDescription) {
      const keywordAnalysis = this.analyzeKeywordMatch(resume, jobDescription);
      scores.keywordMatch = keywordAnalysis.score;
      scores.matchedKeywords = keywordAnalysis.matched;
      scores.missingKeywords = keywordAnalysis.missing;
    } else {
      scores.keywordMatch = 50; // Default score without job description
    }

    // Calculate weighted overall score
    scores.overallScore = Math.round(
      scores.keywordMatch * 0.4 +
      scores.completeness * 0.35 +
      scores.formatting * 0.25
    );

    // Generate suggestions
    scores.suggestions = this.generateSuggestions(resume, scores);

    return scores;
  }

  /**
   * Score completeness of resume sections
   */
  scoreCompleteness(resume) {
    const requiredSections = {
      personalInfo: resume.personalInfo?.firstName && resume.personalInfo?.email,
      summary: resume.summary?.content && resume.summary.content.length > 20,
      skills: resume.skills?.technical?.length > 0,
      experience: resume.workExperience?.length > 0,
      education: resume.education?.length > 0
    };

    const completed = Object.values(requiredSections).filter(Boolean).length;
    const completeness = (completed / Object.keys(requiredSections).length) * 100;

    // Bonus for additional sections
    let bonus = 0;
    if (resume.projects?.length > 0) bonus += 10;
    if (resume.certifications?.length > 0) bonus += 5;
    if (resume.achievements?.length > 0) bonus += 5;

    return Math.min(100, Math.round(completeness + bonus));
  }

  /**
   * Score formatting compliance with ATS standards
   */
  scoreFormatting(resume) {
    let score = 100;
    const issues = [];

    // Check personal info formatting
    if (!resume.personalInfo?.email || !this.isValidEmail(resume.personalInfo.email)) {
      score -= 10;
      issues.push('Email format issue');
    }

    // Check for action verbs in experience
    const experienceText = this.extractExperienceText(resume);
    const actionVerbCount = this.countActionVerbs(experienceText);
    if (actionVerbCount === 0) {
      score -= 15;
      issues.push('No action verbs found in experience');
    }

    // Check bullet point quality
    const achievements = resume.workExperience?.flatMap(exp => exp.achievements || []) || [];
    if (achievements.length === 0) {
      score -= 10;
      issues.push('Missing achievement bullet points');
    }

    // Check for metrics/numbers
    const hasMetrics = this.checkForMetrics(experienceText);
    if (!hasMetrics) {
      score -= 5;
      issues.push('Consider adding quantifiable metrics');
    }

    // Check skill diversity
    const totalSkills = (resume.skills?.technical?.length || 0) +
                        (resume.skills?.professional?.length || 0) +
                        (resume.skills?.languages?.length || 0);
    if (totalSkills < 5) {
      score -= 10;
      issues.push(`Add more skills (currently ${totalSkills})`);
    }

    return Math.max(0, score);
  }

  /**
   * Analyze keyword match between resume and job description
   * Also checks for role-specific keywords
   */
  analyzeKeywordMatch(resume, jobDescription) {
    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeText = this.extractAllText(resume).toLowerCase();
    
    // Add role-specific keywords based on detected role
    const detectedRole = this.detectRole(jobDescription.toLowerCase());
    const roleKeywords = detectedRole ? this.roleKeywords[detectedRole] || [] : [];
    
    // Combine job keywords with role-specific keywords
    const allKeywords = [...new Set([...jobKeywords, ...roleKeywords])];
    
    const matched = [];
    const missing = [];

    allKeywords.forEach(keyword => {
      if (resumeText.includes(keyword.toLowerCase())) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    });

    const matchPercentage = allKeywords.length > 0 
      ? (matched.length / allKeywords.length) * 100 
      : 0;

    return {
      score: Math.round(matchPercentage),
      matched: matched.slice(0, 20), // Top 20 matches
      missing: missing.slice(0, 10)  // Top 10 missing
    };
  }

  /**
   * Detect the job role from job description
   */
  detectRole(jobDescriptionLower) {
    for (const [role, keywords] of Object.entries(this.roleKeywords)) {
      if (keywords.some(kw => jobDescriptionLower.includes(kw.toLowerCase()))) {
        return role;
      }
    }
    return null;
  }

  /**
   * Extract keywords from job description
   */
  extractKeywords(jobDescription) {
    // Split by common delimiters and filter
    const words = jobDescription
      .toLowerCase()
      .split(/[\s,;.\n]+/)
      .filter(word => word.length > 3);

    // Remove common words
    const stopwords = new Set([
      'the', 'and', 'with', 'you', 'your', 'will', 'have', 'from', 'this',
      'that', 'which', 'about', 'their', 'would', 'should', 'could', 'are'
    ]);

    const keywords = [...new Set(words.filter(w => !stopwords.has(w)))];
    return keywords.slice(0, 30); // Top 30 keywords
  }

  /**
   * Extract all text from resume
   */
  extractAllText(resume) {
    const parts = [
      resume.personalInfo?.firstName,
      resume.personalInfo?.lastName,
      resume.summary?.content,
      resume.skills?.technical?.join(' '),
      resume.skills?.professional?.join(' '),
      resume.workExperience?.map(exp => `${exp.company} ${exp.position} ${exp.description} ${exp.achievements?.join(' ')}`).join(' '),
      resume.education?.map(edu => `${edu.institution} ${edu.degree} ${edu.field}`).join(' '),
      resume.projects?.map(proj => `${proj.name} ${proj.description} ${proj.technologies?.join(' ')}`).join(' '),
      resume.certifications?.map(cert => `${cert.name} ${cert.issuer}`).join(' ')
    ];

    return parts.filter(Boolean).join(' ');
  }

  /**
   * Extract experience text
   */
  extractExperienceText(resume) {
    return resume.workExperience
      ?.map(exp => `${exp.company} ${exp.position} ${exp.description} ${exp.achievements?.join(' ')}`)
      .join(' ') || '';
  }

  /**
   * Count action verbs in text
   */
  countActionVerbs(text) {
    const lowerText = text.toLowerCase();
    return this.actionVerbs.filter(verb => lowerText.includes(verb)).length;
  }

  /**
   * Check for metrics/numbers
   */
  checkForMetrics(text) {
    return /(\d+%|increased|decreased|\$|revenue|growth|improved)/.test(text);
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Generate improvement suggestions
   */
  generateSuggestions(resume, scores) {
    const suggestions = [];

    // Keyword suggestions
    if (scores.keywordMatch < 70) {
      suggestions.push('Add more relevant keywords from the job description to improve keyword match score');
    }

    // Completeness suggestions
    if (scores.completeness < 80) {
      if (!resume.summary?.content) {
        suggestions.push('Add a professional summary to improve completeness');
      }
      if (!resume.projects?.length) {
        suggestions.push('Include projects section to showcase your work');
      }
    }

    // Formatting suggestions
    if (scores.formatting < 80) {
      const experienceText = this.extractExperienceText(resume);
      if (this.countActionVerbs(experienceText) < 5) {
        suggestions.push('Use more action verbs (achieved, managed, developed, etc.) in bullet points');
      }
      if (!this.checkForMetrics(experienceText)) {
        suggestions.push('Add quantifiable metrics (%, numbers, $ amounts) to achievements');
      }
    }

    // Skill suggestions
    const totalSkills = (resume.skills?.technical?.length || 0) +
                        (resume.skills?.professional?.length || 0);
    if (totalSkills < 10) {
      suggestions.push(`Expand skill list. Currently have ${totalSkills} skills, consider adding 10-15`);
    }

    // Experience suggestions
    if (!resume.workExperience?.some(exp => (exp.achievements || []).length >= 3)) {
      suggestions.push('Add at least 3 bullet points per job with achievements and impact');
    }

    return suggestions.slice(0, 5); // Top 5 suggestions
  }

  /**
   * Generate ATS-safe version of resume text
   */
  getATSOptimizedText(resume) {
    const sections = [];

    // Personal Info
    if (resume.personalInfo?.firstName) {
      sections.push(`${resume.personalInfo.firstName} ${resume.personalInfo.lastName || ''}`);
      if (resume.personalInfo?.email) sections.push(resume.personalInfo.email);
      if (resume.personalInfo?.phone) sections.push(resume.personalInfo.phone);
      if (resume.personalInfo?.location) sections.push(resume.personalInfo.location);
    }

    // Summary
    if (resume.summary?.content) {
      sections.push('PROFESSIONAL SUMMARY');
      sections.push(resume.summary.content);
    }

    // Skills
    if (resume.skills?.technical?.length) {
      sections.push('TECHNICAL SKILLS');
      sections.push(resume.skills.technical.join(', '));
    }

    // Experience
    if (resume.workExperience?.length) {
      sections.push('WORK EXPERIENCE');
      resume.workExperience.forEach(exp => {
        sections.push(`${exp.position} at ${exp.company}`);
        if (exp.achievements?.length) {
          sections.push(exp.achievements.join('\n'));
        }
      });
    }

    // Education
    if (resume.education?.length) {
      sections.push('EDUCATION');
      resume.education.forEach(edu => {
        sections.push(`${edu.degree} in ${edu.field} from ${edu.institution}`);
      });
    }

    return sections.join('\n');
  }
}

export default new ResumeAtsScorer();
