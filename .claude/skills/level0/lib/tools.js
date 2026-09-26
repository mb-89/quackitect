// Where each tool stands on this box. The survey writes the file this names,
// and a caller reads a path out of it in place of building one.
// [[spec/design_output/tools#what-the-survey-writes]]

import { inRun } from "./folders.js";

export const TOOLS = inRun("tools.json");
export const BIN = inRun("bin");

export const WANTED = [
  { name: "node", asks: ["--version"], for: "a helper script" },
  { name: "vale", asks: ["--version"], for: "the prose rules" },
  { name: "biome", asks: ["--version"], for: "formatting and linting the JavaScript" },
  { name: "vale-ls", asks: ["--version"], for: "the prose rules inside an editor" },
  {
    name: "se-lsp",
    asks: ["--version"],
    for: "the note shape and the names inside an editor",
  },
  { name: "go", asks: ["version"], for: "building the index and the viewer" },
  { name: "git", asks: ["--version"], for: "history and diffs" },
  { name: "claude", asks: ["--version"], for: "a session of its own, and the probe" },
  { name: "sh", asks: [], for: "a shell script" },
  {
    name: "python",
    asks: ["--version"],
    calls: ["python3", "python"],
    for: "a helper script",
  },
];

export function callsOf(one) {
  const calls = one?.calls;
  return Array.isArray(calls) && calls.length ? calls : [String(one?.name ?? "")];
}

// [[spec/design_output/tools#reading-the-path-variable]]
export function placesFor(call, env = {}, bin = BIN) {
  const said = env.PATH ?? env.Path ?? "";
  const folders = [bin, ...said.split(env.PATHEXT ? ";" : ":")].filter(Boolean);
  const out = [];
  for (const folder of folders) {
    for (const ext of endings(env)) out.push(`${folder}/${call}${ext}`);
  }
  return out;
}

function endings(env) {
  const found = String(env.PATHEXT ?? "")
    .split(";")
    .map((one) => one.trim().toLowerCase())
    .filter(Boolean);
  return found.length ? ["", ...found] : [""];
}

export function versionOf(said) {
  const found = /\d+\.\d+(?:\.\d+)?/.exec(String(said ?? "").split("\n")[0]);
  return found ? found[0] : "";
}

export function surveyOf(text) {
  let read;
  try {
    read = JSON.parse(text || "{}");
  } catch {
    return {};
  }
  return read && typeof read === "object" ? read : {};
}

export function pathOf(survey, name) {
  const one = survey?.[name];
  return one && typeof one.path === "string" ? one.path : "";
}

export function guesses(name) {
  return [`${BIN}/${name}.exe`, `${BIN}/${name}`];
}

// The binaries whose `here` case asks after their source: find for a newer file, or the hash `go-source.js fresh` keeps. [[spec/design_output/lsp#the-build-beside-the-index]]
export function rebuilt(text) {
  const out = [];
  for (const found of String(text ?? "").matchAll(
    /^(\w+)_here\(\)\s*\{([\s\S]*?)^\}/gm,
  )) {
    if (/-newer|go-source\.js fresh/.test(found[2])) out.push(found[1]);
  }
  return out;
}

// [[spec/design_output/tools#what-the-survey-names]]
export function installedTools(text) {
  const out = [];
  for (const line of String(text ?? "").split(/\r?\n/)) {
    const found = /^\s*([a-z][a-z0-9-]*)\)\s*(?:\[ -x "\$bin\/|have )/.exec(line);
    if (found) out.push(found[1]);
  }
  return out;
}

const LOOP = /^\s*for\s+\w+\s+in\s+(.*)$/;
const MARK = /folders\.js\s+owns\s+these\s+names\s+as\s+([A-Z_]+)/;
const PRIVATE_PATH = /\.se\//;

// The installer names the list each loop carries, so one change reaches the rule and the shell alike. [[spec/design_input/the-runtime-files-stand-apart]]
export function loopNames(text, lists = {}) {
  const lines = String(text ?? "").split(/\r?\n/);
  const out = { unmarked: [] };
  for (let at = 0; at < lines.length; at++) {
    const found = LOOP.exec(lines[at]);
    if (!found) continue;
    const names = namesIn(lines, at, found[1]);
    const mark = markAbove(lines, at);
    if (!mark) {
      // A loop reaching the private folder or moving a name a list holds names that list, and every other loop stands outside this. [[spec/design_input/the-runtime-files-stand-apart]]
      if (PRIVATE_PATH.test(found[1]) || meets(names, lists)) out.unmarked.push(at + 1);
      continue;
    }
    out[mark] = [...(out[mark] ?? []), ...names];
  }
  return out;
}

// A name any list holds marks the loop moving it, whatever its header spells. [[spec/design_input/the-runtime-files-stand-apart]]
function meets(names, lists) {
  return Object.values(lists ?? {}).some((list) =>
    names.some((one) => [list].flat().includes(one)),
  );
}

// A marker stands in the comment run above its loop. [[spec/design_input/the-runtime-files-stand-apart]]
function markAbove(lines, at) {
  for (let up = at - 1; up >= 0 && /^\s*#/.test(lines[up]); up--) {
    const found = MARK.exec(lines[up]);
    if (found) return found[1];
  }
  return "";
}

// A loop carries over on a trailing mark, and each word reads as its name under the private folder. [[spec/design_input/the-runtime-files-stand-apart]]
function namesIn(lines, at, first) {
  let said = first;
  for (let down = at; said.trimEnd().endsWith("\\"); down++) {
    said = `${said.trimEnd().slice(0, -1)} ${lines[down + 1] ?? ""}`;
  }
  return said.split(";")[0].split(/\s+/).map(bare).filter(Boolean);
}

function bare(word) {
  return String(word)
    .replace(/["']/g, "")
    .replace(/\$\{?\w+\}?\//g, "")
    .replace(/^\.se\//, "")
    .trim();
}

// [[spec/design_output/tools#the-session-reads-the-survey]]
export function toolLines(survey, wanted = WANTED, specs = []) {
  const out = [];
  for (const one of wanted) {
    const found = survey?.[one.name];
    if (!found) continue;
    const version = found.version ? ` ${found.version}` : "";
    out.push(`- \`${one.name}\`${version}, for ${one.for}`);
  }
  for (const spec of specs) {
    out.push(`- \`${spec.name}\`: ${firstSentence(spec.description)}`);
  }
  return out;
}

export function firstSentence(text) {
  const said = String(text ?? "").trim();
  const end = said.search(/\.(\s|$)/);
  return end < 0 ? `${said}.` : said.slice(0, end + 1);
}
