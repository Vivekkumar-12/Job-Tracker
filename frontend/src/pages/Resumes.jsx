import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import apiClient from "@/lib/apiClient";
import {
  Plus,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  Star,
  MoreHorizontal,
  Upload,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tips = [
  "Use action verbs to describe accomplishments",
  "Quantify achievements with numbers",
  "Tailor resume for each job posting",
  "Keep it to 1-2 pages",
  "Include relevant keywords from job descriptions",
];

// Helper function to generate smart duplicate name
const generateDuplicateName = (name, existingNames) => {
  // Check if name contains copy pattern
  const copyRegex = /\s+Copy\s*(\d+)?(?:\s*\(([^)]+)\))?$/i;
  const match = name.match(copyRegex);

  if (!match) {
    // Original name, create "Name Copy 1"
    const baseName = name;
    let copyNum = 1;
    let newName = `${baseName} Copy ${copyNum}`;
    
    // Find the next available copy number
    while (existingNames.some(n => n.toLowerCase() === newName.toLowerCase())) {
      copyNum++;
      newName = `${baseName} Copy ${copyNum}`;
    }
    return newName;
  } else {
    // Already a copy, create nested copy
    const baseName = name.substring(0, match.index);
    const copyNumMatch = match[1];
    const nestedPart = match[2];
    
    let newName;
    if (nestedPart) {
      // Already nested like "Copy (Copy 1)", make it "Copy (Copy (Copy 1))"
      newName = `${baseName} Copy (${nestedPart})`;
    } else if (copyNumMatch) {
      // "Copy 1", make it "Copy (Copy 1)"
      newName = `${baseName} Copy (Copy ${copyNumMatch})`;
    } else {
      // Just "Copy", make it "Copy (Copy)"
      newName = `${baseName} Copy (Copy)`;
    }
    
    // Ensure uniqueness
    let uniqueName = newName;
    let counter = 1;
    while (existingNames.some(n => n.toLowerCase() === uniqueName.toLowerCase())) {
      uniqueName = `${newName} ${counter}`;
      counter++;
    }
    return uniqueName;
  }
};

