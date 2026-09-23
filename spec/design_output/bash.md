---
kind: [[design_output]]
---

# Scope

`.claude/skills/level0/lib/bash.js` reads every command the agent runs. This
note covers the parse it makes and the rules standing on that parse. The
delta a commit carries stands in [[spec/design_output/private]].

# What the door reads

`tool.call` with the matcher `{ tool: "Bash" }` hands the whole command line
over. One parse splits it, and the rules below read that one parse.

| the parse answers | the rule it feeds |
|---|---|
| every path a segment writes | a shell writes nothing |
| the message a commit carries | a commit message meets voice |
| the name a checkout cuts | a branch name meets the cap |
| a test run naming no file | a test run points somewhere |
| a commit stepping past the hook | the escape, in [[spec/design_output/private]] |

The parse reads quotes, backslashes, operators and heredoc bodies. A word
inside quotes carries no operator, so `git commit -m "a > b"` writes nothing.

Where a target stays unreadable, the door passes it. A guess refusing honest
work costs more than the hole this leaves.

## The parse, step by step

1. Lift each heredoc body out, keyed by its word, and leave `<<WORD` standing.
2. Walk the text once, taking a quoted run whole and an operator as its own
   token.
3. Cut the tokens into segments at an operator and at a newline.
4. Read each segment as a command name, its words, and its redirections.

A segment carries its own verdict, so a chain refuses on the one command that
breaks a rule and names it.

# A shell writes nothing

A shell reaches every file a Write reaches, and no rule reads it. So the door
refuses a shell command landing a file the rules cover.

| the door refuses | the door passes |
|---|---|
| `cat > spec/guidance/x.md`, and `>>` | anything under `.se/`, `.git/` or a temp folder |
| `tee` into a path the rules cover | a pipe writing nothing |
| `sed -i`, `perl -i` | reading, searching, running |
| `cp` or `mv` from outside the rules into them | a rename inside the rules, where a door reads both ends |
| a heredoc into a shell or a reader, writing such a path | the same, writing nowhere the rules reach |
| `bash -c` or `node -e` writing such a path | the same, writing nowhere the rules reach |
| the same, behind `xargs` or `find -exec` | a target the parse reads as `{}` |
| a runner or a shell taking a script under `.se/` or a temp folder, writing such a path | the same script, writing nowhere the rules reach |

The rules cover what Vale and Biome read: `.md`, `.markdown`, `.txt`, and the
JavaScript and JSON that `CODE` names. A path under `.se/`, `.git/`,
`node_modules/`, `/tmp/`, `/var/tmp/`, `/dev/` or a temp variable stays free.

So `cp` and `mv` refuse where a source stands outside what the rules reach:

- a source outside them carries content no door reads
- a source inside them carries content a door reads already

`xargs` and `find -exec` carry a command inside a command, and the parse reads
the inner one under the same rules. A target the parse reads as `{}` names no
path, so it passes. The outer `find` holds the real target, and a guess at
it refuses honest work.

A heredoc into `sh` runs the shell parse again over the body, and a heredoc
into an interpreter takes the readings below. An inline script behind `-c` or
`-e` meets the same two.

| the body holds | the door reads |
|---|---|
| a write call beside a path the rules cover | that path, from that line |
| a write call with no path beside it | every path the whole body names that the rules cover |
| a read of such a path and no write call | nothing |
| a write call beside a path outside the rules | nothing |

The write calls are `open(..., "w")`, `writeFileSync(...)`, `write_text(...)`
and their kind. The second row is the script that names its path on one line
and writes on another, through a variable.

That last row is the one that matters. A session reaches for a heredoc because
a formatter reflows a file between a read and an edit, and a string replacement
then fails silently. So the refusal names the road: read the file again, then
change it with Edit.

# A target behind a variable

A redirection lands where its variable points, so the door reads the value the
command gives the name. A segment of assignments alone, bare or behind
`export`, sets each value, and a later segment reads it.

| the command | the door reads |
|---|---|
| `f=README.md; echo x > $f` | `README.md`, which it refuses |
| `out=/tmp; echo x > $out/y.md` | `/tmp/y.md`, which stays free |
| `echo x > $f` | a name with no value, which it refuses |
| `echo x > $TMPDIR/msg.md` | a temp variable, which stays free |

The free paths read first, so a temp variable stays free with no value. A
target still holding a name past that refuses, because the door cannot say
where it lands. The door resolves a redirection's target, and `tee`, `cp` and
`mv` read their words as written.

# A commit message meets voice

