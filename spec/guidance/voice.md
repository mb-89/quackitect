# The voice

The rules that shape what this project writes. Level zero holds them at the
write door, so a write that breaks one is refused with the reason.

The rules themselves live in `src/level0/lib/rules.mjs`, declared once. This
file says what each one is for. A rule and its reason are read by the write
door, the linter and the language server, so all three say the same thing.

## The rules a pattern holds

| rule | what it asks |
|---|---|
| `shouted-lead` | A paragraph opens as a sentence. A run of capitals in front of the prose shouts at a reader who has already agreed to read. |
| `antithesis` | Say what is. A second half saying what the thing is not costs a clause and teaches nothing. |
| `long-sentence` | A sentence holds 25 words, so a reader takes it in one pass. |
| `long-paragraph` | A paragraph holds six sentences. A table and a list are not paragraphs and are not counted. |
| `contraction` | Write both words. A contraction reads faster and translates worse. |
| `latin-abbreviation` | Write the English words. A Latin short form is one more thing to decode. |

## The rule a model holds

`passive` asks for the active voice and for the actor to be named. No pattern
separates a passive sentence from an active one, so this rule asks the model
through `$.model.classify`, which runs on the session's own client.

A classifier that answers nothing writes the text. That is how this project
treats any checker that cannot run. A check that is absent degrades the call
and lets it through.

## Exemptions

A rule that cannot be switched off is switched off everywhere. So a line may
carry an exemption, and the exemption names its reason:

    <!-- voice antithesis = NO: the phrase is the thing being quoted here -->

The marker covers its own line and the line under it. An exemption naming no
reason is refused the same as a breach. A rule switched off for no stated
reason is a rule nobody trusts.

## What is fixed and what is reported

A rule carrying a fix is applied by `./RUNME.sh fix`. Three carry one today:
`shouted-lead` sentence-cases the opening, `contraction` writes both words, and
`latin-abbreviation` writes the English.

Inside a run of capitals nothing tells an acronym from an ordinary word. So the
fix lowers every word after the first, and a person restores an acronym.

A rule with no fix is reported and left to a person.

## Where the rules do not reach

Fenced code carries none of these rules. A heading, a table, a list and a block
quote are not paragraphs, so the two counting rules skip them.

The write door reads Markdown and text. Code is outside it today.
