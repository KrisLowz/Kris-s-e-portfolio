import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini Client
// Note: In a real production app, you might proxy this through a backend to hide the key,
// but for a client-side demo/portfolio, we use the env var directly as per instructions.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const sendMessageToGemini = async (history: {role: string, parts: {text: string}[]}[], newMessage: string): Promise<string> => {
  if (!apiKey) {
    return "I'm sorry, but the AI chat function is currently disabled (API Key missing). Please contact Chee Fei directly via email.";
  }

  try {
    const model = "gemini-2.5-flash";
    
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history,
    });

    const response = await chat.sendMessage({
      message: newMessage
    });

    return response.text || "I'm having trouble thinking right now. Please try again later.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the AI service. Please try again.";
  }
};
