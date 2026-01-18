import fs from 'fs';
import { createRequire } from 'module';
import * as mammothModule from 'mammoth';
const mammoth = mammothModule.default || mammothModule;

// Import pdf-parse using createRequire for CommonJS compatibility
const require = createRequire(import.meta.url);
let pdfParse;
try {
  const pdfParseModule = require('pdf-parse');
  pdfParse = pdfParseModule.default || pdfParseModule;
  console.log('[localAts] pdfParse loaded successfully, type:', typeof pdfParse);
} catch (err) {
  console.error('[localAts] Failed to load pdfParse:', err.message);
}

const TECH_KEYWORDS = [
  'javascript', 'react', 'node', 'typescript', 'java', 'python', 'css', 'html',
  'aws', 'docker', 'kubernetes', 'sql', 'graphql', 'rest', 'mongodb', 'postgres',
  'azure', 'gcp', 'linux', 'git', 'ci/cd', 'terraform', 'ansible', 'microservices',
  'c++', 'c#', '.net', 'ruby', 'go', 'rust', 'scala', 'elixir', 'php', 'jsp',
  'spring', 'hibernate', 'jpa', 'django', 'flask', 'fastapi', 'express', 'next',
  'nextjs', 'nuxt', 'vue', 'angular', 'svelte', 'webpack', 'vite', 'rollup', 'parcel', 
  'junit', 'pytest', 'jest', 'vitest', 'mocha',
  'jenkins', 'github actions', 'gitlab ci', 'circleci', 'bitbucket', 'jira', 'confluence',
  'bun', 'deno', 'remix', 'qwik', 'astro', 'solid', 'htmx', 'alpinejs',
  'tailwindcss', 'bootstrap', 'material ui', 'shadcn', 'storybook',
  'postgresql', 'mysql', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
  'web3', 'solidity', 'ethereum', 'blockchain', 'crypto',
  'machine learning', 'tensorflow', 'pytorch', 'scikit-learn', 'huggingface',
  'nlp', 'llm', 'gpt', 'langchain', 'llamaindex', 'vertexai', 'anthropic',
];

const SECTION_PATTERNS = [
  { name: 'Experience', regex: /\b(experience|work experience|employment history)\b/i, weight: 12 },
  { name: 'Skills', regex: /\b(skills|technical skills|key skills)\b/i, weight: 12 },
  { name: 'Education', regex: /\b(education|academic background|qualifications)\b/i, weight: 10 },
  { name: 'Summary', regex: /\b(summary|professional summary|objective|profile)\b/i, weight: 8 },
  { name: 'Projects', regex: /\b(projects|personal projects)\b/i, weight: 6 },
];

const CONTACT_PATTERNS = [
  { name: 'Email', regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, weight: 5 },
  { name: 'Phone', regex: /\+?\d[\d\s().-]{8,}\d/, weight: 5 },
  { name: 'LinkedIn', regex: /linkedin\.com\/[A-Za-z0-9_-]+/i, weight: 4 },
];

function extractKeywords(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const kw of TECH_KEYWORDS) {
    if (lower.includes(kw) && found.length < 10) found.push(kw);
  }
  return found;
}

function computeQuantifiable(text) {
  // Look for numbers, percentages, and action verbs
  const hasNumbers = /\b\d{1,3}(?:\.\d+)?\b/.test(text);
  const hasPercents = /\d{1,3}\s?%/.test(text);
  const actionVerbs = /(increased|improved|reduced|optimized|grew|led|built|designed|implemented|delivered|achieved)/i.test(text);
  let weight = 0;
  if (hasNumbers) weight += 5;
  if (hasPercents) weight += 5;
  if (actionVerbs) weight += 5;
  return Math.min(12, weight); // cap
}

export async function analyzeResumeLocally(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  const ext = filePath.toLowerCase().split('.').pop();
  let text = '';

  // Extract text from PDF or Word document
  try {
    if (ext === 'pdf') {
      if (!pdfParse || typeof pdfParse !== 'function') {
        throw new Error('PDF parsing is not available. Please use the Resume Optimizer Pro API.');
      }
      const buffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(buffer);
      text = (parsed.text || '').trim();
    } else if (ext === 'docx' || ext === 'doc') {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      text = (result.value || '').trim();
    } else {
      throw new Error(`Unsupported file type: ${ext}. Supported: pdf, docx, doc`);
    }
  } catch (err) {
    throw new Error(`Failed to parse resume: ${err.message}`);
  }

  if (!text || text.length === 0) {
    throw new Error('No readable text found in resume');
  }

  let atsScore = 50; // baseline
  const strengths = [];
  const improvements = [];

  // Sections scoring
  for (const s of SECTION_PATTERNS) {
    if (s.regex.test(text)) {
      atsScore += s.weight;
      strengths.push(`${s.name} section present`);
    } else {
      improvements.push(`Add a ${s.name} section`);
    }
  }

  // Contact info scoring
  let contactScore = 0;
  for (const c of CONTACT_PATTERNS) {
    if (c.regex.test(text)) {
      atsScore += c.weight;
      contactScore += c.weight;
      strengths.push(`${c.name} found`);
    }
  }
  if (contactScore === 0) {
    improvements.push('Include contact information (email, phone, LinkedIn)');
  }

  // Quantifiable achievements
  const quantWeight = computeQuantifiable(text);
  if (quantWeight >= 8) {
    strengths.push('Quantifiable achievements detected');
  } else {
    improvements.push('Quantify achievements with numbers and percentages');
  }
  atsScore += quantWeight;

  // Keywords scoring
  const kws = extractKeywords(text);
  const keywordScore = Math.min(20, kws.length * 2);
  atsScore += keywordScore;
  if (kws.length > 0) {
    strengths.push(`${kws.length} technical keywords identified`);
  } else {
    improvements.push('Include relevant technical keywords from job descriptions');
  }

  // Formatting check
  const hasBullets = /\n\s*[•\-\*]/.test(text);
  const hasConsistentCaps = /\b[A-Z][a-z]+\b/.test(text);
  if (hasBullets && hasConsistentCaps) {
    atsScore += 5;
    strengths.push('Readable formatting detected');
  } else if (!hasBullets) {
    improvements.push('Use bullet points for better readability');
  }

  // Length score (1-2 pages ideal)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 1000) {
    atsScore += 5;
    strengths.push(`Optimal length (${wordCount} words)`);
  } else if (wordCount < 200) {
    improvements.push('Expand resume to include more details (aim for 200-1000 words)');
  } else if (wordCount > 1000) {
    improvements.push('Condense resume to 1-2 pages for better ATS compatibility');
  }

  // Clamp score to 0-100
  atsScore = Math.max(0, Math.min(100, Math.round(atsScore)));

  // Normalize improvements list
  const defaultImprovements = [
    'Use standard headers (Experience, Skills, Education)',
    'Avoid tables and graphics not parsed by ATS',
    'Include role-specific keywords',
    'Keep it to 1–2 pages with clear sections',
  ];
  const improvementsFinal = (improvements.length ? improvements : defaultImprovements).slice(0, 4);

  return {
    atsScore,
    strengths,
    improvements: improvementsFinal,
    keywords: kws.slice(0, 10),
  };
}
