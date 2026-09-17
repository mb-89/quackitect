---
kind: [[ticket]]
state: draft
urgency: now
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
---

# Ask

The voice rules read a note's prose, and leave the fields the engine writes alone.

Four rules walk a note line by line: `Sentence`, `ListItem`, `Markup` and `CodeSpans`. Each skips a fence, a table row, a heading and a quote. None skips the frontmatter, so each reads the YAML the engine writes as though a person wrote it.

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

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

The queue handed `work/the-hand-carries-a-step` to the desk, and `branch review` named one thing to fix. That one thing is this.

The branch stands `done` on its own record, and its box left the check red. So the box met the same wall, and a cloud box carries nobody to ask.

The owner picks the road, because the first two cost a rule this tree already wants over a person's prose. Until then the branch waits, and the reviewer reads this note.
