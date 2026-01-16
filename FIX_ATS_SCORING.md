CRITICAL FIX FOR ATS SCORING

The issue is that triggerLocalAtsScore doesn't properly handle the API response format.

Backend returns:
{
  success: true,
  message: "ATS score calculated locally",
  data: {
    atsScore: 75,
    grade: "Strong",
    recommendation: "...",
    resumeTextLength: 1234
  }
}

But the function tries to get: ats?.atsScore which is looking in resp?.data?.atsScore

SOLUTION:
Replace lines 59-74 (triggerLocalAtsScore function) with:

---
const triggerLocalAtsScore = async (resumeId, titleForLog = '') => {
  if (!resumeId) {
    console.warn('[ATS] No resume ID');
    return null;
  }
  try {
    console.log(`[ATS] Calculating for: ${titleForLog}`);
    const resp = await apiClient.resumes.calculateATS(resumeId, '');
    console.log('[ATS] Response:', resp);
    
    // Backend: { success, data: { atsScore, ... } }
    const scoreVal = resp?.data?.atsScore;
    console.log('[ATS] Extracted score:', scoreVal);
    
    if (scoreVal !== null && scoreVal !== undefined) {
      return Math.round(scoreVal);
    }
    console.warn('[ATS] No atsScore found');
    return null;
  } catch (err) {
    console.error('[ATS] Error:', err?.message);
    return null;
  }
};
---

Additionally, modify handleCreate (around line 170) to reload the resume after ATS scoring:

Replace this block:
```
      setItems((prev) => {
        console.log('Created resume:', created);
        return [created, ...prev];
      });
```

With this:
```
      // Reload to ensure DB-persisted ATS score is shown
      if (getResumeId(created)) {
        try {
          const reloaded = await apiClient.resumes.get(getResumeId(created));
          created = reloaded;
        } catch (e) {
          console.warn('Could not reload:', e?.message);
        }
      }

      setItems((prev) => {
        console.log('Created resume:', created);
        return [created, ...prev];
      });
```

And modify handleSaveEditResume (around line 226) similarly:

Replace this block:
```
      setItems((prev) => prev.map((r) => (getResumeId(r) === getResumeId(updated) ? updated : r)));
```

With this:
```
      // Reload to ensure DB-persisted ATS score is shown
      if (editResumeFile && getResumeId(updated)) {
        try {
          const reloaded = await apiClient.resumes.get(getResumeId(updated));
          updated = reloaded;
        } catch (e) {
          console.warn('Could not reload:', e?.message);
        }
      }

      setItems((prev) => prev.map((r) => (getResumeId(r) === getResumeId(updated) ? updated : r)));
```
