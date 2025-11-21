import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

export const generatePoetry = async (mood: string, context: string): Promise<string> => {
  if (!ai) return "My AI muse is currently sleeping (API Key missing). But know that my heart writes poems for you every beat.";

  try {
    const prompt = `
      You are a romantic, artistic muse assisting a developer who is confessing his love to a girl named Drashti.
      Drashti means "Vision" or "Sight".
      She is a strong, independent feminist who fights against patriarchy.
      She loves music, ranging from old Bollywood ("Ehsaan Tera Hoga Mujh Par") to Billie Eilish and Harry Styles.
      
      Write a short, modern, 4-line poem or a haiku.
      The user wants to express: ${mood}.
      Additional Context: ${context}.
      
      Style: Ethereal, deep, artistic, slightly mysterious. Not cheesy. 
      Do not use markdown formatting like **bold**. Just plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "In silence, my art speaks what words cannot.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Even when the digital world fails, my admiration for you remains constant.";
  }
};

export const askWhyILoveHer = async (): Promise<string> => {
    if (!ai) return "Because you are the art I never knew I could create.";

    try {
      const prompt = `
        Give me one unique, profound reason why an artist would fall in love with a girl named Drashti.
        She is a paradox: loves old soul music and modern rebellion. She is fierce, independent, and fights for her freedom against family restrictions.
        She is a muse.
        Keep it to one sentence. Beautiful and artistic.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
  
      return response.text || "Because you are the masterpiece I am still learning to understand.";
    } catch (error) {
      return "Because you are the masterpiece I am still learning to understand.";
    }
};