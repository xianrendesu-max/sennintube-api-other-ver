import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

/* =========================
   Path Fix
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   Static
========================= */
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   Invidious List
========================= */
const INVIDIOUS_LIST = [
  "https://yewtu.be",
  "https://invidious.fdn.fr",
  "https://vid.puffyan.us",
  "https://invidious.tiekoetter.com"
];

let current = 0;

/* =========================
   Search API
========================= */
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  const page = req.query.page || 1;

  if (!q) return res.json([]);

  for (let i = 0; i < INVIDIOUS_LIST.length; i++) {
    const base = INVIDIOUS_LIST[current];
    const url =
      `${base}/api/v1/search?q=${encodeURIComponent(q)}&type=video&page=${page}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      const r = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!r.ok) throw new Error("Bad status");

      const data = await r.json();
      return res.json(data);

    } catch (e) {
      current = (current + 1) % INVIDIOUS_LIST.length;
    }
  }

  res.status(500).json([]);
});

/* =========================
   Fallback
========================= */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   Start
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Sennin Proxy running on " + PORT);
});
