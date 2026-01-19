# Resume Builder - Complete Documentation

## Overview

The Resume Builder is a production-ready React component that enables users to create, edit, preview, and download professional resumes. It features a modern two-column layout with live preview, multiple templates, and comprehensive form validation.

## Features

### 1. **Core Functionality**
- ✅ Create multiple resumes
- ✅ Real-time live preview
- ✅ Auto-save to browser localStorage
- ✅ Download as PDF
- ✅ Print functionality
- ✅ Export/Import JSON
- ✅ Duplicate resumes
- ✅ Multiple resume templates

### 2. **Form Sections**
- **Personal Details**: Name, email, phone, location, LinkedIn, GitHub, portfolio
- **Professional Summary**: Compelling personal statement
- **Skills**: Dynamic add/remove with proficiency levels
- **Experience**: Multiple job entries with descriptions
- **Education**: Multiple education entries with grades
- **Projects**: Portfolio projects with technologies
- **Certifications**: Professional certifications and credentials

### 3. **Resume Templates**
- **Modern**: Clean, contemporary design with blue accent color
- **Professional**: Traditional, conservative business style
- **Creative**: Colorful sidebar layout with modern styling

### 4. **Responsive Design**
- Mobile-first approach
- Optimized for all screen sizes
- Collapsible preview on mobile
- Touch-friendly interface

## Project Structure

```
frontend/src/
├── pages/
│   ├── ResumeBuilder.jsx          # Main builder page
│   ├── Resumes.jsx                # Resume list page
│   └── Resumes_New.jsx            # Alternative list page (backup)
├── components/
│   └── resume/
│       ├── FormSections.jsx       # All form sections
│       ├── ResumeTemplates.jsx    # Resume templates
│       └── ResumeTemplates.backup.jsx
├── hooks/
│   └── useResume.js               # Resume state management hook
└── lib/
    └── resumeUtils.js             # Utility functions (PDF, JSON, validation)
```

## Key Components

### 1. **ResumeBuilder.jsx**
Main page component that orchestrates the entire resume building experience.

**Features:**
- Two-column layout (form + preview)
- Template selection
- Export options
- Auto-save status indicator

**Props:** None (uses URL params for resume ID)

**Usage:**
```jsx
import ResumeBuilder from '@/pages/ResumeBuilder';

// Navigate to builder
window.location.href = '/resume-builder';
// Or with existing resume
window.location.href = '/resume-builder?id=resume_1234567890';
```

### 2. **useResume Hook**
Custom React hook for managing resume state and localStorage persistence.

**State:**
```javascript
{
  id: string,
  name: string,
  template: 'modern' | 'professional' | 'creative',
  personalDetails: { fullName, email, phone, location, linkedIn, github, portfolio },
  summary: string,
  skills: Array<{ id, name, level }>,
  experience: Array<{ id, jobTitle, company, location, startDate, endDate, description, currentlyWorking }>,
  education: Array<{ id, school, degree, fieldOfStudy, startDate, endDate, grade, currentlyStudying }>,
  projects: Array<{ id, name, description, technologies, link, startDate, endDate }>,
  certifications: Array<{ id, name, issuer, issuedDate, expiryDate, link }>,
  createdAt: string,
  updatedAt: string
}
```

**Methods:**
```javascript
const {
  resume,                           // Current resume data
  loading,                          // Loading state
  saved,                            // Auto-save indicator
  createNewResume,                  // Create new resume
  updatePersonalDetails,            // Update personal info
  updateSummary,                    // Update summary
  updateTemplate,                   // Change template
  addSkill, updateSkill, deleteSkill,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
  addProject, updateProject, deleteProject,
  addCertification, updateCertification, deleteCertification
} = useResume(resumeId);
```

**Example:**
```jsx
import { useResume } from '@/hooks/useResume';

function MyComponent() {
  const { resume, addSkill, updatePersonalDetails } = useResume('resume_123');

  return (
    <div>
      <input 
        onChange={(e) => updatePersonalDetails({ fullName: e.target.value })}
      />
    </div>
  );
}
```

### 3. **Form Sections**

#### PersonalDetailsSection
```jsx
<PersonalDetailsSection
  data={resume.personalDetails}
  onUpdate={updatePersonalDetails}
/>
```

#### SummarySection
```jsx
<SummarySection
  value={resume.summary}
  onUpdate={updateSummary}
/>
```

#### SkillsSection
```jsx
<SkillsSection
  skills={resume.skills}
  onAdd={addSkill}
  onDelete={deleteSkill}
/>
```

#### ExperienceSection
```jsx
<ExperienceSection
  experiences={resume.experience}
  onAdd={addExperience}
  onDelete={deleteExperience}
/>
```

#### EducationSection
```jsx
<EducationSection
  educations={resume.education}
  onAdd={addEducation}
  onDelete={deleteEducation}
/>
```

#### ProjectsSection
```jsx
<ProjectsSection
  projects={resume.projects}
  onAdd={addProject}
  onDelete={deleteProject}
/>
```

#### CertificationsSection
```jsx
<CertificationsSection
  certifications={resume.certifications}
  onAdd={addCertification}
  onDelete={deleteCertification}
/>
```

### 4. **Resume Templates**

#### Template Structure
```jsx
import { ModernTemplate, ProfessionalTemplate, CreativeTemplate } from '@/components/resume/ResumeTemplates';

// Get template component by ID
const TemplateComponent = getTemplateComponent('modern');

// Use template
<TemplateComponent resume={resumeData} />
```

