import { VercelRequest, VercelResponse } from "@vercel/node";

interface SearchResponse {
  keyword: string;
  results: Array<{
    title: string;
    url: string;
    thumbnail: string;
    episodes: {
      sub: number | null;
      dub: number | null;
      total: number | null;
    };
    type: string;
  }>;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { keyword } = req.query;

  console.log("[SERVER] ============================================");
  console.log("[SERVER] Search API endpoint invoked");
  console.log("[SERVER] Method:", req.method);
  console.log("[SERVER] URL:", req.url);
  console.log("[SERVER] Query params:", { keyword });
  console.log("[SERVER] ============================================");

  if (req.method !== "GET") {
    console.log("[SERVER] Invalid method:", req.method);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!keyword || typeof keyword !== "string") {
    console.log("[SERVER] Missing or invalid keyword parameter");
    console.log("[SERVER] Received keyword:", keyword);
    res.status(400).json({ error: "Missing keyword parameter" });
    return;
  }

  if (!keyword.trim()) {
    console.log("[SERVER] Empty keyword provided");
    res.status(400).json({ error: "Keyword cannot be empty" });
    return;
  }

  const encodedKeyword = encodeURIComponent(keyword);
  const externalUrl = `https://neon-ai-anime-api.hf.space/search?keyword=${encodedKeyword}`;

  console.log("[SERVER] ============================================");
  console.log("[SERVER] External API Request Details:");
  console.log("[SERVER] Target URL:", externalUrl);
  console.log("[SERVER] Original keyword:", keyword);
  console.log("[SERVER] Encoded keyword:", encodedKeyword);
  console.log("[SERVER] ============================================");

  try {
    console.log("[SERVER] Initiating fetch request to external API...");
    const startTime = Date.now();

    const response = await fetch(externalUrl);
    const fetchTime = Date.now() - startTime;

    console.log("[SERVER] ============================================");
    console.log("[SERVER] External API Response:");
    console.log("[SERVER] Status Code:", response.status);
    console.log("[SERVER] Status Text:", response.statusText);
    console.log("[SERVER] Fetch Duration (ms):", fetchTime);
    console.log("[SERVER] Content-Type:", response.headers.get("content-type"));
    console.log("[SERVER] ============================================");

    if (!response.ok) {
      console.warn("[SERVER] ERROR: Non-OK response from external API");
      console.warn("[SERVER] Status:", response.status);
      const errorText = await response.text();
      console.warn("[SERVER] Error response body:", errorText);
      res.status(response.status).json({
        error: `External API returned ${response.status}`,
      });
      return;
    }

    console.log("[SERVER] Parsing response JSON...");
    const parseStart = Date.now();
    const data: SearchResponse = await response.json();
    const parseTime = Date.now() - parseStart;

    console.log("[SERVER] ============================================");
    console.log("[SERVER] Response Data Parsed:");
    console.log("[SERVER] Parse Duration (ms):", parseTime);
    console.log("[SERVER] Keyword from response:", data.keyword);
    console.log("[SERVER] Results count:", data.results?.length || 0);

    if (data.results && data.results.length > 0) {
      console.log("[SERVER] Top 3 Results:");
      data.results.slice(0, 3).forEach((result, index) => {
        console.log(`[SERVER]   ${index + 1}. ${result.title} (${result.type})`);
        console.log(`[SERVER]      URL: ${result.url}`);
        console.log(
          `[SERVER]      Episodes: ${result.episodes.total} total`
        );
      });
    } else {
      console.log("[SERVER] No results found");
    }

    console.log("[SERVER] ============================================");

    console.log("[SERVER] Sending response to client...");
    res.status(200).json(data);
    console.log("[SERVER] Response sent successfully");
    console.log("[SERVER] ============================================");
  } catch (error) {
    console.error("[SERVER] ============================================");
    console.error("[SERVER] ERROR OCCURRED during search:");

    if (error instanceof TypeError) {
      console.error("[SERVER] Error Type: TypeError (Network/Fetch Issue)");
      console.error("[SERVER] Message:", error.message);
      console.error("[SERVER] Stack:", error.stack);
    } else if (error instanceof SyntaxError) {
      console.error("[SERVER] Error Type: SyntaxError (Invalid JSON)");
      console.error("[SERVER] Message:", error.message);
      console.error("[SERVER] Stack:", error.stack);
    } else if (error instanceof Error) {
      console.error("[SERVER] Error Type:", error.constructor.name);
      console.error("[SERVER] Message:", error.message);
      console.error("[SERVER] Stack:", error.stack);
    } else {
      console.error("[SERVER] Unknown error type:", typeof error);
      console.error("[SERVER] Error:", error);
    }

    console.error("[SERVER] ============================================");

    res.status(500).json({
      error: "Search request failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
