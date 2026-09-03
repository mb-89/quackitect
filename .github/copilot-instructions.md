<!-- GENERATED. Edit the source named below, not this file. Source: doc/guidance/driving-the-engine.md, doc/guidance/voice.md, doc/guidance/work-token.md -->

# Driving the engine

## Actionables

1. Follow and trust the process. Take the step in hand rather than arguing with it. *
2. Disagree and commit. If in doubt, mint a note about your concern and continue. *
3. On errors, the engine provides remedies. Incorporate them in your way of working.
4. Stop only with a reason named to the engine. On an interrupt, claim `asked`. *
5. Do not kill yourself because you are afraid of dying. Test to find defects, not to feel covered. *
6. Answer prompts before anything else with `se --answer "..."`. Copy the prompt verbatim. *
7. Use the tool the engine gives you. *
8. Change files with `se_apply`, naming the token on every write. *
9. Run every shell command with `se_run`, naming the token. It could write. *
10. A helper script goes in `.se/scratchpad/`. A standing check goes in `util/checks/`. *
11. Spend your thinking where a mistake is dear to undo. Where it is cheap, decide and move. *
12. Compared two things thrice and still cannot pick? Either will do, or the answer is a third thing. *

# Voice

## Actionables

1. One sentence, one idea. At most 25 words, preferably shorter. End lines on sentence ends. Avoid endlines within sentences.
2. One paragraph, one idea. At most 6 sentences. One newline between paragraphs.
3. Three or more parallel things are a list, each with its status, in a chat answer as in a file. *
4. BLUF: bottom line upfront, progressive disclosure: details come later, at the discretion of the reader.
5. Active voice. Name who acts. Present tense for everything except discussions. Past tense is allowed there.
6. Stakeholder-specific communication: do not leak internals, write what is relevant to the audience. For details, see [[doc/guidance/stakeholders]].
7. Use the same word for the same thing every time. For details, see [[doc/glossary]].
8. In general, with few exceptions: say what is. Do not say what is not, the list is endless. *
9. State a fact only if you own it. Otherwise name where it lives, via "For details, see [[link]]". *
10. Mark an estimate as an estimate. Say "I do not know" when you do not know.
11. Follow the technical English rules. For details, see [[doc/guidance/ASD-STE-100]].
12. DRY: do not repeat yourself. SPOT: single point of truth for every datum.
13. Private data: names, datetimes and unfiltered notes. They do not go into git.
14. Do not put history in the current surface. It goes into git commit messages.
15. A number about the tree is the command that answers it, never the answer. *

# Work token

## Actionables

### Writing one

1. Write the problem in detail, and the answer in proposed action. *
2. Reduce to the smallest case that still shows the problem. Cut what a reader does not need.
3. Write acceptance criteria first. A criterion is decidable, and somebody answers it yes or no. *
4. Where a command decides a criterion, write the command. Otherwise name who looks at what.
5. A criterion is not a plan, and not the problem restated.
6. Ask whether a criterion is about this change or about the project. Pin a one-time one. *
7. One token, one piece of work. A done-when needing "and" is usually two tokens.
8. Before a feature, name the basics it stands on. Mint the missing one first. *

### Using one

9. Do what the token asks and nothing next to it. If the ask is ambiguous, ask one question and wait.
10. Write the check before the work. Watch it go red for the reason you expect.
11. A check that will not go red is the finding. Write it down and stop.
12. Put both halves of a mechanism in the evidence. "Nothing yet, owed by X" is an answer.
13. Report work as done only with the evidence that it is. The change itself is `git diff began..ended`, never a list of files. *
14. A checklist carries institutional knowledge. Answer each line rather than ticking it. *
