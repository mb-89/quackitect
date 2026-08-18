---
minted_in: i1
id: dsp-boot-and-power
type: "[[design-spec]]"
statement: the engine standing up and lying down, carried by the host bridge, the stop hook, the boot bench and the packager
realizes:
  - el-bootstrap
files:
  - project/deliverable/engine/bin/se-pty.ts
  - project/deliverable/engine/bin/se-hook-stop.ts
  - project/deliverable/engine/bin/se-hook-start.ts
  - project/deliverable/engine/pullnotice.ts
  - project/deliverable/engine/bin/package.ts
  - project/deliverable/engine/version.ts
---

## Responsibility

The seam between the engine and the host it lives in: the pty bridge
that keeps a terminal session alive, the stop hook that reports the
session's trail when a host turn ends, and the boot bench that keeps
standing up fast. The packager assembles the shippable archive - the
same tree the export copies, zipped, with the entry README rendered
in - so standing up can start from one file. The shutdown-at-idle countdown and the end-state
trigger land here when they are built — the requirement stands
(req-shutdown-fires-only-idle-or-end), the mechanism is owed.

## What survives a reload, and what does not

SETTINGS SURVIVE THE ENGINE, NOT THE SESSION. The mirror's controls restore
across a RELOAD like the decision graph, from one store restored wholesale.
A session that ended and started again is a NEW session and takes the defaults.

THE SHIM STAMPS EACH CHILD WITH A TOKEN, and matching it is what tells the two
apart. It fails safe: an absent or unfamiliar stamp simply does not restore.
There is no cleanup step to forget, so a crash or a power cut cannot leave the
last session's controls standing.

## The reading credit survives a reload

THE AGENT READ THE WORDS. Replacing the process did not unread them.

TWO CONDITIONS, AND THE SECOND IS THE ONE THAT WAS MISSING. The session stamp
says this is the same session, so a compaction still re-owes the whole reading.
The PROCESS ID says the engine actually restarted — without it a second session
built inside one process would inherit a credit it never earned.

FRESHNESS IS DECIDED NOWHERE NEAR HERE. Every entry is re-checked against disk
wherever it is used, so a document whose words moved is owed again by
construction rather than by a second mechanism that could disagree.

## The target survives a reload; the position does not

THE POINT OF BOOT IS TO BOOT THE AGENT, NOT THE MACHINE.

IT DOES NOT CONTRADICT THE DESK RULE. Every engine START still aims at the
front desk, because a start has no matching session stamp to restore from.
Only a RELOAD restores, on the same two conditions the reading credit uses.

THE POSITION IS STILL NOT REMEMBERED. Evidence gives the position, the target
gives the direction, and the recompute walks back on its own. Before this, a
reload mid-record landed at the desk with nothing aimed, so the agent paid an
aim and a sweep to stand where it already stood.

AN UNREACHABLE RESTORED TARGET IS SAFE. The route cannot be drawn and the pull
answers wait, which is the same answer a stale aim has always produced.

## A long response is stored truncated

A LONG RESPONSE IS STORED TRUNCATED, so parsing the whole of it
throws and the tooth silently loses its bite. Found live on
2026-08-14: the hook passed a mid-work stop twice, because every
recent pull's response was too long to store whole.

Only three fields decide the verdict and all three sit near the
FRONT of the answer, so they survive the cut. Read them directly.

## The notch decides

THE NOTCH DECIDES, NOT THIS FILE (owner design 2026-08-16). One fixed
rule was right about eight stops in a day and wrong about five, and no
amount of tuning lets it see the difference — the reason a stop happened
is not in the walk's position. The person can see it, so the notch is
theirs. machines/stopat.md holds what each one means.

AN UNREADABLE OR ABSENT NOTCH IS `agent judgement`, the default, which
is the behaviour every line below this already described.

## The desk with nothing routed is the machines own

THE DESK WITH NOTHING ROUTED IS THE MACHINE'S OWN STOP, whatever the
pull happened to call it. The desk's own guidance says so in as many
words: "Without a routed goal, stay at the desk and stop."

IT ANSWERS `do` ON THE TURN THE WALK ARRIVES THERE, because the desk's
guidance is itself work — read the method, sweep the inbox, listen to
the person. Only the NEXT pull answers `wait`.

SO THE TOOTH BIT A SANCTIONED STOP (owner, 2026-08-17), one call after
an iteration shipped and the walk landed at the desk. The agent had
already named which sanctioned stop applied and stopped anyway. The
owner's words: "when you're on the front desk after an iteration, you
just stop. You don't keep going."

THE TARGET HALF STILL BINDS. A routed goal is a standing instruction,
and the desk is not a hiding place from one.

## The only stops that are sanctioned

THE ONLY STOPS THAT ARE SANCTIONED, named rather than implied (owner
ruling 2026-08-14: "you don't need to stop working unless I explicitly
told you to or you need a decision from me").

The old wording said only "a question that BLOCKS", and that was read as
covering any question the agent felt uncertain about. It is narrower
than that: the walk stops where a PERSON is genuinely required, or where
it cannot go on.
A FOURTH JOINED THEM ON 2026-08-14, on the owner's word: "in the last few
retros, you never asked me for field feedback. So you don't stop. You just
continue with your stuff... asking me for field feedback is a reason to
stop."

It fits (2) on its face and was never read that way, because the agent
could always find more retro to do and kept walking past the question.
Only the FIRST retro step that needs a person gets named here; the rest
of the retro proceeds while the answer is owed.

## The session cleans up after itself

THE SESSION CLEANS UP AFTER ITSELF (owner, 2026-07-30): when the
machine reaches end, the server posts here. The host waits for the
agent's output to settle (its goodbye must not be cut), asks it to
leave with /exit, and only an agent that will not leave gets its
tree killed. The host itself exits with the agent, as it always did.

## The pull notice

THE PULL NOTICE — written once, printed by every hook that greets an agent.

WHY IT IS A MODULE AND NOT A STRING IN EACH HOOK. Two SessionStart hooks
exist, and they fire for different arrivals:

- `.claude/settings.json` at the REPOSITORY ROOT is committed, so it is the
  only hook a fresh cloud clone can fire. It runs se-hook-arrive, which
  performs the arrival and then greets the agent.
- `project/.claude/settings.json` is PLACED by the arrival or by the editor,
  so it only ever fires for a session that is already caged. It runs
  se-hook-start.

Both must tell the agent the same thing about the pull. Until 2026-08-18
each carried its own hand-written copy, which is two sources for one text
and the drift that follows.

WHAT DOES NOT BELONG HERE: rules. The rules reach an agent through the
prompt layer, assembled verbatim from project/guidance/ by promptlayer.ts.
A hook that restated a rule would be a third source for it. This module
carries the ONE thing the prompt layer cannot: what to do first, in a
session that may not have read anything yet.

## The version is one fact

THE VERSION IS ONE FACT, read from the package manifest.

It was hardcoded as "3.0.0-bootstrap" in FOUR places — the call log's stamp,
the startup banner, the MCP server's advertised version, and the websearch
hook's log entry. None of them followed the 4.0.0 release, so every call
logged across the whole of v4 carried a version the product had already left
behind.

A STAMP NOBODY MAINTAINS IS WORSE THAN NO STAMP. It reads as provenance and
it is false, which is exactly what vp-the-ledger is for. Found at
gate-release on 2026-08-14, when the packaged engine announced 3.0.0-bootstrap
out of a 4.1.0 archive.

ONE READ, ONCE PER PROCESS, at import. That is why files.test.ts's ceiling
carries it rather than the reader being routed through readNode: there is no
node here, only the manifest the packaging script already reads.
