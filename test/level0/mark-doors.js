// The doors a served case drives: a box the server builds over a disk in
// memory, and a disk refusing the writes the real one refuses. The cases stand
// in the files beside this one, one file a door.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { dirname } from "node:path";
import { boxOf, decide } from "../../src/bridge/server.js";
import { onWrite } from "../../src/bridge/write.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk, norm } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";

export const TREE = "/tree";
const LINES = 40;

// A text of numbered lines, so a case names a line by its number. [[spec/guidance/code/testing]]
export const NUMBERED = Array.from(
  { length: LINES },
  (_, at) => `line ${at + 1}\n`,
).join("");

// The real disk refuses a write into a folder nobody made, and a write where a folder stands, so the fake refuses both. [[spec/guidance/code/testing]]
export function realDisk(seed = {}) {
  const inner = fakeDisk(seed);
  const write = (path, text) => {
    if (!inner.files.has(norm(path)) && inner.exists(path)) {
      throw Object.assign(new Error(`a folder stands at ${path}`), { code: "EISDIR" });
    }
    if (!inner.exists(dirname(path))) {
      throw Object.assign(new Error(`no folder stands at ${dirname(path)}`), {
        code: "ENOENT",
      });
    }
    inner.write(path, text);
  };
  return new Proxy(inner, {
    get: (held, key) => (key === "write" ? write : held[key]),
  });
}

// A box the server builds, one a server start, so two boxes over one disk read as a restart. [[spec/design_output/level0#a-restart-fills-the-box]]
export function served(disk, clock = fakeClock()) {
  return boxOf(TREE, TREE, {
    disk,
    clock,
    log: fakeLog(),
    proc: { run: () => ({ exitCode: 1, stdout: "", stderr: "" }) },
    index: {
      dead: () => "",
      fault: () => "",
      warm: () => ({ warmed: false }),
      ask: () => ({ files: [] }),
    },
    vale: { stands: () => false },
    biome: { stands: () => false },
  });
}

// One tool call through decide, the road every call of the agent takes. [[spec/design_output/level0#the-bridgehead-and-the-server]]
export function called(box, e) {
  return decide({ event: "tool.call", e }, box);
}

// The write door stands where the harness's own Edit reaches it no more, so a case drives it straight. [[spec/design_output/level0#a-write-names-its-ticket]]
export function wrote(box, e) {
  return onWrite(e, box);
}

export const edits = (path, from, to) => ({
  tool: "Edit",
  file_path: path,
  old_string: from,
  new_string: to,
});

export const refused = (said) => String(said?.result?.deny ?? "");
