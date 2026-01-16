import { scoreResumeFile } from './src/services/universalAts.js';

const testFile = 'uploads/Specialised CV New-1-1768550987974.pdf';

console.log('Testing ATS scoring on file:', testFile);

try {
  const result = await scoreResumeFile({
    filePath: testFile,
    jobDescription: 'Senior Software Engineer with 5+ years of experience',
    jobTitle: 'Senior Software Engineer',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    companyKeywords: []
  });

  console.log('\n=== FINAL RESULT ===');
  console.log('ATS Score:', result.atsScore);
  console.log('Grade:', result.grade);
  console.log('Recommendation:', result.recommendation);
  console.log('\nBreakdown:', result.breakdown);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
