// Projection. One source, several targets, and a program keeping that relation
// alive. What is projected where is data in spec/config/projections.json, so a
// projection is an entry there and no code change.
// [[spec/design_output/projection#what-goes-where-is-data]]

import { flatten, keysOf, LOCAL, TRACKED } from "./config.js";
import { faultsOf, PARAGRAPH, rulesFrom, RULES } from "./paragraph.js";
import { readYaml } from "./schema.js";
import { pathOf } from "./vocabulary.js";

export const PROJECTIONS = "spec/config/projections.json";

// [[spec/design_output/projection#the-first-target]]
export const COMMANDS = "config commands";

// [[spec/design_output/projection#the-second-target]]
export { PARAGRAPH } from "./paragraph.js";

// [[spec/design_output/projection#a-shape-says-its-ending]]
const HOLDS = new Map([
  [COMMANDS, ".md"],
  [PARAGRAPH, RULES],
]);

const PREFIX = "se-";
const ARGUMENT = "$ARGUMENTS";
const CONFIG_PATH = "config";
const SETS = ["toggle"];

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

// The schema names the word list, so the reader takes a second pass over the disk. [[spec/funnel/a-paragraph-has-a-schema]]
export function alsoReads(entry, texts) {
  if (entry?.shape !== PARAGRAPH) return [];
  const source = texts?.get(entry.from);
  if (source === undefined) return [];
  const path = pathOf(readYaml(source));
  return path && !texts.has(path) ? [path] : [];
}

// [[spec/design_output/projection#projecting-in-memory]]
export function writesOf(entry, texts) {
  const out = new Map();
  if (entry?.shape === PARAGRAPH) return paragraphsOf(entry, texts);
  if (entry?.shape !== COMMANDS) return out;

  const said = flatten(parsed(texts.get(entry.from)));
  const raw = parsed(texts.get(entry.schema));
  const schema = keysOf(raw);
  const target = folderOf(entry.target);
  const put = (files) => {
    for (const file of files) out.set(`${target}/${file.name}`, file.text);
  };

  const declared = (key) => {
    const [section, leaf] = key.split(".");
    const help = raw?.properties?.[section]?.properties?.[leaf]?.help;
    return { ...schema.find((each) => each.key === key), help };
  };

  for (const [key, value] of said) {
    put(commandsFor(key, value, declared(key), entry, configPath(key)));
  }
  // [[spec/design_output/projection#a-widget-takes-its-path]]
  for (const widget of widgetsIn(raw)) {
    put(commandsFor(widget.key, said.get(widget.key), declared(widget.key), entry, widget.path));
  }
  return out;
}

// [[spec/design_output/projection#the-second-target]]
function paragraphsOf(entry, texts) {
  const out = new Map();
  const source = texts.get(entry.from);
  if (source === undefined) return out;

  const target = folderOf(entry.target);
  const said = readYaml(source);
  // [[spec/funnel/a-paragraph-has-a-schema]]
  const list = readYaml(texts.get(pathOf(said)) ?? "");
  for (const [name, text] of rulesFrom(said, saysGenerated(entry.from), list)) {
    out.set(`${target}/${name}`, text);
  }
  return out;
}

// [[spec/design_output/projection#a-missing-layer-fails]]
export function faultsIn(entry, texts) {
  if (entry?.shape !== PARAGRAPH) return [];
  const source = texts.get(entry.from);
  const shape = texts.get(entry.schema);
  if (source === undefined || shape === undefined) return [];
  return faultsOf(readYaml(source), parsed(shape)).map(
    (said) => `${entry.from}: ${said}`,
  );
}

// [[spec/design_output/projection#a-name-carries-the-path]]
export function configPath(key) {
  const [section, leaf] = String(key).split(".");
  return { stem: [CONFIG_PATH, section, leaf], label: [CONFIG_PATH, section, leaf] };
}

// [[spec/design_output/projection#a-widget-takes-its-path]]
export function widgetsIn(schema) {
  const out = [];
  for (const [section, said] of Object.entries(schema?.properties ?? {})) {
    for (const [leaf, one] of Object.entries(said?.properties ?? {})) {
      if (!one?.group || !SETS.includes(one.widget) || !Array.isArray(one.enum)) continue;
      out.push({ key: `${section}.${leaf}`, section, leaf, group: String(one.group) });
    }
  }
  return out.map((one) => {
    const shared = out.filter((each) => each.group === one.group && each.leaf === one.leaf);
    const tail = shared.length > 1 ? [one.section, one.leaf] : [one.leaf];
    return { ...one, path: { stem: [slug(one.group), ...tail], label: [one.group, ...tail] } };
  });
}

function slug(said) {
  return String(said)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// [[spec/design_output/projection#the-first-target]]
export function optionsFor(value, said) {
  if (said?.options?.length) return said.options.map((one) => String(one));
  const type = said?.type ?? typeof value;
  if (type === "boolean") return ["true", "false"];
  return [];
}

export function nameOf(stem, option) {
  const path = [].concat(stem).join("-");
  return `${PREFIX}${path}${option === undefined ? "" : `-${option}`}.md`;
}

function commandsFor(key, value, said, entry, path) {
  const options = optionsFor(value, said);
  const opens = `The line above runs before this turn opens, so \`${key}\` reads`;
  const where = path.label.join(" / ");
  const help = said?.help ? ` ${said.help}` : "";
  if (!options.length) {
    return [
      {
        name: nameOf(path.stem),
        text: fileFor(entry, key, ARGUMENT, `${opens} what you type after the name.`, {
          description: `${where}: sets ${key} to what you type.${help}`,
          hint: "<value>",
        }),
      },
    ];
  }
  return options.map((option) => ({
    name: nameOf(path.stem, option),
    text: fileFor(entry, key, option, `${opens} \`${option}\` from here on.`, {
      description: `${where}: sets ${key} to ${option}.${help}`,
    }),
  }));
}

// [[spec/design_output/projection#how-a-command-sets-it]]
function fileFor(entry, key, said, sentence, shown) {
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
    `description: ${JSON.stringify(shown.description)}`,
    ...(shown.hint ? [`argument-hint: ${JSON.stringify(shown.hint)}`] : []),
    "allowed-tools: Bash(./RUNME.sh config:*)",
    `generated: ${JSON.stringify(saysGenerated(entry.from))}`,
    "---",
    "",
    body,
  ].join("\n");
}

// [[spec/design_output/projection#projecting-in-memory]]
export function readAll(entries, disk, at = (path) => path) {
  const wanted = new Map();
  const standing = new Map();
  const faults = [];

  for (const entry of entries) {
    const texts = new Map();
    for (const path of readsOf(entry)) {
      if (disk.exists(at(path))) texts.set(path, disk.read(at(path)));
    }
    // [[spec/funnel/a-paragraph-has-a-schema]]
    for (const path of alsoReads(entry, texts)) {
      if (disk.exists(at(path))) texts.set(path, disk.read(at(path)));
    }
    for (const [path, text] of writesOf(entry, texts)) wanted.set(path, text);
    faults.push(...faultsIn(entry, texts));

    const folder = folderOf(entry.target);
    const end = HOLDS.get(entry.shape) ?? ".md";
    if (!disk.exists(at(folder))) continue;
    for (const one of disk.list(at(folder))) {
      if (one.kind !== "file" || !one.name.endsWith(end)) continue;
      standing.set(`${folder}/${one.name}`, disk.read(at(`${folder}/${one.name}`)));
    }
  }
  return { wanted, standing, faults };
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
