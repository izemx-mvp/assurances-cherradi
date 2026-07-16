export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.jpg"
      width={size}
      height={size}
      alt="Nexa Assurances"
      className={`rounded-lg object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
