# Resume Builder - Component & API Reference

## 📚 Complete Component Documentation

### Table of Contents
1. [Page Components](#page-components)
2. [Form Section Components](#form-section-components)
3. [Template Components](#template-components)
4. [Custom Hooks](#custom-hooks)
5. [Utility Functions](#utility-functions)

---

## Page Components

### ResumeBuilder.jsx
**File:** `frontend/src/pages/ResumeBuilder.jsx`  
**Purpose:** Main resume builder page with form and preview

#### Props
```typescript
// No props - uses URL query parameters
// ?id=resume_id - Load existing resume
// ?preview=true - Preview-only mode
```

#### State Management
```javascript
// Uses useResume hook for all state
const {
  resume,                      // Resume data object
  loading,                      // Loading state
  saved,                        // Auto-save indicator
  createNewResume,              // Create new resume
  updatePersonalDetails,        // Update personal info
  updateSummary,                // Update summary
  updateTemplate,               // Change template
  addSkill, deleteSkill,        // Skill management
  addExperience, deleteExperience,
  addEducation, deleteEducation,
  addProject, deleteProject,
  addCertification, deleteCertification
} = useResume(resumeId);
```

#### Features
- Two-column layout (form + live preview)
- Tabbed form interface
- Template selection
- Export options (PDF, Print, JSON)
- Import functionality
- Duplicate and clear actions
- Save status indicator

#### Event Handlers
```javascript
handleDownloadPDF()        // Download resume as PDF
handlePrint()              // Open print dialog
handleExportJSON()         // Export as JSON
handleImportJSON(file)     // Import from JSON
handleDuplicate()          // Create copy
handleClearAll()           // Clear all data
```

---

### Resumes_New.jsx
**File:** `frontend/src/pages/Resumes_New.jsx`  
**Purpose:** Resume list and management page

#### Features
- List all saved resumes
- Search/filter resumes
- Create new resume dialog
- Edit resume (navigate to builder)
- Duplicate resume
- Download resume backup
- Delete resume
- Empty state messaging
- Loading state

#### Methods
```javascript
createNewResume(name)      // Create new resume
deleteResume(id)           // Delete resume
duplicateResume(resume)    // Create copy
downloadResume(resume)     // Download as JSON
loadResumes()              // Load all resumes
```

#### State
```javascript
resumes[]                  // Array of resume objects
loading                    // Loading state
openNewResume             // Dialog state
newResumeName             // Input for new resume name
searchTerm                // Search filter text
```

---

## Form Section Components

### PersonalDetailsSection
**File:** `frontend/src/components/resume/FormSections.jsx`

#### Props
```typescript
interface PersonalDetailsSectionProps {
  data: PersonalDetails;  // Current personal details object
  onUpdate: (details: Partial<PersonalDetails>) => void;
}
```

#### Data Structure
```javascript
{
  fullName: string,          // Required
  email: string,             // Required
  phone: string,             // Required
  location: string,          // Optional
  linkedIn: string,          // Optional
  github: string,            // Optional
  portfolio: string          // Optional
}
```

#### Example Usage
```jsx
<PersonalDetailsSection
  data={resume.personalDetails}
  onUpdate={updatePersonalDetails}
/>
```

---

### SummarySection
**File:** `frontend/src/components/resume/FormSections.jsx`

#### Props
```typescript
interface SummarySectionProps {
  value: string;
  onUpdate: (summary: string) => void;
}
```

#### Features
- Textarea with character count (500 max)
- Placeholder with example text
- Real-time update

#### Example Usage
```jsx
<SummarySection
  value={resume.summary}
  onUpdate={updateSummary}
/>
```

---

### SkillsSection
**File:** `frontend/src/components/resume/FormSections.jsx`

#### Props
```typescript
interface SkillsSectionProps {
  skills: Skill[];
  onAdd: (skillName: string) => void;
  onDelete: (skillId: number) => void;
}

interface Skill {
  id: number;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}
```

#### Features
- Add skills with proficiency level
- Tag-based display
- Delete individual skills
- Enter key support
- Prevents empty entries

#### Example Usage
```jsx
<SkillsSection
  skills={resume.skills}
  onAdd={addSkill}
  onDelete={deleteSkill}
/>
```

---

### ExperienceSection
**File:** `frontend/src/components/resume/FormSections.jsx`

#### Props
```typescript
interface ExperienceSectionProps {
  experiences: Experience[];
  onAdd: (experience: Experience) => void;
  onDelete: (experienceId: number) => void;
}

interface Experience {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;      // YYYY-MM format
  endDate: string;        // YYYY-MM format
  currentlyWorking: boolean;
  description: string;
}
```

#### Features
- Collapsible entries
- Add/delete experiences
- Current employment toggle
- Month/year date picker
- Description textarea
- Expandable view

#### Example Usage
```jsx
<ExperienceSection
  experiences={resume.experience}
  onAdd={addExperience}
  onDelete={deleteExperience}
/>
```

---

### EducationSection
**File:** `frontend/src/components/resume/FormSections.jsx`

#### Props
```typescript
interface EducationSectionProps {
  educations: Education[];
  onAdd: (education: Education) => void;
  onDelete: (educationId: number) => void;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;      // YYYY-MM format
  endDate: string;        // YYYY-MM format
  currentlyStudying: boolean;
  grade: string;          // GPA, CGPA, etc.
}
```

#### Features
- Multiple education entries
- Collapsible view
- GPA/Grade field
- Current studies toggle
- Month/year date picker

---

### ProjectsSection
**File:** `frontend/src/components/resume/FormSections.jsx`

#### Props
```typescript
interface ProjectsSectionProps {
  projects: Project[];
  onAdd: (project: Project) => void;
  onDelete: (projectId: number) => void;
}

interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string[];  // Comma-separated to array
  link: string;            // Project URL
  startDate: string;       // YYYY-MM format
  endDate: string;         // YYYY-MM format
}
```

#### Features
- Collapsible project cards
- Technology tags
- Project link with preview
- Add/delete projects
- Date range tracking

---

### CertificationsSection
**File:** `frontend/src/components/resume/FormSections.jsx`

#### Props
```typescript
interface CertificationsSectionProps {
  certifications: Certification[];
  onAdd: (certification: Certification) => void;
  onDelete: (certificationId: number) => void;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  issuedDate: string;      // YYYY-MM format
  expiryDate: string;      // YYYY-MM format
  link: string;            // Credential URL
}
```

#### Features
- List-based display
- Issuer and date tracking
- Credential links
- Add/delete certifications

---

## Template Components

### ModernTemplate
**File:** `frontend/src/components/resume/ResumeTemplates.jsx`

#### Props
```typescript
interface ResumeTemplateProps {
  resume: Resume;  // Full resume data object
}
```

#### Design
- **Color Scheme:** Blue accents, clean design
- **Layout:** Traditional vertical
- **Best For:** Tech professionals
- **Features:**
  - Bold name in blue
  - Organized sections
  - Blue section headings
  - Skill tags with color
  - Contact info in header

---

### ProfessionalTemplate
**File:** `frontend/src/components/resume/ResumeTemplates.jsx`

#### Design
- **Color Scheme:** Grayscale only
- **Layout:** Traditional with borders
- **Best For:** Corporate positions
- **Features:**
  - Centered header
  - Uppercase section titles
  - Horizontal borders
  - Minimal color
  - Conservative styling

---

### CreativeTemplate
**File:** `frontend/src/components/resume/ResumeTemplates.jsx`

#### Design
- **Color Scheme:** Purple and pink gradient
- **Layout:** Sidebar + main content
- **Best For:** Designers, creatives
- **Features:**
  - Dark sidebar (purple to pink)
  - Contact info in sidebar
  - Skills in sidebar
  - Main content area
  - Colorful accents

---

### RESUME_TEMPLATES Registry
**File:** `frontend/src/components/resume/ResumeTemplates.jsx`

```javascript
export const RESUME_TEMPLATES = {
  modern: {
    name: 'Modern',
    component: ModernTemplate,
    description: 'Clean and contemporary design'
  },
  professional: {
    name: 'Professional',
    component: ProfessionalTemplate,
    description: 'Traditional and conservative'
  },
  creative: {
    name: 'Creative',
    component: CreativeTemplate,
    description: 'Colorful and modern'
  }
};

// Get template component
getTemplateComponent(templateId)  // Returns component
```

---

## Custom Hooks

### useResume Hook
**File:** `frontend/src/hooks/useResume.js`

#### Purpose
Manage resume state with automatic localStorage persistence

#### API
```javascript
const {
  // State
  resume,        // Current resume object
  loading,       // Loading state
  saved,         // Auto-save indicator (brief)

  // Methods - Resume Management
  createNewResume(name = 'My Resume'),

  // Methods - Personal Details
  updatePersonalDetails(details),

  // Methods - Summary
  updateSummary(summary),

  // Methods - Template
  updateTemplate(templateId),

  // Methods - Skills
  addSkill(skillName),
  updateSkill(id, skillData),
  deleteSkill(id),

  // Methods - Experience
  addExperience(experienceData),
  updateExperience(id, experienceData),
  deleteExperience(id),

  // Methods - Education
  addEducation(educationData),
  updateEducation(id, educationData),
  deleteEducation(id),

  // Methods - Projects
  addProject(projectData),
  updateProject(id, projectData),
  deleteProject(id),

  // Methods - Certifications
  addCertification(certificationData),
  updateCertification(id, certificationData),
  deleteCertification(id)
} = useResume(resumeId);
```

#### Usage Example
```jsx
import { useResume } from '@/hooks/useResume';

function MyComponent() {
  const { resume, addSkill, updatePersonalDetails } = useResume('resume_123');

  return (
    <div>
      {resume.personalDetails.fullName}
      <button onClick={() => addSkill('React')}>Add React</button>
    </div>
  );
}
```

#### Resume Data Structure
```javascript
{
  id: string,                          // Unique ID
  name: string,                        // Resume name
  template: 'modern' | 'professional' | 'creative',
  personalDetails: {
    fullName: string,
    email: string,
    phone: string,
    location: string,
    linkedIn: string,
    github: string,
    portfolio: string
  },
  summary: string,
  skills: Array<{
    id: number,
    name: string,
    level: string
  }>,
  experience: Array<{
    id: number,
    jobTitle: string,
    company: string,
    location: string,
    startDate: string,
    endDate: string,
    currentlyWorking: boolean,
    description: string
  }>,
  education: Array<{
    id: number,
    school: string,
    degree: string,
    fieldOfStudy: string,
    startDate: string,
    endDate: string,
    currentlyStudying: boolean,
    grade: string
  }>,
  projects: Array<{
    id: number,
    name: string,
    description: string,
    technologies: Array<string>,
    link: string,
    startDate: string,
    endDate: string
  }>,
  certifications: Array<{
    id: number,
    name: string,
    issuer: string,
    issuedDate: string,
    expiryDate: string,
    link: string
  }>,
  createdAt: string,     // ISO timestamp
  updatedAt: string      // ISO timestamp
}
```

---

## Utility Functions

### resumeUtils.js
**File:** `frontend/src/lib/resumeUtils.js`

#### downloadPDF()
```javascript
async downloadPDF(resumeName: string, element: HTMLElement): Promise<void>

// Description: Download resume as PDF file
// Returns: Promise (void)
// Throws: Error if element invalid

// Example:
import { downloadPDF } from '@/lib/resumeUtils';
await downloadPDF('My Resume', documentElement);
```

#### printResume()
```javascript
printResume(element: HTMLElement): void

// Description: Open browser print dialog
// Returns: void
// Throws: Error if element invalid

// Example:
import { printResume } from '@/lib/resumeUtils';
printResume(documentElement);
```

#### exportJSON()
```javascript
exportJSON(resume: Object, fileName: string = 'resume.json'): void

// Description: Export resume as JSON file
// Returns: void
// Throws: Error if invalid data

// Example:
import { exportJSON } from '@/lib/resumeUtils';
exportJSON(resumeData, 'my-resume.json');
```

#### importJSON()
```javascript
async importJSON(file: File): Promise<Object>

// Description: Import resume from JSON file
// Returns: Promise<resume data>
// Throws: Error if invalid JSON

// Example:
import { importJSON } from '@/lib/resumeUtils';
const data = await importJSON(fileInput.files[0]);
```

#### validateResume()
```javascript
validateResume(resume: Object): {
  isValid: boolean,
  errors: string[]
}

// Description: Validate resume completeness
// Returns: Object with validation results
// Throws: None

// Example:
import { validateResume } from '@/lib/resumeUtils';
const { isValid, errors } = validateResume(resumeData);
if (!isValid) {
  console.log('Validation errors:', errors);
}

// Validation rules:
// - Full name required
// - Email required
// - Phone required
// - At least 1 experience entry
// - At least 1 education entry
// - At least 1 skill
```

---

## Component Hierarchy

```
ResumeBuilder (Page)
├── Header
├── Sidebar
└── Main Content
    ├── Resume Name Input
    ├── Action Buttons (PDF, Print, JSON)
    ├── Template Selection
    ├── Tabs
    │   ├── Personal Tab
    │   │   ├── PersonalDetailsSection
    │   │   └── SummarySection
    │   ├── Experience Tab
    │   │   ├── ExperienceSection
    │   │   └── EducationSection
    │   └── Skills Tab
    │       ├── SkillsSection
    │       ├── ProjectsSection
    │       └── CertificationsSection
    └── Preview
        └── Template Component (Modern/Professional/Creative)

Resumes_New (Page)
├── Header
├── Sidebar
└── Main Content
    ├── Page Title
    ├── Search Input
    ├── Resume Grid
    │   └── ResumeCard (repeating)
    │       ├── Dropdown Menu
    │       └── Action Buttons
    └── Create Dialog
```

---

## Data Flow

```
User Input
    ↓
Form Component
    ↓
useResume Hook
    ↓
↙ ↓ ↘
State Update → localStorage Save → Template Render
    ↓
Live Preview Update
```

---

## API Summary Table

| Component | Type | Key Props | Key Methods |
|-----------|------|-----------|-------------|
| ResumeBuilder | Page | None (URL params) | handleDownloadPDF, handlePrint, etc. |
| Resumes_New | Page | None | createNewResume, deleteResume, etc. |
| PersonalDetailsSection | Form | data, onUpdate | handleChange |
| SummarySection | Form | value, onUpdate | onChange |
| SkillsSection | Form | skills, onAdd, onDelete | handleAddSkill |
| ExperienceSection | Form | experiences, onAdd, onDelete | handleAddExperience |
| EducationSection | Form | educations, onAdd, onDelete | handleAddEducation |
| ProjectsSection | Form | projects, onAdd, onDelete | handleAddProject |
| CertificationsSection | Form | certifications, onAdd, onDelete | handleAddCertification |
| ModernTemplate | Template | resume | - |
| ProfessionalTemplate | Template | resume | - |
| CreativeTemplate | Template | resume | - |
| useResume | Hook | resumeId (optional) | 20+ methods |

---

## localStorage Keys

```javascript
// Resume list (array of IDs)
localStorage.getItem('resumes_list')
// Returns: '["resume_1234567890", "resume_9876543210"]'

// Individual resume data
localStorage.getItem('resume_builder_resume_1234567890')
// Returns: '{id, name, template, personalDetails, ...}'
```

---

## Route Parameters

```
/resume-builder              // Create new (or load latest)
/resume-builder?id=ID        // Load specific resume
/resume-builder?preview=true // Preview-only mode
```

---

## Integration Checklist

- [ ] `ResumeBuilder` component added to routes
- [ ] `useResume` hook imported where needed
- [ ] Utility functions imported for PDF/JSON
- [ ] Templates registered properly
- [ ] localStorage available in browser
- [ ] html2canvas installed (`npm install html2canvas`)
- [ ] All form components integrated
- [ ] Navigation working correctly

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Status:** Production Ready
