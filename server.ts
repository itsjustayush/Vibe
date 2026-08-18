import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as brevo from "sib-api-v3-sdk";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let aiClient: GoogleGenAI | null = null;
type BrevoTransactionalClient = {
  sendTransacEmail: (email: unknown) => Promise<unknown>;
};

let brevoClient: BrevoTransactionalClient | null = null;
let db: any = null;

// Initialize Firestore
function getDb() {
  if (!db) {
    try {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

      if (serviceAccount) {
        const app = initializeApp({
          credential: cert(serviceAccount),
        });
        db = getFirestore(app);
        console.log("[Firestore] Initialized successfully");
      } else {
        console.warn("[Firestore] FIREBASE_SERVICE_ACCOUNT not configured. Contact forms won't be persisted.");
      }
    } catch (error) {
      console.error("[Firestore] Initialization error:", error);
    }
  }
  return db;
}

// Initialize Brevo Email Client
function getBrevoClient(): BrevoTransactionalClient {
  if (!brevoClient) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn("[Brevo] BREVO_API_KEY not defined. Emails will not be sent.");
    }
    
    const defaultClient = brevo.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications["api-key"];
    apiKeyAuth.apiKey = apiKey || "";
    
    brevoClient = new brevo.TransactionalEmailsApi();
  }
  return brevoClient;
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

/**
 * Generate admin notification email HTML
 */