Every other prose rule in this tree reads a file. `git commit -m "..."` is
prose no rule reads, so the door lints the message the way it lints a file.

| form | what the door does |
|---|---|
| `-m "..."`, and `-m` twice | read it, lint it through Vale |
| `-F <file>` | read the file, lint it |
| `-F -`, fed by a heredoc | lint the heredoc body, which the parse holds already |
| `-F -`, fed by a pipe | pass it, because the door reads no stdin |
| `--no-edit`, `--fixup`, `--squash`, `-C` | pass it, because the message stands already |
| none of those | refuse, because a commit through an editor is no thing an agent does |

Vale reads the message under the path `level0-commit.md`, so the same rules
reach it that reach any other markdown in this tree. A breach comes back
naming the rule, the line and the phrase.

`withoutTrailers` reads the message's last paragraph before Vale does:

| the last paragraph | what the door does |
|---|---|
| every line reads `Token: value` | takes it off, because git owns that shape and the harness writes it |
| anything else | lints it with the rest |

`git commit --amend` on its own opens an editor, so it meets the last row.
`git commit --amend --no-edit` carries its message forward and passes.

The same parse answers whether the commit steps past the pre-commit hook, and
`skipsTheHook` reads `--no-verify` and every form `-n` takes.
[[spec/design_output/private#the-escape]] says which box refuses it.

# A branch meets the cap

The mint refuses a long name, and `git checkout -b` reaches the same tree.
`overLong` in `lib/names.js` counts the words, and the door calls it on:

- `git checkout -b <name>`, and `-B`
- `git switch -c <name>`, `-C`, and `--create`

`git branch <name>` cuts a branch too, and the door reads none of it today.
The refusal names `./RUNME.sh branch open <group>`, which pushes the branch its
group names.

# A test run points somewhere

`./RUNME.sh check` runs the suite, the doors check and `claude plugin
validate`. A bare `node --test` skips the last two and answers green.

| command | verdict |
|---|---|
| `node --test`, `npm test`, `npm run test` | refused, naming `./RUNME.sh check` |
| `node --test test/level0/log.test.js` | allowed, one file |
| `node --test --test-name-pattern="the prune"` | allowed, one case |
| `npm run lint` | allowed, another script |

A session runs a hundred single tests to dodge that. The log records every one,
so a retro sees it, which costs less than a rule guessing at intent.

# A git add stays out

`.se` holds the private half, and git ignores it. `addsIn` reads a command and
answers every path under `.se` a `git add` names, with `-f` or without.

    git add -f .se/notes/one.md

`PrivateStaysHome` is the finding, and the refusal names the folder and the
road back. For details, see [[spec/design_output/private#the-second-door]].

# A landing follows its gate

A landing waits on the command before it. `LandingFollowsItsGate` in
`lib/bash.js` refuses a landing whose gate runs it whatever the gate answers.

| the landing | what it lands |
|---|---|
| `ticket pull`, with a name or bare | a hand-back or a take |
| `ticket open` | the open's commit |
| `git commit` and the commit verb | a commit |

| the operator before it | the door |
|---|---|
| `&&` | passes, because the landing runs on a green gate alone |
| `;` and a newline | refuses |
| a double bar, and a lone `&` | refuses |

The rule reads the command with its heredocs taken out, so a body's newline
reads as no gate.

# The description names verbs

`tool.describe` rewrites what the model reads before it reaches for a tool. It
is the carrot to the sticks above.

Bash's description gains a paragraph naming the tree's verbs, and `VERBS` in
`lib/bash.js` holds the list. A contract test reads `src/scripts/cli.js` and
asserts every named verb stands there. So the carrot points at a road that
runs.

The engine caches a rendered description for the session, so `verbLine()` takes
no argument and answers one constant string.

# What stands unproven

The claims below rest on the type declaration alone, so read them again before
you trust them:

| the claim | why it stands unproven |
|---|---|
| `tool.describe` fires once per tool and rewrites the description | the client on this box carries 2.1.42, whose engine names no such event |
| the engine caches the rendered description | the same |

`claude plugin validate` reads an event name it knows nothing about and passes.
A probe registering `nonsense.event` checks green, so a typo in an event
name costs a silent hook and no error.

# What every refusal owes

A refusal that only says no teaches nothing. `refusedCommand` in
`lib/refuse.js` writes each one, and every finding names what stands below:

- the rule, by the name a person greps for
- what the door reads, as the path, the name or the command
- the road that works, as a tool or a verb

The findings carry the shape every other door answers in. So the log line, the
command line and the refusal all read one kind of row.
