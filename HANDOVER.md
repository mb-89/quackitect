---
kind: [[handover]]
status: held
urgency: soon
depends_on: the-config-holds-numbers
---

# Every rule reaches the panel

Open the folder and read the problems panel: every rule this tree holds draws
there now. Read [[spec/design_output/tree]] before changing one.

| where a rule lives | which rules |
|---|---|
| `.claude/skills/level0/lib/tree.js` | the ten weighing two files |
| `spec/config/styles/VoiceScript` | `NoPathInScript`, over `.sh` and `.ps1` |

Add a rule by writing a function in `tree.js` and naming it in `RULES`. Answer
`{ file, rule, line, column, message, severity }`, name a file that stands on
disk, and point at line 1 where no better line exists.

# What the proofs say

| what the brief asks | where it stands |
|---|---|
| `check` passes, and validates the plugin | 340 tests, and the rules pass |
| each of the ten answers on a broken tree | `test/contract/tree.test.js`, twelve cases over a fake disk |
| `lint` prints them in the standard line shape | the line below |
| the panel carries them | the line below, one rule broken on purpose |
| `check` still fails where a rule fails | `lint` runs inside `check`, and the sweep gates it |

# What the panel shows

Set `win32-x64` to `.se/bin/biome` in `.vscode/settings.json`, run
`./RUNME.sh lint`, and read this back:

    .vscode/settings.json:15:1: BiomeOnWindows: win32-x64 runs .se/bin/biome, and this tree installs .se/bin/biome.exe there.

Line 15 holds the key. Click the panel row and the editor opens that file at
that line, with `BiomeOnWindows` as the code.

# What the ten cost

Budget 6 ms for the ten, against the 550 ms `lint` already spends:

| what runs | cost |
|---|---|
| `lint` over the whole tree | 515 to 620 ms, eight sweeps |
| the ten rules inside one sweep | 6 ms, median of seven |
| the same ten, over a listing already read | 2 ms |
| tracked paths here | 179 |

Read `paths()` before adding a rule over the tree: it holds the one listing, so
a second reader pays nothing.

# The panel reads well

Expect one broken thing to stay one row:

| what breaks | what the panel carries |
|---|---|
| one wrong key | one line, at the row holding it |
| an unreadable `.vscode/settings.json` | three lines, all at line 1 of that file |
| `names.words` at 3 | 9 lines |
| `names.words` at 2 | 22 lines |

Leave `names.words` at the 5 this tree ships, and the last two rows read zero.

# Which rules go into Vale

Move no further rule into Vale: each rule has one holder, so the panel carries
no line twice. Read this before trying:

| the rule | why it stays |
|---|---|
| the seven config rules | each weighs a file against another file, and Vale's sandbox offers `text` and `fmt` alone |
| `NoLogDeleted`, `NameHoldsTheWords` | each reads what the tree tracks, and Vale reads one buffer |
| `BiomeOnWindows`, `ExtensionsOnOffer`, `SettingsNameBinaries` | each weighs a config against a constant a module holds |

Keep the one copy of that constant. A Vale rule can carry it, and the rule file
then drifts from the module reading it.

# The dot carries the mapping

Write a `[formats]` entry with its leading dot, or Vale refuses the ending:

| what the config says | what Vale answers over `RUNME.ps1` |
|---|---|
| `ps1 = md` | `unsupported extension: '.ps1'` |
| `.ps1 = md` | it reads the file, and the rule draws |

`.sh` reads either way, and this tree writes both with the dot. Point `lint` at
a folder and Vale sweeps it recursively under that mapping, so no caller names
a script.

# What this branch leaves

Take these three, or leave them:

| what to take | what stands today | what it costs |
|---|---|---|
| route `.sh` and `.ps1` through the write door | it reads `PROSE` and `CODE`, which name no script ending, so a bad `.sh` write reaches disk | six lines, plus a decision on whether the judge reads a script |
| move the three rules still standing as tests | `test/contract/tree.test.js` holds the schema over the config, the schema against the config, and a key naming a variable | the species this branch moves, and the brief's table names none of them |
| read `SurveyFindsNode` where the survey is absent | it blames `src/scripts/install.sh` there, and `.se/tools.json` where that names another node | a judgement on which file a person opens |
