// Where each tool stands on this box. The survey writes .se/tools.json, and a
// caller reads a path out of it in place of building one.
// [[spec/design_output/tools#what-the-survey-writes]]

export const TOOLS = ".se/tools.json";
export const BIN = ".se/bin";

export const WANTED = [
  { name: "node", asks: ["--version"], for: "a helper script" },
  { name: "vale", asks: ["--version"], for: "the prose rules" },
  { name: "biome", asks: ["--version"], for: "formatting and linting the JavaScript" },
  { name: "vale-ls", asks: ["--version"], for: "the prose rules inside an editor" },
  { name: "se-lsp", asks: ["--version"], for: "the note shape and the names inside an editor" },
  { name: "go", asks: ["version"], for: "building the index and the viewer" },
  { name: "git", asks: ["--version"], for: "history and diffs" },
  { name: "claude", asks: ["--version"], for: "a session of its own, and the probe" },
  { name: "sh", asks: [], for: "a shell script" },
  { name: "python", asks: ["--version"], calls: ["python3", "python"], for: "a helper script" },
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

// [[spec/design_output/tools#what-the-survey-names]]
export function installedTools(text) {
  const out = [];
  for (const line of String(text ?? "").split(/\r?\n/)) {
    const found = /^\s*([a-z][a-z0-9-]*)\)\s*(?:\[ -x "\$bin\/|have )/.exec(line);
    if (found) out.push(found[1]);
  }
  return out;
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
