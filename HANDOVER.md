---
kind: [[handover]]
status: done
urgency: now
---

# One resolver answers every key

`.claude/skills/level0/lib/config.js` holds the three layers, and every reader
asks it. For details, see [[spec/design_output/config#the-three-layers]].

| what moves | from | to |
|---|---|---|
| the tracked file | two readers holding a copy each | `configOf` |
| `WORDS = 5` | `lib/names.js` | `names.words`, and the caller hands it in |
| the `mostInARow` default | `lib/stop.js` | `stop.mostInARow`, at each turn end |
| the `DEFAULTS` block | `lib/judge.js` | the `judge` keys, at each write |
| the type of each key | two contract cases | `spec/config/level0.schema.json` |

New surfaces:

- `./RUNME.sh config` prints every key, its value, and the layer answering it.
- `./RUNME.sh config <key> <value>` writes `.se/config.json`, coercing to the
  schema's type and making `.se` where that folder stands missing.
- A session start writes one `warn` line per schema fault, door `config`.

# What the proofs say

| what the brief asks | where it stands |
|---|---|
| `./RUNME.sh check` passes, and validates the plugin | 230 tests, and `√ Validation passed` |
| each layer beats the one under it | `test/level0/config.test.js`, over a fake disk |
| a write reaches the next ask | that file, and `test/level0/hooks.test.js` |
| an unreadable per-box file leaves the rest standing | `test/level0/config.test.js` |
| the schema refuses a config missing a field | `test/contract/tree.test.js` |
| the verb names the layer answering | the sample under `#the-verb-names-the-layer` |
| no number the config owns stands in code | the grep below |

# One ask costs nothing

The write door asks on every Write and Edit, so that is the ask this branch
times:

| what | cost |
|---|---|
| one ask, reading `.se/config.json` | 0.0056 ms |
| `stat` alone, the check a cache needs | 0.0017 ms |
| Vale over one write | 88 ms |
| Biome over one write | 101 ms |

A cache earns no place here. It saves 0.0039 ms against a door already paying
88 ms, so the resolver reads the file on every ask and carries no `mtimeMs`
check. The script stands at the end of this file.

# The magic number debt

`noMagicNumbers` names 63 lines under `src` and `test`, and 69 counting the
plugin's own modules. This tree holds the rule off in `spec/config/biome.json`,
named there as `off` so a reader meets the decision:

| where | lines | what they are |
|---|---|---|
| a test | 43 | the numbers a case names out loud |
| `padEnd` and `padStart` | 15 | the column widths of a printed table |
| a `slice` or a `repeat` | 2 | the offsets of a timestamp |
| `src/scripts/copilot.js` | 3 | a deadline and a timeout, in milliseconds |

Biome 2.5.12 takes no options for this rule, so the values this tree exempts
are the rule's own:

- `0`, `1`, `2`, `10`, `24` and `60`, anywhere they stand
- an array index
- an initial value in a declaration, and a default in a parameter

Turning the rule on today buys 63 named constants for column widths. That reads
worse than the `padEnd(18)` each one replaces.

# The editor draws the schema

VS Code draws it with no extension. Its JSON language service reads
`json.schemas` in `.vscode/settings.json`, and this branch points
`spec/config/level0.json` at the schema beside it. A contract case holds that
mapping, and the recommended extensions stay at two.

# What the config lacks

Nothing the code reads. The schema demands every field, the tracked file
carries them, and `./RUNME.sh config` names a fault where one goes missing.

This grep says what numbers remain in code:

    grep -rnE "=\s*[0-9]+;|\?\?\s*[0-9]+" --include=*.js .claude src

| number | where | why it stays |
|---|---|---|
| `LIVES = 2`, `FRESH = 10` | `lib/stop.js` | the claim's life and the fresh window, which the brief leaves alone |
| `SAID = 80` | `lib/log.js` | the width one log line cuts to |
| `ROUNDS = 5` | `src/scripts/cli.js` | the rounds the fixer runs |
| `ASKING = 10000` | `src/scripts/tools.js` | the survey's timeout |
| `4000`, `20000`, `100` | `src/scripts/copilot.js` | the timeouts of the Copilot runtime |
| `max: 5`, `max: 15` | `ShortHeading.yml`, `GuidanceCap.yml` | a rule file is config already |

`ShortHeading` and `names.words` both hold five. One counts the words in a
heading and the other the words in a path, so the number stands twice on
purpose. Move the rule file's copy where a later level teaches Vale to read the
config.

# What surprises me

Three findings, and the first one this branch fixes:

1. Biome reaches nothing. `biome lint --config-path=spec/config .` stops on
   `Found a nested root configuration`, because the walk meets
   `spec/config/biome.json` as a second root. `./RUNME.sh lint` then takes the
   empty answer for a pass. Adding `!spec/**` to `files.includes` fixes it, and
   the eight findings it uncovers stand fixed as well.
2. The code write door refuses nothing. `biome lint --stdin-file-path=... --reporter=json`
   writes the source to standard output and no diagnostics at all in 2.5.12, so
   `fromJson` in `lib/code.js` parses the source and answers an empty list. The
   formatter path works, because `biome format` answers the formatted text.
   A fix writes the text to a temporary file and lints the path.
3. The judge samples nothing. `tool.call` rebuilds it on every write, so
   `written` starts at 0 each time and `reads()` answers true for the whole
   session. Building it once at `session.start` and handing the rules in fixes
   it, at the cost of a rule file read per session.

# What this branch leaves alone

The config pane in the editor and the slash commands themselves, which the
brief names. The verb is the surface both call.

# The script this branch writes

`.se/scripts/asks.js`, which git ignores:

    // What one ask costs inside the write door, against what the door already pays.
    import { configOf } from "../../.claude/skills/level0/lib/config.js";
    import { disk } from "../../src/doors/disk.js";
    import { proc } from "../../src/doors/proc.js";
    import { statSync } from "node:fs";

    const root = process.cwd();
    const files = disk();
    const at = (path) => `${root}/${path}`;
    const it = configOf({
      read: async (path) => files.read(at(path)),
      write: async (path, text) => files.write(at(path), text),
      makeDir: async (path) => files.makeDir(at(path)),
      readEnv: async (names) =>
        Object.fromEntries(names.map((n) => [n, process.env[n] ?? ""])),
    });

    await it.write("stop.mostInARow", "3");
    const rounds = Number(process.argv[2] ?? 10000);

    const timed = async (name, what) => {
      await what();
      const began = process.hrtime.bigint();
      for (let i = 0; i < rounds; i++) await what();
      const ms = Number(process.hrtime.bigint() - began) / 1e6;
      console.log(`${name.padEnd(28)} ${(ms / rounds).toFixed(4)} ms per ask`);
    };

    await timed("ask, reading the file", () => it.ask("stop.mostInARow"));
    await timed("stat alone", async () => {
      const said = statSync(at(".se/config.json"));
      return said.mtimeMs + said.size;
    });
    await timed("read alone", async () => files.read(at(".se/config.json")));

    const outside = proc();
    const one = (name, argv, stdin) => {
      const began = process.hrtime.bigint();
      outside.run(argv, { cwd: root, stdin });
      const ms = Number(process.hrtime.bigint() - began) / 1e6;
      console.log(`${name.padEnd(28)} ${ms.toFixed(2)} ms once`);
    };
    one("vale over one write", [".se/bin/vale", "--config=.vale.ini", "--output=JSON",
      "--no-exit", "--ext=.md", "-"], "A door reads this line.\n");
    one("biome over one write", [".se/bin/biome", "lint", "--config-path=spec/config",
      "--stdin-file-path=src/x.js", "--reporter=json"], "export const one = 1;\n");
