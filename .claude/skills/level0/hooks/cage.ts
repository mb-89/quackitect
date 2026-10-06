// THE CAGE UNDER NEW. The hooks door decides the events it ports, and the bridge keeps the rest until the bridge server leaves. A guarded call meets a refusal while the door stands down, so a fault shows on the first call. The loader follows $ into no import, so the bridgehead makes every call on $, and this file holds the words and the choices. [[spec/tickets/a-down-index-refuses-calls]] [[spec/rationales/the-cage-refuses-while-down]]

import type { AgentSpawnArgs, HttpInit } from "claude-code";
import { RUN } from "../lib/folders.js";
import type { Fields, Given } from "./shape.ts";

// What a door or the server answers an event with, read off its JSON; the engine names no such shape. [[spec/design_output/model#the-effects]]
export type Answer = {
  readonly register?: unknown;
  readonly clear?: { readonly prompt?: unknown };
  readonly needs?: unknown;
  readonly spawn?: AgentSpawnArgs;
  readonly back?: Readonly<Fields> & { readonly event?: unknown };
  readonly result?: unknown;
  readonly pass?: unknown;
  readonly event?: unknown;
  readonly after?: Readonly<Fields>;
  readonly deny?: string;
  readonly block?: string;
  readonly effects?: readonly Effect[];
};
// One effect of a door's answer. [[spec/design_output/model#the-effects]]
type Effect = {
  readonly kind?: unknown;
  readonly text?: unknown;
  readonly result?: Answer;
  readonly name?: unknown;
  readonly call?: unknown;
};
// The step the effects answer. [[spec/design_output/model#the-effects]]
export type Step = {
  answer?: Answer;
  rows?: string;
  blocks?: { name: string; text: string }[];
  after?: string[];
};

// The standing file the hooks door writes, which StandingFile in src/modules/hooks/hooks.go owns, spelled again here because this hook imports its own folder alone. [[spec/tickets/a-down-index-refuses-calls]]
export const HOOKS_FILE = `${RUN}/hooks.json`;
const DOORED = new Set([
  "session.start",
  "prompt.context",
  "prompt.submit",
  "classic.MessageDisplay",
  "agent.spoke",
  "session.compact",
  "session.end",
  "session.measure",
  "turn.said",
  "turn.complete",
  "classic.Stop",
  "agent.spawn",
  "tool.describe",
  "tool.call",
  "agent.answered",
]);
// The calls that pass while the door stands down: the harness reads. [[spec/tickets/a-down-index-refuses-calls]] [[spec/tickets/level0-tools-leave-the-bridge]]
const UNGUARDED = new Set(["Read", "Grep", "Glob"]);
// The change of folder that leads a recovery command, which moves the shell alone. [[spec/tickets/the-cage-survives-its-index]]
const INTO = /^\s*cd\s+[\w./-]+\s*&&\s*/;
// A character outside quotes that chains, pipes, redirects, substitutes or globs, so the words it stands in run as no recovery command. [[spec/tickets/the-cage-survives-its-index]]
const SHELL = /[;&|<>`$()\\\n\r*?{}[\]~#!]/;
// The work branch a push names, which the pre-push hook guards past this. [[spec/tickets/the-cage-survives-its-index]]
const WORK = /^(HEAD:)?work\/[\w./-]+$/;
// The alarm the index keeps its fault under, which AlarmsName in the index owns. [[spec/rationales/the-cage-refuses-while-down]]
const ALARMS = "session/alarms";

// Whether the door decides the event, where the key reads new. [[spec/tickets/a-down-index-refuses-calls]]
export function doors(event: string): boolean {
  return DOORED.has(event);
}

// The post the door reads: its address, and the body with the standing token as a bearer. [[spec/design_output/model#a-post-and-its-answer]]
export function postOf(
  standing: { readonly port?: unknown; readonly token?: unknown } | null | undefined,
  event: string,
  e: unknown,
  root: string,
  extra: Readonly<Fields> | undefined,
): { where: string; init: HttpInit } {
  return {
    where: `http://127.0.0.1:${standing?.port}/hook`,
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${standing?.token}`,
      },
      body: JSON.stringify({ event, e: e ?? null, root, ...extra }),
    },
  };
}

// The step the effects answer, in order: a result answers the call with its text as a deny, a block holds the Stop, rows ask back, and an after rides the answer as context. A call the door passes goes on to the harness, and none to the bridge. [[spec/design_output/model#the-effects]] [[spec/tickets/level0-tools-leave-the-bridge]]
export function stepOf(
  answer: Answer | null | undefined,
  event: string,
  { asks }: { asks: boolean },
): Step {
  const after: string[] = [];
  const blocks: { name: string; text: string }[] = [];
  for (const one of answer?.effects ?? []) {
    const kind = String(one?.kind ?? "");
    if (kind === "result")
      return { answer: one.text ? { deny: String(one.text) } : one.result };
    if (kind === "block") return { answer: { block: String(one.text ?? "") } };
    // A clear passes the turn, and the conversation clears behind it. [[spec/tickets/clear-answers-off-the-door]]
    if (kind === "clear")
      return { answer: { pass: true, clear: { prompt: String(one.text ?? "") } } };
    // An event effect answers the rewritten event, the shape the bridge's prompt answer takes. [[spec/tickets/prompt-answers-off-the-door]]
    if (kind === "event") return { answer: { event: one.result } };
    if (kind === "rows" && asks) return { rows: String(one.call ?? "") };
    if (kind !== "after" || !one.text) continue;
    const text = String(one.text);
    const name = String(one.name ?? "");
    // An after on the prompt context rides as a named block, the shape the context read hands on, and a named after on another event opens on its name as a heading. [[spec/tickets/brief-answers-off-the-door]]
    // A named after on a describe answers the field it names, the shape the bridge's describe answer takes. [[spec/tickets/describe-answers-off-the-door]]
    if (name && event === "tool.describe")
      return { answer: { after: { [name]: text } } };
    if (name && event === "prompt.context") blocks.push({ name, text });
    else after.push(name ? `# ${name}\n${text}` : text);
  }
  return {
    ...(blocks.length ? { blocks } : {}),
    ...(after.length ? { after } : {}),
  };
}

