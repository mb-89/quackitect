---
kind: [[handover]]
status: held
urgency: now
---

# The bash door reads more

The write door guards two tools. `asWrite` in the hooks module answers on
`e.file_path`, so a Write and an Edit reach every rule. Everything else goes
straight by.

A heredoc goes by, and so do `sed -i`, `tee` and every redirection. A session
writing prose through `cat > spec/guidance/x.md` meets no rule, and the file
lands however it likes.

That is the largest hole in level zero today, and it is the first thing here.

# What the door already does

`tool.call` with the matcher `{ tool: "Bash" }` reads every command and refuses
a commit or a push landing on trunk. It parses the command line already, and
four more rules fit the parse it does.

# A shell writes nothing

Refuse a shell command writing a file the rules reach, and name the tool that
works instead.

| the door refuses | the door passes |
|---|---|
| `cat > spec/guidance/x.md`, and `>>` | anything under `.se/`, or a temp folder |
| `tee` into a path the rules cover | a pipe writing nothing |
| `sed -i`, `perl -i` | reading, searching, running |
| a heredoc into `python`, `node` or `sh` writing such a path | the same, writing nowhere the rules reach |

The last row is the hard one and the one that matters. A session reaches for a
heredoc because a formatter reflows a file between a read and an edit, and a
string replacement then fails silently. That is a real reason, so the refusal
says what to do instead: read the file again, then Edit.

Where a command's target stays unreadable, let it through. A guess refusing
honest work costs more than a hole this branch narrows.

# A commit message meets voice

Every prose rule in this tree reads a file. `git commit -m "..."` is prose no
rule reads, so the messages in this history pass by the writer's care alone.

Read the message and lint it the way the write door lints a file. Refuse a
breach, naming the rule.

Two forms carry a message a parse can read, and one does not:

| form | what to do |
|---|---|
| `-m "..."` | read it, lint it |
| `-F <file>` | read the file, lint it |
| neither | refuse: a commit through an editor is no thing an agent does |

Refusing the third closes the leak without asking anybody to type a new word.

# A branch name holds five

`work new` refuses a long name. `git checkout -b` and `git switch -c` do not,
and both reach the same tree.

`overLong` in `lib/names.js` already answers this. Call it from the same parse.

# A test run points somewhere

The tree owns testing. `./RUNME.sh check` runs the suite, the doors check and
`claude plugin validate`, and a bare `node --test` skips all three while
answering green.

| command | verdict |
|---|---|
| `node --test`, `npm test` | refused, naming `./RUNME.sh check` |
| `node --test test/level0/log.test.js` | allowed, one file |
| `node --test --test-name-pattern="the prune"` | allowed, one case |

A session can run a hundred single tests to dodge that. The log records every
one, so a retro sees it, which is cheaper than a rule guessing at intent.

# The description names verbs

`tool.describe` fires once per tool per session and rewrites what the model
reads. It is the carrot to the four sticks above.

Bash's description gains a line naming the tree's verbs: `./RUNME.sh check`,
`./RUNME.sh work`, `./RUNME.sh log`, `./RUNME.sh config`. A model reading that
first reaches for the verb before the raw command.

Two cautions from the type declaration:

- The engine caches a rendered description for the session, so an unstable
  answer spends the model's prompt cache on every call. Answer the same thing
  every time.
- `$.ui.invalidate("tool.describe")` clears that cache, and nothing here needs
  to.

# What every refusal owes

A refusal that only says no teaches nothing. Each of these names the rule, the
thing it refuses, and the road that works:

    A shell writes past every rule in this tree, so this write meets none.
    Read spec/guidance/voice.md with Read, then write it with Write.

The refusal shape already stands in `lib/refuse.js`. Use it.

# What to prove first

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. Each of the four refuses its case and passes the case beside it, under test
   against a fake.
3. A redirection into `.se/` passes, and one into `spec/` refuses.
4. A commit message breaking a voice rule refuses, and a clean one commits.
5. `git switch -c a-name-that-runs-past-the-cap` refuses.
6. Bash's description carries the verbs, and answers the same string twice.

# What your handback says

- Which shell forms you catch, and which you let through on purpose.
- Whether the heredoc refusal costs you a road you needed while working here.
- What the parse costs on a long command, in milliseconds.
- Any command the parse read wrongly, with the command.

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
