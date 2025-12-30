import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plus, Trash2 } from 'lucide-react';

export default function ProjectsSection({ data, onUpdate }) {
  const [projects, setProjects] = useState(data || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    technologies: [],
    link: '',
    github: '',
    achievements: []
  });

  const handleAddProject = () => {
    if (newProject.name.trim()) {
      const updated = [...projects, newProject];
      setProjects(updated);
      onUpdate(updated);
      setNewProject({ name: '', description: '', technologies: [], link: '', github: '', achievements: [] });
      setIsAdding(false);
    }
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
    onUpdate(updated);
  };

  const handleRemoveProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    onUpdate(updated);
  };

  const handleAddTechnology = (index, tech) => {
    if (tech.trim()) {
      const updated = [...projects];
      if (!updated[index].technologies) updated[index].technologies = [];
      if (!updated[index].technologies.includes(tech)) {
        updated[index].technologies.push(tech);
        setProjects(updated);
        onUpdate(updated);
      }
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((proj, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{proj.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveProject(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Project Name"
              value={proj.name}
              onChange={(e) => handleUpdateProject(index, 'name', e.target.value)}
            />
            <Textarea
              placeholder="Project Description"
              value={proj.description}
              onChange={(e) => handleUpdateProject(index, 'description', e.target.value)}
            />
            <div>
              <Label>Technologies</Label>
              <div className="flex gap-2 mb-2">
                {proj.technologies?.map((tech, idx) => (
                  <span key={idx} className="bg-blue-100 px-2 py-1 rounded text-sm">
                    {tech}
                  </span>
                ))}
              </div>
              <Input
                placeholder="Add technology (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTechnology(index, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <Input
              placeholder="Project Link (optional)"
              value={proj.link}
              onChange={(e) => handleUpdateProject(index, 'link', e.target.value)}
            />
            <Input
              placeholder="GitHub Link (optional)"
              value={proj.github}
              onChange={(e) => handleUpdateProject(index, 'github', e.target.value)}
            />
          </CardContent>
        </Card>
      ))}

      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddProject}>Add</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      )}
    </div>
  );
}
