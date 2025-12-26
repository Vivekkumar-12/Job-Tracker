import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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

// Tips and cover letters demo remain static for now

const coverLetters = [
  {
    id: 1,
    name: "General Tech Cover Letter",
    lastModified: "2024-01-14",
    usedFor: 15,
  },
  {
    id: 2,
    name: "Startup Cover Letter",
    lastModified: "2024-01-10",
    usedFor: 6,
  },
];

const tips = [
  "Use action verbs to describe accomplishments",
  "Quantify achievements with numbers",
  "Tailor resume for each job posting",
  "Keep it to 1-2 pages",
  "Include relevant keywords from job descriptions",
];

const Resumes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState(null);

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
      // Re-fetch or update locally
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
              <h2 className="text-lg font-semibold opacity-0 animate-fade-in animation-delay-100">
                Resumes ({items.length})
              </h2>

              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              {loading && (
                <div className="text-sm text-muted-foreground">Loading...</div>
              )}

              {items.map((resume, idx) => (
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
                          onClick={() => {
                            if (resume.fileUrl) window.open(resume.fileUrl, "_blank");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={!resume.fileUrl}
                          onClick={() => {
                            if (resume._id) {
                              const downloadUrl = apiClient.resumes.downloadFile(resume._id);
                              window.location.href = downloadUrl;
                            }
                          }}
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
              ))}

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
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  <Button variant="gradient" className="w-full">
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

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Resumes;
