// The shape of one log line, the one file a session appends to, where an old
// session goes, and the level a box writes at. This module reaches nothing
// outside itself, so every writer reads it: the hook, the door, the sidebar.
// [[spec/design_output/log#what-one-line-looks-like]]

export const FOLDER = ".se/log";
export const SESSION = `${FOLDER}/session.jsonl`;
export const OLD = `${FOLDER}/old`;
export const LOG_TOOL = "log";

const LEVELS = ["info", "warn", "error"];
const SAID = 80;
const OWN = ["at", "level", "kind", "said"];
const NAME = /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-[0-9a-z]+\.jsonl$/;
const AIMS = ["file_path", "command", "query", "url"];

export function rowOf(at, level, kind, said, more = {}) {
  const rest = {};
  for (const [key, value] of Object.entries(more ?? {})) {
    if (!OWN.includes(key) && value !== undefined) rest[key] = value;
  }
  return {
    at,
    level: LEVELS.includes(level) ? level : "info",
    kind: String(kind),
    said: String(said).replace(/\s+/g, " ").trim().slice(0, SAID),
    ...rest,
  };
}

export function asLines(rows) {
  return `${rows.map((one) => JSON.stringify(one)).join("\n")}\n`;
}

// [[spec/design_output/log#every-writer-appends]]
export function appended(was, row) {
  const text = String(was ?? "");
  const joint = text && !text.endsWith("\n") ? "\n" : "";
  return `${text}${joint}${JSON.stringify(row)}\n`;
}

// [[spec/design_output/log#a-session-rotates-its-file]]
export function archiveOf(text, now, id) {
  const first = String(text ?? "").split("\n")[0];
  let at = "";
  try {
    at = String(JSON.parse(first)?.at ?? "");
  } catch {}
  return `${OLD}/${nameOf(/^\d{4}-\d{2}-\d{2}T/.test(at) ? at : now, id)}`;
}

// [[spec/design_output/log#the-log-tool]]
export function logSpec() {
  return {
    name: LOG_TOOL,
    description: [
      "Writes one line to this session's log, the one the owner reads in the",
      "viewer. The hook stamps the time. Name the kind, such as status or note,",
      "and say one sentence; text carries more where one sentence runs short.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", description: "What the line is, such as status or note." },
        said: { type: "string", description: "One sentence, 80 characters at most." },
        text: { type: "string", description: "The whole text, where said runs short." },
        level: { type: "string", enum: LEVELS, description: "info, warn or error." },
      },
      required: ["kind", "said"],
    },
  };
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
  const said = `${String(one.at).slice(11, 23)} ${String(one.level).padEnd(5)} ${String(one.kind).padEnd(6)} ${one.said}`;
  return rest.length
    ? `${said}\n${" ".repeat(13)}${rest.map(([key, value]) => `${key}=${value}`).join(" ")}`
    : said;
}
