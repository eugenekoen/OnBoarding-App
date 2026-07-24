import express from "express";
import path from "path";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser for API requests
  app.use(express.json());

  // Configure Rate Limiter: Max 10 requests per 15 minutes per IP address
  const submissionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 submissions per windowMs
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
      success: false,
      error: "Too many submission attempts from this network. Please wait 15 minutes before trying again."
    }
  });

  // Dedicated rate-limited API route for onboarding form submissions
  app.post(["/api/submit-onboarding", "/OnBoarding-App/api/submit-onboarding"], submissionRateLimiter, async (req, res) => {
    try {
      // Honeypot trap check: If the hidden honeypot field is filled out, silently discard bot submission
      if (req.body && (req.body.fax_number_hp || req.body.honeypot)) {
        console.warn(`[SPAM TRAPPED] Honeypot field triggered from IP ${req.ip}. Silently dropping submission.`);
        // Return fake success so the bot believes it succeeded and leaves
        return res.json({ success: true, message: "Submission processed successfully." });
      }

      const googleScriptUrl = process.env.VITE_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

      if (!googleScriptUrl) {
        console.warn("No GOOGLE_SCRIPT_URL configured on backend. Returning simulated success.");
        return res.json({ success: true, message: "Submission rate limit verified (No Google Script URL bound)." });
      }

      // Forward request to Google Sheets Web App backend
      const response = await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });

      return res.json({ success: true, status: response.status });
    } catch (err: any) {
      console.error("Backend submission proxy error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to transmit submission." });
    }
  });

  // Serve static assets in production, otherwise mount Vite dev server
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode, mounting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode, serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

