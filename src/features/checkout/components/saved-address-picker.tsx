"use client";

import Link from "next/link";

import type { SavedAddress } from "@/features/account/api/account.schema";
import { addressLine } from "@/features/account/lib/format";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

export const NEW_ADDRESS = "new";

/** Radio cards: each saved address (default first, as the API returns them) plus "a different address". */
export function SavedAddressPicker({
  addresses,
  value,
  onChange,
}: {
  addresses: SavedAddress[];
  value: string;
  onChange: (choice: string) => void;
}) {
  const { t } = useI18n();
  const card = (selected: boolean) =>
    cn(
      "flex cursor-pointer gap-3 border px-3.5 py-3 transition-colors",
      selected ? "border-[#C98B14] bg-[#FFF8E8]" : "border-line-strong hover:border-ink-faint",
    );

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-2.5 flex w-full items-center justify-between text-[12.5px] font-bold">
        {t.checkoutSavedAddresses}
        <Link href="/account/addresses" className="font-bold text-accent hover:underline">
          {t.checkoutManageAddresses}
        </Link>
      </legend>
      <div className="grid gap-2.5 md:grid-cols-2">
        {addresses.map((address) => (
          <label key={address.id} className={card(value === address.id)}>
            <input
              type="radio"
              name="savedAddress"
              value={address.id}
              checked={value === address.id}
              onChange={() => onChange(address.id)}
              className="mt-0.5 size-4 shrink-0 accent-[#C98B14]"
            />
            <span className="min-w-0 text-[12.5px] leading-5">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-black">{address.fullName}</span>
                {address.label ? (
                  <span className="border border-line px-1 text-[10.5px] text-ink-muted">
                    {address.label}
                  </span>
                ) : null}
                {address.isDefault ? (
                  <span className="bg-[#C98B14] px-1 text-[10px] font-bold text-white">
                    {t.account.addressDefault}
                  </span>
                ) : null}
              </span>
              <span className="block text-ink-body">{addressLine(address)}</span>
              <span className="block text-ink-muted">{address.phone}</span>
            </span>
          </label>
        ))}
        <label className={cn(card(value === NEW_ADDRESS), "items-center")}>
          <input
            type="radio"
            name="savedAddress"
            value={NEW_ADDRESS}
            checked={value === NEW_ADDRESS}
            onChange={() => onChange(NEW_ADDRESS)}
            className="size-4 shrink-0 accent-[#C98B14]"
          />
          <span className="text-[13px] font-bold">+ {t.checkoutUseNewAddress}</span>
        </label>
      </div>
    </fieldset>
  );
}
