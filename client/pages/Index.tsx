import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Play, BookmarkPlus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Animated Space Background */}
      <div className="fixed inset-0 -z-50 space-bg opacity-40"></div>

      {/* Gradient Orbs - Galaxy Effect */}
      <div className="fixed inset-0 -z-40 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ background: 'rgba(158, 240, 255, 0.15)' }}></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full filter blur-3xl animate-pulse" style={{ background: 'rgba(158, 240, 255, 0.08)', animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ background: 'rgba(158, 240, 255, 0.1)', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full filter blur-3xl opacity-20" style={{ background: 'rgba(158, 240, 255, 0.2)' }}></div>
      </div>

      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Subtle additional glow */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl rounded-full filter blur-3xl" style={{ background: 'rgba(158, 240, 255, 0.08)' }}></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="font-bold leading-tight" style={{ color: 'var(--text-main)' }}>
                  Discover Your Next
                  <br />
                  <span style={{ color: 'var(--accent-primary)' }}>
                    Anime Obsession
                  </span>
                </h1>
                <p className="text-lg max-w-md" style={{ color: 'var(--text-muted)' }}>
                  Stream the best anime in HD, discover trending series, and manage your watchlist on NT Animes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/search">
                  <Button
                    size="lg"
                    className="btn btn-primary font-semibold w-full sm:w-auto"
                  >
                    <Play className="w-5 h-5" />
                    Browse Anime
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="btn btn-secondary"
                >
                  Create Account
                </Button>
              </div>

              {/* Recent Activity */}
              <div className="pt-4 space-y-3">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Updated Daily</p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-primary)' }}></div>
                  <span>New episodes added every day</span>
                </div>
              </div>
            </div>

            {/* Right - Featured Anime Card */}
            <div className="relative h-96 lg:h-full group hover-lift">
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'var(--accent-glow)' }}></div>

              {/* Card */}
              <div className="glass relative h-full rounded-2xl overflow-hidden p-6 flex flex-col justify-end shadow-2xl transition-shadow duration-300" style={{ borderColor: 'var(--accent-primary)', borderWidth: '2px' }}>
                {/* Featured Image Gradient Overlay */}
                <div className="absolute inset-0 rounded-2xl" style={{ background: `linear-gradient(to bottom, rgba(158, 240, 255, 0.15), rgba(158, 240, 255, 0.05), var(--bg-main))` }}></div>

                {/* Featured Content */}
                <div className="relative z-10 space-y-6">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold drop-shadow-lg" style={{ color: 'var(--accent-primary)' }}>VINLAND SAGA</div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm" style={{ background: 'rgba(158, 240, 255, 0.2)', color: 'var(--accent-primary)', border: `1px solid var(--accent-primary)` }}>
                      TV-MA
                    </span>
                    <div className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg backdrop-blur-sm" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                      <span>24 Episodes</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-lg backdrop-blur-sm" style={{ background: 'var(--bg-surface)', color: '#fbbf24' }}>
                      <span>★</span>
                      <span>9.0</span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-muted)' }}>
                    Follow Thorfinn's epic journey of revenge and redemption in this masterpiece of anime storytelling.
                  </p>

                  <Link to="/search?q=vinland-saga">
                    <Button className="w-full sm:w-auto btn btn-primary font-semibold shadow-lg transition-shadow duration-300" style={{ boxShadow: '0 0 30px var(--accent-glow)' }}>
                      Continue Episode 3
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Anime Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-bold mb-6" style={{ color: 'var(--text-main)' }}>
              Why Choose NT Animes?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              The ultimate anime streaming platform with the largest collection and best user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stream in HD Card */}
            <div className="glass group relative rounded-xl p-8 hover-lift overflow-hidden" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" style={{ background: 'var(--accent-glow)' }}></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow" style={{ background: 'rgba(158, 240, 255, 0.15)', color: 'var(--accent-primary)' }}>
                  <Play className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Stream in HD</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Watch your favorite anime in stunning high definition, ad-free.
                </p>
              </div>
            </div>

            {/* Track Your Watchlist Card */}
            <div className="glass group relative rounded-xl p-8 hover-lift overflow-hidden" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" style={{ background: 'var(--accent-glow)' }}></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow" style={{ background: 'rgba(158, 240, 255, 0.15)', color: 'var(--accent-primary)' }}>
                  <BookmarkPlus className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Track Your Watchlist</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Keep your watchlist organized and track your progress effortlessly.
                </p>
              </div>
            </div>

            {/* Discover Trending Card */}
            <div className="glass group relative rounded-xl p-8 hover-lift overflow-hidden" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" style={{ background: 'var(--accent-glow)' }}></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow" style={{ background: 'rgba(158, 240, 255, 0.15)', color: 'var(--accent-primary)' }}>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Discover Trending Shows</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Stay up-to-date with the hottest anime series selected just for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-bold mb-6" style={{ color: 'var(--text-main)' }}>
              Trusted by Anime Fans Worldwide
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              NT Animes is the preferred platform for anime enthusiasts everywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Stat 1 */}
            <div className="glass group relative rounded-xl p-8 hover-lift overflow-hidden" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" style={{ background: 'var(--accent-glow)' }}></div>
              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl font-bold mb-4 drop-shadow-lg" style={{ color: 'var(--accent-primary)' }}>98%</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-main)' }}>User Satisfaction</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Our users love the streaming experience we provide.
                </p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="glass group relative rounded-xl p-8 hover-lift overflow-hidden" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" style={{ background: 'var(--accent-glow)' }}></div>
              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl font-bold mb-4 drop-shadow-lg" style={{ color: 'var(--accent-primary)' }}>1M+</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-main)' }}>Registered Users</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Join a growing community of anime enthusiasts.
                </p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="glass group relative rounded-xl p-8 hover-lift overflow-hidden" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" style={{ background: 'var(--accent-glow)' }}></div>
              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl font-bold mb-4 drop-shadow-lg" style={{ color: 'var(--accent-primary)' }}>500K+</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-main)' }}>Episodes Watched Daily</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Enjoy a vast library of episodes, updated regularly.
                </p>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="glass group relative rounded-xl p-8 hover-lift overflow-hidden transition-shadow duration-300" style={{ borderColor: 'var(--border-soft)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" style={{ background: 'var(--accent-glow)' }}></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-8" style={{ color: 'var(--text-main)' }}>Top Trending Anime</h3>
              <div className="flex items-end gap-4 h-48">
                {[
                  { name: "Naruto", value: 85 },
                  { name: "Jujutsu", value: 78 },
                  { name: "Howdy", value: 72 },
                  { name: "Aotic", value: 68 },
                  { name: "Trappers", value: 62 },
                ].map((anime) => (
                  <div key={anime.name} className="flex-1 flex flex-col items-center group/bar">
                    <div className="w-full rounded-t-lg transition-all group-hover/bar:shadow-xl" style={{ height: `${anime.value * 2}px`, background: `linear-gradient(to top, var(--accent-primary), rgba(158, 240, 255, 0.7), rgba(158, 240, 255, 0.4))` }}></div>
                    <span className="text-xs mt-4 text-center" style={{ color: 'var(--text-muted)' }}>{anime.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
          <div className="w-96 h-96 rounded-full filter blur-3xl" style={{ background: 'var(--accent-glow)' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold mb-6" style={{ color: 'var(--text-main)' }}>
            Start Watching on NT Animes Today
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--text-muted)' }}>
            Join thousands of anime fans and stream thousands of episodes with NT Animes.
          </p>
          <Link to="/search">
            <Button
              size="lg"
              className="btn btn-primary font-semibold shadow-lg transition-shadow duration-300"
              style={{ boxShadow: '0 0 30px var(--accent-glow)' }}
            >
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8" style={{ borderTop: `1px solid var(--border-soft)` }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Features</a></li>
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Pricing</a></li>
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>About</a></li>
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Blog</a></li>
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Terms</a></li>
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Privacy</a></li>
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Follow</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Twitter</a></li>
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Discord</a></li>
                <li><a href="#" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-sm" style={{ borderTop: `1px solid var(--border-soft)`, color: 'var(--text-muted)' }}>
            <p>&copy; 2024 NT Animes. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="transition-colors">Terms</a>
              <a href="#" className="transition-colors">Privacy</a>
              <a href="#" className="transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
