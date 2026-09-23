// Projection. One source, several targets, and a program keeping that relation
// alive. What is projected where is data in spec/config/projections.json, so a
// projection is an entry there and no code change.
// [[spec/design_output/projection#what-goes-where-is-data]]

import { flatten, keysOf, LOCAL, TRACKED } from "./config.js";
import { actionables, rulesOf, styled } from "./guidance.js";
import { faultsOf, grouped, PARAGRAPH, RULES, rulesFrom } from "./paragraph.js";

export { ownerOf } from "./projection-owner.js";

import { folderOf, ownerOf as ownsPath, shown } from "./projection-owner.js";
import { readYaml } from "./schema.js";
import { pathsOf } from "./vocabulary.js";

export const PROJECTIONS = "spec/config/projections.json";
// [[spec/design_input/the-agent-pulls-tickets]]
export const RETRO = "retro command";
const RETRO_FILE = "se-retro.md";
const WIDTH = 84;

// [[spec/design_output/projection#the-first-target]]
export const COMMANDS = "config commands";

// [[spec/design_output/projection#the-second-target]]
export { PARAGRAPH } from "./paragraph.js";

// [[spec/design_output/projection#the-third-target]]
export const STYLE = "output style";
export const STYLE_NAME = "level0";

// [[spec/design_output/projection#a-shape-says-its-ending]]
const HOLDS = new Map([
  [COMMANDS, ".md"],
  [PARAGRAPH, RULES],
  [STYLE, ".md"],
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

// A style reads a folder of notes, so the reads need the disk. [[spec/design_output/projection#the-third-target]]
export function readsIn(entry, disk, at = (path) => path) {
  if (entry?.shape !== STYLE) return readsOf(entry);
  const folder = folderOf(entry.from);
  if (!disk.exists(at(folder))) return [];
  return disk
    .list(at(folder))
    .filter((one) => one.kind === "file" && one.name.endsWith(".md"))
    .map((one) => `${folder}/${one.name}`)
    .sort();
}

// The schema names the word lists, so the reader takes a second pass over the disk. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
export function alsoReads(entry, texts) {
  if (entry?.shape !== PARAGRAPH) return [];
  const source = texts?.get(entry.from);
  if (source === undefined) return [];
  return Object.values(pathsOf(readYaml(source))).filter(
    (path) => path && !texts.has(path),
  );
}

// [[spec/funnel/a-paragraph-has-a-schema]]
function listsOf(said, texts) {
  const paths = pathsOf(said);
  const read = (path) => readYaml(texts.get(path) ?? "");
  return { core: read(paths.core), terms: read(paths.terms), swaps: read(paths.swaps) };
}

// [[spec/design_output/projection#projecting-in-memory]]
export function writesOf(entry, texts) {
  const out = new Map();
  if (entry?.shape === PARAGRAPH) return schemaInto(entry, texts, rulesFrom);
  if (entry?.shape === STYLE) return styleFrom(entry, texts);
  if (entry?.shape === RETRO) return retroFrom(entry);
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
    put(
      commandsFor(
        widget.key,
        said.get(widget.key),
        declared(widget.key),
        entry,
        widget.path,
      ),
    );
  }
  return out;
}

// A command is the owner's button, and a cloud session reaches it as a slash command alone. The line keeps it off the model's skill listing, which carries every command otherwise. [[spec/design_output/projection#how-a-command-sets-it]]
const HIDDEN = "disable-model-invocation: true";

// One command mints a retro, because the route it mints from stands in one file. [[spec/design_input/the-agent-pulls-tickets]]
function retroFrom(entry) {
  const body = [
    "!`./RUNME.sh retro new`",
    "",
    wrapped(
      "The line above runs before this turn opens, so a retro stands open at its " +
        "first leaf, and the answer above holds that leaf. Run `./RUNME.sh branch " +
        "pull <name>` to read it again.",
    ),
    "",
  ].join("\n");

  const text =
    entry?.wrap === "frontmatter"
      ? [
          "---",
          `description: ${JSON.stringify("retro: mints a retro off its route, opens it, and hands out its first leaf.")}`,
          "allowed-tools: Bash(./RUNME.sh retro:*)",
          HIDDEN,
          `generated: ${JSON.stringify(saysGenerated(entry.from))}`,
          "---",
          "",
          body,
        ].join("\n")
      : body;
  return new Map([[`${folderOf(entry.target)}/${RETRO_FILE}`, text]]);
}

// [[spec/design_output/projection#the-third-target]]
function styleFrom(entry, texts) {
  const out = new Map();
  const folder = folderOf(entry.from);
  const notes = [...texts.entries()]
    .filter(([path]) => path.startsWith(`${folder}/`) && path.endsWith(".md"))
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([path, text]) => ({ name: path.slice(folder.length + 1), text }))
    .filter((one) => styled(one.text) && actionables(one.text).length);
  if (!notes.length) return out;

  const body = [];
  for (const note of notes) {
    body.push(`## ${note.name.replace(/[.]md$/, "").replace(/[-_]/g, " ")}`);
    body.push("");
    body.push(...rulesOf(note.text));
    body.push("");
  }
  const text = [
    "---",
    `name: ${STYLE_NAME}`,
    `description: ${JSON.stringify(styleSays(notes))}`,
    "keep-coding-instructions: true",
    `generated: ${JSON.stringify(saysGenerated(entry.from))}`,
    "---",
    "",
    "# How this tree works",
    "",
    "These rules hold over every answer you write. Vale holds the mechanical",
    "ones at the write door, so a write breaking one comes back with the",
    "reason and the line.",
    "",
    ...body,
  ].join("\n");
  out.set(`${folderOf(entry.target)}/${STYLE_NAME}.md`, text);
  return out;
}

