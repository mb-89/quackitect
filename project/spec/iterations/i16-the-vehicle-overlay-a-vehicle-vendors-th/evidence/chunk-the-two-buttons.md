---
form: chunk-the-two-buttons
by: agent
signed_off: 2026-08-18T19:02:15.328Z
authors: agent
files:
---

# Evidence form / chunk-the-two-buttons

## current_situation

BOTH BUTTONS ARE WIRED, on every leg. 1464 of 1465 pass; the one failure is the corpus-wide churn alarm.

### What a person does now

TWO ENTRIES IN THE COMMAND PALETTE, in plain words rather than in ours.

- "Make a Copy of This System" asks for an empty folder, a name and a short name.
- "Start a Project This System Drives" asks for an empty folder and a name.

EACH ASKS AT THE MOMENT IT IS PRESSED. Neither reads a path from a settings file, which is what makes the act theirs rather than the configuration's.

AND EACH ENDS WITH THE BUILDER INSIDE THE RESULT, in a NEW window. The window they pressed it from is left exactly as they left it, which is the fifth slide of the story and the one this design must not break.

### Why the wire needed four legs and not one

THE LEG-BY-LEG FAILURE IS THE ONE THIS PROJECT REPEATS MOST, and the craft guidance names four times in a single day when a change landed with one leg missing.

SO ALL FOUR ARE BUILT AND ALL FOUR ARE CHECKED: the acts exist, the engine serves them on a route, the manifest declares the commands, and the extension registers them.

A COMMAND DECLARED AND NOT REGISTERED is a palette entry that errors when pressed. Registered and not declared is a command nobody can find. Either half alone reads like a finished button.

### The refusal is the interesting half

THE ENGINE HANDS BACK ITS OWN TYPED REJECTION as JSON, and the button repeats it. So pressing the act on an occupied folder says what was expected and what it got, rather than that nothing happened.

THAT LESSON IS BORROWED RATHER THAN LEARNED AGAIN. The target button once posted as a redirect, and success and refusal both landed the same way — the clicking page read nothing either time.

## built

### engine/produce.ts

`produce(root, {kind, dest, name, abbr}, source)` — one door for both acts, because a surface has one button per kind and one call to make. AN UNKNOWN KIND IS REFUSED rather than defaulted, since guessing would make the wrong kind of tree from a typo.

### engine/mirror.ts

A `/produce` JSON POST, in the table that already exists for exactly this shape. It runs the acts against the tree the walk is working in, and a refusal comes back as its own JSON.

### vscode/src/extension.ts

- `produceTree` posts the act, shows progress from the first moment, and opens the result in a new window.
- `askForAnEmptyFolder`, `createVehicle` and `createProject` ask for what each act needs and nothing more.
- The abbreviation input validates two-or-three letters AS THE PERSON TYPES, so the refusal arrives before the call rather than after the wait.
- Both commands registered beside the existing ones.

THE CALL GETS ITS OWN TIME BUDGET. The shared helper allows two and a half seconds, and copying a tree does not fit in that. Passing a signal overrides it, which the helper already allows by spreading the caller's options last.

### vscode/package.json

Two command entries, titled in plain words a stranger can read.

### tests/produce.test.ts — three more cases

- each button declared in the manifest AND registered in the extension, and the act opening a new window
- the engine serving the acts on a route, against the tree the walk is working in
- an unknown kind refused rather than defaulted

## follow_up

IMMEDIATELY: chunk-runme-drops-the-export, the last chunk.

### What that chunk has to reach, swept before touching anything

FIVE PLACES NAME THE EXPORT, and three of them are the front door somebody reads first.

- `RUNME.ps1`, the block itself.
- `README.md`, a whole section under "Give it to someone else".
- `project/deliverable/brand/README.entry.md`, the SAME section — and this is the template every vehicle's README is rendered from, so leaving it would ship the old instruction to every copy.
- `project/deliverable/engine/bin/se-mcp.ts`, the one help text both the launcher and the engine print.
- `project/deliverable/engine/bin/package.ts`, a comment saying its exclusions mirror the export's.

THE TRACE NODES THAT MENTION IT STAY. They say why a requirement exists, in the past tense, and they are accurate about the past.

### What is still not built, unchanged from the last chunk

RESOLVING AN IDENTITY TO A TREE. A driven record is readable and comparable but not resolvable, and `drivenBy` says so rather than guessing.

### Still parked

THE CHURN ALARM, 871 of 1692 against a 50 percent limit. It blocks verification and wants the owner's word.

## anything_else

### What a test cannot reach here, said plainly

PRESSING A BUTTON NEEDS AN EDITOR. Nothing in the battery clicks one, so what is checked is that every leg of the wire exists rather than that the whole wire carries.

WHAT WOULD ACTUALLY PROVE IT is the sixth slide of the story: the desk in the new window greeting under the vehicle's own name. That is a demonstration, and it is the one part of this that genuinely needs eyes.

SO THE HONEST CLAIM IS NARROW. The acts are proved by the end-to-end test. The wiring is proved by inspection of both files. The press itself is unproved until somebody presses it.

### One thing deliberately not done

NO ICON IN THE ACTIVITY BAR AND NO ENTRY ANYWHERE BUT THE PALETTE. The owner asked for two buttons and said what they must do; where they sit visually is theirs, and the craft guidance is explicit that a visual element the sketch does not show is a question rather than a silent addition.
