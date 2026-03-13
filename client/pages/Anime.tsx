import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Share2, Heart, Download } from "lucide-react";

interface AnimeMetadata {
  title: string;
  rating: string;
  quality: string;
  has_sub: boolean;
  has_dub: boolean;
  description: string;
  type: string;
  source: string;
  premiered: string;
  date_aired: string;
  broadcast: string;
  status: string;
  genres: string[];
  mal_rating: string;
  duration: string;
  total_episodes: string;
  studios: string[];
  producers: string[];
  thumbnail: string;
}

export default function Anime() {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<AnimeMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState<"sub" | "dub">("sub");
  const [showPlayer, setShowPlayer] = useState(false);

  const API_BASE_URL = "https://nt-anime-api.onrender.com";

  useEffect(() => {
    const fetchAnimeData = async () => {
      if (!url) {
        navigate("/");
        return;
      }

      console.log("[ANIME] Loading metadata for:", url);
      setLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/metadata?anime=${encodeURIComponent(url)}`
        );
        console.log("[ANIME] Metadata response status:", response.status);

        if (!response.ok) {
          console.error("[ANIME] Failed to fetch metadata");
          navigate("/search");
          return;
        }

        const data = await response.json();
        console.log("[ANIME] Metadata loaded:", data.title);
        setAnime(data);
      } catch (error) {
        console.error("[ANIME] Error fetching metadata:", error);
        navigate("/search");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [url, navigate]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: "var(--bg-main)" }}
      >
        <div className="fixed inset-0 -z-50 space-bg opacity-40"></div>
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "var(--accent-primary)" }}
        />
      </div>
    );
  }

  if (!anime) {
    return (
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ background: "var(--bg-main)", color: "var(--text-main)" }}
      >
        <div className="fixed inset-0 -z-50 space-bg opacity-40"></div>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p style={{ color: "var(--text-muted)" }}>Anime not found</p>
        </div>
      </div>
    );
  }

  const totalEpisodes = parseInt(anime.total_episodes) || 12;
  const episodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--bg-main)", color: "var(--text-main)" }}
    >
      {/* Animated Space Background */}
      <div className="fixed inset-0 -z-50 space-bg opacity-40"></div>

      {/* Gradient Orbs */}
      <div className="fixed inset-0 -z-40 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full filter blur-3xl animate-pulse"
          style={{ background: "rgba(158, 240, 255, 0.15)" }}
        ></div>
        <div
          className="absolute top-1/3 right-0 w-80 h-80 rounded-full filter blur-3xl animate-pulse"
          style={{
            background: "rgba(158, 240, 255, 0.08)",
            animationDelay: "1s",
          }}
        ></div>
      </div>

      <Header />

      {/* Hero Section with Anime Info */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="md:col-span-1">
              <div className="glass rounded-xl overflow-hidden hover-lift h-full">
                <img
                  src={anime.thumbnail}
                  alt={anime.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1
                  className="text-4xl font-bold mb-2"
                  style={{ color: "var(--text-main)" }}
                >
                  {anime.title}
                </h1>
                <p
                  className="text-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  {anime.status}
                </p>
              </div>

              {/* Rating and Info */}
              <div className="flex flex-wrap gap-4">
                <div
                  className="glass px-4 py-2 rounded-lg"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <p style={{ color: "var(--text-muted)" }} className="text-sm">
                    Rating
                  </p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {anime.mal_rating}
                  </p>
                </div>

                <div
                  className="glass px-4 py-2 rounded-lg"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <p style={{ color: "var(--text-muted)" }} className="text-sm">
                    Episodes
                  </p>
                  <p className="text-xl font-bold">{anime.total_episodes}</p>
                </div>

                <div
                  className="glass px-4 py-2 rounded-lg"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <p style={{ color: "var(--text-muted)" }} className="text-sm">
                    Duration
                  </p>
                  <p className="text-xl font-bold">{anime.duration}</p>
                </div>

                <div
                  className="glass px-4 py-2 rounded-lg"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <p style={{ color: "var(--text-muted)" }} className="text-sm">
                    Type
                  </p>
                  <p className="text-xl font-bold">{anime.type}</p>
                </div>
              </div>

              {/* Genres */}
              <div>
                <p
                  className="text-sm mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Genres
                </p>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-block px-3 py-1 text-sm rounded-full"
                      style={{
                        background: "rgba(158, 240, 255, 0.1)",
                        color: "var(--accent-primary)",
                        border: "1px solid rgba(158, 240, 255, 0.3)",
                      }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {anime.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  className="btn btn-primary font-semibold"
                  onClick={() => setShowPlayer(true)}
                >
                  <Play className="w-5 h-5" />
                  Start Watching
                </Button>
                <Button
                  variant="outline"
                  className="btn btn-secondary"
                >
                  <Heart className="w-5 h-5" />
                  Add to List
                </Button>
                <Button
                  variant="outline"
                  className="btn btn-secondary"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="glass p-6 rounded-xl"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <h3
                className="font-bold mb-3"
                style={{ color: "var(--text-main)" }}
              >
                Information
              </h3>
              <div className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span style={{ color: "var(--text-main)" }}>{anime.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span style={{ color: "var(--text-main)" }}>{anime.source}</span>
                </div>
                <div className="flex justify-between">
                  <span>Episodes:</span>
                  <span style={{ color: "var(--text-main)" }}>
                    {anime.total_episodes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span style={{ color: "var(--text-main)" }}>{anime.status}</span>
                </div>
              </div>
            </div>

            <div
              className="glass p-6 rounded-xl"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <h3
                className="font-bold mb-3"
                style={{ color: "var(--text-main)" }}
              >
                Aired
              </h3>
              <div className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <div>
                  <span className="block mb-1">Date:</span>
                  <span style={{ color: "var(--text-main)" }}>
                    {anime.date_aired}
                  </span>
                </div>
                <div>
                  <span className="block mb-1">Premiered:</span>
                  <span style={{ color: "var(--text-main)" }}>
                    {anime.premiered}
                  </span>
                </div>
                <div>
                  <span className="block mb-1">Broadcast:</span>
                  <span style={{ color: "var(--text-main)" }}>
                    {anime.broadcast}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="glass p-6 rounded-xl"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <h3
                className="font-bold mb-3"
                style={{ color: "var(--text-main)" }}
              >
                Production
              </h3>
              <div className="space-y-3 text-sm" style={{ color: "var(--text-muted)" }}>
                {anime.studios.length > 0 && (
                  <div>
                    <span className="block mb-1">Studio:</span>
                    <span style={{ color: "var(--text-main)" }}>
                      {anime.studios.join(", ")}
                    </span>
                  </div>
                )}
                {anime.producers.length > 0 && (
                  <div>
                    <span className="block mb-1">Producers:</span>
                    <span style={{ color: "var(--text-main)" }}>
                      {anime.producers.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h2
            className="font-bold mb-8"
            style={{ color: "var(--text-main)" }}
          >
            Episodes
          </h2>

          {/* Version Selector */}
          <div className="flex gap-4 mb-8">
            {anime.has_sub && (
              <Button
                variant={selectedVersion === "sub" ? "default" : "outline"}
                onClick={() => setSelectedVersion("sub")}
                className={selectedVersion === "sub" ? "btn btn-primary" : "btn btn-secondary"}
              >
                Subtitled
              </Button>
            )}
            {anime.has_dub && (
              <Button
                variant={selectedVersion === "dub" ? "default" : "outline"}
                onClick={() => setSelectedVersion("dub")}
                className={selectedVersion === "dub" ? "btn btn-primary" : "btn btn-secondary"}
              >
                Dubbed
              </Button>
            )}
          </div>

          {/* Episode Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {episodes.map((ep) => (
              <button
                key={ep}
                onClick={() => {
                  setCurrentEpisode(ep);
                  setShowPlayer(true);
                }}
                className="glass group relative p-4 rounded-lg hover-lift text-center transition-all"
                style={{ borderColor: "var(--border-soft)" }}
              >
                <div className="text-sm font-semibold" style={{ color: "var(--accent-primary)" }}>
                  EP {ep}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {anime.duration}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Player Modal */}
      {showPlayer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="glass rounded-xl max-w-4xl w-full overflow-hidden relative">
            <button
              onClick={() => setShowPlayer(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg hover-lift"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              ✕
            </button>

            <div className="bg-black w-full">
              <video
                key={`${url}-${currentEpisode}-${selectedVersion}`}
                controls
                autoPlay
                style={{ width: "100%", height: "auto" }}
              >
                <source
                  src={`https://nt-anime-api.onrender.com/watch/${url}/${currentEpisode}${
                    selectedVersion === "dub" ? "?server=dub" : ""
                  }`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="p-6" style={{ background: "var(--bg-main)" }}>
              <h3
                className="font-bold mb-4"
                style={{ color: "var(--text-main)" }}
              >
                {anime.title} - Episode {currentEpisode}
              </h3>

              {/* Episode Navigation */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (currentEpisode > 1) setCurrentEpisode(currentEpisode - 1);
                  }}
                  disabled={currentEpisode === 1}
                  className="btn btn-secondary"
                >
                  ← Previous
                </Button>
                <Button
                  onClick={() => {
                    if (currentEpisode < totalEpisodes)
                      setCurrentEpisode(currentEpisode + 1);
                  }}
                  disabled={currentEpisode === totalEpisodes}
                  className="btn btn-secondary"
                >
                  Next →
                </Button>
                <Button
                  onClick={() => {
                    const downloadUrl = `https://nt-anime-api.onrender.com/download/${url}/${currentEpisode}${
                      selectedVersion === "dub" ? "?server=dub" : ""
                    }`;
                    window.open(downloadUrl, "_blank");
                  }}
                  className="btn btn-secondary ml-auto"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
