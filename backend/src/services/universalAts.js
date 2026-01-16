import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

export const ACTION_VERBS = {
  leadership: [
    'led', 'managed', 'directed', 'supervised', 'mentored',
    'coordinated', 'strategized', 'oversaw', 'headed'
  ],
  technical: [
    'developed', 'designed', 'engineered', 'implemented', 'integrated',
    'optimized', 'automated', 'configured', 'deployed', 'tested'
  ],
  business: [
    'analyzed', 'evaluated', 'negotiated', 'forecasted', 'planned',
    'executed', 'streamlined', 'expanded', 'scaled'
  ],
  creative: [
    'designed', 'crafted', 'produced', 'conceptualized',
    'illustrated', 'edited', 'visualized'
  ],
  finance: [
    'audited', 'budgeted', 'reconciled', 'invested',
    'accounted', 'assessed', 'calculated'
  ],
  healthcare: [
    'diagnosed', 'treated', 'assessed', 'monitored',
    'administered', 'assisted', 'documented'
  ],
  sales_marketing: [
    'generated', 'converted', 'promoted', 'marketed',
    'pitched', 'closed', 'retained'
  ]
};

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return [...new Set(normalize(text).split(' '))];
}

function keywordScore(resume, jd) {
  const r = tokenize(resume);
  const j = tokenize(jd || '');
  if (!j.length) {
    console.log('[ATS] keywordScore: no job description, returning 0');
    return 0;
  }
  const matched = j.filter(w => r.includes(w));
  const score = (matched.length / j.length) * 30;
  console.log('[ATS] keywordScore:', { jdTokens: j.length, resumeTokens: r.length, matched: matched.length, score });
  return score;
}

function skillDensityScore(resume, skills = []) {
  if (!skills.length) {
    console.log('[ATS] skillDensityScore: no skills provided, returning 7');
    return 7;
  }
  const text = normalize(resume);
  const matched = skills.filter(s => text.includes(s.toLowerCase()));
  const score = Math.min((matched.length / skills.length) * 15, 15);
  console.log('[ATS] skillDensityScore:', { skillsTotal: skills.length, matched: matched.length, score });
  return score;
}

function actionVerbScore(resume) {
  const text = normalize(resume);
  let count = 0;

  Object.values(ACTION_VERBS).flat().forEach(v => {
    if (text.includes(v)) count++;
  });

  const score = Math.min((count / 25) * 10, 10);
  console.log('[ATS] actionVerbScore:', { actionVerbsFound: count, score });
  return score;
}

function seniorityScore(resume, jdTitle) {
  const seniorWords = [
    'senior', 'lead', 'manager', 'head', 'director', 'principal'
  ];
  const text = normalize(`${resume} ${jdTitle || ''}`);
  const found = seniorWords.filter(w => text.includes(w));
  const score = found.length ? 10 : 6;
  console.log('[ATS] seniorityScore:', { seniorWordsFound: found, score });
  return score;
}

function experienceScore(resume) {
  const years = resume.match(/(\d+)\+?\s+years?/);
  if (!years) {
    console.log('[ATS] experienceScore: no years found, returning 6');
    return 6;
  }

  const y = parseInt(years[1], 10);
  let score;
  if (y >= 8) score = 10;
  else if (y >= 4) score = 8;
  else if (y >= 1) score = 6;
  else score = 4;
  console.log('[ATS] experienceScore:', { yearsFound: y, score });
  return score;
}

function educationScore(resume) {
  const degrees = [
    'bachelor', 'master', 'phd', 'mba', 'b.tech', 'm.tech',
    'b.sc', 'm.sc', 'diploma'
  ];
  const text = normalize(resume);
  const found = degrees.filter(d => text.includes(d));
  const score = found.length ? 10 : 6;
  console.log('[ATS] educationScore:', { degreesFound: found, score });
  return score;
}

function structureScore(resume) {
  const sections = [
    'experience', 'education', 'skills', 'projects', 'summary'
  ];
  const text = normalize(resume);
  const found = sections.filter(s => text.includes(s));
  const score = Math.min((found.length / sections.length) * 10, 10);
  console.log('[ATS] structureScore:', { sectionsFound: found, score });
  return score;
}

