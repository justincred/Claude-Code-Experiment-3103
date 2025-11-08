import express from 'express';
import { run, get, all } from '../db.js';
import { generateQuestionsForConcept, evaluateAnswer } from '../services/contentGenerator.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Generate questions for a concept
router.post('/generate-questions/:conceptId', async (req, res) => {
  try {
    const { conceptId } = req.params;

    // Check if questions already exist for this concept
    const existingQuestions = await all(
      'SELECT * FROM questions WHERE concept_id = ?',
      [conceptId]
    );

    if (existingQuestions.length > 0) {
      return res.json({
        conceptId,
        questions: existingQuestions,
        source: 'cached'
      });
    }

    // Get concept details
    const concept = await get(
      'SELECT * FROM concepts WHERE id = ?',
      [conceptId]
    );

    if (!concept) {
      return res.status(404).json({ error: 'Concept not found' });
    }

    // Generate questions using Claude
    const generatedQuestions = await generateQuestionsForConcept(
      concept.title,
      concept.explanation
    );

    // Save questions to database
    const savedQuestions = [];
    for (const q of generatedQuestions) {
      const questionId = uuidv4();
      await run(
        'INSERT INTO questions (id, concept_id, question, answer) VALUES (?, ?, ?, ?)',
        [questionId, conceptId, q.question, q.answer]
      );

      // Initialize spaced repetition tracking
      await run(
        'INSERT INTO spaced_repetition (id, question_id) VALUES (?, ?)',
        [uuidv4(), questionId]
      );

      savedQuestions.push({
        id: questionId,
        question: q.question,
        answer: q.answer
      });
    }

    res.json({
      conceptId,
      conceptTitle: concept.title,
      questions: savedQuestions,
      source: 'generated'
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all questions for a concept
router.get('/concept/:conceptId/questions', async (req, res) => {
  try {
    const { conceptId } = req.params;

    const concept = await get(
      'SELECT * FROM concepts WHERE id = ?',
      [conceptId]
    );

    if (!concept) {
      return res.status(404).json({ error: 'Concept not found' });
    }

    const questions = await all(
      'SELECT id, question, answer FROM questions WHERE concept_id = ?',
      [conceptId]
    );

    res.json({
      conceptId,
      conceptTitle: concept.title,
      explanation: concept.explanation,
      questions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Evaluate a user's answer
router.post('/evaluate', async (req, res) => {
  try {
    const { questionId, userAnswer, conceptId } = req.body;

    if (!questionId || !userAnswer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get question and answer
    const question = await get(
      'SELECT * FROM questions WHERE id = ?',
      [questionId]
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Evaluate the answer
    const evaluation = await evaluateAnswer(
      question.question,
      userAnswer,
      question.answer
    );

    // Record study session
    const sessionId = uuidv4();
    await run(
      'INSERT INTO study_sessions (id, concept_id, correct, response_time) VALUES (?, ?, ?, ?)',
      [sessionId, conceptId || question.concept_id, evaluation.isCorrect, 0]
    );

    // Update spaced repetition based on performance
    const srRecord = await get(
      'SELECT * FROM spaced_repetition WHERE question_id = ?',
      [questionId]
    );

    if (srRecord) {
      updateSpacedRepetition(questionId, evaluation.isCorrect ? 100 : evaluation.score);
    }

    res.json({
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      feedback: evaluation.feedback,
      correctAnswer: question.answer
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get study progress for a document
router.get('/progress/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get all concepts for the document
    const concepts = await all(
      'SELECT id FROM concepts WHERE document_id = ?',
      [documentId]
    );

    const conceptIds = concepts.map(c => c.id);

    if (conceptIds.length === 0) {
      return res.json({
        documentId,
        totalConcepts: 0,
        progress: 0,
        stats: {
          reviewed: 0,
          correct: 0,
          incorrect: 0
        }
      });
    }

    // Get study session stats
    const placeholders = conceptIds.map(() => '?').join(',');
    const stats = await get(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) as correct,
        SUM(CASE WHEN correct = 0 THEN 1 ELSE 0 END) as incorrect
      FROM study_sessions WHERE concept_id IN (${placeholders})`,
      conceptIds
    );

    const totalConcepts = conceptIds.length;
    const reviewed = stats.total || 0;
    const correct = stats.correct || 0;
    const incorrect = stats.incorrect || 0;

    res.json({
      documentId,
      totalConcepts,
      progress: reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0,
      stats: {
        reviewed,
        correct,
        incorrect
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get next question for spaced repetition
router.get('/next-question/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get all questions for this document's concepts that need review
    const nextQuestion = await get(`
      SELECT q.id, q.question, c.title as conceptTitle, c.id as conceptId
      FROM questions q
      JOIN concepts c ON q.concept_id = c.id
      LEFT JOIN spaced_repetition sr ON q.id = sr.question_id
      WHERE c.document_id = ?
      ORDER BY sr.next_review ASC, RANDOM()
      LIMIT 1
    `, [documentId]);

    if (!nextQuestion) {
      return res.json({ message: 'No questions available' });
    }

    res.json({
      id: nextQuestion.id,
      question: nextQuestion.question,
      conceptTitle: nextQuestion.conceptTitle,
      conceptId: nextQuestion.conceptId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to update spaced repetition
async function updateSpacedRepetition(questionId, score) {
  const sr = await get(
    'SELECT * FROM spaced_repetition WHERE question_id = ?',
    [questionId]
  );

  if (!sr) return;

  let easeFactor = sr.ease_factor;
  let interval = sr.interval;
  let repetitions = sr.repetitions + 1;

  // SM-2 algorithm
  const quality = score >= 80 ? 2 : score >= 60 ? 1 : 0;
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  if (quality < 3) {
    interval = 1;
    repetitions = 0;
  } else {
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else interval = Math.round(interval * easeFactor);
  }

  const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

  await run(
    `UPDATE spaced_repetition
     SET ease_factor = ?, interval = ?, repetitions = ?, last_reviewed = CURRENT_TIMESTAMP, next_review = ?
     WHERE question_id = ?`,
    [easeFactor, interval, repetitions, nextReview.toISOString(), questionId]
  );
}

export default router;
