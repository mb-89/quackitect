// A stub: a bare project the vehicle drives from outside. The pure half names
// the files, the git door answers the upstream, and the disk door writes.
// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]

import { dirname, join } from "node:path";
import {
  brandOf,
  emptyBrand,
  KEEP,
  LINK,
  linkOf,
  SETTINGS,
  same,
  settingsOf,
  stubFiles,
  stubFolders,
  TEMPLATE,
  upstreamOf,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { identityHere } from "./vehicle.js";

// [[spec/design_output/vehicle#the-record-names-the-vehicle]]
export function stubInto(files, git, time, method, dest, said = {}) {
  if (same(dest, method))
    return { ok: false, why: "a stub lands beside its vehicle, elsewhere" };

  const remote = git.run(["remote", "get-url", "origin"], true);
  const upstream = upstreamOf(remote.ok ? remote.out : "", said.upstream);
  if (!upstream) {
    return {
      ok: false,
      why: "the vehicle has no remote a cloud box can clone. Give it one, or say --upstream <url>.",
    };
  }

  // The brand enters the record here, so an empty one stops here. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
  const brand = brandOf(method);
  if (!brand) return { ok: false, why: emptyBrand(method) };

  const template = walk(files, join(method, TEMPLATE));
  const record = linkOf(
    identityHere(files, time, method),
    brand,
    upstream,
    versionOf(files, method),
    time.stamp(),
  );

  files.makeDir(dest);
  // A reader opening a stub reads the project it names. [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
  for (const folder of stubFolders(dest)) {
    files.makeDir(join(dest, folder));
    files.write(join(dest, folder, KEEP), "");
  }
  files.write(join(dest, LINK), asJson(record));
  files.makeDir(dirname(join(dest, SETTINGS)));
  files.write(
    join(dest, SETTINGS),
    asJson(settingsOf(readIf(files, join(method, SETTINGS)))),
  );
  for (const rel of template) {
    const at = join(dest, rel);
    files.makeDir(dirname(at));
    files.write(at, files.read(join(method, TEMPLATE, rel)));
    if (rel.endsWith(".sh")) files.runnable(at);
  }
  return { ok: true, files: stubFiles(template, dest) };
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
