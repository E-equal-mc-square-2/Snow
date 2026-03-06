import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Sheets Configuration
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

const jwt = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: SCOPES,
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || "", jwt);
let sheetsInitialized = false;

async function getSheet(title: string, headers: string[]) {
  if (!sheetsInitialized) {
    await doc.loadInfo();
    sheetsInitialized = true;
  }
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({ title, headerValues: headers });
    // Refresh info after adding a sheet
    await doc.loadInfo();
    sheet = doc.sheetsByTitle[title];
  }
  return sheet;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Initialize Sheets
  try {
    // We use ONE spreadsheet (doc) and ensure the necessary tabs exist inside it.
    await getSheet("users", ["username", "email", "password"]);
    await getSheet("messages", ["username", "role", "content", "image", "persona", "session_id", "timestamp"]);
    console.log("✅ Single Google Spreadsheet Database connected and initialized");
  } catch (err) {
    console.error("❌ Failed to initialize Google Spreadsheet:", err);
  }

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { username, email, password } = req.body;
    const usernameRegex = /^[a-zA-Z0-9_!@#$%^&*()\-+=<>?]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: "Invalid username format" });
    }

    try {
      const sheet = await getSheet("users", ["username", "email", "password"]);
      const rows = await sheet.getRows();
      const exists = rows.find(r => r.get("username") === username || r.get("email") === email);
      
      if (exists) {
        return res.status(400).json({ error: "Username or email already exists" });
      }

      await sheet.addRow({ username, email, password });
      res.json({ success: true, username });
    } catch (err: any) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const sheet = await getSheet("users", ["username", "email", "password"]);
      const rows = await sheet.getRows();
      const user = rows.find(r => r.get("email") === email && r.get("password") === password);
      
      if (user) {
        res.json({ success: true, username: user.get("username") });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat History Routes
  app.get("/api/chat/history/:username", async (req, res) => {
    const { username } = req.params;
    const { persona, session_id } = req.query;
    
    try {
      const sheet = await getSheet("messages", ["username", "role", "content", "image", "persona", "session_id", "timestamp"]);
      const rows = await sheet.getRows();
      
      let history = rows
        .filter(r => r.get("username") === username)
        .map(r => ({
          role: r.get("role"),
          content: r.get("content"),
          image: r.get("image") || null,
          persona: r.get("persona") || null,
          session_id: r.get("session_id") || null,
          timestamp: r.get("timestamp")
        }));

      if (persona) {
        history = history.filter(h => h.persona === persona);
      }
      if (session_id) {
        history = history.filter(h => h.session_id === session_id);
      }

      res.json(history);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.get("/api/chat/latest_session/:username/:persona", async (req, res) => {
    const { username, persona } = req.params;
    try {
      const sheet = await getSheet("messages", ["username", "role", "content", "image", "persona", "session_id", "timestamp"]);
      const rows = await sheet.getRows();
      const personaRows = rows.filter(r => r.get("username") === username && r.get("persona") === persona);
      
      if (personaRows.length > 0) {
        const latest = personaRows[personaRows.length - 1];
        res.json({ session_id: latest.get("session_id") || null });
      } else {
        res.json({ session_id: null });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch latest session" });
    }
  });

  app.post("/api/chat/save", async (req, res) => {
    const { username, role, content, image, persona, session_id } = req.body;
    try {
      const sheet = await getSheet("messages", ["username", "role", "content", "image", "persona", "session_id", "timestamp"]);
      
      // Google Sheets cell limit is 50,000 characters
      const safeImage = (image && image.length > 45000) ? "Image too large for sheet storage" : (image || "");
      
      await sheet.addRow({
        username,
        role,
        content,
        image: safeImage,
        persona: persona || "",
        session_id: session_id || "",
        timestamp: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (err) {
      console.error("Save error:", err);
      res.status(500).json({ error: "Failed to save message" });
    }
  });

  app.delete("/api/chat/clear/:username/:persona?", async (req, res) => {
    const { username, persona } = req.params;
    try {
      const sheet = await getSheet("messages", ["username", "role", "content", "image", "persona", "session_id", "timestamp"]);
      const rows = await sheet.getRows();
      
      // Google Sheets delete is row by row and can be slow for many rows
      // For a chat app, we'll delete matching rows
      for (const row of rows) {
        const matchUser = row.get("username") === username;
        const matchPersona = persona ? row.get("persona") === persona : true;
        if (matchUser && matchPersona) {
          await row.delete();
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to clear history" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