#### Creating Custom Templates
```jsx
export const MyCustomTemplate = ({ resume }) => {
  const { personalDetails, summary, experience, education, skills, projects, certifications } = resume;

  return (
    <div className="bg-white p-8">
      {/* Your template HTML */}
      <h1>{personalDetails.fullName}</h1>
      {/* ... */}
    </div>
  );
};

// Register template
export const RESUME_TEMPLATES = {
  modern: { name: 'Modern', component: ModernTemplate },
  custom: { name: 'Custom', component: MyCustomTemplate }
};
```

### 5. **Utility Functions**

#### resumeUtils.js
```javascript
// Download as PDF
downloadPDF(resumeName, htmlElement);

// Print resume
printResume(htmlElement);

// Export as JSON
exportJSON(resumeData, fileName);

// Import from JSON
const data = await importJSON(jsonFile);

// Validate resume
const { isValid, errors } = validateResume(resumeData);
```

## Data Persistence

### localStorage Structure
```
Key: resume_builder_resume_1234567890
Value: {
  id: 'resume_1234567890',
  name: 'My Resume',
  ... // full resume data
}

Key: resumes_list
Value: ['resume_1234567890', 'resume_9876543210']
```

### Storage Management
- Resumes are automatically saved to localStorage on every change
- A list of resume IDs is maintained in `resumes_list` key
- Each resume is stored independently by its ID
- Storage limit: ~5-10MB per domain (browser dependent)

## Usage Guide

### For Users

#### Creating a Resume
1. Navigate to `/resumes` page
2. Click "Create Resume" button
3. Enter resume name
4. Click "Create"
5. Resume builder opens automatically

#### Editing Resume
1. Fill in your information in the form
2. Changes auto-save in real-time
3. See live preview on the right
4. Switch between tabs for different sections

#### Downloading Resume
1. Click "PDF" button to download as PDF
2. Click "Print" to print directly
3. Click "JSON" to export as JSON file

#### Changing Template
1. Scroll up to template selection
2. Click on desired template
3. Preview updates immediately

### For Developers

#### Integration Example
```jsx
import ResumeBuilder from '@/pages/ResumeBuilder';
import { useResume } from '@/hooks/useResume';

// In your app routes
<Route path="/resume-builder" element={<ResumeBuilder />} />

// Use hook in custom components
function MyComponent() {
  const { resume, addSkill } = useResume('resume_id');
  
  return (
    <button onClick={() => addSkill('React')}>
      Add React Skill
    </button>
  );
}
```

#### Custom Styling
All components use Tailwind CSS. To customize:
1. Modify Tailwind classes in component files
2. Override in your CSS files
3. Or extend Tailwind config in `tailwind.config.js`

#### Extending Form Sections
```jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CustomSection = ({ data, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Section</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your form fields */}
      </CardContent>
    </Card>
  );
};
```

## API Integration (Optional)

To save resumes to backend instead of localStorage:

```jsx
// In useResume hook
const saveResumeToBackend = async (resumeData) => {
  const response = await apiClient.resumes.save(resumeData);
  return response.data;
};

// Use in component
useEffect(() => {
  if (resume.id) {
    saveResumeToBackend(resume);
  }
}, [resume]);
```

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations
- Uses React.memo for template components
- Debounced auto-save (optional)
- Lazy loading for templates
- Optimized re-renders with useCallback

## Known Limitations
- localStorage has ~5-10MB size limit
- No real-time sync across tabs
- PDF download may vary by browser
- Print styling may require adjustment

## Future Enhancements
- [ ] Backend integration for cloud storage
- [ ] Real-time collaboration
- [ ] More template designs
- [ ] AI-powered content suggestions
- [ ] Resume version history
- [ ] ATS score optimization
- [ ] LinkedIn import integration
- [ ] Custom color themes

## Troubleshooting

### Resume not saving
- Check browser localStorage is enabled
- Clear browser cache and reload
- Check localStorage quota in DevTools

### PDF download not working
- Ensure html2pdf library is installed
- Check browser popup blocker
- Try different browser

### Template not switching
- Clear localStorage and reload
- Check resume data structure
- Verify template component is registered

### Form inputs not updating
- Check React DevTools for state updates
- Verify hook is properly initialized
- Check for JavaScript errors in console

## Security Considerations
- All data stored locally (no server transmission)
- Validate file uploads before import
- Sanitize data in template components
- Consider encryption for sensitive data if needed

## Testing

### Unit Tests
```javascript
// Test useResume hook
import { renderHook, act } from '@testing-library/react';
import { useResume } from '@/hooks/useResume';

test('creates new resume', () => {
  const { result } = renderHook(() => useResume());
  
  act(() => {
    result.current.createNewResume('Test Resume');
  });
  
  expect(result.current.resume.name).toBe('Test Resume');
});
```

### Integration Tests
```javascript
// Test full builder workflow
test('complete resume building flow', () => {
  // Create resume
  // Add sections
  // Change template
  // Export
  // Verify data
});
```

## Support & Contributing
For issues, feature requests, or contributions:
1. Check existing documentation
2. Search for similar issues
3. Create detailed bug report with reproduction steps
4. Submit PR with tests and documentation

## License
This component is part of the job-hunt-hub project.

---

**Last Updated:** January 2026
**Version:** 1.0.0
**Status:** Production Ready
