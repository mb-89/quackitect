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

// [[spec/design_output/vehicle#the-work-root-inherits]]
export function inherits(disk, _method, work) {
  return rooted(disk, work);
}

function joined(root, rel) {
  const base = String(root ?? "").replace(/[\\/]+$/, "");
  return base ? `${base}/${rel}` : String(rel);
}

function plain(said) {
  return Boolean(said) && typeof said === "object" && !Array.isArray(said);
}
