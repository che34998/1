import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("aegisgo.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_email TEXT NOT NULL,
    location_name TEXT,
    latitude REAL,
    longitude REAL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/reports", (req, res) => {
    try {
      const reports = db.prepare("SELECT * FROM reports ORDER BY timestamp DESC").all();
      res.json(reports);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", (req, res) => {
    const { type, description, risk_level, user_email, location_name, latitude, longitude } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO reports (type, description, risk_level, user_email, location_name, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(type, description, risk_level, user_email, location_name, latitude, longitude);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.delete("/api/reports/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM reports WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete report" });
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
