// Projection. One source, several targets, and a program keeping that relation
// alive. What is projected where is data in spec/config/projections.json, so a
// projection is an entry there and no code change.
// [[spec/design_output/projection#what-goes-where-is-data]]

import { flatten, keysOf, LOCAL, TRACKED } from "./config.js";

export const PROJECTIONS = "spec/config/projections.json";

// [[spec/design_output/projection#the-first-target]]
export const COMMANDS = "config commands";

const PREFIX = "se-";
const ARGUMENT = "$ARGUMENTS";

// [[spec/design_output/projection#each-file-says-so]]
export function saysGenerated(from) {
  return [
    "GENERATED. Edit the source named below, not this file. It is written again",
    "every time the tree is projected, so an edit here is lost.",
    `Source: ${from}`,
  ].join(" ");
}

export function entriesIn(text) {
  const said = parsed(text);
  const list = Array.isArray(said?.projections) ? said.projections : [];
  return list.filter((one) => one && typeof one === "object" && one.target);
}

// [[spec/design_output/projection#projecting-in-memory]]
export function readsOf(entry) {
  return [entry?.from, entry?.schema].filter(Boolean);
}

// [[spec/design_output/projection#projecting-in-memory]]
export function writesOf(entry, texts) {
  const out = new Map();
  if (entry?.shape !== COMMANDS) return out;

  const said = flatten(parsed(texts.get(entry.from)));
  const schema = keysOf(parsed(texts.get(entry.schema)));
  const target = folderOf(entry.target);

  for (const [key, value] of said) {
    const one = schema.find((each) => each.key === key);
    for (const file of commandsFor(key, value, one, entry)) {
      out.set(`${target}/${file.name}`, file.text);
    }
  }
  return out;
}

// [[spec/design_output/projection#the-first-target]]
export function optionsFor(value, said) {
  if (said?.options?.length) return said.options.map((one) => String(one));
  const type = said?.type ?? typeof value;
  if (type === "boolean") return ["true", "false"];
  return [];
}

export function nameOf(key, option) {
  const path = String(key).split(".").join("-");
  return `${PREFIX}${path}${option === undefined ? "" : `-${option}`}.md`;
}

function commandsFor(key, value, said, entry) {
  const options = optionsFor(value, said);
  const opens = `The line above runs before this turn opens, so \`${key}\` reads`;
  if (!options.length) {
    return [
      {
        name: nameOf(key),
        text: fileFor(entry, key, ARGUMENT, `${opens} what you type after the name.`),
      },
    ];
  }
  return options.map((option) => ({
    name: nameOf(key, option),
    text: fileFor(entry, key, option, `${opens} \`${option}\` from here on.`),
  }));
}

// [[spec/design_output/projection#how-a-command-sets-it]]
function fileFor(entry, key, said, sentence) {
  const body = [
    `!\`./RUNME.sh config ${key} ${said}\``,
    "",
    wrapped(
      `${sentence} Run \`./RUNME.sh config\` to read which layer answers a key: ` +
        `\`${LOCAL}\` beats the environment, and the environment beats \`${TRACKED}\`.`,
    ),
    "",
  ].join("\n");

  if (entry?.wrap !== "frontmatter") return body;
  return [
    "---",
    `description: ${JSON.stringify(saysGenerated(entry.from))}`,
    "allowed-tools: Bash(./RUNME.sh config:*)",
    "---",
    "",
    body,
  ].join("\n");
}

// [[spec/design_output/projection#projecting-in-memory]]
export function readAll(entries, disk, at = (path) => path) {
  const wanted = new Map();
  const standing = new Map();

  for (const entry of entries) {
    const texts = new Map();
    for (const path of readsOf(entry)) {
      if (disk.exists(at(path))) texts.set(path, disk.read(at(path)));
    }
    for (const [path, text] of writesOf(entry, texts)) wanted.set(path, text);

    const folder = folderOf(entry.target);
    if (!disk.exists(at(folder))) continue;
    for (const one of disk.list(at(folder))) {
      if (one.kind !== "file" || !one.name.endsWith(".md")) continue;
      standing.set(`${folder}/${one.name}`, disk.read(at(`${folder}/${one.name}`)));
    }
  }
  return { wanted, standing };
}

// [[spec/design_output/projection#the-write-door-refuses-one]]
export function ownerOf(entries, path) {
  const said = shown(path);
  if (!said) return undefined;
  return entries
    .filter((entry) => under(said, folderOf(entry.target)))
    .sort((a, b) => folderOf(b.target).length - folderOf(a.target).length)[0];
}

// [[spec/design_output/projection#the-write-door-refuses-one]]
function under(said, target) {
  if (!target) return false;
  return said === target || said.startsWith(`${target}/`) || said.includes(`/${target}/`);
}

// [[spec/design_output/projection#check-refuses-a-stale-one]]
export function staleIn(wanted, found) {
  const out = [];
  for (const [path, text] of wanted) {
    if (!found.has(path)) out.push({ path, how: "missing" });
    else if (found.get(path) !== text) out.push({ path, how: "differs" });
  }
  for (const path of found.keys()) {
    if (!wanted.has(path)) out.push({ path, how: "extra" });
  }
  return out.sort((a, b) => (a.path < b.path ? -1 : 1));
}

export function refusedWrite(entry, path) {
  return [
    `${shown(path)} is projected, so nothing may write it by hand.`,
    "",
    `  projection: ${entry.name ?? entry.target}`,
    `  source:     ${entry.from ?? entry.target}`,
    "",
    `Edit ${entry.from ?? entry.target} instead. Level zero projects at every`,
    "session start, and `./RUNME.sh check` refuses a target standing stale.",
  ].join("\n");
}

// [[spec/design_output/projection#each-file-says-so]]
function wrapped(said, at = 84) {
  const rows = [];
  let row = "";
  for (const word of String(said).split(/\s+/).filter(Boolean)) {
    if (row && `${row} ${word}`.length > at) {
      rows.push(row);
      row = word;
      continue;
    }
    row = row ? `${row} ${word}` : word;
  }
  if (row) rows.push(row);
  return rows.join("\n");
}

function folderOf(target) {
  return shown(target).replace(/\/+$/, "");
}

function shown(path) {
  return String(path ?? "")
    .split("\\")
    .join("/")
    .replace(/^\.\//, "");
}

function parsed(text) {
  try {
    const said = String(text ?? "");
    return said.trim() ? JSON.parse(said) : {};
  } catch {
    return {};
  }
}
