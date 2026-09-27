---
kind: [[ticket]]
state: closed
todo: false
step: decide
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
process: [[spec/processes/note]]
process_hash: e02a0935ed78eb92
record:
  - step: decide
    hand: box d7a4248a337e5a · claude-code
    hash_before: 863bbc8406c2826e1a54ae02c4edb35733ee9507
    hash_after: 863bbc8406c2826e1a54ae02c4edb35733ee9507
    inputs:
      - name: ask
        hash: 5e0a28906d846b28
        size: 709
    def: 9e2520e6318baf46
reason: done
---

# Ask

<!-- line, as text: the smallest case that shows it, why it matters, and what a stranger needs in order to act on it -->

The judge reads its switch off the tracked file alone. `/se-config-judge-enabled-false` writes `.se/.runtime/config.json`, and the judge runs on.

| what | where |
|---|---|
| the smallest case | `judge.enabled` true in `spec/config/level0.json`, false in `.se/.runtime/config.json`, and a hand-back runs the judge |
| why it matters | the owner turns the judge off, and every hand-back still waits on the model |
| where a stranger acts | `judged` in `.claude/skills/level0/hooks/pull-tool.js`, and `configOf` in `.claude/skills/level0/lib/config.js` |

The fix lands with this note: `judged` asks `configOf` over `$.fs`, the method root's tracked file first. The case stands in `test/level0/level1.test.js`.

# decide

<!-- says what the note becomes, and closes it -->

## outcome

<!-- what the note becomes -->
<!-- the form is choice -->

done

## says

<!-- why, in a line, or what the successor carries -->
<!-- the form is text -->

The fix landed, and the-judge-leaves-the-code then took the judge and its switch out of pull-tool.js and the config, so no reader of that switch stands.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
