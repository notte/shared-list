import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react"

export interface SelectProps {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = "請選擇",
  disabled,
}: SelectProps) {
  const selected = options?.find((o) => o.value === value)

  return (
    <Menu>
      <MenuButton className="select-trigger" disabled={disabled}>
        {selected ? selected.label : placeholder}
      </MenuButton>
      <MenuItems anchor="bottom" className="select-items">
        {options?.map((option) => (
          <MenuItem key={option.value}>
            <div className="select-item" onClick={() => onChange(option.value)}>
              {option.label}
            </div>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}
