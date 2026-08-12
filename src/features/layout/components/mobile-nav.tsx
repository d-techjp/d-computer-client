"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ChevronRightIcon, CloseIcon, MenuIcon, PhoneIcon, UserIcon } from "@/components/ui/icons";
import type { CategoryNode } from "@/features/catalog/tree";
import { categoryHref } from "@/features/products/filters";
import { useDismissable } from "@/hooks/use-dismissable";
import { useI18n } from "@/i18n/i18n-provider";

import { useIsPanelOpen, useUiStore } from "../store/ui.store";

/**
 * The navigation below `lg`, where six inline links plus a search field plus a
 * cart cannot share one row without wrapping into an unusable pile.
 *
 * It shares the single-panel UI store with the cart and search dropdowns, so
 * opening the menu closes whatever else was open — the invariant that would be
 * easy to break with a boolean per overlay. Outside-click and Escape come from
 * `useDismissable`, the same hook every other overlay on the site uses.
 *
 * It also carries the catalogue tree, because the header's category menu is
 * desktop-only: that menu opens on hover, which a touch screen does not have.
 * Here the same categories are `<details>` disclosures instead — tap to expand,
 * tap the heading to browse the whole branch.
 */
export function MobileNav({ categories }: { categories: CategoryNode[] }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();

  const open = useIsPanelOpen("nav");
  const toggle = useUiStore((state) => state.toggle);
  const close = useUiStore((state) => state.close);

  const panelRef = useDismissable<HTMLElement>(open, close);

  // A tap that navigates must also dismiss the sheet; without this the new page
  // renders underneath a menu that is still covering it.
  useEffect(() => {
    close();
  }, [pathname, close]);

  // The sheet covers the viewport — letting the page scroll behind it is the
  // classic mobile bug where dismissing it leaves you somewhere else entirely.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => toggle("nav")}
        aria-expanded={open}
        aria-label={t.menu}
        className="flex cursor-pointer items-center justify-center text-ink transition-colors hover:text-accent lg:hidden"
      >
        <MenuIcon />
      </button>

      {open ? (
        <div className="fixed inset-0 z-60 bg-ink-strong/40 lg:hidden">
          <nav
            ref={panelRef}
            aria-label={t.menu}
            // Slides in from the left, the edge its trigger sits on — a sheet
            // that flies in from the opposite side of the button you pressed
            // reads as a different surface entirely.
            className="absolute inset-y-0 left-0 flex w-[82vw] max-w-80 flex-col overflow-y-auto bg-surface shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <span className="text-sm font-black">{t.categoryRailTitle}</span>
              <button
                type="button"
                onClick={close}
                aria-label={t.menuClose}
                className="cursor-pointer text-ink-muted transition-colors hover:text-accent"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex flex-col px-2 py-2">
              <CategoryBranch nodes={categories} onNavigate={close} />

              <Link
                href={`/${locale}/products`}
                onClick={close}
                className="mt-1 rounded-lg px-3 py-3 text-[13px] font-bold text-accent transition-colors hover:bg-mist"
              >
                {t.categoryRailAll} <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="mt-auto border-t border-line-soft px-5 py-4">
              <button
                type="button"
                className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:text-accent"
              >
                <UserIcon />
                {t.login}
              </button>

              <a
                href={`tel:${t.phone.replace(/-/g, "")}`}
                className="flex items-center gap-2 text-[13px] text-ink-muted transition-colors hover:text-accent"
              >
                <PhoneIcon />
                {t.phone}
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}

/**
 * One level of the category tree, rendering itself for each level below.
 *
 * Recursion rather than a hand-written two-level list because the catalogue is
 * allowed to nest arbitrarily: a branch three or four deep renders the same way
 * a shallow one does, and adding a level in the admin needs no change here.
 *
 * A node with children is a `<details>` disclosure whose chevron points right
 * when collapsed and down when open — native, so the open/closed state survives
 * without a line of JavaScript or a piece of React state per row. Its heading
 * is not itself a link: on touch, one target cannot both expand and navigate,
 * so browsing the whole branch is the explicit "view all" row inside it.
 */
function CategoryBranch({
  nodes,
  onNavigate,
}: {
  nodes: CategoryNode[];
  onNavigate: () => void;
}) {
  const { locale, t } = useI18n();

  return nodes.map((node) =>
    node.children.length === 0 ? (
      <Link
        key={node.id}
        href={categoryHref(locale, node.id)}
        onClick={onNavigate}
        className="truncate rounded-lg px-3 py-2.5 text-[13.5px] text-ink-body transition-colors hover:bg-mist hover:text-accent"
      >
        {node.name}
      </Link>
    ) : (
      <details key={node.id} className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors marker:content-none hover:bg-mist [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1 truncate">{node.name}</span>
          <ChevronRightIcon
            className="size-4 flex-none text-ink-faint transition-transform duration-200 group-open:rotate-90"
            aria-hidden
          />
        </summary>

        {/* The rule down the left edge is what keeps a four-deep branch
            readable — indentation alone stops reading as hierarchy. */}
        <div className="ml-3 flex flex-col border-l border-line-soft pb-1 pl-2">
          <Link
            href={categoryHref(locale, node.id)}
            onClick={onNavigate}
            className="rounded-lg px-3 py-2 text-[12.5px] font-bold text-accent transition-colors hover:bg-mist"
          >
            {t.categoryMenuViewAll.replace("{name}", node.name)}
          </Link>

          <CategoryBranch nodes={node.children} onNavigate={onNavigate} />
        </div>
      </details>
    ),
  );
}