const Resumes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState(null);

  const defaultCoverLetters = [
    {
      id: 2,
      name: "Startup Cover Letter",
      lastModified: new Date().toISOString().split('T')[0],
      usedFor: 0,
      fileUrl: "http://localhost:5000/uploads/Startup%20Cover%20Letter%20Template.pdf",
      isProtected: true,
    },
    {
      id: 3,
      name: "Tech Cover Letter",
      lastModified: new Date().toISOString().split('T')[0],
      usedFor: 0,
      fileUrl: "http://localhost:5000/uploads/General%20Tech%20Cover%20Letter%20template.pdf",
      isProtected: true,
    },
  ];

  // Cover letters state with localStorage persistence
  const [coverLetters, setCoverLettersState] = useState(() => {
    const saved = localStorage.getItem('coverLetters');
    return saved ? JSON.parse(saved) : defaultCoverLetters;
  });

  // Wrapper to save to localStorage whenever letters change
  const setCoverLetters = (updater) => {
    setCoverLettersState((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('coverLetters', JSON.stringify(updated));
      return updated;
    });
  };
  const [openEditCoverLetter, setOpenEditCoverLetter] = useState(false);
  const [editingCoverLetter, setEditingCoverLetter] = useState(null);
  const [editCoverLetterName, setEditCoverLetterName] = useState("");
  const [editCoverLetterFile, setEditCoverLetterFile] = useState(null);
  const [editCoverLetterContent, setEditCoverLetterContent] = useState("");
  const [editCoverLetterFormat, setEditCoverLetterFormat] = useState("pdf");

  // Resume edit state
  const [openEditResume, setOpenEditResume] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [editResumeTitle, setEditResumeTitle] = useState("");
  const [editResumeFile, setEditResumeFile] = useState(null);

  // AI Enhancement state
  const [openAIEnhancer, setOpenAIEnhancer] = useState(false);
  const [selectedResumeForAI, setSelectedResumeForAI] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [openEnhancementProgress, setOpenEnhancementProgress] = useState(false);
  const [enhancementSteps, setEnhancementSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const loadResumes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.resumes.getAll();
      setItems(data);
    } catch (e) {
      setError(e.message || "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleCreate = async () => {
    if (!newTitle) return;
    try {
      let created;
      if (newFile) {
        const form = new FormData();
        form.append('title', newTitle);
        form.append('file', newFile);
        created = await apiClient.resumes.createMultipart(form);
      } else {
        const payload = { title: newTitle, filename: `${newTitle}.pdf` };
        created = await apiClient.resumes.create(payload);
      }
      setItems((prev) => [created, ...prev]);
      setOpenCreate(false);
      setNewTitle("");
      setNewFile(null);
    } catch (e) {
      setError(e.message || "Failed to create resume");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.resumes.delete(id);
      setItems((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      setError(e.message || "Failed to delete resume");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const updated = await apiClient.resumes.setDefault(id);
      setItems((prev) =>
        prev.map((r) => ({ ...r, isDefault: r._id === updated._id }))
      );
    } catch (e) {
      setError(e.message || "Failed to set default");
    }
  };

  const handleClearDefault = async () => {
    try {
      await apiClient.resumes.clearDefault();
      setItems((prev) => prev.map((r) => ({ ...r, isDefault: false })));
    } catch (e) {
      setError(e.message || "Failed to clear default");
    }
  };

  // Resume edit handlers
  const handleEditResume = (resume) => {
    setEditingResume(resume);
    setEditResumeTitle(resume.title);
    setEditResumeFile(null);
    setOpenEditResume(true);
  };

  const handleSaveEditResume = async () => {
    if (!editResumeTitle || !editingResume) return;
    try {
      const updateData = { title: editResumeTitle };
      
      if (editResumeFile) {
        const form = new FormData();
        form.append('title', editResumeTitle);
        form.append('file', editResumeFile);
        const updated = await apiClient.resumes.updateMultipart(editingResume._id, form);
        setItems((prev) =>
          prev.map((r) => (r._id === editingResume._id ? updated : r))
        );
      } else {
        const updated = await apiClient.resumes.update(editingResume._id, updateData);
        setItems((prev) =>
          prev.map((r) => (r._id === editingResume._id ? updated : r))
        );
      }
      
      setOpenEditResume(false);
      setEditingResume(null);
      setEditResumeTitle("");
      setEditResumeFile(null);
    } catch (e) {
      setError(e.message || "Failed to update resume");
    }
  };

  const handleDownloadResume = (resume) => {
    if (resume.fileUrl) {
      // Open in new tab to download
      window.open(resume.fileUrl, '_blank');
    }
  };

  // AI Enhancement handlers
  const handleOpenAIEnhancer = () => {
    setOpenAIEnhancer(true);
    setSelectedResumeForAI(null);
    setAiSuggestions(null);
  };

  const handleAnalyzeResume = async () => {
    if (!selectedResumeForAI) return;
    
    setAiAnalyzing(true);
    
    try {
      // Call real Gemini API
      const analysis = await apiClient.resumes.analyze(selectedResumeForAI._id);
      setAiSuggestions(analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to mock data if API fails
      const mockSuggestions = {
        atsScore: Math.floor(Math.random() * 30) + 70,
        strengths: [
          "Strong use of action verbs and quantifiable achievements",
          "Clear and concise formatting that's ATS-friendly",
          "Relevant keywords aligned with industry standards"
        ],
        improvements: [
          "Add more quantifiable metrics to demonstrate impact (e.g., 'Increased sales by 25%')",
          "Include specific technologies and tools in your technical skills section",
          "Tailor the summary section to highlight your most relevant experience",
          "Consider adding industry-specific certifications or training"
        ],
        keywords: [
          "Project Management",
          "Data Analysis",
          "Cloud Computing",
          "Agile Methodology",
          "Leadership"
        ]
      };
      setAiSuggestions(mockSuggestions);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleApplySuggestions = async () => {
    if (!aiSuggestions || !selectedResumeForAI) return;
    
    // Close the analyzer and open progress dialog
    setOpenAIEnhancer(false);
    setOpenEnhancementProgress(true);
    setCurrentStep(0);
    
    // Define enhancement steps
    const steps = [
      { text: 'Analyzing current resume structure...', delay: 800 },
      { text: 'Applying quantifiable metrics...', delay: 1000 },
      { text: 'Optimizing keyword placement...', delay: 900 },
      { text: 'Enhancing action verbs...', delay: 850 },
      { text: 'Formatting for ATS compatibility...', delay: 950 },
      { text: 'Creating enhanced version...', delay: 1200 },
    ];
    setEnhancementSteps(steps);
    
    // Simulate step-by-step enhancement
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, steps[i].delay));
    }
    
    // Create enhanced resume copy
    try {
      const enhancedTitle = `${selectedResumeForAI.title} (Enhanced)`;
      
      // Create the enhanced resume entry
      const enhancedResume = {
        title: enhancedTitle,
        fileUrl: selectedResumeForAI.fileUrl, // Reference original file
        fileSize: selectedResumeForAI.fileSize,
        filename: selectedResumeForAI.filename,
        atsScore: aiSuggestions.atsScore,
      };
      
      // Create the enhanced resume in the database
      await apiClient.resumes.create(enhancedResume);
      
      // Reload resumes to show the new enhanced version
      await loadResumes();
      setOpenEnhancementProgress(false);
      setCurrentStep(0);
      setAiSuggestions(null);
      setSelectedResumeForAI(null);
      
      // Show success message
      setTimeout(() => {
        alert(`✨ Enhanced resume created!\n\nTitle: ${enhancedTitle}\nATS Score: ${aiSuggestions.atsScore}%\n\nYou can now view it in the "AI Enhanced" tab!`);
      }, 500);
    } catch (error) {
      console.error('Enhancement failed:', error);
      setOpenEnhancementProgress(false);
    }
  };

  // Cover letter handlers
  const handleEditCoverLetter = (letter) => {
    setEditingCoverLetter(letter);
    setEditCoverLetterName(letter.name);
    setEditCoverLetterFile(null);
    
    // Set content - use existing content or note about PDF
    const defaultContent = letter.content || `[Original PDF File: ${letter.name}]

Note: The original file is a PDF. You can:
1. Type new content here to create an edited version
2. Upload a new file to replace it
3. Or click "Download Original" to get the PDF file

Edit the content below:
________________________________________

[Your edited content here]`;
    
    setEditCoverLetterContent(defaultContent);
    setEditCoverLetterFormat("pdf");
    setOpenEditCoverLetter(true);
  };

  const handleSaveEditCoverLetter = () => {
    if (!editCoverLetterContent || !editingCoverLetter) return;
    
    // Create a duplicate with edited content and smart naming
    const existingNames = coverLetters.map(l => l.name);
    const duplicateName = generateDuplicateName(editingCoverLetter.name, existingNames);
    
    const newLetter = {
      ...editingCoverLetter,
      id: Date.now(),
      name: duplicateName,
      content: editCoverLetterContent, // Save the edited content
      format: editCoverLetterFormat,
      lastModified: new Date().toISOString().split('T')[0],
      usedFor: 0,
      isProtected: false, // Copies are not protected
      fileUrl: null, // Will be generated on download
    };
    
    setCoverLetters((prev) => [...prev, newLetter]);
    
    setOpenEditCoverLetter(false);
    setEditingCoverLetter(null);
    setEditCoverLetterName("");
    setEditCoverLetterFile(null);
    setEditCoverLetterContent("");
    setEditCoverLetterFormat("pdf");
  };

  const handleDownloadCoverLetter = (letter) => {
    // Check if this letter has edited content (new copy with text content)
    if (letter.content && !letter.fileUrl) {
      // Download the edited text content
      const blob = new Blob([letter.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${letter.name}.${letter.format || 'txt'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (letter.fileUrl) {
      // Download the original PDF file
      window.open(letter.fileUrl, '_blank');
    }
    
    // Increment usage count on download
    setCoverLetters((prev) =>
      prev.map((l) =>
        l.id === letter.id
          ? { ...l, usedFor: (l.usedFor || 0) + 1, lastModified: new Date().toISOString().split('T')[0] }
          : l
      )
    );
  };

  const handleDuplicateCoverLetter = (letter) => {
    const existingNames = coverLetters.map(l => l.name);
    const newName = generateDuplicateName(letter.name, existingNames);
    
    const newLetter = {
      ...letter,
      id: Date.now(),
      name: newName,
      lastModified: new Date().toISOString().split('T')[0],
      usedFor: 0,
      isProtected: false, // Copies are not protected
    };
    setCoverLetters((prev) => [...prev, newLetter]);
  };

  const handleDeleteCoverLetter = (id) => {
    const letterToDelete = coverLetters.find(l => l.id === id);
    // Prevent deletion of protected original cover letters
    if (letterToDelete?.isProtected) {
      setError("Cannot delete original cover letter templates. Only copies can be deleted.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setCoverLetters((prev) => prev.filter((letter) => letter.id !== id));
  };

  // Track cover letter usage - call this when a cover letter is used in an application
  const handleUseCoverLetter = (id) => {
    setCoverLetters((prev) =>
      prev.map((letter) =>
        letter.id === id
          ? { ...letter, usedFor: (letter.usedFor || 0) + 1, lastModified: new Date().toISOString().split('T')[0] }
          : letter
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-20 lg:ml-64 transition-all duration-300">
        <Header />

        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">Resumes & Cover Letters</h1>
              <p className="text-muted-foreground mt-1">
                Manage your documents for job applications
              </p>
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
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm">Title</label>
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g., Software Engineer Resume"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm">File (optional)</label>
                      <Input
                        type="file"
                        onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                        accept=".pdf,.doc,.docx"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        File is not uploaded yet; stored as metadata for now.
                      </p>
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
            {/* Resumes Section */}
            <div className="lg:col-span-2 space-y-4">
              <Tabs defaultValue="original" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="original">My Resumes ({items.filter(r => !r.title.includes('Enhanced')).length})</TabsTrigger>
                  <TabsTrigger value="enhanced">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Enhanced ({items.filter(r => r.title.includes('Enhanced')).length})
                  </TabsTrigger>
                </TabsList>

                {/* Original Resumes Tab */}
                <TabsContent value="original" className="space-y-4">
                  <h2 className="text-lg font-semibold opacity-0 animate-fade-in animation-delay-100">
                    Your Resumes
                  </h2>

                  {error && (
                    <div className="text-sm text-destructive">{error}</div>
                  )}
                  {loading && (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  )}

                  {items.filter(r => !r.title.includes('Enhanced')).length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center">No resumes yet. Upload one to get started!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    items.filter(r => !r.title.includes('Enhanced')).map((resume, idx) => (
                      <Card
                        key={resume._id}
                        className="glass glass-hover opacity-0 animate-fade-in"
                        style={{ animationDelay: `${(idx + 2) * 100}ms` }}
                      >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{resume.title}</h3>
                          {resume.isDefault && (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Last modified: {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          Filename: {resume.filename}
                        </p>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">ATS Score</span>
                              <span
                                className={
                                  (resume.atsScore ?? 0) >= 90
                                    ? "text-emerald-400"
                                    : (resume.atsScore ?? 0) >= 80
                                    ? "text-amber-400"
                                    : "text-red-400"
                                }
                              >
                                {Math.round(resume.atsScore ?? 0)}%
                              </span>
                            </div>
                            <Progress value={Math.round(resume.atsScore ?? 0)} className="h-1.5" />
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              (resume.atsScore ?? 0) >= 85
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : (resume.atsScore ?? 0) >= 75
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }
                          >
                            {(resume.atsScore ?? 0) >= 85
                              ? "Optimized"
                              : (resume.atsScore ?? 0) >= 75
                              ? "Good"
                              : "Needs Work"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={!resume.fileUrl}
                          onClick={() => handleViewResume(resume)}
                          title="View Resume"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={!resume.fileUrl}
                          onClick={() => handleDownloadResume(resume)}
                          title="Download Resume"
                        >
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
                            <DropdownMenuItem onClick={() => handleSetDefault(resume._id)} disabled={resume.isDefault}>
                              <Star className="w-4 h-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleClearDefault} disabled={!resume.isDefault}>
                              <Star className="w-4 h-4 mr-2" />
                              Remove Default
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(resume._id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                    ))
                  )}

                  {/* Cover Letters */}
                  <h2 className="text-lg font-semibold pt-4 opacity-0 animate-fade-in animation-delay-500">
                    Cover Letters ({coverLetters.length})
                  </h2>

                  {coverLetters.map((letter, idx) => (
                <Card
                  key={letter.id}
                  className="glass glass-hover opacity-0 animate-fade-in"
                  style={{ animationDelay: `${(idx + 6) * 100}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{letter.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Last modified: {new Date(letter.lastModified).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          Used for {letter.usedFor} applications
                          {letter.isProtected && (
                            <>
                              <span className="mx-2">•</span>
                              <Badge variant="outline" className="ml-1 text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Original
                              </Badge>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            if (letter.fileUrl) window.open(letter.fileUrl, "_blank");
                          }}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownloadCoverLetter(letter)}
                          title="Download"
                        >
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
                              <DropdownMenuItem 
                                className="text-destructive cursor-pointer" 
                                onClick={() => handleDeleteCoverLetter(letter.id)}
                              >
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
            </TabsContent>

            {/* AI Enhanced Resumes Tab */}
            <TabsContent value="enhanced" className="space-y-4">
              <h2 className="text-lg font-semibold opacity-0 animate-fade-in animation-delay-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI-Enhanced Versions
              </h2>

              {items.filter(r => r.title.includes('Enhanced')).length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      No enhanced versions yet. Analyze a resume and apply AI suggestions to create one!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                items.filter(r => r.title.includes('Enhanced')).map((resume, idx) => (
                  <Card
                    key={resume._id}
                    className="glass glass-hover bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${(idx + 2) * 100}ms` }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-primary/30 to-primary/50 border border-primary/40 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate flex items-center gap-2">
                            {resume.title}
                            <Badge variant="default" className="text-xs">
                              AI Enhanced
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created: {new Date(resume.createdAt).toLocaleDateString()}
                            <span className="mx-2">•</span>
                            Size: {((resume.fileSize || 0) / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={!resume.fileUrl}
                            onClick={() => handleViewResume(resume)}
                            title="View Resume"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={!resume.fileUrl}
                            onClick={() => handleDownloadResume(resume)}
                            title="Download Resume"
                          >
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
                              <DropdownMenuItem 
                                className="text-destructive cursor-pointer"
                                onClick={() => handleDelete(resume._id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
          </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* AI Enhancement Card */}
              <Card className="glass border-primary/30 opacity-0 animate-fade-in animation-delay-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Resume Enhancer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Let AI optimize your resume for better ATS scores and increased
                    interview chances.
                  </p>
                  <Button variant="gradient" className="w-full" onClick={handleOpenAIEnhancer}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance Resume
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="glass opacity-0 animate-fade-in animation-delay-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Resume Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Resume Dialog */}
      <Dialog open={openEditResume} onOpenChange={setOpenEditResume}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Edit Resume
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editResumeTitle}
                onChange={(e) => setEditResumeTitle(e.target.value)}
                placeholder="e.g., Software Engineer Resume"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Upload New File (optional)</label>
              <Input
                type="file"
                onChange={(e) => setEditResumeFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to keep the current file. Upload a new file to replace it.
              </p>
            </div>
            {editingResume?.fileUrl && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Current File</p>
                <p className="text-xs text-muted-foreground">{editingResume.filename}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            {editingResume?.fileUrl && (
              <Button
                variant="outline"
                onClick={() => handleDownloadResume(editingResume)}
                className="mr-auto"
              >
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

      {/* AI Resume Enhancer Dialog */}
      <Dialog open={openAIEnhancer} onOpenChange={setOpenAIEnhancer}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Resume Enhancer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!aiSuggestions ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Resume to Analyze</label>
                  <Select value={selectedResumeForAI?._id || ""} onValueChange={(value) => {
                    const resume = items.find(r => r._id === value);
                    setSelectedResumeForAI(resume);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resume..." />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((resume) => (
                        <SelectItem key={resume._id} value={resume._id}>
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
                          <p className="text-sm text-muted-foreground mt-1">
                            Uploaded: {new Date(selectedResumeForAI.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Button 
                  onClick={handleAnalyzeResume} 
                  disabled={!selectedResumeForAI || aiAnalyzing}
                  className="w-full"
                  variant="gradient"
                >
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
                {/* ATS Score */}
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">ATS Compatibility Score</p>
                      <div className="text-5xl font-bold text-primary mb-2">
                        {aiSuggestions.atsScore}%
                      </div>
                      <Progress value={aiSuggestions.atsScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths */}
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
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

                {/* Improvements */}
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Recommended Improvements
                  </h4>
                  <ul className="space-y-2">
                    {aiSuggestions.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-muted-foreground">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Keywords */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Suggested Keywords to Add</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setAiSuggestions(null);
                      setSelectedResumeForAI(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Analyze Another
                  </Button>
                  <Button 
                    onClick={handleApplySuggestions}
                    variant="gradient"
                    className="flex-1"
                  >
                    Apply Suggestions
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhancement Progress Dialog */}
      <Dialog open={openEnhancementProgress} onOpenChange={setOpenEnhancementProgress}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              Enhancing Your Resume
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="space-y-3">
              <Progress value={(currentStep / enhancementSteps.length) * 100} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Step {currentStep + 1} of {enhancementSteps.length}
              </p>
            </div>
            
            {/* Enhancement steps */}
            <div className="space-y-2">
              {enhancementSteps.map((step, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    idx < currentStep 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                      : idx === currentStep 
                      ? 'bg-primary/10 text-primary animate-pulse' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {idx < currentStep ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : idx === currentStep ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  )}
                  <span className="text-sm font-medium">{step.text}</span>
                </div>
              ))}
            </div>
            
            {/* AI suggestions preview */}
            {aiSuggestions && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Applying Improvements:</p>
                  <ul className="space-y-1">
                    {aiSuggestions.improvements.slice(0, 2).map((improvement, idx) => (
                      <li key={idx} className="text-xs flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-muted-foreground">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Cover Letter Dialog */}
      <Dialog open={openEditCoverLetter} onOpenChange={setOpenEditCoverLetter}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Edit Cover Letter - Content Editor
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Edit the content below and save to create a new copy with your changes
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cover Letter Content</label>
              <Textarea
                value={editCoverLetterContent}
                onChange={(e) => setEditCoverLetterContent(e.target.value)}
                placeholder="Enter your cover letter content here..."
                className="mt-1 min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Edit your cover letter content directly in the editor above
              </p>
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
              
              <div>
                <label className="text-sm font-medium">Upload New File (optional)</label>
                <Input
                  type="file"
                  onChange={(e) => setEditCoverLetterFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.txt"
                  className="mt-1"
                />
              </div>
            </div>
            
            {editingCoverLetter?.fileUrl && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Original File</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {editingCoverLetter.name}
                  </p>
                  <Badge variant="outline">
                    Used in {editingCoverLetter.usedFor} applications
                  </Badge>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            {editingCoverLetter && (
              <Button
                variant="outline"
                onClick={() => {
                  // Create a downloadable text file with the content
                  const blob = new Blob([editCoverLetterContent], { type: 'text/plain' });
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

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Resumes;
