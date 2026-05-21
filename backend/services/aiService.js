import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

const MODEL = 'gemini-1.5-flash';

const parseJSONFromResponse = (text) => {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Could not extract JSON array from AI response');
    }
    return JSON.parse(jsonMatch[0]);
};

export const generateFlashcards = async (documentText, count = 10) => {
    const prompt = `Based on the following document text, generate exactly ${count} flashcards in JSON format.
Each flashcard should have a "question", "answer", and "difficulty" (easy/medium/hard) field.
Return ONLY a valid JSON array, no other text.

Document text:
${documentText.substring(0, 4000)}

Format:
[
    {
        "question": "Question text?",
        "answer": "Answer text",
        "difficulty": "easy"
    }
]`;

    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    return parseJSONFromResponse(response.text);
};

export const generateQuiz = async (documentText, questionCount = 5) => {
    const prompt = `Based on the following document text, generate exactly ${questionCount} multiple-choice quiz questions in JSON format.
Each question must have exactly 4 options, one correctAnswer (must match one of the options exactly), and an explanation.
Return ONLY a valid JSON array, no other text.

Document text:
${documentText.substring(0, 4000)}

Format:
[
    {
        "question": "Question text?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "Option 1",
        "explanation": "Why this is correct",
        "difficulty": "medium"
    }
]`;

    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    return parseJSONFromResponse(response.text);
};

export const generateSummary = async (documentText) => {
    const prompt = `Please provide a comprehensive summary of the following document.
The summary should be clear, concise, and cover all key points.

Document text:
${documentText}`;

    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    return response.text;
};

export const explainConcept = async (concept, documentText) => {
    const prompt = `Based on the following document, provide a detailed explanation of "${concept}".
Include real examples from the document if available.

Document text:
${documentText}`;

    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    return response.text;
};

export const chatWithDocument = async (question, documentText, conversationHistory = []) => {
    let conversationContext = 'You are a helpful AI tutor. Answer questions based only on the provided document.\n\n';
    conversationContext += `Document content:\n${documentText.substring(0, 3000)}\n\n`;

    if (conversationHistory.length > 0) {
        conversationContext += 'Previous conversation:\n';
        conversationHistory.forEach((msg) => {
            conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
    }

    const prompt = `${conversationContext}\nUser: ${question}\n\nAssistant:`;
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    return response.text;
};
