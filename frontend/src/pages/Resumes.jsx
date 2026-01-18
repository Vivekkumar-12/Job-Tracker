import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, FileText, Download, Eye, Edit, Trash2, MoreHorizontal, Sparkles, CheckCircle2, Copy, Star, FileEdit } from "lucide-react";

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
const getCoverLetterId = (letter) => letter?._id || letter?.id || null;

const getFileExtension = (filename) => {
  if (!filename) return null;
  return filename.split('.').pop()?.toLowerCase();
};

const isPdfFile = (filename) => {
  const ext = getFileExtension(filename);
  return ext === 'pdf';
};

const getAtsValue = (score) => {
  if (!score) return 0;
  if (typeof score === 'number') return score;
  if (typeof score === 'object' && score !== null) {
    return score.overallScore ?? 0;
  }
  return 0;
};

const hasValidAtsScore = (resume) => {
  const score = getAtsValue(resume?.atsScore);
  return score > 0;
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
  const navigate = useNavigate();
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

  // Load cover letters from localStorage or use defaults
  const getInitialCoverLetters = () => {
    // Return default templates (do not persist in localStorage)
    return [
      {
        id: 1,
        name: "General Tech Cover Letter",
        lastModified: "2024-01-14",
        usedFor: 15,
        fileUrl: "http://localhost:5000/uploads/General%20Tech%20Cover%20Letter%20template..pdf",
        isProtected: true,
        content: `Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineering position at your company. With my extensive background in full-stack development and passion for creating innovative solutions, I am confident I would be a valuable addition to your team.

Throughout my career, I have developed expertise in modern technologies including React, Node.js, and cloud platforms. My experience includes:
• Building scalable web applications that serve thousands of users
• Implementing robust backend systems with RESTful APIs
• Collaborating with cross-functional teams to deliver high-quality products
• Optimizing application performance and user experience

I am particularly drawn to your company's commitment to innovation and excellence. I believe my technical skills, problem-solving abilities, and dedication to continuous learning align well with your team's values.

I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success. Thank you for considering my application.

Best regards,
[Your Name]`,
      },
      {
        id: 2,
        name: "Startup Cover Letter",
        lastModified: "2024-01-10",
        usedFor: 6,
        fileUrl: "http://localhost:5000/uploads/Startup%20Cover%20Letter%20Template.pdf",
        isProtected: true,
        content: `Hi [Hiring Manager Name],

I'm excited to apply for the [Position] role at [Company Name]. Your mission to [company mission] resonates deeply with me, and I'm eager to contribute to your growth.

As someone who thrives in fast-paced environments, I've been following your journey and am impressed by [specific achievement or product]. My background includes:
• Wearing multiple hats and taking ownership of projects from concept to launch
• Rapid prototyping and iterating based on user feedback
• Building MVPs with limited resources and tight deadlines
• Contributing to all aspects of product development

I'm not just looking for a job—I'm looking to join a team where I can make a real impact. Your startup's focus on [specific area] aligns perfectly with my skills and passion.

I'd love to chat about how I can help [Company Name] achieve its goals. Are you available for a quick call this week?

Looking forward to connecting,
[Your Name]`,
      },
    ];
  };

  const [coverLetters, setCoverLetters] = useState(getInitialCoverLetters);
  const [openEditCoverLetter, setOpenEditCoverLetter] = useState(false);
  const [editingCoverLetter, setEditingCoverLetter] = useState(null);
  const [editCoverLetterName, setEditCoverLetterName] = useState("");
  const [editCoverLetterContent, setEditCoverLetterContent] = useState("");
  const [editCoverLetterFormat, setEditCoverLetterFormat] = useState("pdf");
  const [editCoverLetterFile, setEditCoverLetterFile] = useState(null);

  const loadResumes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.resumes.getAll();
      const resumes = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      console.log('[RESUMES] Loaded resumes:', resumes);
      console.log('[RESUMES] First resume atsScore:', resumes[0]?.atsScore);
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

  // Removed localStorage persistence to avoid keeping state across refresh

  // Load cover letters from API when available (fallback to localStorage)
  useEffect(() => {
    const loadCoverLetters = async () => {
      try {
        const resp = await apiClient.coverLetters.getAll();
        const list = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
        if (list.length) {
          // Merge server list with existing local cover letters
          const serverById = new Map();
          const serverByName = new Map();
          for (const item of list) {
            const sid = getCoverLetterId(item);
            if (sid) serverById.set(String(sid), item);
            if (item?.name) serverByName.set(item.name.toLowerCase(), item);
          }

          let merged = [...list];
          // Always include protected defaults at the top, regardless of server duplicates
          for (const localItem of Array.isArray(coverLetters) ? coverLetters : []) {
            const lid = getCoverLetterId(localItem);
            const lname = localItem?.name?.toLowerCase();
            if (localItem.isProtected) {
              merged.unshift(localItem);
              continue;
            }
            // Keep local items not present on server (by id or by name)
            if (lid && !serverById.has(String(lid))) {
              merged.push(localItem);
              continue;
            }
            if (!lid) {
              if (!lname || !serverByName.has(lname)) {
                merged.push(localItem);
              }
            }
          }

          setCoverLetters(merged);

          // Auto-extract content for items that only have fileUrl
          const toExtract = merged.filter((item) => !item.content && item.fileUrl && getCoverLetterId(item));
          for (const item of toExtract) {
            const id = getCoverLetterId(item);
            try {
              const r = await apiClient.coverLetters.extractContent(id);
              const saved = r?.data || r;
              if (saved?.content) {
                setCoverLetters((prev) => prev.map((l) => (getCoverLetterId(l) === id ? saved : l)));
              }
            } catch (err) {
              console.warn('[CoverLetters] extractContent on load failed:', err?.message);
            }
          }
        }
      } catch (e) {
        console.warn('[CoverLetters] API fetch failed, using localStorage:', e?.message);
      }
    };
    loadCoverLetters();
  }, []);

  const handleCreate = async () => {
    if (!newTitle && !newFile) {
      setError("Please add a title or upload a file");
      return;
    }

    try {
      setError("");
      if (newFile) {
        const form = new FormData();
        if (newTitle) form.append("title", newTitle);
        form.append("file", newFile);
        await apiClient.resumes.createWithFile(form);
      } else {
        await apiClient.resumes.create({ title: newTitle, filename: `${newTitle}.pdf` });
      }

      toast({ title: "Resume Created!", description: newFile ? "Your resume has been uploaded and is being analyzed for ATS score." : "Your resume has been created successfully." });
      
      // Reload all resumes to get the auto-calculated ATS score
      await loadResumes();
      
      setNewTitle("");
      setNewFile(null);
      setOpenCreate(false);
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

  const handleEditCoverLetter = (letter) => {
    setEditingCoverLetter(letter);
    
    // Load existing content from letter.content (which should have been set when uploaded)
    let existingContent = letter.content || "";
    
    // If no content and only fileUrl exists (template files), provide a placeholder
    if (!existingContent && letter.fileUrl) {
      existingContent = `[Original file: ${letter.name}]\n\nLoading content from file...`;
    }
    
    setEditCoverLetterName(letter.name || "");
    setEditCoverLetterContent(existingContent);
    setEditCoverLetterFormat(letter.format || "pdf");
    setEditCoverLetterFile(null);
    setOpenEditCoverLetter(true);

    // If we have a server id and no content but a file, try extracting content from server
    const id = getCoverLetterId(letter);
    if (!letter.content && letter.fileUrl && id) {
      apiClient.coverLetters.extractContent(id)
        .then((resp) => {
          const saved = resp?.data || resp;
          if (saved?.content) {
            setEditCoverLetterContent(saved.content);
            setCoverLetters((prev) => prev.map((l) => (getCoverLetterId(l) === id ? saved : l)));
            toast({ title: "Content loaded", description: "Extracted text from the original file." });
          }
        })
        .catch((e) => {
          console.warn('[CoverLetters] extractContent failed:', e?.message);
          // Keep placeholder, user can type or upload a text file
        });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setEditCoverLetterFile(file);
    
    if (!file) return;
    
    // Check if it's a text file that we can read directly
    const isTextFile = file.type.startsWith('text/') || file.name.endsWith('.txt');
    
    if (isTextFile) {
      // Read the file content and update the textarea
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result || '';
        setEditCoverLetterContent(content);
        toast({
          title: "File loaded",
          description: `Loaded ${content.length} characters from ${file.name}`,
        });
      };
      reader.onerror = () => {
        toast({
          title: "File read error",
          description: "Could not read file content.",
          variant: "destructive",
        });
      };
      reader.readAsText(file);
    } else {
      // Non-text files are not supported for cover letters
      setEditCoverLetterFile(null);
      toast({
        title: "Unsupported file type",
        description: "Please upload a .txt file. PDF/DOCX parsing is currently unavailable.",
        variant: "destructive",
      });
      return;
    }
  };

  const handleUpdateCoverLetter = () => {
    if (!editingCoverLetter) return;
    
    // Update existing cover letter
    if (editCoverLetterFile) {
      // Check if it's a text file
      const isTextFile = editCoverLetterFile.type.startsWith('text/') || 
                         editCoverLetterFile.name.endsWith('.txt');
      
      const reader = new FileReader();
      reader.onload = () => {
        const updatedLetter = {
          ...editingCoverLetter,
          name: editCoverLetterName || editingCoverLetter.name,
          content: isTextFile ? reader.result : editCoverLetterContent,
          format: editCoverLetterFormat,
          lastModified: new Date().toISOString().split("T")[0],
          uploadedFileData: reader.result,
          uploadedFileName: editCoverLetterFile.name,
          uploadedFileType: editCoverLetterFile.type,
        };
        const id = getCoverLetterId(editingCoverLetter);
        const doLocalUpdate = () => {
          setCoverLetters((prev) => prev.map((l) => (getCoverLetterId(l) === id ? { ...updatedLetter, _id: id } : l)));
        };
        const finish = () => {
          setOpenEditCoverLetter(false);
          setEditingCoverLetter(null);
          setEditCoverLetterName("");
          setEditCoverLetterContent("");
          setEditCoverLetterFormat("pdf");
          setEditCoverLetterFile(null);
          toast({ title: "Cover letter updated", description: "Your changes have been saved successfully." });
        };
        if (id) {
          const form = new FormData();
          form.append('name', editCoverLetterName || editingCoverLetter.name || 'My Cover Letter');
          form.append('content', updatedLetter.content || '');
          form.append('file', editCoverLetterFile);
          apiClient.coverLetters.updateWithFile(id, form)
            .then((resp) => {
              const saved = resp?.data || resp;
              setCoverLetters((prev) => prev.map((l) => (getCoverLetterId(l) === id ? saved : l)));
              // Update editingCoverLetter to refresh the "Current File" tag
              setEditingCoverLetter(saved);
              finish();
            })
            .catch((e) => {
              console.warn('[CoverLetters] Update with file failed, using local:', e?.message);
              doLocalUpdate();
              finish();
            });
        } else {
          doLocalUpdate();
          finish();
        }
      };
      // Read as text if it's a text file, otherwise as data URL
      if (isTextFile) {
        reader.readAsText(editCoverLetterFile);
      } else {
        reader.readAsDataURL(editCoverLetterFile);
      }
    } else {
      const updatedLetter = {
        ...editingCoverLetter,
        name: editCoverLetterName || editingCoverLetter.name,
        content: editCoverLetterContent,
        format: editCoverLetterFormat,
        lastModified: new Date().toISOString().split("T")[0],
      };
      const id = getCoverLetterId(editingCoverLetter);
      if (id) {
        apiClient.coverLetters.update(id, {
          name: updatedLetter.name,
          content: updatedLetter.content,
          isProtected: updatedLetter.isProtected,
          usedFor: updatedLetter.usedFor,
        })
          .then((resp) => {
            const saved = resp?.data || resp;
            setCoverLetters((prev) => prev.map((l) => (getCoverLetterId(l) === id ? saved : l)));
          })
          .catch((e) => {
            console.warn('[CoverLetters] Update failed, using local:', e?.message);
            setCoverLetters((prev) => prev.map((l) => (getCoverLetterId(l) === id ? { ...updatedLetter, _id: id } : l)));
          })
          .finally(() => {
            toast({ title: "Cover letter updated", description: "Your changes have been saved successfully." });
          });
      } else {
        setCoverLetters((prev) => prev.map((l) => (getCoverLetterId(l) === id ? { ...updatedLetter, _id: id } : l)));
        toast({ title: "Cover letter updated", description: "Your changes have been saved locally." });
      }
    }

    setOpenEditCoverLetter(false);
    setEditingCoverLetter(null);
    setEditCoverLetterContent("");
    setEditCoverLetterFormat("pdf");
    setEditCoverLetterFile(null);
  };

  const handleSaveEditCoverLetter = () => {
    if (!editingCoverLetter) return;
    const existingNames = coverLetters.map((l) => l.name);
    const duplicateName = generateDuplicateName(editingCoverLetter.name, existingNames);

    if (editCoverLetterFile) {
      // NEW FILE UPLOADED - create with new file, ignore old file metadata
      const form = new FormData();
      form.append('name', editCoverLetterName || duplicateName);
      form.append('content', editCoverLetterContent || '');
      form.append('file', editCoverLetterFile);
      
      apiClient.coverLetters.createWithFile(form)
        .then((resp) => {
          const saved = resp?.data || resp;
          setCoverLetters((prev) => [saved, ...prev]);
          toast({ title: "Cover letter copied", description: `Created new copy: ${duplicateName}` });
        })
        .catch((e) => {
          console.warn('[CoverLetters] Create with file failed, saving locally:', e?.message);
          // Local fallback with new file name
          const newLetter = {
            id: Date.now(),
            name: duplicateName,
            content: editCoverLetterContent || '',
            format: editCoverLetterFormat,
            lastModified: new Date().toISOString().split("T")[0],
            usedFor: 0,
            isProtected: false,
            fileUrl: null,
            uploadedFileName: editCoverLetterFile.name,
            uploadedFileType: editCoverLetterFile.type,
          };
          setCoverLetters((prev) => [newLetter, ...prev]);
          toast({ title: "Cover letter copied (local)", description: `Created: ${duplicateName}` });
        })
        .finally(() => {
          setOpenEditCoverLetter(false);
          setEditingCoverLetter(null);
          setEditCoverLetterContent("");
          setEditCoverLetterFormat("pdf");
          setEditCoverLetterFile(null);
        });
    } else {
      // NO NEW FILE - duplicate with content only, clear old file references
      const newLetter = {
        id: Date.now(),
        name: editCoverLetterName || duplicateName,
        content: editCoverLetterContent || editingCoverLetter.content || '',
        format: editCoverLetterFormat,
        lastModified: new Date().toISOString().split("T")[0],
        usedFor: 0,
        isProtected: false,
        fileUrl: null,
        // Do not copy old file metadata when no new file
      };
      apiClient.coverLetters.create({ name: newLetter.name, content: newLetter.content })
        .then((resp) => {
          const saved = resp?.data || resp;
          setCoverLetters((prev) => [saved, ...prev]);
          toast({ title: "Cover letter copied", description: `Created new copy: ${duplicateName}` });
        })
        .catch((e) => {
          console.warn('[CoverLetters] Create failed, saving locally:', e?.message);
          setCoverLetters((prev) => [newLetter, ...prev]);
          toast({ title: "Cover letter copied (local)", description: `Created: ${duplicateName}` });
        })
        .finally(() => {
          setOpenEditCoverLetter(false);
          setEditingCoverLetter(null);
          setEditCoverLetterName("");
          setEditCoverLetterContent("");
          setEditCoverLetterFormat("pdf");
          setEditCoverLetterFile(null);
        });
    }
  };

  const handleDownloadCoverLetter = async (letter) => {
    if (letter.uploadedFileData) {
      const link = document.createElement("a");
      link.href = letter.uploadedFileData;
      link.download = letter.uploadedFileName || `${letter.name}.${letter.format || "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (letter.content && !letter.fileUrl) {
      const format = letter.format || "txt";
      
      if (format === "pdf") {
        // Create PDF using simple approach
        try {
          const { jsPDF } = await import('jspdf');
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.getWidth();
          const margin = 20;
          const maxWidth = pageWidth - 2 * margin;
          
          // Split text into lines that fit
          const lines = doc.splitTextToSize(letter.content, maxWidth);
          doc.text(lines, margin, 20);
          
          doc.save(`${letter.name}.pdf`);
        } catch (err) {
          console.error('Error creating PDF:', err);
          toast({
            title: "PDF creation failed",
            description: "Downloading as text file instead.",
            variant: "destructive",
          });
          // Fallback to text
          const blob = new Blob([letter.content], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${letter.name}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } else if (format === "docx") {
        // Create DOCX using docx library
        try {
          const docx = await import('docx');
          const { Document, Packer, Paragraph, TextRun } = docx;
          
          // Split content into paragraphs, handling empty lines
          const paragraphs = letter.content.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun(line || ' ')], // Empty lines need at least a space
            })
          );
          
          const doc = new Document({
            sections: [{
              properties: {},
              children: paragraphs,
            }],
          });
          
          const blob = await Packer.toBlob(doc);
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${letter.name}.docx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Error creating DOCX:', err);
          toast({
            title: "DOCX creation failed",
            description: "Please check console for details. Downloading as text file instead.",
            variant: "destructive",
          });
          // Fallback to text
          const blob = new Blob([letter.content], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${letter.name}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } else {
        // Text or HTML format
        const mimeType = format === "html" ? "text/html" : "text/plain";
        const blob = new Blob([letter.content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${letter.name}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } else if (letter.fileUrl) {
      window.open(letter.fileUrl, "_blank");
    }

    const targetId = getCoverLetterId(letter);
    setCoverLetters((prev) =>
      prev.map((l) =>
        getCoverLetterId(l) === targetId
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
      // Preserve all file-related data
      content: letter.content,
      uploadedFileData: letter.uploadedFileData,
      uploadedFileName: letter.uploadedFileName,
      uploadedFileType: letter.uploadedFileType,
      fileUrl: letter.fileUrl,
    };
    apiClient.coverLetters.create({ name: newLetter.name, content: newLetter.content || '' })
      .then((resp) => {
        const saved = resp?.data || resp;
        setCoverLetters((prev) => [...prev, saved]);
      })
      .catch((e) => {
        console.warn('[CoverLetters] Duplicate (create) failed, saving locally:', e?.message);
        setCoverLetters((prev) => [...prev, newLetter]);
      })
      .finally(() => {
        toast({ title: "Cover letter duplicated", description: `Created: ${newName}` });
      });
  };

  const handleDeleteCoverLetter = (letter) => {
    const id = getCoverLetterId(letter);
    if (!id) {
      // Local-only item
      setCoverLetters((prev) => prev.filter((l) => getCoverLetterId(l) !== id));
      return;
    }
    apiClient.coverLetters.delete(id)
      .then(() => {
        setCoverLetters((prev) => prev.filter((l) => getCoverLetterId(l) !== id));
      })
      .catch((e) => {
        console.warn('[CoverLetters] Delete failed, removing locally:', e?.message);
        setCoverLetters((prev) => prev.filter((l) => getCoverLetterId(l) !== id));
      });
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
              <Button 
                variant="outline" 
                onClick={() => navigate('/resume-builder')}
                className="border-2 border-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-padding hover:opacity-90 transition-opacity"
                style={{
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, hsl(var(--primary)), hsl(280, 100%, 70%), hsl(330, 100%, 70%))',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                <FileEdit className="w-4 h-4 mr-2" />
                Build Resume
              </Button>
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
                            
                            {/* ATS Score Display */}
                            <div className="mt-3">
                              {hasValidAtsScore(resume) ? (
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                      <span className="text-muted-foreground font-medium">ATS Score</span>
                                      <span className={`font-bold ${
                                        getAtsValue(resume.atsScore) >= 90 ? "text-emerald-400"
                                          : getAtsValue(resume.atsScore) >= 75 ? "text-amber-400"
                                          : "text-red-400"
                                      }`}>
                                        {Math.round(getAtsValue(resume.atsScore))}%
                                      </span>
                                    </div>
                                    <Progress value={getAtsValue(resume.atsScore)} className="h-2" />
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      getAtsValue(resume.atsScore) >= 85 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                        : getAtsValue(resume.atsScore) >= 75 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                        : "bg-red-500/20 text-red-400 border-red-500/30"
                                    }`}
                                  >
                                    {getAtsValue(resume.atsScore) >= 85 ? "Optimized" 
                                      : getAtsValue(resume.atsScore) >= 75 ? "Good" 
                                      : "Needs Work"}
                                  </Badge>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground italic">
                                  Upload a file to get ATS score
                                </div>
                              )}
                            </div>
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
                  <Card key={getCoverLetterId(letter) || letter.id || idx} className="glass glass-hover opacity-0 animate-fade-in" style={{ animationDelay: `${(idx + 4) * 100}ms` }}>
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
                          {letter.uploadedFileName && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {letter.uploadedFileName}
                            </p>
                          )}
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
                                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => handleDeleteCoverLetter(letter)}>
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
              <label className="text-sm font-medium">Cover Letter Name</label>
              <Input value={editCoverLetterName} onChange={(e) => setEditCoverLetterName(e.target.value)} placeholder="Enter cover letter name..." className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Update the name of this cover letter</p>
            </div>
            <div>
              <label className="text-sm font-medium">Cover Letter Content</label>
              <Textarea value={editCoverLetterContent} onChange={(e) => setEditCoverLetterContent(e.target.value)} placeholder="Enter your cover letter content here..." className="mt-1 min-h-[300px] font-mono text-sm" />
              <p className="text-xs text-muted-foreground mt-1">Edit your cover letter content directly in the editor above</p>
            </div>
            <div>
              <label className="text-sm font-medium">Upload New File (TXT only)</label>
              <Input type="file" accept=".txt" onChange={handleFileChange} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">
                {editCoverLetterFile ? `Selected: ${editCoverLetterFile.name}` : "Upload a .txt file to replace the current content."}
              </p>
              <p className="text-xs text-amber-500 mt-1">Note: PDF/DOCX parsing is currently unavailable. Please upload plain text files.</p>
            </div>
            {(editingCoverLetter?.uploadedFileName || editingCoverLetter?.filename) && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Current File</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    {editingCoverLetter.uploadedFileName || editingCoverLetter.filename}
                  </p>
                  <Badge variant="outline">Used in {editingCoverLetter.usedFor} applications</Badge>
                </div>
              </div>
            )}
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
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            {editingCoverLetter && (
              <Button
                variant="outline"
                onClick={async () => {
                  const format = editCoverLetterFormat;
                  
                  if (format === "pdf") {
                    try {
                      const { jsPDF } = await import('jspdf');
                      const doc = new jsPDF();
                      const pageWidth = doc.internal.pageSize.getWidth();
                      const margin = 20;
                      const maxWidth = pageWidth - 2 * margin;
                      const lines = doc.splitTextToSize(editCoverLetterContent, maxWidth);
                      doc.text(lines, margin, 20);
                      doc.save(`${editingCoverLetter.name}.pdf`);
                    } catch (err) {
                      const blob = new Blob([editCoverLetterContent], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${editingCoverLetter.name}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }
                  } else if (format === "docx") {
                    try {
                      const docx = await import('docx');
                      const { Document, Packer, Paragraph, TextRun } = docx;
                      const paragraphs = editCoverLetterContent.split('\n').map(line => 
                        new Paragraph({ children: [new TextRun(line || ' ')] })
                      );
                      const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
                      const blob = await Packer.toBlob(doc);
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${editingCoverLetter.name}.docx`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } catch (err) {
                      const blob = new Blob([editCoverLetterContent], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${editingCoverLetter.name}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }
                  } else {
                    const mimeType = format === "html" ? "text/html" : "text/plain";
                    const blob = new Blob([editCoverLetterContent], { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${editingCoverLetter.name}.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }
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
            {editingCoverLetter && !editingCoverLetter.isProtected && (
              <Button onClick={handleUpdateCoverLetter} variant="default">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
            <Button onClick={handleSaveEditCoverLetter} variant="gradient">
              <Copy className="w-4 h-4 mr-2" />
              Save as Copy
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
