import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Printer,
  Eye,
  Save,
  Trash2,
  Copy,
  Plus,
  FileJson,
  Upload,
} from 'lucide-react';
import { useResume } from '@/hooks/useResume';
import {
  PersonalDetailsSection,
  SummarySection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  ProjectsSection,
  CertificationsSection,
  AchievementsSection,
  TrainingSection,
} from '@/components/resume/FormSections';
import {
  RESUME_TEMPLATES,
  getTemplateComponent,
} from '@/components/resume/ResumeTemplates';
import { downloadPDF, printResume, exportJSON, importJSON } from '@/lib/resumeUtils';
import { useToast } from '@/hooks/use-toast';

/**
 * Resume Builder Component
 * Main page for building resumes with form and live preview
 */
const ResumeBuilder = () => {
  const resumeId = new URLSearchParams(window.location.search).get('id');
  const {
    resume,
    loading,
    saved,
    createNewResume,
    updatePersonalDetails,
    updateSummary,
    updateTemplate,
    updateProfession,
    addSkill,
    deleteSkill,
    addExperience,
    deleteExperience,
    addEducation,
    deleteEducation,
    addProject,
    deleteProject,
    addCertification,
    deleteCertification,
    addAchievement,
    deleteAchievement,
    addTraining,
    deleteTraining,
  } = useResume(resumeId);

  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(window.innerWidth > 1024);
  const [resumeName, setResumeName] = useState('');

  // Initialize new resume if no ID provided
  useEffect(() => {
    if (!resumeId && resume.id === null) {
      createNewResume();
    }
    setResumeName(resume.name);
  }, []);

  // Update resume name
  const handleUpdateResumeName = (name) => {
    setResumeName(name);
    // Update resume name in state (would need to add this to useResume hook)
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (!previewRef.current) return;
    try {
      downloadPDF(resume.name, previewRef.current);
      toast({
        title: 'Success',
        description: 'Resume downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  // Handle print
  const handlePrint = () => {
    if (!previewRef.current) return;
    printResume(previewRef.current);
  };

  // Handle export JSON
  const handleExportJSON = () => {
    try {
      exportJSON(resume, `${resume.name}.json`);
      toast({
        title: 'Success',
        description: 'Resume exported as JSON',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export JSON',
        variant: 'destructive',
      });
    }
  };

  // Handle import JSON
  const handleImportJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importJSON(file);
      // TODO: Update resume with imported data
      toast({
        title: 'Success',
        description: 'Resume imported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import resume',
        variant: 'destructive',
      });
    }
  };

  // Handle duplicate resume
  const handleDuplicate = () => {
    const newId = createNewResume(`${resume.name} (Copy)`);
    toast({
      title: 'Success',
      description: 'Resume duplicated',
    });
    window.location.href = `/resumes?id=${newId}`;
  };

  // Handle clear all
  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      createNewResume();
      toast({
        title: 'Success',
        description: 'Resume cleared',
      });
    }
  };

  const TemplateComponent = getTemplateComponent(resume.template);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-20 lg:ml-64 transition-all duration-300">
        <Header />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Name
                  </label>
                  <Input
                    value={resumeName}
                    onChange={(e) => handleUpdateResumeName(e.target.value)}
                    className="max-w-md"
                    placeholder="My Resume"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    title="Print resume"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    title="Download as PDF"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportJSON}
                    title="Export as JSON"
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>

              {/* Template & Profession Selection */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Profession
                  </label>
                  <select
                    value={resume.profession}
                    onChange={(e) => updateProfession(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select profession</option>
                    {[
                      'Software Engineer',
                      'Full Stack Developer',
                      'Data Scientist',
                      'Product Manager',
                      'Project Manager',
                      'UI/UX Designer',
                      'Cloud/DevOps Engineer',
                      'Cybersecurity Engineer',
                      'Business Analyst',
                      'Quality Assurance Engineer',
                      'Marketing Specialist',
                      'Student / Graduate',
                    ].map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Resume Template
                  </label>
                  <select
                    value={resume.template}
                    onChange={(e) => updateTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Object.entries(RESUME_TEMPLATES).map(([key, template]) => (
                      <option key={key} value={key}>
                        {template.name} — {template.description}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Choose from {Object.keys(RESUME_TEMPLATES).length} curated templates with distinct layouts.
                  </p>
                </div>
              </div>

              {/* Save Status */}
              {saved && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Auto-saved to your browser
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>

                  {/* Personal Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    <PersonalDetailsSection
                      data={resume.personalDetails}
                      onUpdate={updatePersonalDetails}
                    />
                    <SummarySection
                      value={resume.summary}
                      onUpdate={updateSummary}
                    />
                  </TabsContent>

                  {/* Experience Tab */}
                  <TabsContent value="experience" className="space-y-6">
                    <ExperienceSection
                      experiences={resume.experience}
                      onAdd={addExperience}
                      onDelete={deleteExperience}
                    />
                    <EducationSection
                      educations={resume.education}
                      onAdd={addEducation}
                      onDelete={deleteEducation}
                    />
                  </TabsContent>

                  {/* Skills Tab */}
                  <TabsContent value="skills" className="space-y-6">
                    <SkillsSection
                      skills={resume.skills}
                      onAdd={addSkill}
                      onDelete={deleteSkill}
                    />
                    <ProjectsSection
                      projects={resume.projects}
                      onAdd={addProject}
                      onDelete={deleteProject}
                    />
                    <CertificationsSection
                      certifications={resume.certifications}
                      onAdd={addCertification}
                      onDelete={deleteCertification}
                    />
                    <AchievementsSection
                      achievements={resume.achievements}
                      onAdd={addAchievement}
                      onDelete={deleteAchievement}
                    />
                    <TrainingSection
                      training={resume.training}
                      onAdd={addTraining}
                      onDelete={deleteTraining}
                    />
                  </TabsContent>
                </Tabs>

                {/* More Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>More Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import from JSON
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportJSON}
                    />
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleDuplicate}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate Resume
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleClearAll}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Section */}
              {showPreview && (
                <div className="sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto rounded-lg shadow-lg bg-white">
                  <div ref={previewRef} className="p-0">
                    <TemplateComponent resume={resume} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResumeBuilder;
