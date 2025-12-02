import { AIRequestOptions } from "../types";
import { aiApi } from "./api";

// Frontend service that calls the backend API
// This keeps the API key secure on the server

export const generatePostContent = async (options: AIRequestOptions): Promise<string> => {
  try {
    const response = await aiApi.generateContent({
      type: options.type,
      tone: options.tone,
      platform: options.platform,
      currentText: options.currentText,
      topic: options.topic,
    });
    return response.content;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await aiApi.generateImage(prompt);
    // For now, return the description or a placeholder
    // Real image generation would return imageUrl
    if (response.imageUrl) {
      return response.imageUrl;
    }
    // Return a placeholder image for development
    return `https://picsum.photos/800/800?random=${Date.now()}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};
