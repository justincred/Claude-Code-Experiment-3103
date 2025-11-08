import axios from 'axios';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash'; // Free tier model

export async function generateConceptsFromText(text, documentName) {
  if (!GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY not configured');
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
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7
      }
    }
  );

  const content = response.data.candidates[0].content.parts[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse concepts from Gemini response');
  }

  return JSON.parse(jsonMatch[0]).concepts;
}

export async function generateQuestionsForConcept(conceptTitle, explanation) {
  if (!GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY not configured');
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
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7
      }
    }
  );

  const content = response.data.candidates[0].content.parts[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse questions from Gemini response');
  }

  return JSON.parse(jsonMatch[0]).questions;
}

export async function evaluateAnswer(question, userAnswer, correctAnswer) {
  if (!GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY not configured');
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
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.5
      }
    }
  );

  const content = response.data.candidates[0].content.parts[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse evaluation from Gemini response');
  }

  return JSON.parse(jsonMatch[0]);
}
