import type { SVGProps } from "react";

/**
 * Inline SVGs from the original markup, extracted so they can be reused and so
 * a stroke-width tweak happens in one place. `aria-hidden` because every icon
 * here sits next to a text label or an `aria-label` on the control.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
  ...props,
});

export function SearchIcon(props: IconProps) {
  return (
    <svg width={15} height={15} {...base(props)}>
      <circle cx={11} cy={11} r={7} stroke="currentColor" strokeWidth={2} />
      <line
        x1={21}
        y1={21}
        x2={16.5}
        y2={16.5}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg width={18} height={18} {...base(props)}>
      <circle cx={12} cy={8} r={4} stroke="currentColor" strokeWidth={2} />
      <path
        d="M4 20c0-4 4-6 8-6s8 2 8 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg width={20} height={20} {...base(props)}>
      <path
        d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={9} cy={21} r={1.4} fill="currentColor" />
      <circle cx={18} cy={21} r={1.4} fill="currentColor" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Feature glyphs.
 * The original used bare characters (☎, ⚙, ☺) for these. Several of them have
 * an emoji presentation, so platforms substituted a full-colour emoji for what
 * was meant to be a typographic mark — the phone rendered bright red. Real SVGs
 * render identically everywhere and inherit `currentColor`.
 * ------------------------------------------------------------------------ */

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg width={18} height={18} {...base(props)}>
      <path
        d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6l7-3z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg width={18} height={18} {...base(props)}>
      <path
        d="M3 7h10v9H3zM13 10h4l3 3v3h-7z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <circle cx={7} cy={18} r={1.8} stroke="currentColor" strokeWidth={1.8} />
      <circle cx={17} cy={18} r={1.8} stroke="currentColor" strokeWidth={1.8} />
    </svg>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <svg width={18} height={18} {...base(props)}>
      <path
        d="M5 14v-2a7 7 0 0 1 14 0v2"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <rect x={3} y={13} width={4} height={6} rx={1.6} stroke="currentColor" strokeWidth={1.8} />
      <rect x={17} y={13} width={4} height={6} rx={1.6} stroke="currentColor" strokeWidth={1.8} />
    </svg>
  );
}

export function YenIcon(props: IconProps) {
  return (
    <svg width={18} height={18} {...base(props)}>
      <path
        d="M7 5l5 7 5-7M12 12v7M8 13h8M8 16h8"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <svg width={18} height={18} {...base(props)}>
      <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
      <path
        d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <svg width={18} height={18} {...base(props)}>
      <path
        d="M5 6h14M5 12h14M5 18h14"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <circle cx={9} cy={6} r={2} fill="currentColor" />
      <circle cx={15} cy={12} r={2} fill="currentColor" />
      <circle cx={8} cy={18} r={2} fill="currentColor" />
    </svg>
  );
}

export function SmileIcon(props: IconProps) {
  return (
    <svg width={18} height={18} {...base(props)}>
      <circle cx={12} cy={12} r={8.5} stroke="currentColor" strokeWidth={1.8} />
      <path
        d="M8.5 13.5a4.2 4.2 0 0 0 7 0"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <circle cx={9.5} cy={10} r={1} fill="currentColor" />
      <circle cx={14.5} cy={10} r={1} fill="currentColor" />
    </svg>
  );
}

export function BlossomCluster(props: IconProps) {
  return (
    <svg viewBox="0 0 200 200" width={220} height={220} aria-hidden {...props}>
      <circle cx={40} cy={50} r={10} fill="oklch(85% 0.05 350)" />
      <circle cx={70} cy={30} r={7} fill="oklch(85% 0.05 350)" />
      <circle cx={100} cy={60} r={9} fill="oklch(85% 0.05 350 / 0.7)" />
      <circle cx={60} cy={80} r={6} fill="oklch(85% 0.05 350 / 0.6)" />
      <circle cx={30} cy={100} r={8} fill="oklch(85% 0.05 350 / 0.5)" />
    </svg>
  );
}
