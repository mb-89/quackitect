// A copy of this tooling, and the project it drives. A copy carries an
// identity, a project names the copy driving it, and a register turns an
// identity into a place, so either tree moves and the pair still holds.
// [[spec/design_output/vehicle#three-things-a-copy-needs]]

export const COPY = ".se/copy.json";
export const PROJECT = ".se/project.json";
export const REGISTER = "registry.json";
export const MARKER = ".claude/skills/level0/.claude-plugin/plugin.json";
export const CAGE = ".claude/skills/level0";
export const IGNORED = [".se/", ".claude/skills/level0"];

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
    (one) => one?.id !== entry.id && one?.method_root !== entry.method_root,
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

// [[spec/design_output/vehicle#a-project-borrows-its-cage]]
export function ignores(read) {
  const lines = String(read ?? "").split(/\r?\n/);
  const wanted = IGNORED.filter((one) => !lines.includes(one));
  if (!wanted.length) return "";

  const held = String(read ?? "");
  const under = held && !held.endsWith("\n") ? `${held}\n` : held;
  return `${under}${wanted.join("\n")}\n`;
}

// [[spec/design_output/vehicle#one-tree-drives-itself]]
export function pairOf(method, work) {
  const held = { method: String(method ?? ""), work: String(work ?? "") };
  if (!held.method) return { ...held, method: held.work, itself: true };
  if (!held.work) return { ...held, work: held.method, itself: true };
  return { ...held, itself: same(held.method, held.work) };
}

function same(one, other) {
  return slashed(one).replace(/\/+$/, "") === slashed(other).replace(/\/+$/, "");
}

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
