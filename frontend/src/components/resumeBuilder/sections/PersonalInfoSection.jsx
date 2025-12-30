import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Save } from 'lucide-react';

export default function PersonalInfoSection({ data, onUpdate }) {
  const [formData, setFormData] = useState(data || {});
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(formData);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Add your contact information and links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="New York, NY"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Professional Links</h3>
            
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={formData.linkedin || ''}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div>
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                value={formData.github || ''}
                onChange={(e) => handleChange('github', e.target.value)}
                placeholder="https://github.com/johndoe"
              />
            </div>

            <div>
              <Label htmlFor="portfolio">Portfolio Website</Label>
              <Input
                id="portfolio"
                value={formData.portfolio || ''}
                onChange={(e) => handleChange('portfolio', e.target.value)}
                placeholder="https://johndoe.com"
              />
            </div>
          </div>

          {hasChanges && (
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
