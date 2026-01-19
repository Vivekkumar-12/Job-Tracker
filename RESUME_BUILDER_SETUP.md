# Resume Builder - Setup & Installation Guide

## Quick Start

### 1. Install Dependencies

The Resume Builder requires `html2canvas` for PDF generation. Install it using:

```bash
cd frontend
npm install html2canvas@^1.4.1
# or
yarn add html2canvas@^1.4.1
# or
bun add html2canvas@^1.4.1
```

### 2. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

Navigate to `http://localhost:5173` and go to the `/resumes` page.

### 3. Create Your First Resume

1. Click "Create Resume" button
2. Enter a resume name (e.g., "Software Engineer Resume")
3. Click "Create"
4. Start filling in your information

## File Structure Overview

```
frontend/
├── src/
│   ├── pages/
│   │   ├── ResumeBuilder.jsx              ← Main builder page
│   │   ├── Resumes.jsx                    ← Old resume list (backup)
│   │   └── Resumes_New.jsx                ← New resume list manager
│   │
│   ├── components/
│   │   └── resume/
│   │       ├── FormSections.jsx           ← All form sections
│   │       ├── ResumeTemplates.jsx        ← 3 resume templates
│   │       ├── ResumeTemplates.backup.jsx ← Original backup
│   │
│   ├── hooks/
│   │   └── useResume.js                   ← State management hook
│   │
│   └── lib/
│       └── resumeUtils.js                 ← Utility functions
│
├── App.jsx                                 ← Updated with new route
└── package.json                            ← Updated dependencies
```

## Routes

### Protected Routes
- `/resumes` - Resume list and management
- `/resume-builder` - Resume editor (main application)
  - Query parameters:
    - `?id=resume_id` - Edit existing resume
    - `?preview=true` - Open in preview mode

### Example Navigation
```javascript
// Create new resume
navigate('/resumes');

// Edit existing resume
navigate('/resume-builder?id=resume_1234567890');

// Preview resume
navigate('/resume-builder?id=resume_1234567890&preview=true');
```

## Feature Walkthrough

### Creating a Resume

1. **Navigate to Resumes Page**
   ```
   http://localhost:5173/resumes
   ```

2. **Click "Create Resume"**
   - Dialog appears asking for resume name
   - Enter name (e.g., "Backend Developer Resume")
   - Click "Create"

3. **Resume Builder Opens**
   - Two-column layout (form + preview)
   - Auto-save enabled
   - All data saved to localStorage

### Filling in Information

**Tab 1: Personal**
- Basic information (name, email, phone)
- Location and links (LinkedIn, GitHub, Portfolio)
- Professional summary

**Tab 2: Experience**
- Multiple job entries
- Education history
- Start/end dates
- Current employment indicator

**Tab 3: Skills**
- Add skills with proficiency levels
- Tag-based interface
- Delete individual skills
- Projects and certifications

### Choosing a Template

1. Scroll to top of form
2. Template selection panel shows 3 options:
   - **Modern** - Blue accent, clean design
   - **Professional** - Conservative, traditional
   - **Creative** - Sidebar layout, colorful

3. Click template to switch
4. Preview updates in real-time

### Downloading Resume

**PDF Download:**
```javascript
// Triggers automatic download
Click "PDF" button
// File: ResumeName.pdf
```

**Print:**
```javascript
// Opens print dialog
Click "Print" button
// Print to PDF or physical printer
```

**JSON Export:**
```javascript
// Save resume data as JSON
Click "JSON" button
// File: ResumeName.json
// Can be imported later
```

### Managing Resumes

From the Resumes page:

**Edit**
- Click "Edit" to open in builder
- Or click card to open builder

**Duplicate**
- Click "⋮" → "Duplicate"
- Creates copy with "(Copy)" suffix
- All data copied to new resume

**Download Backup**
- Click "⋮" → "Download"
- Exports as JSON file
- Can be imported to restore

**Delete**
- Click "⋮" → "Delete"
- Requires confirmation
- Cannot be undone

## Data Storage

### localStorage Structure

All resumes saved locally in browser:

```javascript
// Resume List (IDs only)
localStorage.getItem('resumes_list')
// Returns: ["resume_1234567890", "resume_9876543210"]

// Resume Data
localStorage.getItem('resume_builder_resume_1234567890')
// Returns: { id, name, template, personalDetails, ... }
```

### Storage Size
- Typical resume: 5-20 KB
- ~5-10MB localStorage available
- Can store 500-1000 resumes

### Clearing Data
```javascript
// Clear all resumes
localStorage.clear();

// Clear specific resume
localStorage.removeItem('resume_builder_resume_id');

// Clear resume list
localStorage.removeItem('resumes_list');
```

## Customization Guide

### Changing Colors

**Modern Template** (Blue theme):
```jsx
// In ResumeTemplates.jsx, ModernTemplate component
// Change color classes:
'border-blue-600' → 'border-purple-600'
'text-blue-600' → 'text-purple-600'
'bg-blue-100' → 'bg-purple-100'
```

**Professional Template** (Grayscale):
```jsx
// Uses gray colors only
// Minimal customization needed
```

