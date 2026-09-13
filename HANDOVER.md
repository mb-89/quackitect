---
kind: [[handover]]
status: held
urgency: soon
depends_on: [the-schema-projects-vale]
---

# Where it stands

The vocabulary layer stands, and `./RUNME.sh check` passes: 801 tests, two
projections reading as projected, and the rules green over the whole tree.

- The projection reads the word list the schema names and writes one rule.
- The rule refuses a word the list leaves out, and it names the swap where an
  entry carries one.
- A write to the list re-projects, so the next write reads the new rule.
- The list grows from 1647 entries to 2623, because the seed covers this tree
  by nothing like what the note claims.

| the piece | where |
|---|---|
| the projected rule | `spec/config/styles/VoiceParagraph/Vocabulary.yml` |
| the set and the swaps | `lib/vocabulary.js` |
| the script the rule runs | `vocabulary()` in `lib/paragraph.js` |
| the second read of the disk | `alsoReads()` in `lib/projection.js` |
| the flow mapping the list writes | `scalar()` and `listAt()` in `lib/schema.js` |
| the road out of a refusal | `grown()` in `lib/refuse.js` |
| the reload on a write | `ensureCage()` and the write door in `hooks/level0.js` |
| the shape of an entry | `spec/config/styles/VoiceShape/VocabularyEntry.yml` |
| the guidance line | rule 13 of `spec/guidance/voice.md` |

# What the measurement says

The corpus is this tree's own prose: 47 files and 59092 words under `spec`,
with `README.md` and `AGENTS.md` beside them. One rule runs twice over it. The
first run reads the seed as the branch point holds it, and the second reads the
seed as it stands now.

| the seed | findings | outside words | a thousand words |
|---|---|---|---|
| at the branch point, 1647 entries | 2367 | 963 | 40.1 |
| as it stands, 2623 entries | 0 | 0 | 0.0 |

The twenty the seed meets most:

| the word | fires | the word | fires |
|---|---|---|---|
| ticket | 135 | viewer | 17 |
| route | 44 | helper | 17 |
| evidence | 42 | phase | 15 |
| mint | 35 | ceiling | 15 |
| tickets | 30 | board | 14 |
| mints | 26 | newest | 14 |
| private | 26 | reply | 14 |
| register | 24 | pane | 14 |
| checker | 19 | children | 13 |
| delta | 18 | glob | 12 |

The brief asks for the number over the transcripts. This box carries one
transcript, its own, and the classifier refuses a read of it as a sensitive
source. So this tree's prose stands in, and the answers wait for a box holding
the uploads.

# What surprises this session

1. The seed covers this tree by nothing. `ticket` stands 135 times in tracked
   prose and stands nowhere on the list, and so do `private`, `register` and
   `vocabulary`. The note reads that the seed takes the tree's own prose, every
   word it uses twice or more. The 963 words say it reads one folder.
2. The brief's own proof breaks on the seed. It asks that `however` meet `but`,
   and `however` stands on the list as `from: tree`. Its three uses here read
   "however far", "however briefly" and "however many", which is the adverb,
   and the standard's swap reaches the conjunction alone. So an entry beats
   somebody else's `insteadOf`, and the swap proof rides `utilize`, which the
   brief names too. Sixteen words stand on both sides of that line, `under`,
   `over`, `main` and `people` among them. A swap winning there breaks prose
   this tree writes correctly today.
3. Vale reads whole code lines here, and no comment alone. `.vale.ini` says a
   grammar lifts the comments out. A keyword standing on a line of code answers
   the layer 10236 times across the code this tree holds. So the layer stands
   off code, the way five other layers already do.
4. A map of 1647 entries overruns the stack the script runs on. The rule
   carries one string of words instead, and reads the set at its start.
5. The write door reads an edit's fragment alone, so one numbered line landing
   in a guidance note reads as a note with no chapter. A whole file write
   passes where the edit refuses.
6. This note meets the layer eight times on its way in. Two words take a swap,
   and ten join the list. The loop works, and it costs a round.

# What waits

| the thing | what a session does |
|---|---|
| the retro reads what this session adds | `grep "from: session" spec/vocabulary/words.yml` lists them. Keep each as `from: owner`, or cut it |
| the 963 words this session adds read `from: tree` | read them once, because a word standing in one tracked file now stands everywhere |
| the funnel note carries the seed's claim | correct its chapter on the vocabulary, which says the seed holds every word the tree uses twice or more |
| the layer waits on code | turn it on where a grammar lifts the comments, and take the 10236 findings first |
| an `insteadOf` names a word the list admits | sixteen entries stand on both sides. Read each one, and say whether the sense here is the standard's |
| the answer register reads the prose set | `.vale.ini` carries no `*answer.md` line for the layer, so the gate reads the words a file reads |
| the stem reaches three forms | the plural, the past and the `-ing`. A comparative, a superlative and an adverb in `-ly` each want their own entry today |

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
