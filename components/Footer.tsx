import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#131313] w-full py-12 px-8 border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-3 mb-6 md:mb-0">
          <span className="text-xl font-black tracking-tighter text-[#e50914] font-headline">
            CineCurator
          </span>
          <p className="font-body text-xs uppercase tracking-widest opacity-50 text-[#e9bcb6]">
            © 2025 CineCurator Editorial. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-10 font-body text-xs uppercase tracking-widest">
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[#e9bcb6] opacity-60 hover:text-[#e50914] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[#e9bcb6] opacity-60 hover:text-[#e50914] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
