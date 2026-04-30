"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState<string>("/");

  useEffect(() => {
    // If not on home page, use the actual pathname
    if (pathname !== "/") {
      setActiveHash(pathname);
      return;
    }

    // On home page, calculate scroll position for active section
    const handleScroll = () => {
      const suggestionsElem = document.getElementById("top-suggestions");
      const genresElem = document.getElementById("genres");
      
      const scrollY = window.scrollY;
      // Add a 200px offset so it highlights soon as the section scrolls into view
      const suggestionsTop = suggestionsElem ? suggestionsElem.offsetTop - 200 : Infinity;
      const genresTop = genresElem ? genresElem.offsetTop - 200 : Infinity;

      if (scrollY >= genresTop) {
        setActiveHash("/#genres");
      } else if (scrollY >= suggestionsTop) {
        setActiveHash("/#top-suggestions");
      } else {
        setActiveHash("/");
      }
    };

    handleScroll(); // Initial check
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Suggestions", href: "/#top-suggestions" },
    { name: "Genres", href: "/#genres" },
    { name: "Library", href: "/library" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-6 md:px-8 h-20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <span className="font-headline font-black tracking-tighter text-[#e50914] text-2xl md:text-3xl">
          CineCurator
        </span>
      </Link>

      {/* Center Nav */}
      <div className="hidden md:flex items-center gap-8 font-headline tracking-tight absolute left-1/2 -translate-x-1/2">
        {navLinks.map((link) => {
          const isActive = activeHash === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-all text-sm font-semibold pb-1 ${
                isActive
                  ? "text-white border-b-2 border-[#e50914]"
                  : "text-[#e5e2e1]/70 hover:text-white border-b-2 border-transparent"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {!loading && (
          <>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:block text-xs text-[#e5e2e1]/60 font-body truncate max-w-[160px]">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-surface-container-high border border-white/10 text-[#e5e2e1] px-4 py-2 rounded-md font-bold text-xs hover:bg-surface-container-highest transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="bg-primary-container text-white px-5 py-2 rounded-md font-bold text-sm hover:bg-[#ff0b1a] transition-colors"
              >
                Sign In
              </Link>
            )}
          </>
        )}

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#131313] border-b border-white/10 p-6 flex flex-col gap-4">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-white font-semibold">Home</Link>
          <Link href="/#top-suggestions" onClick={() => setMenuOpen(false)} className="text-[#e5e2e1]/70">Suggestions</Link>
          <Link href="/library" onClick={() => setMenuOpen(false)} className="text-[#e5e2e1]/70">Library</Link>
        </div>
      )}
    </nav>
  );
}
