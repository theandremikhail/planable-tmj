import { GoogleGenAI, Type } from "@google/genai";
import { AIRequestOptions } from "../types";

// Helper to get AI instance
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePostContent = async (options: AIRequestOptions): Promise<string> => {
  const ai = getAI();
  const model = "gemini-2.5-flash";

  let prompt = "";

  switch (options.type) {
    case 'draft':
      prompt = `Write a ${options.tone || 'professional'} social media post for ${options.platform} about: "${options.topic}". Include relevant emojis and hashtags.`;
      break;
    case 'improve':
      prompt = `Rewrite the following social media post to be more engaging and polished for ${options.platform}. Keep the original meaning but improve the flow: "${options.currentText}"`;
      break;
    case 'shorten':
      prompt = `Shorten the following post for ${options.platform} while keeping the key message. Maximum 280 characters if for Twitter: "${options.currentText}"`;
      break;
    case 'expand':
      prompt = `Expand on the following post ideas to make it a thought leadership piece for ${options.platform}: "${options.currentText}"`;
      break;
    case 'hashtags':
      prompt = `Generate 10 relevant, high-traffic hashtags for a post about: "${options.currentText}". Return only the hashtags separated by spaces.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Text Gen Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  // Using gemini-2.5-flash-image as per guidelines for general image generation
  const model = "gemini-2.5-flash-image";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        // No specific imageConfig needed for standard generation unless ratio requested
        // imageConfig: { aspectRatio: "1:1" } 
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data returned from model.");

  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};
