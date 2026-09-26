---
kind: [[guidance]]
scope: ["a reader of one retro chapter"]
rationale: [[spec/rationales/reading]]
---

# Actionables

1. Read your chapter's lines, the ones `chapters/<id>.json` names, and nothing past them. A reader past its chapter reports what another reader reports, and the count doubles. *
2. Run `./RUNME.sh retro read <retro> <chapter>` for the owner prompts, the faults and the commands. A parser each reader writes reads each chapter a different way. *
3. Answer the five starfish questions: start, stop, keep, more, less. A reading that skips one leaves that side of the work unjudged. *
4. Answer the five improvements: mechanize, guidance, process, code, tools. A finding with no home under one of them goes unbuilt. *
5. Write `findings/<id>.md` with one section per question and per improvement, and leave a section empty where nothing stands.
6. Name the evidence of every finding as a file and a line.
7. Point an improvement at the question it answers by its id, and a question at its improvement the same way. An improvement pointing at nothing answers no question anybody asks. *
8. Read every script a hand writes, and say whether the engine takes it or the guidance makes it needless. A script nobody reads gets written again next session. *
9. Run `./RUNME.sh retro matrix <retro>` once every column stands, and read the table it draws.

# Examples

| the rule | do | do not |
|---|---|---|
| 1 | the lines the chapter file names | a line from the chapter after |
