// THE SHAPES. The pure pieces the bridgehead shapes an answer and a row with, apart from it, since none of them reaches $. [[spec/design_output/level0#the-bridgehead-and-the-server]]

// The cap on a string an event carries once the body runs past the post's limit. [[spec/design_output/level0#the-bridgehead-and-the-server]]
const SHORT = 4000;

// The append a row takes through a process, so a row another writer appends between a read and a write stays. [[spec/design_output/log#every-writer-appends]]
export const APPEND =
  "const fs = require('node:fs'); const path = require('node:path'); const [file, row] = process.argv.slice(1); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, row);";

// An answer with an after merged in: a list grows, a text takes the new one below it, and anything else stands replaced. [[spec/design_output/schema#the-verbs-own-their-fields]]
export function merged(said, after) {
  const out = said && typeof said === "object" ? { ...said } : {};
  for (const [key, value] of Object.entries(after ?? {})) {
    if (Array.isArray(value) && Array.isArray(out[key]))
      out[key] = [...out[key], ...value];
    else if (typeof value === "string" && typeof out[key] === "string" && out[key])
      out[key] = `${out[key]}\n\n${value}`;
    else out[key] = value;
  }
  return out;
}

// An event cut to its short strings, numbers and flags. [[spec/design_output/level0#the-bridgehead-and-the-server]]
export function slim(e) {
  if (!e || typeof e !== "object") return e ?? null;
  const out = {};
  for (const [key, value] of Object.entries(e)) {
    if (typeof value === "string") out[key] = value.slice(0, SHORT);
    else if (typeof value === "number" || typeof value === "boolean") out[key] = value;
  }
  return out;
}
