// The vehicle a project carries, and the port the register hands it.
// [[spec/design_output/vehicle#the-register-holds-the-port]]

import { join } from "node:path";
import {
  entryOf,
  MARKER,
  POINTER,
  pointerOf,
  portOf,
  withPort,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { attach, identityHere, readRegister, registerVehicle } from "../scripts/vehicle.js";

const HOOK = ".claude/skills/level0";
// The hook imports its own folder, so the copy takes what it reaches. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
const FILES = [
  "hooks/level0.js",
  "hooks/hooks.json",
  ".claude-plugin/plugin.json",
  "lib/apply.js",
  "lib/folders.js",
  "lib/log.js",
  "lib/search.js",
  "lib/undo.js",
  "lib/vehicle.js",
];

export function vehicleOf(disk, env, time, work, pid, windows = false) {
  const pointed = pointerOf(readIf(disk, join(work, POINTER)));
  if (pointed) return { ...pointed, itself: false, made: false };
  if (!isVehicle(disk, work)) return null;
  const port = registeredPort(disk, env, time, work, pid, windows);
  return { method: work, port, itself: true, made: false };
}

export function makesProject(disk, env, time, work, vehicle, pid, windows = false) {
  const port = registeredPort(disk, env, time, vehicle, pid, windows);
  for (const rel of FILES) {
    const to = join(work, HOOK, rel);
    disk.makeDir(join(to, ".."));
    disk.write(to, disk.read(join(vehicle, HOOK, rel)));
  }
  disk.makeDir(join(work, POINTER, ".."));
  disk.write(
    join(work, POINTER),
    `${JSON.stringify({ method: vehicle, port }, null, 2)}\n`,
  );
  return { method: vehicle, port, itself: false, made: true };
}

export function settles(disk, env, time, work, vehicle, pid, windows = false) {
  return (
    vehicleOf(disk, env, time, work, pid, windows) ??
    makesProject(disk, env, time, work, vehicle, pid, windows)
  );
}

// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
// The pid comes off the root, so an identity made here replays in a case. [[spec/design_output/doors#a-door-reads-the-outside]]
export function attachTo(disk, env, time, work, vehicle, pid, windows = false) {
  attach(disk, time, work, identityHere(disk, time, vehicle, pid));
  return settles(disk, env, time, work, vehicle, pid, windows);
}

export function isVehicle(disk, folder) {
  return (
    disk.exists(join(folder, MARKER)) &&
    disk.exists(join(folder, "src", "bridge", "server.js"))
  );
}

export function registeredPort(disk, env, time, method, pid, windows = false) {
  const held = readRegister(disk, env, windows);
  const known = portOf(held, method);
  if (known) return known;
  const id = identityHere(disk, time, method, pid);
  const entry = withPort(
    held,
    entryOf(id, versionOf(disk, method), method, time.stamp()),
  );
  registerVehicle(disk, env, entry, windows);
  return entry.port;
}

function versionOf(disk, method) {
  try {
    return String(JSON.parse(disk.read(join(method, "package.json"))).version ?? "0");
  } catch {
    return "0";
  }
}

function readIf(disk, at) {
  try {
    return disk.read(at);
  } catch {
    return "";
  }
}
