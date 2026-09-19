---
kind: [[ticket]]
state: closed
group: the-rules-hold-themselves
urgent: true
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
step: do
record:
  - step: do
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: c60c4dbc702ad6588e4b1c83508bf6c0e9aa3f14
    hash_after: 5dd7383765ded67c1ac93e0c8abc7460632a0ab2
reason: done
---

# Ask

The voice rules read a note's prose, and leave the fields the engine writes alone.

Four rules walk a note line by line: `Markup`, `Shape`, `ListItem` and `CodeSpans`. Each skips a fence, a table row, a heading and a quote. None skips the frontmatter, so each reads the YAML the engine writes as though a person wrote it. `Sentence` stands outside this, because it runs on Vale's own scoping, which reads the frontmatter as no prose.

`work/the-hand-carries-a-step` stands `done` and merges nowhere, because its check answers 1 on four lines the engine wrote:

| the note | the line | the field |
|---|---|---|
| `the-hand-carries-the-session` | 49 | `asks` on a person step |
| `the-hand-carries-the-session` | 156 | `why` in a record entry |
| `the-hand-carries-the-session` | 185 | `why` in a record entry |
| `the-spawn-takes-a-step` | 112 | `why` in a record entry |

Each holds a judge's reasoning, joined with a semicolon, and each names the code it read. So each runs past four code spans in one sentence. A hand rewording them writes over the record, and the engine writes the same shape at the next hand-back.

`Vocabulary` already blanks the frontmatter, with `blanked(out, "(?s)^---\n.*?\n---")` in the projected rule. So the tree holds the guard, and these four rules stand without it.

Done is a tree where a record merges. The trade stands open, and this ticket picks one:

| the road | what it costs |
|---|---|
| blank the frontmatter in the `rows` helper | one guard in `paragraph.js`, and the rules then read no field of the frontmatter, including the `does` and `says` a person writes |
| blank the engine's own fields alone | the guard names `asks`, `why` and `said`, and a person's prose in the frontmatter keeps its rules |
| hold the engine to the rules | the judge writes a list where it writes a run, and every record already on disk stands refused |

# do

<!-- makes the change the ask names -->

## change

The owner picked the second road, and named the seam: the schema says which fields hold prose.

`paragraph.schema.yaml` grows a `frontmatter` key naming them, and the projection carries that list into every rule it writes:

| what stands | where |
|---|---|
| the list of prose fields | `spec/schemas/paragraph.schema.yaml` |
| the Tengo that blanks the rest | `.claude/skills/level0/lib/helpers.js` |
| the list reaching each rule | `prelude` in `paragraph.js`, through the layer |

`frontless` blanks each frontmatter line outside the list, and keeps its length, so a match still names its place. A line carrying no key rides the key above it, so a value running over several lines holds together. `plain` and `rows` both open with it, so every rule inherits the guard.

Two things surprised me:

| the surprise | what it cost |
|---|---|
| `Sentence` stands outside this, on Vale's own scoping, which reads the frontmatter as no prose | one row of the ask, corrected |
| `scope` left the list, because a YAML sequence carries brackets into a raw line | sixteen guidance notes read red until it went |

The reading proves both halves. The rules refuse a `does` field holding seven code spans, and they leave a `hand` field holding seven alone.

The guard stands, and nothing holds it there. So this hand adds the case, and no rule moves:

| what lands | where |
|---|---|
| a record's `why` holding five code spans, which draws nothing | `test/contract/paragraph.test.js` |
| the same line under `does`, which draws the refusal | the same case |
| the line naming the exception a reader meets | [[spec/design_output/projection#what-stands-outside-a-layer]] |

What surprises this hand: the two notes the ask names lint clean on this commit,
and the four lines it lists draw nothing. The road the owner picks stands in the
tree already, so the work here is the program holding it.

# Discussion

The queue handed `work/the-hand-carries-a-step` to the desk, and `branch review` named one thing to fix. That one thing is this.

The branch stands `done` on its own record, and its box left the check red. So the box met the same wall, and a cloud box carries nobody to ask.

The owner picks the road, because the first two cost a rule this tree already wants over a person's prose. Until then the branch waits, and the reviewer reads this note.
