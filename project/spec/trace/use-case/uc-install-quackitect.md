---
minted_in: i1
id: uc-install-quackitect
type: "[[use-case]]"
statement: Install the machine on a computer that does not have it, and reach the front desk.
actor: stk-newcomer
trigger: someone decides to run quackitect on a machine where it is not installed
precondition: a computer with an editor and a shell
guarantee: the panel is drawn, the engine answers, and the front desk is waiting for a sentence
refines:
  - sty-ramp-up
priority: must
---

## Main scenario

1. The person obtains the product's folder. It is ONE folder, and everything the product is sits inside it.
2. They see what to run at the top of that folder, without anyone telling them.
3. They run it ONCE ON THIS MACHINE. It installs the runtime and the editor extension, and nothing a later start could do for itself.
4. It opens the editor on that same folder. That folder is the product, and no screen asks them to pick one.
5. The extension starts the engine and draws the panel beside the editing area, with the machine on it.
6. The agent boots, is handed everything it owes, and stops at the front desk.
7. The desk greets the person and lists what is walkable right now.

## Every start after the first

8. The person opens the editor on the folder. Nothing else.
9. The extension starts the engine, draws the panel, and the agent boots to the desk. The launcher is never run again.

## Extensions

- 1a. The person already ran the launcher on this machine, for a different project. The runtime and the extension are already there, so nothing installs. They open the folder and the use case is steps 8 and 9 alone.
- 3a. The editor is not installed. The launcher says so and names what to install, rather than failing part-way.
- 3b. The extension is already installed at a different version. The launcher replaces it and says which version now stands.
- 3c. The launcher is run a second time on the same machine. It reports what it found and changes nothing that already stands.
- 4a. The person opens the folder in the editor without having run the launcher. Nothing comes up, because the extension is not there. The folder still shows the one thing to run, and running it repairs the start.
- 5a. The port the engine wants is taken. The engine picks the next one and the panel follows it.
- 5b. The folder carries no machine state. The panel says plainly that this folder is not a project of this system, and offers nothing else. It never seeds one unasked, because seeding is a decision rather than a convenience.
- 6a. No agent is available or the person wants none. Boot still completes, the panel is fully usable, and the walk waits for a hand.
- 9a. The extension has updated and part of it cannot take effect in a window already open. The editor asks for a window restart rather than running half-applied.

## Why one folder

THE FOLDER THE PERSON OPENS IS THE PRODUCT. Nothing else names it, nothing is
configured to point at it, and no file has to be read to find out which one it
is. That is the whole selection mechanism, and it is why step 4 has no screen.

BEFORE i9 THERE WERE TWO FOLDERS. The machine state sat one level above the
folder the editor opened, so the thing a person looked at was never the thing
the system worked on. Step 1 said "the product's folder" and meant the outer
one; step 3 said "opens the workspace on that folder" and meant the inner one.
The sentence read fine and described two different places.

## Notes (not load-bearing)

STEP 2 IS A GUARANTEE, NOT A MECHANISM. It says the person finds what to run
without being told. It does not say whether that is a file name, a readme line,
or something the editor offers, because a use case that names one of those is
read at the gate as a demand for that one.

WHAT SITS THERE IS AN OPEN DESIGN QUESTION, carried as
[[raid-iss-the-collapse-hides-the-one-thing-a-newcomer-must-run]]. It was found
by telling sty-ramp-up's second slide against the collapsed shape: once
everything moves inside the folder, the launcher moves in with it, and a fresh
checkout has nothing above it pointing down.

THE ONE-TIME CLAIM IS NEW AS A GUARANTEE, not as wording. The entry document
has said "run it once" since i1. Until this iteration the engine had to be
started by hand on every later start, so the sentence was false. Steps 8 and 9
are what makes it true, and they are the pass line the entry-point goal is
measured against.

ONCE MEANS ONCE PER MACHINE, NOT ONCE PER PROJECT, and extension 1a is where
that is said. What the launcher installs is a runtime and an editor extension,
and both belong to the computer rather than to any one folder. A person who
already runs one project here obtains a second folder and simply opens it. This
was not written down until the M2 gate asked what "once" was counting, and the
two readings gave different products.

STEP 3 SHRANK. It used to install, start the engine and open the workspace. The
engine's start moved to the act of opening the folder, leaving the launcher only
what a script alone can do: install a runtime that a process needing that
runtime could never install for itself.

THE FOLDER ANSWERS FOR ITSELF AND NOBODY IS ASKED. Extension 5b is the whole
rule: machine state present, it comes up; absent, it says so and stops. There
is no third case and no prompt anywhere.

AN EXTENSION 8a BRIEFLY EXISTED AND WAS STRUCK, on 2026-08-19, the same day it
was written. It made a cloned folder ask once before starting, on the argument
that a clone carries the marks of somebody else's seeding rather than the
opener's own decision.

THE OWNER OVERRULED IT IN ONE SENTENCE: if it finds the machine-state folder it
can work on it, and if it does not it does not work on it. The argument for
asking was borrowed from systems that guard against a tree which can RUN
something on arrival, and this folder carries a log and session state rather
than anything that executes.
