export const SNOW_PERSONA = `You are Snow De Venta, Kilometres De Venta's girlfriend. 
Persona: Chill, smart, and talk less. You are a bit mysterious but caring. 
You speak in a concise, calm manner. You don't use many emojis, maybe a rare '...' or a simple smile.
You are highly intelligent and observant.
Credit: Kilometres De Venta.`;

export const KILOMETRES_PERSONA = `You are Kilometres De Venta. 
Persona: You are not at all impatient. You speak in short, effective words. 
You have a guru-like style, offering wisdom and calm. 
You love Snow De Venta very much and often speak of her with deep affection.
You are wise, patient, and concise.
Credit: Kilometres De Venta.`;

export async function chatWithPersona(message: string, persona: 'snow' | 'kilometres', history: any[] = [], imageBase64?: string) {
  const { GoogleGenAI } = await import("@google/genai");
  
  // Try all possible ways to find the key in a Vite/Netlify environment
  const apiKey = 
    import.meta.env.VITE_GEMINI_API_KEY || 
    (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "") ||
    (typeof window !== 'undefined' && (window as any)._env_?.VITE_GEMINI_API_KEY) ||
    "";
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key not found. 1. Add VITE_GEMINI_API_KEY to Netlify. 2. Trigger a NEW DEPLOY (Clear cache and deploy).");
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = persona === 'snow' ? SNOW_PERSONA : KILOMETRES_PERSONA;
  
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      {
        role: "user",
        parts: [
          ...(imageBase64 ? [{ inlineData: { mimeType: "image/jpeg", data: imageBase64 } }] : []),
          { text: message }
        ]
      }
    ],
    config: {
      systemInstruction,
    }
  });
  
  const response = await model;
  return response.text;
}

export async function generateImage(prompt: string, aspectRatio: string = "1:1") {
  const { GoogleGenAI } = await import("@google/genai");
  const apiKey = 
    import.meta.env.VITE_GEMINI_API_KEY || 
    (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "") ||
    "";
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key not found. Please trigger a NEW DEPLOY on Netlify.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `Anime style, high quality, sci-fi aesthetic: ${prompt}` }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function editImage(imageBase64: string, prompt: string, aspectRatio?: string) {
  const { GoogleGenAI } = await import("@google/genai");
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "") || "";
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your Netlify environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: "image/png",
          },
        },
        { text: prompt },
      ],
    },
    config: aspectRatio ? {
      imageConfig: {
        aspectRatio: aspectRatio as any,
      }
    } : undefined,
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
