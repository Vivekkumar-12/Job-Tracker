function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.%]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// --- STOPWORDS
const STOPWORDS = new Set([
  "and","or","the","a","an","to","for","with","on","in","of","is","are","as"
]);

// --- Extract meaningful keywords from JD
function extractJDKeywords(jdText) {
  const words = jdText.split(" ");
  const freq = {};

  for (let w of words) {
    if (w.length < 3 || STOPWORDS.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  // top 30 JD keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([w]) => w);
}

// --- Keyword density
function keywordDensity(text, keyword) {
  const matches = text.match(new RegExp(`\\b${keyword}\\b`, "g"));
  return matches ? matches.length : 0;
}

function calculateATSScore(resumeRaw, jdRaw) {
  const resume = normalize(resumeRaw);
  const jd = normalize(jdRaw);

  const jdKeywords = extractJDKeywords(jd);

  // ========== 1. Skill Match (45)
  let matchedCount = 0;
  let densityScore = 0;

  jdKeywords.forEach(k => {
    const d = keywordDensity(resume, k);
    if (d > 0) {
      matchedCount++;
      densityScore += Math.min(d, 5); // cap spam
    }
  });

  const skillScore =
    jdKeywords.length === 0
      ? 0
      : (matchedCount / jdKeywords.length) * 30 +
        (densityScore / (jdKeywords.length * 2)) * 15;

  // ========== 2. Experience Depth (25)
  const resumeLength = resume.split(" ").length;
  let experienceScore = Math.min((resumeLength / 600) * 25, 25);

  // ========== 3. Structure Score (20)
  const SECTIONS = ["experience","education","skills","projects","certifications"];
  const found = SECTIONS.filter(s => resume.includes(s));
  const structureScore = (found.length / SECTIONS.length) * 20;

  // ========== 4. Impact Score (10)
  const actionVerbs = [
    "developed","designed","implemented","optimized",
    "built","improved","led","created"
  ];
  const numbers = resume.match(/\d+[%+]?/g) || [];

  const impactScore =
    Math.min(actionVerbs.filter(v => resume.includes(v)).length, 5) * 1.5 +
    Math.min(numbers.length, 5) * 1;

  // ========== FINAL SCORE
  const finalScore = Math.min(
    Math.round(skillScore + experienceScore + structureScore + impactScore),
    100
  );

  return {
    atsScore: finalScore,
    matchedKeywords: matchedCount,
    totalJDKeywords: jdKeywords.length,
    structureSections: found,
    resumeWordCount: resumeLength
  };
}

export { calculateATSScore };
