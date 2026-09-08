# Handover

Read this, then `./RUNME.sh` and `./RUNME.sh standing`.

## What holds today

| part | where | state |
|---|---|---|
| the module | `src/level0/hooks/level0.mjs` | holds the doors, and no rule |
| mechanical rules | `spec/config/styles/VoiceQuackitect` | Vale, eight files |
| structure rule | `src/level0/lib/shape.mjs` | counts paragraph runs |
| model judge | `src/level0/lib/judge.mjs` | one question per span |
| switches | `spec/config/level0.json` | judge on or off |
| rules needing judgement | `spec/guidance` | one chapter, `Actionables` |
| the argument | `spec/rationales` | the one place taking the past tense |
| install | `src/scripts/install.{sh,ps1}` | one row per dependency |
| the verbs | `src/scripts/cli.mjs` | `check lint fix test rules standing doctor` |

## What each door does

| door | fires | can it refuse |
|---|---|---|
| `session.start` | once, before turn one | installs Vale, reads config and guidance |
| `tool.call` | every Write and Edit | yes: Vale, then structure, then the judge |
| `prompt.section` | once per section, on a matcher for `output_style` | no: it appends the standing layer |
| `prompt.context` | once per conversation | no: it asks for the receipt |
| `turn.complete` | end of every turn | no: it draws a note under a prose-heavy answer |

## Do this next

1. Wire the language server, so a rule reaches the editor's problems panel.
2. Give a Vale rule an `Action`, so `./RUNME.sh fix` changes something.
3. Check whether a subagent gets the standing layer, and say so here.
4. Add the judged rules a person wants beyond `Actionable`, in the config.
5. Decide whether the judge carries what it learns into the next session.

## Rules to hold, which this session keeps losing

1. Write no count a command answers. `./RUNME.sh rules` and `standing` answer them.
2. Put the argument, the history and the measurement in `spec/rationales`, and nothing else there.
3. Reach for a table or a list first. Prose is the fallback.
4. Never overwrite a file the owner edits. Read it, then `Edit` one hunk.

## Facts worth keeping

- `e.content` carries a tool's text. `e.input` holds nothing, and reading it fails quietly.
- `$` takes no computed access. `claude plugin validate src/level0` refuses one.
- `claude --init-only` fires no `session.start`, so a probe costs one `-p` turn.
- `prompt.section` fires for every section, so a hook without a matcher writes into all of them.
- A hooks module imports a sibling, so `lib` stays one copy for every caller.
- `${CLAUDE_PROJECT_DIR}` resolves in the marketplace path, so one tracked cage travels.
