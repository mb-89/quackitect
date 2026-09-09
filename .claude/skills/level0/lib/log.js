// The shape of one log line, the name of the file it lands in, and the level a
// box writes at. This module reaches nothing outside itself, so the hook inside
// the harness and the door outside it both read it.
// [[spec/design_output/log#what-one-line-looks-like]]

export const FOLDER = ".se/log";

const LEVELS = ["info", "warn", "error"];
const SAID = 80;
const OWN = ["at", "level", "door", "said"];
const NAME = /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-[0-9a-z]+\.jsonl$/;
const AIMS = ["file_path", "command", "query", "url"];

export function rowOf(at, level, door, said, more = {}) {
  const rest = {};
  for (const [key, value] of Object.entries(more ?? {})) {
    if (!OWN.includes(key) && value !== undefined) rest[key] = value;
  }
  return {
    at,
    level: LEVELS.includes(level) ? level : "info",
    door: String(door),
    said: String(said).replace(/\s+/g, " ").trim().slice(0, SAID),
    ...rest,
  };
}

export function asLines(rows) {
  return `${rows.map((one) => JSON.stringify(one)).join("\n")}\n`;
}

export function rowsOf(text) {
  return String(text)
    .split("\n")
    .filter((row) => row.trim())
    .map((row) => JSON.parse(row));
}

export function nameOf(stamp, id) {
  const said = String(stamp);
  const time = said.slice(11, 19).split(":").join("-");
  return `${said.slice(0, 10)}T${time}-${id}.jsonl`;
}

export function timeOf(name) {
  const said = NAME.exec(String(name));
  if (!said) return 0;
  return Date.parse(`${said[1]}T${said[2]}:${said[3]}:${said[4]}.000Z`);
}

// [[spec/design_output/log#what-a-box-writes]]
export function writes(at, level) {
  return rank(level) >= rank(at);
}

function rank(said) {
  const found = LEVELS.indexOf(String(said ?? "").toLowerCase());
  return found < 0 ? 0 : found;
}

// [[spec/design_output/log#what-a-tool-line-names]]
export function aimOf(call) {
  for (const field of AIMS) {
    const said = call?.[field];
    if (typeof said === "string" && said.trim()) return said.trim();
  }
  return String(call?.tool ?? "");
}

export function asRow(one) {
  const rest = Object.entries(one).filter(([key]) => !OWN.includes(key));
  const said = `${String(one.at).slice(11, 23)} ${String(one.level).padEnd(5)} ${String(one.door).padEnd(6)} ${one.said}`;
  return rest.length
    ? `${said}\n${" ".repeat(13)}${rest.map(([key, value]) => `${key}=${value}`).join(" ")}`
    : said;
}
