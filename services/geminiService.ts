import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuizData, AnalysisResult } from '../types';
import { 
  MODEL_FLASH, 
  MODEL_PRO, 
  MODEL_TTS, 
  MODEL_FLASH_IMAGE, 
  MODEL_PRO_IMAGE, 
  MODEL_VEO,
  MODEL_FLASH_LITE 
} from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to encode ArrayBuffer to Base64 for audio
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 1. Chat with Tutor (Supports Thinking Mode & Pro Model)
export const chatWithTutor = async (
    history: {role: string, parts: {text: string}[]}[], 
    message: string,
    useThinking: boolean = false
) => {
  try {
    // Use Gemini 3 Pro for the Chatbot as requested
    const modelName = useThinking ? MODEL_PRO : MODEL_PRO; 
    const config: any = {
        systemInstruction: "You are a friendly, patient, and knowledgeable Digital Literacy Tutor. Explain technical concepts simply. Use analogies relevant to the African context.",
    };

    if (useThinking) {
        config.thinkingConfig = { thinkingBudget: 32768 }; // Max for 3 Pro
    }

    const chat = ai.chats.create({
        model: modelName,
        history: history.map(h => ({
            role: h.role,
            parts: h.parts
        })),
        config
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

// 2. Transcribe Audio (Flash)
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: {
                parts: [
                    { inlineData: { mimeType: "audio/wav", data: base64Audio } },
                    { text: "Transcribe this audio exactly." }
                ]
            }
        });
        return response.text || "";
    } catch (error) {
        console.error("Transcription error:", error);
        throw error;
    }
};

// 3. Media Analysis (Image & Video Understanding - Gemini 3 Pro)
export const analyzeMedia = async (
    base64Data: string, 
    mimeType: string, 
    prompt?: string
): Promise<AnalysisResult> => {
  try {
    const isVideo = mimeType.startsWith('video/');
    // Use Gemini 3 Pro for Video Understanding and complex Image Analysis
    const model = MODEL_PRO; 
    
    const defaultPrompt = "Identify this technology object or concept. Return a JSON with 'title', 'description' (simple explanation), and 'usage' (how it helps in digital literacy).";
    const userPrompt = prompt || defaultPrompt;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            },
            { text: userPrompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                usage: { type: Type.STRING }
            },
            required: ["title", "description", "usage"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No analysis generated");
  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
};

// 4. Edit Image (Gemini 2.5 Flash Image)
export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FLASH_IMAGE, // Must use 2.5 Flash Image for editing/generation in this context
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Image } },
                    { text: prompt }
                ]
            }
        });

        // Iterate to find image part
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No edited image returned");
    } catch (error) {
        console.error("Image Edit Error:", error);
        throw error;
    }
}

// 5. Generate Image (Gemini 3 Pro Image)
export const generateImage = async (prompt: string, size: string, aspectRatio: string): Promise<string> => {
    try {
        // Note: User must have selected a key for Pro Image
        const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        
        const response = await aiClient.models.generateContent({
            model: MODEL_PRO_IMAGE,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    imageSize: size as any, // 1K, 2K, 4K
                    aspectRatio: aspectRatio as any
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error("Gen Image Error:", error);
        throw error;
    }
}

// 6. Generate Video (Veo)
export const generateVideo = async (
    prompt: string, 
    aspectRatio: string, 
    imageBytes?: string
): Promise<string> => {
    try {
        // Veo requires paid key selection, assume handled in UI flow
        const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

        let operation;
        if (imageBytes) {
             operation = await aiClient.models.generateVideos({
                model: MODEL_VEO,
                prompt: prompt,
                image: {
                    imageBytes: imageBytes,
                    mimeType: 'image/png' // Assuming PNG for simplicity from canvas/upload
                },
                config: {
                    numberOfVideos: 1,
                    aspectRatio: aspectRatio as any, // 16:9 or 9:16
                }
            });
        } else {
            operation = await aiClient.models.generateVideos({
                model: MODEL_VEO,
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    aspectRatio: aspectRatio as any, // 16:9 or 9:16
                }
            });
        }

        // Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await aiClient.operations.getVideosOperation({operation: operation});
        }

        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!uri) throw new Error("No video URI returned");

        // Fetch video bytes
        const videoRes = await fetch(`${uri}&key=${process.env.API_KEY}`);
        const blob = await videoRes.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Veo Error:", error);
        throw error;
    }
}

// 7. Quiz Generation (Flash Lite for speed)
export const generateSkillQuiz = async (topic: string): Promise<QuizData> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH_LITE, // Use Flash Lite for fast responses
      contents: `Create a beginner-friendly 5-question multiple choice quiz about: ${topic}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING },
                            explanation: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as QuizData;
    }
    throw new Error("Failed to generate quiz");
  } catch (error) {
    console.error("Quiz error:", error);
    throw error;
  }
};

// 8. Grounding (Search & Maps)
export const findResources = async (query: string, useMaps: boolean = false, location?: {lat: number, lng: number}) => {
  try {
    const tools: any[] = [];
    const toolConfig: any = {};

    if (useMaps) {
        tools.push({ googleMaps: {} });
        if (location) {
            toolConfig.retrievalConfig = {
                latLng: { latitude: location.lat, longitude: location.lng }
            };
        }
    } else {
        tools.push({ googleSearch: {} });
    }

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: query,
      config: {
        tools: tools,
        toolConfig: Object.keys(toolConfig).length > 0 ? toolConfig : undefined
      }
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, chunks };
  } catch (error) {
    console.error("Grounding error:", error);
    throw error;
  }
};

// 9. TTS (Text to Speech)
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_TTS,
            contents: {
                parts: [{ text }]
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data returned");

        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;

    } catch (error) {
        console.error("TTS Error", error);
        throw error;
    }
}