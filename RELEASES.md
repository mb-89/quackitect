# Releases

One entry per shipped version, newest first.

## 6.0.0 — 2026-08-19

An agent can now ask the database a structured question instead of grepping for it, and can ask it which of a change's ripples actually matter instead of reading every one by hand.

- A new question the agent can ask: read nodes, edges, states and notes with filters and chosen fields, the same way the reader you already had for browsing does — and if you ask for something it does not carry, it tells you by name instead of answering wrong.
- 26 working questions from an earlier version were carried over rather than reinvented, and five small extensions were added only where one of them actually needed it, each proven with a test first.
- A second new question: when a change touches many other things, the agent can ask which of them actually matter, and has to decide on each one rather than skim a raw list.
- Both real runs found and fixed real bugs along the way — one silently dropped a filter, the other showed that keyword matching alone cannot always tell what is related from what is not.

### What this release does not change

- Some of what the database can show a resolver by default still shows everything in the project rather than just the current piece of work; most of it now defaults narrower, a few cases are left for a later pass.
- Nobody has checked yet whether this duplicates something Obsidian's own database view already does better.

## 5.0.0 — 2026-08-18

You can make your own copy of this system, and point it at your own work.

- Make a copy of the whole system under your own name, from a menu entry. It
  arrives as its own project with its own history, and a new window opens on
  it. Nothing outside the folder you named changes.
- Everything in your copy is yours to change, including the parts we wrote.
  Nothing in it is locked.
- Your copy can never write back to the one it came from. It knows which one
  that was by an identity rather than by a folder name, so moving or renaming
  either of them changes nothing.
- Start a project the system drives. That work lives in its own folder and
  carries none of the method. One small file in it says which copy drives it.
- Your copy can say what you made your own. It compares itself against the day
  it was made, and lists what you wrote, changed and removed.
- The old way of exporting a copy is gone. It was a flag on the install script,
  in the document a newcomer reads first, and it sent people to a command line
  for something that is now a menu entry.

### What this release does not change

- TAKING AN UPDATE FROM THE COPY YOU CAME FROM IS NOT BUILT. Your copy can tell
  you what you changed. Nothing yet brings our later changes to you. Until that
  exists, a copy is a fork that knows what it changed.
- LAYERING YOUR OWN METHOD OVER OURS IS NOT BUILT EITHER. You can edit anything
  in your copy, which covers most of what people want. What is missing is
  keeping your version and ours side by side.
- NOTHING HAS BEEN TRIED ON A SECOND MACHINE. Everything above was checked
  where it was built. A copy also needs a one-time install of its dependencies
  before it runs.

## 4.6.0 — 2026-08-18

A finding made on one machine can be picked up on another.

- Notes you park during a look-back now become real items in the project
  itself, instead of a line in a file only your own computer can see. Anybody
  who copies the project sees the same list of what could be done next.
- You write what the item IS in your own words. The raw note stays on your
  machine and never travels, because a note is a scribble and can contain
  anything — a password, an address, somebody's name.
- Pasting the note instead of writing the item is refused. The system compares
  the two and says no if they share a long run of words or any address, path or
  key. It will tell you plainly what overlapped.
- Cannot say cleanly what an item is yet? Say exactly that. An open question is
  a legal item and the system keeps it as one.
- There is exactly one way to add to the list, so nothing can slip in without
  those checks. Writing the file directly is refused.
- Parking the same note twice is refused, because the first time already made
  the item. What you want then is to pull it into the work.
- The list is called a POOL and what stands in it is a WORK TOKEN. It is not a
  backlog. A backlog is a queue you are behind on; a pool is a set of things
  you may choose from, and the difference is the point.

### What this release does not change

- What is already parked on your own machine stays there. Moving it into the
  pool is a separate job, and it will report what did not fit rather than
  converting anything quietly.
- Nothing on screen shows the pool yet. Today it is answered when you ask what
  stands open.
- The check that refuses a paste cannot catch a single bare name. That is a
  limit of comparing text, not an oversight, and it is written down where the
  limit is decided.

## 4.5.0 — 2026-08-17

A machine nobody is watching starts working on its own.

- Hand a fresh copy of the project to a computer in the cloud and it gets
  itself ready. Before this, whoever arrived first spent close to an hour doing
  the setup by hand, and did it again on the next machine, and the one after.
- It happens by itself when the session opens. Nobody has to know the command,
  which was the part that kept going wrong.
