// Whether a shell command puts a commit on trunk. A cloud box works a
// branch, so this decides what the write door refuses there.
// [[spec/design_output/work#a-box-writes-its-branch]]

export const TRUNK = "main";

export function touchesGit(command) {
  const said = String(command ?? "");
  return {
    commits: /\bgit\s+(?:-\S+(?:\s+\S+)?\s+)*commit\b/.test(said),
    pushes: /\bgit\s+(?:-\S+(?:\s+\S+)?\s+)*push\b/.test(said),
  };
}

export function landsOnTrunk(command, branch, trunk = TRUNK) {
  const { commits, pushes } = touchesGit(command);
  if (!commits && !pushes) return "";

  if (pushes && new RegExp(`\\bpush\\b[^&|;]*\\b${trunk}\\b`).test(String(command))) {
    return "push";
  }
  if (branch === trunk) return "commit";
  return "";
}

// [[spec/design_output/work#a-version-branch-stands]]
export const VERSION = /^v\d+$/;

// [[spec/design_output/work#a-version-branch-stands]]
export function refIn(word) {
  const said = String(word ?? "");
  const plus = said.startsWith("+");
  const rest = plus ? said.slice(1) : said;
  const at = rest.indexOf(":");
  const from = at < 0 ? rest : rest.slice(0, at);
  const to = at < 0 ? rest : rest.slice(at + 1);
  const name = to.replace(/^refs\/heads\//, "");
  return { name: VERSION.test(name) ? name : "", empty: at >= 0 && from === "", plus };
}

// [[spec/design_output/work#a-version-branch-stands]]
export function versionRefs(command) {
  const found = [];
  for (const part of String(command ?? "").split(/&&|\|\||;/)) {
    const words = part.trim().split(/\s+/).filter(Boolean);
    const at = words.indexOf("git");
    if (at < 0) continue;
    found.push(...versionsIn(words.slice(at + 1)));
  }
  return found;
}

function versionsIn(rest) {
  const verb = rest.find((one) => !one.startsWith("-"));
  if (verb !== "push" && verb !== "branch") return [];
  const drops = rest.some((one) => ["--delete", "-d", "-D"].includes(one));
  const forces = rest.some((one) => one === "--force" || one === "-f" || one.startsWith("--force-with-lease"));
  const found = [];
  for (const word of rest) {
    if (word.startsWith("-")) continue;
    const ref = refIn(word);
    if (!ref.name) continue;
    if (drops || ref.empty) found.push({ name: ref.name, how: "delete" });
    else if (forces || ref.plus) found.push({ name: ref.name, how: "force" });
  }
  return found;
}

// [[spec/design_output/work#a-version-branch-stands]]
export function refusedVersion(found) {
  const names = [...new Set(found.map((one) => one.name))].join(", ");
  const drops = found.some((one) => one.how === "delete");
  return [
    `${names} is a version branch, and this command would ${drops ? "delete" : "rewrite"} it.`,
    "",
    "A version branch holds a whole earlier tree. Nothing else carries it, and a",
    "delete has already cost this tree one. So both push doors refuse the command.",
    "",
    "The owner takes it off, in the repository's own branch rules.",
  ].join("\n");
}
