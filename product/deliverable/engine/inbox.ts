// The stray-note inbox — se_note's landing strip (.se/notes.jsonl,
// machine-local). A note is PENDING until a retro drains it; no drain
// machinery exists yet, so every note on file is pending. The mirror's
// feed surfaces pending notes from EARLIER sessions too — the inbox must
// never fall out of sight just because the session rolled over.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { stripBom } from "./jsonio.ts";

export interface StrayNote {
  ref: string;
  text: string;
  at: string;
  /** Whose hand captured it — agent | human (absent on old notes = agent). */
  by?: string;
}

function notesPath(seDirPath: string): string {
  return join(seDirPath, "notes.jsonl");
}

export function appendNote(seDirPath: string, text: string, by = "agent"): { captured: string; inbox: number } {
  const p = notesPath(seDirPath);
  const note: StrayNote = { ref: `note-${randomBytes(6).toString("hex")}`, text, at: new Date().toISOString(), by };
  mkdirSync(dirname(p), { recursive: true });
  appendFileSync(p, JSON.stringify(note) + "\n", "utf8");
  return { captured: note.ref, inbox: readNotes(seDirPath).length };
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
