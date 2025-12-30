import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plus, Trash2 } from 'lucide-react';

export default function EducationSection({ data, onUpdate }) {
  const [educations, setEducations] = useState(data || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    cgpa: '',
    activities: ''
  });

  const handleAddEducation = () => {
    if (newEducation.institution.trim() && newEducation.degree.trim()) {
      const updated = [...educations, newEducation];
      setEducations(updated);
      onUpdate(updated);
      setNewEducation({ institution: '', degree: '', field: '', startDate: '', endDate: '', cgpa: '', activities: '' });
      setIsAdding(false);
    }
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
    onUpdate(updated);
  };

  const handleRemoveEducation = (index) => {
    const updated = educations.filter((_, i) => i !== index);
    setEducations(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      {educations.map((edu, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{edu.degree} in {edu.field}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveEducation(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Institution"
              value={edu.institution}
              onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)}
            />
            <Input
              placeholder="Degree (e.g., Bachelor of Science)"
              value={edu.degree}
              onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
            />
            <Input
              placeholder="Field of Study"
              value={edu.field}
              onChange={(e) => handleUpdateEducation(index, 'field', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="Start Date"
                value={edu.startDate}
                onChange={(e) => handleUpdateEducation(index, 'startDate', e.target.value)}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={edu.endDate}
                onChange={(e) => handleUpdateEducation(index, 'endDate', e.target.value)}
              />
            </div>
            <Input
              placeholder="CGPA (optional)"
              value={edu.cgpa}
              onChange={(e) => handleUpdateEducation(index, 'cgpa', e.target.value)}
            />
            <Textarea
              placeholder="Activities, achievements, etc."
              value={edu.activities}
              onChange={(e) => handleUpdateEducation(index, 'activities', e.target.value)}
            />
          </CardContent>
        </Card>
      ))}

      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Institution"
              value={newEducation.institution}
              onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
            />
            <Input
              placeholder="Degree"
              value={newEducation.degree}
              onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            />
            <Input
              placeholder="Field of Study"
              value={newEducation.field}
              onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddEducation}>Add</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      )}
    </div>
  );
}
