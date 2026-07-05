import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";

let aiClient: GoogleGenAI | null = null;
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: RESEND_API_KEY is not defined. Email submissions will be logged instead.");
    }
    resendClient = new Resend(apiKey || "");
  }
  return resendClient;
}

/**
 * Escape HTML to prevent XSS in email templates
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

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
  const PORT = 5000;

  // Set high limits for image/video base64 transfers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API: Health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // API: Send Contact Form Email via Resend
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required." });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address." });
      }

      // Validate message length
      if (message.length < 10 || message.length > 5000) {
        return res.status(400).json({ error: "Message must be between 10 and 5000 characters." });
      }

      const resend = getResendClient();
      const apiKey = process.env.RESEND_API_KEY;

      // If Resend API key is not configured, log to console
      if (!apiKey) {
        console.log("[Contact Form] Submission received (no email sent - RESEND_API_KEY not configured):", {
          name,
          email,
          subject,
          message: message.substring(0, 100) + "...",
          timestamp: new Date().toISOString(),
        });

        return res.json({
          success: true,
          message: "Thank you! Your message has been received. (Email feature not configured)",
          fallback: true,
        });
      }

      // Send email via Resend
      const emailResult = await resend.emails.send({
        from: `AYU.VIBEE <noreply@ayu.vibee>`, // Update with your Resend verified domain
        to: process.env.CONTACT_EMAIL || "info.cometlabs@gmail.com",
        replyTo: email,
        subject: `New Contact Form Submission: ${subject || "General Inquiry"}`,
        html: `
          <div style="font-family: 'Playfair Display', 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">New Contact Form Submission</h2>
            
            <div style="background-color: #f7f4ed; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e1d8;">
              <p style="margin: 0 0 12px 0;"><strong>From:</strong> ${name}</p>
              <p style="margin: 0 0 12px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 0;"><strong>Subject:</strong> ${subject || "(No subject)"}</p>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6; color: #5f5e59;">${escapeHtml(message)}</p>
            </div>

            <div style="border-top: 1px solid #e5e1d8; padding-top: 16px; font-size: 12px; color: #8b8780;">
              <p style="margin: 0;">Sent from <strong>ayu.vibee</strong> contact form</p>
              <p style="margin: 8px 0 0 0;">${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
      });

      // Also send confirmation email to user
      await resend.emails.send({
        from: `AYU.VIBEE <noreply@ayu.vibee>`,
        to: email,
        subject: "We received your message — AYU.VIBEE",
        html: `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">Thank you for reaching out</h2>
            
            <p style="margin-bottom: 16px; line-height: 1.6; color: #5f5e59;">
              Hi <strong>${name}</strong>,<br><br>
              We've received your message and will get back to you within 24-48 hours. We appreciate your interest in collaborating or connecting with AYU.VIBEE.
            </p>

            <div style="background-color: #f7f4ed; padding: 16px; margin-bottom: 24px; border: 1px solid #e5e1d8;">
              <p style="margin: 0; font-size: 12px; color: #8b8780;"><strong>Your Message:</strong></p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #5f5e59;">${escapeHtml(message.substring(0, 200))}${message.length > 200 ? '...' : ''}</p>
            </div>

            <p style="margin: 0; line-height: 1.6; color: #5f5e59; font-size: 13px;">
              If you have any additional information to share, feel free to reply to this email.<br><br>
              Best regards,<br>
              <strong>Ayush Bhattacharya</strong><br>
              AYU.VIBEE Photography
            </p>
          </div>
        `,
      });

      res.json({
        success: true,
        message: "Thank you! Your message has been sent. We will get back to you soon.",
      });
    } catch (error: any) {
      console.error("Contact Form Error:", error);
      res.status(500).json({
        error: error.message || "Failed to send your message. Please try again later.",
      });
    }
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
