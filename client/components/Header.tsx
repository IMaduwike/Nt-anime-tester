import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-gradient-to-b from-background/90 to-background/50 backdrop-blur-xl border-b border-primary/40 z-50 shadow-lg shadow-primary/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg shadow-primary/50 group-hover:shadow-primary/80 transition-shadow duration-300">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">AnimeHub</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
            >
              Anime
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
            >
              Schedule
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
            >
              Browse
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
            >
              My List
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
            >
              FAQ
            </Link>
          </nav>

          {/* Create Account Button */}
          <Button
            variant="outline"
            className="text-foreground border-primary/50 hover:border-primary/80 hover:text-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            Create Account
          </Button>
        </div>
      </div>
    </header>
  );
}
