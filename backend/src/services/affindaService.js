import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const AFFINDA_API_KEY = process.env.AFFINDA_API_KEY;
const AFFINDA_API_URL = 'https://api.affinda.com/v3';

export const analyzeResumeWithAffinda = async (resumeFilePath) => {
  try {
    // Read file
    const fileStream = fs.createReadStream(resumeFilePath);
    
    // Create form data
    const form = new FormData();
    form.append('file', fileStream);

    // Upload resume to Affinda
    const uploadResponse = await fetch(`${AFFINDA_API_URL}/resumes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AFFINDA_API_KEY}`,
      },
      body: form,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(`Affinda API error: ${error.message || uploadResponse.statusText}`);
    }

    const uploadData = await uploadResponse.json();
    const resumeId = uploadData.data.id;

    // Wait for processing (Affinda processes asynchronously)
    let resume = uploadData.data;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (resume.parsing_status === 'WAITING' || resume.parsing_status === 'PROCESSING') {
      if (attempts >= maxAttempts) {
        throw new Error('Resume parsing timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${AFFINDA_API_URL}/resumes/${resumeId}`, {
        headers: {
          Authorization: `Bearer ${AFFINDA_API_KEY}`,
        },
      });

      resume = (await statusResponse.json()).data;
      attempts++;
    }

    // Extract parsed data
    const parsedData = resume.parsed_document;

    // Calculate ATS score based on extracted data
    let atsScore = 50; // Start at baseline
    let strengths = [];
    let improvements = [];
    const keywords = [];

    // Score based on what's parsed
    if (parsedData) {
      // Contact info (10 points)
      if (parsedData.contact_email || parsedData.phone_number) {
        atsScore += 5;
        strengths.push('Complete contact information provided');
      }

      // Professional summary/objective (10 points)
      if (parsedData.objective) {
        atsScore += 10;
        strengths.push('Professional summary/objective section present');
      } else {
        improvements.push('Add a professional summary or objective statement');
      }

      // Work experience (15 points)
      if (parsedData.work_experience && parsedData.work_experience.length > 0) {
        atsScore += 15;
        strengths.push(`${parsedData.work_experience.length} work experiences documented`);
      } else {
        improvements.push('Add detailed work experience with metrics and achievements');
      }

      // Education (10 points)
      if (parsedData.education && parsedData.education.length > 0) {
        atsScore += 10;
        strengths.push('Education section included');
      } else {
        improvements.push('Include your education details');
      }

      // Skills (15 points)
      if (parsedData.skills && parsedData.skills.length > 0) {
        atsScore += 15;
        strengths.push(`${parsedData.skills.length} skills identified`);
        
        // Extract keywords from skills
        parsedData.skills.slice(0, 5).forEach(skill => {
          if (skill.name) keywords.push(skill.name);
        });
      } else {
        improvements.push('Add a dedicated skills section with specific technical and soft skills');
      }

      // Check for quantifiable achievements
      const hasQuantifiables = parsedData.work_experience?.some(exp => 
        exp.work_summary && /\d+%|\$\d+|increased|improved|reduced|grew/i.test(exp.work_summary)
      );
      
      if (hasQuantifiables) {
        atsScore += 10;
        strengths.push('Quantifiable achievements found');
      } else {
        improvements.push('Use numbers and percentages to quantify achievements (e.g., "Increased sales by 25%")');
      }

      // Format check
      atsScore += 5; // Base format score
      strengths.push('Resume successfully parsed by ATS system');
    }

    // Ensure score is 0-100
    atsScore = Math.min(Math.max(atsScore, 0), 100);

    // Add default improvements if needed
    if (improvements.length < 4) {
      const defaultImprovements = [
        'Use standard section headers (e.g., "Experience", "Skills", "Education")',
        'Avoid tables, graphics, and unusual formatting',
        'Include relevant industry keywords from the job description',
        'Keep resume to 1-2 pages for ATS compatibility',
        'Use simple fonts and consistent formatting',
      ];
      improvements = [...improvements, ...defaultImprovements].slice(0, 4);
    }

    // Add extracted skills as keywords if not enough
    if (keywords.length < 5 && parsedData.skills) {
      parsedData.skills.forEach(skill => {
        if (skill.name && !keywords.includes(skill.name)) {
          keywords.push(skill.name);
        }
      });
    }

    return {
      atsScore,
      strengths: strengths.length > 0 ? strengths : ['Resume contains expected sections'],
      improvements: improvements.slice(0, 4),
      keywords: keywords.slice(0, 5),
      rawData: {
        email: parsedData?.contact_email,
        phone: parsedData?.phone_number,
        name: parsedData?.name,
        workExperienceCount: parsedData?.work_experience?.length || 0,
        educationCount: parsedData?.education?.length || 0,
        skillsCount: parsedData?.skills?.length || 0,
      }
    };
  } catch (error) {
    console.error('Affinda API Error:', error);
    throw new Error('Failed to analyze resume with Affinda: ' + error.message);
  }
};
