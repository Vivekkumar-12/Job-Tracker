import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Download, Plus, Trash2, Copy, Eye, FileText, Zap } from 'lucide-react';
import apiClient from '../lib/apiClient';
import ResumeEditor from '../components/resumeBuilder/ResumeEditor.jsx';
import ResumeLivePreview from '../components/resumeBuilder/ResumeLivePreview.jsx';
import ATSScorer from '../components/resumeBuilder/ATSScorer.jsx';

export default function ResumeBuilder() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNewResumeDialog, setShowNewResumeDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('ats-classic');
  const [atsScore, setAtsScore] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch resumes on mount
  useEffect(() => {
    fetchResumes();
    fetchTemplates();
  }, []);

  // Fetch current resume when selection changes
  useEffect(() => {
    if (selectedResumeId) {
      fetchResume(selectedResumeId);
    }
  }, [selectedResumeId]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.resumes.getAll();
      const data = response.data || response; // support direct json
      const list = data.data || data;
      setResumes(list || []);
      if ((list || []).length > 0) {
        setSelectedResumeId(list[0]._id);
      }
    } catch (error) {
      showNotification('Failed to load resumes', 'error');
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResume = async (id) => {
    try {
      setLoading(true);
      const response = await apiClient.resumes.get(id);
      const data = response.data || response;
      setCurrentResume(data.data || data);
      setAtsScore((data.data || data).atsScore || null);
    } catch (error) {
      showNotification('Failed to load resume', 'error');
      console.error('Error fetching resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resumes/templates`);
      const json = await res.json();
      setTemplates(json.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) {
      showNotification('Please enter a resume title', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.resumes.create({
        title: newResumeTitle,
        templateId: selectedTemplate
      });
      const newResume = response.data?.data || response.data || response;
      setResumes([newResume, ...resumes]);
      setSelectedResumeId(newResume._id);
      setNewResumeTitle('');
      setShowNewResumeDialog(false);
      showNotification('Resume created successfully', 'success');
    } catch (error) {
      showNotification('Failed to create resume', 'error');
      console.error('Error creating resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (id) => {
    try {
      setLoading(true);
      await apiClient.delete(`/api/resumes/${id}`);
      setResumes(resumes.filter(r => r._id !== id));
      if (selectedResumeId === id) {
        setSelectedResumeId(resumes.length > 1 ? resumes[0]._id : null);
      }
      showNotification('Resume deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete resume', 'error');
      console.error('Error deleting resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateResume = async (id) => {
    try {
      setLoading(true);
      const resumeToDuplicate = await apiClient.resumes.get(id);
      const data = resumeToDuplicate.data || resumeToDuplicate;
      const newResponse = await apiClient.resumes.create({
        title: `${resumeToDuplicate.title} (Copy)`,
        templateId: data.templateId,
        personalInfo: data.personalInfo,
        summary: data.summary,
        skills: data.skills,
        workExperience: data.workExperience,
        education: data.education,
        projects: data.projects,
        certifications: data.certifications,
        achievements: data.achievements
      });
      const newResume = newResponse.data?.data || newResponse.data || newResponse;
      setResumes([newResume, ...resumes]);
      setSelectedResumeId(newResume._id);
      showNotification('Resume duplicated successfully', 'success');
    } catch (error) {
      showNotification('Failed to duplicate resume', 'error');
      console.error('Error duplicating resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedResumeId) return;

    try {
      setLoading(true);
      const blob = await apiClient.resumes.exportPDF(selectedResumeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${currentResume?.title || 'resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);

      showNotification('Resume exported as PDF', 'success');
    } catch (error) {
      showNotification('Failed to export PDF', 'error');
      console.error('Error exporting PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDOCX = async () => {
    if (!selectedResumeId) return;

    try {
      setLoading(true);
      const blob = await apiClient.resumes.exportDOCX(selectedResumeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${currentResume?.title || 'resume'}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);

      showNotification('Resume exported as DOCX', 'success');
    } catch (error) {
      showNotification('Failed to export DOCX', 'error');
      console.error('Error exporting DOCX:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpdate = (updatedResume) => {
    setCurrentResume(updatedResume);
    setResumes(resumes.map(r => r._id === updatedResume._id ? updatedResume : r));
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!currentResume && !showNewResumeDialog) {
    return (
      <div className="resume-builder-empty">
        <Card>
          <CardHeader>
            <CardTitle>No Resume Found</CardTitle>
            <CardDescription>Create your first resume to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowNewResumeDialog(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create New Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="resume-builder-container">
      {/* Header */}
      <div className="resume-builder-header">
        <div className="header-top">
          <h1>Resume Builder</h1>
          <div className="header-actions">
            <Button
              onClick={() => setShowNewResumeDialog(true)}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Resume
            </Button>
          </div>
        </div>

        {/* Resume List */}
        <div className="resume-list">
          {resumes.map(resume => (
            <div
              key={resume._id}
              className={`resume-card ${selectedResumeId === resume._id ? 'active' : ''}`}
              onClick={() => setSelectedResumeId(resume._id)}
            >
              <div className="resume-info">
                <h3>{resume.title}</h3>
                <p>{new Date(resume.updatedAt).toLocaleDateString()}</p>
                {resume.atsScore?.overallScore && (
                  <div className="ats-badge">
                    ATS: {resume.atsScore.overallScore}%
                  </div>
                )}
              </div>
              <div className="resume-actions">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateResume(resume._id);
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? This action cannot be undone.
                    </AlertDialogDescription>
                    <div className="flex gap-2 justify-end">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteResume(resume._id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {currentResume && (
        <div className="resume-builder-content">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="tabs-header">
              <TabsList>
                <TabsTrigger value="editor">
                  <FileText className="w-4 h-4 mr-2" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="ats">
                  <Zap className="w-4 h-4 mr-2" />
                  ATS Optimizer
                </TabsTrigger>
              </TabsList>

              <div className="export-actions">
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={handleExportDOCX}
                  variant="outline"
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  DOCX
                </Button>
              </div>
            </div>

            <TabsContent value="editor" className="tabs-content">
              <ResumeEditor
                resume={currentResume}
                onUpdate={handleResumeUpdate}
                showNotification={showNotification}
              />
            </TabsContent>

            <TabsContent value="preview" className="tabs-content">
              <ResumeLivePreview resume={currentResume} />
            </TabsContent>

            <TabsContent value="ats" className="tabs-content">
              <ATSScorer
                resume={currentResume}
                atsScore={atsScore}
                onScoreUpdate={setAtsScore}
                showNotification={showNotification}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* New Resume Dialog */}
      {showNewResumeDialog && (
        <div className="dialog-overlay" onClick={() => setShowNewResumeDialog(false)}>
          <Card className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Create New Resume</CardTitle>
              <CardDescription>Choose a template to get started</CardDescription>
            </CardHeader>
            <CardContent className="dialog-body">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resume-title">Resume Title</Label>
                  <Input
                    id="resume-title"
                    placeholder="e.g., Software Engineer Resume"
                    value={newResumeTitle}
                    onChange={(e) => setNewResumeTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Select Template</Label>
                  <div className="template-grid">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <h4>{template.name}</h4>
                        <p>{template.category}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewResumeDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateResume}
                    disabled={loading || !newResumeTitle.trim()}
                  >
                    Create Resume
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Alert className={`notification notification-${notification.type}`}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
