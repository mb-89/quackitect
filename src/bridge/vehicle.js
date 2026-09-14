// Which vehicle drives a folder, and at which port. A project points at its
// vehicle in .se/vehicle.json, and a folder with no pointer is a vehicle
// pointing at itself. The register in the user's home holds every vehicle
// and the port it blocks, so two vehicles on one box take two ports. A folder
// that is neither becomes a project on the first start: it gets the one hook
// and the pointer, and nothing else of the vehicle.
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

// The vehicle a folder points at: its pointer, or itself where it is a vehicle.
export function vehicleOf(disk, env, time, work) {
  const pointed = pointerOf(readIf(disk, join(work, POINTER)));
  if (pointed) return { ...pointed, itself: false, made: false };
  if (!isVehicle(disk, work)) return null;
  return { method: work, port: registeredPort(disk, env, time, work), itself: true, made: false };
}

// The folder becomes a project of the vehicle: the one hook and the pointer, and nothing else.
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

// The folder to start the server for: its vehicle, or a project made on the spot.
export function settles(disk, env, time, work, vehicle) {
  return vehicleOf(disk, env, time, work) ?? makesProject(disk, env, time, work, vehicle);
}

export function isVehicle(disk, folder) {
  return disk.exists(join(folder, MARKER)) && disk.exists(join(folder, "src", "bridge", "server.js"));
}

// The port the register holds for a vehicle, taken and written on the first ask.
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
