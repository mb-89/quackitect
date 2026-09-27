---
kind: [[ticket]]
state: open
steps:
  - name: decide
    does: says what the note becomes, and closes it
    from: anyone
    by: retro
    to: retro
    input: ask
    evidence:
      - name: outcome
        form: choice
        options: ["dropped", "done", "became"]
        says: what the note becomes
      - name: says
        form: text
        says: why, in a line, or what the successor carries
step: decide
process: [[spec/processes/note]]
process_hash: 9d7b26202041cf4d
---

# Ask

<!-- line, as text: the smallest case that shows it, why it matters, and what a stranger needs in order to act on it -->

One key answers a different value depending on the reader. `configOf` in `.claude/skills/level0/lib/config.js` reads every layer, and the other readers each skip one:

| the reader | what it skips |
|---|---|
| `asks` and `whereFrom` in `src/bridge/config.js` | the environment, and the work root's tracked file |
| `valuesOf` in `src/extension/lib/widgets.js` | the environment, and the method root's tracked file |
| `Value` in `src/config/config.go` | the method root's tracked file, and the type the schema names |
| `judged` in `.claude/skills/level0/hooks/pull-tool.js` | the environment, because `$` carries none |

| what | where |
|---|---|
| the smallest case | `SE_ANSWER_WORDS` set on the box: `./RUNME.sh config answer.words` answers the variable, and `src/bridge/answer-read.js` reads the tracked value |
| why it matters | the owner sets a key, the verb confirms it, and a door acts on another value |
| where a stranger acts | the readers above, each pointed at `configOf`, or a line per reader in `spec/design_output/config.md` naming the layer it skips and why |

# decide

<!-- says what the note becomes, and closes it -->

## outcome

<!-- what the note becomes -->

<!-- the form is choice -->

## says

<!-- why, in a line, or what the successor carries -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
