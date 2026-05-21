import { GoogleGenAI } from '@google/genai';

let _client = null;

const getClient = () => {
    if (!_client) {
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
        _client = new GoogleGenAI({ apiKey });
    }
    return _client;
};

export const generateContent = async (prompt, model = 'gemini-1.5-flash') => {
    const client = getClient();
    const response = await client.models.generateContent({ model, contents: prompt });
    return response.text;
};

export default getClient;