- Running it twice is safe. It says what was already done and leaves it alone.
- If any step fails, it says which one and the session carries on. A setup step
  that could end your session would be worse than the work it saves.
- Older versions of the project can be read again. A cloud copy arrives holding
  one version and the rest were unreachable, so anything referring back to them
  simply failed. Both halves of that are fixed, and the second half is the one
  everybody missed.
- Pictures of the interface can be taken on these machines at all. The browser
  they carry was in a place we never looked, and it refuses to run for the kind
  of user a container makes.
- A broken file in the project's own records is now caught when the system
  starts. One was sitting there, and the check said everything was fine.
- Two long-standing test failures are gone. One was reading a setting that
  happened to be lying around; the other was checking a copy of the project
  that had been set up differently from the real one.

### What this release does not change

- HOW MUCH THE AGENT DOES ON ITS OWN IS STILL YOUR SETTING, and the default
  still stops it early. On an unwatched machine that means it stops at the
  first approval and waits for somebody who is not there. Nothing here decides
  that for you; the setting can now be handed in when the machine starts.

## 4.2.0 — 2026-08-16

Your work lives in one place again.

- A job's files sit in an ordinary folder alongside everything else. Before
  this, each open job got its own separate copy of the whole project, and the
  system had to decide which copy you meant on every single action. It decided
  wrongly often enough to be worth removing.
- Finished jobs stay where you can read them. You no longer need any special
  command to look at one — open the folder.
- Picking a job to work on is now a question you answer. Opening the job list
  shows you what is open and waits. Before this, coming back after a dropped
  connection could start a job nobody chose, and mark it started.
- The same is true of the shorter side-tasks. Their list now offers a way out
  as well as a way in.

### What this release takes away

- SHARING WORK BETWEEN TWO MACHINES IS SWITCHED OFF. 4.0.0 let one machine
  publish a job and another take it, and guaranteed two machines could never
  hold the same one. That guarantee and the machinery behind it are gone.
- IT NEVER RAN FOR REAL. The feature shipped and was never once used end to
  end on a second machine. That is why it was switched off rather than kept.
- IF YOU NEED IT BACK, nothing about this release blocks it. The conflict was
  with keeping several copies on ONE machine, never with one copy per machine.
- TWO JOBS OPEN AT ONCE NOW SHARE FILES. Separate copies used to keep them
  apart. Nothing does now, so work one job at a time.

## 4.1.0 — 2026-08-14

Fixing how you work no longer means stepping outside your work.

- Find the method wrong halfway through a job and you can correct it where
  you are. The change lands in the one place the method lives, and it applies
  to you at once. Before this it meant leaving the job, editing somewhere
  else, and coming back.
- Where a job runs is now a setting. Pick a separate process for each one -
  the default, so a crash stays with the job that caused it. Or a thread,
  which starts more cheaply. Or neither, which is the plain baseline the
  other two are measured against.
- Choose it with `--mode process`, `--mode thread` or `--mode inline` when
  you start. The panel can store the choice instead, and the next start
  takes it.
- The panel and the editor read the available choices from the system, so
  neither keeps its own copy of the list.
- The system reports its own version again. It had been announcing an old
  one since 4.0.0, in the line it prints at startup and in every call it
  logged. Older entries keep what they recorded.
- Nothing breaks. Everything authored for 4.0.0 keeps working.

## 4.0.0 — 2026-08-12

Work shares across machines.

- Creating an iteration publishes it to the shared repository at once,
  and any machine there can take it and run it.
- A taken iteration names which machine holds it and for how long. Two
  machines can never hold the same one - the second is refused and told
  who holds it.
- The autonomy control became a ladder of named work types: blocked,
  mechanical, operational, tactical, strategic, ideation. Each rung
  includes the ones below it.
- The waiting screen's offer now includes going idle.
- Newly drawn sub-machines get a placeholder drawing until authored, so
  planning can continue.
- Breaking: drawings authored with the rung words need this version.
  Older versions refuse them.

## 3.0.0 — 2026-08-11

The first packaged v3.

- The engine: the se MCP server — the caged tool lane, the call log, the
  state-machine kernel, the mirror.
- The machines: the rigor matrix, the methods, the forms and the guidance
  the agent is bound by.
- The VS Code extension: the mirror beside the editor.
- The one-time installer: RUNME.ps1 — install, cage, launch.
- Assembled by `project/deliverable/engine/bin/package.ts`.
