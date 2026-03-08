import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Play, BookmarkPlus, TrendingUp } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Background gradient effect */}
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl"></div>
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
            <div className="relative h-96 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl"></div>
              <div className="relative h-full rounded-2xl border border-foreground/10 overflow-hidden bg-card/50 backdrop-blur p-6 flex flex-col justify-end">
                {/* Featured Image Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-card/30 to-card rounded-2xl"></div>

                {/* Featured Content */}
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-4 text-primary">VINLAND SAGA</div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded border border-primary/30">
                      TV-MA
                    </span>
                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                      <span>24 Episodes</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <span>★</span>
                      <span>9.0</span>
                    </div>
                  </div>

                  <p className="text-foreground/80 text-sm mb-6 leading-relaxed">
                    Follow Thorfinn's epic journey of revenge and redemption in this masterpiece of anime storytelling.
                  </p>

                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Continue Episode 3
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Anime Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
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
            <div className="group relative rounded-xl border border-foreground/10 bg-card/50 backdrop-blur p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Stream in HD</h3>
                <p className="text-foreground/70">
                  Watch your favorite anime in stunning high definition, ad-free.
                </p>
              </div>
            </div>

            {/* Track Your Watchlist Card */}
            <div className="group relative rounded-xl border border-foreground/10 bg-card/50 backdrop-blur p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                  <BookmarkPlus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Track Your Watchlist</h3>
                <p className="text-foreground/70">
                  Keep your watchlist organized and track your progress effortlessly.
                </p>
              </div>
            </div>

            {/* Discover Trending Card */}
            <div className="group relative rounded-xl border border-foreground/10 bg-card/50 backdrop-blur p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
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
            <div className="rounded-xl border border-foreground/10 bg-card/50 backdrop-blur p-8">
              <div className="text-5xl sm:text-6xl font-bold text-primary mb-4">98%</div>
              <h3 className="text-xl font-bold mb-3">User Satisfaction</h3>
              <p className="text-foreground/70">
                Our users love the streaming experience we provide.
              </p>
            </div>

            {/* Stat 2 */}
            <div className="rounded-xl border border-foreground/10 bg-card/50 backdrop-blur p-8">
              <div className="text-5xl sm:text-6xl font-bold text-primary mb-4">1M+</div>
              <h3 className="text-xl font-bold mb-3">Registered Users</h3>
              <p className="text-foreground/70">
                Join a growing community of anime enthusiasts.
              </p>
            </div>

            {/* Stat 3 */}
            <div className="rounded-xl border border-foreground/10 bg-card/50 backdrop-blur p-8">
              <div className="text-5xl sm:text-6xl font-bold text-primary mb-4">500K+</div>
              <h3 className="text-xl font-bold mb-3">Episodes Watched Daily</h3>
              <p className="text-foreground/70">
                Enjoy a vast library of episodes, updated regularly.
              </p>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="rounded-xl border border-foreground/10 bg-card/50 backdrop-blur p-8">
            <h3 className="text-xl font-bold mb-8">Top Trending Anime</h3>
            <div className="flex items-end gap-4 h-48">
              {[
                { name: "Naruto", value: 85 },
                { name: "Jujutsu", value: 78 },
                { name: "Howdy", value: 72 },
                { name: "Aotic", value: 68 },
                { name: "Trappers", value: 62 },
              ].map((anime) => (
                <div key={anime.name} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all hover:from-primary/80 hover:to-primary/40" style={{ height: `${anime.value * 2}px` }}></div>
                  <span className="text-xs text-foreground/60 mt-4 text-center">{anime.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Begin Your Anime Adventure Today
          </h2>
          <p className="text-lg text-foreground/70 mb-10">
            Create your free account now and start streaming the top anime series.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
