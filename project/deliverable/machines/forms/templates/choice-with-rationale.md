---
id: template-choice-with-rationale
statement: One choice from the form's options, with its rationale beside it.
editor: choice-rationale
---

# choice-with-rationale

The FORM supplies the options — its `options:` argument — and may name
`passing:`, the options that let the form stand met. The template stays
generic; the arguments make it concrete.

The editor is a dropdown with a one-line rationale beside it. Stored as
one line: `<option> — <rationale>`.

An option outside `passing` records honestly and BLOCKS the form from
counting as met — a fail is a fail until the fix lands and the choice
changes.
