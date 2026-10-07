// The Copilot entry point. All decisions stay inside level zero.
// [[spec/design_output/copilot#setup-and-discovery]]

import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  eventOf,
  failureOf,
  replyOf,
} from "../../.claude/skills/level0/lib/copilot.js";
import { dispatch } from "../../.claude/skills/level0/lib/copilot-dispatch.js";
import { setup } from "../../.claude/skills/level0/lib/copilot-setup.js";
import { inRun } from "../../.claude/skills/level0/lib/folders.js";
import { FOLDER as LOG_FOLDER } from "../../.claude/skills/level0/lib/log.js";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { git } from "../doors/git.js";
import { log } from "../doors/log.js";
import { proc } from "../doors/proc.js";
import { session } from "../doors/session.js";
import { answers } from "./copilot-door.js";
import { assemble } from "./styles.js";
import { rootsHere } from "./vehicle.js";

const DEADLINE = 20000;
const LIST_WAIT = 5000;
const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const time = clock();
const book = log(files, time, { folder: join(root, LOG_FOLDER) });
const [mode, name] = process.argv.slice(2);
const cloud =
  files.exists(join(root, inRun("copilot-cloud"))) ||
  Boolean(process.env.GITHUB_COPILOT_GIT_TOKEN && process.env.COPILOT_AGENT_PROMPT);
const surface = cloud ? "cloud" : "vscode";
// The pair of roots the door reads, so the copilot road assembles the same rule set. [[spec/design_output/vehicle#the-styles-assemble-once]]
const roots = rootsHere(files, process.env, root);
let currentEvent = { surface, event: name, retry: false };
const it = {
  root,
  work: roots.work,
  // The tracked config stands under the root, where the config reader looks for it. [[spec/tickets/copilot-shadow-carries-method]]
  method: root,
  styles: () => assemble(files, roots).config,
  disk: files,
  proc: outside,
  git: git(outside, root),
  log: book,
  session: session(root),
  join,
  dirname,
  relative,
  platform: process.platform,
  env: process.env,
  detect() {
    if (
      cloud ||
      process.env.TERM_PROGRAM === "vscode" ||
      files.exists(join(root, ".github/hooks/level0.json"))
    )
      return true;
    for (const editor of ["code", "code-insiders"]) {
      try {
        const argv =
          process.platform === "win32"
            ? ["cmd", "/c", editor, "--list-extensions"]
            : [editor, "--list-extensions"];
        const result = outside.run(argv, { cwd: root, timeoutMs: LIST_WAIT });
        if (/github\.copilot/i.test(result.stdout)) return true;
      } catch {}
    }
    return false;
  },
};

try {
  if (mode === "setup") {
    const written = setup(it, name);
    if (written.length) console.log(`Copilot: ${written.join(", ")}`);
  } else if (mode === "dispatch") {
    if (cloud)
      throw new Error("Dispatch runs in a person's checkout, never in a worker job.");
    console.log(await dispatch(it));
  } else if (mode === "hook") {
    const input = JSON.parse(files.read(0));
    const event = eventOf(input, name, surface);
    currentEvent = event;
    // The hook asks the hooks door, within the deadline Copilot's hook holds. [[spec/tickets/copilot-answers-off-the-door]]
    const signal = AbortSignal.timeout(DEADLINE);
    const result = await answers(event, {
      root,
      read: (rel) => files.read(resolve(root, rel)),
      run: (argv, init) => outside.run(argv, init),
      fetch: async (url, init) => {
        const said = await fetch(url, { ...init, signal });
        return { ok: said.ok, status: said.status, text: await said.text() };
      },
    });
    await book.say(
      result.deny || result.block || result.failed ? "warn" : "info",
      "copilot",
      `${event.event}: ${result.deny ?? result.block ?? result.failed ?? "complete"}`,
      { session: event.session, tool: event.tool },
    );
    console.log(JSON.stringify(replyOf(event, result)));
  } else {
    throw new Error(
      "Use node src/scripts/copilot.js setup [auto|vscode|cloud]. Hooks call this entry point themselves.",
    );
  }
} catch (error) {
  const reason = `Level zero: ${error.message}`;
  if (mode === "hook") {
    console.error(reason);
    console.log(JSON.stringify(replyOf(currentEvent, failureOf(currentEvent, reason))));
  } else {
    console.error(reason);
    process.exitCode = 1;
  }
}
