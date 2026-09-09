---
kind: [[handover]]
status: done
urgency: now
---

# The bash door reads more

Level zero reads a Bash command now. One parse in
`.claude/skills/level0/lib/bash.js` answers five rules, and
`spec/design_output/bash.md` says how each one works.

| rule | what it refuses |
|---|---|
| `ShellWritesNothing` | a shell command landing a file Vale or Biome reads |
| `CommitCarriesItsMessage` | `git commit` carrying no message a rule reads |
| a voice rule, over the message | a commit message breaking the same rules a file meets |
| `BranchNameHoldsFive` | `git checkout -b` or `git switch -c` past the word cap |
| `TestRunPointsSomewhere` | `node --test` or `npm test` naming no file |

`tool.describe` is the carrot beside those sticks. Bash's description gains one
paragraph naming `./RUNME.sh check`, `work`, `log` and `doctor`, and a contract
test holds every named verb against `src/scripts/cli.js`.

# What the door catches

A shell reaches a file through more roads than a redirection, and the parse
reads each one:

- `>` and `>>`, including `&>` and a glued `>path`
- `tee <path>`
- `sed -i` and `perl -i`, including `-i.bak` and a cluster such as `-pi`
- `cp` or `mv` whose source stands outside what the rules reach
- a heredoc into `sh`, which runs the shell parse again over the body
- a heredoc into `python`, `node`, `ruby`, `perl` or `php`, where a write call
  stands beside such a path
- an inline script behind `bash -c`, `sh -lc`, `node -e` or `python -c`
- any of those behind `xargs` or `find -exec`
- `git commit -F -` fed by a heredoc, whose body the parse holds already

# What it lets through

Each of these passes on purpose, and each one buys the refusals their honesty:

| the door passes | why |
|---|---|
| anything under `.se/`, `.git/`, `node_modules/`, `/tmp/`, `/var/tmp/`, `/dev/` | no rule reads a file there |
| a temp variable such as `$TMPDIR/x.md` | the same |
| `mv spec/guidance/a.md spec/guidance/b.md` | a door reads both ends already |
| `git commit --amend --no-edit`, `--fixup`, `--squash`, `-C` | the message stands already |
| `git commit -F -` fed by a pipe | the door reads no stdin |
| `node --test <file>`, `--test-name-pattern`, `--test-only` | the run points somewhere |
| `git branch <name>` | the door reads two forms, and this is a third |
| a redirection whose target reads as a variable or a glob | a guess costs more than the hole |

# What the parse reads wrongly

One command lands a tracked file and the door passes it:

    find . -name '*.md' -exec sed -i 's/a/b/' {} +

The parse reads the inner `sed -i`, and its target reads as `{}`. The enclosing
`find` holds the real one, and reading it means running the search. So the door
passes, the way it passes every target it cannot read.

`.se/scripts/edges.js` holds that case beside 21 others, and prints a `WRONG`
line for any answer that misses. Run it after you touch the parse.

# What the parse costs

| command | length | per parse |
|---|---|---|
| a real one from this session | 111 chars | 0.09 ms |
| twenty of them in one chain, four times over | 4704 chars | 1.2 ms |

`.se/scripts/probe.js` measures that, and runs 20 real commands from this
session through the rules. None of them meets a refusal.

# What the heredoc refusal costs

It costs one I use twice in this very session:

1. `cat >> test/level0/hooks.test.js <<'EOF'` appends a block of cases.
2. `python3 - <<'PY'` rewrites three paragraphs of `spec/design_output/bash.md`
   in one pass.

Both land a tracked file, and the new rule refuses both. The road it names is
Read and then Edit, which costs two calls where one does. That is the price the
brief asks for, so it stands, and the refusal names the road out loud.

# What surprises me

- `claude plugin validate` reads an event name it knows nothing about and
  passes. A probe registering `nonsense.event` validates green, so a typo in an
  event name costs a silent hook and no error at all.
- The client on this box carries 2.1.42, whose engine names no `tool.describe`
  at all. So the describe hook stands on the type declaration alone, and
  `spec/design_output/bash#what-stands-unproven` says so.
- A voice rule reads a commit message cleanly. The messages on this branch pass
  Vale under the path `level0-commit.md`, footer lines and all.

# What is next

- `git branch <name>` cuts a branch the door reads none of.
- A `find -exec` target reads as `{}`, and a rule reading `-name` closes it.
- The door lints a commit message through Vale on every commit, which costs one
  subprocess. Where that shows in a session, cache the answer per message.
- `spec/guidance` names no rule about a shell write, because the door holds it.
  A note saying so helps a session that meets the refusal cold.

## How this branch ends

1. Run `./RUNME.sh work sync` first, which takes main in.
2. Commit and push each time a thing lands.
3. Write the result and the retro back into `HANDOVER.md`.
4. Run `./RUNME.sh work done`.
5. Run `./RUNME.sh work release` on stopping early.
6. Leave the merge to a person.
