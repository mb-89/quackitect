// The shape of one log line, the name of the file it lands in, and the prune
// that decides what goes. This module reaches nothing outside itself, so the
// hook inside the harness and the door outside it both read it.
// [[spec/design_output/log#what-one-line-looks-like]]

export const FOLDER = ".se/log";
export const LNAV = ".se/bin/lnav";
export const DAYS = 14;
export const FILES = 200;
export const LEAST = 20;

const LEVELS = ["info", "warn", "error"];
const SAID = 80;
const OWN = ["at", "level", "door", "said"];
const NAME = /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-[0-9a-z]+\.jsonl$/;
const DAY = 24 * 60 * 60 * 1000;

export function lnavBin(platform) {
  return platform === "win32" ? `${LNAV}.exe` : LNAV;
}

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

// [[spec/design_output/log#rotation-which-is-really-a-prune]]
export function dropping(names, now, caps = {}) {
  const days = caps.days ?? DAYS;
  const keep = caps.files ?? FILES;
  const least = caps.least ?? LEAST;
  const mine = names
    .map((name) => ({ name, at: timeOf(name) }))
    .filter((one) => one.at > 0)
    .sort((a, b) => a.at - b.at || a.name.localeCompare(b.name));

  const oldest = now - days * DAY;
  const floor = mine.slice(Math.max(0, mine.length - least));
  const young = (one) => one.at >= oldest || floor.includes(one);
  const stale = mine.filter((one) => !young(one));
  const left = mine.filter(young);
  const over = left.slice(0, Math.max(0, left.length - keep));
  return [...stale, ...over].map((one) => one.name);
}

export function asRow(one) {
  const rest = Object.entries(one).filter(([key]) => !OWN.includes(key));
  const said = `${String(one.at).slice(11, 23)} ${String(one.level).padEnd(5)} ${String(one.door).padEnd(6)} ${one.said}`;
  return rest.length
    ? `${said}\n${" ".repeat(13)}${rest.map(([key, value]) => `${key}=${value}`).join(" ")}`
    : said;
}
