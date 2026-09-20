// The tui verb. It opens the window this tree builds, on the tab the caller
// names. A window already standing takes the tab over its own port and the
// second launch ends, so one window stands at a time. A tree carrying no Go
// prints the rows plain instead.
// [[spec/design_output/viewer#the-verb-builds-it]]

import { FOLDER as LOG_FOLDER } from "../../.claude/skills/level0/lib/log.js";
import { PORT } from "../bridge/window.js";
import { asRow, filesFor, rowsIn, SESSION } from "./log-read.js";

export const TABS = ["log", "work"];

// [[spec/design_output/viewer#a-tab-the-caller-names]]
export function tabWanted(argv) {
  const at = argv.indexOf("--tab");
  const said = at >= 0 ? argv[at + 1] : argv.find((one) => TABS.includes(one));
  return TABS.includes(said) ? said : "";
}

// [[spec/design_output/viewer#the-verb-builds-it]]
export async function openTui(it, argv) {
  const plain = argv.includes("--plain");
  const viewer = plain ? { exe: "", why: "" } : it.viewer();
  if (viewer.why) console.error(viewer.why);
  const session = it.join(it.root, SESSION);
  if (viewer.exe) return await opens(it, viewer.exe, session, tabWanted(argv));
  return plainRows(it, argv, session, plain);
}

// [[spec/design_output/viewer#a-second-launch-hands-over]]
async function opens(it, exe, session, tab) {
  it.disk.makeDir(it.join(it.root, LOG_FOLDER));
  if (await told(tab || TABS[0])) {
    console.log(`A window already stands, and it opens the ${tab || TABS[0]} tab.`);
    return 0;
  }
  const opts = tab ? ["--tab", tab] : [];
  return it.proc.run([exe, ...opts, session], { cwd: it.root, inherit: true }).exitCode;
}

// Whether a window already standing took the tab. [[spec/design_output/viewer#a-second-launch-hands-over]]
async function told(tab) {
  try {
    const answer = await fetch(`http://127.0.0.1:${PORT}/tab`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tab }),
      signal: AbortSignal.timeout(WAIT),
    });
    return answer.ok;
  } catch {
    return false;
  }
}

const WAIT = 500;

// [[spec/design_output/viewer#the-verb-builds-it]]
function plainRows(it, argv, session, plain) {
  // The read over the log stands in log-read.js, and the log verb calls the same one. [[spec/design_output/log#one-verb-reads-the-log]]
  const read = argv.includes("--all")
    ? filesFor(it, "", 0)
    : it.disk.exists(session)
      ? [session]
      : [];
  if (!read.length) {
    console.log("No log stands yet. A writer starts one the next time it says a line.");
    return 0;
  }
  for (const path of read) {
    console.log(it.show(path));
    for (const one of rowsIn(it, [path])) console.log(asRow(one));
  }
  if (!plain) {
    console.log("");
    console.log(
      "Go builds the viewer these rows open in. Install Go, and run this again.",
    );
  }
  return 0;
}
