# Resume Builder - Quick Reference Card

## 🚀 Getting Started

### Installation
```bash
cd frontend
npm install html2canvas@^1.4.1
npm run dev
```

### Access
```
Dashboard → Resumes → Create Resume
Or directly: http://localhost:5173/resume-builder
```

---

## 📝 Form Fields Quick Reference

### Personal Details
| Field | Required | Format | Example |
|-------|----------|--------|---------|
| Full Name | ✓ | Text | John Doe |
| Email | ✓ | Email | john@example.com |
| Phone | ✓ | Phone | +1 (555) 123-4567 |
| Location | | Text | San Francisco, CA |
| LinkedIn | | URL | linkedin.com/in/john |
| GitHub | | URL | github.com/john |
| Portfolio | | URL | john.com |

### Experience Entry
| Field | Required | Notes |
|-------|----------|-------|
| Job Title | ✓ | Senior Developer |
| Company | ✓ | Tech Corp |
| Location | | Optional |
| Start Date | | Month/Year |
| End Date | | Month/Year or "Current" |
| Description | | Bullet points |

### Education Entry
| Field | Required | Notes |
|-------|----------|-------|
| School | ✓ | University Name |
| Degree | ✓ | B.S., M.A., etc. |
| Field of Study | | Major/Minor |
| Start Date | | Month/Year |
| End Date | | Month/Year or "Current" |
| Grade | | GPA, CGPA |

### Skill Entry
| Field | Required | Options |
|-------|----------|---------|
| Skill Name | ✓ | React, Python, AWS |
| Proficiency | | Beginner, Intermediate, Advanced, Expert |

---

## 🎨 Templates at a Glance

| Template | Theme | Best For |
|----------|-------|----------|
| **Modern** | Blue, clean | Tech professionals |
| **Professional** | Gray, traditional | Corporate roles |
| **Creative** | Purple/Pink sidebar | Designers, creatives |

---

## 💾 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add Skill | Type + Press Enter |
| Save | Auto-saves (Ctrl+S optional) |
| Print | Ctrl+P |
| Focus Search | Ctrl+K |

---

## 📥 Export Options

| Format | Use Case | Steps |
|--------|----------|-------|
| **PDF** | Sending to recruiters | Click "PDF" → Download |
| **Print** | Physical copy | Click "Print" → Printer |
| **JSON** | Backup/Import | Click "JSON" → Download |

---

## 🔧 Common Tasks

### Create New Resume
1. Go to `/resumes`
2. Click "Create Resume"
3. Enter name
4. Click "Create"

### Edit Existing Resume
1. Go to `/resumes`
2. Click "Edit" on resume card
3. Make changes (auto-saves)
4. Download when ready

### Switch Template
1. Scroll to top
2. Click template card
3. Preview updates instantly

### Download as PDF
1. Fill resume sections
2. Click "PDF" button
3. File downloads automatically

### Duplicate Resume
1. Go to `/resumes`
2. Click "⋮" menu on resume
3. Select "Duplicate"
4. New copy created

### Delete Resume
1. Go to `/resumes`
2. Click "⋮" menu on resume
3. Select "Delete"
4. Confirm deletion

---

## 📊 Resume Completion Guide

### Essential Sections
- [ ] Personal Details (Name, Email, Phone)
- [ ] Professional Summary (2-3 sentences)
- [ ] At least 1 Experience entry
- [ ] At least 1 Education entry
- [ ] At least 3 Skills

### Recommended Sections
- [ ] 2-3 Experience entries
- [ ] Projects (if applicable)
- [ ] Certifications

### Optional Sections
- [ ] Languages
- [ ] Publications
- [ ] Awards

---

## 🎯 ATS Optimization Tips

### Do's ✅
- Use standard section headings
- Include relevant keywords
- Use action verbs (Led, Designed, Developed)
- Include metrics and numbers
- Keep formatting consistent
- Use standard fonts
- Maintain proper spacing

