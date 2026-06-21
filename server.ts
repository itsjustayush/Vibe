import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Offline fallbacks will be used.");
      // Render friendly mock/fallback replies on server when missing
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || "MOCK_KEY" });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set high limits for image/video base64 transfers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API: Health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // API: Analyze Image Curation
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image content provided." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Return a highly refined, professional simulated mock analysis if API key is missing
        return res.json({
          analysis: "Simulated Curator Analysis (API key not set):\n\n" +
            "1. **Composition**: The photograph exhibits a sublime architectural grid, striking a perfect balance of negative space and deep obsidian shadows. A 1:1 format frames the subject with geometric severity, guiding the eye toward the primary light source.\n\n" +
            "2. **Aesthetic Tone**: Quiet, melancholic, and deeply meditative. The tonal gradients of cream and gray emulate premium fiber photographic print paper, providing substantial editorial weight.\n\n" +
            "3. **Curator Recommendation**: Category: Brutalism / Architectural Form. Perfect for the 'Urban Monographs' series."
        });
      }

      const ai = getAIClient();
      
      // We will strip the prefix data:image/jpeg;base64, if present
      let cleanBase64 = image;
      if (image.includes(";base64,")) {
        cleanBase64 = image.split(";base64,").pop() || "";
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.1-flash", // We use a highly robust Model Alias
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType || "image/jpeg"
                }
              },
              {
                text: "You are an elite, modern, museum-grade photography curator and editor. Analyze this photograph. Return a structured critique including: 1) Composition analysis (focusing on lines, lighting patterns, negative space distribution, and architectural geometry), 2) Poetic caption / evocative curator note (1-2 sentences), 3) Suggested categorization tag (Landscape, Architecture, Portrait, Conceptual, or Minimalist), and 4) Suggested camera settings/tone notes. Keep the style highly professional, intellectual, and clean."
              }
            ]
          }
        ]
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Gemini Image Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image with Gemini." });
    }
  });

  // API: Analyze Video Curation
  app.post("/api/analyze-video", async (req, res) => {
    try {
      const { video, mimeType, prompt } = req.body;
      if (!video) {
        return res.status(400).json({ error: "No video content provided." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({
          analysis: "Simulated Curator Video Analysis (API key not set):\n\n" +
            "1. **Tempo and Motion**: The cinematic tracking shots exhibit graceful, deliberate pacing. Camera panning remains highly smooth, adhering to traditional cinematic standards.\n\n" +
            "2. **Chiaroscuro & Lighting**: High-contrast low-key illumination creates strong shadows, accentuating vertical panels and contours of human interaction.\n\n" +
            "3. **Tone Analysis**: Evokes a sense of deep artistic patience, focusing on the spaces between active moments rather than rapid motion. The frame breathes beautifully."
        });
      }

      const ai = getAIClient();
      
      let cleanBase64 = video;
      if (video.includes(";base64,")) {
        cleanBase64 = video.split(";base64,").pop() || "";
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.1-flash", // Using reliable flash model for quick response
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType || "video/mp4"
                }
              },
              {
                text: prompt || "Analyze this cinematic video clip. Focus on light gradients, camera tracking patterns, tempo, and the emotional/conceptual theme. Provide a museum-grade editorial critique."
              }
            ]
          }
        ]
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Gemini Video Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze video with Gemini." });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
