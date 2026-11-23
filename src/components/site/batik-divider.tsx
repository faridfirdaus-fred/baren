import React from "react";

interface BatikDividerProps {
  className?: string;
}

/**
 * Pita ornamen batik Nusantara tradisional.
 * Memisahkan antar-seksi landing page dengan motif kawung geometris terracotta & emas.
 */
export function BatikDivider({ className = "" }: BatikDividerProps) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`relative w-full h-4 sm:h-5 bg-[#c83820] border-y border-[#f59e0b]/90 overflow-hidden ${className}`}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="batik-pattern"
            width="32"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            {/* Motif dasar kawung diamond */}
            <path
              d="M16 2 L30 10 L16 18 L2 10 Z"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.2"
            />
            {/* Diamond bagian dalam */}
            <path
              d="M16 5 L23 10 L16 15 L9 10 Z"
              fill="rgba(245, 158, 11, 0.2)"
              stroke="#faf6ee"
              strokeWidth="0.8"
            />
            {/* Titik bunga pusat */}
            <circle cx="16" cy="10" r="1.5" fill="#faf6ee" />
            {/* Aksen sudut kawung */}
            <path d="M0 2 L6 6 L0 10 Z" fill="rgba(250, 246, 238, 0.25)" />
            <path d="M32 2 L26 6 L32 10 Z" fill="rgba(250, 246, 238, 0.25)" />
            <path d="M0 10 L6 14 L0 18 Z" fill="rgba(250, 246, 238, 0.25)" />
            <path d="M32 10 L26 14 L32 18 Z" fill="rgba(250, 246, 238, 0.25)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#batik-pattern)" />
      </svg>
    </div>
  );
}
