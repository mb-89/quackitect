// se-hook-stop — THE UNSANCTIONED STOP IS REFUSED MECHANICALLY.
//
// The contract has said it in prose since 2026-08-07: a turn ends when the
// work does, a report is not a checkpoint, size is not a reason. Prose
// failed four recorded times in two days. This hook is the tooth.
//
// BOTH HOSTS RUN IT. Claude Code fires it as a Stop hook from
// .claude/settings.json. Copilot CLI fires the same script twice over:
// it reads the repository's .claude/settings.json cross-tool, and the
// repo root carries .github/hooks/se-stop.json naming the PascalCase
// "Stop" event — which selects the VS-Code-compatible payload, the same
// snake_case shape Claude sends. One script, one parser, one output:
// {"decision": "block", "reason": ...} on stdout, exit 0. Copilot ignores
// non-zero exits on agentStop, so the block MUST ride stdout JSON.
//
// WHEN A STOP IS SANCTIONED, from the engine's own ground truth (the call
// log — the hook never calls the mirror over HTTP, which would deadlock
// the session's own server):
//
// - the last pull answered "wait" AND NO TARGET IS SET — the machine's own
//   stop: idle, the desk with nothing routed, or a step above the slider;
//
//   THE TARGET HALF WAS MISSING AND AN ESCAPE WALKED STRAIGHT THROUGH THE
//   GAP (owner instruction 2026-08-14). The escape hatch lands at the front
//   desk, and the desk answers "wait". So the sequence was: escape for a
//   real reason, land at the desk, stop — and the tooth had nothing to
//   bite, because the last pull said "wait".
//
//   Measured that day: three stops, two of them post-escape and both
//   passed. A routed goal stood the whole time and idle was an open door
//   at weight 0.2 against a dial of 1.
//
//   A "wait" WITH A TARGET IS NOT THE MACHINE'S OWN STOP. It is an agent
//   declining to walk toward something it was pointed at, which is the
//   exact thing this hook exists to refuse;
// - no pull is on record — the engine never ran here;
// - stop_hook_active is set — this stop was already blocked once. The
//   valve for a question that genuinely BLOCKS: ask it in one line, stop
//   again, and the tooth lets it through. It bites once per stop.
//
// Everything else — do, read, fill, choose — is a walk standing mid-work,
// and the stop is refused with the reason on it.
//
// A hook must never break the turn, so every failure is swallowed and the
// exit is always clean.

