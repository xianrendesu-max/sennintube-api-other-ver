import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

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

  if (!q) {
    return res.status(400).json([]);
  }

  for (let i = 0; i < INVIDIOUS_LIST.length; i++) {
    const base = INVIDIOUS_LIST[index];
    const url =
      `${base}/api/v1/search?q=${encodeURIComponent(q)}&type=video&page=${page}`;

    try {
      const r = await fetch(url, { timeout: 8000 });
      if (!r.ok) throw new Error("bad response");

      const data = await r.json();
      return res.json(data);

    } catch (e) {
      index = (index + 1) % INVIDIOUS_LIST.length;
    }
  }

  res.status(500).json([]);
});

/* =========================
   Health Check
========================= */
app.get("/", (req, res) => {
  res.send("Sennin Proxy is running");
});

/* =========================
   Start Server
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Proxy running on port " + PORT);
});
