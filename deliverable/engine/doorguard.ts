// see dsp-the-door-refusals.md
//
// TWO REFUSALS, AND NOTHING ELSE. Both read doors.ts and hold no copy of any
// predicate. The rule module answers questions; this one throws.

import {
  DOORS,
  type Door,
  departureFile,
  departureLines,
  departures,
  MARKER,
  malformedDepartures,
  reachesOnDisk,
  unreasonedOnDisk,
} from "./doors.ts";
import { CLAUSES, Rejection } from "./errors.ts";

/**
 * Every door whose departure list this path is.
 *
 * IT IS PLURAL BECAUSE ONE FILE HOLDS THEM ALL. Taking the first match would
 * check the first door's section and wave every other door's through.
 */
function listedDoors(rootRelativePath: string): readonly Door[] {
  const path = rootRelativePath.replace(/\\/g, "/");
  return DOORS.filter((d) => departureFile(d.id) === path);
}

/**
 * REFUSE A DEPARTURE THAT STATES NO REASON.
 *
 * THE REASON IS THE ENTRY, NOT METADATA ON IT. A bare path is not a line, and
 * ignoring one instead would leave a reader unable to tell a rejected line from
 * one nobody wrote.
 *
 * IT DEMANDS A REASON, NEVER A GOOD ONE. Judging quality is a reviewer's job,
 * and the list is what they read.
 *
 * IT ALSO REFUSES A BULLET IT CANNOT READ AT ALL, for the same reason one line
 * up: silence would leave the author believing an exemption stands.
 */
export function guardDepartureHasReason(root: string, rootRelativePath: string, content: string, source: string): void {
  for (const rule of listedDoors(rootRelativePath)) {
    // WHERE THE OFFENDING LINE ACTUALLY IS decides which op repairs it, and the
    // rule module answers that. A line already on disk is replaced in place. One
    // that arrived with the write just refused is on no disk anywhere, so an
    // exact match finds nothing and the remedy fails in the case it exists for.
    const standing = unreasonedOnDisk(rule.id, root);
    // A BULLET THE PARSER CANNOT READ IS REFUSED, NOT IGNORED. Silence here is
    // worse than a bare path: the author is told nothing, believes an
    // exemption stands, and the sweep goes on reporting the module.
    const odd = malformedDepartures(content, rule.id)[0];
    if (odd !== undefined) {
      throw new Rejection({
        clause: CLAUSES.DEPARTURE_WITHOUT_REASON,
        expected: "every bullet below the marker to name a root-relative .ts path, then a dash, then the reason",
        got: `${rootRelativePath}:${String(odd.line)} reads \`${odd.text.trim()}\`, which names no module this rule can match`,
        remedy: {
          tool: "se_file_patch",
          args: {
            ops: [
              // ANCHORED THE SAME WAY. Two IDENTICAL malformed bullets are
              // genuinely ambiguous and the patch says so; the author picks.
              standing.malformed.has(odd.text)
                ? {
                    path: rootRelativePath,
                    old_string: `${odd.text}\n`,
                    new_string: "- deliverable/engine/<file>.ts — <why this one is allowed past the door>\n",
                  }
                : {
                    path: rootRelativePath,
                    old_string: MARKER,
                    new_string: `${MARKER}\n- deliverable/engine/<file>.ts — <why this one is allowed past the door>`,
                  },
            ],
          },
          note: "the path is root-relative and ends in .ts, because that is what the rule matches a module by",
        },
        source,
      });
    }
    const bare = departureLines(content, rule.id).filter((b) => b.reason === "");
    if (bare.length === 0) continue;
    // EVERY BARE LINE IS NAMED, not the first. Reporting one at a time costs
    // an author one refused write per missing reason.
    const named = bare.map((b) => `${rootRelativePath}:${String(b.line)} names ${b.path}`).join("; ");
    throw new Rejection({
      clause: CLAUSES.DEPARTURE_WITHOUT_REASON,
      expected: "every departure to carry the reason it stands on, after the path and a dash",
      got: `${named} — ${String(bare.length)} departure(s) under ${rule.id} state no reason`,
      remedy: {
        tool: "se_file_patch",
        args: {
          // ANCHORED TO THE WHOLE LINE, newline included. A bare `- <path>` is
          // a strict PREFIX of the same path already declared with its reason,
          // so an unanchored match found two occurrences and the patch refused
          // as ambiguous — for the commonest case there is, a listed path whose
          // reason got dropped.
          //
          // NOT ON DISK, THE LINE IS INSERTED BELOW THE MARKER instead, which
          // is the write the author was making. There is nothing to replace,
          // because the write carrying it was refused.
          ops: bare.map((b) =>
            standing.bare.has(b.path)
              ? {
                  path: rootRelativePath,
                  old_string: `- ${b.path}\n`,
                  new_string: `- ${b.path} — <why this one is allowed past the door>\n`,
                }
              : {
                  path: rootRelativePath,
                  old_string: MARKER,
                  new_string: `${MARKER}\n- ${b.path} — <why this one is allowed past the door>`,
                },
          ),
        },
        note: "the reason is what a reviewer reads to decide whether the departure still holds, so a bare path buys nothing and is refused rather than ignored",
      },
      source,
    });
  }
}

/**
 * The first door this write would NEWLY reach with no departure declaring it.
 *
 * THE ALREADY-REACHES ESCAPE IS PER DOOR, inside the predicate. Evaluated once
 * for whichever door matched first, a file already reaching door A would carry
 * a brand-new reach to door B straight past the guard.
 *
 * THE ON-DISK QUESTION IS THE RULE MODULE'S. Opening the file here would make
 * the guard that refuses undeclared reaches an undeclared reach itself.
 */
function newlyUndeclared(root: string, path: string, content: string): Door | undefined {
  return DOORS.find((d) => d.covers(path) && d.reaches(content) && !departures(d.id, root).has(path) && !reachesOnDisk(d.id, path, root));
}

/**
 * REFUSE A WRITE THAT ADDS A REACH NOBODY DECLARED.
 *
 * IT REFUSES THE ADDITION, NEVER THE EDIT. A module that already reaches keeps
 * being editable, because the modules that reach today are the work and a guard
 * that froze them would block the fix as well as the fault.
 *
 * SO THE QUESTION IS: did THIS write turn a quiet module into one that reaches.
 * Both halves of that are the rule module's to answer; nothing here opens a file.
 */
export function guardNoUndeclaredReach(root: string, rootRelativePath: string, content: string, source: string): void {
  const path = rootRelativePath.replace(/\\/g, "/");
  const rule = newlyUndeclared(root, path, content);
  if (rule === undefined) return;
  throw new Rejection({
    clause: CLAUSES.UNDECLARED_REACH,
    expected: `${rule.id} to be reached only by a module the departure list declares, with its reason`,
    got: `${path} would reach ${rule.id} and no departure records it`,
    remedy: {
      tool: "se_file_patch",
      args: {
        ops: [
          {
            path: departureFile(rule.id),
            old_string: MARKER,
            new_string: `${MARKER}\n- ${path} — <why this one is allowed past the door>`,
          },
        ],
      },
      note: `route the reach through the door instead, or declare it with the reason it stands on. What this rule governs: ${rule.governs}`,
    },
    source,
  });
}
