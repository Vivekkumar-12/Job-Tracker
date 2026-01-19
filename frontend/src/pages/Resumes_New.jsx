import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  FileText,
  Trash2,
  MoreHorizontal,
  Edit,
  Copy,
  Eye,
  Download,
  DownloadCloud,
} from 'lucide-react';

const STORAGE_KEY = 'resume_builder_';
const RESUMES_LIST_KEY = 'resumes_list';

/**
 * Resumes Page
 * Displays list of saved resumes and allows creation of new ones
 */
const Resumes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNewResume, setOpenNewResume] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load resumes from localStorage
  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = () => {
    try {
      setLoading(true);
      const list = localStorage.getItem(RESUMES_LIST_KEY);
      const resumesList = list ? JSON.parse(list) : [];
      
      // Load full data for each resume
      const fullResumes = resumesList
        .map((id) => {
          const data = localStorage.getItem(STORAGE_KEY + id);
          return data ? JSON.parse(data) : null;
        })
        .filter(Boolean)
        .sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

      setResumes(fullResumes);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resumes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewResume = () => {
    const name = newResumeName.trim() || 'New Resume';
    const id = `resume_${Date.now()}`;

    const newResume = {
      id,
      name,
      template: 'modern',
      personalDetails: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedIn: '',
        github: '',
        portfolio: '',
      },
      summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save resume
    localStorage.setItem(STORAGE_KEY + id, JSON.stringify(newResume));

    // Update list
    const list = localStorage.getItem(RESUMES_LIST_KEY);
    const resumesList = list ? JSON.parse(list) : [];
    resumesList.push(id);
    localStorage.setItem(RESUMES_LIST_KEY, JSON.stringify(resumesList));

    setOpenNewResume(false);
    setNewResumeName('');
    toast({
      title: 'Success',
      description: 'Resume created successfully',
    });

    // Navigate to builder
    navigate(`/resume-builder?id=${id}`);
  };

  const deleteResume = (id) => {
    if (
      !confirm(
        'Are you sure you want to delete this resume? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // Delete resume data
      localStorage.removeItem(STORAGE_KEY + id);

      // Update list
      const list = localStorage.getItem(RESUMES_LIST_KEY);
      const resumesList = list ? JSON.parse(list) : [];
      const updated = resumesList.filter((rid) => rid !== id);
      localStorage.setItem(RESUMES_LIST_KEY, JSON.stringify(updated));

      // Update state
      setResumes(resumes.filter((r) => r.id !== id));

      toast({
        title: 'Success',
        description: 'Resume deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resume',
        variant: 'destructive',
      });
    }
  };

  const duplicateResume = (resume) => {
    try {
      const newId = `resume_${Date.now()}`;
      const newResume = {
        ...resume,
        id: newId,
        name: `${resume.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save resume
      localStorage.setItem(STORAGE_KEY + newId, JSON.stringify(newResume));

      // Update list
      const list = localStorage.getItem(RESUMES_LIST_KEY);
      const resumesList = list ? JSON.parse(list) : [];
      resumesList.push(newId);
      localStorage.setItem(RESUMES_LIST_KEY, JSON.stringify(resumesList));

      loadResumes();

      toast({
        title: 'Success',
        description: 'Resume duplicated successfully',
      });
    } catch (error) {
      console.error('Error duplicating resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate resume',
        variant: 'destructive',
      });
    }
  };

  const downloadResume = (resume) => {
    try {
      const dataStr = JSON.stringify(resume, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Resume downloaded as JSON',
      });
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to download resume',
        variant: 'destructive',
      });
    }
  };

  const filteredResumes = resumes.filter((resume) =>
    resume.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Resumes</h1>
                  <p className="text-gray-600 mt-1">
                    Create and manage your professional resumes
                  </p>
                </div>
                <Button
                  onClick={() => setOpenNewResume(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Resume
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Search resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading resumes...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredResumes.length === 0 && (
              <Card className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {resumes.length === 0
                    ? 'No resumes yet'
                    : 'No matching resumes'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {resumes.length === 0
                    ? 'Create your first resume to get started'
                    : 'Try adjusting your search'}
                </p>
                {resumes.length === 0 && (
                  <Button
                    onClick={() => setOpenNewResume(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Resume
                  </Button>
                )}
              </Card>
            )}

            {/* Resumes Grid */}
            {!loading && filteredResumes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResumes.map((resume) => (
                  <Card key={resume.id} className="hover:shadow-lg transition">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{resume.name}</CardTitle>
                          <p className="text-xs text-gray-600 mt-1">
                            Updated{' '}
                            {new Date(resume.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/resume-builder?id=${resume.id}`)
                              }
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => duplicateResume(resume)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => downloadResume(resume)}
                            >
                              <DownloadCloud className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteResume(resume.id)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Resume Info */}
                        <div className="space-y-1">
                          {resume.personalDetails.fullName && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Name:</span>{' '}
                              {resume.personalDetails.fullName}
                            </p>
                          )}
                          {resume.personalDetails.email && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Email:</span>{' '}
                              {resume.personalDetails.email}
                            </p>
                          )}
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Template:</span>{' '}
                            <Badge variant="secondary" className="capitalize">
                              {resume.template}
                            </Badge>
                          </p>
                        </div>

                        {/* Completion Stats */}
                        <div className="border-t pt-3">
                          <div className="flex flex-wrap gap-1">
                            {resume.experience.length > 0 && (
                              <Badge variant="outline">
                                {resume.experience.length} Experience
                              </Badge>
                            )}
                            {resume.education.length > 0 && (
                              <Badge variant="outline">
                                {resume.education.length} Education
                              </Badge>
                            )}
                            {resume.skills.length > 0 && (
                              <Badge variant="outline">
                                {resume.skills.length} Skills
                              </Badge>
                            )}
                            {resume.projects.length > 0 && (
                              <Badge variant="outline">
                                {resume.projects.length} Projects
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-3">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              navigate(`/resume-builder?id=${resume.id}`)
                            }
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(
                                `/resume-builder?id=${resume.id}&preview=true`
                              )
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Resume Dialog */}
      <Dialog open={openNewResume} onOpenChange={setOpenNewResume}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Resume Name
              </label>
              <Input
                placeholder="e.g., Software Engineer Resume"
                value={newResumeName}
                onChange={(e) => setNewResumeName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    createNewResume();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenNewResume(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createNewResume}
              disabled={!newResumeName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resumes;
