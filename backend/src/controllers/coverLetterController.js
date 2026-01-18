import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
import * as mammothModule from 'mammoth';
const mammoth = mammothModule.default || mammothModule;
import CoverLetter from '../models/CoverLetter.js';
import Tesseract from 'tesseract.js';

// Import pdf-parse using createRequire for CommonJS compatibility
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;

const extractTextFromFile = async (absolutePath) => {
  try {
    const ext = path.extname(absolutePath).toLowerCase();
    if (ext === '.pdf') {
      try {
        const dataBuffer = await fsPromises.readFile(absolutePath);
        const pdfData = await pdfParse(dataBuffer);
        
        if (pdfData.text && pdfData.text.trim()) {
          const cleaned = pdfData.text.replace(/\n{3,}/g, '\n\n').trim();
          console.log('[CoverLetters] PDF text extracted:', cleaned.length, 'characters');
          return cleaned;
        }
        
        // If no text found, attempt OCR
        console.log('[CoverLetters] No text found, attempting OCR...');
        try {
          const { data: { text } } = await Tesseract.recognize(absolutePath, 'eng', {
            logger: (m) => console.log('[OCR]', m.status, '-', Math.round(m.progress * 100) + '%')
          });
          
          if (text && text.trim()) {
            const cleaned = text.replace(/\n{3,}/g, '\n\n').trim();
            console.log('[CoverLetters] OCR extracted:', cleaned.length, 'characters');
            return cleaned;
          }
        } catch (ocrErr) {
          console.error('[CoverLetters] OCR failed:', ocrErr?.message);
        }
        
        return '';
      } catch (pdfErr) {
        console.error('[CoverLetters] PDF extraction failed:', pdfErr?.message);
        return '';
      }
    }
    if (ext === '.docx') {
      const data = await fsPromises.readFile(absolutePath);
      const result = await mammoth.extractRawText({ buffer: data });
      const text = result.value || '';
      console.log('[CoverLetters] DOCX extracted:', text.length, 'characters');
      return text.trim();
    }
    if (ext === '.txt' || ext === '.md' || ext === '.html') {
      const text = await fsPromises.readFile(absolutePath, 'utf8');
      console.log('[CoverLetters] Text file read:', text.length, 'characters');
      return text || '';
    }
    return '';
  } catch (err) {
    console.error('[CoverLetters] extractTextFromFile error:', err?.message);
    return '';
  }
};

export const getCoverLetters = async (req, res) => {
  try {
    const docs = await CoverLetter.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCoverLetter = async (req, res) => {
  try {
    const doc = await CoverLetter.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Cover letter not found' });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCoverLetter = async (req, res) => {
  try {
    const file = req.file;
    const { name, content, isProtected } = req.body;

    const letter = new CoverLetter({
      userId: req.user.id,
      name: name || 'My Cover Letter',
      content: content || '',
      isProtected: Boolean(isProtected) || false,
      usedFor: 0,
      lastModified: new Date()
    });

    if (file) {
      letter.filename = file.originalname;
      letter.fileSize = file.size;
      letter.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      // Try to extract text content for editor convenience
      const absolutePath = path.join(process.cwd(), 'uploads', file.filename);
      const extracted = await extractTextFromFile(absolutePath);
      if (extracted && extracted.trim()) {
        letter.content = extracted.trim();
      }
    }

    await letter.save();
    res.status(201).json({ success: true, message: 'Cover letter created', data: letter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCoverLetter = async (req, res) => {
  try {
    const letter = await CoverLetter.findOne({ _id: req.params.id, userId: req.user.id });
    if (!letter) return res.status(404).json({ error: 'Cover letter not found' });

    const file = req.file;
    const { name, content, isProtected, usedFor } = req.body;

    if (name !== undefined) letter.name = name;
    if (content !== undefined) letter.content = content;
    if (isProtected !== undefined) letter.isProtected = Boolean(isProtected);
    if (usedFor !== undefined) letter.usedFor = Number(usedFor) || 0;
    letter.lastModified = new Date();

    if (file) {
      // Optional: delete previous file if not used elsewhere
      // (skipped for safety)
      letter.filename = file.originalname;
      letter.fileSize = file.size;
      letter.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      // Update content from file if not explicitly provided
      if (!content) {
        const absolutePath = path.join(process.cwd(), 'uploads', file.filename);
        const extracted = await extractTextFromFile(absolutePath);
        if (extracted && extracted.trim()) {
          letter.content = extracted.trim();
        }
      }
    }

    await letter.save();
    res.json({ success: true, message: 'Cover letter updated', data: letter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCoverLetter = async (req, res) => {
  try {
    const letter = await CoverLetter.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!letter) return res.status(404).json({ error: 'Cover letter not found' });
    res.json({ success: true, message: 'Cover letter deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const extractCoverLetterContent = async (req, res) => {
  try {
    const letter = await CoverLetter.findOne({ _id: req.params.id, userId: req.user.id });
    if (!letter) return res.status(404).json({ error: 'Cover letter not found' });
    if (!letter.fileUrl) return res.status(400).json({ error: 'No file available to extract from' });

    const filename = path.basename(letter.fileUrl);
    const absolutePath = path.join(process.cwd(), 'uploads', filename);
    if (!fs.existsSync(absolutePath)) return res.status(404).json({ error: 'Source file not found' });

    const extracted = await extractTextFromFile(absolutePath);
    if (extracted && extracted.trim()) {
      letter.content = extracted.trim();
      letter.lastModified = new Date();
      await letter.save();
    }

    res.json({ success: true, message: 'Content extracted', data: letter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const extractTextFromUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const absolutePath = path.join(process.cwd(), 'uploads', file.filename);
    const extracted = await extractTextFromFile(absolutePath);
    
    // Delete temp file after extraction
    try {
      fs.unlinkSync(absolutePath);
    } catch (e) {
      console.warn('[CoverLetters] Could not delete temp file:', e?.message);
    }

    res.json({ success: true, content: extracted?.trim() || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getCoverLetters,
  getCoverLetter,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  extractCoverLetterContent,
  extractTextFromUpload
};
