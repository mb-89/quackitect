// An index in memory over a fake disk: the hashes it answers read the disk as
// it stands, so a case moves a note and the index sees the move.
// [[spec/design_output/doors#a-fake-behaves]]

import { hashText } from "../../../.claude/skills/level0/lib/hash.js";
import { behaves } from "./behaves.js";

export function fakeIndex(disk, root, join) {
  const asked = [];
  const hashes = (params) => {
    const out = {};
    for (const one of params?.asks ?? []) {
      const at = join(root, ...String(one.path).split("/"));
      if (!disk.exists(at)) continue;
      const text = String(disk.read(at));
      const size = Number(one.size ?? 0);
      out[one.path] = {
        hash: hashText(text),
        size: text.length,
        head: size > 0 && size <= text.length ? hashText(text.slice(0, size)) : "",
      };
    }
    return out;
  };
  return behaves(
    {
      asked,
      stands: () => true,
      dead: () => "",
      fault: () => "",
      ask: (method, params) => {
        asked.push({ method, params });
        return method === "hashes" ? hashes(params) : null;
      },
      warm: () => ({ warmed: false, dead: "" }),
    },
    "index",
  );
}
