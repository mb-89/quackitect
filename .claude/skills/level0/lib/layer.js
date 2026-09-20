// The method root holds a base, and the work root inherits it. A file the work
// root names again replaces that one, a name it alone holds joins the set, and
// everything it stays silent about comes down as it stands.
// [[spec/design_output/vehicle#the-work-root-inherits]]

// [[spec/design_output/vehicle#the-work-root-inherits]]
export function layered(under, over) {
  const out = new Map();
  for (const one of under ?? []) out.set(one.name, { ...one, layer: "method" });
  for (const one of over ?? []) out.set(one.name, { ...one, layer: "work" });
  return [...out.values()];
}

// [[spec/design_output/vehicle#the-work-root-inherits]]
export function deeply(under, over) {
  const out = { ...(under ?? {}) };
  for (const [name, value] of Object.entries(over ?? {})) {
    const held = out[name];
    const both = plain(value) && plain(held);
    out[name] = both ? deeply(held, value) : value;
  }
  return out;
}

// A reader over one root, answering relative paths. [[spec/design_output/vehicle#the-work-root-inherits]]
export function rooted(disk, root) {
  const at = (rel) => joined(root, rel);
  return {
    exists: (rel) => disk.exists(at(rel)),
    read: (rel) => disk.read(at(rel)),
    list: (rel) => (disk.exists(at(rel)) ? disk.list(at(rel)) : []),
  };
}

// The work root's file wins, a folder lists as the union, and a JSON file both roots hold joins key by key. [[spec/design_output/vehicle#the-work-root-inherits]]
export function inherits(disk, method, work) {
  const under = rooted(disk, method);
  const over = rooted(disk, work);
  if (joined(method, "") === joined(work, "")) return over;
  return {
    exists: (rel) => over.exists(rel) || under.exists(rel),
    read: (rel) => {
      if (!over.exists(rel)) return under.read(rel);
      if (!under.exists(rel) || !String(rel).endsWith(".json")) return over.read(rel);
      return JSON.stringify(
        deeply(parsed(under.read(rel)), parsed(over.read(rel))),
        null,
        2,
      );
    },
    list: (rel) => layered(under.list(rel), over.list(rel)),
  };
}

function parsed(text) {
  try {
    return JSON.parse(String(text ?? ""));
  } catch {
    return {};
  }
}

function joined(root, rel) {
  const base = String(root ?? "").replace(/[\\/]+$/, "");
  return base ? `${base}/${rel}` : String(rel);
}

function plain(said) {
  return Boolean(said) && typeof said === "object" && !Array.isArray(said);
}
