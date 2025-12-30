import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Sparkles, Plus, X } from 'lucide-react';
import apiClient from '../../../lib/apiClient';

export default function SkillsSection({ data, resumeId, onUpdate, showNotification }) {
  const [skills, setSkills] = useState(data || { technical: [], professional: [], languages: [] });
  const [newSkill, setNewSkill] = useState({ value: '', category: 'technical' });
  const [suggestedSkills, setSuggestedSkills] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleAddSkill = (skillValue, category) => {
    if (skillValue.trim()) {
      const updatedSkills = { ...skills };
      if (!updatedSkills[category].includes(skillValue)) {
        updatedSkills[category] = [...updatedSkills[category], skillValue];
        setSkills(updatedSkills);
        onUpdate(updatedSkills);
      }
      setNewSkill({ value: '', category });
    }
  };

  const handleRemoveSkill = (skillValue, category) => {
    const updatedSkills = { ...skills };
    updatedSkills[category] = updatedSkills[category].filter(s => s !== skillValue);
    setSkills(updatedSkills);
    onUpdate(updatedSkills);
  };

  const handleSuggestSkills = async () => {
    if (!jobRole.trim()) {
      showNotification('Please enter a job role', 'error');
      return;
    }

    try {
      setIsLoadingSuggestions(true);
      const response = await apiClient.resumes.suggestSkills(resumeId, jobRole);
      const data = response.data?.data || response.data || response;
      setSuggestedSkills(data);
    } catch (error) {
      showNotification('Failed to get skill suggestions', 'error');
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddSuggestedSkill = (skill, category) => {
    handleAddSkill(skill, category);
  };

  const skillCategories = [
    { key: 'technical', label: 'Technical Skills', icon: '💻' },
    { key: 'professional', label: 'Professional Skills', icon: '📊' },
    { key: 'languages', label: 'Languages', icon: '🗣️' }
  ];

  return (
    <div className="space-y-4">
      {skillCategories.map(category => (
        <Card key={category.key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{category.icon}</span>
              {category.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Skills */}
            {skills[category.key]?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills[category.key].map(skill => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-2 cursor-pointer hover:bg-red-100"
                    onClick={() => handleRemoveSkill(skill, category.key)}
                  >
                    {skill}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Add New Skill */}
            <div className="flex gap-2">
              <Input
                placeholder={`Add ${category.label.toLowerCase()}`}
                value={newSkill.category === category.key ? newSkill.value : ''}
                onChange={(e) => setNewSkill({ value: e.target.value, category: category.key })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSkill(newSkill.value, category.key);
                  }
                }}
              />
              <Button
                onClick={() => handleAddSkill(newSkill.value, category.key)}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* AI Skills Suggester */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI Skills Suggester
          </CardTitle>
          <CardDescription>Get skills recommendations based on job role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Senior Software Engineer, Data Scientist"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSuggestSkills();
                }
              }}
            />
            <Button
              onClick={handleSuggestSkills}
              disabled={isLoadingSuggestions || !jobRole.trim()}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Suggest
            </Button>
          </div>

          {suggestedSkills && (
            <div className="space-y-3">
              {Object.entries(suggestedSkills).map(([category, skillList]) => (
                <div key={category}>
                  <p className="text-sm font-medium mb-2 capitalize">{category}:</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(skillList) && skillList.map(skill => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-100"
                        onClick={() => handleAddSuggestedSkill(skill, 
                          category === 'languages' ? 'languages' : 
                          category === 'tools' ? 'technical' : 'professional'
                        )}
                      >
                        {skill}
                        <Plus className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
