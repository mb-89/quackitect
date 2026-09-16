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
import { copyHere, readRegister, registerCopy } from "../scripts/vehicle.js";

const HOOK = ".claude/skills/level0";
const FILES = ["hooks/level0.js", "hooks/hooks.json", ".claude-plugin/plugin.json"];

export function vehicleOf(disk, env, time, work) {
  const pointed = pointerOf(readIf(disk, join(work, POINTER)));
  if (pointed) return { ...pointed, itself: false, made: false };
  if (!isVehicle(disk, work)) return null;
  return { method: work, port: registeredPort(disk, env, time, work), itself: true, made: false };
}

export function makesProject(disk, env, time, work, vehicle) {
  const port = registeredPort(disk, env, time, vehicle);
  for (const rel of FILES) {
    const to = join(work, HOOK, rel);
    disk.makeDir(join(to, ".."));
    disk.write(to, disk.read(join(vehicle, HOOK, rel)));
  }
  disk.makeDir(join(work, ".se"));
  disk.write(join(work, POINTER), `${JSON.stringify({ method: vehicle, port }, null, 2)}\n`);
  return { method: vehicle, port, itself: false, made: true };
}

export function settles(disk, env, time, work, vehicle) {
  return vehicleOf(disk, env, time, work) ?? makesProject(disk, env, time, work, vehicle);
}

export function isVehicle(disk, folder) {
  return disk.exists(join(folder, MARKER)) && disk.exists(join(folder, "src", "bridge", "server.js"));
}

export function registeredPort(disk, env, time, method) {
  const held = readRegister(disk, env);
  const known = portOf(held, method);
  if (known) return known;
  const id = copyHere(disk, time, method);
  const entry = withPort(held, entryOf(id, versionOf(disk, method), method, time.stamp()));
  registerCopy(disk, env, entry);
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
