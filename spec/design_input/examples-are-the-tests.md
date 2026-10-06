---
kind: [[design_input]]
---

# Scope

One artifact is tutorial, use case, user story, documentation and behavior test at once: an example. The owner takes the idea from two places, the owner's own library pylib and pyqtgraph, and wants it here. This note holds what the owner agrees to.

# Where the idea comes from

| source | what it does | what the owner takes |
|---|---|---|
| pylib, `src/pylib/doc/100_interactive_doc/*.ipynb` | the interactive docs are tutorials, and `pytest` runs every notebook with `--nbval-lax ./src/pylib/doc` | a broken tutorial is a red test |
| pylib, `uv run pylib` | opens the notebooks as a docs browser | one command opens the docs |
| pylib, its doc tree | numbers its chapters `000_specs`, `100_interactive_doc` and `900_dev` | chapters numbered by hundreds |
| pyqtgraph, `python -m pyqtgraph.examples` | opens the example explorer. It holds a tree of examples, the selected one's source beside it, a search, and a button running the example in its own process | the explorer |
| pyqtgraph, its test suite | runs every example | every example is a test |

The owner reads pylib at https://github.com/mb-89/pylib, and reads it alone.

# An example is the artifact

An example is a plain Markdown file, such as `spec/examples/<chapter>/<example>.md`, with chapters numbered as pylib numbers them.

- The front matter carries a title, keywords and the interface it shows.
- The body is prose between fenced shell blocks.
- Every step is a command-line call. The command line is the user's interface, so an example holds command-line calls alone, and reads easily.
- A step states the behavior it shows, and asserts it as behavior, and holds no golden copy of the whole output.

# Two places, one runner

| place | holds | shows in |
|---|---|---|
| user examples, the `1xx` chapters | the normal behavior a user does or wants to learn | the tutorial |
| developer cases, `9xx_dev` | edge cases and internal behavior a user leaves alone, each naming its edge | a developer section |

# What the suite holds

- the examples, holding every normal behavior
- the developer cases, holding the edges
- one contract test per door, against the real thing

Anything else asserting again what an example shows goes.

# One file runs two ways

| way | where it runs | against what |
|---|---|---|
| interactively | detached, in its own terminal and process, in a scratch clone so the user's tree stays as it stands, and the user watches it | the real system |
| in the tests | one Go harness runs every example's blocks over a fixture tree built once | every door faked: git, the clock, the process, the model |

# The Tutorial tab

The explorer works as pyqtgraph's does, as a Tutorial tab in the window, which registers its tabs from its catalog.

- A sidebar tree holds the example files by chapter.
- The main view shows the selected file's prose and commands.
- Title search shrinks the tree to the titles that match.
- Content search keeps every example whose text matches, and highlights the matches in the main view.
- Each example shows its last pass or fail from the check.
- A Run action starts the example detached against the real system.

# A notebook feel

The files stay plain Markdown, which reads on GitHub, in the VS Code preview and in the window. The VS Code extension Runme, at https://runme.dev, is unrelated to the run script. It opens such a file as a notebook with a Run button per shell block. Runme is the optional editor road.

The owner takes no Jupyter, no `.ipynb` and no `testscript`, whose prose is comments alone.

# The checks hold it

- Every verb, tab and door-facing feature has at least one example.
- A ticket's `done_when` names the example proving it.
- A developer case names its edge.
- The retro counts the features with no example, and the tests asserting again what an example shows.
