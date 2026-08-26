---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-put-the-way-in-where-the-host-already-renders-it
type: "[[option]]"
statement: Put the first instruction in a file some host already surfaces on its own, so a newcomer is shown the way in rather than having to know where to look.
cluster: the-bootstrap
question: how a newcomer is shown the one thing to run
found_by: prior-art
source: GitHub content/repositories/.../about-readmes.md — a README in the root, the .github directory or docs is recognised and automatically surfaced to repository visitors; VS Code blogs/2022/03/08/the-tutorial-problem.md — a devcontainer file makes the editor prompt on open
---

## Mechanism

A HOST THAT ALREADY SCANS FOR A FILENAME WILL SHOW IT WITHOUT BEING ASKED.
Nothing of ours runs. The instruction is discovered because somebody else's
product already looks for that name.

TWO SURFACES, TWO DIFFERENT FILES, and this is the part that decides whether
the option works. The code-hosting site renders a root readme to a visitor.
The editor prompts on a dev-container file, recommends on a workspace
recommendations file, and can run a task on folder open. No single file
covers both surfaces, so this option is really a pair.

WHAT IT COSTS HERE. It buys discoverability by adopting somebody else's
convention, which means the mechanism moves when they move it. The editor
gates the strongest form twice, by a setting and by workspace trust, so it
cannot be relied on alone.

WHAT IT BUYS HERE. It is the only family of answers that actually SHOWS a
person something. The alternative this project resembles today, a
conventionally-named script at the root, surfaces nothing at all: the
convention's own documentation says it works because contributors already
know the pattern, which is a fact about the reader rather than the folder.

WHY IT MATTERS MORE AFTER THE COLLAPSE. The launcher used to sit above the
folder a person opened. It now sits inside it, alphabetised among the rest,
and a fresh checkout opened in an editor shows a list of folders and no
instruction.
