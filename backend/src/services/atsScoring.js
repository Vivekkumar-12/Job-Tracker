import fetch from 'node-fetch';

// Fallback heuristic score when API unavailable
function fallbackScore({ title = "", filename = "", fileSize = 0 }) {
  let score = 70;

  const lowerTitle = title.toLowerCase();
  const lowerName = filename.toLowerCase();
  const techKeywords = [
    "javascript",
    "react",
    "node",
    "typescript",
    "java",
    "python",
    "css",
    "html",
    "aws",
    "docker",
  ];

  techKeywords.forEach((kw) => {
    if (lowerTitle.includes(kw) || lowerName.includes(kw)) score += 2;
  });

  if (lowerName.endsWith(".pdf")) score += 6;
  else if (lowerName.endsWith(".docx")) score += 4;
  else if (lowerName.endsWith(".doc")) score += 2;

  if (fileSize > 2 * 1024 * 1024) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ApplyHub ATS scoring via their API
export async function scoreResume({ title = "", filename = "", fileSize = 0, fileUrl = "" }) {
  const apiKey = process.env.APPLYHUB_API_KEY;
  if (!apiKey) {
    console.warn('ApplyHub API key not configured, using fallback heuristic');
    return fallbackScore({ title, filename, fileSize });
  }

  try {
    // ApplyHub expects resume content; if no fileUrl, use fallback
    if (!fileUrl) {
      return fallbackScore({ title, filename, fileSize });
    }

    // Call ApplyHub API for ATS score
    // Note: ApplyHub API endpoint depends on their documentation
    // Typical endpoint: https://api.aplyhub.com/v1/ats-score
    const response = await fetch('https://api.aplyhub.com/v1/ats-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        resumeUrl: fileUrl,
        title: title,
      }),
    });

    if (!response.ok) {
      console.warn(`ApplyHub API error: ${response.status}, falling back to heuristic`);
      return fallbackScore({ title, filename, fileSize });
    }

    const data = await response.json();
    const score = data.score || data.atsScore || data.result?.score;
    if (typeof score === 'number') {
      return Math.round(Math.max(0, Math.min(100, score)));
    }

    return fallbackScore({ title, filename, fileSize });
  } catch (err) {
    console.error('ApplyHub API call failed:', err.message);
    return fallbackScore({ title, filename, fileSize });
  }
}
