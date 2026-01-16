PATCH FOR Resumes.jsx TO FIX ATS SCORING

ISSUE: ATS scoring not being triggered properly on upload/edit

SOLUTION:
1. Improve triggerLocalAtsScore to handle response properly and log details
2. Ensure created/updated items refresh to show ATS score

CHANGES:

1. Replace triggerLocalAtsScore function (around line 59-74):

OLD:
const triggerLocalAtsScore = async (resumeId, titleForLog = '') => {
  if (!resumeId) return null;
  try {
    const resp = await apiClient.resumes.calculateATS(resumeId, '');
    const ats = resp?.data;
    const value = ats?.atsScore ?? ats?.overallScore ?? null;
    if (value !== null) {
      console.log(`[ATS] Scored resume ${titleForLog || resumeId}: ${value}`);
      return value;
    }
    return null;
  } catch (err) {
    console.error('[ATS] Failed to score resume', resumeId, err?.message || err);
    return null;
  }
};

NEW:
const triggerLocalAtsScore = async (resumeId, titleForLog = '') => {
  if (!resumeId) {
    console.warn('[ATS] No resume ID provided');
    return null;
  }
  try {
    console.log(`[ATS] Starting ATS calculation for: ${titleForLog}`);
    const resp = await apiClient.resumes.calculateATS(resumeId, '');
    console.log('[ATS] Response received:', resp);
    
    // Response format: { success, message, data: { atsScore, grade, recommendation, ... } }
    const atsData = resp?.data;
    if (!atsData) {
      console.warn('[ATS] No data in response');
      return null;
    }
    
    const score = atsData?.atsScore;
    if (score !== null && score !== undefined) {
      const scoreNum = Math.round(score);
      console.log(`[ATS] ✓ Score calculated: ${scoreNum}% for "${titleForLog}"`);
      return scoreNum;
    }
    
    console.warn('[ATS] No atsScore in data:', atsData);
    return null;
  } catch (err) {
    console.error('[ATS] ✗ Error:', err?.message || err);
    return null;
  }
};

2. In handleCreate, after file upload ATS trigger - reload items to ensure UI updates:

Change from:
      setItems((prev) => {
        console.log('Created resume:', created);
        return [created, ...prev];
      });

To:
      // Reload to ensure ATS score is reflected from DB
      const updated = await apiClient.resumes.get(getResumeId(created));
      setItems((prev) => {
        const merged = { ...created, ...updated };
        console.log('Created resume with ATS:', merged);
        return [merged, ...prev];
      });

3. In handleSaveEditResume, after file upload ATS trigger - reload to get latest score:

Change from:
      setItems((prev) => prev.map((r) => (getResumeId(r) === getResumeId(updated) ? updated : r)));

To:
      // Reload to ensure ATS score is reflected from DB
      if (editResumeFile) {
        const reloaded = await apiClient.resumes.get(getResumeId(updated));
        setItems((prev) => prev.map((r) => (getResumeId(r) === getResumeId(updated) ? reloaded : r)));
      } else {
        setItems((prev) => prev.map((r) => (getResumeId(r) === getResumeId(updated) ? updated : r)));
      }
