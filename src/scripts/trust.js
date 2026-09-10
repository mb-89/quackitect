// THE TRUST FLAG, WRITTEN BEFORE A SESSION STARTS. A cloud box clones this tree
// into a folder nobody trusts, so the client skips the plugin scan and level
// zero holds nothing there: no write door, no brief, no canary. The flag sits in
// ~/.claude.json, outside the tree, so no tracked file moves it. An environment
// names this script as its setup, and it runs while no session holds the file.
// [[spec/design_output/level0#the-setup-writes-the-flag]]

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { disk } from "../doors/disk.js";

export const FLAG = "hasTrustDialogAccepted";
export const CONFIG = ".claude.json";

// [[spec/design_output/level0#the-trust-gate-reaches-skills]]
export function trusted(said, folder) {
  const read = said ?? {};
  const projects = { ...(read.projects ?? {}) };
  projects[folder] = { ...(projects[folder] ?? {}), [FLAG]: true };
  return { ...read, [FLAG]: true, projects };
}

export function configPath(home) {
  return join(home, CONFIG);
}

export function rootHere() {
  return dirname(dirname(dirname(fileURLToPath(import.meta.url))));
}

// [[spec/design_output/level0#the-setup-writes-the-flag]]
export function accept(files, home, folder) {
  const where = configPath(home);
  const said = files.exists(where) ? JSON.parse(files.read(where)) : {};
  files.write(where, `${JSON.stringify(trusted(said, folder), null, 2)}\n`);
  return where;
}

function main(argv, env) {
  if (!env.HOME) {
    console.error("This box names no HOME, so the trust flag has no file.");
    return 1;
  }

  const folder = argv[2] ? resolve(argv[2]) : rootHere();
  const where = accept(disk(), env.HOME, folder);
  console.log(`${folder} stands trusted in ${where}. The next session scans plugins.`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv, process.env));
}
