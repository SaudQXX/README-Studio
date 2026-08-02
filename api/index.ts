import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

dotenv.config();

// Initialize Firebase Admin safely using service account, readme-studio or environment variables
try {
  if (!getApps().length) {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountEnv) {
      try {
        const serviceAccount = JSON.parse(serviceAccountEnv);
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || process.env.VITE_FIREBASE_PROJECT_ID || "readme-studio",
        });
        console.log("Firebase Admin initialized using Service Account Key.");
      } catch (parseError) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON, falling back to basic initialization:", parseError);
        initializeApp({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || "readme-studio",
        });
      }
    } else {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "readme-studio";
      initializeApp({
        projectId: projectId,
      });
      console.log("Firebase Admin initialized with project ID:", projectId);
    }
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}

const apiKey = process.env.README_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/generate", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check attempts in Firestore
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const dailyAttempts = userData?.dailyAttempts || 0;

    if (dailyAttempts <= 0) {
      return res.status(403).json({ error: "No attempts remaining today" });
    }

    const { description, answers } = req.body;

    const prompt = `
You are an expert developer and technical writer. Generate a professional README.md for a software project based on the following details.

Project Description:
${description}

Additional Details (Questionnaire Answers):
${answers.map((a: any) => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}

Return ONLY the raw Markdown content for the README.md. Do not wrap it in \`\`\`markdown or provide any other text. Include sections like Title, Badges (placeholder), Description, Features, Technologies, Installation, Usage, and License (if applicable).
`;

    let readmeContent = "";
    
    // Auto-detect Cerebras key (typically starts with cbs_) or explicit env override
    const isCerebras = (apiKey && apiKey.startsWith("cbs_")) || process.env.USE_CEREBRAS === "true";

    if (isCerebras && apiKey) {
      console.log("Using Cerebras API with llama-3.3-70b...");
      const model = process.env.CEREBRAS_MODEL || "llama-3.3-70b";
      const cerebrasRes = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "You are an expert developer and technical writer." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2
        })
      });

      if (!cerebrasRes.ok) {
        const errText = await cerebrasRes.text();
        throw new Error(`Cerebras API error: ${cerebrasRes.status} ${errText}`);
      }

      const data = await cerebrasRes.json();
      readmeContent = data.choices[0].message.content;
    } else {
      console.log("Using Gemini API...");
      if (!apiKey) {
        throw new Error("No API key configured. Please set README.Studio_API_KEY.");
      }
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      readmeContent = response.text || "";
    }

    // Deduct attempt
    await userRef.update({
      dailyAttempts: FieldValue.increment(-1)
    });

    res.json({ readme: readmeContent });
  } catch (error: any) {
    console.error("Generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate README" });
  }
});

// For Vercel, we export the app and skip starting a local server listener
// For local/dev container, we setup static serving / Vite middleware and listen on Port 3000
async function initServer() {
  if (!process.env.VERCEL) {
    const PORT = 3000;
    
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
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
      console.log(`Server running on port ${PORT}`);
    });
  }
}

initServer().catch(err => {
  console.error("Failed to initialize local server setup:", err);
});

export default app;
