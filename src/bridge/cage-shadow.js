// The cage's shadow: while the slice reads shadow, the bridge posts each
// event and its own decision to the hooks IO module, and waits on nothing.
// [[spec/tickets/the-hooks-door-lands]]

import { join } from "node:path";
import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { http } from "../doors/http.js";
import { asksText } from "./config.js";

const KEY = "migration.cage";
const SHADOW = "shadow";
// The file the hooks IO module writes its port and token to. [[spec/tickets/hooks-standing-file-names-token]]
const STANDING = `${RUN}/hooks.json`;

// A refusal, a dead port or a missing file leaves the bridge's answer standing. A box carrying no http door takes the real one. [[spec/design_output/level0#a-door-that-throws-passes]]
export function shadowsCage(box, said, decided, door = box?.http ?? http()) {
  if (asksText(box, KEY) !== SHADOW) return null;
  const standing = parsed(box.disk, join(box.work, ...STANDING.split("/")));
  const port = Number(standing?.port);
  if (!port) return null;
  return Promise.resolve()
    .then(() =>
      door.send(`http://127.0.0.1:${port}/hook`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${standing.token ?? ""}`,
        },
        body: JSON.stringify({ ...said, old: decided }),
      }),
    )
    .catch(() => null);
}

function parsed(disk, at) {
  try {
    return JSON.parse(String(disk.read(at)));
  } catch {
    return null;
  }
}
