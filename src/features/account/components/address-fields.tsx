"use client";

import type { ChangeEvent } from "react";

import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

import { fieldClass } from "../lib/format";

export type AddressFieldsValue = {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
};

export const EMPTY_ADDRESS: AddressFieldsValue = {
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  street: "",
};

type FieldKey = keyof AddressFieldsValue;

const FIELDS: Array<{
  key: FieldKey;
  autoComplete: string;
  min?: number;
  max: number;
  required?: boolean;
  wide?: boolean;
  tel?: boolean;
}> = [
  { key: "fullName", autoComplete: "name", min: 2, max: 150, required: true },
  { key: "phone", autoComplete: "tel", min: 9, max: 20, required: true, tel: true },
  { key: "province", autoComplete: "address-level1", min: 2, max: 150, required: true },
  { key: "district", autoComplete: "address-level2", max: 150 },
  { key: "ward", autoComplete: "address-level3", max: 150 },
  { key: "street", autoComplete: "street-address", min: 3, max: 255, required: true, wide: true },
];

/**
 * The delivery-address inputs shared by the address book and checkout, with
 * the same limits as the backend's address DTOs.
 */
export function AddressFields({
  value,
  onChange,
  disabled,
}: {
  value: AddressFieldsValue;
  onChange: (next: AddressFieldsValue) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const labels: Record<FieldKey, string> = {
    fullName: t.checkoutFullName,
    phone: t.checkoutPhone,
    province: t.checkoutProvince,
    district: t.checkoutDistrict,
    ward: t.checkoutWard,
    street: t.checkoutStreet,
  };

  const change = (key: FieldKey) => (event: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: event.target.value });

  return (
    <>
      {FIELDS.map((field) => (
        <label key={field.key} className={cn("block", field.wide && "sm:col-span-2")}>
          <span className="mb-2 block text-[12.5px] font-bold">
            {labels[field.key]}
            {field.required ? (
              <span className="ml-1 text-accent">*</span>
            ) : (
              <span className="ml-1 font-normal text-ink-faint">({t.checkoutOptional})</span>
            )}
          </span>
          <input
            name={field.key}
            value={value[field.key]}
            onChange={change(field.key)}
            autoComplete={field.autoComplete}
            inputMode={field.tel ? "tel" : undefined}
            minLength={field.min}
            maxLength={field.max}
            required={field.required}
            disabled={disabled}
            className={fieldClass}
          />
        </label>
      ))}
    </>
  );
}
