import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

/* =========================
   Path Fix (ESM)
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   Static (index.html)
========================= */
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   Invidious 自動切り替え
========================= */
const INVIDIOUS_LIST = [
  "https://yewtu.be",
  "https://invidious.fdn.fr",
  "https://vid.puffyan.us",
  "https://invidious.tiekoetter.com"
];
let index = 0;

/* =========================
   Search API
========================= */
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  const page = req.query.page || 1;

  if (!q) return res.json([]);

  for (let i = 0; i < INVIDIOUS_LIST.length; i++) {
    const base = INVIDIOUS_LIST[index];
    const url =
      `${base}/api/v1/search?q=${encodeURIComponent(q)}&type=video&page=${page}`;

    try {
      const r = await fetch(url, { timeout: 8000 });
      if (!r.ok) throw new Error();

      const data = await r.json();
      return res.json(data);

    } catch {
      index = (index + 1) % INVIDIOUS_LIST.length;
    }
  }

  res.status(500).json([]);
});

/* =========================
   Fallback (SPA対策)
========================= */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   Start Server
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Sennin Proxy running on " + PORT);
});
