import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import apiClient from '../../../lib/apiClient';

export default function WorkExperienceSection({ data, resumeId, onUpdate, showNotification }) {
  const [experiences, setExperiences] = useState(data || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newExperience, setNewExperience] = useState(getEmptyExperience());
  const [optimizingIndex, setOptimizingIndex] = useState(null);
  const [optimizedBulletPoints, setOptimizedBulletPoints] = useState({});

  function getEmptyExperience() {
    return {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: '',
      achievements: []
    };
  }

  const handleAddExperience = () => {
    if (newExperience.company.trim() && newExperience.position.trim()) {
      const updated = [...experiences, { ...newExperience, startDate: new Date(newExperience.startDate) }];
      if (newExperience.endDate) {
        newExperience.endDate = new Date(newExperience.endDate);
      }
      setExperiences(updated);
      onUpdate(updated);
      setNewExperience(getEmptyExperience());
      setIsAdding(false);
      showNotification('Experience added', 'success');
    }
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
    onUpdate(updated);
  };

  const handleRemoveExperience = (index) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
    onUpdate(updated);
  };

  const handleAddAchievement = (index) => {
    const updated = [...experiences];
    const achievement = prompt('Enter achievement bullet point:');
    if (achievement?.trim()) {
      if (!updated[index].achievements) {
        updated[index].achievements = [];
      }
      updated[index].achievements.push(achievement);
      setExperiences(updated);
      onUpdate(updated);
    }
  };

  const handleRemoveAchievement = (expIndex, achIndex) => {
    const updated = [...experiences];
    updated[expIndex].achievements = updated[expIndex].achievements.filter((_, i) => i !== achIndex);
    setExperiences(updated);
    onUpdate(updated);
  };

  const handleOptimizeBulletPoints = async (index) => {
    const experience = experiences[index];
    if (!experience.achievements || experience.achievements.length === 0) {
      showNotification('Add some achievements first', 'error');
      return;
    }

    try {
      setOptimizingIndex(index);
      const response = await apiClient.resumes.optimizeBulletPoints(resumeId, {
        bulletPoints: experience.achievements,
        experienceIndex: index,
      });
      const data = response.data?.data || response.data || response;
      setOptimizedBulletPoints({
        ...optimizedBulletPoints,
        [index]: data.optimized || data?.data?.optimized,
      });

      showNotification('Bullet points optimized!', 'success');
    } catch (error) {
      showNotification('Failed to optimize bullet points', 'error');
      console.error('Error optimizing:', error);
    } finally {
      setOptimizingIndex(null);
    }
  };

  const handleApplyOptimized = (index) => {
    const updated = [...experiences];
    updated[index].achievements = optimizedBulletPoints[index];
    setExperiences(updated);
    onUpdate(updated);
    setOptimizedBulletPoints({ ...optimizedBulletPoints, [index]: null });
    showNotification('Optimized bullet points applied', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Existing Experiences */}
      {experiences.map((exp, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{exp.position}</CardTitle>
                <CardDescription>{exp.company}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveExperience(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => handleUpdateExperience(index, 'position', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleUpdateExperience(index, 'startDate', new Date(e.target.value))}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleUpdateExperience(index, 'endDate', new Date(e.target.value))}
                  disabled={exp.currentlyWorking}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`currentlyWorking-${index}`}
                checked={exp.currentlyWorking || false}
                onChange={(e) => handleUpdateExperience(index, 'currentlyWorking', e.target.checked)}
              />
              <Label htmlFor={`currentlyWorking-${index}`} className="cursor-pointer">
                Currently working here
              </Label>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={exp.description || ''}
                onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                placeholder="Brief description of your role"
                rows={3}
              />
            </div>

            {/* Achievements */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Key Achievements</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOptimizeBulletPoints(index)}
                  disabled={optimizingIndex === index || !exp.achievements?.length}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Optimize
                </Button>
              </div>

              {exp.achievements?.map((achievement, achIndex) => (
                <div key={achIndex} className="flex gap-2 mb-2">
                  <Input value={achievement} readOnly />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAchievement(index, achIndex)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleAddAchievement(index)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Achievement
              </Button>
            </div>

            {/* Optimized Suggestions */}
            {optimizedBulletPoints[index] && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Optimized Bullet Points
                  </h4>
                  {optimizedBulletPoints[index].map((bullet, idx) => (
                    <p key={idx} className="text-sm mb-1">• {bullet}</p>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => handleApplyOptimized(index)}
                    className="mt-2"
                  >
                    Apply These
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add New Experience */}
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Company"
              value={newExperience.company}
              onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
            />
            <Input
              placeholder="Position"
              value={newExperience.position}
              onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
            />
            <Input
              type="date"
              value={newExperience.startDate}
              onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newExperience.description}
              onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddExperience}>Add</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Work Experience
        </Button>
      )}
    </div>
  );
}
