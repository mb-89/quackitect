---
kind: [[handover]]
status: done
---

# The fixer earns its name

`./RUNME.sh fix` writes three of the mechanical breaches out of a file. Two
rules carry a Vale action, and one gets its fix from this tree.

## What each rule ends up with

| rule | holder | how |
|---|---|---|
| `Contraction` | Vale | `action: replace`, one entry per contraction |
| `LatinAbbreviation` | Vale | `action: replace`, one entry per case |
| `ShoutedLead` | this tree | `src/level0/lib/shout.js`, from Vale's span |
| `EtCetera` | a person | a new rule file, carrying no action |

## What Vale refuses to fix, and why

Vale carries five actions. Run `./RUNME.sh test` to see them driven:

| action | what it does |
|---|---|
| `suggest` | offers a spelling |
| `replace` | writes the swap value, expanding `$1` |
| `remove` | drops the match |
| `edit` | trims, replaces, truncates, splits or runs a regex |
| `convert` | lowercases the match and drops its punctuation |

Three limits fall out of that list, and each one costs a design decision:

1. **No action folds case.** So `ShoutedLead` keeps no action. `convert simple`
   lowercases, and it eats the punctuation with it, so a sentence loses its
   comma. This tree makes that fix instead, from the line and the column Vale
   already reports.
2. **Vale reads one replacement per matched text.** Two swap entries matching
   `etc.` collapse to one, and the first entry wins for both. So a fix that
   depends on what follows the match belongs to a person.
3. **Vale drops both fixes in an overlapping pair**, and names the overlap. A
   token reaching past its own word costs the fix beside it.

`etc.` is limit 2 in the flesh. Its full stop ends the sentence as often as it
ends the abbreviation, and Vale reads the same four characters either way. It
moves to `EtCetera.yml`, which reports and stands back. The four short forms
that read the same everywhere keep their action.

## What holds now

- `./RUNME.sh check` passes, with 54 tests
- `./RUNME.sh fix` over a fixture carrying all three leaves none
- a second run leaves the file byte for byte the same
- a code fence keeps every breach it carries
- an exempted span keeps its breach
- `src/level0/test/fix.test.js` holds 13 tests, one per claim above

## What moves

| file | what |
|---|---|
| `spec/config/styles/VoiceVale/Contraction.yml` | takes `action: replace` |
| `spec/config/styles/VoiceVale/LatinAbbreviation.yml` | takes `action: replace` |
| `spec/config/styles/VoiceVale/EtCetera.yml` | new, holds `etc.` alone |
| `src/level0/lib/shout.js` | new, sentence-cases a reported span |
| `src/level0/test/fix.test.js` | new, 13 tests |
| `src/scripts/cli.js` | `fix` runs rounds, and calls the calming |
| `spec/design_output/level0.md` | a chapter on the fixer |

## Retro

### The case a swap map destroys

`ignorecase: true` with a plain swap value writes the value as it stands, so
`It's` comes back as `it is`, so every sentence opens in lower case. The way
out: capture the first letter in the token and write it back as `$1`.

    "(d)on't": "$1o not"

`ignorecase` stays on, so `DON'T` matches and the capture holds `D`, which
gives `Do not`. A shouted contraction comes back as a sentence for free.

Vale expands `$1` and leaves `${1}` standing as four literal characters. That
one costs a run to find, because the alert prints the replacement it plans and
the plan reads correctly.

### Two dead ends on `etc.`

Both of these look right and both write bad prose:

1. **A lookahead**, `\betc\.(?=\s+[A-Z])`. Vale matches it and the alert names
   the right replacement. Then `fix --apply` writes the other entry's value,
   because both entries match the text `etc.` and the fixer reads by text.
2. **A capture past the abbreviation**, `\betc\.(\s+[A-Z])`. This one writes
   correct prose and then collides. The token reaches into the next word, so a
   contraction starting that word overlaps it, and Vale drops both fixes.

The second dead end is the useful one. It says a Vale token pays for every
character it takes past its own word.

### The order inside a round

Vale runs its own fixes and this tree calms the shouts. Calming goes first.

Vale rewrites `DON'T STOP AT ALL HERE,` into `Do not STOP AT ALL HERE,`, which
no longer opens with a run of capitals, so the shout survives its own fixer.
Calming first gives `Don't stop at all here,` and the next round takes the
contraction.

That is why `fix` loops. One round leaves work the next one finishes, and the
loop stops when the tree stops moving.

### A defect standing beside this work

`./RUNME.sh check` reports `PastTense` on every brief `work new` writes:

    HANDOVER.md:62:35: PastTense: Write the present tense: 'put'.

The line comes from `withContract` in `src/scripts/work.js`, and it reads
`These steps put it back`. So a branch carrying a brief opens with a breach
through no fault of its own. One word closes it, and the fix belongs to whoever owns
`work.js`.

### The guidance stops short of saying the session ends

`spec/guidance/cloud.md` walks a session from `work take` through `work done`,
and then says nothing. So this session closes its branch and offers to take a
second one, which is the whole failure in one sentence.

Two rules come close, and both read as scope advice inside one branch:

| rule | what it says | what it leaves open |
|---|---|---|
| 4 | work the branch you hold and stop at its edge | the edge of the brief, and no word on the session |
| 7 | run `./RUNME.sh work done` last | last of these steps, and no word on the session |

One rule closes it, and the note holds nine of a cap of ten:

    Stop after `work done`. One session works one branch, and the next branch
    belongs to the next session.

### A branch listing goes stale inside a session

`./RUNME.sh work list` reads origin at the moment you call it. This session
reads it once at the start, works for an hour, and then names `work/wire-the-lsp`
as `todo` in its answer. Another session carries that branch to `done` meanwhile.

Run `work list` again before you name a status out loud.

## What the next session inherits

- `spec/design_output/level0#the-fixer-calms-a-shouted-lead` holds the design
- `EtCetera` is the one prose rule with no fix and no plan for one
- `ROUNDS` in `src/scripts/cli.js` caps the loop at five
