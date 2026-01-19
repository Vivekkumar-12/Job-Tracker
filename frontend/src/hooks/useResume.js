import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'resume_builder_';
const DEFAULT_RESUME = {
  id: null,
  name: 'My Resume',
  template: 'modern',
  profession: '',
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
  achievements: [],
  training: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Custom hook for managing resume state and localStorage
 * @param {string} resumeId - The ID of the resume (optional)
 * @returns {Object} Resume state and methods
 */
export const useResume = (resumeId) => {
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load resume from localStorage on mount
  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId);
    }
  }, [resumeId]);

  // Auto-save to localStorage whenever resume changes
  useEffect(() => {
    if (resume.id) {
      saveResume(resume);
      setSaved(true);
      const timer = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [resume]);

  const loadResume = useCallback((id) => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY + id);
      if (stored) {
        const parsed = JSON.parse(stored);
        setResume(parsed);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveResume = useCallback((resumeData) => {
    try {
      const toSave = {
        ...resumeData,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY + resumeData.id, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  }, []);

  const createNewResume = useCallback((name = 'My Resume') => {
    const newId = `resume_${Date.now()}`;
    const newResume = {
      ...DEFAULT_RESUME,
      id: newId,
      name,
      createdAt: new Date().toISOString(),
    };
    setResume(newResume);
    return newId;
  }, []);

  const updatePersonalDetails = useCallback((details) => {
    setResume((prev) => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, ...details },
    }));
  }, []);

  const updateSummary = useCallback((summary) => {
    setResume((prev) => ({ ...prev, summary }));
  }, []);

  const updateTemplate = useCallback((template) => {
    setResume((prev) => ({ ...prev, template }));
  }, []);

  const updateProfession = useCallback((profession) => {
    setResume((prev) => ({ ...prev, profession }));
  }, []);

  const addSkill = useCallback((skill) => {
    setResume((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: Date.now(), level: undefined, ...skill }],
    }));
  }, []);

  const updateSkill = useCallback((id, skill) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
    }));
  }, []);

  const deleteSkill = useCallback((id) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  }, []);

  const addExperience = useCallback((experience) => {
    setResume((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now(), ...experience }],
    }));
  }, []);

  const updateExperience = useCallback((id, experience) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...experience } : e)),
    }));
  }, []);

  const deleteExperience = useCallback((id) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  }, []);

  const addEducation = useCallback((education) => {
    setResume((prev) => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), ...education }],
    }));
  }, []);

  const updateEducation = useCallback((id, education) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((ed) => (ed.id === id ? { ...ed, ...education } : ed)),
    }));
  }, []);

  const deleteEducation = useCallback((id) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((ed) => ed.id !== id),
    }));
  }, []);

  const addProject = useCallback((project) => {
    setResume((prev) => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now(), ...project }],
    }));
  }, []);

  const updateProject = useCallback((id, project) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...project } : p)),
    }));
  }, []);

  const deleteProject = useCallback((id) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const addCertification = useCallback((certification) => {
    setResume((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { id: Date.now(), ...certification }],
    }));
  }, []);

  const updateCertification = useCallback((id, certification) => {
    setResume((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, ...certification } : c)),
    }));
  }, []);

  const deleteCertification = useCallback((id) => {
    setResume((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  }, []);

  const addAchievement = useCallback((achievement) => {
    setResume((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { id: Date.now(), ...achievement }],
    }));
  }, []);

  const updateAchievement = useCallback((id, achievement) => {
    setResume((prev) => ({
      ...prev,
      achievements: prev.achievements.map((a) => (a.id === id ? { ...a, ...achievement } : a)),
    }));
  }, []);

  const deleteAchievement = useCallback((id) => {
    setResume((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((a) => a.id !== id),
    }));
  }, []);

  const addTraining = useCallback((trainingItem) => {
    setResume((prev) => ({
      ...prev,
      training: [...prev.training, { id: Date.now(), ...trainingItem }],
    }));
  }, []);

  const updateTraining = useCallback((id, trainingItem) => {
    setResume((prev) => ({
      ...prev,
      training: prev.training.map((t) => (t.id === id ? { ...t, ...trainingItem } : t)),
    }));
  }, []);

  const deleteTraining = useCallback((id) => {
    setResume((prev) => ({
      ...prev,
      training: prev.training.filter((t) => t.id !== id),
    }));
  }, []);

  return {
    resume,
    loading,
    saved,
    createNewResume,
    updatePersonalDetails,
    updateSummary,
    updateTemplate,
    updateProfession,
    addSkill,
    updateSkill,
    deleteSkill,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    addProject,
    updateProject,
    deleteProject,
    addCertification,
    updateCertification,
    deleteCertification,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    addTraining,
    updateTraining,
    deleteTraining,
  };
};
