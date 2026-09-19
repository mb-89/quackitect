// A copy of this tooling, and the project it drives. A copy carries an
// identity, a project names the copy driving it, and a register turns an
// identity into a place, so either tree moves and the pair still holds.
// [[spec/design_output/vehicle#three-things-a-copy-needs]]

import { RUN } from "./folders.js";

export const COPY = `${RUN}/copy.json`;
export const PROJECT = `${RUN}/project.json`;
export const REGISTER = "registry.json";
export const MARKER = ".claude/skills/level0/.claude-plugin/plugin.json";

// [[spec/design_output/vehicle#what-travels-into-a-copy]]
export const LEFT = [".git", ".se", "node_modules", "_to_delete"];

// [[spec/design_output/vehicle#three-things-a-copy-needs]]
export function copyOf(read, fresh, at) {
  const held = parsed(read);
  if (held?.id) return { record: held, made: false };
  return { record: { id: String(fresh), made: String(at) }, made: true };
}

// [[spec/design_output/vehicle#a-project-names-its-driver]]
export function drivenOf(read) {
  const held = parsed(read);
  return held?.driver ? held : null;
}

export function attaches(id, at) {
  return { driver: String(id), since: String(at) };
}

// [[spec/design_output/vehicle#the-register-places-an-identity]]
export function registers(read, entry) {
  const held = Array.isArray(parsed(read)) ? parsed(read) : [];
  const kept = held.filter(
    (one) => one?.id !== entry.id && !same(one?.method_root ?? "", entry.method_root),
  );
  return [...kept, entry];
}

export function entryOf(id, version, method, at) {
  return {
    id: String(id),
    version: String(version),
    method_root: String(method),
    registered: String(at),
  };
}

// [[spec/design_output/vehicle#the-register-places-an-identity]]
export function resolves(list, driver) {
  for (const one of list ?? []) {
    if (one?.id === driver && one?.method_root) return one.method_root;
  }
  return "";
}

// [[spec/design_output/vehicle#the-register-holds-the-port]]
export const PORT_BASE = 6510;
export const POINTER = ".se/.runtime/vehicle.json";

export function portOf(list, method) {
  for (const one of list ?? []) {
    if (one?.method_root && same(one.method_root, method) && Number(one.port)) return Number(one.port);
  }
  return 0;
}

export function withPort(list, entry) {
  const taken = new Set(
    (list ?? [])
      .filter((one) => one?.id !== entry.id && !same(one?.method_root ?? "", entry.method_root))
      .map((one) => Number(one?.port) || 0),
  );
  let port = PORT_BASE;
  while (taken.has(port)) port += 1;
  return { ...entry, port };
}

// [[spec/design_output/vehicle#a-project-names-its-driver]]
export function pointerOf(read) {
  const held = parsed(read);
  if (!held?.method) return null;
  return { method: String(held.method), port: Number(held.port) || PORT_BASE };
}

// [[spec/design_output/vehicle#one-copy-is-no-question]]
export function onlyCopy(list) {
  const roots = [];
  for (const one of list ?? []) {
    if (one?.method_root && !roots.includes(one.method_root)) roots.push(one.method_root);
  }
  return roots.length === 1 ? roots[0] : "";
}

// [[spec/design_output/vehicle#what-travels-into-a-copy]]
export function travels(rel) {
  const said = String(rel ?? "").split("\\").join("/");
  if (!said || said === ".") return false;
  return !LEFT.includes(said.split("/")[0]);
}

// [[spec/design_output/vehicle#one-tree-drives-itself]]
export function pairOf(method, work) {
  const held = { method: String(method ?? ""), work: String(work ?? "") };
  if (!held.method) return { ...held, method: held.work, itself: true };
  if (!held.work) return { ...held, work: held.method, itself: true };
  return { ...held, itself: same(held.method, held.work) };
}

// A Windows path reads the same in any case, because the editor hands its drive letter in lower case and a shell in upper. [[spec/design_output/vehicle#the-register-holds-the-port]]
export function same(one, other) {
  return rooted(one) === rooted(other);
}

function rooted(said) {
  const path = slashed(said).replace(/\/+$/, "");
  return DRIVE.test(path) ? path.toLowerCase() : path;
}

const DRIVE = /^[A-Za-z]:\//;

function slashed(said) {
  return String(said ?? "").split("\\").join("/");
}

function parsed(read) {
  try {
    return JSON.parse(String(read ?? ""));
  } catch {
    return null;
  }
}

// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
export const LINK = "vehicle.json";
export const TEMPLATE = "src/stub";
export const SETTINGS = ".claude/settings.json";
export const KEEP = ".gitkeep";
export const STUB_FOLDERS = ["project/spec/tickets", "project/spec/guidance", "project/src"];

// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
export function brandOf(method) {
  const parts = slashed(method).replace(/\/+$/, "").split("/");
  const last = parts[parts.length - 1] ?? "";
  return last
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
export function emptyBrand(method) {
  const parts = slashed(method).replace(/\/+$/, "").split("/");
  const last = parts[parts.length - 1] ?? "";
  return `${last} carries no letter and no digit, so it slugs to an empty brand. Rename the folder to one a marketplace takes, or move the vehicle into one.`;
}

// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
export function brandedJson(text, brand) {
  const held = parsed(text);
  if (!held || typeof held !== "object" || Array.isArray(held)) return String(text);
  const out = { ...held };
  if (out.owner && typeof out.owner === "object") {
    out.owner = { ...out.owner, name: brand };
    out.name = brand;
  }
  if (out.author && typeof out.author === "object") {
    out.author = { ...out.author, name: brand };
  }
  return `${JSON.stringify(out, null, 2)}\n`;
}

// [[spec/design_output/level0#a-stub-names-its-vehicle]]
export function shimSettings(text, vehicle, brand) {
  const held = parsed(text);
  const out = held && typeof held === "object" && !Array.isArray(held) ? { ...held } : {};
  out.extraKnownMarketplaces = {
    ...(out.extraKnownMarketplaces ?? {}),
    [brand]: { source: { source: "directory", path: vehicle } },
  };
  const id = `level0@${brand}`;
  const standing = Array.isArray(out.enabledPlugins) ? out.enabledPlugins : [];
  out.enabledPlugins = standing.includes(id) ? standing : [...standing, id];
  return `${JSON.stringify(out, null, 2)}\n`;
}

export function upstreamOf(remote, named) {
  return String(named ?? "").trim() || String(remote ?? "").trim();
}

// [[spec/design_output/vehicle#the-record-names-the-vehicle]]
export function linkOf(id, name, upstream, version, at) {
  return {
    vehicle: String(id),
    name: String(name),
    upstream: String(upstream),
    version: String(version),
    made: String(at),
  };
}

export function settingsOf(read) {
  const held = parsed(read);
  if (!held || typeof held !== "object" || Array.isArray(held)) return {};
  return Object.fromEntries(Object.entries(held).filter(([key]) => !key.startsWith("$")));
}

export function stubFiles(template) {
  return [...STUB_FOLDERS.map((one) => `${one}/${KEEP}`), LINK, SETTINGS, ...(template ?? [])];
}
