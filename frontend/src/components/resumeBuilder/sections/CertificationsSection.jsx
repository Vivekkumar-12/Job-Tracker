import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plus, Trash2 } from 'lucide-react';

export default function CertificationsSection({ data, onUpdate }) {
  const [certifications, setCertifications] = useState(data || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: ''
  });

  const handleAddCertification = () => {
    if (newCertification.name.trim() && newCertification.issuer.trim()) {
      const updated = [...certifications, newCertification];
      setCertifications(updated);
      onUpdate(updated);
      setNewCertification({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' });
      setIsAdding(false);
    }
  };

  const handleUpdateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
    onUpdate(updated);
  };

  const handleRemoveCertification = (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      {certifications.map((cert, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{cert.name}</CardTitle>
                <p className="text-sm text-gray-600">{cert.issuer}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCertification(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Certification Name"
              value={cert.name}
              onChange={(e) => handleUpdateCertification(index, 'name', e.target.value)}
            />
            <Input
              placeholder="Issuing Organization"
              value={cert.issuer}
              onChange={(e) => handleUpdateCertification(index, 'issuer', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="Issue Date"
                value={cert.issueDate}
                onChange={(e) => handleUpdateCertification(index, 'issueDate', e.target.value)}
              />
              <Input
                type="date"
                placeholder="Expiry Date"
                value={cert.expiryDate}
                onChange={(e) => handleUpdateCertification(index, 'expiryDate', e.target.value)}
              />
            </div>
            <Input
              placeholder="Credential ID"
              value={cert.credentialId}
              onChange={(e) => handleUpdateCertification(index, 'credentialId', e.target.value)}
            />
            <Input
              placeholder="Credential URL"
              value={cert.credentialUrl}
              onChange={(e) => handleUpdateCertification(index, 'credentialUrl', e.target.value)}
            />
          </CardContent>
        </Card>
      ))}

      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Certification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Certification Name"
              value={newCertification.name}
              onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
            />
            <Input
              placeholder="Issuing Organization"
              value={newCertification.issuer}
              onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddCertification}>Add</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Certification
        </Button>
      )}
    </div>
  );
}
