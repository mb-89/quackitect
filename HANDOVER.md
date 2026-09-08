---
kind: [[handover]]
status: held
---

# The fixer earns its name

`./RUNME.sh fix` runs Vale and Biome. Biome rewrites what it can. Vale changes
nothing, because no rule in `spec/config/styles/VoiceVale` carries an `Action`.

So a person meeting a breach fixes by hand what a program could fix for them.

## What is already settled

Vale rules take an `action` block, and `vale fix --apply` runs it. The rules
that carry a fix a program can make:

| rule | the fix |
|---|---|
| `ShoutedLead` | sentence-case the opening run of capitals |
| `Contraction` | write both words |
| `LatinAbbreviation` | write the English words |

`Antithesis`, `Passive`, `PastTense`, `LongSentence`, `LongParagraph` and
`PreferStructure` need a person, so they stay reported.

## Do this

1. Give each of the three rules an `action` Vale can apply, and say in the file
   which one you chose.
2. Prove each on a fixture: run `./RUNME.sh fix` over it and read the file after.
3. Prove a second run changes nothing, so the fixer settles.
4. Prove the fixer leaves fenced code alone, and leaves an exemption marker alone.
5. Add a test under `src/level0/test/` for each of the three.
6. Say on this handover what Vale refuses to fix and why, because the next
   session needs that answer more than the code.

## What holds

- `./RUNME.sh check` stays green
- `./RUNME.sh fix` over a fixture with all three breaches leaves none
- running it twice leaves the file byte for byte the same
- a fenced block keeps every breach it carries

## Where to look

- `spec/config/styles/VoiceVale/` holds one file per rule
- `src/scripts/cli.js` has the `fix` verb, which calls Vale and then Biome
- `spec/guidance/voice.md` says what each rule asks for
- Vale documents actions at https://docs.vale.sh/styles

## When you finish

1. Replace this brief with your result, keeping the frontmatter.
2. Write a retro under `## Retro`: what surprises you, and every dead end you
   walk into. The next session pays for a repeat.
3. Run `./RUNME.sh work done`, which sets the status and pushes.

## How this branch ends

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps put it back.

1. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
2. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
3. Run `./RUNME.sh work done`, which sets the status and pushes.
4. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
5. Leave the merge to a person. A cloud box opens no pull request.
