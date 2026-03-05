import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("users.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    role TEXT,
    content TEXT,
    image TEXT,
    persona TEXT,
    session_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add persona and session_id columns if they don't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(messages)").all() as any[];
  const hasPersona = tableInfo.some(col => col.name === 'persona');
  if (!hasPersona) {
    db.exec("ALTER TABLE messages ADD COLUMN persona TEXT");
    console.log("Added persona column to messages table");
  }
  const hasSessionId = tableInfo.some(col => col.name === 'session_id');
  if (!hasSessionId) {
    db.exec("ALTER TABLE messages ADD COLUMN session_id TEXT");
    console.log("Added session_id column to messages table");
  }
} catch (err) {
  console.error("Migration failed:", err);
}

// One-time reset for requested user
try {
  const userToReset = db.prepare("SELECT username FROM users WHERE email = ?").get("kyawzayarwinafoolishman@gmail.com") as any;
  if (userToReset) {
    db.prepare("DELETE FROM messages WHERE username = ?").run(userToReset.username);
    db.prepare("DELETE FROM users WHERE email = ?").run("kyawzayarwinafoolishman@gmail.com");
    console.log(`Reset account for: kyawzayarwinafoolishman@gmail.com (username: ${userToReset.username})`);
  }
} catch (err) {
  console.error("Reset failed:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Auth Routes
  app.post("/api/auth/signup", (req, res) => {
    const { username, email, password } = req.body;
    // Validation: letters, underscores, numbers, special chars, no spaces, English only
    const usernameRegex = /^[a-zA-Z0-9_!@#$%^&*()\-+=<>?]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: "Invalid username format" });
    }

    try {
      const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
      stmt.run(username, email, password);
      res.json({ success: true, username });
    } catch (err: any) {
      res.status(400).json({ error: "Username or email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const stmt = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?");
    const user = stmt.get(email, password) as any;
    if (user) {
      res.json({ success: true, username: user.username });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Chat History Routes
  app.get("/api/chat/history/:username", (req, res) => {
    const { username } = req.params;
    const { persona, session_id } = req.query;
    
    let query = "SELECT role, content, image, persona, session_id FROM messages WHERE username = ?";
    const params: any[] = [username];

    if (persona) {
      query += " AND persona = ?";
      params.push(persona);
    }
    if (session_id) {
      query += " AND session_id = ?";
      params.push(session_id);
    }

    query += " ORDER BY timestamp ASC";
    const stmt = db.prepare(query);
    const history = stmt.all(...params);
    res.json(history);
  });

  app.get("/api/chat/latest_session/:username/:persona", (req, res) => {
    const { username, persona } = req.params;
    try {
      const stmt = db.prepare("SELECT session_id FROM messages WHERE username = ? AND persona = ? ORDER BY timestamp DESC LIMIT 1");
      const result = stmt.get(username, persona) as any;
      res.json({ session_id: result?.session_id || null });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch latest session" });
    }
  });

  app.post("/api/chat/save", (req, res) => {
    const { username, role, content, image, persona, session_id } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO messages (username, role, content, image, persona, session_id) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run(username, role, content, image || null, persona || null, session_id || null);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save message" });
    }
  });

  app.delete("/api/chat/clear/:username/:persona?", (req, res) => {
    const { username, persona } = req.params;
    try {
      if (persona) {
        const stmt = db.prepare("DELETE FROM messages WHERE username = ? AND persona = ?");
        stmt.run(username, persona);
      } else {
        const stmt = db.prepare("DELETE FROM messages WHERE username = ?");
        stmt.run(username);
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
