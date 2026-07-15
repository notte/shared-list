export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? "#3a332b" : "#e3d9c6"
}

export const themeColors = [
  { value: "#c84b31", label: "Maple" },
  { value: "#d3753b", label: "Persimmon" },
  { value: "#dfad34", label: "Ginkgo" },
  { value: "#8cb86d", label: "Sprout" },
  { value: "#3b7a57", label: "Pine" },
  { value: "#3a8b9e", label: "Cyan" },
  { value: "#2b5c8f", label: "Ocean" },
  { value: "#6a5acd", label: "Iris" },
  { value: "#b83b5e", label: "Camellia" },
  { value: "#b87333", label: "Ochre" },
]
