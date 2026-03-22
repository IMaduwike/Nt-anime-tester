import { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE_URL = "https://neon-ai-anime-api.hf.space";

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // ── STEP 1: Start job ────────────────────────────────────────────────────
  // POST /api/download
  // Body: { anime, episode, server }
  // Returns: { token }
  if (req.method === "POST") {
    const { anime, episode, server } = req.body;

    if (!anime || !episode) {
      return res.status(400).json({ error: "Missing anime or episode" });
    }

    try {
      const r = await fetch(`${API_BASE_URL}/prepare-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime, episode, server: server || "sub" }),
      });

      if (!r.ok) {
        return res.status(502).json({ error: "Failed to start download job" });
      }

      const data = await r.json() as { token: string };
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: "Failed to reach download server" });
    }
  }

  // ── STEP 2: Poll status ──────────────────────────────────────────────────
  // GET /api/download?action=status&token=xxx
  // Returns: { status: "processing"|"ready"|"failed", filename }
  if (req.method === "GET") {
    const { action, token } = req.query;

    if (action === "status" && token && typeof token === "string") {
      try {
        const r = await fetch(`${API_BASE_URL}/download-status/${token}`);
        if (!r.ok) return res.status(r.status).json({ error: "Status check failed" });
        const data = await r.json();
        return res.status(200).json(data);
      } catch (err) {
        return res.status(500).json({ error: "Failed to check status" });
      }
    }

    // ── STEP 3: Trigger file download ──────────────────────────────────────
    // GET /api/download?action=file&token=xxx
    // Redirects to single-use HF Space URL
    // Token is consumed on first use — useless if someone copies it after
    if (action === "file" && token && typeof token === "string") {
      return res.redirect(302, `${API_BASE_URL}/get-download/${token}`);
    }

    return res.status(400).json({ error: "Missing action or token" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
