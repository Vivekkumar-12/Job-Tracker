import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeResumeWithAI = async (resumeFilePath) => {
  try {
    // Read and parse PDF
    const dataBuffer = fs.readFileSync(resumeFilePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    // Initialize Gemini model with lower temperature for consistency
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create detailed prompt with specific scoring criteria
    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze this resume using strict ATS criteria.

Resume Content:
${resumeText}

Score the resume on these specific ATS criteria:
- Format: Is it simple, clean, ATS-friendly (no tables, columns, images)?
- Keywords: Are there industry-specific keywords and skills?
- Structure: Clear sections (Contact, Summary, Experience, Skills, Education)?
- Quantification: Use of numbers/metrics in achievements?
- Readability: Easy for scanners to parse?

Provide response ONLY in this JSON format (no other text):
{
  "atsScore": <number 0-100 based on: format 20%, keywords 30%, structure 20%, quantification 20%, readability 10%>,
  "strengths": [
    "<specific strength found in this resume>",
    "<specific strength found in this resume>",
    "<specific strength found in this resume>"
  ],
  "improvements": [
    "<specific improvement needed for this resume>",
    "<specific improvement needed for this resume>",
    "<specific improvement needed for this resume>",
    "<specific improvement needed for this resume>"
  ],
  "keywords": [
    "<keyword missing from this resume>",
    "<keyword missing from this resume>",
    "<keyword missing from this resume>",
    "<keyword missing from this resume>",
    "<keyword missing from this resume>"
  ]
}`;

    // Generate response with controlled temperature
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3, // Lower temperature for consistent results
        topP: 0.8,
        topK: 40,
      },
    });
    
    const response = await result.response;
    const text = response.text();
  ]
}

Focus on:
1. ATS Score: Rate how well this resume would pass through Applicant Tracking Systems (0-100)
2. Strengths: Identify what's working well (use of action verbs, quantifiable achievements, formatting, etc.)
3. Improvements: Provide specific, actionable suggestions to enhance the resume
4. Keywords: Suggest important industry-specific keywords that should be included

Return ONLY the JSON object, no additional text.`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return analysis;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze resume with AI: ' + error.message);
  }
};
