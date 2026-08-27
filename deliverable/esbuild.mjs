// Builds the VS Code shell in two steps.
//
// ONE: bundle vscode/src/extension.ts -> vscode/extension.js. The OUTPUT path
// is what the manifest and preflight's parse check always pointed at.
//
// TWO: render the INSTALLABLE tree into vscode-dist/. That folder is generated,
// never committed, and carries the product's real name where the source keeps
// its $PRODUCT$ placeholders.
//
// WHY A SECOND FOLDER EXISTS AT ALL. VS Code loads extensions only from its own
// directory under the home folder. The repository is not that directory and
// nothing restructures it into one, so something has to put the extension
// there. RUNME links this folder into place, once.
//
// SO YOU ONLY EVER EDIT vscode/src. Both vscode/extension.js and vscode-dist/
// are output, and nothing reads them back.
//
// THE SOURCE KEEPS ITS $PRODUCT$ PLACEHOLDERS, which is what makes producing a
// vehicle a rename rather than a find-and-replace.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { loadBrand, renderExtension } from "./engine/brand.ts";
import { VSCODE_BUILD } from "./engine/vscodebuild.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);

// THE OPTIONS LIVE IN engine/vscodebuild.ts, because the staleness guard has to
// run the SAME build rather than a copy of it.
if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await runBuild();
}

/** REBUILT FROM EMPTY. A file deleted from the source has to leave the install
 *  too, and only starting from nothing guarantees that.
 *
 *  WHAT IS HELD IS SKIPPED. The editor links this folder and has the key
 *  sender's native module loaded out of it, so removing node_modules fails on
 *  Windows — after every other child is already gone. The build then leaves no
 *  extension.js at all, which reads as the feature never having been built.
 *
 *  Emptying the rest keeps the guarantee for everything the build actually
 *  produces, and survives the held handle. */
function emptyFolder(dir, keep) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const name of readdirSync(dir)) {
    if (keep.includes(name)) continue;
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

async function runBuild() {
  await build({ ...VSCODE_BUILD, logLevel: "info" });

  const dist = join(here, "vscode-dist");
  emptyFolder(dist, ["node_modules"]);
  cpSync(join(here, "vscode"), dist, {
    recursive: true,
    filter: (src) => !src.includes("node_modules"),
  });

// THE RUNTIME DEPENDENCY TRAVELS WITH THE INSTALL. VS Code loads this folder
// and resolves `require` from it, so a dependency left behind is a dependency
// that does not exist at runtime.
//
// koffi IS THE KEY SENDER, and it is marked `external` in the bundle above, so
// the bundled file requires it by name. Without it here, `keys.available()`
// answers false, the kickoff stops at the clipboard, and Start the Agent opens
// Claude with an empty box.
//
// MEASURED 2026-08-21: the install went from a copy of `vscode/` to a link to
// this folder, and the button stopped sending from that moment. The copy had
// node_modules; the render filtered it out.
  const modules = join(here, "vscode", "node_modules");
  // A COPY OVER A LOADED NATIVE MODULE FAILS THE SAME WAY the remove does, so
  // one already in place is left alone. It comes from an install rather than
  // from this build, so it does not go stale between runs.
  if (existsSync(join(dist, "node_modules"))) {
    console.log("  kept vscode-dist/node_modules — run npm install in deliverable/vscode to refresh it");
  } else if (existsSync(modules)) {
    cpSync(modules, join(dist, "node_modules"), { recursive: true });
  } else {
    console.warn("  WARNING: vscode/node_modules is missing — the key sender will not load.");
    console.warn("  run `npm install` in deliverable/vscode, then build again.");
  }

  renderExtension(dist, loadBrand(root));
  console.log(`  rendered ${dist}`);
}
