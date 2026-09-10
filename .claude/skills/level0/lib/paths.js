// The path a rule scopes on. The client hands the door an absolute path, and
// Vale and the judge both read the path the repo root holds.
// [[spec/design_output/level0#the-path-a-rule-reads]]

export function relativeTo(root, path) {
  const said = slashed(path);
  const at = slashed(root).replace(/\/+$/, "");
  if (!at) return said;

  const under = `${at}/`;
  if (said.toLowerCase().startsWith(under.toLowerCase()))
    return said.slice(under.length);
  return said;
}

export function matches(glob, path) {
  return globOf(glob).test(slashed(path));
}

function slashed(said) {
  return String(said ?? "")
    .split("\\")
    .join("/");
}

function globOf(glob) {
  const said = String(glob ?? "")
    .split(/(\*\*|\*|\?)/)
    .map((part) => {
      if (part === "**") return ".*";
      if (part === "*") return "[^/]*";
      if (part === "?") return "[^/]";
      return part.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    })
    .join("");
  return new RegExp(`^${said}$`);
}
