---
kind: [[handover]]
status: todo
urgency: soon
depends_on: [the-schema-projects-vale]
---

# Where it stands

The funnel note `spec/funnel/a-paragraph-has-a-schema.md` names six branches,
and this is the third. Read its chapter on the vocabulary first. The note
stands on the branch `claude/friendly-brown-k6kohy` until the owner merges it,
so take that branch in where `work sync` leaves the note absent.

`spec/vocabulary/words.yml` holds the seed, one entry a line: the words OpenSTE
admits, the words this tree's own prose uses twice or more, and the pronouns.
Some entries carry `insteadOf`, the words the standard tells a writer to swap.
Against that seed, the answers in the transcripts stand ten percent outside.
Most of that is contractions and past-tense forms the grammar layer refuses
already.

The projector from the second branch writes the enumerable layers into
`spec/config/styles/VoiceParagraph`, and the vocabulary layer waits for this
one.

# What waits

| the piece | where | proves it |
|---|---|---|
| the projected rule | `VoiceParagraph/Vocabulary.yml` | a paragraph with one outside word meets a refusal naming it |
| the refusal naming the swap | `lib/refuse.js` | a paragraph with `however` meets `but` in the refusal |
| the entry shape | `spec/config/styles/VoiceShape/VocabularyEntry.yml` | an entry with `from: session` and no meaning refuses |
| the reload on a write to the list | `hooks/level0.js`, and `ensureCage` | a fake session writes an entry, and the next write under it passes |
| the guidance line | `spec/guidance/voice.md` | the note stays under its cap |

# What the rule reads

The projection inlines every `word` of `words.yml` into one Tengo script rule
over the raw scope. The rule walks the words of the prose and refuses each word
outside the set. The plural, the past form and the `-ing` form of a listed word
stand inside the set. The rule passes over:

- a fence and a code span
- a link, `[[name]]` or `[text](target)`
- a path, any token carrying a slash or a dot inside it
- a word opening with a capital past the first word of a sentence
- a digit, and a token carrying one

Where the refused word stands in some entry's `insteadOf`, the message names
that entry's word. So a refusal over `however` reads `but`, and a refusal over
`utilize` reads `use`.

# How the list grows

A session meeting a refusal adds the missing word to `words.yml`, one line,
with `from: session` and a `meaning` of one short phrase. Where it knows a
better word, it puts the refused one under that word's `insteadOf`, and adds
no entry. Then it writes the paragraph again.

`VocabularyEntry.yml` holds the shape: `word` and `from` on every entry, and
`meaning` where `from` reads `session`. The retro reads every `from: session`
entry, keeps it as `from: owner` or cuts it.

The projection runs at session start today. A word the session adds has to
hold in the same session. So the cage re-projects the vocabulary rule when a
write lands on `words.yml`, and the next write reads the new rule.

# How to build it

Test the rule through the fake disk with a fixture list of ten words. Test the
refusal wording with one swap. Test the reload with a fake session: an entry
lands, and the paragraph the door refused now passes. Run `./RUNME.sh voice
measure` over the transcripts before and after, and write both numbers into the
handback, with the top twenty outside words the rule still meets.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
