import type { SVGProps } from "react";

/** أيقونات SVG داخلية خفيفة (بدون مكتبات أيقونات خارجية) */
type Props = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function CartIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.55h7.9a2 2 0 0 0 1.95-1.57L21 8H6" />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  );
}

export function SearchIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function MenuIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function StarIcon(props: Props) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17.05l-5.25 2.7 1-5.85L3.5 9.75l5.9-.85z" />
    </svg>
  );
}

export function WhatsAppIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor" aria-hidden {...props}>
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.33 4.94L2 22l5.35-1.4a9.8 9.8 0 0 0 4.69 1.2c5.44 0 9.84-4.4 9.84-9.84S17.48 2 12.04 2Zm0 17.98a8 8 0 0 1-4.2-1.2l-.3-.18-3.17.83.84-3.1-.2-.32a8.13 8.13 0 0 1-1.25-4.3c0-4.5 3.67-8.16 8.18-8.16 4.5 0 8.16 3.66 8.16 8.16 0 4.5-3.66 8.17-8.16 8.17Zm4.5-6.1c-.25-.13-1.46-.72-1.68-.8-.23-.09-.39-.13-.55.12s-.63.8-.77.97c-.14.16-.28.18-.53.06-.25-.13-1.04-.39-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.17 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

export function ChevronIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function TruckIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7h10v9H3zM13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

export function ShieldIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function HeadsetIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19a3 3 0 0 1-3 3h-3" />
    </svg>
  );
}

export function WalletIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1" />
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <circle cx="16.5" cy="13.5" r="1.2" />
    </svg>
  );
}

export function PinIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function PhoneIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4h3l1.6 4-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 6.2 2 2 0 0 1 5.5 4Z" />
    </svg>
  );
}

export function MailIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}
