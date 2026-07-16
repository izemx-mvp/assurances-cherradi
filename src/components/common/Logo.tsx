const LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE12kwyUCRsefcRy0LVN02eMVAsANhN1XygR-sJMm4ag&s";

export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={LOGO_URL}
      alt="Nexa Assurances"
      className={`rounded-lg object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
