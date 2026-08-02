import type { ComponentType, SVGProps } from "react";

import {
  GearIcon,
  HeadsetIcon,
  ShieldCheckIcon,
  SlidersIcon,
  SmileIcon,
  TruckIcon,
  YenIcon,
} from "@/components/ui/icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Icon sets for the repeated feature lists, indexed to match the dictionary
 * arrays they label.
 *
 * Shared because the hero side panel and the product page render the same set;
 * in the original they were two separate literals that had already drifted.
 */
export const BADGE_ICONS: readonly Icon[] = [
  ShieldCheckIcon,
  TruckIcon,
  HeadsetIcon,
  YenIcon,
];

export const TRUST_ICONS: readonly Icon[] = [
  ShieldCheckIcon,
  GearIcon,
  SlidersIcon,
  SmileIcon,
];

/** Circled numerals have no emoji presentation, so these stay as characters. */
export const STEP_GLYPHS = ["①", "②", "③"] as const;
