export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lfg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="oklch(0.48 0.16 260)" />
          <stop offset="1" stopColor="oklch(0.68 0.18 265)" />
        </linearGradient>
      </defs>
      <path
        d="M32 4 L56 12 V30 C56 46 44 56 32 60 C20 56 8 46 8 30 V12 Z"
        fill="url(#lfg)"
      />
      <path
        d="M22 24 H42 A4 4 0 0 1 46 28 V36 A4 4 0 0 1 42 40 H30 L24 46 V40 H22 A4 4 0 0 1 18 36 V28 A4 4 0 0 1 22 24 Z"
        fill="white"
      />
      <path
        d="M32 28 L34 32 L38 33 L35 36 L36 40 L32 38 L28 40 L29 36 L26 33 L30 32 Z"
        fill="oklch(0.7 0.17 155)"
      />
    </svg>
  );
}
