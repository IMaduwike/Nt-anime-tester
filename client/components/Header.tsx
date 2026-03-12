import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="nav fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group hover-lift">
            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300" style={{ background: 'var(--accent-primary)' }}>
              <span className="text-xs font-bold text-black">NT</span>
            </div>
            <span className="text-xl font-bold hidden sm:inline" style={{ color: 'var(--text-main)' }}>NT Animes</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-main)' }}
            >
              Home
            </Link>
            <Link
              to="/search"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-main)' }}
            >
              Anime
            </Link>
            <Link
              to="/search"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-main)' }}
            >
              Schedule
            </Link>
            <Link
              to="/search"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-main)' }}
            >
              Browse
            </Link>
            <Link
              to="/"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-main)' }}
            >
              My List
            </Link>
            <Link
              to="/"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-main)' }}
            >
              FAQ
            </Link>
          </nav>

          {/* Create Account Button */}
          <Button
            variant="outline"
            className="btn btn-secondary transition-all duration-300"
          >
            Create Account
          </Button>
        </div>
      </div>
    </header>
  );
}
