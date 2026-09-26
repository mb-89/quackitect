// Git over a fake process, so a test drives a branch and touches nothing. It
// answers `ran`, the commands it saw, in the order it saw them.
// [[spec/design_output/doors#a-door-standing-on-another]]

import { TRUNK } from "../../../.claude/skills/level0/lib/trunk.js";
import { git } from "../git.js";
import { behaves } from "./behaves.js";
import { fakeProc } from "./proc.js";

export function fakeGit(answers = {}, root = "/tree") {
  const outside = fakeProc({ git: { exitCode: 0 }, ...answers });
  return behaves({ ...git(outside, root), proc: outside, ran: outside.ran }, "git");
}

// A trunk as git keeps it. A commit names each path it changes and the text it leaves, and a branch's own commit stands off the first-parent line. It answers `rev-parse`, `log` and `show` by their arguments, and `log` reads the trunk ref alone. [[spec/tickets/the-retro-reads-cloud-retros]]
export function fakeTrunk(commits = [], head = "abc123") {
  return fakeGit({
    git: (argv) => {
      const args = argv.slice(1);
      if (args[0] === "rev-parse") return { stdout: head };
      if (args[0] === "log") return logOf(commits, args);
      if (args[0] === "show") return shownAt(commits, args[1]);
      return { exitCode: 1, stderr: `this fake answers no git ${args[0]}` };
    },
  });
}

const SINCE = "--since=";
const FORMAT = "--format=";

// [[spec/tickets/the-retro-reads-cloud-retros]]
function logOf(commits, args) {
  if (!args.includes(TRUNK)) return { exitCode: 128, stderr: "a ref this fake lacks" };
  const firstParent = args.includes("--first-parent");
  const since = Date.parse(flagOf(args, SINCE));
  const grep = args.includes("-G") ? new RegExp(args[args.indexOf("-G") + 1], "m") : null;
  const format = flagOf(args, FORMAT) || "%H";
  const under = args.slice(args.indexOf("--") + 1);
  const rows = [];
  for (const one of [...commits].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))) {
    if (firstParent && !one.trunk) continue;
    if (Number.isFinite(since) && Date.parse(one.at) < since) continue;
    const names = Object.keys(one.changes).filter(
      (path) =>
        under.some((top) => path.startsWith(`${top}/`)) &&
        (!grep || changedLines(commits, one, path).some((row) => grep.test(row))),
    );
    if (!names.length) continue;
    rows.push(format.replace("%H", one.sha).replace("%cI", one.at));
    if (args.includes("--name-only")) rows.push("", ...names);
  }
  return { stdout: rows.join("\n") };
}

function flagOf(args, flag) {
  return args.find((one) => one.startsWith(flag))?.slice(flag.length) ?? "";
}

// The lines a commit adds or drops against the trunk commit before it. [[spec/tickets/the-retro-reads-cloud-retros]]
function changedLines(commits, one, path) {
  const before = commits
    .filter((other) => other.trunk && other.changes[path] && Date.parse(other.at) < Date.parse(one.at))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];
  const was = new Set(String(before?.changes[path] ?? "").split("\n"));
  const now = new Set(one.changes[path].split("\n"));
  return [...[...now].filter((row) => !was.has(row)), ...[...was].filter((row) => !now.has(row))];
}

// [[spec/tickets/the-retro-reads-cloud-retros]]
function shownAt(commits, said) {
  const [sha, path] = String(said).split(":");
  const text = commits.find((one) => one.sha === sha)?.changes[path];
  return text === undefined ? { exitCode: 128, stderr: `${said} stands nowhere` } : { stdout: text };
}
