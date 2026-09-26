---
kind: [[guidance]]
scope: ["whoever runs the collect step of a retro"]
rationale: [[spec/rationales/collecting]]
---

# Actionables

1. Run `./RUNME.sh retro collect <retro>` after feedback, on a green battery with no warning and no other hold. A collect over a red battery reads faults the fix already answers. *
2. Read the input folder and nothing else. An input you go looking for is a fault in the verb, and reading it hides the fault. *
3. Read the count it prints for each source. A short answer reads like a whole one, and the count says which it is. *
4. Expect `.se` to hold dot folders and `.se/scripts` alone, and fix the writer of anything else standing there. A stray file there rides into every collect after it. *
5. Write a file a session throws away under `.se/.runtime`, and the log under `.se/.log`. A file written elsewhere survives the session and fouls the next collect. *
6. Name every refused line of the manifest, and move that file by hand before the next step.
7. Add `--again` where notes land after a collect, and the verb merges the new files into the same input. `.se/scripts` stays in place, and each pass copies what changes in it.

# Examples

| the rule | do | do not |
|---|---|---|
| 2 | the input folder alone | a source from outside it |
| 4 | the writer fixed where a stray file stands | the stray file moved by hand |
