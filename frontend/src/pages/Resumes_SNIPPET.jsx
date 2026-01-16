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
import apiClient from "@/lib/apiClient";
import { Plus, FileText, Download, Eye, Edit, Trash2, MoreHorizontal, Sparkles, CheckCircle2, Copy, Star } from "lucide-react";

// HELPER: Trigger ATS scoring and reload resume to get updated score
const scoreResumeAndReload = async (resumeId, titleForLog = '') => {
  if (!resumeId) {
    console.warn('[ATS] No resume ID');
    return null;
  }
  try {
    console.log(`[ATS] Calculating ATS score for: ${titleForLog}`);
    
    // Trigger ATS calculation
    const atsResp = await apiClient.resumes.calculateATS(resumeId, '');
    console.log('[ATS] ATS calculation response:', atsResp);
    
    // Extract score from response
    const scoreValue = atsResp?.data?.atsScore;
    console.log(`[ATS] ✓ Got score: ${scoreValue}% for "${titleForLog}"`);
    
    // Wait a moment then reload the full resume to get DB-persisted score
    await new Promise(r => setTimeout(r, 500));
    const reloaded = await apiClient.resumes.get(resumeId);
    console.log('[ATS] Reloaded resume:', reloaded);
    
    const finalScore = reloaded?.atsScore?.overallScore ?? scoreValue;
    return { score: finalScore, resume: reloaded };
  } catch (err) {
    console.error('[ATS] Error:', err?.message || err);
    return null;
  }
};

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

// NOTES FOR FILE TO REPLACE: Replace entire triggerLocalAtsScore + following content
// This is just the function stub - use scoreResumeAndReload above instead
const triggerLocalAtsScore = scoreResumeAndReload;

const generateDuplicateName = (name, existingNames) => {
  let counter = 1;
  let newName = `${name} (Copy)`;
  while (existingNames.includes(newName)) {
    counter += 1;
    newName = `${name} (Copy ${counter})`;
  }
  return newName;
};
