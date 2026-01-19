import React from 'react';

/**
 * Modern Template - Clean, contemporary design
 */
export const ModernTemplate = ({ resume }) => {
  const {
    personalDetails,
    profession,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    achievements,
    training,
  } = resume;

  return (
    <div className="bg-white p-8 text-gray-800 max-w-4xl mx-auto font-serif">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-blue-600">{personalDetails.fullName}</h1>
        {profession && <p className="text-lg text-gray-700 mt-1">{profession}</p>}
        <div className="flex flex-wrap gap-4 text-sm mt-2 text-gray-600">
          {personalDetails.email && <span>{personalDetails.email}</span>}
          {personalDetails.phone && <span>{personalDetails.phone}</span>}
          {personalDetails.location && <span>{personalDetails.location}</span>}
        </div>
        <div className="flex flex-wrap gap-4 text-sm mt-2">
          {personalDetails.linkedIn && (
            <a href={personalDetails.linkedIn} className="text-blue-600 hover:underline">
              LinkedIn
            </a>
          )}
          {personalDetails.github && (
            <a href={personalDetails.github} className="text-blue-600 hover:underline">
              GitHub
            </a>
          )}
          {personalDetails.portfolio && (
            <a href={personalDetails.portfolio} className="text-blue-600 hover:underline">
              Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-2">Professional Summary</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                {skill.name} {skill.category && `(${skill.category})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3">Experience</h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{exp.jobTitle}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                  </div>
                </div>
                {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                {exp.description && (
                  <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3">Education</h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{edu.school}</h3>
                    <p className="text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {edu.startDate} - {edu.currentlyStudying ? 'Present' : edu.endDate}
                  </div>
                </div>
                {edu.grade && <p className="text-sm text-gray-600">GPA: {edu.grade}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3">Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-bold text-gray-800">
                  {project.link ? (
                    <a href={project.link} className="text-blue-600 hover:underline">
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-gray-600 text-xs mt-1">
                    Technologies: {project.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3">Certificates & Certifications</h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id}>
                <h3 className="font-bold text-gray-800">
                  {cert.link ? (
                    <a href={cert.link} className="text-blue-600 hover:underline">
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                </h3>
                <p className="text-gray-600 text-sm">
                  {cert.issuer} {cert.issuedDate && `- ${cert.issuedDate}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3">Achievements</h2>
          <div className="space-y-2">
            {achievements.map((ach) => (
              <div key={ach.id} className="flex justify-between text-sm text-gray-800">
                <div>
                  <p className="font-semibold">{ach.title}</p>
                  {ach.description && <p className="text-gray-700 text-xs">{ach.description}</p>}
                </div>
                {ach.date && <span className="text-gray-600 text-xs">{ach.date}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training */}
      {training && training.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3">Training</h2>
          <div className="space-y-2">
            {training.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-800">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-700 text-xs">{item.provider}</p>
                  {item.description && <p className="text-gray-700 text-xs">{item.description}</p>}
                </div>
                <div className="text-right text-gray-600 text-xs">
                  <p>{item.startDate} {item.endDate && `- ${item.endDate}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Professional Template - Traditional, conservative design
 */
export const ProfessionalTemplate = ({ resume }) => {
  const {
    personalDetails,
    profession,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    achievements,
    training,
  } = resume;

  return (
    <div className="bg-white p-12 text-gray-900 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{personalDetails.fullName}</h1>
        {profession && <p className="text-sm text-gray-700">{profession}</p>}
        <div className="flex justify-center flex-wrap gap-3 text-xs mt-2 text-gray-700">
          {personalDetails.email && <span>{personalDetails.email}</span>}
          {personalDetails.phone && <span>•</span>}
          {personalDetails.phone && <span>{personalDetails.phone}</span>}
          {personalDetails.location && <span>•</span>}
          {personalDetails.location && <span>{personalDetails.location}</span>}
        </div>
        <div className="flex justify-center flex-wrap gap-2 text-xs mt-2">
          {personalDetails.linkedIn && (
            <a href={personalDetails.linkedIn} className="text-gray-600 hover:text-gray-900">
              LinkedIn
            </a>
          )}
          {personalDetails.github && (
            <>
              {personalDetails.linkedIn && <span>|</span>}
              <a href={personalDetails.github} className="text-gray-600 hover:text-gray-900">
                GitHub
              </a>
            </>
          )}
          {personalDetails.portfolio && (
            <>
              <span>|</span>
              <a href={personalDetails.portfolio} className="text-gray-600 hover:text-gray-900">
                Portfolio
              </a>
            </>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-6">
          <p className="text-gray-800 text-xs leading-relaxed italic">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4 text-xs">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between">
                  <span className="font-bold">{exp.jobTitle}</span>
                  <span className="text-gray-600">
                    {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-gray-700 italic">{exp.company}</div>
                {exp.location && <div className="text-gray-700">{exp.location}</div>}
                {exp.description && (
                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-3">Education</h2>
          <div className="space-y-3 text-xs">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between">
                  <span className="font-bold">{edu.degree}</span>
                  <span className="text-gray-600">
                    {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}
                  </span>
                </div>
                <div className="text-gray-700 italic">{edu.school}</div>
                {edu.fieldOfStudy && (
                  <div className="text-gray-700">Major: {edu.fieldOfStudy}</div>
                )}
                {edu.grade && <div className="text-gray-700">GPA: {edu.grade}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-3">Skills</h2>
          <div className="text-xs text-gray-800">
            {skills.map((skill, index) => (
              <span key={skill.id}>
                {skill.name} {skill.category && `(${skill.category})`}
                {index < skills.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-3">Projects</h2>
          <div className="space-y-3 text-xs">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="font-bold">
                  {project.link ? (
                    <a href={project.link} className="text-gray-600 hover:text-gray-900">
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </div>
                {project.description && <p className="text-gray-800 mt-1">{project.description}</p>}
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-gray-700 mt-1">Tech: {project.technologies.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-3">
            Certificates & Certifications
          </h2>
          <div className="space-y-2 text-xs">
            {certifications.map((cert) => (
              <div key={cert.id}>
                <span className="font-bold">{cert.name}</span> • {cert.issuer}
                {cert.issuedDate && ` (${cert.issuedDate})`}
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-3">
            Achievements
          </h2>
          <div className="space-y-1 text-xs">
            {achievements.map((ach) => (
              <div key={ach.id} className="flex justify-between">
                <span className="font-semibold">{ach.title}</span>
                {ach.date && <span className="text-gray-600">{ach.date}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {training && training.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-3">Training</h2>
          <div className="space-y-1 text-xs">
            {training.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <span className="font-semibold">{item.name}</span> — {item.provider}
                </div>
                <span className="text-gray-600">
                  {item.startDate} {item.endDate && `- ${item.endDate}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Creative Template - Colorful, modern design
 */
export const CreativeTemplate = ({ resume }) => {
  const {
    personalDetails,
    profession,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    achievements,
    training,
  } = resume;

  return (
    <div className="bg-white text-gray-800 max-w-4xl mx-auto font-sans">
      <div className="grid grid-cols-3 min-h-screen">
        {/* Sidebar */}
        <div className="col-span-1 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-8">
          {/* Profile */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{personalDetails.fullName}</h1>
            {profession && <p className="text-pink-100 mt-1 text-sm">{profession}</p>}
            <p className="text-pink-100 mt-1 text-sm">{personalDetails.location}</p>
          </div>

          {/* Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3 border-b border-pink-200 pb-2">Contact</h3>
            <div className="space-y-2 text-sm text-pink-50">
              {personalDetails.email && <p>{personalDetails.email}</p>}
              {personalDetails.phone && <p>{personalDetails.phone}</p>}
              {personalDetails.linkedIn && (
                <a href={personalDetails.linkedIn} className="hover:underline block">
                  LinkedIn
                </a>
              )}
              {personalDetails.github && (
                <a href={personalDetails.github} className="hover:underline block">
                  GitHub
                </a>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 border-b border-pink-200 pb-2">Skills</h3>
              <div className="space-y-2 text-sm">
                {skills.map((skill) => (
                  <div key={skill.id} className="bg-pink-200 text-pink-900 px-3 py-1 rounded">
                    {skill.name}
                    {skill.category && <span className="text-pink-800 text-xs ml-1">({skill.category})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="col-span-2 p-8">
          {/* Summary */}
          {summary && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-600 mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-600 mb-3">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-purple-600 pl-4">
                    <h3 className="font-bold text-lg">{exp.jobTitle}</h3>
                    <p className="text-purple-600">{exp.company}</p>
                    <p className="text-sm text-gray-600">
                      {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-600 mb-3">Education</h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-pink-600 pl-4">
                    <h3 className="font-bold text-lg">{edu.degree}</h3>
                    <p className="text-pink-600">{edu.school}</p>
                    <p className="text-sm text-gray-600">
                      {edu.startDate} - {edu.currentlyStudying ? 'Present' : edu.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-600 mb-3">Projects</h2>
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="border-l-4 border-pink-600 pl-4">
                    <h3 className="font-bold text-lg">
                      {project.link ? (
                        <a href={project.link} className="text-purple-600 hover:underline">
                          {project.name}
                        </a>
                      ) : (
                        project.name
                      )}
                    </h3>
                    {project.description && (
                      <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-600 mb-3">Achievements</h2>
              <div className="space-y-2">
                {achievements.map((ach) => (
                  <div key={ach.id} className="border-l-4 border-purple-600 pl-4">
                    <p className="font-semibold text-lg">{ach.title}</p>
                    {ach.description && <p className="text-gray-700 text-sm">{ach.description}</p>}
                    {ach.date && <p className="text-gray-600 text-xs">{ach.date}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training */}
          {training && training.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-600 mb-3">Training</h2>
              <div className="space-y-2">
                {training.map((item) => (
                  <div key={item.id} className="border-l-4 border-pink-600 pl-4">
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-pink-600">{item.provider}</p>
                    <p className="text-sm text-gray-600">
                      {item.startDate} {item.endDate && `- ${item.endDate}`}
                    </p>
                    {item.description && <p className="text-gray-700 text-sm">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Template Registry
 */
export const RESUME_TEMPLATES = {
  modern: {
    name: 'Modern',
    component: ModernTemplate,
    description: 'Clean and contemporary design',
  },
  professional: {
    name: 'Professional',
    component: ProfessionalTemplate,
    description: 'Traditional and conservative',
  },
  creative: {
    name: 'Creative',
    component: CreativeTemplate,
    description: 'Colorful and modern',
  },
  minimalist: {
    name: 'Minimalist',
    component: ModernTemplate,
    description: 'Lightweight layout with crisp spacing',
  },
  elegant: {
    name: 'Elegant',
    component: ProfessionalTemplate,
    description: 'Refined typography for leadership roles',
  },
  techLead: {
    name: 'Tech Lead',
    component: ModernTemplate,
    description: 'Emphasis on projects and impact bullets',
  },
  product: {
    name: 'Product',
    component: ProfessionalTemplate,
    description: 'Outcome-focused for PM roles',
  },
  analyst: {
    name: 'Analyst',
    component: ModernTemplate,
    description: 'Data-forward with concise sections',
  },
  designer: {
    name: 'Designer',
    component: CreativeTemplate,
    description: 'Visual-forward with color accents',
  },
  student: {
    name: 'Student',
    component: ModernTemplate,
    description: 'Education-first for early careers',
  },
  consulting: {
    name: 'Consulting',
    component: ProfessionalTemplate,
    description: 'Crisp sections for client-facing roles',
  },
  devops: {
    name: 'DevOps',
    component: ModernTemplate,
    description: 'Infrastructure and reliability highlights',
  },
  marketing: {
    name: 'Marketing',
    component: CreativeTemplate,
    description: 'Campaign and brand storytelling',
  },
};

/**
 * Get template component by ID
 */
export const getTemplateComponent = (templateId) => {
  return RESUME_TEMPLATES[templateId]?.component || ModernTemplate;
};
