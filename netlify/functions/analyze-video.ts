import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { video, mimeType, prompt } = JSON.parse(event.body || "{}");

    if (!video) {
      return { statusCode: 400, body: JSON.stringify({ error: "No video content provided." }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis:
            "Simulated Curator Video Analysis (API key not set):\n\n" +
            "1. **Tempo and Motion**: The cinematic tracking shots exhibit graceful, deliberate pacing.\n\n" +
            "2. **Chiaroscuro & Lighting**: High-contrast low-key illumination creates strong shadows.\n\n" +
            "3. **Tone Analysis**: Evokes a sense of deep artistic patience."
        })
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    let cleanBase64 = video;
    if (video.includes(";base64,")) {
      cleanBase64 = video.split(";base64,").pop() || "";
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.1-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType || "video/mp4" } },
            {
              text: prompt || "Analyze this cinematic video clip. Focus on light gradients, camera tracking patterns, tempo, and the emotional/conceptual theme. Provide a museum-grade editorial critique."
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
    console.error("Gemini Video Analysis Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Failed to analyze video with Gemini." })
    };
  }
};