import { closeSync, fstatSync, openSync, readSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// bin -> engine -> deliverable -> product -> the project root. The env
// override is the test seam — the suite points the hook at a crafted log.
const root = process.env.SE_HOOK_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

// The newest pull can carry a whole document, so the tail window is wide.
const TAIL_BYTES = 4 * 1024 * 1024;

function tailOf(path: string): string {
  const fd = openSync(path, "r");
  try {
    const size = fstatSync(fd).size;
    const start = Math.max(0, size - TAIL_BYTES);
    const buf = Buffer.alloc(size - start);
    readSync(fd, buf, 0, buf.length, start);
    return buf.toString("utf8");
  } finally {
    closeSync(fd);
  }
}

interface LastPull {
  pull?: string;
  where?: unknown;
  target?: unknown;
  stop_at?: unknown;
  /** False when the newest pull was REFUSED. Under `blockers only` that is
   *  the one thing that sanctions a stop. */
  ok?: boolean;
}

/** The newest se_pull's answer, read from the log tail. */
function lastPull(): LastPull | undefined {
  const lines = tailOf(join(root, ".se", "calls.jsonl")).split("\n");
  let refused = false;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      const rec = JSON.parse(line) as { tool?: string; ok?: boolean; response?: unknown };
      if (rec.tool !== "se_pull") continue;
      if (rec.ok !== true) {
        // A REFUSED PULL IS STILL THE NEWEST WORD ABOUT THE WALK. It says the
        // walk could not move, which is exactly what `blockers only` waits for.
        refused = true;
        continue;
      }
      if (typeof rec.response !== "string") return { ...((rec.response ?? {}) as LastPull), ok: !refused };
      try {
        return { ...(JSON.parse(rec.response) as LastPull), ok: !refused };
      } catch {
        // A LONG RESPONSE IS STORED TRUNCATED, so parsing the whole of it
        // throws and the tooth silently loses its bite. Found live on
        // 2026-08-14: the hook passed a mid-work stop twice, because every
        // recent pull's response was too long to store whole.
        //
        // Only three fields decide the verdict and all three sit near the
        // FRONT of the answer, so they survive the cut. Read them directly.
        const pull = /"pull"\s*:\s*"([a-z]+)"/.exec(rec.response)?.[1];
        if (pull === undefined) continue;
        const target = /"target"\s*:\s*"([^"]*)"/.exec(rec.response)?.[1];
        const where = /"where"\s*:\s*\[([^\]]*)\]/.exec(rec.response)?.[1];
        const stopAt = /"stop_at"\s*:\s*"([^"]*)"/.exec(rec.response)?.[1];
        return {
          pull,
          target,
          stop_at: stopAt,
          ok: !refused,
          where: where === undefined ? undefined : where.split(",").map((s) => s.trim().replace(/^"|"$/g, "")),
        };
      }
    } catch {
      // the first line of the tail may be a torn record; a broken line is skipped
    }
  }
  return undefined;
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c: string) => {
  raw += c;
});
process.stdin.on("end", () => {
  try {
    const p = JSON.parse(raw || "{}") as { stop_hook_active?: boolean; stopHookActive?: boolean };
    // The bites-once valve: a stop already blocked once passes, so a
    // genuinely blocking question can be asked and the turn ended.
    if (p.stop_hook_active === true || p.stopHookActive === true) {
      process.exit(0);
    }
    const last = lastPull() ?? {};
    const pull = last.pull;
    if (pull === undefined) process.exit(0);
    // THE NOTCH DECIDES, NOT THIS FILE (owner design 2026-08-16). One fixed
    // rule was right about eight stops in a day and wrong about five, and no
    // amount of tuning lets it see the difference — the reason a stop happened
    // is not in the walk's position. The person can see it, so the notch is
    // theirs. machines/stopat.md holds what each one means.
    //
    // AN UNREADABLE OR ABSENT NOTCH IS `agent judgement`, the default, which
    // is the behaviour every line below this already described.
    const notch = typeof last.stop_at === "string" ? last.stop_at.trim().toLowerCase() : "";
    // STATE END: the ENGINE holds every transition and refuses to move. The
    // agent stopping is then not a failure of nerve, it is the machine's own
    // stop — exactly what this hook exists to let through.
    if (notch === "state end") process.exit(0);
    // BLOCKERS ONLY: nothing brings the person back until the walk cannot go
    // on. The newest pull being REFUSED is that, and it is the only thing that
    // is — an unattended run is what this notch is for.
    if (notch === "blockers only" && last.ok === false) process.exit(0);
    // BLESS: run to where a thumb is owed anyway, and stop there. A gate is
    // the only place that is true, and the walk's own position names it.
    const at = Array.isArray(last.where) ? (last.where as unknown[]).map(String).join(", ") : String(last.where ?? "");
    if (notch === "bless" && /(^|\/)gate[-_]/.test(at)) process.exit(0);
    // A TARGET IS A STANDING INSTRUCTION FROM THE PERSON. While one is set,
    // the walk has somewhere to be, and "nothing to route" is false whatever
    // the desk answered.
    const target = typeof last.target === "string" ? last.target.trim() : "";
    // THE DESK WITH NOTHING ROUTED IS THE MACHINE'S OWN STOP, whatever the
    // pull happened to call it. The desk's own guidance says so in as many
    // words: "Without a routed goal, stay at the desk and stop."
    //
    // IT ANSWERS `do` ON THE TURN THE WALK ARRIVES THERE, because the desk's
    // guidance is itself work — read the method, sweep the inbox, listen to
    // the person. Only the NEXT pull answers `wait`.
    //
    // SO THE TOOTH BIT A SANCTIONED STOP (owner, 2026-08-17), one call after
    // an iteration shipped and the walk landed at the desk. The agent had
    // already named which sanctioned stop applied and stopped anyway. The
    // owner's words: "when you're on the front desk after an iteration, you
    // just stop. You don't keep going."
    //
    // THE TARGET HALF STILL BINDS. A routed goal is a standing instruction,
    // and the desk is not a hiding place from one.
    const atDesk = at.split(",").some((w) => w.trim() === "front_desk");
    if (target === "" && (pull === "wait" || atDesk)) process.exit(0);
    const where = at;
    const aimed = pull === "wait";
    // WHAT THE NOTCH IS ASKING FOR, said in the refusal rather than left for
    // the reader to infer from a setting they may not have looked at.
    const NOTCHED: Record<string, string> = {
      bless: "[se] stop @ bless: you run until a BLESS is owed, and no gate is owed here. ",
      "blockers only": "[se] stop @ blockers only: you stop only when the walk CANNOT go on, and the last pull was not refused. ",
    };
    const prefix = NOTCHED[notch] ?? "";
    // THE ONLY STOPS THAT ARE SANCTIONED, named rather than implied (owner
    // ruling 2026-08-14: "you don't need to stop working unless I explicitly
    // told you to or you need a decision from me").
    //
    // The old wording said only "a question that BLOCKS", and that was read as
    // covering any question the agent felt uncertain about. It is narrower
    // than that: the walk stops where a PERSON is genuinely required, or where
    // it cannot go on.
    // A FOURTH JOINED THEM ON 2026-08-14, on the owner's word: "in the last few
    // retros, you never asked me for field feedback. So you don't stop. You just
    // continue with your stuff... asking me for field feedback is a reason to
    // stop."
    //
    // It fits (2) on its face and was never read that way, because the agent
    // could always find more retro to do and kept walking past the question.
    // Only the FIRST retro step that needs a person gets named here; the rest
    // of the retro proceeds while the answer is owed.
    const SANCTIONED =
      "FOUR STOPS ARE SANCTIONED AND NOTHING ELSE IS. " +
      "(1) A GATE THE PERSON OWNS — gate-implementation is theirs to bless; the rest are yours at this dial. " +
      "(2) A DECISION ONLY THEY CAN MAKE — no answer you could pick would let the walk continue honestly. " +
      "(3) SOMETHING BROKE and no remedy gets you past it. " +
      "(4) THE RETRO'S FIELD-FEEDBACK QUESTION — ask it, then STOP and wait. It is the owner's own report from outside the machine, " +
      "nothing else in the retro can stand in for it, and walking on past it has quietly skipped it for several retros running. " +
      "(5) A PLAN, BEFORE IT IS ACTED ON. PLANNING WAITS FOR THE OWNER'S GO; EXECUTION DOES NOT (owner ruling 2026-08-14). " +
      "Seeding a record, splitting or merging one, deciding which iteration a finding belongs to, choosing scope — all planning. Present the list and WAIT. " +
      "Once the plan has the go, execute the whole of it without asking again. " +
      "Being unsure is not one. Having a lot left is not one. Having just finished a piece is not one. " +
      "Stopping for one of the four? Say which, in one line, and stop again — this tooth bites once per stop.";
    process.stdout.write(
      JSON.stringify({
        decision: "block",
        reason:
          prefix +
          (aimed
            ? `[se] A target is set (${target}) and the walk is not on it` +
              (where !== "" ? `, standing at ${where}` : "") +
              '. The pull answered "wait" because nothing routed FROM HERE, which is not the same as nothing to do. ' +
              "Take the door that leads toward the target and keep walking. " +
              SANCTIONED
            : `[se] The walk stands mid-work: the last pull answered "${pull}"` +
              (where !== "" ? ` at ${where}` : "") +
              ". A report is not a checkpoint and size is not a reason — call se_pull and keep walking. " +
              SANCTIONED),
      }),
    );
  } catch {
    /* a hook must never break the turn */
  }
  process.exit(0);
});
