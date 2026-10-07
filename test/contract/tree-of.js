// The tree a contract case reads: the disk under a root, and the paths git
// tracks there. The schema and ticket cases read it until schema-libs-leave.
// [[spec/design_output/tree#the-tree-handed-in]]

import { isDraft } from "../../.claude/skills/level0/lib/paths.js";

// [[spec/design_output/tree#the-tree-handed-in]]
export function treeOf(it) {
  const at = (path) => `${it.root}/${path}`;
  let held = null;
  return {
    words: it.words ?? 0,
    node: it.node ?? "",
    box: it.box ?? {},
    read(path) {
      try {
        return it.disk.read(at(path));
      } catch {
        return "";
      }
    },
    exists: (path) => it.disk.exists(at(path)),
    names(folder, end) {
      try {
        return it.disk
          .list(at(folder))
          .filter((one) => one.kind === "file" && one.name.endsWith(end))
          .map((one) => one.name);
      } catch {
        return [];
      }
    },
    paths() {
      if (held) return held;
      held = it.git
        .run(["ls-files"], true)
        .out.split(/\r?\n/)
        .map((one) => one.trim())
        .filter(Boolean)
        .filter((one) => !isDraft(one))
        .filter((one) => it.disk.exists(at(one)));
      return held;
    },
  };
}