### Don'ts ❌
- Don't use graphics or images
- Don't use non-standard fonts
- Don't use colored text
- Don't use tables
- Don't use special characters
- Don't exceed 1 page (usually)

---

## 🖥️ Responsive Design

### Desktop (1024px+)
- Two-column layout (Form + Preview)
- Side-by-side view
- All features visible

### Tablet (768px - 1023px)
- Single column or stacked
- Preview collapses
- Click "Show Preview" to expand

### Mobile (<768px)
- Single column
- Preview hidden by default
- Touch-friendly buttons
- Swipeable tabs

---

## 💡 Pro Tips

### Writing Tips
- **Summary**: Keep it 2-3 sentences, specific to role
- **Experience**: Use bullet points, start with action verbs
- **Skills**: List 5-20 relevant skills
- **Descriptions**: Include metrics and impact

### Formatting Tips
- Use consistent date formats (MM/YYYY or Full Dates)
- Align bullet points properly
- Keep descriptions concise (1-3 lines)
- Don't exceed 2 pages

### Content Tips
- Tailor resume to job description
- Include relevant keywords
- Quantify achievements
- Use specific examples
- Highlight unique strengths

---

## 🔍 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Data not saving | Check localStorage enabled |
| PDF not downloading | Verify html2canvas installed |
| Preview not showing | Click "Show Preview" button |
| Template not switching | Hard refresh (Ctrl+Shift+R) |
| Form inputs slow | Clear browser cache |

See **RESUME_BUILDER_SETUP.md** for detailed troubleshooting.

---

## 📱 Mobile Checklist

- [ ] Form is readable on small screen
- [ ] Buttons are large enough to tap
- [ ] Preview can be toggled on/off
- [ ] Scrolling is smooth
- [ ] All form sections are accessible
- [ ] Download works on mobile
- [ ] No horizontal scrolling needed

---

## 🔗 Important URLs

```
Main Page:        http://localhost:5173/resumes
Resume Builder:   http://localhost:5173/resume-builder
Edit Resume:      http://localhost:5173/resume-builder?id=RESUME_ID
Preview Only:     http://localhost:5173/resume-builder?id=RESUME_ID&preview=true
```

---

## 📞 Quick Support

### Check These First
1. Browser DevTools (F12)
2. Browser Console (F12 → Console)
3. localStorage (F12 → Application → Storage)
4. Clear cache and reload

### Read These Docs
- **Setup Issues**: RESUME_BUILDER_SETUP.md
- **Features**: RESUME_BUILDER_README.md
- **Code Help**: RESUME_BUILDER_EXAMPLES.md

---

## ⌨️ Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate form fields |
| Enter | Submit/Add items |
| Esc | Close dialogs |
| Ctrl+P | Print resume |
| Ctrl+S | Save (optional) |

---

## 🎓 Learning Resources

### Within Documentation
- README.md → Complete feature list
- SETUP.md → Installation & troubleshooting
- EXAMPLES.md → Code samples

### Built With
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **jsPDF** - PDF generation
- **html2canvas** - HTML to image conversion

---

## 📋 Checklist Before Sending Resume

- [ ] Spell check completed
- [ ] All dates formatted consistently
- [ ] Phone number formatted correctly
- [ ] Email is current and checked
- [ ] LinkedIn profile is complete
- [ ] GitHub profile has recent projects
- [ ] No personal pronouns (I, me, my)
- [ ] Action verbs used throughout
- [ ] Numbers and metrics included
- [ ] Section headings are consistent
- [ ] Font is professional and readable
- [ ] No color or special formatting
- [ ] PDF downloaded and verified
- [ ] Fits on 1 page (ATS optimization)

---

## 🎉 You're Ready!

Your resume builder is fully functional and ready to use. Start creating professional resumes today!

**Need help?** Check the detailed documentation files in the project root.

---

**Version:** 1.0.0 | **Date:** January 2026 | **Status:** Production Ready
