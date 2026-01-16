import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";
import { Plus, FileText, Download, Eye, Edit, Trash2, MoreHorizontal, Sparkles, CheckCircle2, Copy, Star } from "lucide-react";

const standardResumeRules = [
  { rule: "Use action verbs", examples: "led, achieved, implemented, designed, developed" },
  { rule: "Quantify accomplishments", examples: "increased by 25%, reduced by 40%, managed team of 8" },
  { rule: "Keep it concise", examples: "1-2 pages for most, max 3 for 10+ years experience" },
  { rule: "Use industry keywords", examples: "Review job posting and include relevant skills" },
  { rule: "No typos or grammar errors", examples: "Proofread multiple times" },
  { rule: "Include metrics", examples: "revenue, efficiency, cost savings, time reduction" },
  { rule: "Avoid personal pronouns", examples: "Don't use I or me" },
  { rule: "Consistent formatting", examples: "Same date format, bullet style, spacing" },
];

const getResumeUrl = (resume) => {
  const url = resume?.fileUrl ||
    resume?.url ||
    resume?.file ||
    resume?.link ||
    resume?.uploadedFileUrl ||
    resume?.uploadedFile?.url ||
    null;
  if (url) console.log('Resume URL found:', url);
  else console.log('No URL found in resume:', resume);
  return url;
};

const getResumeId = (resume) => resume?._id || resume?.id || null;

const getFileExtension = (filename) => {
  if (!filename) return null;
  return filename.split('.').pop()?.toLowerCase();
};

const isPdfFile = (filename) => {
  const ext = getFileExtension(filename);
  return ext === 'pdf';
};

const getAtsValue = (score) => {
  if (typeof score === 'object' && score !== null) {
    return score.overallScore ?? 0;
  }
  return score ?? 0;
};

const triggerLocalAtsScore = async (resumeId, titleForLog = '') => {
  if (!resumeId) {
    console.warn('[ATS] No resume ID provided');
    return null;
  }
  try {
    console.log(`[ATS] Triggering calculation for: ${titleForLog || resumeId}`);
    const resp = await apiClient.resumes.calculateATS(resumeId, '');
    console.log('[ATS] Full API response:', JSON.stringify(resp, null, 2));
    
    // Backend response: { success, message, data: { atsScore, grade, recommendation, ... } }
    const scoreValue = resp?.data?.atsScore;
    console.log('[ATS] Extracted atsScore:', scoreValue, 'type:', typeof scoreValue);
    
    if (scoreValue !== null && scoreValue !== undefined && scoreValue !== 0) {
      const final = Math.round(scoreValue);
      console.log(`[ATS] ✓ Success: ${final}% for "${titleForLog}"`);
      return final;
    }
    
    console.warn('[ATS] Score is null, undefined, or 0:', scoreValue);
    console.log('[ATS] Full data object:', resp?.data);
    return null;
  } catch (err) {
    console.error('[ATS] ✗ Exception:', {
      message: err?.message,
      status: err?.status,
      fullError: err
    });
    return null;
  }
};

const generateDuplicateName = (name, existingNames) => {
  let counter = 1;
  let newName = `${name} (Copy)`;
  while (existingNames.includes(newName)) {
    counter += 1;
    newName = `${name} (Copy ${counter})`;
  }
  return newName;
};