function industryScore(resume, companyKeywords = []) {
  if (!companyKeywords.length) {
    console.log('[ATS] industryScore: no company keywords provided, returning 5');
    return 5;
  }
  const text = normalize(resume);
  const matched = companyKeywords.filter(k => text.includes(k.toLowerCase()));
  const score = Math.min((matched.length / companyKeywords.length) * 5, 5);
  console.log('[ATS] industryScore:', { keywordsTotal: companyKeywords.length, matched: matched.length, score });
  return score;
}

export function calculateUniversalATS({
  resumeText,
  jobDescription,
  jobTitle = '',
  skills = [],
  companyKeywords = []
}) {
  const kScore = keywordScore(resumeText, jobDescription);
  const sdScore = skillDensityScore(resumeText, skills);
  const avScore = actionVerbScore(resumeText);
  const senScore = seniorityScore(resumeText, jobTitle);
  const expScore = experienceScore(resumeText);
  const eduScore = educationScore(resumeText);
  const strScore = structureScore(resumeText);
  const indScore = industryScore(resumeText, companyKeywords);

  console.log('[ATS BREAKDOWN]', {
    keywordScore: kScore,
    skillDensity: sdScore,
    actionVerb: avScore,
    seniority: senScore,
    experience: expScore,
    education: eduScore,
    structure: strScore,
    industry: indScore
  });

  let score = kScore + sdScore + avScore + senScore + expScore + eduScore + strScore + indScore;
  score = Math.round(score);

  console.log('[ATS] Total raw score:', score);

  return {
    atsScore: score,
    grade:
      score >= 85 ? 'Excellent (Shortlist Ready)' :
      score >= 70 ? 'Strong' :
      score >= 55 ? 'Average' :
      'Low',
    recommendation:
      score < 70
        ? 'Improve keyword alignment and action verbs'
        : 'Resume is ATS-optimized',
    breakdown: {
      keywordScore: kScore,
      skillDensity: sdScore,
      actionVerb: avScore,
      seniority: senScore,
      experience: expScore,
      education: eduScore,
      structure: strScore,
      industry: indScore
    }
  };
}

async function extractTextFromFile(filePath) {
  console.log('[ATS] extractTextFromFile called with:', filePath);

  if (!fs.existsSync(filePath)) {
    console.error('[ATS] File does not exist:', filePath);
    throw new Error('File not found');
  }

  const ext = filePath.toLowerCase().split('.').pop();
  console.log('[ATS] File extension:', ext);
  let text = '';

  try {
    if (ext === 'pdf') {
      const buffer = fs.readFileSync(filePath);
      console.log('[ATS] Read PDF file, buffer size:', buffer.length);
      const parsed = await pdfParse(buffer);
      text = (parsed.text || '').trim();
      console.log('[ATS] Extracted PDF text length:', text.length);
    } else if (ext === 'docx' || ext === 'doc') {
      const buffer = fs.readFileSync(filePath);
      console.log('[ATS] Read DOCX file, buffer size:', buffer.length);
      const result = await mammoth.extractRawText({ buffer });
      text = (result.value || '').trim();
      console.log('[ATS] Extracted DOCX text length:', text.length);
    } else {
      throw new Error(`Unsupported file type: ${ext}. Supported: pdf, docx, doc`);
    }
  } catch (err) {
    console.error('[ATS] Error during extraction:', err);
    throw new Error(`Failed to parse resume: ${err.message}`);
  }

  if (!text || text.length === 0) {
    console.error('[ATS] No text extracted from file');
    throw new Error('No readable text found in resume');
  }

  console.log('[ATS] Successfully extracted text from file');
  return text;
}

export async function scoreResumeFile({ filePath, jobDescription = '', jobTitle = '', skills = [], companyKeywords = [] }) {
  console.log('[ATS] scoreResumeFile called with:', {
    filePath,
    jobDescriptionLen: jobDescription.length,
    jobTitle,
    skillsCount: skills.length,
    companiesCount: companyKeywords.length
  });

  const resumeText = await extractTextFromFile(filePath);
  console.log('[ATS] Extracted resume text length:', resumeText.length);
  console.log('[ATS] Resume text preview:', resumeText.substring(0, 200));

  const base = calculateUniversalATS({
    resumeText,
    jobDescription,
    jobTitle,
    skills,
    companyKeywords
  });

  console.log('[ATS] Calculated score:', base.atsScore);
  console.log('[ATS] Full result:', base);

  return {
    ...base,
    resumeTextLength: resumeText.length
  };
}
