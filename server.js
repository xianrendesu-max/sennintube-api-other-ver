import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

const INVIDIOUS = [
  "https://yewtu.be",
  "https://vid.puffyan.us",
  "https://invidious.tiekoetter.com",
  "https://inv.nadeko.net"
];

app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  const page = req.query.page || 1;

  if (!q) {
    return res.status(400).json({ error: "query required" });
  }

  for (const base of INVIDIOUS) {
    try {
      const url = `${base}/api/v1/search?q=${encodeURIComponent(q)}&type=video&page=${page}`;
      const r = await fetch(url, { timeout: 8000 });
      if (!r.ok) continue;
      const data = await r.json();
      return res.json(data);
    } catch (e) {
      console.log("failed:", base);
    }
  }

  res.status(500).json({ error: "all invidious failed" });
});

app.listen(PORT, () => {
  console.log("Proxy running on port", PORT);
});
