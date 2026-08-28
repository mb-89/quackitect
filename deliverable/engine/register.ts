// see dsp-the-work-store.md#work-drawn-from-a-live-source
//
// TWO REGISTER KINDS ARE WORK BY THEIR OWN DEFINITION. meth-raid.md: an ISSUE
// has happened and hurts now; a DEBT is a shortcut taken knowingly whose cost
// compounds. Both are things somebody has to do something about.
//
// THE OTHER KINDS ARE NOT. A risk has not happened, an assumption is not work,
// and a decision can only be superseded. Drawing those would put rows on the
// board that nobody can ever settle.
//
// THE METHOD NAMES THIS FAILURE AGAINST ITSELF: an entry with no trigger is
// filed rather than watched, and the register becomes a graveyard the first
// time nobody re-reads it. The trigger is meant to be the live part, and
// nothing mechanical read it.
//
// SO THE ENTRY IS DRAWN, NEVER MINTED, exactly as a pending note and a pool
// token are. Nothing is written, so nothing drifts, and the row disappears the
// moment the entry's status stops being open.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseStateNote, readNode } from "./notes.ts";

/** The kinds that ARE work. Everything else in the register is a record of
 *  something, and a record is not a thing to do. */
const WORK_KINDS = ["issue", "debt"];

export interface RegisterEntry {
  id: string;
  statement: string;
  kind: string;
  /** What has to happen for somebody to look at this again. It becomes the
   *  drawn row's re-entry condition, which is the whole point of drawing it. */
  trigger: string;
  /** WHERE THIS ENTRY BELONGS, and the whole of how one leaves the backlog.
   *
   *  An entry with no place stands in the backlog, which is where an open issue
   *  or debt sits until somebody decides who owns it. Writing a position into
   *  its file moves it there, exactly as a backlog item moves — one field,
   *  no verb.
   *
   *  HYGIENE WORK KEEPS NO PLACE ON PURPOSE (owner ruling). Work any round
   *  could do is pulled by whichever round has room, so naming an owner in
   *  advance makes it wait for that owner instead. */
  place?: string;
}

export function raidDir(root: string): string {
  return join(root, "spec", "trace", "raid");
}

/** The register's own path prefix, root-relative and in the corpus's own
 *  separator, so a reference to a drawn row resolves on every platform. */
export const RAID_PREFIX = "spec/trace/raid";

/** Whether an id names a register entry rather than something with a file in a
 *  work home. A drawn row has no work file, so no act naming a home can touch
 *  it — the same cut the pool and the note inbox already make. */
export function isRegisterEntry(id: string): boolean {
  return id.startsWith("raid-");
}

/** EVERY OPEN ISSUE AND DEBT, read from the repository and nowhere else.
 *
 *  ONE BAD NODE MUST NOT COST THE WHOLE ANSWER. An unparseable entry is skipped
 *  the way the pool skips an unreadable token: preflight is what reports it,
 *  and the board losing every row over one file is worse than losing one. */
export function openRegisterWork(root: string): RegisterEntry[] {
  const dir = raidDir(root);
  if (!existsSync(dir)) return [];
  const out: RegisterEntry[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".md")) continue;
    const abs = join(dir, name);
    try {
      if (!statSync(abs).isFile()) continue;
      const fm = parseStateNote(readNode(abs)).frontmatter;
      const kind = String(fm.kind ?? "");
      if (!WORK_KINDS.includes(kind)) continue;
      // ABSENT IS OPEN. An entry that never said it closed is still standing,
      // and treating a missing status as closed would hide exactly the entries
      // nobody has looked at.
      const status = String(fm.status ?? "open")
        .trim()
        .toLowerCase();
      if (status !== "open") continue;
      const place = typeof fm.place === "string" && fm.place !== "" ? fm.place : undefined;
      out.push({
        id: String(fm.id ?? name.replace(/\.md$/, "")),
        statement: String(fm.statement ?? ""),
        kind,
        trigger: String(fm.trigger ?? ""),
        ...(place === undefined ? {} : { place }),
      });
    } catch {
      // An entry nobody can read is not an entry, and it is not the rest of the
      // register's problem.
    }
  }
  return out;
}
