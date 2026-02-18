import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("API Key not found");
}

const openai = new OpenAI({ apiKey });

export default openai;
