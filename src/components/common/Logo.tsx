export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="nexa-g" x1="8" y1="6" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="oklch(0.42 0.09 210)" />
          <stop offset="0.55" stopColor="oklch(0.55 0.12 200)" />
          <stop offset="1" stopColor="oklch(0.78 0.13 80)" />
        </linearGradient>
        <linearGradient id="nexa-mark" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0.98" />
          <stop offset="1" stopColor="white" stopOpacity="0.78" />
        </linearGradient>
      </defs>
      <path
        d="M32 3 L58 12 V32 C58 48 46 58 32 61 C18 58 6 48 6 32 V12 Z"
        fill="url(#nexa-g)"
      />
      <path
        d="M32 8 L53 15 V32 C53 45 43 53 32 56 C21 53 11 45 11 32 V15 Z"
        fill="none"
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <path
        d="M22 42 V22 L32 34 L42 22 V42"
        stroke="url(#nexa-mark)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="46" cy="20" r="3.2" fill="oklch(0.82 0.14 80)" />
    </svg>
  );
}
