// Which browser the drawing's test drives. Install asks this, the doctor names
// its answer, and the test launches the path it hands back. The order stands in
// [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]].

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { disk } from "../doors/disk.js";

export const CALLS = ["chromium", "chromium-browser", "google-chrome", "chrome"];

// Where a Playwright folder keeps the binary, one layout a platform. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
const INSIDE = [
  ["chrome-linux", "chrome"],
  ["chrome-linux64", "chrome"],
  ["chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"],
  ["chrome-win", "chrome.exe"],
  ["chrome-win64", "chrome.exe"],
];

// The folder `playwright install` writes where no variable names one. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
export function cacheOf(env = {}, mac = false) {
  if (env.LOCALAPPDATA) return join(env.LOCALAPPDATA, "ms-playwright");
  const home = env.HOME ?? env.USERPROFILE ?? "";
  if (!home) return "";
  if (mac) return join(home, "Library", "Caches", "ms-playwright");
  return join(home, ".cache", "ms-playwright");
}

// The newest chromium a Playwright folder holds, or nothing. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
export function underFolder(folder, files) {
  if (!folder || !files.exists(folder)) return "";
  const builds = files
    .list(folder)
    .map((one) => one.name)
    .filter((one) => /^chromium-\d+$/.test(one))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
  for (const one of builds) {
    for (const rest of INSIDE) {
      const at = join(folder, one, ...rest);
      if (files.exists(at)) return at;
    }
  }
  return "";
}

// [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
function onPath(call, env, files) {
  const windows = Boolean(env.PATHEXT);
  const said = env.PATH ?? env.Path ?? "";
  for (const folder of said.split(windows ? ";" : ":").filter(Boolean)) {
    for (const end of windows ? ["", ".exe"] : [""]) {
      const at = join(folder, `${call}${end}`);
      if (files.exists(at)) return at;
    }
  }
  return "";
}

// The first browser the order finds, with the rung that found it. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
export function browserFrom(env = {}, files = disk(), mac = false) {
  const named = env.PLAYWRIGHT_CHROMIUM;
  if (named && files.exists(named)) return { path: named, from: "PLAYWRIGHT_CHROMIUM" };
  const folder = underFolder(env.PLAYWRIGHT_BROWSERS_PATH, files);
  if (folder) return { path: folder, from: "PLAYWRIGHT_BROWSERS_PATH" };
  for (const call of CALLS) {
    const at = onPath(call, env, files);
    if (at) return { path: at, from: "PATH" };
  }
  const cached = underFolder(cacheOf(env, mac), files);
  if (cached) return { path: cached, from: "playwright install" };
  return { path: "", from: "" };
}

// The doctor's row. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
export function browserSays(
  env = process.env,
  files = disk(),
  mac = process.platform === "darwin",
) {
  const found = browserFrom(env, files, mac);
  return found.path ? `${found.path}, off ${found.from}` : "missing, run ./RUNME.sh";
}

// The install asks here, and a zero answers that a browser stands. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const found = browserFrom(process.env, disk(), process.platform === "darwin");
  if (found.path) console.log(found.path);
  process.exit(found.path ? 0 : 1);
}
