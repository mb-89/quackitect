// THE DESK VERBS: the web, the notes, the prose lint, the answer, the survey
// and the call log — the tools that carry words rather than files or work.
//
// Split out of tools.ts.
//
// see dsp-lane-door.md#the-verbs-are-grouped-by-what-they-touch
import { readFileSync } from "node:fs";
import { CallLog } from "./calllog.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { appendNote, drainNote, type Priority, readNotes } from "./inbox.ts";
import { LINT_CONFIG, lintProse } from "./lint.ts";
import type { ToolDef } from "./mcp.ts";
import type { ModelFileSystem } from "./model-fs.ts";
import { seDir } from "./paths.ts";
import type { MirrorState } from "./render.ts";
import { resolve as resolveSeam } from "./resolve.ts";
import { survey } from "./survey.ts";
import type { ReadingHook } from "./tools-file.ts";
import { webFetch, webSearch } from "./web.ts";

/** see dsp-lane-door.md#build-the-server */
function refuseProseWall(tool: string, field: string, text: string): void {
  if (text.length <= 300 || text.includes("\n")) return;
  throw new Rejection({
    clause: CLAUSES.PROSE_WALL,
    expected: `${field} broken into lines — paragraphs and list lines survive every render`,
    got: `${text.length} chars without a single line break — renders as a wall`,
    remedy: {
      tool,
      args: { [field]: "<the same text with real line breaks>" },
      note: "shape it like prose: short paragraphs, one list item per line",
    },
    source: "engine/tools.ts prose-wall",
  });
}

