"use client"

import {
  Description,
  Field,
  Input as HeadlessInput,
  Label,
} from "@headlessui/react"

export interface InputProps<T> {
  label: string
  value: T
  onChange: (newValue: T) => void
  description?: string
  disabled?: boolean
  errorText?: string
  isError?: boolean
}

export default function Input<T extends string | number | undefined>({
  label,
  value,
  description,
  disabled,
  onChange,
  errorText,
}: InputProps<T>) {
  return (
    <div className="w-full">
      <Field disabled={disabled}>
        <Label className="input-label">{label}</Label>
        {description && (
          <Description className="input-description">{description}</Description>
        )}
        <HeadlessInput
          className="input"
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
        />
        <p className="input-error">{errorText}</p>
      </Field>
    </div>
  )
}
