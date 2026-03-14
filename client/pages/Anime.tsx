import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Star, Clock, Tv, BookOpen, Calendar, Radio, Building2, Users } from "lucide-react";

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

function StatBadge({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass flex flex-col gap-1 p-4 rounded-xl" style={{ borderColor: "var(--border-soft)" }}>
      <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>
        {value || "—"}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2.5" style={{ borderBottom: "1px solid var(--border-soft)" }}>
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-sm font-medium text-right ml-4" style={{ color: "var(--text-main)", maxWidth: "60%" }}>{value || "—"}</span>
    </div>
  );
}

export default function Anime() {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<AnimeMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchAnimeData = async () => {
      if (!url) { navigate("/"); return; }
      setLoading(true);
      try {
        const response = await fetch(`/api/metadata?anime=${encodeURIComponent(url)}`);
        if (!response.ok) { navigate("/search"); return; }
        const data = await response.json();
        setAnime(data);
      } catch {
        navigate("/search");
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeData();
  }, [url, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-main)" }}>
        <div className="fixed inset-0 -z-50 space-bg opacity-40" />
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: "var(--accent-primary)" }} />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
        <div className="fixed inset-0 -z-50 space-bg opacity-40" />
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p style={{ color: "var(--text-muted)" }}>Anime not found</p>
        </div>
      </div>
    );
  }

  const statusColor = anime.status.toLowerCase().includes("airing")
    ? "rgba(74, 222, 128, 0.15)"
    : anime.status.toLowerCase().includes("finished")
    ? "rgba(158, 240, 255, 0.1)"
    : "rgba(255, 255, 255, 0.07)";

  const statusTextColor = anime.status.toLowerCase().includes("airing")
    ? "#4ade80"
    : "var(--accent-primary)";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      <div className="fixed inset-0 -z-50 space-bg opacity-40" />
      <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full filter blur-3xl opacity-20" style={{ background: "var(--accent-primary)" }} />
      </div>

      <Header />

      {/* Hero */}
      <section className="pt-24 pb-0 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Poster */}
            <div className="flex-shrink-0 w-full md:w-56">
              <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-soft)" }}>
                {!imgError ? (
                  <img
                    src={anime.thumbnail}
                    alt={anime.title}
                    className="w-full object-cover"
                    style={{ aspectRatio: "2/3" }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full flex items-center justify-center text-4xl" style={{ aspectRatio: "2/3", background: "var(--bg-surface)" }}>
                    🎬
                  </div>
                )}
                {anime.quality && (
                  <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "var(--accent-primary)", color: "#000" }}>
                    {anime.quality}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                {anime.has_sub && (
                  <span className="flex-1 text-center text-xs font-semibold py-1 rounded-lg" style={{ background: "rgba(158, 240, 255, 0.12)", color: "var(--accent-primary)", border: "1px solid rgba(158, 240, 255, 0.25)" }}>
                    SUB
                  </span>
                )}
                {anime.has_dub && (
                  <span className="flex-1 text-center text-xs font-semibold py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid var(--border-soft)" }}>
                    DUB
                  </span>
                )}
              </div>
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0 pb-8">
              <div className="mb-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: statusColor, color: statusTextColor }}>
                  {anime.status}
                </span>
              </div>

              <h1 className="font-bold leading-tight mb-2" style={{ color: "var(--text-main)", fontSize: "clamp(1.6rem, 3vw, 2.6rem)" }}>
                {anime.title}
              </h1>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                  <span className="font-semibold text-lg" style={{ color: "var(--text-main)" }}>{anime.mal_rating || anime.rating || "N/A"}</span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>/10</span>
                </div>
                <span style={{ color: "var(--border-soft)" }}>|</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{anime.type}</span>
                <span style={{ color: "var(--border-soft)" }}>|</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{anime.premiered || anime.date_aired}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {anime.genres.map((genre) => (
                  <span key={genre} className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(158, 240, 255, 0.08)", color: "var(--accent-primary)", border: "1px solid rgba(158, 240, 255, 0.2)" }}>
                    {genre}
                  </span>
                ))}
              </div>

              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)", maxWidth: "640px" }}>
                {anime.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to={`/anime/${url}/watch`}>
                  <Button className="btn btn-primary font-semibold gap-2 px-6">
                    <Play className="w-4 h-4" />
                    Watch Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBadge icon={Tv} label="Episodes" value={anime.total_episodes} />
            <StatBadge icon={Clock} label="Duration" value={anime.duration} />
            <StatBadge icon={BookOpen} label="Source" value={anime.source} />
            <StatBadge icon={Radio} label="Broadcast" value={anime.broadcast} />
          </div>
        </div>
      </section>

      {/* Details + Production */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="glass rounded-2xl p-6" style={{ borderColor: "var(--border-soft)" }}>
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                <Calendar className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
                Details
              </h2>
              <div>
                <InfoRow label="Type" value={anime.type} />
                <InfoRow label="Status" value={anime.status} />
                <InfoRow label="Premiered" value={anime.premiered} />
                <InfoRow label="Aired" value={anime.date_aired} />
                <InfoRow label="Broadcast" value={anime.broadcast} />
                <InfoRow label="Episodes" value={anime.total_episodes} />
                <InfoRow label="Duration" value={anime.duration} />
                <InfoRow label="Source" value={anime.source} />
                <InfoRow label="Quality" value={anime.quality} />
                <div className="flex justify-between items-start pt-2.5">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Available</span>
                  <div className="flex gap-2 ml-4">
                    {anime.has_sub && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(158, 240, 255, 0.1)", color: "var(--accent-primary)" }}>SUB</span>}
                    {anime.has_dub && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>DUB</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6" style={{ borderColor: "var(--border-soft)" }}>
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                <Building2 className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
                Production
              </h2>

              {anime.studios.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Studios</p>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio) => (
                      <span key={studio} className="text-sm px-3 py-1.5 rounded-lg font-medium" style={{ background: "rgba(158, 240, 255, 0.08)", color: "var(--text-main)", border: "1px solid var(--border-soft)" }}>
                        {studio}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {anime.producers.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                    <Users className="w-3 h-3 inline mr-1" />
                    Producers
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {anime.producers.map((producer) => (
                      <div key={producer} className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", color: "var(--text-muted)" }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent-primary)" }} />
                        {producer}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {anime.studios.length === 0 && anime.producers.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No production info available.</p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "rgba(158, 240, 255, 0.05)", border: "1px solid rgba(158, 240, 255, 0.15)" }}>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-main)" }}>Ready to watch?</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {anime.total_episodes} episode{parseInt(anime.total_episodes) !== 1 ? "s" : ""} · {anime.duration} each
              </p>
            </div>
            <Link to={`/anime/${url}/watch`}>
              <Button className="btn btn-primary font-semibold gap-2 px-8">
                <Play className="w-4 h-4" />
                Start Watching
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