const Resumes = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState(null);

  const [openEditResume, setOpenEditResume] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [editResumeTitle, setEditResumeTitle] = useState("");
  const [editResumeFile, setEditResumeFile] = useState(null);

  const [openAIEnhancer, setOpenAIEnhancer] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [selectedResumeForAI, setSelectedResumeForAI] = useState(null);

  const [coverLetters, setCoverLetters] = useState([
    {
      id: 1,
      name: "General Tech Cover Letter",
      lastModified: "2024-01-14",
      usedFor: 15,
      fileUrl: "http://localhost:5000/uploads/General%20Tech%20Cover%20Letter%20template..pdf",
      isProtected: true,
    },
    {
      id: 2,
      name: "Startup Cover Letter",
      lastModified: "2024-01-10",
      usedFor: 6,
      fileUrl: "http://localhost:5000/uploads/Startup%20Cover%20Letter%20Template.pdf",
      isProtected: true,
    },
  ]);
  const [openEditCoverLetter, setOpenEditCoverLetter] = useState(false);
  const [editingCoverLetter, setEditingCoverLetter] = useState(null);
  const [editCoverLetterContent, setEditCoverLetterContent] = useState("");
  const [editCoverLetterFormat, setEditCoverLetterFormat] = useState("pdf");
  const [editCoverLetterFile, setEditCoverLetterFile] = useState(null);

  const loadResumes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.resumes.getAll();
      const resumes = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setItems(resumes);
    } catch (e) {
      setError(e?.message || "Failed to load resumes");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleCreate = async () => {
    if (!newTitle && !newFile) {
      setError("Please add a title or upload a file");
      return;
    }

    try {
      setError("");
      let createdResponse;
      if (newFile) {
        const form = new FormData();
        if (newTitle) form.append("title", newTitle);
        form.append("file", newFile);
        createdResponse = await apiClient.resumes.createWithFile(form);
      } else {
        createdResponse = await apiClient.resumes.create({ title: newTitle, filename: `${newTitle}.pdf` });
      }
      // Extract the resume from the response (handle both { data: resume } and direct resume)
      let created = createdResponse?.data || createdResponse;

      // Auto-run ATS scoring if a file was uploaded
      if (newFile) {
        const resumeId = getResumeId(created);
        console.log('[CREATE] Resume ID:', resumeId, 'Title:', created?.title);
        if (resumeId) {
          console.log('[CREATE] Starting ATS scoring...');
          const atsScoreValue = await triggerLocalAtsScore(resumeId, created?.title);
          console.log('[CREATE] ATS score result:', atsScoreValue);
          if (atsScoreValue !== null && atsScoreValue > 0) {
            console.log('[CREATE] Updating created resume with score:', atsScoreValue);
            created = { ...created, atsScore: atsScoreValue };
          } else {
            console.warn('[CREATE] ATS score is null or 0, not updating');
          }
        }
      }

      // Reload to ensure DB-persisted ATS score is shown
      if (getResumeId(created)) {
        try {
          console.log('[CREATE] Reloading resume to get DB-persisted score...');
          const reloaded = await apiClient.resumes.get(getResumeId(created));
          console.log('[CREATE] Reloaded resume:', reloaded);
          if (reloaded?.atsScore) {
            console.log('[CREATE] DB has atsScore:', reloaded.atsScore);
            created = { ...created, ...reloaded };
          }
        } catch (reloadErr) {
          console.warn('[CREATE] Could not reload:', reloadErr?.message);
        }
      }

      setItems((prev) => {
        console.log('[CREATE] Final item to add:', created);
        return [created, ...prev];
      });
      setOpenCreate(false);
      setNewTitle("");
      setNewFile(null);
    } catch (e) {
      setError(e?.message || "Failed to create resume");
    }
  };

  const handleDelete = async (id) => {
    const resumeId = getResumeId({ _id: id }) || id;
    try {
      await apiClient.resumes.delete(resumeId);
      setItems((prev) => prev.filter((r) => getResumeId(r) !== resumeId));
    } catch (e) {
      setError(e?.message || "Failed to delete resume");
    }
  };

  const handleEditResume = (resume) => {
    setEditingResume(resume);
    setEditResumeTitle(resume?.title || "");
    setEditResumeFile(null);
    setOpenEditResume(true);
  };

  const handleSaveEditResume = async () => {
    if (!editingResume) return;
    const resumeId = getResumeId(editingResume);
    if (!resumeId) {
      setError("Resume ID not found. Please refresh and try again.");
      return;
    }
    try {
      let updatedResponse;
      if (editResumeFile) {
        const form = new FormData();
        if (editResumeTitle) form.append("title", editResumeTitle);
        form.append("file", editResumeFile);
        updatedResponse = await apiClient.resumes.updateWithFile(resumeId, form);
      } else {
        updatedResponse = await apiClient.resumes.update(resumeId, {
          title: editResumeTitle,
        });
      }
      // Extract the resume from the response (handle both { data: resume } and direct resume)
      let updated = updatedResponse?.data || updatedResponse;

      // Auto-run ATS scoring if a new file was uploaded
      if (editResumeFile) {
        console.log('[EDIT] Resume ID:', resumeId, 'Title:', editResumeTitle);
        console.log('[EDIT] Starting ATS scoring...');
        const atsScoreValue = await triggerLocalAtsScore(resumeId, editResumeTitle);
        console.log('[EDIT] ATS score result:', atsScoreValue);
        if (atsScoreValue !== null && atsScoreValue > 0) {
          console.log('[EDIT] Updating resume with score:', atsScoreValue);
          updated = { ...updated, atsScore: atsScoreValue };
        } else {
          console.warn('[EDIT] ATS score is null or 0, not updating');
        }

        // Reload to ensure DB-persisted ATS score is shown
        try {
          console.log('[EDIT] Reloading resume to get DB-persisted score...');
          const reloaded = await apiClient.resumes.get(resumeId);
          console.log('[EDIT] Reloaded resume:', reloaded);
          if (reloaded?.atsScore) {
            console.log('[EDIT] DB has atsScore:', reloaded.atsScore);
            updated = { ...reloaded };
          }
        } catch (reloadErr) {
          console.warn('[EDIT] Could not reload:', reloadErr?.message);
        }
      }

      setItems((prev) => prev.map((r) => (getResumeId(r) === getResumeId(updated) ? updated : r)));
      setOpenEditResume(false);
      setEditingResume(null);
      setEditResumeFile(null);
    } catch (e) {
      setError(e?.message || "Failed to update resume");
    }
  };

  const handleViewResume = (resume) => {
    const url = getResumeUrl(resume);
    if (!url) {
      setError("Resume file not available. Please re-upload.");
      return;
    }
    // For non-PDF files, download instead of viewing
    const isPdf = isPdfFile(resume.filename);
    if (!isPdf) {
      handleDownloadResume(resume);
      return;
    }
    window.open(url, "_blank");
  };

  const handleDownloadResume = (resume) => {
    const url = getResumeUrl(resume);
    if (!url) {
      setError("Resume file not available. Please re-upload.");
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = resume.filename || resume.fileName || "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAIEnhancer = () => {
    setOpenAIEnhancer(true);
    if (items.length > 0) {
      setSelectedResumeForAI(items[0]);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!selectedResumeForAI) return;
    setAiAnalyzing(true);
    try {
      const resumeId = getResumeId(selectedResumeForAI);
      console.log('[AI ANALYZE] Analyzing resume:', resumeId);
      
      const response = await apiClient.post(`/api/resumes/${resumeId}/analyze`);
      console.log('[AI ANALYZE] Response:', response.data);
      
      if (response.data.success) {
        setAiSuggestions({
          score: response.data.data.score,
          totalIssues: response.data.data.totalIssues,
          issues: response.data.data.issues,
          corrections: response.data.data.corrections,
          strengths: response.data.data.strengths,
          keywords: response.data.data.keywords || [],
          standardRules: standardResumeRules.map((rule) => ({ ...rule, importance: "High" })),
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('[AI ANALYZE] Error:', error);
      toast({
        title: "Analysis Failed",
        description: error.response?.data?.error || error.message || "Could not analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleApplySuggestions = () => {
    setOpenAIEnhancer(false);
    setAiSuggestions(null);
    setSelectedResumeForAI(null);
  };

  const handleEditCoverLetter = (letter) => {
    setEditingCoverLetter(letter);
    setEditCoverLetterContent(letter.content || "");
    setEditCoverLetterFormat("pdf");
    setEditCoverLetterFile(null);
    setOpenEditCoverLetter(true);
  };

  const handleSaveEditCoverLetter = () => {
    if (!editingCoverLetter) return;
    const existingNames = coverLetters.map((l) => l.name);
    const duplicateName = generateDuplicateName(editingCoverLetter.name, existingNames);

    let uploadedFileData = null;
    let uploadedFileName = null;
    let uploadedFileType = null;

    if (editCoverLetterFile) {
      uploadedFileName = editCoverLetterFile.name;
      uploadedFileType = editCoverLetterFile.type;
      const reader = new FileReader();
      reader.onload = () => {
        uploadedFileData = reader.result;
        const newLetter = {
          ...editingCoverLetter,
          id: Date.now(),
          name: duplicateName,
          content: editCoverLetterContent || editingCoverLetter.content,
          format: editCoverLetterFormat,
          lastModified: new Date().toISOString().split("T")[0],
          usedFor: 0,
          isProtected: false,
          fileUrl: editingCoverLetter.fileUrl || null,
          uploadedFileData,
          uploadedFileName,
          uploadedFileType,
        };
        setCoverLetters((prev) => [...prev, newLetter]);
      };
      reader.readAsDataURL(editCoverLetterFile);
    } else {
      const newLetter = {
        ...editingCoverLetter,
        id: Date.now(),
        name: duplicateName,
        content: editCoverLetterContent || editingCoverLetter.content,
        format: editCoverLetterFormat,
        lastModified: new Date().toISOString().split("T")[0],
        usedFor: 0,
        isProtected: false,
        fileUrl: editingCoverLetter.fileUrl || null,
        uploadedFileData,
        uploadedFileName,
        uploadedFileType,
      };
      setCoverLetters((prev) => [...prev, newLetter]);
    }

    setOpenEditCoverLetter(false);
    setEditingCoverLetter(null);
    setEditCoverLetterContent("");
    setEditCoverLetterFormat("pdf");
    setEditCoverLetterFile(null);
  };

  const handleDownloadCoverLetter = (letter) => {
    if (letter.uploadedFileData) {
      const link = document.createElement("a");
      link.href = letter.uploadedFileData;
      link.download = letter.uploadedFileName || `${letter.name}.${letter.format || "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (letter.content && !letter.fileUrl) {
      const blob = new Blob([letter.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${letter.name}.${letter.format || "txt"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (letter.fileUrl) {
      window.open(letter.fileUrl, "_blank");
    }

    setCoverLetters((prev) =>
      prev.map((l) =>
        l.id === letter.id
          ? { ...l, usedFor: (l.usedFor || 0) + 1, lastModified: new Date().toISOString().split("T")[0] }
          : l
      )
    );
  };

  const handleDuplicateCoverLetter = (letter) => {
    const existingNames = coverLetters.map((l) => l.name);
    const newName = generateDuplicateName(letter.name, existingNames);

    const newLetter = {
      ...letter,
      id: Date.now(),
      name: newName,
      lastModified: new Date().toISOString().split("T")[0],
      usedFor: 0,
      isProtected: false,
    };
    setCoverLetters((prev) => [...prev, newLetter]);
  };

  const handleDeleteCoverLetter = (id) => {
    setCoverLetters((prev) => prev.filter((letter) => letter.id !== id || letter.isProtected));
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-20 lg:ml-64 transition-all duration-300">
        <Header />

        <main className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">Resumes & Cover Letters</h1>
              <p className="text-muted-foreground mt-1">Manage your documents for job applications</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button variant="gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Resume</DialogTitle>
                    <DialogDescription>Upload a PDF/DOC resume or start with a title and add the file later.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm">Title</label>
                      <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Software Engineer Resume" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm">Upload File (Optional)</label>
                      <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setNewFile(e.target.files?.[0] || null)} className="mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">Supported: PDF, DOC, DOCX</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreate}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold opacity-0 animate-fade-in animation-delay-100">Your Resumes</h2>
                {error && <div className="text-sm text-destructive">{error}</div>}
                {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
                {!Array.isArray(items) || items.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground text-center">No resumes yet. Upload one to get started!</p>
                    </CardContent>
                  </Card>
                ) : (
                  Array.isArray(items) && items.map((resume, idx) => (
                    <Card key={resume._id || idx} className="glass glass-hover opacity-0 animate-fade-in" style={{ animationDelay: `${(idx + 2) * 100}ms` }}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{resume.title || "Untitled Resume"}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Last modified: {(resume.updatedAt || resume.createdAt)
                                ? new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()
                                : "Not available"}
                              <span className="mx-2">•</span>
                              Filename: {resume.filename || resume.fileName || resume.originalName || "Not available"}
                            </p>
                            {(() => {
                              const scoreValue = Math.round(getAtsValue(resume.atsScore));
                              return (
                                <div className="flex items-center gap-4 mt-3">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span className="text-muted-foreground">ATS Score</span>
                                      <span
                                        className={scoreValue >= 90
                                          ? "text-emerald-400"
                                          : scoreValue >= 80
                                          ? "text-amber-400"
                                          : "text-red-400"}
                                      >
                                        {scoreValue}%
                                      </span>
                                    </div>
                                    <Progress value={scoreValue} className="h-1.5" />
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={scoreValue >= 85
                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                      : scoreValue >= 75
                                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                      : "bg-red-500/20 text-red-400 border-red-500/30"}
                                  >
                                    {scoreValue >= 85 ? "Optimized" : scoreValue >= 75 ? "Good" : "Needs Work"}
                                  </Badge>
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!getResumeUrl(resume)} onClick={() => handleViewResume(resume)} title="View Resume">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!getResumeUrl(resume)} onClick={() => handleDownloadResume(resume)} title="Download Resume">
                                <Download className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditResume(resume)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => handleDelete(resume._id)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold pt-4 opacity-0 animate-fade-in animation-delay-200">Cover Letters ({coverLetters.length})</h2>
                {coverLetters.map((letter, idx) => (
                  <Card key={letter.id} className="glass glass-hover opacity-0 animate-fade-in" style={{ animationDelay: `${(idx + 4) * 100}ms` }}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{letter.name}</h3>
                            {letter.isProtected && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Original
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Last modified: {new Date(letter.lastModified).toLocaleDateString()}
                            <span className="mx-2">•</span>
                            Used for {letter.usedFor} applications
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => letter.fileUrl && window.open(letter.fileUrl, "_blank")} title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadCoverLetter(letter)} title="Download">
                            <Download className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCoverLetter(letter)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateCoverLetter(letter)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              {letter.isProtected ? (
                                <DropdownMenuItem className="text-muted-foreground cursor-not-allowed" disabled>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete (Protected)
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => handleDeleteCoverLetter(letter.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="glass border-primary/30 opacity-0 animate-fade-in animation-delay-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Resume Checker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Check your resume against industry best practices. Get detailed feedback on formatting, content, and improvements.</p>
                  <Button variant="gradient" className="w-full" onClick={handleOpenAIEnhancer}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Check Resume
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass opacity-0 animate-fade-in animation-delay-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Standard Resume Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {standardResumeRules.map((item, idx) => (
                      <li key={idx} className="text-sm">
                        <p className="font-medium text-primary mb-0.5">{item.rule}</p>
                        <p className="text-xs text-muted-foreground">{item.examples}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={openEditResume} onOpenChange={setOpenEditResume}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Edit Resume
            </DialogTitle>
            <DialogDescription>Update the title or upload a new file to replace the current resume.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={editResumeTitle} onChange={(e) => setEditResumeTitle(e.target.value)} placeholder="e.g., Software Engineer Resume" className="mt-1" />
            </div>
            {editingResume?.fileUrl && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Current File</p>
                <p className="text-xs text-muted-foreground">{editingResume.filename}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Upload New File (Optional)</label>
              <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setEditResumeFile(e.target.files?.[0] || null)} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">{editResumeFile ? `Selected: ${editResumeFile.name}` : "Upload to replace the current file"}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            {editingResume?.fileUrl && (
              <Button variant="outline" onClick={() => handleDownloadResume(editingResume)} className="mr-auto">
                <Download className="w-4 h-4 mr-2" />
                Download Current
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpenEditResume(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditResume} variant="gradient">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAIEnhancer} onOpenChange={setOpenAIEnhancer}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Resume Checker & Suggestion Tool
            </DialogTitle>
            <DialogDescription>Review automated checks, issues, and suggested fixes for your selected resume.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!aiSuggestions ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Resume to Analyze</label>
                  <Select value={selectedResumeForAI ? getResumeId(selectedResumeForAI) : ""} onValueChange={(value) => {
                    const resume = items.find((r) => getResumeId(r) === value);
                    setSelectedResumeForAI(resume || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resume..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(items) && items.map((resume) => (
                        <SelectItem key={getResumeId(resume)} value={getResumeId(resume)}>
                          {resume.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedResumeForAI && (
                  <Card className="border-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">{selectedResumeForAI.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">Uploaded: {selectedResumeForAI.createdAt ? new Date(selectedResumeForAI.createdAt).toLocaleDateString() : "Unknown"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button onClick={handleAnalyzeResume} disabled={!selectedResumeForAI || aiAnalyzing} className="w-full" variant="gradient">
                  {aiAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Resume Quality Score</p>
                      <div className="text-5xl font-bold text-primary mb-2">{aiSuggestions.score}%</div>
                      <Progress value={aiSuggestions.score} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">Issues Found: {aiSuggestions.totalIssues}</p>
                    </div>
                  </CardContent>
                </Card>

                {aiSuggestions.issues.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-amber-500">Issues Found</h4>
                    <ul className="space-y-2">
                      {aiSuggestions.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                          <span className={`mt-0.5 ${issue.type === "error" ? "text-red-500" : issue.type === "warning" ? "text-amber-500" : "text-blue-500"}`}>⚠</span>
                          <span className="text-muted-foreground">{issue.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSuggestions.corrections.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-primary">
                      <Sparkles className="w-4 h-4" />
                      Corrections & Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {aiSuggestions.corrections.map((correction, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm p-2 bg-primary/10 rounded">
                          <span className="text-primary mt-0.5">→</span>
                          <span className="text-muted-foreground">{correction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSuggestions.strengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {aiSuggestions.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-muted-foreground">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm mb-3">Standard Resume Rules</h4>
                  <div className="space-y-2">
                    {aiSuggestions.standardRules.map((rule, idx) => (
                      <div key={idx} className="text-sm p-2 bg-muted/50 rounded flex items-start gap-2">
                        <Badge className="mt-0.5" variant={rule.importance === "Critical" ? "destructive" : rule.importance === "High" ? "default" : "secondary"}>
                          {rule.importance}
                        </Badge>
                        <span className="text-muted-foreground">{rule.rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => { setAiSuggestions(null); setSelectedResumeForAI(null); }} variant="outline" className="flex-1">
                    Check Another
                  </Button>
                  <Button onClick={handleApplySuggestions} variant="gradient" className="flex-1">
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditCoverLetter} onOpenChange={setOpenEditCoverLetter}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Edit Cover Letter - Content Editor
            </DialogTitle>
            <DialogDescription>Edit the content below, upload a replacement file if needed, and save to create a new copy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cover Letter Content</label>
              <Textarea value={editCoverLetterContent} onChange={(e) => setEditCoverLetterContent(e.target.value)} placeholder="Enter your cover letter content here..." className="mt-1 min-h-[300px] font-mono text-sm" />
              <p className="text-xs text-muted-foreground mt-1">Edit your cover letter content directly in the editor above</p>
            </div>
            <div>
              <label className="text-sm font-medium">Upload New File (Optional)</label>
              <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setEditCoverLetterFile(e.target.files?.[0] || null)} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">{editCoverLetterFile ? `Selected: ${editCoverLetterFile.name}` : "Upload to replace the current file"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Download Format</label>
                <Select value={editCoverLetterFormat} onValueChange={setEditCoverLetterFormat}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="docx">Word (.docx)</SelectItem>
                    <SelectItem value="txt">Text (.txt)</SelectItem>
                    <SelectItem value="html">HTML (.html)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editingCoverLetter?.fileUrl && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Original File</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{editingCoverLetter.name}</p>
                  <Badge variant="outline">Used in {editingCoverLetter.usedFor} applications</Badge>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            {editingCoverLetter && (
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([editCoverLetterContent], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${editingCoverLetter.name}.${editCoverLetterFormat}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="mr-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as {editCoverLetterFormat.toUpperCase()}
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpenEditCoverLetter(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditCoverLetter} variant="gradient">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save as New Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Resumes;
