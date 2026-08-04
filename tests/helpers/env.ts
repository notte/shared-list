import fs from "node:fs"
import path from "node:path"

/** Load `.env.local` into `process.env` (supports multi-line single-quoted values). */
export function loadEnvLocal(cwd = process.cwd()) {
  const filePath = path.join(cwd, ".env.local")
  if (!fs.existsSync(filePath)) return

  const text = fs.readFileSync(filePath, "utf8")
  let i = 0

  while (i < text.length) {
    while (i < text.length && /[ \t\r\n]/.test(text[i]!)) i++
    if (i >= text.length) break
    if (text[i] === "#") {
      while (i < text.length && text[i] !== "\n") i++
      continue
    }

    const keyStart = i
    while (i < text.length && /[A-Za-z0-9_]/.test(text[i]!)) i++
    const key = text.slice(keyStart, i)
    if (!key || text[i] !== "=") {
      while (i < text.length && text[i] !== "\n") i++
      continue
    }
    i++ // skip =

    let value = ""
    if (text[i] === "'" || text[i] === '"') {
      const quote = text[i]!
      i++
      const start = i
      while (i < text.length && text[i] !== quote) i++
      value = text.slice(start, i)
      if (text[i] === quote) i++
    } else {
      const start = i
      while (i < text.length && text[i] !== "\n") i++
      value = text.slice(start, i).trim()
    }

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