**Creative Template** (Purple/Pink):
```jsx
// Sidebar: from-purple-600 to-pink-600
// Borders: border-purple-600
// Accents: text-purple-600
```

### Adding New Template

1. **Create template component:**
```jsx
export const MyTemplate = ({ resume }) => {
  const { personalDetails, summary, experience, ... } = resume;
  
  return (
    <div className="bg-white p-8">
      {/* Your HTML structure */}
    </div>
  );
};
```

2. **Register in template registry:**
```jsx
export const RESUME_TEMPLATES = {
  modern: { name: 'Modern', component: ModernTemplate },
  professional: { name: 'Professional', component: ProfessionalTemplate },
  creative: { name: 'Creative', component: CreativeTemplate },
  myTemplate: { 
    name: 'My Custom Template', 
    component: MyTemplate,
    description: 'My custom design'
  }
};
```

3. **Template auto-appears in UI**

### Modifying Form Sections

Add new field to Personal Details:

```jsx
// In FormSections.jsx, PersonalDetailsSection
const handleChange = (field, value) => {
  onUpdate({ ...data, [field]: value });
};

// Add new input
<div className="space-y-2">
  <Label htmlFor="website">Website</Label>
  <Input
    id="website"
    value={data.website}
    onChange={(e) => handleChange('website', e.target.value)}
    placeholder="https://mywebsite.com"
  />
</div>

// Update initial state in useResume.js
personalDetails: {
  // ... existing fields
  website: '',
}
```

## Troubleshooting

### Resume Not Loading
**Problem:** Empty form when opening resume builder

**Solution:**
1. Check URL has correct resume ID
2. Open browser DevTools → Application → localStorage
3. Verify `resume_builder_resume_id` exists
4. Try refreshing page

### Data Not Saving
**Problem:** Changes disappear after refresh

**Solution:**
1. Check browser allows localStorage
2. Go to DevTools → Application → Storage
3. Verify localStorage is not disabled
4. Try incognito/private mode
5. Clear browser cache and reload

### PDF Not Downloading
**Problem:** PDF button doesn't work

**Solution:**
1. Ensure html2canvas is installed
2. Check browser console for errors
3. Try different browser
4. Disable popup blocker
5. Use Print option instead

### Template Not Switching
**Problem:** Template stays the same

**Solution:**
1. Verify template ID is correct
2. Check resume data is loaded
3. Hard refresh page (Ctrl+Shift+R)
4. Clear browser cache
5. Check browser console errors

### Storage Full
**Problem:** Cannot save more resumes

**Solution:**
1. Delete old/unused resumes
2. Export important resumes as JSON
3. Clear browser cache
4. Use different browser (separate storage)

## Browser DevTools

### Inspect Resume Data
```javascript
// In browser console
const id = 'resume_1234567890';
const resume = JSON.parse(localStorage.getItem('resume_builder_' + id));
console.log(resume);
```

### List All Resumes
```javascript
const list = JSON.parse(localStorage.getItem('resumes_list'));
list.forEach(id => {
  const resume = JSON.parse(localStorage.getItem('resume_builder_' + id));
  console.log(resume.name, resume.createdAt);
});
```

### Export All Resumes
```javascript
const list = JSON.parse(localStorage.getItem('resumes_list'));
const allResumes = list.map(id => 
  JSON.parse(localStorage.getItem('resume_builder_' + id))
);
console.log(JSON.stringify(allResumes, null, 2));
```

### Backup All Data
```javascript
const backup = {
  list: localStorage.getItem('resumes_list'),
  resumes: {}
};
const list = JSON.parse(backup.list);
list.forEach(id => {
  backup.resumes[id] = localStorage.getItem('resume_builder_' + id);
});
// Save to file and keep as backup
```

## Performance Tips

1. **Reduce Preview Re-renders**
   - Close preview on mobile to save memory
   - Click "Hide Preview" button

2. **Optimize Large Resumes**
   - Keep descriptions concise
   - Limit projects to 5-10 entries
   - Split into multiple resumes if needed

3. **Browser Performance**
   - Use Chrome for best performance
   - Disable unnecessary extensions
   - Clear browser cache regularly

## Security Notes

- ✅ All data stored locally (not sent to server)
- ✅ No personal data transmitted
- ✅ Works offline once loaded
- ⚠️ Data cleared if browser storage cleared
- ⚠️ No backup if device lost/replaced

## Next Steps

1. **Integrate with Backend** (Optional)
   - Save resumes to database
   - Sync across devices
   - Share with recruiters

2. **Add ATS Optimization**
   - Analyze resume for ATS compatibility
   - Get improvement suggestions

3. **Multi-Language Support**
   - Translate form labels
   - Support RTL languages

4. **Advanced Features**
   - Resume versioning
   - Collaboration features
   - Custom branding

## Support

For issues or questions:
1. Check this guide first
2. Look at browser console errors
3. Check localStorage data
4. Report issue with reproduction steps

## Additional Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [React Hooks Guide](https://react.dev/reference/react)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [html2canvas Guide](https://html2canvas.hertzen.com)

---

**Version:** 1.0.0
**Last Updated:** January 2026
**Status:** Production Ready
