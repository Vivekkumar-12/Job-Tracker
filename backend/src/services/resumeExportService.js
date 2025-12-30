/**
 * Resume Export Service
 * Handles PDF and DOCX export with ATS-safe formatting
 */

import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, VerticalAlign, BorderStyle } from 'docx';
import fs from 'fs';
import path from 'path';

class ResumeExportService {
  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Export resume as PDF
   */
  async exportPDF(resume, filename) {
    return new Promise((resolve, reject) => {
      try {
        const filepath = path.join(this.uploadsDir, `${filename}.pdf`);
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Title and Personal Info
        this.addPersonalInfo(doc, resume);

        // Professional Summary
        if (resume.summary?.content) {
          this.addSection(doc, 'PROFESSIONAL SUMMARY', resume.summary.content);
        }

        // Skills
        if (resume.skills?.technical?.length || resume.skills?.professional?.length) {
          this.addSkillsSection(doc, resume.skills);
        }

        // Work Experience
        if (resume.workExperience?.length) {
          this.addExperienceSection(doc, resume.workExperience);
        }

        // Education
        if (resume.education?.length) {
          this.addEducationSection(doc, resume.education);
        }

        // Projects
        if (resume.projects?.length) {
          this.addProjectsSection(doc, resume.projects);
        }

        // Certifications
        if (resume.certifications?.length) {
          this.addCertificationsSection(doc, resume.certifications);
        }

        // Achievements
        if (resume.achievements?.length) {
          this.addAchievementsSection(doc, resume.achievements);
        }

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Export resume as DOCX
   */
  async exportDOCX(resume, filename) {
    try {
      const filepath = path.join(this.uploadsDir, `${filename}.docx`);
      const sections = [];

      // Personal Info
      sections.push(...this.createPersonalInfoDOCX(resume));

      // Professional Summary
      if (resume.summary?.content) {
        sections.push(this.createHeadingDOCX('PROFESSIONAL SUMMARY'));
        sections.push(new Paragraph(resume.summary.content));
        sections.push(new Paragraph(''));
      }

      // Skills
      if (resume.skills?.technical?.length || resume.skills?.professional?.length) {
        sections.push(...this.createSkillsDOCX(resume.skills));
      }

      // Work Experience
      if (resume.workExperience?.length) {
        sections.push(...this.createExperienceDOCX(resume.workExperience));
      }

      // Education
      if (resume.education?.length) {
        sections.push(...this.createEducationDOCX(resume.education));
      }

      // Projects
      if (resume.projects?.length) {
        sections.push(...this.createProjectsDOCX(resume.projects));
      }

      // Certifications
      if (resume.certifications?.length) {
        sections.push(...this.createCertificationsDOCX(resume.certifications));
      }

      // Achievements
      if (resume.achievements?.length) {
        sections.push(...this.createAchievementsDOCX(resume.achievements));
      }

      const doc = new Document({
        sections: [{
          children: sections
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(filepath, buffer);

      return filepath;
    } catch (error) {
      throw new Error(`Failed to export DOCX: ${error.message}`);
    }
  }

  // ============ PDF Helper Methods ============

  addPersonalInfo(doc, resume) {
    const { firstName, lastName, email, phone, location, linkedin, portfolio, github } = resume.personalInfo || {};

    // Name
    if (firstName || lastName) {
      doc.fontSize(18).font('Helvetica-Bold').text(`${firstName || ''} ${lastName || ''}`.trim(), { align: 'left' });
    }

    // Contact Info
    const contactInfo = [];
    if (email) contactInfo.push(email);
    if (phone) contactInfo.push(phone);
    if (location) contactInfo.push(location);
    if (linkedin) contactInfo.push(linkedin);
    if (github) contactInfo.push(github);

    if (contactInfo.length > 0) {
      doc.fontSize(10).font('Helvetica').text(contactInfo.join(' | '), { align: 'left' });
    }

    doc.moveDown(0.5);
  }

  addSection(doc, title, content) {
    doc.fontSize(12).font('Helvetica-Bold').text(title);
    doc.fontSize(11).font('Helvetica').text(content, { align: 'left' });
    doc.moveDown(0.5);
  }

  addSkillsSection(doc, skills) {
    doc.fontSize(12).font('Helvetica-Bold').text('SKILLS');

    if (skills.technical?.length) {
      doc.fontSize(11).font('Helvetica').text('Technical: ' + skills.technical.join(', '));
    }

    if (skills.professional?.length) {
      doc.fontSize(11).font('Helvetica').text('Professional: ' + skills.professional.join(', '));
    }

    if (skills.languages?.length) {
      doc.fontSize(11).font('Helvetica').text('Languages: ' + skills.languages.join(', '));
    }

    doc.moveDown(0.5);
  }

  addExperienceSection(doc, experiences) {
    doc.fontSize(12).font('Helvetica-Bold').text('WORK EXPERIENCE');

    experiences.forEach((exp, index) => {
      const dates = this.formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking);
      
      doc.fontSize(11).font('Helvetica-Bold').text(exp.position);
      doc.fontSize(10).font('Helvetica').text(`${exp.company} | ${dates}`);
      
      if (exp.achievements?.length) {
        doc.fontSize(11).font('Helvetica');
        exp.achievements.forEach(ach => {
          doc.text(`• ${ach}`);
        });
      }

      if (index < experiences.length - 1) {
        doc.moveDown(0.3);
      }
    });

    doc.moveDown(0.5);
  }

  addEducationSection(doc, education) {
    doc.fontSize(12).font('Helvetica-Bold').text('EDUCATION');

    education.forEach((edu) => {
      const dates = this.formatDateRange(edu.startDate, edu.endDate);
      
      doc.fontSize(11).font('Helvetica-Bold').text(`${edu.degree} in ${edu.field || ''}`);
      doc.fontSize(10).font('Helvetica').text(`${edu.institution} | ${dates}`);
      
      if (edu.cgpa) {
        doc.text(`GPA: ${edu.cgpa}`);
      }

      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);
  }

  addProjectsSection(doc, projects) {
    doc.fontSize(12).font('Helvetica-Bold').text('PROJECTS');

    projects.forEach((proj) => {
      doc.fontSize(11).font('Helvetica-Bold').text(proj.name);
      
      if (proj.technologies?.length) {
        doc.fontSize(10).font('Helvetica').text(`Technologies: ${proj.technologies.join(', ')}`);
      }

      if (proj.description) {
        doc.fontSize(10).font('Helvetica').text(proj.description);
      }

      if (proj.achievements?.length) {
        proj.achievements.forEach(ach => {
          doc.fontSize(10).text(`• ${ach}`);
        });
      }

      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);
  }

  addCertificationsSection(doc, certifications) {
    doc.fontSize(12).font('Helvetica-Bold').text('CERTIFICATIONS');

    certifications.forEach((cert) => {
      const issueDate = cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : '';
      
      doc.fontSize(11).font('Helvetica-Bold').text(cert.name);
      doc.fontSize(10).font('Helvetica').text(`${cert.issuer} | ${issueDate}`);
      
      doc.moveDown(0.2);
    });

    doc.moveDown(0.5);
  }

  addAchievementsSection(doc, achievements) {
    doc.fontSize(12).font('Helvetica-Bold').text('ACHIEVEMENTS');

    achievements.forEach((achievement) => {
      doc.fontSize(11).font('Helvetica').text(`• ${achievement.title}`);
      if (achievement.description) {
        doc.fontSize(10).text(achievement.description);
      }
      doc.moveDown(0.2);
    });

    doc.moveDown(0.5);
  }

  formatDateRange(startDate, endDate, currentlyWorking = false) {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
    const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

    if (currentlyWorking) {
      return `${start} - Present`;
    }

    return `${start} - ${end || 'Present'}`;
  }

  // ============ DOCX Helper Methods ============

  createPersonalInfoDOCX(resume) {
    const sections = [];
    const { firstName, lastName, email, phone, location, linkedin, portfolio, github } = resume.personalInfo || {};

    // Name
    if (firstName || lastName) {
      sections.push(new Paragraph({
        text: `${firstName || ''} ${lastName || ''}`.trim(),
        heading: 'Heading1',
        bold: true,
        size: 24
      }));
    }

    // Contact
    const contactInfo = [];
    if (email) contactInfo.push(email);
    if (phone) contactInfo.push(phone);
    if (location) contactInfo.push(location);
    if (linkedin) contactInfo.push(linkedin);
    if (github) contactInfo.push(github);

    if (contactInfo.length > 0) {
      sections.push(new Paragraph({
        text: contactInfo.join(' | '),
        size: 10
      }));
    }

    sections.push(new Paragraph(''));
    return sections;
  }

  createHeadingDOCX(text) {
    return new Paragraph({
      text,
      bold: true,
      size: 12
    });
  }

  createSkillsDOCX(skills) {
    const sections = [this.createHeadingDOCX('SKILLS')];

    if (skills.technical?.length) {
      sections.push(new Paragraph({
        text: `Technical: ${skills.technical.join(', ')}`,
        size: 11
      }));
    }

    if (skills.professional?.length) {
      sections.push(new Paragraph({
        text: `Professional: ${skills.professional.join(', ')}`,
        size: 11
      }));
    }

    if (skills.languages?.length) {
      sections.push(new Paragraph({
        text: `Languages: ${skills.languages.join(', ')}`,
        size: 11
      }));
    }

    sections.push(new Paragraph(''));
    return sections;
  }

  createExperienceDOCX(experiences) {
    const sections = [this.createHeadingDOCX('WORK EXPERIENCE')];

    experiences.forEach((exp) => {
      const dates = this.formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking);
      
      sections.push(new Paragraph({
        text: exp.position,
        bold: true,
        size: 11
      }));

      sections.push(new Paragraph({
        text: `${exp.company} | ${dates}`,
        size: 10
      }));

      if (exp.achievements?.length) {
        exp.achievements.forEach(ach => {
          sections.push(new Paragraph({
            text: `• ${ach}`,
            size: 11
          }));
        });
      }

      sections.push(new Paragraph(''));
    });

    return sections;
  }

  createEducationDOCX(education) {
    const sections = [this.createHeadingDOCX('EDUCATION')];

    education.forEach((edu) => {
      const dates = this.formatDateRange(edu.startDate, edu.endDate);
      
      sections.push(new Paragraph({
        text: `${edu.degree} in ${edu.field || ''}`,
        bold: true,
        size: 11
      }));

      sections.push(new Paragraph({
        text: `${edu.institution} | ${dates}`,
        size: 10
      }));

      if (edu.cgpa) {
        sections.push(new Paragraph({
          text: `GPA: ${edu.cgpa}`,
          size: 10
        }));
      }

      sections.push(new Paragraph(''));
    });

    return sections;
  }

  createProjectsDOCX(projects) {
    const sections = [this.createHeadingDOCX('PROJECTS')];

    projects.forEach((proj) => {
      sections.push(new Paragraph({
        text: proj.name,
        bold: true,
        size: 11
      }));

      if (proj.technologies?.length) {
        sections.push(new Paragraph({
          text: `Technologies: ${proj.technologies.join(', ')}`,
          size: 10
        }));
      }

      if (proj.description) {
        sections.push(new Paragraph({
          text: proj.description,
          size: 10
        }));
      }

      if (proj.achievements?.length) {
        proj.achievements.forEach(ach => {
          sections.push(new Paragraph({
            text: `• ${ach}`,
            size: 10
          }));
        });
      }

      sections.push(new Paragraph(''));
    });

    return sections;
  }

  createCertificationsDOCX(certifications) {
    const sections = [this.createHeadingDOCX('CERTIFICATIONS')];

    certifications.forEach((cert) => {
      const issueDate = cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : '';
      
      sections.push(new Paragraph({
        text: cert.name,
        bold: true,
        size: 11
      }));

      sections.push(new Paragraph({
        text: `${cert.issuer} | ${issueDate}`,
        size: 10
      }));

      sections.push(new Paragraph(''));
    });

    return sections;
  }

  createAchievementsDOCX(achievements) {
    const sections = [this.createHeadingDOCX('ACHIEVEMENTS')];

    achievements.forEach((achievement) => {
      sections.push(new Paragraph({
        text: `• ${achievement.title}`,
        size: 11
      }));

      if (achievement.description) {
        sections.push(new Paragraph({
          text: achievement.description,
          size: 10
        }));
      }

      sections.push(new Paragraph(''));
    });

    return sections;
  }
}

export default new ResumeExportService();
