"use client";

import Image from "next/image";

export default function HeroPosterMosaic() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 bg-[#131313]">
      <Image
        src="/cinecurator.jpg"
        alt="Background"
        fill
        className="object-cover opacity-60"
        priority
      />

      {/* Multi-layer dark overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #131313 0%, rgba(19,19,19,0.75) 40%, rgba(19,19,19,0.85) 100%)",
        }}
      />
      {/* Red vignette accent */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(229,9,20,0.08) 100%)",
        }}
      />
    </div>
  );
}