function generateAdminEmail(data: any, firestoreId: string | null): string {
  const timestamp = new Date(data.timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f7f4ed;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #f7f4ed; padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">New Contact Form Submission</h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.8;">From AYU.VIBEE Portfolio</p>
      </div>

      <div style="padding: 40px 30px;">
        <!-- Sender Info -->
        <div style="background: #ffffff; border: 1px solid #e5e1d8; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px;">
            <div>
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #1a1a1a;">Name</p>
              <p style="margin: 0; color: #5f5e59;">${escapeHtml(data.name)}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #1a1a1a;">Email</p>
              <p style="margin: 0;"><a href="mailto:${escapeHtml(data.email)}" style="color: #0066cc; text-decoration: none;">${escapeHtml(data.email)}</a></p>
            </div>
            ${data.subject ? `
            <div style="grid-column: 1 / -1;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #1a1a1a;">Subject</p>
              <p style="margin: 0; color: #5f5e59;">${escapeHtml(data.subject)}</p>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Message -->
        <div style="background: #ffffff; border: 1px solid #e5e1d8; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Message</h3>
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #5f5e59; font-size: 14px;">${escapeHtml(data.message)}</p>
        </div>

        <!-- Metadata -->
        <div style="background: #f7f4ed; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; color: #8b8780;">
            <div>
              <strong style="color: #5f5e59;">Submitted:</strong> ${timestamp} UTC
            </div>
            ${data.country ? `<div><strong style="color: #5f5e59;">Country:</strong> ${escapeHtml(data.country)}</div>` : ''}
            ${data.browser ? `<div style="grid-column: 1 / -1;"><strong style="color: #5f5e59;">Browser:</strong> ${escapeHtml(data.browser)}</div>` : ''}
            ${data.page ? `<div style="grid-column: 1 / -1;"><strong style="color: #5f5e59;">Page:</strong> ${escapeHtml(data.page)}</div>` : ''}
            ${firestoreId ? `<div style="grid-column: 1 / -1;"><strong style="color: #5f5e59;">Submission ID:</strong> ${firestoreId}</div>` : ''}
          </div>
        </div>

        <!-- CTA -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e1d8;">
          <a href="mailto:${escapeHtml(data.email)}?subject=Re: ${encodeURIComponent(data.subject || 'Contact Form Submission')}" style="display: inline-block; background: #1a1a1a; color: #f7f4ed; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 13px;">Reply to ${escapeHtml(data.name.split(' ')[0])}</a>
        </div>
      </div>

      <div style="background: #1a1a1a; color: #8b8780; padding: 20px 30px; text-align: center; font-size: 11px; border-top: 1px solid #e5e1d8;">
        <p style="margin: 0;">This is an automated message from your AYU.VIBEE contact form.</p>
      </div>
    </div>
  `;
}

/**
 * Generate visitor confirmation email HTML
 */
function generateVisitorEmail(visitorName: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f7f4ed;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #f7f4ed; padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Got Your Message!</h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.8;">We appreciate you reaching out</p>
      </div>

      <div style="padding: 40px 30px;">
        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #1a1a1a;">
          Hey <strong>${escapeHtml(visitorName.split(' ')[0])}</strong>,
        </p>

        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #5f5e59;">
          Thanks for reaching out! I've received your message and will get back to you as soon as possible. I appreciate your interest in collaborating or connecting with me.
        </p>

        <div style="background: #ffffff; border: 1px solid #e5e1d8; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Expected Response Time</p>
          <p style="margin: 0; font-size: 14px; color: #5f5e59;">24–48 hours</p>
        </div>

        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #5f5e59;">
          In the meantime, feel free to reach out via social media or check out more of my work on the portfolio.
        </p>
      </div>

      <div style="background: #f7f4ed; padding: 30px; text-align: center; border-top: 1px solid #e5e1d8;">
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #8b8780;">
          <strong>Ayush Bhattacharya</strong><br>
          AYU.VIBEE Photography
        </p>
        <div style="font-size: 12px; color: #8b8780;">
          <a href="https://instagram.com/ayu.vibee" style="color: #8b8780; text-decoration: none; margin: 0 8px;">Instagram</a>
          <span style="color: #c5c0b8;">•</span>
          <a href="https://x.com/ayushbhattacharya" style="color: #8b8780; text-decoration: none; margin: 0 8px;">Twitter</a>
        </div>
      </div>
    </div>
  `;
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

  // API: Contact Form - Save to Firestore and Send Email via Brevo
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message, country, browser, page } = req.body;

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

      // Prepare contact data for Firestore
      const contactData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: (subject || "").trim(),
        message: message.trim(),
        country: country || null,
        browser: browser || null,
        page: page || null,
        timestamp: new Date().toISOString(),
        ipHash: req.ip ? require("crypto").createHash("sha256").update(req.ip).digest("hex") : null,
      };

      // Save to Firestore
      const firestore = getDb();
      let firestoreId = null;
      if (firestore) {
        try {
          const docRef = await firestore.collection("contact_submissions").add(contactData);
          firestoreId = docRef.id;
          console.log(`[Firestore] Contact saved: ${firestoreId}`);
        } catch (error) {
          console.error("[Firestore] Save error:", error);
          // Continue - email delivery is more important than persistence
        }
      }

      const brevoClient = getBrevoClient();
      const apiKey = process.env.BREVO_API_KEY;

      // If Brevo API key is not configured, log to console but still save to Firestore
      if (!apiKey) {
        console.log("[Brevo] API key not configured. Contact saved to Firestore only:", {
          id: firestoreId,
          name,
          email,
          timestamp: new Date().toISOString(),
        });

        return res.json({
          success: true,
          message: "Thank you! Your message has been received. We'll get back to you as soon as possible.",
          id: firestoreId,
        });
      }

      // Send email to site owner via Brevo
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.to = [
        {
          email: process.env.CONTACT_EMAIL || "info.cometlabs@gmail.com",
          name: "AYU.VIBEE Admin",
        },
      ];
      sendSmtpEmail.replyTo = { email, name };
      sendSmtpEmail.subject = `New Contact: ${subject || "General Inquiry"} from ${name}`;
      sendSmtpEmail.htmlContent = generateAdminEmail(contactData, firestoreId);
      sendSmtpEmail.headers = {
        "X-Submission-ID": firestoreId || "unknown",
      };

      try {
        await brevoClient.sendTransacEmail(sendSmtpEmail);
        console.log(`[Brevo] Admin email sent for submission ${firestoreId}`);
      } catch (emailError) {
        console.error("[Brevo] Admin email error:", emailError);
        // Don't fail the request - submission is already saved in Firestore
      }

      // Send confirmation email to visitor
      const confirmationEmail = new brevo.SendSmtpEmail();
      confirmationEmail.to = [{ email, name }];
      confirmationEmail.subject = "Thanks for reaching out! — AYU.VIBEE";
      confirmationEmail.htmlContent = generateVisitorEmail(name);
      confirmationEmail.replyTo = { email: process.env.CONTACT_EMAIL || "info.cometlabs@gmail.com" };

      try {
        await brevoClient.sendTransacEmail(confirmationEmail);
        console.log(`[Brevo] Confirmation email sent to ${email}`);
      } catch (emailError) {
        console.error("[Brevo] Confirmation email error:", emailError);
        // Don't fail - main submission is saved and admin was notified
      }

      res.json({
        success: true,
        message: "Thank you! Your message has been received. We'll get back to you as soon as possible.",
        id: firestoreId,
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
