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

function plain(said) {
  return Boolean(said) && typeof said === "object" && !Array.isArray(said);
}
