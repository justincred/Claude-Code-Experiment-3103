import pdfParse from 'pdf-parse';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function extractTextFromPDF(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(fileBuffer);

    // Extract text from all pages
    const fullText = data.text;

    return {
      text: fullText,
      pageCount: data.numpages,
      metadata: {
        title: data.info?.Title || '',
        author: data.info?.Author || '',
        subject: data.info?.Subject || ''
      }
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract PDF: ${error.message}`);
  }
}

export function getAvailablePDFs(pdfDir = '.') {
  try {
    const files = fs.readdirSync(pdfDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    return pdfFiles.map(file => ({
      filename: file,
      path: join(pdfDir, file),
      size: fs.statSync(join(pdfDir, file)).size
    }));
  } catch (error) {
    console.error('Error reading PDFs:', error);
    return [];
  }
}

export function chunkText(text, chunkSize = 2000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    start = end - overlap;
  }

  return chunks;
}
