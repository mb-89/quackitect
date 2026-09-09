// The Copilot entry point. All decisions stay inside level zero.
// [[spec/design_output/copilot#setup-and-discovery]]

import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { disk } from "../doors/disk.js";
import { git } from "../doors/git.js";
import { proc } from "../doors/proc.js";
import { session } from "../doors/session.js";
import { clock } from "../doors/clock.js";
import { log } from "../doors/log.js";
import {
  eventOf,
  failureOf,
  replyOf,
} from "../../.claude/skills/level0/lib/copilot.js";
import { handle } from "../../.claude/skills/level0/lib/copilot-runtime.js";
import { setup } from "../../.claude/skills/level0/lib/copilot-setup.js";
import { dispatch } from "../../.claude/skills/level0/lib/copilot-dispatch.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const time = clock();
const book = log(files, time, { folder: join(root, ".se/log") });
const [mode, name] = process.argv.slice(2);
const cloud =
  files.exists(join(root, ".se/copilot-cloud")) ||
  Boolean(process.env.GITHUB_COPILOT_GIT_TOKEN && process.env.COPILOT_AGENT_PROMPT);
const surface = cloud ? "cloud" : "vscode";
let currentEvent = { surface, event: name, retry: false };
const it = {
  root,
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
        const result = outside.run(argv, { cwd: root, timeoutMs: 5000 });
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
    const deadline = time.now().getTime() + 20000;
    it.proc = {
      run(argv, init = {}) {
        const left = deadline - time.now().getTime();
        if (left < 100)
          throw new Error(
            "The level-zero deadline expires. Retry with a smaller change.",
          );
        return outside.run(argv, {
          ...init,
          timeoutMs: Math.min(init.timeoutMs ?? 4000, left),
        });
      },
    };
    const result = await handle(event, it);
    if (event.event === "SessionStart") book.prune();
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