function styleSays(notes) {
  const names = notes.map((one) => one.name.replace(/[.]md$/, ""));
  return `The ${names.join(", ")} rules of this tree, sent with every request.`;
}

// [[spec/design_output/projection#the-second-target]]
function schemaInto(entry, texts, write) {
  const out = new Map();
  const source = texts.get(entry.from);
  if (source === undefined) return out;

  const target = folderOf(entry.target);
  const said = readYaml(source);
  // [[spec/funnel/a-paragraph-has-a-schema]]
  const lists = listsOf(said, texts);
  for (const [name, text] of write(said, saysGenerated(entry.from), lists)) {
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
      if (!one?.group || !SETS.includes(one.widget) || !Array.isArray(one.enum))
        continue;
      out.push({ key: `${section}.${leaf}`, section, leaf, group: String(one.group) });
    }
  }
  return out.map((one) => {
    const shared = out.filter(
      (each) => each.group === one.group && each.leaf === one.leaf,
    );
    const tail = shared.length > 1 ? [one.section, one.leaf] : [one.leaf];
    return {
      ...one,
      path: { stem: [slug(one.group), ...tail], label: [one.group, ...tail] },
    };
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
    HIDDEN,
    `generated: ${JSON.stringify(saysGenerated(entry.from))}`,
    "---",
    "",
    body,
  ].join("\n");
}

// [[spec/design_output/projection#projecting-in-memory]]
// The sources read through the inheriting reader, and the targets stand in the work root alone. [[spec/design_output/vehicle#the-work-root-inherits]]
export function readAll(entries, sources, targets = sources) {
  const wanted = new Map();
  const standing = new Map();
  const faults = [];

  for (const entry of entries) {
    const texts = new Map();
    for (const path of readsIn(entry, sources)) {
      if (sources.exists(path)) texts.set(path, sources.read(path));
    }
    // [[spec/funnel/a-paragraph-has-a-schema]]
    for (const path of alsoReads(entry, texts)) {
      if (sources.exists(path)) texts.set(path, sources.read(path));
    }
    for (const [path, text] of writesOf(entry, texts)) wanted.set(path, text);
    faults.push(...faultsIn(entry, texts));

    const folder = folderOf(entry.target);
    const end = HOLDS.get(entry.shape) ?? ".md";
    if (!targets.exists(folder)) continue;
    for (const one of targets.list(folder)) {
      if (one.kind !== "file" || !one.name.endsWith(end)) continue;
      // A file stands for the entry owning it, the way the write door reads it, so a file the owner keeps beside the targets stays. [[spec/design_output/projection#the-write-door-refuses-one]]
      const path = `${folder}/${one.name}`;
      if (ownsPath(entries, path) !== entry) continue;
      standing.set(path, targets.read(path));
    }
  }
  return { wanted, standing, faults };
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
function wrapped(said, at = WIDTH) {
  return grouped(String(said).split(/\s+/).filter(Boolean), at).join("\n");
}

function parsed(text) {
  try {
    const said = String(text ?? "");
    return said.trim() ? JSON.parse(said) : {};
  } catch {
    return {};
  }
}
