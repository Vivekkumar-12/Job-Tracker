import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Sparkles } from 'lucide-react';
import apiClient from '../../lib/apiClient';

export default function ATSScorer({ resume, atsScore, onScoreUpdate, showNotification }) {
  const [jobDescription, setJobDescription] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateScore = async () => {
    if (!jobDescription.trim()) {
      showNotification('Please paste a job description', 'error');
      return;
    }

    try {
      setIsCalculating(true);
      const response = await apiClient.resumes.calculateATS(resume._id, jobDescription);
      const data = response.data?.data || response.data || response;
      onScoreUpdate(data);
      showNotification('ATS score calculated', 'success');
    } catch (error) {
      showNotification('Failed to calculate ATS score', 'error');
      console.error('Error calculating ATS score:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ATS Optimizer</CardTitle>
          <CardDescription>Paste a job description to optimize your resume</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={8}
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <Button
            onClick={handleCalculateScore}
            disabled={isCalculating || !jobDescription.trim()}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isCalculating ? 'Optimizing...' : 'Calculate ATS Score'}
          </Button>
        </CardContent>
      </Card>

      {atsScore && (
        <Card>
          <CardHeader>
            <CardTitle>ATS Score</CardTitle>
            <CardDescription>Overall and breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm">Overall Score</p>
              <Progress value={atsScore.overallScore} />
              <p className="text-sm mt-1">{atsScore.overallScore}%</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm">Keyword Match</p>
                <Progress value={atsScore.keywordMatch} />
                <p className="text-sm mt-1">{atsScore.keywordMatch}%</p>
              </div>
              <div>
                <p className="text-sm">Completeness</p>
                <Progress value={atsScore.completeness} />
                <p className="text-sm mt-1">{atsScore.completeness}%</p>
              </div>
              <div>
                <p className="text-sm">Formatting</p>
                <Progress value={atsScore.formatting} />
                <p className="text-sm mt-1">{atsScore.formatting}%</p>
              </div>
            </div>

            {atsScore.matchedKeywords?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Matched Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {atsScore.matchedKeywords.map(k => (
                    <span key={k} className="bg-green-100 px-2 py-1 rounded text-xs">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {atsScore.missingKeywords?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Missing Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {atsScore.missingKeywords.map(k => (
                    <span key={k} className="bg-red-100 px-2 py-1 rounded text-xs">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {atsScore.suggestions?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Suggestions:</p>
                <ul className="list-disc ml-6 text-sm">
                  {atsScore.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
