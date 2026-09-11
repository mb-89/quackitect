// THE EDITOR LOADS WHAT ITS OWN LIST NAMES, AND A LINKED FOLDER IS NOT ON IT.
// So the link into ~/.vscode/extensions goes beside an entry in that folder's
// extensions.json. That file holds every extension a person has, and v3 and v4
// both learned what a careless write costs: one unreadable element and the
// editor drops the lot, so a person watches every extension uninstall itself.
// [[spec/design_output/extension#a-file-another-program-owns]]

import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";

export const LIST = "extensions.json";
export const KEPT = "extensions.json.before-quackitect";

// [[spec/design_output/extension#a-file-another-program-owns]]
export function readEntries(text) {
  let said;
  try {
    said = JSON.parse(String(text ?? ""));
  } catch {
    return { entries: [], unreadable: true, dropped: 0, unwrapped: 0 };
  }

  const out = { entries: [], unreadable: false, dropped: 0, unwrapped: 0 };
  collect(said, out);
  return out;
}

function collect(node, out) {
  if (Array.isArray(node)) {
    for (const one of node) collect(one, out);
    return;
  }
  if (node && typeof node === "object") {
    if (typeof node.identifier?.id === "string" && node.identifier.id !== "") {
      out.entries.push(node);
      return;
    }
    if (Array.isArray(node.value)) {
      out.unwrapped += 1;
      collect(node.value, out);
      return;
    }
  }
  out.dropped += 1;
}

export function entryFor(id, version, dest, at) {
  return {
    identifier: { id },
    version,
    location: { $mid: 1, path: dest, scheme: "file" },
    relativeLocation: basename(dest),
    metadata: { installedTimestamp: at, source: "vsix" },
  };
}

// [[spec/design_output/extension#a-lost-id-stands-refused]]
export function upsert(said, mine) {
  const id = mine.identifier.id;
  const was = said.entries.map((one) => one.identifier.id);
  const kept = said.entries.filter((one) => one.identifier.id !== id);
  const entries = [...kept, mine];

  const holds = new Set(entries.map((one) => one.identifier.id));
  const lost = was.filter((one) => one !== id && !holds.has(one));
  return { entries, lost, replaced: was.includes(id) };
}

// [[spec/design_output/extension#a-file-another-program-owns]]
export function register(files, folder, mine) {
  const where = join(folder, LIST);
  const text = files.exists(where) ? files.read(where) : "[]";
  const said = readEntries(text);
  if (said.unreadable) {
    return { wrote: false, why: "the list reads as no JSON at all, so it stands as it is" };
  }

  const found = upsert(said, mine);
  if (found.lost.length) {
    return { wrote: false, why: `writing would lose ${found.lost.join(", ")}, so nothing went in` };
  }

  if (files.exists(where)) files.write(join(folder, KEPT), text);
  files.write(where, `${JSON.stringify(found.entries)}\n`);
  return { wrote: true, why: found.replaced ? "the entry stood already, and it stands again" : "the entry went in" };
}

export function rootHere() {
  return dirname(dirname(dirname(fileURLToPath(import.meta.url))));
}

export function manifestPath(root) {
  return join(root, "src", "extension", "package.json");
}

function main(env) {
  if (!env.HOME) {
    console.error("This box names no HOME, so the editor's list has no folder.");
    return 1;
  }

  const files = disk();
  const said = JSON.parse(files.read(manifestPath(rootHere())));
  const id = `${said.publisher}.${said.name}`;
  const folder = join(env.HOME, ".vscode", "extensions");
  const dest = join(folder, `${id}-${said.version}`);

  const found = register(files, folder, entryFor(id, said.version, dest, clock().now().getTime()));
  console.log(`${id}: ${found.why}.`);
  return found.wrote ? 0 : 1;
}

if (process.argv[1]?.endsWith("editor.js")) process.exit(main(process.env));
