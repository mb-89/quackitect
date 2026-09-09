// Session records and exclusive handover ownership on disk.
// [[spec/design_output/copilot#state-between-processes]]

import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

export function session(root) {
  const base = realpathSync(root);
  const folder = join(base, ".se", "copilot");
  const hash = (text) => createHash("sha256").update(text).digest("hex");
  const path = (name) => {
    if (typeof name !== "string" || !name) throw new Error("Missing file path.");
    const target = resolve(base, name);
    const local = relative(base, target);
    if (!local || local.startsWith("..") || isAbsolute(local))
      throw new Error("Path outside this tree.");
    let parent = target;
    while (!existsSync(parent)) parent = dirname(parent);
    const actual = relative(base, realpathSync(parent));
    if (actual.startsWith("..") || isAbsolute(actual))
      throw new Error("Link outside this tree.");
    return target;
  };
  return {
    path,
    async withState(id, use) {
      if (typeof id !== "string" || !id)
        throw new Error("The hook needs a session ID.");
      path(".se/copilot");
      mkdirSync(folder, { recursive: true });
      const lock = join(folder, "lock");
      try {
        mkdirSync(lock);
      } catch {
        throw new Error(
          "Level zero is busy. Retry; inspect .se/copilot/lock after a crashed process.",
        );
      }
      const at = join(folder, `${hash(id)}.json`);
      try {
        writeFileSync(join(lock, "owner"), String(process.pid));
        const record = existsSync(at) ? JSON.parse(readFileSync(at, "utf8")) : {};
        const save = () => {
          const temp = `${at}.tmp`;
          writeFileSync(temp, JSON.stringify(record), { mode: 0o600 });
          renameSync(temp, at);
        };
        const claim = (name, text) => {
          const file = join(folder, `claim-${hash(name)}`);
          if (existsSync(file)) {
            const held = JSON.parse(readFileSync(file, "utf8"));
            if (held.session !== id)
              throw new Error(
                "Another session owns this handover. Finish or recover it first.",
              );
          } else {
            writeFileSync(file, JSON.stringify({ session: id, text }), {
              flag: "wx",
              mode: 0o600,
            });
          }
        };
        const release = (name) => {
          const file = join(folder, `claim-${hash(name)}`);
          if (existsSync(file) && JSON.parse(readFileSync(file, "utf8")).session === id)
            rmSync(file);
        };
        const result = await use(record, save, claim, release);
        save();
        return result;
      } finally {
        rmSync(lock, { recursive: true, force: true });
      }
    },
  };
}
