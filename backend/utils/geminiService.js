import { GoogleGenAI } from '@google/genai';

let _client = null;

const getClient = () => {
    if (!_client) {
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            throw new Error('GOOGLE_GEMINI_API_KEY is not set in environment variables');
        }
        _client = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
    }
    return _client;
};

export const generateContent = async (prompt, model = 'gemini-1.5-flash') => {
    const client = getClient();
    const response = await client.models.generateContent({ model, contents: prompt });
    return response.text;
};

export default getClient;
