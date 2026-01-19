import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

/**
 * Personal Details Form Section
 */
export const PersonalDetailsSection = ({ data, onUpdate }) => {
  const handleChange = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="San Francisco, CA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedIn">LinkedIn URL</Label>
            <Input
              id="linkedIn"
              value={data.linkedIn}
              onChange={(e) => handleChange('linkedIn', e.target.value)}
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              value={data.github}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="https://github.com/johndoe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input
              id="portfolio"
              value={data.portfolio}
              onChange={(e) => handleChange('portfolio', e.target.value)}
              placeholder="https://johndoe.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Professional Summary Section
 */
export const SummarySection = ({ value, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary">
            Write a compelling professional summary (2-3 sentences)
          </Label>
          <Textarea
            id="summary"
            value={value}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Detail-oriented Full Stack Developer with 5+ years of experience building scalable web applications..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500">
            {value.length} / 500 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Skills Section
 */
export const SkillsSection = ({ skills, onAdd, onUpdate, onDelete }) => {
  const [newSkill, setNewSkill] = React.useState({
    name: '',
    category: 'Languages',
  });

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      onAdd({ name: newSkill.name.trim(), category: newSkill.category });
      setNewSkill({ name: '', category: 'Languages' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="e.g., React, Python, AWS"
            />
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Languages</option>
              <option>Databases</option>
              <option>Frameworks</option>
              <option>Soft Skills</option>
            </select>
            <Button onClick={handleAddSkill} className="w-full">
              <Plus className="w-4 h-4 mr-1" /> Add Skill
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full flex items-center gap-2"
              >
                <span>{skill.name}</span>
                {skill.category && (
                  <span className="text-xs bg-blue-200 px-2 py-0.5 rounded">
                    {skill.category}
                  </span>
                )}
                <button
                  onClick={() => onDelete(skill.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Experience Section
 */
export const ExperienceSection = ({ experiences, onAdd, onUpdate, onDelete }) => {
  const [expandedId, setExpandedId] = React.useState(null);
  const [formData, setFormData] = React.useState({
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: '',
  });

  const handleAddExperience = () => {
    if (formData.jobTitle && formData.company) {
      onAdd(formData);
      setFormData({
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{exp.jobTitle}</h4>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-500">
                    {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(exp.id);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {expandedId === exp.id && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm">{exp.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold">Add New Experience</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Job Title"
              value={formData.jobTitle}
              onChange={(e) =>
                setFormData({ ...formData, jobTitle: e.target.value })
              }
            />
            <Input
              placeholder="Company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
            <Input
              placeholder="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
            <Input
              type="month"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              placeholder="Start Date"
            />
            {!formData.currentlyWorking && (
              <Input
                type="month"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                placeholder="End Date"
              />
            )}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.currentlyWorking}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentlyWorking: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <span className="text-sm">Currently Working Here</span>
            </label>
          </div>
          <Textarea
            placeholder="Describe your responsibilities and achievements..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="min-h-[80px]"
          />
          <Button onClick={handleAddExperience} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Experience
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Education Section
 */
export const EducationSection = ({ educations, onAdd, onDelete }) => {
  const [expandedId, setExpandedId] = React.useState(null);
  const [formData, setFormData] = React.useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    currentlyStudying: false,
    grade: '',
  });

  const handleAddEducation = () => {
    if (formData.school && formData.degree) {
      onAdd(formData);
      setFormData({
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        currentlyStudying: false,
        grade: '',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => setExpandedId(expandedId === edu.id ? null : edu.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{edu.school}</h4>
                  <p className="text-sm text-gray-600">
                    {edu.degree} in {edu.fieldOfStudy}
                  </p>
                  <p className="text-xs text-gray-500">
                    {edu.startDate} - {edu.currentlyStudying ? 'Present' : edu.endDate}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(edu.id);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold">Add New Education</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="School/University"
              value={formData.school}
              onChange={(e) =>
                setFormData({ ...formData, school: e.target.value })
              }
            />
            <Input
              placeholder="Degree"
              value={formData.degree}
              onChange={(e) =>
                setFormData({ ...formData, degree: e.target.value })
              }
            />
            <Input
              placeholder="Field of Study"
              value={formData.fieldOfStudy}
              onChange={(e) =>
                setFormData({ ...formData, fieldOfStudy: e.target.value })
              }
            />
            <Input
              placeholder="Grade (Optional)"
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
            />
            <Input
              type="month"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              placeholder="Start Date"
            />
            {!formData.currentlyStudying && (
              <Input
                type="month"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                placeholder="End Date"
              />
            )}
            <label className="flex items-center col-span-full">
              <input
                type="checkbox"
                checked={formData.currentlyStudying}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentlyStudying: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <span className="text-sm">Currently Studying</span>
            </label>
          </div>
          <Button onClick={handleAddEducation} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Education
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Projects Section
 */
export const ProjectsSection = ({ projects, onAdd, onDelete }) => {
  const [expandedId, setExpandedId] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    technologies: '',
    link: '',
    startDate: '',
    endDate: '',
  });

  const handleAddProject = () => {
    if (formData.name && formData.description) {
      onAdd({
        ...formData,
        technologies: formData.technologies
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
      });
      setFormData({
        name: '',
        description: '',
        technologies: '',
        link: '',
        startDate: '',
        endDate: '',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() =>
                setExpandedId(expandedId === project.id ? null : project.id)
              }
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{project.name}</h4>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Project
                    </a>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project.id);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {expandedId === project.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <p className="text-sm">{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold">Add New Project</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Project Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="md:col-span-2"
            />
            <Input
              type="month"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              placeholder="Start Date"
            />
            <Input
              type="month"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              placeholder="End Date"
            />
            <Input
              placeholder="Project Link (optional)"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              className="md:col-span-2"
            />
            <Input
              placeholder="Technologies (comma-separated)"
              value={formData.technologies}
              onChange={(e) =>
                setFormData({ ...formData, technologies: e.target.value })
              }
              className="md:col-span-2"
            />
          </div>
          <Textarea
            placeholder="Describe your project..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="min-h-[80px]"
          />
          <Button onClick={handleAddProject} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Certifications Section
 */
export const CertificationsSection = ({ certifications, onAdd, onDelete }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    issuer: '',
    issuedDate: '',
    expiryDate: '',
    link: '',
  });

  const handleAddCertification = () => {
    if (formData.name && formData.issuer) {
      onAdd(formData);
      setFormData({
        name: '',
        issuer: '',
        issuedDate: '',
        expiryDate: '',
        link: '',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="border rounded-lg p-3 bg-gray-50 flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold text-sm">{cert.name}</h4>
                <p className="text-xs text-gray-600">{cert.issuer}</p>
              </div>
              <button
                onClick={() => onDelete(cert.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold">Add New Certification</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Certification Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              placeholder="Issuer Organization"
              value={formData.issuer}
              onChange={(e) =>
                setFormData({ ...formData, issuer: e.target.value })
              }
            />
            <Input
              type="month"
              value={formData.issuedDate}
              onChange={(e) =>
                setFormData({ ...formData, issuedDate: e.target.value })
              }
              placeholder="Issued Date"
            />
            <Input
              type="month"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              placeholder="Expiry Date (optional)"
            />
            <Input
              placeholder="Credential Link (optional)"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              className="md:col-span-2"
            />
          </div>
          <Button onClick={handleAddCertification} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Certification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Achievements Section
 */
export const AchievementsSection = ({ achievements, onAdd, onDelete }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    date: '',
    description: '',
  });

  const handleAddAchievement = () => {
    if (formData.title.trim()) {
      onAdd(formData);
      setFormData({ title: '', date: '', description: '' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="border rounded-lg p-3 bg-gray-50 flex justify-between items-start"
            >
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">{ach.title}</h4>
                {(ach.date || ach.description) && (
                  <p className="text-xs text-gray-600">
                    {ach.date && <span className="mr-1">{ach.date}</span>}
                    {ach.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDelete(ach.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold">Add Achievement</h4>
          <Input
            placeholder="Achievement title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            type="month"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            placeholder="Date"
          />
          <Textarea
            placeholder="Short description or context"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[80px]"
          />
          <Button onClick={handleAddAchievement} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Achievement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Training Section
 */
export const TrainingSection = ({ training, onAdd, onDelete }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    provider: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const handleAddTraining = () => {
    if (formData.name.trim()) {
      onAdd(formData);
      setFormData({
        name: '',
        provider: '',
        startDate: '',
        endDate: '',
        description: '',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {training.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-3 bg-gray-50 flex justify-between items-start"
            >
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                <p className="text-xs text-gray-600">
                  {item.provider}
                  {(item.startDate || item.endDate) && (
                    <span className="ml-1">
                      • {item.startDate} {item.endDate && `- ${item.endDate}`}
                    </span>
                  )}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-600">{item.description}</p>
                )}
              </div>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold">Add Training</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Program / Course"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="md:col-span-2"
            />
            <Input
              placeholder="Provider / Organization"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="md:col-span-2"
            />
            <Input
              type="month"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              placeholder="Start Date"
            />
            <Input
              type="month"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              placeholder="End Date"
            />
          </div>
          <Textarea
            placeholder="What was covered or achieved"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[80px]"
          />
          <Button onClick={handleAddTraining} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Training
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
