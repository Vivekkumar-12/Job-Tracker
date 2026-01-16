import pdfParse from 'pdf-parse/lib/index.js';
import fs from 'fs';

const buffer = fs.readFileSync('uploads/Specialised CV New-1-1768550987974.pdf');
try {
  const data = await pdfParse(buffer);
  console.log('Success! Text length:', data.text.length);
} catch (err) {
  console.error('Error:', err.message);
}
