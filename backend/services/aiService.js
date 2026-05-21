import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-1.5-flash';

// Lazy singleton — created on first call so the key is read after dotenv loads
let _ai = null;
const getAI = () => {
    if (_ai) return _ai;

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
        const err = new Error(
            'GOOGLE_GEMINI_API_KEY is not set. ' +
            'Add your real Gemini API key to backend/.env and restart the server. ' +
            'Get a free key at https://aistudio.google.com/app/apikey'
        );
        err.statusCode = 503;
        throw err;
    }

    _ai = new GoogleGenAI({ apiKey });
    return _ai;
};

const parseJSONFromResponse = (text) => {
    // Strip markdown code fences if Gemini wraps the JSON
    const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not extract JSON array from AI response');
    return JSON.parse(jsonMatch[0]);
};

// ── Generate flashcards ───────────────────────────────────────────────────────
export const generateFlashcards = async (documentText, count = 10) => {
    const prompt = `Based on the following document text, generate exactly ${count} flashcards in JSON format.
Each flashcard must have "question", "answer", and "difficulty" (easy | medium | hard).
Return ONLY a valid JSON array — no markdown, no explanation.

Document text:
${documentText.substring(0, 8000)}

Format:
[
  { "question": "...", "answer": "...", "difficulty": "medium" }
]`;

    const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
    return parseJSONFromResponse(response.text);
};

// ── Generate quiz ─────────────────────────────────────────────────────────────
export const generateQuiz = async (documentText, questionCount = 5) => {
    const prompt = `Based on the following document text, generate exactly ${questionCount} multiple-choice quiz questions in JSON format.
Each question must have exactly 4 options, a correctAnswer that exactly matches one of the options, and an explanation.
Return ONLY a valid JSON array — no markdown, no explanation.

Document text:
${documentText.substring(0, 8000)}

Format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "...",
    "difficulty": "medium"
  }
]`;

    const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
    return parseJSONFromResponse(response.text);
};

// ── Generate summary ──────────────────────────────────────────────────────────
export const generateSummary = async (documentText) => {
    const prompt = `Provide a comprehensive, well-structured summary of the following document.
Cover all key points clearly and concisely.

Document text:
${documentText}`;

    const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
    return response.text;
};

// ── Explain concept ───────────────────────────────────────────────────────────
export const explainConcept = async (concept, documentText) => {
    const prompt = `Based on the following document, explain "${concept}" in detail.
Use examples from the document where possible. If the concept is not covered, say so clearly.

Document text:
${documentText}`;

    const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
    return response.text;
};

// ── Chat with document ────────────────────────────────────────────────────────
export const chatWithDocument = async (question, documentText, conversationHistory = []) => {
    let context = 'You are a helpful AI tutor. Answer questions using only the provided document.\n\n';
    context += `Document:\n${documentText.substring(0, 6000)}\n\n`;

    if (conversationHistory.length > 0) {
        context += 'Previous conversation:\n';
        conversationHistory.slice(-6).forEach((msg) => {   // keep last 3 pairs max
            context += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
        context += '\n';
    }

    const prompt = `${context}User: ${question}\n\nAssistant:`;
    const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
    return response.text;
};
