"use client"

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { DayPicker, DateRange } from "@daypicker/react"
import "@daypicker/react/style.css"
import Input, { InputProps } from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { useState } from "react"
import { format, parse, isValid } from "date-fns"
import { enUS } from "@daypicker/react/locale"

type BaseProps = Omit<InputProps<string>, "onChange">

export interface DatePickerSingleProps extends BaseProps {
  mode: "single"
  onChange?: (value: Date | undefined) => void
}

export interface DatePickerRangeProps extends BaseProps {
  mode: "range"
  onChange?: (value: { from: Date | undefined; to: Date | undefined }) => void
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, "0"),
  value: String(i),
}))

const minuteOptions = ["00", "15", "30", "45"].map((m) => ({
  label: m,
  value: m,
}))

const applyTime = (date: Date, h: string, m: string): Date => {
  const result = new Date(date)
  result.setHours(Number(h), Number(m), 0, 0)
  return result
}

export default function DatePicker(props: DatePickerProps) {
  const {
    label,
    value,
    description,
    disabled,
    errorText,
    mode = "single",
  } = props

  const [month, setMonth] = useState<Date>(new Date())
  const [inputValue, setInputValue] = useState(value ?? "")

  // single
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [hour, setHour] = useState("00")
  const [minute, setMinute] = useState("00")

  // range
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    undefined,
  )
  const [fromHour, setFromHour] = useState("00")
  const [fromMinute, setFromMinute] = useState("00")
  const [toHour, setToHour] = useState("00")
  const [toMinute, setToMinute] = useState("00")

  const formatRangeInput = (
    range: DateRange,
    fh: string,
    fm: string,
    th: string,
    tm: string,
  ) => {
    const from = range.from
      ? format(applyTime(range.from, fh, fm), "yyyy/MM/dd HH:mm")
      : ""
    const to = range.to
      ? format(applyTime(range.to, th, tm), "yyyy/MM/dd HH:mm")
      : ""
    return from && to ? `${from} - ${to}` : from
  }

  // single handlers
  const handleSingleSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      setInputValue("")
      ;(props as DatePickerSingleProps).onChange?.(undefined)
      return
    }
    const withTime = applyTime(date, hour, minute)
    setSelectedDate(withTime)
    setMonth(withTime)
    setInputValue(format(withTime, "yyyy/MM/dd HH:mm"))
    ;(props as DatePickerSingleProps).onChange?.(withTime)
  }

  const handleSingleHourChange = (h: string) => {
    setHour(h)
    if (selectedDate) {
      const updated = applyTime(selectedDate, h, minute)
      setSelectedDate(updated)
      setInputValue(format(updated, "yyyy/MM/dd HH:mm"))
      ;(props as DatePickerSingleProps).onChange?.(updated)
    }
  }

  const handleSingleMinuteChange = (m: string) => {
    setMinute(m)
    if (selectedDate) {
      const updated = applyTime(selectedDate, hour, m)
      setSelectedDate(updated)
      setInputValue(format(updated, "yyyy/MM/dd HH:mm"))
      ;(props as DatePickerSingleProps).onChange?.(updated)
    }
  }

  const handleSingleInputChange = (newValue: string) => {
    setInputValue(newValue)
    const parsed = parse(newValue, "yyyy/MM/dd HH:mm", new Date())
    if (isValid(parsed)) {
      setSelectedDate(parsed)
      setMonth(parsed)
      setHour(String(parsed.getHours()))
      setMinute(String(parsed.getMinutes()).padStart(2, "0"))
      ;(props as DatePickerSingleProps).onChange?.(parsed)
    } else {
      setSelectedDate(undefined)
      ;(props as DatePickerSingleProps).onChange?.(undefined)
    }
  }

  // range handlers
  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range) {
      setSelectedRange(undefined)
      setInputValue("")
      ;(props as DatePickerRangeProps).onChange?.({
        from: undefined,
        to: undefined,
      })
      return
    }
    setSelectedRange(range)
    if (range.from) setMonth(range.from)
    setInputValue(
      formatRangeInput(range, fromHour, fromMinute, toHour, toMinute),
    )
    ;(props as DatePickerRangeProps).onChange?.({
      from: range.from
        ? applyTime(range.from, fromHour, fromMinute)
        : undefined,
      to: range.to ? applyTime(range.to, toHour, toMinute) : undefined,
    })
  }

  const handleRangeTimeChange = (
    type: "fromHour" | "fromMinute" | "toHour" | "toMinute",
    val: string,
  ) => {
    const next = { fromHour, fromMinute, toHour, toMinute, [type]: val }
    if (type === "fromHour") setFromHour(val)
    if (type === "fromMinute") setFromMinute(val)
    if (type === "toHour") setToHour(val)
    if (type === "toMinute") setToMinute(val)

    if (selectedRange) {
      setInputValue(
        formatRangeInput(
          selectedRange,
          next.fromHour,
          next.fromMinute,
          next.toHour,
          next.toMinute,
        ),
      )
      ;(props as DatePickerRangeProps).onChange?.({
        from: selectedRange.from
          ? applyTime(selectedRange.from, next.fromHour, next.fromMinute)
          : undefined,
        to: selectedRange.to
          ? applyTime(selectedRange.to, next.toHour, next.toMinute)
          : undefined,
      })
    }
  }

  return (
    <Popover className="w-full">
      <PopoverButton as="div" className="w-full">
        <Input
          label={label}
          value={inputValue}
          description={description}
          disabled={disabled}
          onChange={mode === "single" ? handleSingleInputChange : () => {}}
          errorText={errorText}
        />
      </PopoverButton>

      <PopoverPanel
        anchor="top"
        className="absolute z-10 mt-10 bg-background border border-border rounded-xl shadow-2xl dark:shadow-mist-950 p-4"
      >
        {mode === "single" ? (
          <>
            <DayPicker
              autoFocus
              locale={enUS}
              mode="single"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleSingleSelect}
              selected={selectedDate}
            />
            <div className="flex items-center gap-2 mt-2 px-1">
              <Select
                options={hourOptions}
                value={hour}
                onChange={handleSingleHourChange}
                placeholder="00"
              />
              <span className="text-foreground">:</span>
              <Select
                options={minuteOptions}
                value={minute}
                onChange={handleSingleMinuteChange}
                placeholder="00"
              />
            </div>
          </>
        ) : (
          <>
            <DayPicker
              autoFocus
              locale={enUS}
              mode="range"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleRangeSelect}
              selected={selectedRange}
            />
            <div className="flex flex-col gap-2 mt-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted w-8">From</span>
                <Select
                  options={hourOptions}
                  value={fromHour}
                  onChange={(v) => handleRangeTimeChange("fromHour", v)}
                  placeholder="00"
                />
                <span className="text-foreground">:</span>
                <Select
                  options={minuteOptions}
                  value={fromMinute}
                  onChange={(v) => handleRangeTimeChange("fromMinute", v)}
                  placeholder="00"
                />
              </div>
              <div className="">
                <span className="text-sm text-muted w-8">To</span>
                <Select
                  options={hourOptions}
                  value={toHour}
                  onChange={(v) => handleRangeTimeChange("toHour", v)}
                  placeholder="00"
                />
                <span className="text-foreground">：</span>
                <Select
                  options={minuteOptions}
                  value={toMinute}
                  onChange={(v) => handleRangeTimeChange("toMinute", v)}
                  placeholder="00"
                />
              </div>
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  )
}
