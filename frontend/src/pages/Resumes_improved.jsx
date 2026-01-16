// This file contains the improved triggerLocalAtsScore function
// Replace the old triggerLocalAtsScore in Resumes.jsx with this improved version

const triggerLocalAtsScore = async (resumeId, titleForLog = '') => {
  if (!resumeId) {
    console.warn('[ATS] No resume ID provided');
    return null;
  }
  try {
    console.log(`[ATS] Starting score calculation for: ${titleForLog || resumeId}`);
    
    const resp = await apiClient.resumes.calculateATS(resumeId, '');
    console.log('[ATS] API Response:', JSON.stringify(resp, null, 2));
    
    // Handle nested response: { success, data: { atsScore, ... } }
    let scoreValue = null;
    
    if (resp?.data?.atsScore !== undefined) {
      scoreValue = resp.data.atsScore;
      console.log('[ATS] Found atsScore in response.data:', scoreValue);
    } else if (resp?.data?.overallScore !== undefined) {
      scoreValue = resp.data.overallScore;
      console.log('[ATS] Found overallScore in response.data:', scoreValue);
    } else if (resp?.atsScore !== undefined) {
      scoreValue = resp.atsScore;
      console.log('[ATS] Found atsScore in response:', scoreValue);
    } else if (resp?.overallScore !== undefined) {
      scoreValue = resp.overallScore;
      console.log('[ATS] Found overallScore in response:', scoreValue);
    } else {
      console.warn('[ATS] Response structure:', Object.keys(resp || {}));
      return null;
    }
    
    if (scoreValue !== null && scoreValue !== undefined) {
      const finalScore = Math.round(scoreValue);
      console.log(`[ATS] ✓ Successfully scored "${titleForLog || resumeId}": ${finalScore}%`);
      return finalScore;
    }
    
    console.warn('[ATS] Score value is null/undefined:', scoreValue);
    return null;
  } catch (err) {
    console.error('[ATS] ✗ Error during scoring:', {
      resumeId,
      title: titleForLog,
      error: err?.message || String(err),
      fullError: err
    });
    return null;
  }
};
