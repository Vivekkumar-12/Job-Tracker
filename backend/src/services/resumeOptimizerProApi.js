import fs from 'fs';
import FormData from 'form-data';

// Using native fetch available in Node.js 18+
const API_BASE_URL = 'https://resumeoptimizerpro.com/api/v1';
const API_KEY = process.env.RESUME_OPTIMIZER_PRO_API_KEY || '';

/**
 * Upload and parse resume using Resume Optimizer Pro API
 */
export async function parseResumeWithOptimizer(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = filePath.split('\\').pop() || 'resume';

    // Create form data
    const form = new FormData();
    form.append('file', fileBuffer, fileName);
    
    // Use API key in headers
    const headers = {
      'x-api-key': API_KEY,
      ...form.getHeaders(),
    };

    console.log('[Resume Optimizer Pro] Uploading to:', `${API_BASE_URL}/parse`);
    
    // Upload to Resume Optimizer Pro API
    const uploadResponse = await fetch(`${API_BASE_URL}/parse`, {
      method: 'POST',
      body: form,
      headers,
    });

    console.log('[Resume Optimizer Pro] Parse response status:', uploadResponse.status);
    
    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('[Resume Optimizer Pro] Parse error:', error);
      throw new Error(`Upload failed: ${uploadResponse.status} - ${error}`);
    }

    const parseData = await uploadResponse.json();
    console.log('[Resume Optimizer Pro] Parse response:', parseData);

    if (!parseData.success && parseData.status !== 'success') {
      throw new Error(`Parse failed: ${parseData.message || 'Unknown error'}`);
    }

    return parseData.data || parseData;
  } catch (error) {
    console.error('[Resume Optimizer Pro] Parse error:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

/**
 * Analyze resume for ATS compliance using Resume Optimizer Pro API
 */
export async function analyzeResumeWithOptimizer(fileOrData, jobDescription = '') {
  try {
    const form = new FormData();
    const endpoint = `${API_BASE_URL}/analyze`;

    // If fileOrData is a file path, upload file
    if (typeof fileOrData === 'string' && fs.existsSync(fileOrData)) {
      const fileBuffer = fs.readFileSync(fileOrData);
      const fileName = fileOrData.split('\\').pop() || 'resume';
      form.append('file', fileBuffer, fileName);
    } else if (typeof fileOrData === 'object') {
      // If it's parsed data, send as JSON with proper multipart format
      form.append('resume_data', JSON.stringify(fileOrData));
    } else {
      throw new Error('Invalid input: expected file path or parsed data');
    }

    if (jobDescription) {
      form.append('job_description', jobDescription);
    }

    // Use API key in headers
    const headers = {
      'x-api-key': API_KEY,
      ...form.getHeaders(),
    };

    console.log('[Resume Optimizer Pro] Analyzing resume...');
    
    const analyzeResponse = await fetch(endpoint, {
      method: 'POST',
      body: form,
      headers,
    });

    console.log('[Resume Optimizer Pro] Analysis response status:', analyzeResponse.status);

    if (!analyzeResponse.ok) {
      const error = await analyzeResponse.text();
      console.error('[Resume Optimizer Pro] Analysis error:', error);
      throw new Error(`Analysis failed: ${analyzeResponse.status} - ${error}`);
    }

    const analysisData = await analyzeResponse.json();
    console.log('[Resume Optimizer Pro] Analysis response:', analysisData);

    if (!analysisData.success && analysisData.status !== 'success') {
      throw new Error(`Analysis failed: ${analysisData.message || 'Unknown error'}`);
    }

    // Format response to match existing structure
    const data = analysisData.data || analysisData;
    return {
      atsScore: data.ats_score || data.score || data.atScore || 0,
      totalIssues: data.issues?.length || 0,
      issues: (data.issues || []).map((issue, idx) => ({
        type: issue.severity?.toLowerCase() || (idx % 3 === 0 ? 'error' : idx % 2 === 0 ? 'warning' : 'info'),
        text: issue.message || issue.text || issue.issue || '',
      })),
      corrections: (data.suggestions || data.improvements || data.recommendations || []).slice(0, 5),
      strengths: data.strengths || [],
      keywords: (data.keywords || []).slice(0, 10),
      improvements: data.improvements || data.suggestions || [],
    };
  } catch (error) {
    console.error('[Resume Optimizer Pro] Analysis error:', error);
    throw error;
  }
}

/**
 * Get resume suggestions using Resume Optimizer Pro API
 */
export async function getResumeSuggestions(filePath, jobDescription = '') {
  try {
    const parseData = await parseResumeWithOptimizer(filePath);
    const analysisData = await analyzeResumeWithOptimizer(parseData, jobDescription);
    return analysisData;
  } catch (error) {
    console.error('[Resume Optimizer Pro] Suggestions error:', error);
    throw error;
  }
}
