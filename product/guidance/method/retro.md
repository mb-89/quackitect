---
id: method-retro
statement: The retro — look back, drain the inbox, adjudicate reports, emit durable improvements.
---

# retro — the method

A retro is a FUNCTION, not a state: fire it at its trigger points, or
freely at idle. It is blameless. Fix the system — guidance, machines,
conditions, forms, the engine. Never a person.

## When it fires

- An iteration finishes. It writes a "retro required" note; the next
  start_iteration refuses until a retro ran.
- The owner asks for one.
- At idle, freely. Allowed, never required.

## The steps

1. Field feedback — open with it. Ask the owner what came back from the
   field since the last look. Capture every answer as a note.
2. Adjudicate pending expedition reports. Present each pending report.
   The owner rules per report:
   - APPLY — the findings become design input. The record flips to
     report: approved.
   - DISMISS — read, no action. The record flips to report: dismissed.
3. Drain the notes inbox. Walk EVERY pending note once. Disposition each
   with se_note_drain:
   - done — shipped or handled; say where.
   - obsolete — overtaken or wrong; say why.
   - carried — still wanted; name the follow-up home (a fresh scoped
     note, a guidance edit, the next expedition's goal).
   Nothing stays pending after a retro.
4. Hunt wasted effort. Rework, reversals, avoidable refactors,
   reinventing instead of reusing. Each one is a lead.
5. Mine the record, recency-weighted. se_log_query aggregates the call
   log: top tools, failure rates, repeated refusals. A command that keeps
   failing or a refusal that keeps firing is a lead — the fix may be a
   tool, a refusal, or better guidance.
6. Tally the previous retro's improvements. Promote the wins. Dismiss the
   duds WITH the reason recorded, so a dud is never re-proposed.
7. Aim every improvement at a durable home: guidance, a machine, a
   condition note, a form template, an engine refusal. Emit only the few
   highest-leverage notes. Each one specific and checkable — a concrete
   change, never "improve X".

## The mechanical half

- se_note_drain marks a note drained with its disposition; drained notes
  leave the inbox count and the pending feed. Both hands may drain —
  where the state gate allows the tool (idle's open lane; a dedicated
  retro scope arrives with the retro's trigger states).
- Report flips (approved | dismissed) are edits to the record's
  frontmatter — markdown, human-editable, the truth.
- se_log_query is the query lane. Never an ad-hoc script.
