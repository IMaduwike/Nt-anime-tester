import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Hls from "hls.js";
import Header from "@/components/Header";
import { Loader2, ArrowLeft } from "lucide-react";

interface AnimeMetadata {
  title: string;
  has_sub: boolean;
  has_dub: boolean;
  total_episodes: string;
  duration: string;
  thumbnail: string;
}

function formatTime(s: number) {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Watch() {
  const { url, episode } = useParams<{ url: string; episode: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [anime, setAnime] = useState<AnimeMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState<"sub" | "dub">("sub");

  // Player state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const currentEp = parseInt(episode || "1");
  const totalEps = parseInt(anime?.total_episodes || "0") || 0;

  useEffect(() => {
    if (!url) { navigate("/"); return; }
    setLoading(true);
    fetch(`/api/metadata?anime=${encodeURIComponent(url)}`)
      .then((r) => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then((data: AnimeMetadata) => {
        setAnime(data);
        if (!data.has_sub && data.has_dub) setServer("dub");
      })
      .catch(() => navigate("/search"))
      .finally(() => setLoading(false));
  }, [url, navigate]);

  useEffect(() => {
    if (!anime || !videoRef.current) return;
    const video = videoRef.current;
    const videoSrc = `/api/watch/${url}/${currentEp}${server === "dub" ? "?server=dub" : ""}`;

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.play().catch(() => {});
    }

    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [url, currentEp, server, anime]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => { setVolume(video.volume); setMuted(video.muted); };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("volumechange", onVolumeChange);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, [anime]);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); playing ? video.pause() : video.play(); break;
        case "ArrowRight": e.preventDefault(); video.currentTime = Math.min(video.currentTime + 10, video.duration); break;
        case "ArrowLeft": e.preventDefault(); video.currentTime = Math.max(video.currentTime - 10, 0); break;
        case "ArrowUp": e.preventDefault(); video.volume = Math.min(video.volume + 0.1, 1); break;
        case "ArrowDown": e.preventDefault(); video.volume = Math.max(video.volume - 0.1, 0); break;
        case "m": video.muted = !video.muted; break;
        case "f": toggleFullscreen(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => { if (playing) setShowControls(false); }, 3000);
  }, [playing]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    playing ? video.pause() : video.play();
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const v = parseFloat(e.target.value);
    video.volume = v;
    video.muted = v === 0;
  };

  const goTo = (ep: number) => navigate(`/anime/${url}/watch/${ep}`);

  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-main)" }}>
        <div className="fixed inset-0 -z-50 space-bg opacity-40" />
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--accent-primary)" }} />
      </div>
    );
  }

  if (!anime) return null;

  const downloadSrc = `/api/download/${url}/${currentEp}${server === "dub" ? "?server=dub" : ""}`;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      <div className="fixed inset-0 -z-50 space-bg opacity-40" />
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <Link
          to={`/anime/${url}`}
          className="inline-flex items-center gap-2 text-sm mb-4 hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {anime.title}
        </Link>

        {/* ── Custom Video Player ── */}
        <div
          ref={containerRef}
          className="relative w-full rounded-2xl overflow-hidden select-none"
          style={{ background: "#000", border: "1px solid var(--border-soft)", aspectRatio: "16/9" }}
          onMouseMove={resetControlsTimer}
          onMouseLeave={() => playing && setShowControls(false)}
          onMouseEnter={() => setShowControls(true)}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            style={{ cursor: "pointer" }}
          />

          {/* Big play/pause flash */}
          {!playing && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.3)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div
            className="absolute inset-x-0 bottom-0 transition-all duration-300"
            style={{
              opacity: showControls ? 1 : 0,
              pointerEvents: showControls ? "auto" : "none",
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
              padding: "48px 16px 14px",
            }}
          >
            {/* Episode title */}
            <div className="mb-2 px-1">
              <p className="text-sm font-semibold truncate" style={{ color: "#fff" }}>{anime.title}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Episode {currentEp}{anime.duration ? ` · ${anime.duration}` : ""}</p>
            </div>

            {/* Progress bar */}
            <div
              ref={progressRef}
              className="relative w-full mb-3 cursor-pointer group/progress"
              style={{ height: "4px" }}
              onClick={handleProgressClick}
              onMouseEnter={() => setSeeking(true)}
              onMouseLeave={() => setSeeking(false)}
            >
              <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${bufferedPct}%`, background: "rgba(255,255,255,0.35)" }} />
              <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${progressPct}%`, background: "var(--accent-primary)" }} />
              {/* Scrubber thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-transform"
                style={{
                  left: `${progressPct}%`,
                  transform: `translateX(-50%) translateY(-50%) scale(${seeking ? 1.4 : 1})`,
                  background: "var(--accent-primary)",
                  boxShadow: "0 0 6px rgba(158,240,255,0.8)",
                }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110" style={{ color: "#fff" }}>
                {playing
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                }
              </button>

              {/* Skip back 10s */}
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10); }} className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110" style={{ color: "#fff" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/><text x="9" y="15" fontSize="6" fill="currentColor" stroke="none">10</text></svg>
              </button>

              {/* Skip forward 10s */}
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 10); }} className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110" style={{ color: "#fff" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4.5"/><text x="9" y="15" fontSize="6" fill="currentColor" stroke="none">10</text></svg>
              </button>

              {/* Volume */}
              <div className="relative flex items-center gap-1" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
                <button onClick={toggleMute} className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110" style={{ color: "#fff" }}>
                  {muted || volume === 0
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2"/><line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2"/></svg>
                    : volume < 0.5
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                  }
                </button>
                <div className="overflow-hidden transition-all duration-200" style={{ width: showVolumeSlider ? "72px" : "0px" }}>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-cyan-300"
                    style={{ height: "3px" }}
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.8)" }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="flex-1" />

              {/* Sub/Dub */}
              <div className="flex gap-1">
                {anime.has_sub && (
                  <button onClick={() => setServer("sub")} className="text-xs font-bold px-2 py-0.5 rounded transition-all" style={{ background: server === "sub" ? "var(--accent-primary)" : "rgba(255,255,255,0.12)", color: server === "sub" ? "#000" : "#fff" }}>
                    SUB
                  </button>
                )}
                {anime.has_dub && (
                  <button onClick={() => setServer("dub")} className="text-xs font-bold px-2 py-0.5 rounded transition-all" style={{ background: server === "dub" ? "var(--accent-primary)" : "rgba(255,255,255,0.12)", color: server === "dub" ? "#000" : "#fff" }}>
                    DUB
                  </button>
                )}
              </div>

              {/* Prev/Next episode */}
              {currentEp > 1 && (
                <button onClick={() => goTo(currentEp - 1)} className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110" style={{ color: "#fff" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/></svg>
                </button>
              )}
              {currentEp < totalEps && (
                <button onClick={() => goTo(currentEp + 1)} className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110" style={{ color: "#fff" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/></svg>
                </button>
              )}

              {/* Download */}
              <a href={downloadSrc} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110" style={{ color: "#fff" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </a>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110" style={{ color: "#fff" }}>
                {fullscreen
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Episode grid */}
        {totalEps > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Episodes</h3>
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-16 gap-1.5">
              {Array.from({ length: totalEps }, (_, i) => i + 1).map((ep) => (
                <button
                  key={ep}
                  onClick={() => goTo(ep)}
                  className="rounded-lg py-2 text-xs font-semibold transition-all hover-lift"
                  style={{
                    background: ep === currentEp ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                    color: ep === currentEp ? "#000" : "var(--text-muted)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
