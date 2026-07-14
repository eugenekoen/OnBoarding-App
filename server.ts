import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import { generateEmailHtml } from "./src/lib/emailTemplate";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));

  // API Endpoint for Form Submission and Emailing
  app.post(["/api/submit-onboarding", "/OnBoarding-App/api/submit-onboarding"], async (req, res) => {
    try {
      const { state, referenceNo } = req.body;

      if (!state || !referenceNo) {
        return res.status(400).json({
          success: false,
          error: "Missing onboarding state or reference number.",
        });
      }

      const clientEmail = state.clientInfo?.emailAddress;
      if (!clientEmail) {
        return res.status(400).json({
          success: false,
          error: "Client email address is required.",
        });
      }

      // Check if Resend API Key is configured in environment variables
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.warn("Resend API Key (RESEND_API_KEY) is not configured in Secrets.");
        return res.json({
          success: true,
          emailServiceConfigured: false,
          referenceNo,
          message: "Form submitted successfully, but automated email transmission is pending. The administrator needs to configure RESEND_API_KEY in the environment secrets.",
        });
      }

      const htmlContent = generateEmailHtml(state, referenceNo);
      const entityName = state.clientInfo.entityName || "New Entity";
      const subject = `Holdstock & Watson Client Onboarding [REF: ${referenceNo}] - ${entityName}`;

      // Initialize Resend Client
      const resend = new Resend(resendApiKey);

      // Define sender. Since you are using Resend, if you have not verified a custom domain yet,
      // Resend requires using onboarding@resend.dev as the from address.
      // If you've verified a domain, you can set the RESEND_FROM_EMAIL environment variable.
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

      console.log(`Sending onboarding email via Resend from ${fromEmail} to ${clientEmail}...`);
      
      // Send email to client, with CC to eugenekoenn@gmail.com
      await resend.emails.send({
        from: fromEmail,
        to: clientEmail,
        cc: "eugenekoenn@gmail.com",
        replyTo: "eugenekoenn@gmail.com",
        subject: subject,
        html: htmlContent,
      });

      console.log(`Onboarding email sent successfully via Resend to ${clientEmail} (CC'd eugenekoenn@gmail.com).`);

      return res.json({
        success: true,
        emailServiceConfigured: true,
        method: "resend",
        referenceNo,
        message: "Your onboarding dossier has been securely transmitted. A copy has been dispatched to your email address.",
      });
    } catch (error: any) {
      console.error("Submission/Email Server Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "An error occurred during form transmission.",
      });
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
