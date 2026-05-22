import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';

// Lazy singleton — created on first call so the key is read after dotenv loads
let _ai = null;
const getAI = () => {
    if (_ai) return _ai;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
        const err = new Error(
            'GROQ_API_KEY is not set. ' +
            'Get a free key at https://console.groq.com, add it to backend/.env, then restart the server.'
        );
        err.statusCode = 503;
        throw err;
    }

    _ai = new Groq({ apiKey });
    return _ai;
};

// Call Groq and return the text response
const complete = async (prompt) => {
    try {
        const response = await getAI().chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL,
            temperature: 0.7,
        });
        return response.choices[0]?.message?.content || '';
    } catch (err) {
        // Normalize Groq SDK HTTP status into statusCode so errorHandler picks it up
        if (err.status && !err.statusCode) err.statusCode = err.status;
        throw err;
    }
};

const parseJSONFromResponse = (text) => {
    // Strip markdown code fences if the model wraps the JSON
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

    const text = await complete(prompt);
    return parseJSONFromResponse(text);
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

    const text = await complete(prompt);
    return parseJSONFromResponse(text);
};

// ── Generate summary ──────────────────────────────────────────────────────────
export const generateSummary = async (documentText) => {
    const prompt = `Provide a comprehensive, well-structured summary of the following document.
Cover all key points clearly and concisely.

Document text:
${documentText}`;

    return await complete(prompt);
};

// ── Explain concept ───────────────────────────────────────────────────────────
export const explainConcept = async (concept, documentText) => {
    const prompt = `Based on the following document, explain "${concept}" in detail.
Use examples from the document where possible. If the concept is not covered, say so clearly.

Document text:
${documentText}`;

    return await complete(prompt);
};

// ── Chat with document ────────────────────────────────────────────────────────
export const chatWithDocument = async (question, documentText, conversationHistory = []) => {
    const messages = [
        {
            role: 'system',
            content: `You are a helpful AI tutor. Answer questions using only the provided document.\n\nDocument:\n${documentText.substring(0, 6000)}`
        }
    ];

    // Include last 6 messages of history (3 user/assistant pairs)
    conversationHistory.slice(-6).forEach((msg) => {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        });
    });

    messages.push({ role: 'user', content: question });

    try {
        const response = await getAI().chat.completions.create({
            messages,
            model: MODEL,
            temperature: 0.7,
        });
        return response.choices[0]?.message?.content || '';
    } catch (err) {
        if (err.status && !err.statusCode) err.statusCode = err.status;
        throw err;
    }
};
