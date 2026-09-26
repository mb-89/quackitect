// Whether a shell command puts a commit on trunk. A cloud box works a
// branch, so this decides what the write door refuses there.
// [[spec/design_output/work#a-box-writes-its-branch]]

import { BREAKS, baseName, SHELLS, tokensOf } from "./tokens.js";

export const TRUNK = "main";

// A verb of this tree's own takes its words whole, up to the next operator, so git named in them lands nowhere. [[spec/design_output/work#a-box-writes-its-branch]]
const VERB_WORDS = /(RUNME\.(?:sh|ps1)\b)(?:[^&|;\n"']|"[^"]*"|'[^']*')*/g;
const GIT_VERB = (verb) =>
  new RegExp(`\\bgit\\s+(?:-\\S+(?:\\s+\\S+)?\\s+)*${verb}\\b`);

function gitSaid(command) {
  return String(command ?? "").replace(VERB_WORDS, "$1");
}

// Git counts where it is the command word of a segment, so a read quoting `git push` touches nothing. A `sh -c` body reads as a command of its own, and a prefix as `xargs` passes to the word behind it. [[spec/tickets/a-nested-git-still-lands]]
export function touchesGit(command) {
  const verbs = gitVerbsIn(String(command ?? ""));
  return { commits: verbs.includes("commit"), pushes: verbs.includes("push") };
}

const PREFIXES = new Set(["sudo", "env", "command", "nohup", "time", "exec", "xargs"]);
const ASSIGNS = /^[A-Za-z_][A-Za-z0-9_]*=/;

function gitVerbsIn(text) {
  const out = [];
  let segment = [];
  const settle = () => {
    out.push(...verbsOf(segment));
    segment = [];
  };
  for (const one of tokensOf(text)) {
    if (one.op && BREAKS.has(one.text)) settle();
    else if (!one.op) segment.push(one.text);
  }
  settle();
  return out;
}

function verbsOf(words) {
  let at = 0;
  while (
    at < words.length &&
    (ASSIGNS.test(words[at]) ||
      PREFIXES.has(baseName(words[at])) ||
      (at > 0 && words[at].startsWith("-")))
  )
    at++;
  const name = baseName(words[at]);
  if (SHELLS.has(name)) {
    const flag = words.indexOf("-c", at + 1);
    return flag < 0 ? [] : gitVerbsIn(words[flag + 1] ?? "");
  }
  if (name !== "git") return [];
  for (let i = at + 1; i < words.length; i++) {
    const one = words[i];
    if (!one.startsWith("-")) return [one];
    if (one === "-C" || one === "-c") i++;
  }
  return [];
}

// A push naming no branch, or naming `HEAD`, pushes the branch the box stands on. [[spec/design_output/work#a-box-writes-its-branch]]
export function landsOnTrunk(command, branch, trunk = TRUNK) {
  const { commits, pushes } = touchesGit(command);
  if (!commits && !pushes) return "";
  const said = gitSaid(command);
  if (pushes && new RegExp(`\\bpush\\b[^&|;]*\\b${trunk}\\b`).test(said)) return "push";
  if (pushes && branch === trunk && !namesABranch(said)) return "push";
  if (commits && branch === trunk) return "commit";
  return "";
}

function namesABranch(command) {
  const at = /\bpush\b([^&|;\n]*)/.exec(command);
  const words = (at?.[1] ?? "").trim().split(/\s+/).filter(Boolean);
  const refs = words.filter((one) => !one.startsWith("-")).slice(1);
  return refs.some((one) => one !== "HEAD");
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
  const forces = rest.some(
    (one) => one === "--force" || one === "-f" || one.startsWith("--force-with-lease"),
  );
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