export function deskTools(
  rootOf: (rel?: string) => string,
  projectRoot: string,
  model: ModelFileSystem,
  judgmentDrainAllowed: () => boolean,
  _reading?: ReadingHook,
  doors: () => Record<string, unknown>[] = () => [],
  _mirror?: () => MirrorState,
): ToolDef[] {
  return [
    {
      name: "se_web_fetch",
      title: "se.web.fetch",
      description: "Fetch a URL as readable text (HTML reduced). Large pages page through offset; truncation is always declared.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string" },
          offset: { type: "number", description: "char offset for paging a large page" },
        },
        required: ["url"],
      },
      handler: (args) => webFetch(String(args.url), args.offset !== undefined ? { offset: Number(args.offset) } : {}),
    },
    {
      name: "se_web_search",
      title: "se.web.search",
      description:
        "Web search through one lane verb. Uses Brave when configured, then a keyless provider, then points to native WebSearch only if server-side discovery is unavailable.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          count: { type: "number", default: 8 },
        },
        required: ["query"],
      },
      handler: (args) => webSearch(String(args.query), args.count !== undefined ? Number(args.count) : 8),
    },
    {
      name: "se_note",
      title: "se.note",
      description:
        "Capture a stray — an idea, a bug, a better way — without leaving the state (contract rule 4). Machine-local (.se/notes.jsonl), never committed; joins the mirror's log feed; drained at a retro, later. CAPTURING IS MEANT TO BE CHEAP: give it a title, judge the priority yourself, and keep walking. Never ask the person what a stray is worth.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "the body — leave it out when the title already says it" },
          title: { type: "string", description: "one line naming the stray; taken from the first line of text when absent" },
          priority: {
            type: "string",
            enum: ["must", "should", "could"],
            description: "MoSCoW. YOU judge it, never the person. Defaults to could.",
          },
        },
      },
      handler: (args) => {
        const title = args.title !== undefined ? String(args.title) : "";
        const text = args.text !== undefined ? String(args.text) : title;
        if (text.trim() === "") {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "text, or a title standing in for it",
            got: "neither",
            remedy: {
              tool: "se_note",
              args: { title: "<one line>", priority: "could" },
              note: "a title alone is a legal note — the body is what you add when one line is not enough",
            },
            source: "engine/tools.ts se_note",
          });
        }
        refuseProseWall("se_note", "text", text);
        return appendNote(seDir(projectRoot), text, "agent", title, args.priority as Priority | undefined);
      },
    },
    {
      name: "se_lint",
      title: "se.lint",
      description:
        "The VOICE LINT, on demand: mechanical prose checks (walls of text, long sentences, comma chains, dash chains, missing pyramid structure) over a text, a markdown file, or a whole GLOB of them. Rule parameters are DATA (machines/lint/voice-lint.md) - edit thresholds without recompiling. Catches FORM, never meaning. Self-check your outputs before they ship; sweep a tree with glob before it ships.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "prose to lint, verbatim" },
          path: { type: "string", description: "a root-relative .md file to lint instead" },
          glob: { type: "string", description: "sweep every markdown file matching this glob, e.g. project/guidance/**/*.md" },
        },
      },
      handler: (args) => {
        // see dsp-write-guard.md#the-root-picker-takes-a-path
        const root = rootOf(LINT_CONFIG);
        // THE SWEEP. Linting one file at a time is why nothing was ever
        // linted: the tool could only be pointed at prose somebody already
        // suspected. Only files WITH findings come back, so a clean tree
        // answers small, and anything dropped is named rather than implied.
        if (args.glob !== undefined) {
          const g = model.glob(String(args.glob));
          const md = g.files.filter((f) => f.endsWith(".md"));
          // A STATE NOTE KEEPS ITS PROSE IN THE FRONTMATTER. `guidance` is
          // read by an agent on every single visit, so it is the prose that
          // matters most - and the lint had never seen a word of it, because
          // lintProse strips frontmatter before it starts.
          const lintFile = (p: string): { path: string; count: number; findings: unknown[] } => {
            // ONE PASS, and every finding already carries the key it is in.
            // This used to lint the file, then lint `guidance` and `statement`
            // AGAIN as separate strings — two passes, duplicate findings, and
            // only the two keys somebody remembered to list. lintProse reads
            // every prose key now and tags each finding with its own.
            // THROUGH THE SEAM. An ambient root cannot say which store it
            // means: a lint and a file read of the same path can answer from
            // two of them and neither says which. resolve() picks from what
            // the path IS, so both lanes now reach one tree.
            const at = resolveSeam(rootOf(p), p, "engine/tools.ts se_lint");
            const raw = readFileSync(at.abs, "utf8");
            const findings: unknown[] = lintProse(root, raw, p);
            return { path: p, count: findings.length, findings };
          };
          const files = md.map(lintFile).filter((f) => f.count > 0);
          return {
            glob: String(args.glob),
            swept: md.length,
            ...(md.length < g.files.length ? { skipped_not_markdown: g.files.length - md.length } : {}),
            ...(g.truncated ? { truncated: true, note: "the glob hit its cap - narrow it and sweep the rest" } : {}),
            clean: md.length - files.length,
            files,
            count: files.reduce((n, f) => n + f.count, 0),
            config: LINT_CONFIG,
          };
        }
        if (args.path !== undefined) {
          const p = String(args.path);
          if (!p.endsWith(".md")) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "a prose file (.md) - the voice lint never reads code",
              got: p,
              remedy: { tool: "se_lint", args: { path: "<file>.md" }, note: "or pass text directly" },
              source: "engine/tools.ts se_lint",
            });
          }
          // THROUGH THE SEAM, and the answer NAMES ITS STORE. This call once
          // answered ENOENT from one store while se_file_read served the same
          // path from another.
          const at = resolveSeam(rootOf(p), p, "engine/tools.ts se_lint");
          const findings = lintProse(root, readFileSync(at.abs, "utf8"), p);
          return { path: p, store: at.store, findings, count: findings.length, config: LINT_CONFIG };
        }
        if (typeof args.text === "string") {
          const findings = lintProse(root, args.text);
          return { findings, count: findings.length, config: LINT_CONFIG };
        }
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: "text, path OR glob",
          got: "none of them",
          remedy: {
            tool: "se_lint",
            args: { glob: "project/guidance/**/*.md" },
            note: "text lints one block, path one file, glob a whole tree",
          },
          source: "engine/tools.ts se_lint",
        });
      },
    },
    {
      name: "se_answer",
      title: "se.answer",
      description:
        "Record an answered question (kind 'aq' in the log): the person's question and your answer, verbatim. The voice rule: EVERY direct question answered in chat is ALSO recorded here — chat can be lost mid-turn, the log never loses it. The feed line shows the question; clicking it shows both.",
      inputSchema: {
        type: "object",
        properties: {
          question: { type: "string", description: "the question, short form — becomes the feed line" },
          answer: { type: "string", description: "the answer, complete — shown on click" },
        },
        required: ["question", "answer"],
      },
      handler: (args) => {
        refuseProseWall("se_answer", "answer", String(args.answer));
        return { recorded: "aq", question: String(args.question).slice(0, 90) };
      },
    },
    {
      name: "se_note_drain",
      title: "se.note.drain",
      description:
        "Mark a note drained with its disposition. done | obsolete are MECHANICAL — superseded, already built, ruled on since — and drain wherever this tool is legal, the front desk included. carried | backlog are JUDGMENT and belong to the retro, which is the only place with the whole picture. backlog MINTS A WORK TOKEN INTO THE POOL, on trunk, where any clone can read it: where is REQUIRED as its 'ready when …' re-entry condition, and statement is REQUIRED as what the token IS, written for a reader who never saw the note. THE STATEMENT IS AUTHORED, NEVER PASTED — a raw note is a dump that may carry anything private, so a statement sharing a run of six or more words with it refuses SE-C-140. Cannot state it cleanly yet? Say that, and the pool carries it as an open question. The raw note stays local, unmoved, and is marked drained. A note already drained to backlog refuses a second mint — re-judging one is carried. Drained notes leave the inbox count and the pending feed. An unknown ref is refused.",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "the note's ref (note-…)" },
          disposition: { type: "string", description: "done | obsolete | carried | backlog" },
          where: { type: "string", description: "where it landed or lives on — backlog REQUIRES it: ready when …" },
          statement: {
            type: "string",
            description:
              "backlog REQUIRES it: what the work token IS, in your own words, for somebody who never saw the note. It lands on trunk and a paste is refused — say 'this cannot be stated cleanly yet' rather than copying the note.",
          },
        },
        required: ["ref", "disposition"],
      },
      handler: (args) =>
        drainNote(
          seDir(projectRoot),
          String(args.ref),
          String(args.disposition),
          args.where === undefined ? undefined : String(args.where),
          judgmentDrainAllowed(),
          args.statement === undefined ? undefined : String(args.statement),
          projectRoot,
        ),
    },
    {
      name: "se_survey",
      title: "se.survey",
      description:
        "WHAT STANDS OPEN — one mechanical call: open expeditions, open iterations, pending notes, and the standing WORK TOKENS in the options pool with their ready-when, read from the REPOSITORY so any clone sees the same answer. Everything that can be up is here, so there is only ever ONE inbox to understand. Notes and backlog list as title plus MoSCoW priority, highest first; read any one in full with se_log_query {ref}. The front desk and the retro open with it. The person asks the same question in the mirror, from the machine's header.",
      inputSchema: {
        type: "object",
        properties: {
          detail: {
            type: "string",
            enum: ["full", "brief"],
            description: "full adds every note's whole body. The default lists title and priority only.",
          },
          limit: { type: "number", description: "window the notes list; counts stay complete and the result says what remains" },
          offset: { type: "number", description: "how many notes to skip — 0 is the oldest" },
        },
      },
      handler: (args) => ({
        ...survey(projectRoot, {
          ...(args.detail !== undefined ? { detail: String(args.detail) as "full" | "brief" } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
        }),
        // THE DOORS RIDE THE SURVEY. The desk used to peek every idle door
        // in one tick call; the peek retired with the tick, and the survey
        // is where the desk already looks first — so the vocabulary the
        // advice needs arrives with the same call that lists the work.
        doors: doors(),
      }),
    },
    {
      name: "se_log_query",
      title: "se.log.query",
      description:
        "Query the call log (your own trail): filter by tool/ok/since/text, group_by a field, or fetch a se_run ref's full output. Pages NEWEST FIRST — offset 0 is the newest window, and the result says how many `older` records stand behind it.",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "fetch one record in full by ref" },
          filter: {
            type: "object",
            description:
              "{tool?, ok?, since?, text?, min_ms?} — since: an ISO timestamp, or 'last_retro' (everything after the previous retro, which is the newest carried/backlog drain — the desk cannot make those). text: a case-insensitive substring over the whole record, for finding a TOPIC without reading every hit. min_ms: only records at least this slow — the slowness mine over every door, one-second rule and all",
          },
          group_by: { type: "string", description: "e.g. 'tool' or 'outcome'" },
          limit: { type: "number", default: 20 },
          offset: { type: "number", description: "how many records back from the newest to start — 0 is the newest window" },
        },
      },
      handler: (args) => {
        const log = new CallLog(seDir(projectRoot));
        if (args.ref !== undefined) {
          const rec = log.find(String(args.ref));
          // A NOTE REF RESOLVES HERE TOO. Notes reference each other
          // constantly, and the referenced one is usually DRAINED, so the
          // survey cannot show it. This is already the by-ref lookup; making
          // it answer for notes costs no new tool and no new vocabulary.
          if (rec === undefined) {
            const note = readNotes(seDir(projectRoot)).find((n) => n.ref === String(args.ref));
            if (note !== undefined) return note;
          }
          if (rec === undefined) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "an existing call ref, or a note ref",
              got: String(args.ref),
              remedy: { tool: "se_log_query", args: { limit: 20 }, note: "list recent calls to find the ref" },
              source: "engine/tools.ts se_log_query",
            });
          }
          return rec;
        }
        return log.query({
          ...(args.filter !== undefined ? { filter: args.filter as { tool?: string; ok?: boolean; since?: string } } : {}),
          ...(args.group_by !== undefined ? { group_by: String(args.group_by) } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
        });
      },
    },
  ];
}
