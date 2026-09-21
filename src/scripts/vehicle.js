// A vehicle, made and placed. The pure half decides, the disk
// door writes, and a project keeps the identity of whatever drives it.
// [[spec/design_output/vehicle#three-things-a-vehicle-needs]]

import { dirname, join } from "node:path";
import {
  attaches,
  IDENTITY,
  identityOf,
  drivenOf,
  entryOf,
  MARKER,
  onlyVehicle,
  PROJECT,
  pairOf,
  REGISTER,
  registers,
  resolves,
  travels,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { homeIn } from "./editor.js";

// [[spec/design_output/vehicle#a-marker-names-the-root]]
const STAMP_TAIL = 12;
const HEX = 16;

export function methodRootFrom(files, start) {
  let here = String(start ?? "")
    .split("\\")
    .join("/")
    .replace(/\/+$/, "");
  while (here) {
    if (files.exists(join(here, MARKER))) return here;
    const up = here.slice(0, here.lastIndexOf("/"));
    if (!up || up === here) return "";
    here = up;
  }
  return "";
}

// The pid comes off the hand a root builds, so an identity replays in a case. [[spec/design_output/doors#a-door-reads-the-outside]]
export function identityHere(files, time, method, pid) {
  const at = join(method, IDENTITY);
  const said = identityOf(readIf(files, at), idOf(time, pid), time.stamp());
  if (said.made) {
    files.makeDir(dirname(at));
    files.write(at, `${JSON.stringify(said.record, null, 2)}\n`);
  }
  return said.record.id;
}

function idOf(time, pid) {
  const digits = time.stamp().replace(/[^0-9]/g, "");
  return `${Number(digits.slice(-STAMP_TAIL)).toString(HEX)}${Number(pid).toString(HEX)}`;
}

// [[spec/design_output/vehicle#the-register-places-an-identity]]
export function registerDirs(env, windows = false) {
  const said = env.SE_REGISTRY;
  if (said) return said.split(windows ? ";" : ":").filter(Boolean);
  const home = homeIn(env);
  return home ? [join(home, ...RUN.split("/"))] : [];
}

export function readRegister(files, env, windows = false) {
  const out = [];
  for (const dir of registerDirs(env, windows)) {
    const said = readIf(files, join(dir, REGISTER));
    for (const one of parsedList(said)) {
      if (one?.method_root && files.exists(join(one.method_root, MARKER)))
        out.push(one);
    }
  }
  return out;
}

export function registerVehicle(files, env, entry, windows = false) {
  let wrote = false;
  for (const dir of registerDirs(env, windows)) {
    const at = join(dir, REGISTER);
    try {
      files.makeDir(dir);
      files.write(
        at,
        `${JSON.stringify(registers(readIf(files, at), entry), null, 2)}\n`,
      );
      wrote = true;
    } catch {}
  }
  return wrote;
}

// [[spec/design_output/vehicle#a-project-names-its-driver]]
export function attach(files, time, work, id) {
  files.makeDir(dirname(join(work, PROJECT)));
  files.write(
    join(work, PROJECT),
    `${JSON.stringify(attaches(id, time.stamp()), null, 2)}\n`,
  );
}

export function detach(files, work) {
  files.remove(join(work, PROJECT));
}

// The shim names the work root, and the tree the command line runs in is the fallback. [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
export function rootsHere(files, env, start) {
  const work = String(env?.SE_WORK_ROOT ?? "").trim() || start;
  const here = methodRootFrom(files, start);
  if (here) return pairOf(here, work);

  const list = readRegister(files, env);
  const driven = drivenOf(readIf(files, join(work, PROJECT)));
  const named = driven ? resolves(list, driven.driver) : "";
  return pairOf(named || onlyVehicle(list), work);
}

// [[spec/design_output/vehicle#what-travels-into-a-vehicle]]
export function produce(files, method, dest, into) {
  if (!into && files.exists(dest)) {
    return { ok: false, why: `${dest} stands already. A vehicle lands in a new place` };
  }
  if (dest === method)
    return { ok: false, why: "a vehicle lands beside its method, elsewhere" };

  let count = 0;
  const walk = (rel) => {
    for (const one of files.list(rel ? join(method, rel) : method)) {
      const next = rel ? `${rel}/${one.name}` : one.name;
      if (!travels(next)) continue;
      if (one.kind === "dir") {
        files.makeDir(join(dest, next));
        walk(next);
        continue;
      }
      const at = join(dest, next);
      files.write(at, files.read(join(method, next)));
      if (next.endsWith(".sh")) files.runnable(at);
      count++;
    }
  };

  files.makeDir(dest);
  walk("");
  return { ok: true, count };
}

export function entryFor(files, time, env, method, version, pid) {
  const id = identityHere(files, time, method, pid);
  return { id, entry: entryOf(id, version, method, time.stamp()), env };
}

function readIf(files, at) {
  try {
    return files.read(at);
  } catch {
    return "";
  }
}

function parsedList(said) {
  try {
    const read = JSON.parse(String(said ?? ""));
    return Array.isArray(read) ? read : [];
  } catch {
    return [];
  }
}
