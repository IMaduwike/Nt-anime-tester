import { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE_URL = "https://neon-ai-anime-api.hf.space";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { anime, episode, server } = req.query;

  if (
    !anime || typeof anime !== "string" ||
    !episode || typeof episode !== "string"
  ) {
    res.status(400).json({ error: "Missing anime or episode parameter" });
    return;
  }

  const query = server === "dub" ? "?server=dub" : "";
  const url = `${API_BASE_URL}/download/${encodeURIComponent(anime)}/${encodeURIComponent(episode)}${query}`;

  // Redirect directly to HF Space — bypasses Vercel's 4.5MB response limit
  // which was corrupting every download
  res.redirect(302, url);
}
