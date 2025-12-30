import React from 'react';

export default function ResumeLivePreview({ resume }) {
  if (!resume) return null;

  const { personalInfo = {}, summary = {}, skills = {}, workExperience = [], education = [], projects = [], certifications = [], achievements = [] } = resume;

  return (
    <div className="resume-preview ats-single-column">
      {/* Personal Info */}
      <div className="preview-section">
        {(personalInfo.firstName || personalInfo.lastName) && (
          <h1>{[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(' ')}</h1>
        )}
        <p className="contact-line">
          {[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedin, personalInfo.github]
            .filter(Boolean)
            .join(' | ')}
        </p>
      </div>

      {/* Summary */}
      {summary.content && (
        <div className="preview-section">
          <h2>Professional Summary</h2>
          <p>{summary.content}</p>
        </div>
      )}

      {/* Skills */}
      {(skills.technical?.length || skills.professional?.length || skills.languages?.length) && (
        <div className="preview-section">
          <h2>Skills</h2>
          {skills.technical?.length ? <p>Technical: {skills.technical.join(', ')}</p> : null}
          {skills.professional?.length ? <p>Professional: {skills.professional.join(', ')}</p> : null}
          {skills.languages?.length ? <p>Languages: {skills.languages.join(', ')}</p> : null}
        </div>
      )}

      {/* Experience */}
      {workExperience.length > 0 && (
        <div className="preview-section">
          <h2>Work Experience</h2>
          {workExperience.map((exp, i) => (
            <div key={i} className="item">
              <h3>{exp.position}</h3>
              <p>{[exp.company, formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)].filter(Boolean).join(' | ')}</p>
              {exp.achievements?.length ? (
                <ul>
                  {exp.achievements.map((ach, idx) => (
                    <li key={idx}>{ach}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="preview-section">
          <h2>Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="item">
              <h3>{[edu.degree, edu.field].filter(Boolean).join(' in ')}</h3>
              <p>{[edu.institution, formatDateRange(edu.startDate, edu.endDate)].filter(Boolean).join(' | ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="preview-section">
          <h2>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} className="item">
              <h3>{proj.name}</h3>
              {proj.description ? <p>{proj.description}</p> : null}
              {proj.technologies?.length ? <p>Tech: {proj.technologies.join(', ')}</p> : null}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="preview-section">
          <h2>Certifications</h2>
          {certifications.map((cert, i) => (
            <div key={i} className="item">
              <h3>{cert.name}</h3>
              <p>{[cert.issuer, cert.issueDate && new Date(cert.issueDate).toLocaleDateString()].filter(Boolean).join(' | ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="preview-section">
          <h2>Achievements</h2>
          <ul>
            {achievements.map((a, i) => (
              <li key={i}>{a.title || a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatDateRange(startDate, endDate, currentlyWorking = false) {
  const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
  const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
  if (currentlyWorking) return `${start} - Present`;
  return `${start}${start ? ' - ' : ''}${end || (start ? 'Present' : '')}`;
}
