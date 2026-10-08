---
kind: [[design_output]]
refines:
  - [[spec/design_input/examples-are-the-tests]]
---

# Scope

An example is one Markdown file that is a tutorial, a use case, a piece of documentation and a behavior test at once. This note covers its format, the places it stands, the runner and the ways to run it. It covers the Tutorial tab, and the checks holding all of it. It says how examples meet the doors, the fixtures and the test ratio. For the owner's words, see [[spec/design_input/examples-are-the-tests]].

# The format

An example is a file `spec/examples/<chapter>/<example>.md`. A chapter folder
is a number, an underscore and a name, such as `110_tickets`, so the tree sorts
the way it reads. The front matter of an example reads so:

```yaml
kind: [[example]]
title: A pull hands out the next leaf
keywords: [ticket, pull, leaf]
interface: [ticket pull]
```

Under it, a line of prose says the behavior, such as a box pulls and the engine
hands it the first leaf of its group. The block under that line shows it:

```sh
./RUNME.sh ticket pull
# expect: exit 0
# expect: says "leaf 1 of"
```

| part | holds |
|---|---|
| `title` | the behavior the example shows, as a claim |
| `keywords` | the words a title search and a content search meet |
| `interface` | each verb or door-facing feature the example shows by the name the action catalog gives it, and each tab by the word `./RUNME.sh tui` takes |
| `edge` | the edge a developer case shows, and only there |
| the prose | the behavior each step shows, stated before its block |
| a shell block | `./RUNME.sh` calls alone, one a line |
| an `# expect:` line | the behavior the call before it asserts |

The assertion stands inside the block as a shell comment. So GitHub shows it,
Runme runs the block past it, and the prose and the assertion sit side by side.

| an `# expect:` form | holds where |
|---|---|
| `exit <code>` | the call exits with that code |
| `says "<phrase>"` | the output carries the phrase |
| `quiet "<phrase>"` | the output carries no such phrase |
| `stands <path>` | the file stands after the call |
| `field <ticket> <name> <value>` | the ticket's field holds the value |

An example asserts behavior, phrase by phrase, and holds no golden copy of the
whole output. A form
outside the table refuses at the schema, so a new form lands here first.

A schema governs `spec/examples/**`, and the prose rules read every example as
they read a note. For the schema, see [[spec/tickets/example-schema-reads-steps]].

# The places

| place | chapters | holds | shows in |
|---|---|---|---|
| user examples | `1xx_<name>` | the normal behavior a user does or wants to learn | the tutorial |
| developer cases | `9xx_dev_<name>` | an edge or an internal behavior a user leaves alone | the developer section |

Both take the same format and the same runner. The schema asks a developer case
for its `edge`, and refuses it on a user example. A behavior shows once: as a
user example where a user does it, else as a developer case.

# The suite

The behavior suite is these parts, and nothing else:

| part | holds | runs against |
|---|---|---|
| the user examples | every normal behavior | the fakes |
| the developer cases | every edge | the fakes |
| the contract tests | each door, once | the real thing |

The contract tests stand as
[[spec/design_output/doors#one-contract-test-per-door]] and
[[spec/design_output/model#the-fake-keeps-a-contract]] say. A fake answering
its contract suite is what makes a pass over it worth reading.

A unit test stays where it pins a pure function an example reaches too coarsely
to name. A test asserting again what an example shows goes. For the rule, see
[[spec/guidance/code/testing]].

# One runner, two drivers

One parser reads an example into its steps: the prose, the calls and the expect
lines. A driver runs the steps.

| driver | started by | where it runs | its doors |
|---|---|---|---|
| interactive | the Run action, or `./RUNME.sh example run <path>` | a scratch clone of the tree, in a process and a terminal of its own | the real ones |
| the tests | the check, through one Go harness | a fixture tree on the fake disk | every door faked: git, the clock, the process, the model |

The interactive driver clones the tree with `git clone --local` into
`.se/.runtime/examples/<name>`, and runs there, so the user's tree stays as it
stands. It prints each step's prose, its call and the output. It prints the
verdict of each expect line, and keeps the clone for the user to read. The next run of the same
example clears the clone first.

The harness builds the fixture tree once, in the `TestMain` of its package, on
the fake disk [[spec/design_output/model#io-modules-and-their-fakes]] names.
Each example runs over its own copy of
that tree, so every example runs beside every other. The harness dispatches each
`./RUNME.sh` line in process, through the action catalog the command line
reaches. A line naming anything past `./RUNME.sh` refuses at the schema, so
every call stands fakeable.

The harness writes each example's verdict to `.se/.runtime/examples.json`, and
the Tutorial tab reads it there.

# The Tutorial tab

The window registers a `tutorial` tab, beside `log` and `work`. It reads the
examples off a name the index provides, each with its chapter, title, keywords,
interface and last verdict.

| part | what it does |
|---|---|
| the tree on the left | the example files by chapter: the user chapters, then a developer section holding the `9xx_dev` chapters |
| the main view on the right | the selected file's prose and calls, drawn as Markdown |
| a mark per row | the example's last pass or fail from the check, or a blank mark before its first run |
| F5 | starts the selected example detached against the real system, as the interactive driver does |
| the filter pane | the search, under the key the window gives the filter |

F5 runs here as it does in the `cli` tab, so the same key makes the same kind of
call. For the frame, see [[spec/design_output/tui]].

# The search

The search takes one mode at a time, and a key in the filter pane turns it over.

| mode | the tree keeps | the main view |
|---|---|---|
| title | each example whose title matches | draws as it stands |
| content | each example whose title, keywords or body matches | highlights every match |

The tree keeps the chapters holding a kept example, and drops the rest. Clearing
the search brings the whole tree back, with the selection held.

# The editor road

The files stay plain Markdown, so they read on GitHub, in the VS Code preview
and in the Tutorial tab. Runme, the VS Code extension at https://runme.dev,
opens such a file as a notebook with a Run button per shell block. That runs the
same file cell by cell against the real tree, and it is the optional editor
road. The tree builds nothing for it.

The tree holds no Jupyter, no `.ipynb` and no `testscript` file.

# The checks

| what the check holds | where it lands |
|---|---|
| every verb, tab and door-facing feature names an example under `interface` | `./RUNME.sh check`, reading the action catalog and the tab registry |
| a `done_when` line of a ticket on the standard route names the example proving it | the mint and the check |
| a developer case names its edge | the example schema |
| every example passes | the harness, inside the check |
| features with no example, and tests asserting again what an example shows | the retro's audit counts both |

Each check lands in report mode first, and turns to refuse once the tree meets
it. For the audit, see [[spec/guidance/retro/audit]].

# Doors, fixtures and the ratio

| thing | how an example meets it |
|---|---|
| a door | the harness runs over the door's fake, and the door's one contract test holds the fake to the real thing |
| the model | runs as a process the fake process table answers, so no test reaches a model |
| a fixture | the tree the harness builds once in its `TestMain`, which no example writes to |
| the test ratio | an example is a spec file and counts as no test line, while the harness counts as test code of its package. A test leaving for an example lowers the ratio |

The code-is-pure group owns the measure of the ratio, which counts test lines
against code lines per module.
