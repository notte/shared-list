"use client"

import {
  Description,
  Field,
  Label,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react"

export interface SelectProps {
  label?: string
  description?: string
  errorText?: string
  options: { label: string; value: string; slot?: React.ReactNode }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function Select({
  label,
  description,
  errorText,
  options,
  value,
  onChange,
  placeholder = "Please select",
  disabled,
}: SelectProps) {
  const selected = options?.find((o) => o.value === value)

  return (
    <div className="w-full">
      <Field disabled={disabled}>
        <Label className="input-label">{label}</Label>
        {description && (
          <Description className="input-description">{description}</Description>
        )}
        <Menu>
          <MenuButton className="select-trigger" disabled={disabled}>
            {selected ? selected.label : placeholder}
          </MenuButton>
          <MenuItems anchor="bottom" className="select-items">
            {options?.map((option) => (
              <MenuItem key={option.value}>
                <div
                  className="select-item"
                  onClick={() => onChange(option.value)}
                >
                  <div className="flex items-center gap-2">
                    {option.slot}
                    <span>{option.label}</span>
                  </div>
                </div>
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
        <p className="input-error">{errorText}</p>
      </Field>
    </div>
  )
}
