// The quack a case's box carries, now that the prose readers ask quack alone:
// the binary under the box's root, and a prose topic keeping every finding
// but the rows a case lets fall.
// [[spec/tickets/go-prose-checks-stand-alone]]

import { join } from "node:path";
import { BIN } from "../../.claude/skills/level0/lib/index.js";

// Where the readers look for quack under a root. [[spec/tickets/go-prose-checks-stand-alone]]
export const quackUnder = (root) => join(root, BIN);

// The prose topic's answer to one request: each document keeps what `falls` leaves standing. [[spec/tickets/go-prose-checks-stand-alone]]
export function keepsProse(falls = () => false) {
  return (_argv, init = {}) => {
    const asked = JSON.parse(String(init.stdin ?? "{}"));
    const docs = (asked.docs ?? []).map((one) => ({
      kept: (one.found ?? []).filter((row) => !falls(row, one.text)),
    }));
    return { exitCode: 0, stdout: JSON.stringify({ docs }) };
  };
}

// A proc door answering quack prose alone, for a box that runs no other process. [[spec/tickets/go-prose-checks-stand-alone]]
export function proseProc(falls) {
  const answer = keepsProse(falls);
  const ran = [];
  return {
    ran,
    run(argv, init = {}) {
      ran.push({ argv: [...argv], init });
      return answer(argv, init);
    },
  };
}

// The box with quack on its disk, and the prose topic taught to its fake proc, or a proc of its own where it holds none. A box naming no root takes the one the case names. [[spec/tickets/go-prose-checks-stand-alone]]
export function carryQuack(it, falls, root = it.method ?? it.root) {
  const at = quackUnder(root);
  it.disk.write(at, "");
  if (it.proc?.teach) it.proc.teach([at, "prose"], keepsProse(falls));
  else it.proc = proseProc(falls);
  return it;
}
