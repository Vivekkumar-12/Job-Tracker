import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

async function extractResumeText(file) {
  try {
    // Handle both Express file object and raw file info
    const filePath = file.path || file.filepath;
    const mimeType = file.mimetype || file.type || '';

    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    if (mimeType.includes('pdf') || filePath.endsWith('.pdf')) {
      const data = await pdf(fs.readFileSync(filePath));
      return data.text || '';
    }

    if (mimeType.includes('word') || mimeType.includes('document') || 
        filePath.endsWith('.docx') || filePath.endsWith('.doc')) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    throw new Error(`Failed to extract resume text: ${error.message}`);
  }
}

export { extractResumeText };
