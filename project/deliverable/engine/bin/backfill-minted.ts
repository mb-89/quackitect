// One-shot backfill: every trace node without minted_in gets the id of
// the branch that first carried it. On trunk that is i1 wholesale; in a
// record worktree, a node absent from the trunk branch is the record's
// own. Runs in whatever tree is the working directory; the trunk branch
// name is v3, this repository's own.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const trace = join(root, "project", "spec", "trace");
if (!existsSync(trace)) {
  console.error(`no trace corpus under ${root}`);
  process.exit(1);
}
const git = (...args: string[]): string => {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};
const wt = root.replace(/\\/g, "/").match(/\/\.worktrees\/([^/]+)\/?$/);
const i1 = (git("branch", "--list", "--format=%(refname:short)", "it/i1-*").split("\n")[0] ?? "").replace(/^it\//, "") || "i1";
const onTrunk = (rel: string): boolean => {
  try {
    execFileSync("git", ["cat-file", "-e", `v3:${rel}`], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
let stamped = 0;
for (const kind of readdirSync(trace)) {
  const dir = join(trace, kind);
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const abs = join(dir, f);
    const text = readFileSync(abs, "utf8");
    if (!text.startsWith("---\n") || /^minted_in:/m.test(text)) continue;
    const rel = `project/spec/trace/${kind}/${f}`;
    const id = wt === null ? i1 : onTrunk(rel) ? i1 : wt[1];
    writeFileSync(abs, text.replace(/^---\n/, `---\nminted_in: ${id}\n`), "utf8");
    stamped++;
  }
}
console.log(`minted_in backfilled on ${stamped} node(s)`);
