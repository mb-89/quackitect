// Which projection owns a path. The write door asks this before it turns a
// hand away, and names the source that hand edits instead. The projections
// themselves stand in projection.js beside this file.
// [[spec/design_output/projection#the-write-door-refuses-one]]

// [[spec/design_output/projection#the-write-door-refuses-one]]
export function ownerOf(entries, path) {
  const said = shown(path);
  if (!said) return undefined;
  const here = entries.filter((entry) => under(said, folderOf(entry.target)));
  // An entry naming what it writes owns those files, and its neighbour owns the rest. [[spec/design_output/projection#the-write-door-refuses-one]]
  const named = here.filter((entry) => writesIt(entry, said));
  const rows = named.length ? named : here.filter((entry) => !entry.writes);
  return rows.sort((a, b) => folderOf(b.target).length - folderOf(a.target).length)[0];
}

// [[spec/design_output/projection#the-write-door-refuses-one]]
export function under(said, target) {
  if (!target) return false;
  return (
    said === target || said.startsWith(`${target}/`) || said.includes(`/${target}/`)
  );
}

export function folderOf(target) {
  return shown(target).replace(/\/+$/, "");
}

export function shown(path) {
  return String(path ?? "")
    .split("\\")
    .join("/")
    .replace(/^\.\//, "");
}

// [[spec/design_output/projection#the-write-door-refuses-one]]
function writesIt(entry, said) {
  const globs = [entry?.writes ?? []].flat().filter(Boolean);
  if (!globs.length) return false;
  const name = String(said).split("/").pop();
  return globs.some((glob) => globOf(glob).test(name));
}

function globOf(glob) {
  const pattern = String(glob)
    .split("*")
    .map((one) => one.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${pattern}$`);
}
