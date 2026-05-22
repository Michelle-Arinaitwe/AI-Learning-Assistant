import Groq from 'groq-sdk';

let _client = null;

const getClient = () => {
    if (!_client) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
            const err = new Error(
                'GROQ_API_KEY is not set. ' +
                'Get a free key at https://console.groq.com, add it to backend/.env, then restart the server.'
            );
            err.statusCode = 503;
            throw err;
        }
        _client = new Groq({ apiKey });
    }
    return _client;
};

export const generateContent = async (prompt, model = 'llama-3.3-70b-versatile') => {
    try {
        const client = getClient();
        const response = await client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model,
            temperature: 0.7,
        });
        return response.choices[0]?.message?.content || '';
    } catch (err) {
        if (err.status && !err.statusCode) err.statusCode = err.status;
        throw err;
    }
};

export default getClient;
