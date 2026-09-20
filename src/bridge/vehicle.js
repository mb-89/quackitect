// The vehicle a project carries, and the port the register hands it.
// [[spec/design_output/vehicle#the-register-holds-the-port]]

import { join, posix } from "node:path";
import {
  entryOf,
  HOOKS,
  importsOf,
  MANIFESTS,
  MARKER,
  modulesOf,
  PLUGIN_FOLDER,
  POINTER,
  pointerOf,
  portOf,
  withPort,
} from "../../.claude/skills/level0/lib/vehicle.js";
import {
  attach,
  identityHere,
  readRegister,
  registerVehicle,
} from "../scripts/vehicle.js";

export function vehicleOf(disk, env, time, work, windows = false) {
  const pointed = pointerOf(readIf(disk, join(work, POINTER)));
  if (pointed) return { ...pointed, itself: false, made: false };
  if (!isVehicle(disk, work)) return null;
  const port = registeredPort(disk, env, time, work, windows);
  return { method: work, port, itself: true, made: false };
}

export function makesProject(disk, env, time, work, vehicle, windows = false) {
  const port = registeredPort(disk, env, time, vehicle, windows);
  for (const rel of filesOf(disk, vehicle)) {
    const to = join(work, PLUGIN_FOLDER, rel);
    disk.makeDir(join(to, ".."));
    disk.write(to, disk.read(join(vehicle, PLUGIN_FOLDER, rel)));
  }
  disk.makeDir(join(work, POINTER, ".."));
  disk.write(
    join(work, POINTER),
    `${JSON.stringify({ method: vehicle, port }, null, 2)}\n`,
  );
  return { method: vehicle, port, itself: false, made: true };
}

// The files a stub takes: the two manifests, the modules the hooks manifest names, and the closure of their imports, read off the source itself. So a hook taking a new import hands the copy that file, and no list here goes stale. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
export function filesOf(disk, vehicle) {
  const out = [...MANIFESTS];
  const queue = modulesOf(readIf(disk, join(vehicle, PLUGIN_FOLDER, HOOKS)));
  while (queue.length) {
    const rel = queue.shift();
    if (out.includes(rel)) continue;
    out.push(rel);
    for (const one of importsOf(readIf(disk, join(vehicle, PLUGIN_FOLDER, rel)))) {
      queue.push(posix.join(posix.dirname(rel), one));
    }
  }
  return out;
}

export function settles(disk, env, time, work, vehicle, windows = false) {
  return (
    vehicleOf(disk, env, time, work, windows) ??
    makesProject(disk, env, time, work, vehicle, windows)
  );
}

// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
export function attachTo(disk, env, time, work, vehicle, windows = false) {
  attach(disk, time, work, identityHere(disk, time, vehicle));
  return settles(disk, env, time, work, vehicle, windows);
}

export function isVehicle(disk, folder) {
  return (
    disk.exists(join(folder, MARKER)) &&
    disk.exists(join(folder, "src", "bridge", "server.js"))
  );
}

export function registeredPort(disk, env, time, method, windows = false) {
  const held = readRegister(disk, env, windows);
  const known = portOf(held, method);
  if (known) return known;
  const id = identityHere(disk, time, method);
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
