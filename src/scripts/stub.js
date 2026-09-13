// A stub: a bare project the vehicle drives from outside. The pure half names
// the files, the git door answers the upstream, and the disk door writes.
// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]

import { dirname, join } from "node:path";
import {
  brandOf,
  KEEP,
  LINK,
  linkOf,
  SETTINGS,
  settingsOf,
  STUB_FOLDERS,
  stubFiles,
  TEMPLATE,
  upstreamOf,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { copyHere } from "./vehicle.js";

// [[spec/design_output/vehicle#the-record-names-the-vehicle]]
export function stubInto(files, git, time, method, dest, said = {}) {
  if (same(dest, method)) return { ok: false, why: "a stub lands beside its vehicle, elsewhere" };

  const remote = git.run(["remote", "get-url", "origin"], true);
  const upstream = upstreamOf(remote.ok ? remote.out : "", said.upstream);
  if (!upstream) {
    return {
      ok: false,
      why: "the vehicle has no remote a cloud box can clone. Give it one, or say --upstream <url>.",
    };
  }

  const template = walk(files, join(method, TEMPLATE));
  const record = linkOf(
    copyHere(files, time, method),
    brandOf(method),
    upstream,
    versionOf(files, method),
    time.stamp(),
  );

  files.makeDir(dest);
  for (const folder of STUB_FOLDERS) {
    files.makeDir(join(dest, folder));
    files.write(join(dest, folder, KEEP), "");
  }
  files.write(join(dest, LINK), asJson(record));
  files.makeDir(dirname(join(dest, SETTINGS)));
  files.write(join(dest, SETTINGS), asJson(settingsOf(readIf(files, join(method, SETTINGS)))));
  for (const rel of template) {
    const at = join(dest, rel);
    files.makeDir(dirname(at));
    files.write(at, files.read(join(method, TEMPLATE, rel)));
    if (rel.endsWith(".sh")) files.runnable(at);
  }
  return { ok: true, files: stubFiles(template) };
}

function walk(files, at, rel = "") {
  if (!files.exists(at)) return [];
  const out = [];
  for (const one of files.list(at)) {
    const next = rel ? `${rel}/${one.name}` : one.name;
    if (one.kind === "dir") out.push(...walk(files, join(at, one.name), next));
    else out.push(next);
  }
  return out.sort();
}

function versionOf(files, method) {
  try {
    return JSON.parse(files.read(join(method, "package.json"))).version ?? "0";
  } catch {
    return "0";
  }
}

function readIf(files, at) {
  try {
    return files.read(at);
  } catch {
    return "";
  }
}

function asJson(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

function same(one, other) {
  const plain = (said) => String(said ?? "").split("\\").join("/").replace(/\/+$/, "");
  return plain(one) === plain(other);
}
