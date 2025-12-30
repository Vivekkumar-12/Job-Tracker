import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Sparkles, RefreshCw, Save } from 'lucide-react';
import apiClient from '../../../lib/apiClient';

export default function ProfessionalSummarySection({ data, resumeId, onUpdate, showNotification }) {
  const [formData, setFormData] = useState(data || { content: '', generatedByAI: false });
  const [hasChanges, setHasChanges] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobRole, setJobRole] = useState('');
  const [suggestedSummaries, setSuggestedSummaries] = useState([]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleGenerateSummary = async () => {
    if (!jobRole.trim()) {
      showNotification('Please enter a job role', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await apiClient.resumes.generateSummary(resumeId, jobRole);
      const data = response.data?.data || response.data || response;
      setSuggestedSummaries([data.summary || data?.data?.summary]);
      showNotification('Summary generated successfully', 'success');
    } catch (error) {
      showNotification('Failed to generate summary', 'error');
      console.error('Error generating summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSuggestedSummary = (summary) => {
    handleChange('content', summary);
    handleChange('generatedByAI', true);
    setSuggestedSummaries([]);
  };

  const handleSave = () => {
    onUpdate(formData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
          <CardDescription>A brief overview of your professional background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="summary">Your Summary</Label>
            <Textarea
              id="summary"
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Write a compelling professional summary that highlights your key strengths, experience, and career goals..."
              rows={6}
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.content?.length || 0} / 500 characters
            </p>
          </div>

          {hasChanges && (
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI Summary Generator
          </CardTitle>
          <CardDescription>Generate a professional summary using AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jobRole">Target Job Role</Label>
            <Input
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Senior Software Engineer, Product Manager"
            />
          </div>

          <Button
            onClick={handleGenerateSummary}
            disabled={isGenerating || !jobRole.trim()}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Summary'}
          </Button>

          {suggestedSummaries.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Suggested Summaries:</p>
              {suggestedSummaries.map((summary, index) => (
                <div key={index} className="p-3 border rounded-lg bg-blue-50">
                  <p className="text-sm mb-2">{summary}</p>
                  <Button
                    size="sm"
                    onClick={() => handleUseSuggestedSummary(summary)}
                  >
                    Use This Summary
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
