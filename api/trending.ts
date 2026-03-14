import { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE_URL = "https://neon-ai-anime-api.hf.space";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  console.log("[SERVER] Trending API endpoint invoked");

  try {
    const response = await fetch(`${API_BASE_URL}/trending`);

    if (!response.ok) {
      res.status(response.status).json({ error: `External API returned ${response.status}` });
      return;
    }

    const data = await response.json();
    console.log("[SERVER] Trending results count:", data.results?.length || 0);
    res.status(200).json(data);
  } catch (error) {
    console.error("[SERVER] Trending error:", error);
    res.status(500).json({
      error: "Trending request failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
