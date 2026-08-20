---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-dec-stop-at-is-a-four-notch-dial-the-hook-enforces
type: "[[raid]]"
kind: decision
statement: STOP AT is a four-notch dial under the autonomy buttons — state end, agent judgement, bless, blockers only — and the stop hook reads it instead of applying one fixed rule.
owner: the owner
trigger: any change to the stop hook, to the mirror's controls, or the first session where a notch behaves differently from its label
status: decided
impact: without it the hook applies one rule to every situation, overriding a stop the contract requires as readily as an overcautious one — five times in one day.
breaks_how_badly: crippling
how_likely: conceivable
weighs_with: none
weighs_against: none
source_refs:
  - note-3f15f19e2165
  - note-4592c67f8ff4
  - req-controls-never-advance-walk
  - req-autonomy-change-applies-forward
  - raid-dec-the-engine-runs-the-red-and-owns-its-own-promotions
---

## The design, in the owner's own shape

ONE CONTROL, FOUR NOTCHES, sitting under the autonomy buttons and labelled
`stop @`. It answers one question: when may the agent end its turn?

- `state end` — EVERY state transition is blocked. The engine refuses to change
  state and tells the agent to end its turn. The person releases it.
- `agent judgement` — the agent decides. This is today's behaviour.
- `bless` — the agent does not stop until the next bless is owed.
- `blockers only` — the agent never stops unless it is genuinely blocked and
  cannot continue at all.

THE HOOK ENFORCES IT rather than carrying its own fixed rule. Today the hook
reads the walk's POSITION and cannot see the REASON, so a stop the contract
requires looks exactly like a lazy one.

## It supersedes the two-button sketch

note-3f15f19e2165 RECORDED A PAIR: a freeze and a bless. This is better and
strictly wider. `state end` is the freeze, `bless` is the bless, and the two
notches between them are the settings that were missing — the one we run at
today, and the one for a long unattended stretch.

A DIAL ALSO MATCHES THE CONTROL BESIDE IT. The autonomy dial is one control
with named rungs, and this sits under it answering a neighbouring question.

## The one clause it has to be built around

req-controls-never-advance-walk IS A STANDING ROW, and the walking guidance
says it in as many words: "Nothing they press moves the machine a state forward
or back — the walk advances on the agent's pull and nothing else."

`state end` NEEDS THE PERSON TO RELEASE A TRANSITION, which reads like a
conflict and is not one under the right reading.

THE RESOLUTION THAT KEEPS BOTH TRUE: the press grants PERMISSION, it does not
advance. The engine holds the transition, the person releases it, and the
AGENT'S NEXT PULL is still what moves the walk. Nothing the person presses
moves a state; it only stops refusing.

That reading is assumed here rather than ruled, and it is the cheaper half of
the open question below.

## How much one release covers, answered by the label

A SINGLE PULL ROUTINELY SWEEPS MANY STATES — a re-entry swept seventeen on
2026-08-16. So the question looked open: does one press release one transition,
or one pull?

THE LABEL ANSWERS IT. `stop @ state end` names WHERE the agent stops, and that
is at the end of every state. One press, one state. Seventeen presses for that
re-entry is not a defect of the notch, it is the notch doing its job.

THE OWNER'S WORDS SAY THE SAME: "every state transition is blocked... if you
wanna change a state, the engine will say no, you stop your turn." Every
transition, not every pull.

SO THE FOUR NOTCHES ARE A LADDER OF STOPPING DISTANCE, tightest first: every
state, the agent's own call, the next bless, and only a hard block. Somebody
who does not want to press seventeen times moves one notch down, which is what
the dial is for.

## Rejected options

- TWO BUTTONS, a freeze and a bless (note-3f15f19e2165). Superseded by this
  entry: a freeze is `state end` and a bless is `bless`, and the pair had no
  way to say "today's behaviour" or "only when truly blocked".
- LEAVE THE HOOK'S RULE FIXED AND TUNE IT. It has been tuned and it still
  overrode a rule-9 stop five times in one day. A rule that cannot see the
  reason cannot be tuned into seeing it.
- A BOOLEAN "stop more" / "stop less". It collapses `bless` and `blockers only`
  into one notch, and those are the two that differ most in an unattended run.

## Consequences

- The stop hook reads the notch instead of carrying its own rule.
- `state end` holds transitions in the ENGINE, so the block does not depend on
  an agent choosing to honour it.
- The press grants permission and never advances, so
  req-controls-never-advance-walk keeps holding.
- `blockers only` makes the hook nearly silent, which is the setting an
  unattended overnight run wants and cannot have today.
