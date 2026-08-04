/**
 * Inline SVG icon set — no icon dependency needed. All icons inherit
 * `currentColor` and accept a className for sizing.
 */

import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const UserIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.4-3.2 4.2-5 7.5-5s6.1 1.8 7.5 5" />
  </svg>
);

export const HeartIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.4 4.8 6.7 4.8c2 0 3.6 1.1 4.3 2.6.4.8 1.6.8 2 0 .7-1.5 2.3-2.6 4.3-2.6 3.3 0 5.2 3.2 4 6.5-1.8 4.6-9.3 9.2-9.3 9.2Z" />
  </svg>
);

export const BagIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 8h13l-1 12.5a1.6 1.6 0 0 1-1.6 1.5H8.1a1.6 1.6 0 0 1-1.6-1.5Z" />
    <path d="M8.8 8V6.6a3.2 3.2 0 0 1 6.4 0V8" />
  </svg>
);

export const MenuIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 5 14 14M19 5 5 19" />
  </svg>
);

export const ChevronDownIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronRightIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const ArrowRightIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h16m0 0-6-6m6 6-6 6" />
  </svg>
);

export const PhoneIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const MailIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4.5 7 7.5 6 7.5-6" />
  </svg>
);

export const MapPinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const StarIcon = (p: P) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}>
    <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9Z" />
  </svg>
);

export const RefreshIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 12a8 8 0 1 1-2.3-5.6M20 3.5V8h-4.5" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const QuoteIcon = (p: P) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}>
    <path d="M10.2 5.5c-3.6 1.6-5.7 4.3-5.7 8.2v4.8h6v-6H6.9c0-2.5 1.4-4.3 3.9-5.4Zm9 0c-3.6 1.6-5.7 4.3-5.7 8.2v4.8h6v-6h-3.6c0-2.5 1.4-4.3 3.9-5.4Z" />
  </svg>
);

export const ShieldIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 5 5.8v5.4c0 4.6 3 8 7 9.8 4-1.8 7-5.2 7-9.8V5.8Z" />
    <path d="m8.8 11.8 2.2 2.2 4.2-4.4" />
  </svg>
);

export const ExchangeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5" />
    <path d="M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5" />
  </svg>
);

export const GemIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4h10l4 5-9 11L3 9Zm-4 5h18M12 20 8 9l2-5m2 16 4-11-2-5" />
  </svg>
);

export const TruckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17.5" cy="18" r="1.8" />
  </svg>
);

export const InstagramIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const FacebookIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5H17L17.5 11h-3v-2a1 1 0 0 1 1-.5Z" />
  </svg>
);

export const YoutubeIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="6" width="18" height="12.5" rx="3.5" />
    <path d="m10.5 9.8 4.5 2.7-4.5 2.7Z" fill="currentColor" />
  </svg>
);

export const WhatsAppIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5a8.4 8.4 0 0 0-7.2 12.7L3.5 20.5l4.4-1.2A8.4 8.4 0 1 0 12 3.5Z" />
    <path d="M9 8.8c-.2 2 1.5 4.6 3.9 6 1.2.7 2 .6 2.5.3.5-.3.8-1 .5-1.6l-1.4-1.3c-.3-.2-.6-.2-.9.1l-.5.5c-.2.2-.5.2-.7 0a5.6 5.6 0 0 1-1.9-1.9 5.6 5.6 0 0 1 0-.7l.5-.5c.3-.3.3-.6.1-.9L9.6 8.3c-.6-.3-1.3 0-1.6.5Z" />
  </svg>
);

export const RupeeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4.5h10M7 9h10M17 4.5c-3.5.2-5.5 1.4-5.5 4.5 0 1.8 1.4 3 3 3.5L10 20.5" />
  </svg>
);

export const LockIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    <circle cx="12" cy="15.2" r="1.4" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 7h15M9.5 7V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3V7M6.5 7l.8 12a1.8 1.8 0 0 0 1.8 1.7h5.8a1.8 1.8 0 0 0 1.8-1.7l.8-12" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
