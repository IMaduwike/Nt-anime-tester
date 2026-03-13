import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";

interface AnimeResult {
  title: string;
  url: string;
  thumbnail: string;
  episodes: {
    sub: number;
    dub: number;
    total: number;
  };
  type: string;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [trending, setTrending] = useState<AnimeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!searchParams.get("q"));

  const API_BASE_URL = "https://nt-anime-api.onrender.com";

  // Fetch trending anime on mount
  useEffect(() => {
    const fetchTrending = async () => {
      console.log("[SEARCH] Fetching trending anime...");
      try {
        // Call external API directly for trending (not critical for logging)
        const url = `${API_BASE_URL}/trending`;
        console.log("[SEARCH] Trending URL:", url);
        const response = await fetch(url);
        console.log("[SEARCH] Trending response status:", response.status);
        const data = await response.json();
        console.log("[SEARCH] Trending data received:", data);
        setTrending(data.results || []);
      } catch (error) {
        console.error("[SEARCH] Failed to fetch trending anime:", error);
      }
    };

    fetchTrending();
  }, []);

  // Fetch search results when query changes
  useEffect(() => {
    const query = searchParams.get("q");
    console.log("[SEARCH] Search params changed. Query:", query);
    if (query) {
      setSearchQuery(query);
      console.log("[SEARCH] Triggering performSearch with:", query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    console.log("[SEARCH] performSearch called with query:", query);

    if (!query.trim()) {
      console.log("[SEARCH] Empty query, skipping search");
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const encodedQuery = encodeURIComponent(query);
      // Call local API endpoint which will log to Vercel
      const url = `/api/search?keyword=${encodedQuery}`;
      console.log("[SEARCH] Fetching from URL:", url);

      const response = await fetch(url);
      console.log("[SEARCH] Response status:", response.status);

      if (!response.ok) {
        console.warn("[SEARCH] Response not OK. Status:", response.status);
      }

      const data = await response.json();
      console.log("[SEARCH] Response data:", data);
      console.log("[SEARCH] Results array:", data.results);
      console.log("[SEARCH] Results count:", data.results?.length || 0);

      setResults(data.results || []);
      setHasSearched(true);
      console.log("[SEARCH] Search complete. Setting results.");
    } catch (error) {
      console.error("[SEARCH] Search failed with error:", error);
      if (error instanceof Error) {
        console.error("[SEARCH] Error message:", error.message);
        console.error("[SEARCH] Error stack:", error.stack);
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[SEARCH] handleSearch called with query:", searchQuery);
    if (searchQuery.trim()) {
      console.log("[SEARCH] Setting search params with query:", searchQuery);
      setSearchParams({ q: searchQuery });
    } else {
      console.log("[SEARCH] Empty query, not setting search params");
    }
  };

  const handleClearSearch = () => {
    console.log("[SEARCH] Clearing search");
    setSearchQuery("");
    setSearchParams({});
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Animated Space Background */}
      <div className="fixed inset-0 -z-50 space-bg opacity-40"></div>

      {/* Gradient Orbs */}
      <div className="fixed inset-0 -z-40 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ background: "rgba(158, 240, 255, 0.15)" }}></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full filter blur-3xl animate-pulse" style={{ background: "rgba(158, 240, 255, 0.08)", animationDelay: "1s" }}></div>
      </div>

      <Header />

      {/* Search Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-bold mb-4" style={{ color: "var(--text-main)" }}>
              Search Anime
            </h1>
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>
              Find your favorite anime series
            </p>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="glass relative rounded-xl p-2 flex items-center" style={{ borderColor: "var(--border-soft)" }}>
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 outline-none text-lg"
                style={{ color: "var(--text-main)" }}
              />
              <Button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <SearchIcon className="w-5 h-5" />
                )}
              </Button>
              {hasSearched && (
                <Button
                  type="button"
                  onClick={handleClearSearch}
                  className="btn btn-secondary ml-2"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      {hasSearched && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent-primary)" }} />
              </div>
            ) : results.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--text-main)" }}>
                  Search Results ({results.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.map((anime) => (
                    <AnimeCard key={anime.url} anime={anime} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl" style={{ color: "var(--text-muted)" }}>
                  No results found for "{searchParams.get("q")}"
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Trending Section - Show when not searching */}
      {!hasSearched && trending.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--text-main)" }}>
              Trending Now
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trending.map((anime) => (
                <AnimeCard key={anime.url} anime={anime} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function AnimeCard({ anime }: { anime: AnimeResult }) {
  return (
    <Link to={`/anime/${anime.url}`}>
      <div className="glass group relative rounded-xl overflow-hidden hover-lift h-full flex flex-col cursor-pointer" style={{ borderColor: "var(--border-soft)" }}>
        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={anime.thumbnail}
            alt={anime.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, var(--bg-main))" }}></div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm mb-2 line-clamp-2" style={{ color: "var(--text-main)" }}>
              {anime.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-sm" style={{ background: "rgba(158, 240, 255, 0.2)", color: "var(--accent-primary)" }}>
                {anime.type}
              </span>
              <span className="inline-block px-2 py-1 text-xs rounded-sm" style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}>
                {anime.episodes.total} eps
              </span>
            </div>
          </div>

          <Button className="w-full btn btn-primary text-xs" size="sm">
            Watch Now
          </Button>
        </div>
      </div>
    </Link>
  );
}
