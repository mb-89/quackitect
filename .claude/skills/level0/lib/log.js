// The shape of one log line and the file a session appends to. This module
// reaches nothing outside itself, so every writer reads it: the hook, the
// door, the sidebar.
// [[spec/design_output/log#what-one-line-looks-like]]

export const FOLDER = ".se/log";
export const SESSION = `${FOLDER}/session.jsonl`;
export const OLD = `${FOLDER}/old`;
export const LOG_TOOL = "log";

// [[spec/design_output/log#an-answer-stands-in-chat]]
export const ANSWER_KIND = "answer";

// The ladder Python's logging climbs, and an empty or unknown level reads as info. [[spec/design_output/log#what-a-box-writes]]
export const LEVELS = ["debug", "info", "warn", "error", "fatal"];
const DEFAULT = "info";
export const SAID = 80;
const DETAIL = 120;
const DATE = { from: 0, to: 10 };
const CLOCK = { from: 11, to: 19 };
const STAMP = { from: 11, to: 23 };
const LEVEL_WIDTH = 5;
const KIND_WIDTH = 6;
const INDENT = STAMP.to - STAMP.from + 1;
const OWN = ["at", "level", "kind", "said"];
const NAME = /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-[0-9a-z]+\.jsonl$/;
const AIMS = ["file_path", "command", "query", "url"];

export function rowOf(at, level, kind, said, more = {}) {
  const rest = {};
  for (const [key, value] of Object.entries(more ?? {})) {
    if (OWN.includes(key) || value === undefined) continue;
    rest[key] = key === "detail" ? String(value).slice(0, DETAIL) : value;
  }
  return {
    at,
    level: LEVELS.includes(level) ? level : DEFAULT,
    kind: String(kind),
    // An answer keeps its whole text and its lines, because the owner reads it there and a list or a table stands on its lines. [[spec/design_output/log#an-answer-stands-in-chat]]
    said:
      String(kind) === ANSWER_KIND
        ? String(said).trim()
        : String(said).replace(/\s+/g, " ").trim().slice(0, SAID),
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
      "An answer to the owner's prompt stands in the chat, as text, and the hook",
      `logs it from there under kind ${ANSWER_KIND}. This tool answers no prompt.`,
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", description: `What the line is, such as ${ANSWER_KIND}, status or note.` },
        said: {
          type: "string",
          description: "One sentence, 80 characters at most. An answer carries its whole text here.",
        },
        text: { type: "string", description: "The whole text, where said runs short." },
        level: { type: "string", enum: LEVELS, description: "debug, info, warn, error or fatal." },
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
  const time = said.slice(CLOCK.from, CLOCK.to).split(":").join("-");
  return `${said.slice(DATE.from, DATE.to)}T${time}-${id}.jsonl`;
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

export function rank(said) {
  const found = LEVELS.indexOf(String(said ?? "").toLowerCase());
  return found < 0 ? LEVELS.indexOf(DEFAULT) : found;
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
  const said = `${String(one.at).slice(STAMP.from, STAMP.to)} ${String(one.level).padEnd(LEVEL_WIDTH)} ${String(one.kind).padEnd(KIND_WIDTH)} ${one.said}`;
  return rest.length
    ? `${said}\n${" ".repeat(INDENT)}${rest.map(([key, value]) => `${key}=${value}`).join(" ")}`
    : said;
}
