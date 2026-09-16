// The server behind the bridgehead, started where nothing answers its port.
// A cloud box has nobody to press the hook button, so the pull that takes a
// branch there starts it detached and says so.
// [[spec/design_output/level0#the-cloud-starts-the-server]]

import { POINTER, pointerOf } from "../../.claude/skills/level0/lib/vehicle.js";

const HEALTH_WAIT = 2000;
const SERVER = "src/bridge/server.js";

export function portIn(it) {
  try {
    return pointerOf(it.disk.read(it.join(it.root, POINTER))).port;
  } catch {
    return pointerOf(`{"method":"${it.root}"}`).port;
  }
}

export function probeOf(node, port) {
  const at = `http://127.0.0.1:${port}/health`;
  const asks = `fetch("${at}",{signal:AbortSignal.timeout(${HEALTH_WAIT})}).then((r)=>r.json()).then((b)=>process.exit(b.ok?0:1),()=>process.exit(1))`;
  return [node, "-e", asks];
}

// The stub's bridgehead carries a copy of this line, because it imports nothing. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
export function startOf(root) {
  return ["sh", "-c", `nohup node "$1/${SERVER}" "$1" >/dev/null 2>&1 &`, "sh", root];
}

// [[spec/design_output/level0#the-cloud-starts-the-server]]
export function servesHere(it) {
  const port = portIn(it);
  if (it.proc.run(probeOf(it.node ?? "node", port), { cwd: it.root }).exitCode === 0) {
    return `The server answers at port ${port}.`;
  }
  const started = it.proc.run(startOf(it.root), { cwd: it.root });
  return started.exitCode === 0
    ? `The server starts detached at port ${port}, because nothing answered there.`
    : `No server answers at port ${port}, and the start fails: ${started.stderr.trim() || `exit ${started.exitCode}`}`;
}

// [[spec/design_output/pull#the-engine-takes-the-branch]]
export function serving(it, code) {
  if (code !== 0 || !it.cloud) return code;
  console.log(servesHere(it));
  return code;
}
