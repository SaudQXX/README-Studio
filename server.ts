import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

dotenv.config();

// Initialize Firebase Admin safely
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(firebaseConfigPath)) {
  try {
    const configRaw = fs.readFileSync(firebaseConfigPath, 'utf8');
    const firebaseConfig = JSON.parse(configRaw);
    if (!getApps().length) {
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
} else {
  // Fallback for Vercel using environment variables if config file isn't present
  try {
    if (!getApps().length && process.env.VITE_FIREBASE_PROJECT_ID) {
      initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin using env variables:", error);
  }
}

const apiKey = process.env["README.Studio_API_KEY"] || process.env.README_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const readmeContent = response.text;

    // Deduct attempt
    await userRef.update({
      dailyAttempts: FieldValue.increment(-1)
    });

    res.json({ readme: readmeContent });
  } catch (error) {
    console.error("Generation error:", error);
    res.status(500).json({ error: "Failed to generate README" });
  }
});

// For Vercel, we export the app and skip starting a local server listener
// For local/dev container, we setup static serving / Vite middleware and listen on Port 3000
async function initServer() {
  if (!process.env.VERCEL) {
    const PORT = 3000;
    
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
      console.log(`Server running on port ${PORT}`);
    });
  }
}

initServer().catch(err => {
  console.error("Failed to initialize local server setup:", err);
});

export default app;
