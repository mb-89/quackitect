// The index behind the bridgehead, started where no door answers. A cloud box
// has nobody to press the hook button, so the pull that takes a branch there
// starts it and says so.
// [[spec/design_output/level0#the-cloud-starts-the-server]]

import { reasonOf, START } from "../../.claude/skills/level0/hooks/level0.ts";
import { inRun } from "../../.claude/skills/level0/lib/folders.js";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { POINTER, pointerOf } from "../../.claude/skills/level0/lib/vehicle.js";
import { registeredPort } from "../bridge/vehicle.js";

// The standing file the hooks door writes once it listens. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const HOOKS = inRun("hooks.json");

const answersAt = (port) => `The index answers at port ${port}.`;
const startsAt = (port) => `The index starts at port ${port}, because no door stood.`;
const standsAt = (port) => `The index stands at port ${port}.`;

// What the hooks door's standing file says, or nothing where none stands. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
function doorOf(it) {
  const at = it.join(it.root, ...HOOKS.split("/"));
  return it.disk.exists(at) ? String(it.disk.read(at)) : "";
}

function portOf(door) {
  try {
    return Number(JSON.parse(door).port) || 0;
  } catch {
    return 0;
  }
}

export function portIn(it) {
  try {
    return pointerOf(it.disk.read(it.join(it.root, POINTER))).port;
  } catch {
    // A vehicle tree carries no pointer, so the probe reads the port variable, then the register, as the bridge's listen does. [[spec/tickets/serve-probes-the-register-port]]
    const env = it.env ?? {};
    // The register stamps its entry with the clock, so a door holding none reads the base. [[spec/tickets/serve-probes-the-register-port]]
    const registered = it.clock
      ? registeredPort(
          it.disk,
          env,
          it.clock,
          it.root,
          it.pid ?? 0,
          Boolean(it.windows),
        )
      : pointerOf(`{"method":"${it.root}"}`).port;
    return Number(env.SE_BRIDGE_PORT) || registered;
  }
}

// One line starts the server on both roads, and the bridgehead holds it, because that hook reaches no module past its own folder and every other caller imports it there. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export function startOf(root, node = "node") {
  return [node, "-e", START, root, root];
}

// A desk start stands detached, so the shell that asks returns and the server stays. [[spec/design_output/level0#a-desk-serve-returns]]
export async function servesDetached(it) {
  return (await detachedStart(it)).said;
}

// The index answers its standing by starting its door where none answers, so one run starts it and probes it. [[spec/design_output/level0#a-desk-serve-returns]]
export async function detachedStart(it) {
  const was = doorOf(it);
  const stood = it.proc.run([it.join(it.root, ...BIN.split("/")), "standing"], {
    cwd: it.root,
  });
  if (stood.exitCode !== 0) {
    const why = String(stood.stderr ?? "").trim() || `it exits ${stood.exitCode}`;
    return { code: 1, said: `The index falls: ${why}` };
  }
  const door = doorOf(it);
  const port = portOf(door);
  return { code: 0, said: was && was === door ? answersAt(port) : startsAt(port) };
}

// [[spec/design_output/level0#the-cloud-starts-the-server]]
export function servesHere(it) {
  const was = doorOf(it);
  const started = it.proc.run(startOf(it.root, it.node ?? "node"), { cwd: it.root });
  if (started.exitCode !== 0) {
    const [, why] = reasonOf(started.exitCode);
    return `No index answers, and the start fails: ${String(started.stderr ?? "").trim() || why}`;
  }
  const door = doorOf(it);
  const port = portOf(door);
  return was && was === door ? answersAt(port) : standsAt(port);
}

// [[spec/design_output/pull#the-engine-takes-the-branch]]
export function serving(it, code) {
  if (code !== 0 || !it.cloud) return code;
  console.log(servesHere(it));
  return code;
}
