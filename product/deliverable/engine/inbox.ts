// The stray-note inbox — se_note's landing strip (.se/notes.jsonl,
// machine-local). A note is PENDING until a retro drains it; no drain
// machinery exists yet, so every note on file is pending. The mirror's
// feed surfaces pending notes from EARLIER sessions too — the inbox must
// never fall out of sight just because the session rolled over.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { CLAUSES, Rejection } from "./errors.ts";
import { stripBom } from "./jsonio.ts";

export interface StrayNote {
  ref: string;
  text: string;
  at: string;
  /** Whose hand captured it — agent | human (absent on old notes = agent). */
  by?: string;
  /** Set by a retro's disposition — a drained note leaves the inbox. */
  drained?: { at: string; disposition: string; where?: string };
}

function notesPath(seDirPath: string): string {
  return join(seDirPath, "notes.jsonl");
}

export function appendNote(seDirPath: string, text: string, by = "agent"): { captured: string; inbox: number } {
  const p = notesPath(seDirPath);
  const note: StrayNote = { ref: `note-${randomBytes(6).toString("hex")}`, text, at: new Date().toISOString(), by };
  mkdirSync(dirname(p), { recursive: true });
  appendFileSync(p, JSON.stringify(note) + "\n", "utf8");
  return { captured: note.ref, inbox: pendingNotes(seDirPath).length };
}

/** PENDING = not yet drained — what the feed shows and the count counts. */
export function pendingNotes(seDirPath: string): StrayNote[] {
  return readNotes(seDirPath).filter((n) => n.drained === undefined);
}

/** The retro's mechanical half (v2's req-retro-drain): disposition a note;
 *  drained notes leave the inbox count. An unknown ref is refused. */
export function drainNote(seDirPath: string, ref: string, disposition: string, where?: string): { drained: string; disposition: string; inbox: number } {
  const all = readNotes(seDirPath);
  const hit = all.find((n) => n.ref === ref);
  if (hit === undefined) {
    throw new Rejection({
      clause: CLAUSES.NOTE_UNKNOWN,
      expected: "an existing note ref",
      got: ref,
      remedy: { tool: "se_note_drain", args: { ref: "<a ref from the pending list>", disposition: "done | obsolete | carried" }, note: "the mirror's feed (filter: note) and .se/notes.jsonl carry the refs" },
      source: "engine/inbox.ts drain",
    });
  }
  hit.drained = { at: new Date().toISOString(), disposition, ...(where !== undefined && where !== "" ? { where } : {}) };
  writeFileSync(notesPath(seDirPath), all.map((n) => JSON.stringify(n)).join("\n") + "\n", "utf8");
  return { drained: ref, disposition, inbox: all.filter((n) => n.drained === undefined).length };
}

export function readNotes(seDirPath: string): StrayNote[] {
  const p = notesPath(seDirPath);
  if (!existsSync(p)) return [];
  const out: StrayNote[] = [];
  for (const line of stripBom(readFileSync(p, "utf8")).split("\n")) {
    if (line.trim() === "") continue;
    try {
      out.push(JSON.parse(line) as StrayNote);
    } catch {
      continue;
    }
  }
  return out;
}
