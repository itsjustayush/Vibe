import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { image, mimeType } = JSON.parse(event.body || "{}");

    if (!image) {
      return { statusCode: 400, body: JSON.stringify({ error: "No image content provided." }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis:
            "Simulated Curator Analysis (API key not set):\n\n" +
            "1. **Composition**: The photograph exhibits a sublime architectural grid, striking a perfect balance of negative space and deep obsidian shadows.\n\n" +
            "2. **Aesthetic Tone**: Quiet, melancholic, and deeply meditative.\n\n" +
            "3. **Curator Recommendation**: Category: Brutalism / Architectural Form."
        })
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    let cleanBase64 = image;
    if (image.includes(";base64,")) {
      cleanBase64 = image.split(";base64,").pop() || "";
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.1-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType || "image/jpeg" } },
            {
              text: "You are an elite, modern, museum-grade photography curator and editor. Analyze this photograph. Return a structured critique including: 1) Composition analysis (focusing on lines, lighting patterns, negative space distribution, and architectural geometry), 2) Poetic caption / evocative curator note (1-2 sentences), 3) Suggested categorization tag (Landscape, Architecture, Portrait, Conceptual, or Minimalist), and 4) Suggested camera settings/tone notes. Keep the style highly professional, intellectual, and clean."
            }
          ]
        }
      ]
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis: response.text })
    };
  } catch (error: any) {
    console.error("Gemini Image Analysis Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Failed to analyze image with Gemini." })
    };
  }
};
