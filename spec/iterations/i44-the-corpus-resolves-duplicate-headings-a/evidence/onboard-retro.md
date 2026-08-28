---
form: onboard-retro
by: agent
signed_off: 2026-08-28T10:25:08.781Z
authors: agent
files:
---

# Evidence form / onboard-retro

## current_situation

i44 stands seeded since 2026-08-20 and has just been entered. It is the corpus-repair iteration: duplicate headings, dangling references, stale narrations, the work-token rename, dead verbs in the use cases, and the test-spec paths.

The survey counts one open expedition, forty open iterations, zero pending notes and forty-nine standing work tokens.

This is a cloud box, cloned fresh this morning. The owner is present in chat and routed the run.

Boot's exit check was red on arrival. One raid entry carried the frontmatter key `probed` twice, so preflight and the sweep both refused. The two values were merged into one and the check went green.

## field_feedback

The owner reported that the previous session appeared to kill the lane server and could not restart it, and asked whether the MCP server is usable at all.

What the box actually showed: the lane answered `se_pull` on the first call of this session. The arrival hook's own line said the lane failed to come up within sixty seconds, and it was up by the time the session started.

What was really broken was the boot exit check, not the server. `spec/trace/raid/raid-asm-one-second-resolution-is-enough-to-time-a-lane-call.md` carried `probed` twice. YAML refuses duplicate keys, so preflight exited 1 and the conformance sweep reported the same file unparseable.

A session that read that as a dead server would keep restarting a process that was already running.

No other field feedback was offered, and the run was not held for more.

## notes_drained

- inbox: nothing to drain, the survey counted zero pending notes before this state opened

## call_log_mined

- Window: 64 records, opening 2026-08-28T10:17:34Z, which is this session's own first call.
- Reach: the window holds no earlier session, because the call log is machine-local and this container was cloned fresh.
- Tools: se_file_read 32, se_pull 14, se_update 9, mirror_slow 3, se_file_patch 1, se_survey 1, se_file_glob 1, se_aim 1.
- Spill paging: 29 of the reads were cursor pages of `.se/answers/se_pull.json`, because every boot document exceeded the 6000-byte bound.
- Refusals: one, SE-C-120, for a brief chaining three parts. The remedy landed on the next call.
- Lane jobs done in the shell: none. No `se_run` call was made at all.
- Lead: a boot document that always spills costs seven to ten paging calls per document, and the reading loop pays no toll, so the cost is invisible to the guards.

## waste_leads

- The arrival hook reported the lane as failed while it was in fact serving, which invites a restart of a healthy process.
- The boot reading loop spends about thirty calls paging documents the engine could hand over in fewer, larger pages.

## promotions

- i45's package emit_back names three items, and none is a template change: two are retro findings about the state-machine surface and the test queue, and one is a bootstrap spec claim. Nothing there is owed a promotion.
- No template, form or machine was edited in this window, so there is no local improvement to push upstream yet.
- The duplicate-frontmatter-key repair is a corpus fix, not a template change, so it stays local.

## process_stale

Not compared against anything external this window, and no comparison is claimed.

One process observation stands on its own evidence. The onboard retro is meant to be skipped on an empty inbox, and its own guidance says so twice. The state still hands over a full evidence form with six required fields.

That is a gap between the ruling and the mechanism. The skip saves the judgment work and not the paperwork.

## follow_up

Walk on to the kickoff and propose a change size for i44.

The corpus repair itself is the iteration's work and needs no note.

Two items are parked for later, and both are captured as notes rather than carried here: the arrival hook's false failure verdict, and the empty-inbox retro that still demands a form.

## anything_else

The field-feedback question was answered from the owner's opening message rather than by stopping. The owner is present and had already reported what came back from the field, so stopping to ask again would have added nothing.
