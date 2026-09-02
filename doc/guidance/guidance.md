# Guidance

What a guidance file is, and the shape every one of them has.

## Motivation

Guidance is what an agent holds before it acts. Every byte of it is paid for
on every turn, by every agent, whatever it is doing. A file that grows by
accretion is paid for by everyone and read by nobody.

Guidance written as argument teaches argument. An agent handed essays writes
essays. An agent handed a list of rules writes to the rules. The register of
the guidance is the register of everything the agent produces afterwards.

So every guidance file has three chapters, and the engine hands out only one
of them.

## Actionables

- A guidance file has exactly three chapters, in this order: Motivation,
  Actionables, Discussion.
- Motivation says why the file exists, in at most 3 paragraphs.
- Actionables is a list. One rule per item. Each item is an instruction a
  reader can follow or check, in at most 25 words.
- Actionables holds at most 15 items. An item that joins usually means an
  item leaves.
- Discussion holds the rest: cases, measurements, prior art, argument. It is
  read on demand and never handed out.
- The engine hands an agent the Actionables and nothing else. The agent opens
  the file when it wants the reason.
- A rule that a program can check is a check, not a rule. Move it to the
  engine or to `util/checks/` and take it out of Actionables.
- A rule nobody heeds is deleted or made a check. It does not stay as prose.
- Write a case into Discussion in the past tense, once, with the token id.
  Never write it into Actionables.
- No sentence in any chapter is written in capitals for emphasis.
- Every file follows `voice.md`.

## Discussion

### Where this came from

By 2026-09-02 the guidance corpus had grown to about 1,400 lines across six
files. Most of it was cases: a reviewer found a class of mistake, wrote it up
in capitals, and appended it to the rule it belonged to. The engine handed the
whole of `reviewing.md`, `specifying.md` and `cases.md` to every reviewer and
every drafter. The tokens those agents wrote came back in the same register,
and the record grew to 2.8 MB over 335 tokens.

The three-chapter shape is the owner's ruling. The motivation chapter keeps
the reason from being lost. The actionables chapter is small enough to hold.
The discussion chapter is where the argument goes so that it stops leaking
into the other two.

### On the size cap

Fifteen is a working number and not a measurement. Miller's seven plus or
minus two is about short-term memory, not about rule lists, and it is cited
here as an estimate of what an agent applies rather than reads. The retro
guidance already capped a checklist near seven for the same reason.

### On checks over prose

A guidance sentence that a program could have checked is a sentence somebody
has to remember. The engine's voice checker refuses a semicolon at the write,
and nobody has to remember the rule. That is the pattern. Where a rule
cannot be checked, it stays as prose, and the prose says what to do rather
than why.