// A guarded call meets the refusal while the door stands down. [[spec/tickets/a-down-index-refuses-calls]]
export function guarded(event: string, e: Given): boolean {
  const tool = String(e?.tool ?? "");
  if (event !== "tool.call" || UNGUARDED.has(tool)) return false;
  return !(
    tool === "Bash" && recovers(String(e?.command ?? e?.input?.command ?? ""))
  );
}

// Whether a command brings the index back or saves the work, so a box whose door falls mid-work recovers and pushes. Every other command stays guarded. [[spec/tickets/the-cage-survives-its-index]] [[spec/rationales/the-cage-refuses-while-down]]
export function recovers(command: unknown): boolean {
  const argv = wordsOf(String(command ?? "").replace(INTO, ""));
  if (!argv?.length) return false;
  const [head, verb, ...rest] = argv;
  if (head === "./RUNME.sh") {
    if (verb === "serve" || verb === "doctor")
      return rest.every((word) => /^--[\w-]+$/.test(word));
    return verb === "index" && rest.length === 1 && rest[0] === "standing";
  }
  if (head === "pkill") return killsRuntime([verb, ...rest]);
  if (head !== "git") return false;
  if (verb === "status" || verb === "log")
    return rest.every((word) => !word.startsWith("--output"));
  if (verb === "add") return true;
  if (verb === "commit") return commits(rest);
  return verb === "push" && pushesWork(rest);
}

// The words a shell reads off a command, or null where a character outside quotes chains, pipes, redirects or substitutes. A single-quoted word holds anything, and a double-quoted one holds no expansion, so a commit message stays one word. [[spec/tickets/the-cage-survives-its-index]]
export function wordsOf(command: unknown): string[] | null {
  const text = String(command ?? "");
  const words: string[] = [];
  let word: string | null = null;
  let at = 0;
  while (at < text.length) {
    const c = text[at] ?? "";
    if (c === "'" || c === '"') {
      const end = text.indexOf(c, at + 1);
      if (end < 0) return null;
      const inner = text.slice(at + 1, end);
      if (c === '"' && /[$`\\!]/.test(inner)) return null;
      word = (word ?? "") + inner;
      at = end + 1;
    } else if (c === " " || c === "\t") {
      if (word !== null) words.push(word);
      word = null;
      at += 1;
    } else if (SHELL.test(c)) {
      return null;
    } else {
      word = (word ?? "") + c;
      at += 1;
    }
  }
  if (word !== null) words.push(word);
  return words;
}

// A commit taking its message and the tracked changes, and no amend and no skipped hook. [[spec/tickets/the-cage-survives-its-index]]
function commits(words: readonly string[]): boolean {
  for (let at = 0; at < words.length; at += 1) {
    const word = words[at] ?? "";
    if (word === "-m" || word === "-am") {
      if (at + 1 >= words.length) return false;
      at += 1;
    } else if (!/^(-a|--all|-q|--quiet|--message=.*)$/s.test(word)) return false;
  }
  return true;
}

// A push of a work branch to origin, and no force, no delete and no other ref. [[spec/tickets/the-cage-survives-its-index]]
function pushesWork(words: readonly string[]): boolean {
  const named = words.filter((word) => !/^(-u|--set-upstream|-q|--quiet)$/.test(word));
  return named.length === 2 && named[0] === "origin" && WORK.test(named[1] ?? "");
}

// A pkill matching the full command line against a path under the runtime folder, so it stops the stale index and nothing outside it. [[spec/tickets/the-cage-survives-its-index]]
function killsRuntime(words: readonly (string | undefined)[]): boolean {
  const named = words.filter((word) => !/^-(9|15|KILL|TERM)$/.test(String(word)));
  return (
    named.length === 2 && named[0] === "-f" && String(named[1]).includes(`${RUN}/`)
  );
}

// The one line a guarded call meets while the hooks door stands down. [[spec/tickets/a-down-index-refuses-calls]]
export function refusedText(e: Given): string {
  return [
    `Level zero refuses ${String(e?.tool ?? "this call")}: the index answers nothing,`,
    "so no cage stands behind the call.",
    `The index keeps the fault under ${ALARMS}.`,
    "Run ./RUNME.sh serve to bring it back, or ./RUNME.sh doctor where that fails.",
    "Both pass, and so do read, grep and glob, ./RUNME.sh index standing,",
    `pkill -f naming a path under ${RUN}/, and the commands that save the work:`,
    "git status, git log, git add, git commit -m, and git push origin work/<name>,",
    "each standing alone, after cd <folder> && at most.",
  ].join(" ");
}
