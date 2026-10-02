// The setup verb: the install's steps that run JavaScript, which install.sh
// hands over last, so the installer itself runs no node.
// [[spec/tickets/install-drops-node]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RUN } from "../../../.claude/skills/level0/lib/folders.js";
import { EXTENSIONS } from "../../../.claude/skills/level0/lib/servers.js";
import { disk } from "../../doors/disk.js";
import { proc } from "../../doors/proc.js";
import { homeIn } from "../editor.js";
import { verbMain } from "../verb-run.js";

const CLIENT = ["src", "extension", "node_modules", "vscode-languageclient"];
const TOOLS = [RUN, "tools.json"];

const ITEMS = {
  "editor-client": {
    why: "editor-client: the language client the extension starts the server through",
    here: (it) => it.disk.exists(join(it.root, ...CLIENT)),
    get: (it) => {
      it.say("  installing the language client");
      return ran(it, ["npm", "install", "--no-audit", "--no-fund", "--silent"], ["src", "extension"]);
    },
    missed: "  no language client here, so the editor draws no server line.",
  },
  browser: {
    why: "browser: the chromium the drawing's test drives",
    here: (it) => ran(it, [it.node, script(it, "browser.js")], [], true),
    get: (it) => {
      it.say("  downloading chromium through playwright");
      return ran(it, ["npx", "--yes", "playwright-core", "install", "chromium"], ["src", "extension", "webview"]);
    },
    missed: "  no browser here, so the check skips the drawing's test.",
  },
  "editor-link": {
    why: "editor-link: this tree's own sidebar, linked into the editor and named in its list",
    here: (it) => !editorHere(it) || ran(it, [it.node, script(it, "editor.js"), "linked"], [], true),
    get: (it) => {
      if (!editorHere(it)) return true;
      it.say("  linking the sidebar into the editor");
      return ran(it, [it.node, script(it, "editor.js"), "link"]);
    },
    missed: "  the sidebar stays unlinked, so the editor draws no panel here.",
  },
  "editor-extensions": {
    why: "editor-extensions: the Vale, Biome and Mermaid extensions the tracked settings point at",
    here: (it) => {
      const listed = listedOf(it);
      return listed === null || EXTENSIONS.every((id) => listed.includes(id.toLowerCase()));
    },
    get: (it) => {
      if (listedOf(it) === null) return true;
      return EXTENSIONS.every((id) => {
        it.say(`  installing ${id}`);
        return ran(it, ["code", "--install-extension", id, "--force"], [], true);
      });
    },
    missed: "  no code on the PATH, so a person takes the recommendation.",
  },
};

// Every item stands a want, so a miss names what the box loses and the setup goes on. [[spec/tickets/install-drops-node]]
export function setup(it, words) {
  const skipped = String(it.env.SE_INSTALL_SKIP ?? "").split(/\s+/);
  const missing = Object.keys(ITEMS).filter((one) => !skipped.includes(one) && !ITEMS[one].here(it));
  for (const one of missing) {
    const item = ITEMS[one];
    it.say(item.why);
    item.get(it);
    if (!item.here(it)) it.say(item.missed);
  }
  const landed = words.includes("--landed") || missing.length > 0;
  if (landed || !it.disk.exists(join(it.root, ...TOOLS))) {
    ran(it, [it.node, script(it, "verbs", "tools.js")], [], true) ||
      it.say("  the survey wrote no tools.json, so every caller guesses again.");
  }
  // [[spec/design_output/copilot#setup-and-discovery]]
  ran(it, [it.node, script(it, "copilot.js"), "setup", "auto"]) ||
    it.say("  the copilot setup stopped, so the files it writes stand as they stood.");
  // [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
  ran(it, [it.node, script(it, "brand.js")]) ||
    it.say("  the brand reached no name, so the marketplace keeps the one it holds.");
  return 0;
}

function script(it, ...path) {
  return join(it.root, "src", "scripts", ...path);
}

function editorHere(it) {
  const home = homeIn(it.env);
  return Boolean(home) && it.disk.exists(join(home, ".vscode", "extensions"));
}

function listedOf(it) {
  try {
    const said = it.proc.run(["code", "--list-extensions"]);
    if (said.exitCode !== 0) return [];
    return said.stdout.toLowerCase().split(/\r?\n/).map((one) => one.trim());
  } catch {
    return null;
  }
}

function ran(it, argv, under = [], quiet = false) {
  try {
    return it.proc.run(argv, { cwd: join(it.root, ...under), inherit: !quiet }).exitCode === 0;
  } catch {
    return false;
  }
}

export const run = async (words) =>
  setup(
    {
      root: dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url))))),
      node: process.execPath,
      env: process.env,
      disk: disk(),
      proc: proc(),
      say: (line) => console.log(line),
    },
    words,
  );

await verbMain(import.meta.url, run);
