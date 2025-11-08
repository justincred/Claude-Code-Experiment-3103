import express from 'express';
import { getAvailablePDFs, extractTextFromPDF, chunkText } from '../services/pdfProcessor.js';
import { generateConceptsFromText } from '../services/contentGenerator.js';
import { run, get, all } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

const router = express.Router();

// Get list of available PDFs
router.get('/available', (req, res) => {
  try {
    const pdfs = getAvailablePDFs('.');
    res.json({ pdfs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process a PDF and generate concepts
router.post('/process', async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename required' });
    }

    const filePath = join('.', filename);

    // Extract text from PDF
    const { text, pageCount, metadata } = await extractTextFromPDF(filePath);

    // Save document to database
    const docId = uuidv4();
    await run(
      'INSERT INTO documents (id, filename, content) VALUES (?, ?, ?)',
      [docId, filename, text]
    );

    // Chunk the text for processing (larger chunks = fewer API calls)
    const chunks = chunkText(text, 3000, 300);

    // Limit to first 3 chunks to reduce API calls and memory usage
    const chunksToProcess = chunks.slice(0, Math.min(3, chunks.length));

    // Generate concepts from each chunk
    let allConcepts = [];
    for (let i = 0; i < chunksToProcess.length; i++) {
      try {
        console.log(`Processing chunk ${i + 1}/${chunksToProcess.length}...`);
        const concepts = await generateConceptsFromText(chunksToProcess[i], filename);
        allConcepts = allConcepts.concat(concepts);
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error.message);
      }
    }

    // Remove duplicate concepts by title
    const uniqueConcepts = [];
    const seenTitles = new Set();
    for (const concept of allConcepts) {
      if (!seenTitles.has(concept.title.toLowerCase())) {
        seenTitles.add(concept.title.toLowerCase());
        uniqueConcepts.push(concept);
      }
    }

    // Save concepts to database (limit to 10 for faster processing and reduced API calls)
    const conceptsToSave = uniqueConcepts.slice(0, 10);
    const savedConcepts = [];

    for (const concept of conceptsToSave) {
      const conceptId = uuidv4();
      await run(
        'INSERT INTO concepts (id, document_id, title, explanation) VALUES (?, ?, ?, ?)',
        [conceptId, docId, concept.title, concept.explanation]
      );
      savedConcepts.push({
        id: conceptId,
        ...concept
      });
    }

    res.json({
      documentId: docId,
      filename,
      pageCount,
      conceptsGenerated: savedConcepts.length,
      concepts: savedConcepts
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get processed documents
router.get('/documents', async (req, res) => {
  try {
    const documents = await all('SELECT * FROM documents ORDER BY created_at DESC');
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get document details
router.get('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const doc = await get('SELECT * FROM documents WHERE id = ?', [documentId]);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const concepts = await all(
      'SELECT * FROM concepts WHERE document_id = ? ORDER BY created_at',
      [documentId]
    );

    res.json({ document: doc, concepts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
