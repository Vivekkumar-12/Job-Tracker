/**
 * Resume AI Enhancement Service
 * Handles all AI-powered resume improvements using Google Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ResumeAiEnhancer {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Generate a professional summary based on role and experience
   */
  async generateSummary(resume, jobRole) {
    try {
      const experience = resume.workExperience || [];
      const skills = (resume.skills?.technical || []).slice(0, 5).join(', ');
      
      const prompt = `Generate a professional executive summary for a ${jobRole} with the following background:
        - Total experience: ${experience.length} positions
        - Key skills: ${skills}
        - Recent role: ${experience[0]?.position || 'Not specified'}
        
        The summary should:
        1. Be 3-4 lines (50-80 words)
        2. Highlight key strengths and achievements
        3. Include relevant keywords for the role
        4. Use action-oriented language
        5. Be ATS-optimized (simple language, no special characters)
        
        Respond with only the summary text, no additional explanation.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate professional summary');
    }
  }

  /**
   * Rewrite bullet points with action verbs and metrics
   */
  async optimizeBulletPoints(bulletPoints) {
    try {
      const bulletsText = bulletPoints.join('\n');
      
      const prompt = `Improve the following resume bullet points by:
        1. Adding strong action verbs at the start
        2. Incorporating metrics/quantifiable results where possible
        3. Making them more impactful and concise
        4. Keeping them ATS-friendly (simple language, no special characters)
        
        Original bullet points:
        ${bulletsText}
        
        Respond with only the optimized bullet points, one per line, without numbering.`;

      const result = await this.model.generateContent(prompt);
      const optimized = result.response.text()
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[•\-\*]\s*/, '').trim());
      
      return optimized;
    } catch (error) {
      console.error('Error optimizing bullet points:', error);
      throw new Error('Failed to optimize bullet points');
    }
  }

  /**
   * Optimize resume for a specific job description
   */
  async optimizeForJob(resume, jobDescription) {
    try {
      const resumeText = this.extractResumeText(resume);
      
      const prompt = `You are an expert ATS optimizer and recruiter. 
        
        Job Description:
        ${jobDescription}
        
        Current Resume Summary:
        ${resumeText}
        
        Provide optimization suggestions to increase ATS score:
        1. Identify 5-7 missing keywords that should be added
        2. Suggest how to rewrite 2-3 key bullet points to match the job better
        3. Recommend any sections or skills that should be added/emphasized
        4. Provide an overall optimization strategy
        
        Format your response as JSON with keys: missingKeywords, bulletPointSuggestions, sectionRecommendations, strategy`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { error: 'Could not parse optimization suggestions' };
    } catch (error) {
      console.error('Error optimizing for job:', error);
      throw new Error('Failed to optimize resume for job');
    }
  }

  /**
   * Check grammar and improve clarity
   */
  async improveClarityAndGrammar(text) {
    try {
      const prompt = `As a professional resume editor, improve the following text for:
        1. Grammar and spelling
        2. Clarity and conciseness
        3. Professional tone
        4. ATS-friendliness (remove special characters, keep it simple)
        
        Original text:
        ${text}
        
        Respond with only the improved text, maintaining the same structure/format.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error improving clarity:', error);
      throw new Error('Failed to improve text clarity');
    }
  }

  /**
   * Generate skill suggestions based on role
   */
  async suggestSkills(jobRole, currentSkills = []) {
    try {
      const skillsText = currentSkills.length > 0 ? `Current skills: ${currentSkills.join(', ')}` : '';
      
      const prompt = `Generate a list of important skills for a ${jobRole}. 
        ${skillsText}
        
        Provide 15-20 relevant skills that should be on a resume for this role.
        Categorize them as: Technical Skills, Professional Skills, and Tools/Frameworks.
        
        Format as JSON with keys: technical, professional, tools`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { technical: [], professional: [], tools: [] };
    } catch (error) {
      console.error('Error suggesting skills:', error);
      throw new Error('Failed to suggest skills');
    }
  }

  /**
   * Generate custom section content
   */
  async generateSectionContent(sectionType, context) {
    try {
      let prompt = '';

      switch (sectionType) {
        case 'ACHIEVEMENTS':
          prompt = `Generate 4-5 professional achievement bullet points based on this context:
            ${context}
            Use action verbs, be specific and quantifiable.`;
          break;

        case 'PROJECTS':
          prompt = `Generate a project description based on:
            ${context}
            Include the impact and technologies used. Keep it concise (2-3 lines).`;
          break;

        case 'CERTIFICATIONS':
          prompt = `Generate a description for this certification:
            ${context}
            Include relevance to current role.`;
          break;

        default:
          return '';
      }

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating section content:', error);
      throw new Error(`Failed to generate ${sectionType} content`);
    }
  }

  /**
   * Extract and format resume text
   */
  extractResumeText(resume) {
    const parts = [];

    if (resume.personalInfo?.firstName) {
      parts.push(`Name: ${resume.personalInfo.firstName} ${resume.personalInfo.lastName || ''}`);
    }

    if (resume.summary?.content) {
      parts.push(`Summary: ${resume.summary.content}`);
    }

    if (resume.skills?.technical?.length) {
      parts.push(`Technical Skills: ${resume.skills.technical.join(', ')}`);
    }

    if (resume.workExperience?.length) {
      parts.push('Work Experience:');
      resume.workExperience.forEach(exp => {
        parts.push(`- ${exp.position} at ${exp.company} (${exp.startDate?.getFullYear() || 'N/A'})`);
        if (exp.achievements?.length) {
          exp.achievements.forEach(ach => parts.push(`  * ${ach}`));
        }
      });
    }

    if (resume.education?.length) {
      parts.push('Education:');
      resume.education.forEach(edu => {
        parts.push(`- ${edu.degree} in ${edu.field} from ${edu.institution}`);
      });
    }

    return parts.join('\n');
  }
}

export default new ResumeAiEnhancer();
