// Copilot's level zero, with every outside operation supplied by doors.
// [[spec/design_output/copilot#one-runtime]]

import { CODE, formatText, lintText as lintCode } from "./code.js";
import { actionables, bindsHere, standingLayer } from "./guidance.js";
import { mutations } from "./mutations.js";
import { refusal } from "./refuse.js";
import { readRule } from "./rulefile.js";
import { landsOnTrunk } from "./trunk.js";
import { lintText } from "./vale.js";
import { readTools, whereIs } from "../../../../src/scripts/tools.js";
import { statusOf } from "../../../../src/scripts/work.js";
import { candidateRun } from "./candidate-check.js";

const PROSE = /\.(md|markdown|txt)$/i;
const SHELL = new Set([
  "Bash",
  "bash",
  "powershell",
  "run_in_terminal",
  "send_to_terminal",
]);
const PROTECTED =
  /^(?:\.git(?:\/|$)|\.claude\/|\.github\/hooks\/|\.github\/copilot\/|\.github\/workflows\/copilot-|\.vale\.ini$|spec\/(?:config|guidance)\/|src\/scripts\/copilot\.js$|src\/doors\/)/i;

export async function handle(event, it) {
  return it.session.withState(event.session, async (state, save, claim, release) => {
    const cloud = event.surface === "cloud";
    const read = (name) => it.disk.read(it.session.path(name));
    const run = (argv, options = {}) =>
      it.proc.run(argv, { ...options, cwd: options.cwd ?? it.root, timeoutMs: 4000 });
    const checker = candidateRun(it, run);
    const branch = () => {
      const result = run(["git", "rev-parse", "--abbrev-ref", "HEAD"]);
      if (result.exitCode !== 0) throw new Error("Cannot identify the work branch.");
      return result.stdout.trim();
    };
    const known = readTools(it.disk, it.root);
    const vale = whereIs(it.disk, it.root, "vale", known);
    const biome = whereIs(it.disk, it.root, "biome", known);
    const ready = () => {
      if (![vale, biome].every((path) => it.disk.exists(path))) {
        throw new Error(
          "Level zero is not ready. Run the installer before starting work.",
        );
      }
    };

    if (event.event === "SessionStart") {
      ready();
      if (!state.started) {
        state.branch = branch();
        state.cloud = cloud;
        if (cloud && !state.branch.startsWith("work/")) {
          throw new Error(
            "Dispatch Copilot through the existing work branch pull request. Do not switch to another branch.",
          );
        }
        if (cloud && statusOf(read("HANDOVER.md")) !== "held") {
          throw new Error(
            "The dispatcher must claim this work branch before the session starts.",
          );
        }
        state.handovers = [];
        state.touched = [];
        state.retries = 0;
        state.started = true;
        save();
      }
      for (const path of [".se/HANDOVER.md", "HANDOVER.md"]) {
        let held = state.handovers.find((one) => one.path === path);
        if (!held && it.disk.exists(it.session.path(path))) {
          const text = read(path);
          if (!text.trim()) continue;
          claim(path, text);
          held = { path, text, consumed: false };
          state.handovers.push(held);
          save();
        }
        if (held && !held.consumed) {
          if (it.disk.exists(it.session.path(path)) && read(path) === held.text)
            it.disk.remove(it.session.path(path));
          held.consumed = true;
          save();
        }
      }
      const env = cloud ? { ...it.env, SE_CLOUD: "1" } : it.env;
      const notes = it.disk
        .list(it.join(it.root, "spec/guidance"))
        .filter((one) => one.name.endsWith(".md"))
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((one) => ({ name: one.name, text: read(`spec/guidance/${one.name}`) }))
        .filter((one) => bindsHere(one.text, env));
      const count = notes.reduce(
        (total, one) => total + actionables(one.text).length,
        0,
      );
      if (!count) throw new Error("No numbered guidance reaches this session.");
      const judged = it.disk
        .list(it.join(it.root, "spec/config/styles/VoiceJudged"))
        .filter((one) => one.name.endsWith(".yml"))
        .map(
          (one) => readRule(read(`spec/config/styles/VoiceJudged/${one.name}`)).message,
        )
        .filter(Boolean);
      state.guidance = standingLayer(notes);
      state.count = count;
      state.ready = true;
      return {
        context: [
          "# Level zero is active",
          "Mechanical write gates are active. Formatting follows edits. Semantic rules are instructions, not model checks. Final answers are not linted.",
          "# How this tree is worked",
          state.guidance,
          "# Semantic guidance",
          ...judged,
          ...state.handovers.map(
            (one) =>
              `# Handover: ${one.path}\n${one.text}\nWrite a fresh result at the same path before finishing.`,
          ),
          cloud
            ? `This session already holds ${state.branch}. Run work sync, not work take. The dispatcher owns the existing pull request; open no new one.`
            : "",
          `In your FIRST reply acknowledge these rules and end with exactly: rules: ${count}. Write the receipt once.`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    }

    if (event.event === "SessionEnd") return {};
    if (!state.ready || state.cloud !== cloud)
      throw new Error(
        "Level zero initialization is missing. Start a new session after setup.",
      );
    ready();

    if (event.event === "PreToolUse") {
      if (cloud && branch() !== state.branch) {
        return {
          deny: "This session has left its assigned branch. Stop and recover the assigned work checkout.",
        };
      }
      if (SHELL.has(event.tool)) {
        const command = String(event.args.command ?? "");
        if (
          cloud &&
          (landsOnTrunk(command, state.branch) ||
            /\bwork\s+(?:take|new|merge|close)\b/.test(command) ||
            /\bwork\s+release\s+[^\s;&|]/.test(command) ||
            /\bgit\b[^\r\n;&|]*\b(?:switch|checkout)\b/.test(command) ||
            /\bgh\b[^\r\n;&|]*\bpr\s+(?:create|merge|close)\b/.test(command))
        ) {
          return {
            deny: "This session works its assigned branch only. Use work sync, work done, or work release; leave main to a person.",
          };
        }
        return {};
      }
      const changes = mutations(event, read);
      if (changes.length > 8)
        return {
          deny: "Edit at most eight files per tool call so checks finish within the hook deadline.",
        };
      for (const change of changes) {
        const path = it.session.path(change.path);
        const local = it.relative(it.root, path).split("\\").join("/");
        if (PROTECTED.test(local))
          return {
            deny: "Level zero cannot edit its own runtime or rule configuration. Ask a person to review that change outside this session.",
          };
        if (change.text !== null) {
          const failure = await check(change.text, local, {
            vale,
            biome,
            run: checker,
          });
          if (failure) return { deny: failure };
        }
        if (!state.touched.includes(local)) state.touched.push(local);
      }
    }

    if (event.event === "PostToolUse") {
      if (/search|fetch/i.test(event.tool)) {
        state.searches = (state.searches ?? 0) + 1;
      }
    }

    if (event.event === "Stop") {
      const issues = [];
      if (!event.retry) state.retries = 0;
      const pending = state.touched.filter(
        (path) =>
          it.disk.exists(it.session.path(path)) && state.checked?.[path] !== read(path),
      );
      for (const path of pending.slice(0, 4)) {
        if (!it.disk.exists(it.session.path(path))) continue;
        let text = read(path);
        if (CODE.test(path)) {
          const formatted = await formatText(text, path, { bin: biome, run });
          if (!formatted.ran) {
            issues.push(`Formatting failed for ${path}.`);
            continue;
          }
          text = formatted.text;
          if (text !== read(path)) it.disk.write(it.session.path(path), text);
        }
        const failure = await check(text, path, { vale, biome, run: checker });
        if (failure) issues.push(failure);
        else (state.checked ??= {})[path] = text;
      }
      for (const handover of state.handovers) {
        if (
          !it.disk.exists(it.session.path(handover.path)) ||
          read(handover.path) === handover.text
        )
          issues.push(`Write a fresh result and retro to ${handover.path}.`);
      }
      if (cloud) {
        const result = it.disk.exists(it.session.path("HANDOVER.md"))
          ? read("HANDOVER.md")
          : "";
        if (branch() !== state.branch || !["done", "todo"].includes(statusOf(result)))
          issues.push(
            "Run work done, or work release if incomplete, on the assigned branch.",
          );
        const dirty = run(["git", "status", "--porcelain"]);
        const remote = run([
          "git",
          "ls-remote",
          "origin",
          `refs/heads/${state.branch}`,
        ]);
        const head = run(["git", "rev-parse", "HEAD"]);
        if (
          dirty.exitCode !== 0 ||
          dirty.stdout.trim() ||
          remote.exitCode !== 0 ||
          head.exitCode !== 0 ||
          remote.stdout.split(/\s/)[0] !== head.stdout.trim()
        )
          issues.push(
            "Commit and push the result, including formatter changes, before finishing.",
          );
      }
      if (issues.length) {
        state.retries++;
        state.failure = issues.join("\n");
        save();
        if (state.retries <= 3) return { block: state.failure };
        return {
          failed: `Level zero cannot verify completion. Work is not accepted. ${state.failure}`,
        };
      }
      state.failure = "";
      state.retries = 0;
      if (pending.length > 4) {
        return {
          block: "Validation continues in bounded batches. Attempt completion again.",
        };
      }
      for (const one of state.handovers) release(one.path);
      return {};
    }
    return {};
  });
}

async function check(text, path, { vale, biome, run }) {
  if (!PROSE.test(path) && !CODE.test(path)) return "";
  const checkedRun = async (argv, init) => {
    const reply = await run(argv, init);
    const data = JSON.parse(reply.stdout);
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error("Invalid checker report.");
    if (PROSE.test(path)) {
      if (reply.exitCode !== 0 || !Object.values(data).every(Array.isArray))
        throw new Error("Vale did not finish checking.");
    } else if (
      !Array.isArray(data.diagnostics) ||
      ![0, 1].includes(reply.exitCode) ||
      (reply.exitCode !== 0 && !data.diagnostics.length)
    ) {
      throw new Error("Biome did not finish checking.");
    }
    return reply;
  };
  const result = PROSE.test(path)
    ? await lintText(text, path, { bin: vale, run: checkedRun })
    : await lintCode(text, path, { bin: biome, run: checkedRun });
  if (!result.ran)
    return `The checker cannot run for ${path}. Repair setup before writing.`;
  const found = PROSE.test(path)
    ? result.found
    : result.found.filter((one) => one.severity === "error");
  return found.length ? refusal(path, found) : "";
}
