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
    <div className="bg-white p-4 text-gray-800 max-w-4xl mx-auto font-serif">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-3 mb-3">
        <h1 className="text-2xl font-bold text-blue-600">{personalDetails.fullName}</h1>
        {profession && <p className="text-xs text-gray-700 mt-1">{profession}</p>}
        <div className="flex flex-wrap gap-4 text-sm mt-2 text-gray-600">
          {personalDetails.email && <span>{personalDetails.email}</span>}
          {personalDetails.phone && <span>{personalDetails.phone}</span>}
          {personalDetails.location && <span>{personalDetails.location}</span>}
        </div>
        <div className="flex flex-wrap gap-2 text-xs mt-1">
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
        <div className="mb-2">
          <h2 className="text-base font-bold text-blue-600 mb-1">Professional Summary</h2>
          <p className="text-gray-700 text-xs leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-2">
          <h2 className="text-base font-bold text-blue-600 mb-1">Skills</h2>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill) => (
              <span key={skill.id} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                {skill.name} {skill.category && `(${skill.category})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Training (moved before Experience) */}
      {training && training.length > 0 && (
        <div className="mb-2">
          <h2 className="text-base font-bold text-blue-600 mb-1">Training</h2>
          <div className="space-y-2">
            {training.map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-gray-800">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-700">{item.provider}</p>
                  {item.description && <p className="text-gray-700">{item.description}</p>}
                </div>
                <div className="text-right text-gray-600">
                  <p>{item.startDate} {item.endDate && `- ${item.endDate}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-2">
          <h2 className="text-base font-bold text-blue-600 mb-1">Experience</h2>
          <div className="space-y-1">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-xs">{exp.jobTitle}</h3>
                    <p className="text-gray-600 text-xs">{exp.company}</p>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                  </div>
                </div>
                {exp.location && <p className="text-xs text-gray-600">{exp.location}</p>}
                {exp.description && (
                  <p className="text-gray-700 text-xs mt-1 whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-2">
          <h2 className="text-base font-bold text-blue-600 mb-1">Projects</h2>
          <div className="space-y-1">
            {projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-bold text-gray-800 text-xs">
                  {project.link ? (
                    <a href={project.link} className="text-blue-600 hover:underline">
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <p className="text-gray-700 text-xs mt-1">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-gray-600 text-[10px] mt-1">
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
        <div className="mb-2">
          <h2 className="text-base font-bold text-blue-600 mb-1">Certificates & Certifications</h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id}>
                <h3 className="font-bold text-gray-800 text-xs">
                  {cert.link ? (
                    <a href={cert.link} className="text-blue-600 hover:underline">
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                </h3>
                <p className="text-gray-600 text-xs">
                  {cert.issuer} {cert.issuedDate && `- ${cert.issuedDate}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="mb-2">
          <h2 className="text-base font-bold text-blue-600 mb-1">Achievements</h2>
          <div className="space-y-2">
            {achievements.map((ach) => (
              <div key={ach.id} className="flex justify-between text-xs text-gray-800">
                <div>
                  <p className="font-semibold">{ach.title}</p>
                  {ach.description && <p className="text-gray-700">{ach.description}</p>}
                </div>
                {ach.date && <span className="text-gray-600">{ach.date}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education (moved to last) */}
      {education && education.length > 0 && (
        <div className="mb-2">
          <h2 className="text-base font-bold text-blue-600 mb-1">Education</h2>
          <div className="space-y-1">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-xs">{edu.school}</h3>
                    <p className="text-gray-600 text-xs">{edu.degree} in {edu.fieldOfStudy}</p>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    {edu.startDate} - {edu.currentlyStudying ? 'Present' : edu.endDate}
                  </div>
                </div>
                {edu.grade && <p className="text-xs text-gray-600">GPA: {edu.grade}</p>}
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
 * Gradient Glass Template - glassmorphism with soft animation
 */
export const GradientGlassTemplate = ({ resume }) => {
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

  const Section = ({ title, children }) => (
    <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-5 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 max-w-5xl mx-auto p-10 font-sans">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_10%_20%,#7c3aed_0,transparent_25%),radial-gradient(circle_at_90%_10%,#22d3ee_0,transparent_20%),radial-gradient(circle_at_30%_80%,#6366f1_0,transparent_22%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <Section title="Profile">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold leading-tight">{personalDetails.fullName}</h1>
              {profession && <p className="text-slate-200/80">{profession}</p>}
              <div className="flex flex-wrap gap-3 text-sm text-slate-200/70">
                {personalDetails.email && <span>{personalDetails.email}</span>}
                {personalDetails.phone && <span>· {personalDetails.phone}</span>}
                {personalDetails.location && <span>· {personalDetails.location}</span>}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-accent-foreground/90">
                {personalDetails.linkedIn && (
                  <a href={personalDetails.linkedIn} className="hover:underline">
                    LinkedIn
                  </a>
                )}
                {personalDetails.github && (
                  <a href={personalDetails.github} className="hover:underline">
                    GitHub
                  </a>
                )}
                {personalDetails.portfolio && (
                  <a href={personalDetails.portfolio} className="hover:underline">
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </Section>

          {summary && (
            <Section title="Summary">
              <p className="text-sm leading-relaxed text-slate-100/90">{summary}</p>
            </Section>
          )}

          {projects && projects.length > 0 && (
            <Section title="Projects">
              <div className="space-y-3 text-sm text-slate-100/90">
                {projects.map((project) => (
                  <div key={project.id} className="border-l border-accent/40 pl-3">
                    <h3 className="font-semibold text-white">
                      {project.link ? (
                        <a href={project.link} className="text-accent-foreground hover:underline">
                          {project.name}
                        </a>
                      ) : (
                        project.name
                      )}
                    </h3>
                    {project.description && <p className="text-slate-200/80">{project.description}</p>}
                    {project.technologies?.length > 0 && (
                      <p className="text-xs text-accent/80">Tech: {project.technologies.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {skills && skills.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-primary/15 border border-primary/30"
                  >
                    {skill.name} {skill.category && `(${skill.category})`}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          {experience && experience.length > 0 && (
            <Section title="Experience">
              <div className="space-y-4 text-sm text-slate-100/90">
                {experience.map((exp) => (
                  <div key={exp.id} className="rounded-lg border border-white/20 bg-white/5 p-3">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">{exp.jobTitle}</h3>
                        <p className="text-cyan-100/90">{exp.company}</p>
                      </div>
                      <span className="text-xs text-slate-200/70">
                        {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.location && <p className="text-xs text-slate-200/70">{exp.location}</p>}
                    {exp.description && (
                      <p className="mt-2 text-slate-100/80 whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {education && education.length > 0 && (
            <Section title="Education">
              <div className="space-y-3 text-sm text-slate-100/90">
                {education.map((edu) => (
                  <div key={edu.id} className="border-l border-indigo-300/40 pl-3">
                    <h3 className="font-semibold text-white">{edu.school}</h3>
                    <p className="text-indigo-100/90">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-xs text-slate-200/70">
                      {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}
                    </p>
                    {edu.grade && <p className="text-xs text-slate-200/70">GPA: {edu.grade}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {(certifications?.length || achievements?.length || training?.length) && (
            <Section title="Highlights">
              <div className="space-y-3 text-sm text-slate-100/90">
                {certifications?.map((cert) => (
                  <div key={cert.id} className="flex justify-between gap-3 border-b border-white/10 pb-2">
                    <div>
                      <p className="font-semibold text-white">{cert.name}</p>
                      <p className="text-xs text-slate-200/70">{cert.issuer}</p>
                    </div>
                    {cert.issuedDate && <span className="text-xs text-slate-200/70">{cert.issuedDate}</span>}
                  </div>
                ))}

                {achievements?.map((ach) => (
                  <div key={ach.id} className="flex justify-between gap-3">
                    <p className="font-semibold text-white">{ach.title}</p>
                    {ach.date && <span className="text-xs text-slate-200/70">{ach.date}</span>}
                  </div>
                ))}

                {training?.map((item) => (
                  <div key={item.id} className="border border-white/10 rounded-lg p-3">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-slate-200/70">{item.provider}</p>
                    <p className="text-xs text-slate-200/70">
                      {item.startDate} {item.endDate && `– ${item.endDate}`}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Timeline Template - animated timeline for experience and education
 */
export const TimelineTemplate = ({ resume }) => {
  const { personalDetails, profession, summary, experience, education, skills, projects } = resume;

  const TimelineSection = ({ title, items, render }) => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="relative pl-6">
        <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gradient-to-b from-blue-500 to-cyan-400 animate-pulse" />
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="relative p-4 bg-white shadow-sm rounded-lg border border-slate-100">
              <div className="absolute -left-4 top-4 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
              {render(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 text-slate-900 max-w-5xl mx-auto p-10 space-y-8 font-sans">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold">{personalDetails.fullName}</h1>
        {profession && <p className="text-slate-600">{profession}</p>}
        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          {personalDetails.email && <span>{personalDetails.email}</span>}
          {personalDetails.phone && <span>· {personalDetails.phone}</span>}
          {personalDetails.location && <span>· {personalDetails.location}</span>}
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
        </div>
      </div>

      {summary && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"><p className="text-sm text-slate-700 leading-relaxed">{summary}</p></div>
      )}

      {experience?.length > 0 && (
        <TimelineSection
          title="Experience"
          items={experience}
          render={(exp) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">{exp.jobTitle}</h3>
                <span className="text-xs text-slate-500">
                  {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}
                </span>
              </div>
              <p className="text-sm text-blue-600">{exp.company}</p>
              {exp.location && <p className="text-xs text-slate-500">{exp.location}</p>}
              {exp.description && (
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{exp.description}</p>
              )}
            </div>
          )}
        />
      )}

      {education?.length > 0 && (
        <TimelineSection
          title="Education"
          items={education}
          render={(edu) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">{edu.school}</h3>
                <span className="text-xs text-slate-500">
                  {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}
                </span>
              </div>
              <p className="text-sm text-blue-600">{edu.degree} in {edu.fieldOfStudy}</p>
              {edu.grade && <p className="text-xs text-slate-500">GPA: {edu.grade}</p>}
            </div>
          )}
        />
      )}

      {skills?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2 text-xs text-slate-700">
            {skills.map((skill) => (
              <span key={skill.id} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {skill.name} {skill.category && `(${skill.category})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {projects?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Projects</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="rounded-lg border border-slate-100 p-3">
                <h3 className="font-semibold text-slate-900">
                  {project.link ? (
                    <a href={project.link} className="text-blue-600 hover:underline">
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                {project.description && (
                  <p className="text-sm text-slate-700 mt-1">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact Accent Template - concise two-column layout
 */
export const CompactTemplate = ({ resume }) => {
  const { personalDetails, profession, summary, skills, experience, education, projects } = resume;

  return (
    <div className="bg-white text-slate-900 max-w-5xl mx-auto p-8 font-sans grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl p-6 shadow-lg animate-pulse">
          <h1 className="text-3xl font-bold leading-tight">{personalDetails.fullName}</h1>
          {profession && <p className="text-indigo-50/90 mt-1">{profession}</p>}
          <div className="mt-3 space-y-1 text-sm text-indigo-50/90">
            {personalDetails.email && <p>{personalDetails.email}</p>}
            {personalDetails.phone && <p>{personalDetails.phone}</p>}
            {personalDetails.location && <p>{personalDetails.location}</p>}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {personalDetails.linkedIn && <a className="hover:underline" href={personalDetails.linkedIn}>LinkedIn</a>}
            {personalDetails.github && <a className="hover:underline" href={personalDetails.github}>GitHub</a>}
            {personalDetails.portfolio && <a className="hover:underline" href={personalDetails.portfolio}>Portfolio</a>}
          </div>
        </div>

        {summary && (
          <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {skills?.length > 0 && (
          <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2 text-xs text-slate-700">
              {skills.map((skill) => (
                <span key={skill.id} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {skill.name} {skill.category && `(${skill.category})`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {experience?.length > 0 && (
          <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Experience</h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="border-l-4 border-indigo-400 pl-3">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="font-semibold">{exp.jobTitle}</span>
                    <span className="text-xs text-slate-500">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-indigo-600 text-sm">{exp.company}</p>
                  {exp.location && <p className="text-xs text-slate-500">{exp.location}</p>}
                  {exp.description && <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {education?.length > 0 && (
          <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Education</h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-indigo-600">{edu.school}</p>
                    {edu.fieldOfStudy && <p className="text-xs text-slate-600">{edu.fieldOfStudy}</p>}
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    <p>{edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}</p>
                    {edu.grade && <p>GPA: {edu.grade}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects?.length > 0 && (
          <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Projects</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <div key={project.id} className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <h3 className="font-semibold text-indigo-800">
                    {project.link ? (
                      <a href={project.link} className="hover:underline">
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  {project.description && <p className="text-sm text-slate-700 mt-1">{project.description}</p>}
                  {project.technologies?.length > 0 && (
                    <p className="text-xs text-indigo-700 mt-1">{project.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
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
    component: CompactTemplate,
    description: 'Lightweight two-column layout with crisp spacing',
  },
  elegant: {
    name: 'Elegant',
    component: GradientGlassTemplate,
    description: 'Refined glassmorphism with animated accents',
  },
  techLead: {
    name: 'Tech Lead',
    component: TimelineTemplate,
    description: 'Timeline focus on impact and delivery',
  },
  product: {
    name: 'Product',
    component: GradientGlassTemplate,
    description: 'Outcome-focused storytelling with highlights',
  },
  analyst: {
    name: 'Analyst',
    component: CompactTemplate,
    description: 'Data-forward concise sections with chips',
  },
  designer: {
    name: 'Designer',
    component: GradientGlassTemplate,
    description: 'Visual-forward glass cards and gradients',
  },
  student: {
    name: 'Student',
    component: TimelineTemplate,
    description: 'Education-first animated timeline',
  },
  consulting: {
    name: 'Consulting',
    component: ProfessionalTemplate,
    description: 'Crisp sections for client-facing roles',
  },
  devops: {
    name: 'DevOps',
    component: CompactTemplate,
    description: 'Infrastructure and reliability highlights',
  },
  marketing: {
    name: 'Marketing',
    component: GradientGlassTemplate,
    description: 'Campaign and brand storytelling with motion',
  },
  classicModern: {
    name: 'Classic Modern',
    component: ModernTemplate,
    description: 'Original modern layout (legacy)',
  },
  classicProfessional: {
    name: 'Classic Professional',
    component: ProfessionalTemplate,
    description: 'Original professional layout (legacy)',
  },
  classicCreative: {
    name: 'Classic Creative',
    component: CreativeTemplate,
    description: 'Original creative layout (legacy)',
  },
};

/**
 * Get template component by ID
 */
export const getTemplateComponent = (templateId) => {
  return RESUME_TEMPLATES[templateId]?.component || ModernTemplate;
};
