export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="nexa-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="oklch(0.32 0.06 210)" />
          <stop offset="0.55" stopColor="oklch(0.55 0.12 200)" />
          <stop offset="1" stopColor="oklch(0.82 0.14 80)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#nexa-g)" />
      <path
        d="M20 46 V18 L44 40 V18"
        stroke="white"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="46" cy="20" r="3" fill="oklch(0.88 0.13 85)" />
    </svg>
  );
}
