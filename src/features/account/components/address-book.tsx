"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";
import { toApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";

import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "../api/account.repository";
import type { SavedAddress } from "../api/account.schema";
import { addressLine, fieldClass } from "../lib/format";
import { AddressFields, EMPTY_ADDRESS, type AddressFieldsValue } from "./address-fields";
import { PanelHeading } from "./panel-heading";

const MAX_ADDRESSES = 10;

type Editing = { id: string | null; label: string; fields: AddressFieldsValue; isDefault: boolean };

export function AddressBook() {
  const { t } = useI18n();
  const showToast = useUiStore((state) => state.showToast);
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () =>
    listAddresses()
      .then(setAddresses)
      .catch(() => setFailed(true));

  useEffect(() => {
    void reload();
  }, []);

  const run = async (action: () => Promise<unknown>, success?: string) => {
    setBusy(true);
    try {
      await action();
      await reload();
      if (success) showToast(success);
      return true;
    } catch (cause) {
      showToast(toApiError(cause).message || t.account.loadError, "error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || busy) return;
    const input = {
      ...editing.fields,
      label: editing.label.trim(),
      ...(editing.isDefault ? { isDefault: true } : {}),
    };
    const ok = await run(
      () => (editing.id ? updateAddress(editing.id, input) : createAddress(input)),
      t.account.saved,
    );
    if (ok) setEditing(null);
  };

  if (failed) {
    return <p className="py-10 text-center text-[13px] text-ink-muted">{t.account.loadError}</p>;
  }
  if (!addresses) {
    return <p className="py-10 text-center text-[13px] text-ink-muted">{t.account.loading}</p>;
  }

  const canAdd = addresses.length < MAX_ADDRESSES;

  return (
    <section>
      <PanelHeading
        title={t.account.addressesTitle}
        description={t.account.addressesDesc}
        action={
          !editing && canAdd ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setEditing({
                  id: null,
                  label: "",
                  fields: EMPTY_ADDRESS,
                  isDefault: addresses.length === 0,
                })
              }
            >
              + {t.account.addressAdd}
            </Button>
          ) : null
        }
      />

      {editing ? (
        <form
          onSubmit={(event) => void onSave(event)}
          className="mb-6 border border-[#C98B14]/40 bg-[#FFFCF5] p-4 md:p-5"
        >
          <h3 className="mb-4 text-[14px] font-black">
            {editing.id ? t.account.addressEditTitle : t.account.addressNewTitle}
          </h3>
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[12.5px] font-bold">
                {t.account.addressLabel}
                <span className="ml-1 font-normal text-ink-faint">({t.checkoutOptional})</span>
              </span>
              <input
                value={editing.label}
                onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                placeholder={t.account.addressLabelHint}
                maxLength={50}
                disabled={busy}
                className={cn(fieldClass, "sm:max-w-xs")}
              />
            </label>
            <AddressFields
              value={editing.fields}
              onChange={(fields) => setEditing({ ...editing, fields })}
              disabled={busy}
            />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={editing.isDefault}
              onChange={(event) => setEditing({ ...editing, isDefault: event.target.checked })}
              disabled={busy || (editing.id !== null && editing.isDefault && isCurrentDefault(addresses, editing.id))}
              className="size-4 accent-[#C98B14]"
            />
            {t.account.addressSetAsDefault}
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
              {t.account.cancel}
            </Button>
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? t.account.saving : t.account.save}
            </Button>
          </div>
        </form>
      ) : null}

      {addresses.length === 0 && !editing ? (
        <p className="border border-line px-5 py-10 text-center text-[13.5px] text-ink-muted">
          {t.account.addressesEmpty}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={cn(
                "flex flex-col border p-4",
                address.isDefault ? "border-[#C98B14] bg-[#FFFCF5]" : "border-line",
              )}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-[13.5px] font-black">{address.fullName}</span>
                {address.label ? (
                  <span className="border border-line px-1.5 text-[11px] text-ink-muted">
                    {address.label}
                  </span>
                ) : null}
                {address.isDefault ? (
                  <span className="ml-auto bg-[#C98B14] px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                    {t.account.addressDefault}
                  </span>
                ) : null}
              </div>
              <p className="text-[12.5px] leading-5 text-ink-body">{addressLine(address)}</p>
              <p className="text-[12.5px] text-ink-muted">{address.phone}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line-soft pt-2.5 text-[12px] font-bold">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setEditing({
                      id: address.id,
                      label: address.label ?? "",
                      isDefault: address.isDefault,
                      fields: {
                        fullName: address.fullName,
                        phone: address.phone,
                        province: address.province,
                        district: address.district ?? "",
                        ward: address.ward ?? "",
                        street: address.street,
                      },
                    })
                  }
                  className="cursor-pointer text-accent hover:underline"
                >
                  {t.account.addressEdit}
                </button>
                {!address.isDefault ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void run(() => setDefaultAddress(address.id), t.account.saved)}
                    className="cursor-pointer text-ink-muted hover:text-accent"
                  >
                    {t.account.addressMakeDefault}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(t.account.addressDeleteConfirm)) {
                      void run(() => deleteAddress(address.id), t.account.addressDeleted);
                    }
                  }}
                  className="ml-auto cursor-pointer text-ink-faint hover:text-[#B42318]"
                >
                  {t.account.addressDelete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** The current default can't be "unset" — another address has to take its place. */
function isCurrentDefault(addresses: SavedAddress[], id: string): boolean {
  return addresses.some((address) => address.id === id && address.isDefault);
}
