import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import PersonalInfoSection from './sections/PersonalInfoSection';
import ProfessionalSummarySection from './sections/ProfessionalSummarySection';
import SkillsSection from './sections/SkillsSection';
import WorkExperienceSection from './sections/WorkExperienceSection';
import EducationSection from './sections/EducationSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import './ResumeEditor.css';

export default function ResumeEditor({ resume, onUpdate, showNotification }) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  const handleSaveResume = async () => {
    try {
      setIsSaving(true);
      const response = await apiClient.resumes.update(resume._id, resume);
      const data = response.data?.data || response.data || response;
      onUpdate(data);
      showNotification('Resume saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save resume', 'error');
      console.error('Error saving resume:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionUpdate = (sectionName, data) => {
    const updatedResume = { ...resume };

    if (sectionName === 'personalInfo') {
      updatedResume.personalInfo = data;
    } else if (sectionName === 'summary') {
      updatedResume.summary = data;
    } else if (sectionName === 'skills') {
      updatedResume.skills = data;
    } else if (sectionName === 'workExperience') {
      updatedResume.workExperience = data;
    } else if (sectionName === 'education') {
      updatedResume.education = data;
    } else if (sectionName === 'projects') {
      updatedResume.projects = data;
    } else if (sectionName === 'certifications') {
      updatedResume.certifications = data;
    } else if (sectionName === 'achievements') {
      updatedResume.achievements = data;
    }

    onUpdate(updatedResume);
  };

  return (
    <div className="resume-editor">
      <div className="editor-header">
        <h2>{resume.title}</h2>
        <div className="editor-actions">
          <Button
            onClick={handleSaveResume}
            disabled={isSaving}
            className="save-button"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="sections-tabs">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoSection
            data={resume.personalInfo || {}}
            onUpdate={(data) => handleSectionUpdate('personalInfo', data)}
          />
        </TabsContent>

        <TabsContent value="summary">
          <ProfessionalSummarySection
            data={resume.summary || {}}
            resumeId={resume._id}
            onUpdate={(data) => handleSectionUpdate('summary', data)}
            showNotification={showNotification}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsSection
            data={resume.skills || { technical: [], professional: [], languages: [] }}
            resumeId={resume._id}
            onUpdate={(data) => handleSectionUpdate('skills', data)}
            showNotification={showNotification}
          />
        </TabsContent>

        <TabsContent value="experience">
          <WorkExperienceSection
            data={resume.workExperience || []}
            resumeId={resume._id}
            onUpdate={(data) => handleSectionUpdate('workExperience', data)}
            showNotification={showNotification}
          />
        </TabsContent>

        <TabsContent value="education">
          <EducationSection
            data={resume.education || []}
            onUpdate={(data) => handleSectionUpdate('education', data)}
          />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsSection
            data={resume.projects || []}
            onUpdate={(data) => handleSectionUpdate('projects', data)}
          />
        </TabsContent>

        <TabsContent value="certifications">
          <CertificationsSection
            data={resume.certifications || []}
            onUpdate={(data) => handleSectionUpdate('certifications', data)}
          />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsSection
            data={resume.achievements || []}
            onUpdate={(data) => handleSectionUpdate('achievements', data)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple Achievements Section (can be expanded)
function AchievementsSection({ data, onUpdate }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '' });

  const handleAddAchievement = () => {
    if (newAchievement.title.trim()) {
      onUpdate([...data, { ...newAchievement, date: new Date() }]);
      setNewAchievement({ title: '', description: '' });
      setIsAdding(false);
    }
  };

  const handleRemoveAchievement = (index) => {
    onUpdate(data.filter((_, i) => i !== index));
  };

  const handleUpdateAchievement = (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;
    onUpdate(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>Add your notable achievements and awards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((achievement, index) => (
          <div key={index} className="achievement-item">
            <div className="space-y-2">
              <Input
                placeholder="Achievement title"
                value={achievement.title || ''}
                onChange={(e) => handleUpdateAchievement(index, 'title', e.target.value)}
              />
              <Textarea
                placeholder="Description"
                value={achievement.description || ''}
                onChange={(e) => handleUpdateAchievement(index, 'description', e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveAchievement(index)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}

        {isAdding && (
          <div className="add-form">
            <Input
              placeholder="Achievement title"
              value={newAchievement.title}
              onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newAchievement.description}
              onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddAchievement} size="sm">Add</Button>
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {!isAdding && (
          <Button
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Achievement
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
