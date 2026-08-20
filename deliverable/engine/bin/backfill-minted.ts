// One-shot backfill: every trace node without minted_in is stamped with the
// first iteration, which is where everything unstamped came from.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const trace = join(root, "spec", "trace");
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
const i1 = (git("branch", "--list", "--format=%(refname:short)", "it/i1-*").split("\n")[0] ?? "").replace(/^it\//, "") || "i1";
let stamped = 0;
for (const kind of readdirSync(trace)) {
  const dir = join(trace, kind);
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const abs = join(dir, f);
    const text = readFileSync(abs, "utf8");
    if (!text.startsWith("---\n") || /^minted_in:/m.test(text)) continue;
    writeFileSync(abs, text.replace(/^---\n/, `---\nminted_in: ${i1}\n`), "utf8");
    stamped++;
  }
}
console.log(`minted_in backfilled on ${stamped} node(s)`);
