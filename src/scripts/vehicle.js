// A copy of this tooling, made and placed. The pure half decides, the disk
// door writes, and a project keeps the identity of whatever drives it.
// [[spec/design_output/vehicle#three-things-a-copy-needs]]

import { join } from "node:path";
import {
  attaches,
  COPY,
  copyOf,
  drivenOf,
  entryOf,
  MARKER,
  onlyCopy,
  pairOf,
  PROJECT,
  REGISTER,
  registers,
  resolves,
  travels,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { homeIn } from "./editor.js";

// [[spec/design_output/vehicle#a-marker-names-the-root]]
export function methodRootFrom(files, start) {
  let here = String(start ?? "").split("\\").join("/").replace(/\/+$/, "");
  while (here) {
    if (files.exists(join(here, MARKER))) return here;
    const up = here.slice(0, here.lastIndexOf("/"));
    if (!up || up === here) return "";
    here = up;
  }
  return "";
}

// [[spec/design_output/vehicle#three-things-a-copy-needs]]
export function copyHere(files, time, method) {
  const at = join(method, COPY);
  const said = copyOf(readIf(files, at), idOf(time), time.stamp());
  if (said.made) {
    files.makeDir(join(method, ".se"));
    files.write(at, `${JSON.stringify(said.record, null, 2)}\n`);
  }
  return said.record.id;
}

function idOf(time) {
  const digits = time.stamp().replace(/[^0-9]/g, "");
  return `${Number(digits.slice(-12)).toString(16)}${process.pid.toString(16)}`;
}

// [[spec/design_output/vehicle#the-register-places-an-identity]]
export function registerDirs(env) {
  const said = env.SE_REGISTRY;
  if (said) return said.split(process.platform === "win32" ? ";" : ":").filter(Boolean);
  const home = homeIn(env);
  return home ? [join(home, ".se")] : [];
}

export function readRegister(files, env) {
  const out = [];
  for (const dir of registerDirs(env)) {
    const said = readIf(files, join(dir, REGISTER));
    for (const one of parsedList(said)) {
      if (one?.method_root && files.exists(join(one.method_root, MARKER))) out.push(one);
    }
  }
  return out;
}

export function registerCopy(files, env, entry) {
  let wrote = false;
  for (const dir of registerDirs(env)) {
    const at = join(dir, REGISTER);
    try {
      files.makeDir(dir);
      files.write(at, `${JSON.stringify(registers(readIf(files, at), entry), null, 2)}\n`);
      wrote = true;
    } catch {}
  }
  return wrote;
}

// [[spec/design_output/vehicle#a-project-names-its-driver]]
export function attach(files, time, work, id) {
  files.makeDir(join(work, ".se"));
  files.write(
    join(work, PROJECT),
    `${JSON.stringify(attaches(id, time.stamp()), null, 2)}\n`,
  );
}

export function detach(files, work) {
  files.remove(join(work, PROJECT));
}

// [[spec/design_output/vehicle#one-tree-drives-itself]]
export function rootsHere(files, env, work) {
  const here = methodRootFrom(files, work);
  if (here) return pairOf(here, work);

  const list = readRegister(files, env);
  const driven = drivenOf(readIf(files, join(work, PROJECT)));
  const named = driven ? resolves(list, driven.driver) : "";
  return pairOf(named || onlyCopy(list), work);
}

// [[spec/design_output/vehicle#what-travels-into-a-copy]]
export function produce(files, method, dest, into) {
  if (!into && files.exists(dest)) {
    return { ok: false, why: `${dest} stands already. A copy lands in a new place` };
  }
  if (dest === method) return { ok: false, why: "a copy lands beside its method, elsewhere" };

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

export function entryFor(files, time, env, method, version) {
  const id = copyHere(files, time, method);
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
