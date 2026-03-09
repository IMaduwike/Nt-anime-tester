import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Play, BookmarkPlus, TrendingUp } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Space Background */}
      <div className="fixed inset-0 -z-50 space-bg opacity-40"></div>

      {/* Gradient Orbs - Galaxy Effect */}
      <div className="fixed inset-0 -z-40 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-primary/15 rounded-full filter blur-3xl opacity-20"></div>
      </div>

      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Subtle additional glow */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-full filter blur-3xl"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Dive into a World of
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Anime Excellence
                  </span>
                </h1>
                <p className="text-lg text-foreground/80 max-w-md">
                  Explore the best anime, stream in HD, and keep track of your watchlist with ease.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Play className="w-5 h-5" />
                  Browse Anime
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-foreground/30 text-foreground hover:border-primary hover:text-primary"
                >
                  Create Account
                </Button>
              </div>

              {/* Recent Activity */}
              <div className="pt-4 space-y-3">
                <p className="text-sm text-foreground/60">Stay Eternally</p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground/70">Last updated 2 hours ago</span>
                </div>
              </div>
            </div>

            {/* Right - Featured Anime Card */}
            <div className="relative h-96 lg:h-full group">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-2xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Card */}
              <div className="relative h-full rounded-2xl border-2 border-primary/60 overflow-hidden bg-gradient-to-br from-card/70 to-card/30 backdrop-blur-xl p-6 flex flex-col justify-end shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-shadow duration-300">
                {/* Featured Image Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/10 to-card/50 rounded-2xl"></div>

                {/* Featured Content */}
                <div className="relative z-10 space-y-6">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-primary drop-shadow-lg">VINLAND SAGA</div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="inline-block px-3 py-1 bg-primary/30 text-primary text-xs font-semibold rounded-lg border border-primary/50 backdrop-blur-sm">
                      TV-MA
                    </span>
                    <div className="flex items-center gap-2 text-sm text-foreground/80 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                      <span>24 Episodes</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                      <span>★</span>
                      <span>9.0</span>
                    </div>
                  </div>

                  <p className="text-foreground/90 text-sm leading-relaxed max-w-xs">
                    Follow Thorfinn's epic journey of revenge and redemption in this masterpiece of anime storytelling.
                  </p>

                  <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/70 transition-shadow duration-300">
                    Continue Episode 3
                  </Button>
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
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Experience Anime Like Never Before
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Immerse yourself in a premium streaming experience where every episode is just a click away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stream in HD Card */}
            <div className="group relative rounded-xl border border-primary/50 bg-gradient-to-br from-card/70 to-card/30 backdrop-blur-xl p-8 hover:border-primary/80 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Stream in HD</h3>
                <p className="text-foreground/70">
                  Watch your favorite anime in stunning high definition, ad-free.
                </p>
              </div>
            </div>

            {/* Track Your Watchlist Card */}
            <div className="group relative rounded-xl border border-primary/50 bg-gradient-to-br from-card/70 to-card/30 backdrop-blur-xl p-8 hover:border-primary/80 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
                  <BookmarkPlus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Track Your Watchlist</h3>
                <p className="text-foreground/70">
                  Keep your watchlist organized and track your progress effortlessly.
                </p>
              </div>
            </div>

            {/* Discover Trending Card */}
            <div className="group relative rounded-xl border border-primary/50 bg-gradient-to-br from-card/70 to-card/30 backdrop-blur-xl p-8 hover:border-primary/80 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Discover Trending Shows</h3>
                <p className="text-foreground/70">
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
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Join Thousands of Anime Fans
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Our users love the streaming experience we provide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Stat 1 */}
            <div className="group relative rounded-xl border border-primary/50 bg-gradient-to-br from-card/70 to-card/30 backdrop-blur-xl p-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl font-bold text-primary mb-4 drop-shadow-lg">98%</div>
                <h3 className="text-xl font-bold mb-3">User Satisfaction</h3>
                <p className="text-foreground/70">
                  Our users love the streaming experience we provide.
                </p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="group relative rounded-xl border border-primary/50 bg-gradient-to-br from-card/70 to-card/30 backdrop-blur-xl p-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl font-bold text-primary mb-4 drop-shadow-lg">1M+</div>
                <h3 className="text-xl font-bold mb-3">Registered Users</h3>
                <p className="text-foreground/70">
                  Join a growing community of anime enthusiasts.
                </p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="group relative rounded-xl border border-primary/50 bg-gradient-to-br from-card/70 to-card/30 backdrop-blur-xl p-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl font-bold text-primary mb-4 drop-shadow-lg">500K+</div>
                <h3 className="text-xl font-bold mb-3">Episodes Watched Daily</h3>
                <p className="text-foreground/70">
                  Enjoy a vast library of episodes, updated regularly.
                </p>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="group relative rounded-xl border border-primary/50 bg-gradient-to-br from-card/70 to-card/30 backdrop-blur-xl p-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 overflow-hidden transition-shadow duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-8">Top Trending Anime</h3>
              <div className="flex items-end gap-4 h-48">
                {[
                  { name: "Naruto", value: 85 },
                  { name: "Jujutsu", value: 78 },
                  { name: "Howdy", value: 72 },
                  { name: "Aotic", value: 68 },
                  { name: "Trappers", value: 62 },
                ].map((anime) => (
                  <div key={anime.name} className="flex-1 flex flex-col items-center group/bar">
                    <div className="w-full bg-gradient-to-t from-primary via-primary/70 to-primary/40 rounded-t-lg transition-all hover:from-primary/90 hover:via-primary/80 hover:to-primary/50 shadow-lg shadow-primary/40 group-hover/bar:shadow-xl group-hover/bar:shadow-primary/60" style={{ height: `${anime.value * 2}px` }}></div>
                    <span className="text-xs text-foreground/60 mt-4 text-center">{anime.name}</span>
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
          <div className="w-96 h-96 bg-primary/20 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Begin Your Anime Adventure Today
          </h2>
          <p className="text-lg text-foreground/70 mb-10">
            Create your free account now and start streaming the top anime series.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/70 transition-shadow duration-300"
          >
            Create Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-foreground/70 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-foreground/70 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-foreground/70 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow</h4>
              <ul className="space-y-2 text-foreground/70 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-foreground/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-foreground/60 text-sm">
            <p>&copy; 2024 AnimeHub. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
