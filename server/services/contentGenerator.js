import axios from 'axios';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.ANTHROPIC_API_KEY;

export async function generateConceptsFromText(text, documentName) {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = `Analyze the following lecture content and extract key concepts. For each concept, provide:
1. A concept title
2. A concise explanation (2-3 sentences)

Format your response as JSON with this structure:
{
  "concepts": [
    {
      "title": "Concept Title",
      "explanation": "Clear, concise explanation"
    }
  ]
}

Lecture Content:
${text}

Extract 5-10 main concepts from this material.`;

  const response = await axios.post(
    CLAUDE_API_URL,
    {
      model: 'claude-opus-4-1-20250805',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  );

  const content = response.data.content[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse concepts from Claude response');
  }

  return JSON.parse(jsonMatch[0]).concepts;
}

export async function generateQuestionsForConcept(conceptTitle, explanation) {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = `Given the following concept, generate 5 recall questions that test understanding of this material.

Concept: ${conceptTitle}
Explanation: ${explanation}

Format your response as JSON with this structure:
{
  "questions": [
    {
      "question": "Question text",
      "answer": "Detailed answer"
    }
  ]
}

Generate exactly 5 questions of varying difficulty (from basic recall to application-level).`;

  const response = await axios.post(
    CLAUDE_API_URL,
    {
      model: 'claude-opus-4-1-20250805',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  );

  const content = response.data.content[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse questions from Claude response');
  }

  return JSON.parse(jsonMatch[0]).questions;
}

export async function evaluateAnswer(question, userAnswer, correctAnswer) {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = `Evaluate whether the user's answer correctly addresses the question. Be lenient with variations in wording but ensure conceptual accuracy.

Question: ${question}
User's Answer: ${userAnswer}
Expected Answer: ${correctAnswer}

Provide a JSON response with:
{
  "isCorrect": boolean,
  "score": number (0-100),
  "feedback": "Brief feedback on the answer"
}`;

  const response = await axios.post(
    CLAUDE_API_URL,
    {
      model: 'claude-opus-4-1-20250805',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  );

  const content = response.data.content[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse evaluation from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}
