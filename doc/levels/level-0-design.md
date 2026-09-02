# Level 0 — design doc

**Status: draft.** All 31 hook events reviewed and ruled. Rulings are owner decisions from
the 2026-08-29 session.

| | |
|---|---|
| Date | 2026-08-29 |
| Scope | v4, the harness-hook layer |
| Verified against | Claude Code hooks guide + GitHub Copilot hooks reference, Aug 2026 |

Field notes go stale. Where this doc states a harness capability, re-check it against the
live docs before building. Three claims in this session's research were already wrong by
the time they were read.

Every entry carries four things. **What it is, the ruling, why it makes sense, and what
breaks if we do not do it**. An entry that cannot fill the fourth column is not admitted.
Applying that test collapsed the optional set from twelve adoptions to three.


**This document states intended behaviour, not solutions**. Where an earlier version is
cited it is as evidence — a measured failure, or a confirmed fact about what exists. It is
never cited as a mechanism to inherit. How any of this is built is decided when it is
built.

---

## What Level 0 is

**Control that does not depend on the agent's cooperation, and does not depend on the
machine having started.** Mechanical, always-on. It still holds when the agent is
confused, mid-expedition, or three helpers deep.

Anything needing domain judgment is a higher level and lives in the engine.

## What Level 0 knows about the levels above

**Exactly three things, and no more:**

1. **An authority may exist.** Level 0 can ask it whether an action is permitted. It never
   learns what the authority is or what makes an action permitted.

2. **The authority's last answer.** An opaque record carrying decisions and a version.
   Level 0 reads policy out of it and never interprets the concepts inside it.

3. **Agent identities.** Level 0 establishes and carries an identity for every agent. What
   an identity *means* — who may be assigned what — belongs to Level 1.

Words that must never appear in a Level 0 implementation: state, pull, gate, work token,
walker, reviewer, iteration, bless. If a guard needs one of them, the guard belongs higher.
Level 0 should be asking the authority instead of deciding.

## Level 0 standalone

**With no authority registered, Level 0 still works** and is worth having on its own.

What you get, running Level 0 and nothing else:

- An agent that writes and speaks a certain way, and a small set of rules about how it does.
- A log that shows what it did, readable with no tool.
- A very short list of files it may not write to, and only projections are refused outright.
- Reads deduplicated and clamped. Helpers identified. Failures classified. Loops broken.

Every permission question that needs the authority answers *permitted*. Every stop question
answers *may stop*. Nothing above this layer needs to exist.

## Governing rules

1. **Level 0 constrains the agent. It never constrains the owner.**

2. **Level 0 owns interception and the mechanical guards. Every judgment is asked of the
   authority.** The hook is the trigger. The authority decides.

   Two sources, and the difference is load-bearing. **Ask the authority live** for what
   must be *current* (it may have changed without the agent knowing). **Read the last
   answer** for what must *match what the agent was told* (the policy it is operating
   under). Enforcing a rule the agent never saw is not strictness, it is incoherence.

3. **Level 0 may force a judgment to be made without making it.** It never evaluates the
   answer.

4. **Every guard names the failure it prevents.** A guard that cannot is not admitted.

5. **Correct the call when the correction is unambiguous. Refuse it when the agent must
   decide**. Silently fixing something the agent would have chosen differently is a lie
   about what it did.

6. **A verb stays in the MCP surface exactly when it needs an argument the native tool
   cannot carry**. Everything else goes native and is guarded by the hook.

7. **Completeness of the record is Level 0's primary duty.** Interpretation happens
   later, off the hot path.

8. **Build on the Claude Code / Copilot CLI intersection**. Harness-only events are
   optimizations and may never be load-bearing — nothing in the engine may depend on one
   firing.

9. **One home per concern**. A harness mechanism that duplicates something the engine
   owns is rejected even when it works. Two sources of truth cost more than the feature
   is worth.

## Why this layer exists

**The tool surface must not tax every turn**. A cage built by replacing the native tools
pays for its whole vocabulary in every request. That cost lands whether or not any of it is
used. v3 pays roughly 29,300 tokens a turn for 41 replacements.

Guards belong where they cost nothing to declare, so the native tools can stay. Rule 6
decides what still earns a place. The authority's own verb, a shell verb carrying an
intent, a test verb carrying the question it answers. Little else.

**Load-bearing consequence:** once natives are re-enabled, the hook log is the only thing
that sees them. Logging stops being a convenience.

---

## Installation

**One script installs everything.** It is the only entry point. It runs on Windows and on a
cloud Linux box, and it leaves a working system behind.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **One script, and it is the only entry point** | **ACCEPTED** | Written instructions go stale and a reader stops at step three. A script is a claim that can be tested. | Installation becomes a page of prose that nobody re-runs, and every machine differs. |
| The script is **idempotent**. A second run changes nothing | **ACCEPTED** | Repair and upgrade are the same action as install. The user never has to know which one they need. | Repair means uninstall first, and a half-installed machine has no route forward. |
| It **installs what is missing and skips what is present** | **ACCEPTED** | The user's machine already has some of this. Replacing a working tool is a way to break a working machine. | The script either fails on a present tool or overwrites the user's own version of it. |
| **Two profiles: desktop and headless.** The script decides, the user may override | **ACCEPTED** | A cloud agent needs the engine and no editor. A person needs the editor. The two lists differ. | A cloud box installs a user interface it cannot display, or a person gets no editor. |
| **Git is a dependency, not an assumption** | **ACCEPTED** | The user may be handed a folder rather than a clone. The archive needs git later, so the script installs it. | The only route in is a clone, which excludes the plain-folder case the design accepts. |
| **Windows uses `winget`** | **ACCEPTED** | It is present on supported Windows and needs no bootstrap of its own. | A second package manager has to be installed before anything can be installed. |
| Linux uses **whichever package manager is present** | **ACCEPTED** | Cloud images differ. The script detects rather than requires. | The script works on one distribution and fails on the next box. |
| **No package manager and no root is a supported case** | **ACCEPTED** | Many agent containers run without root and without a full image. Static binaries into a user prefix cover it. | The cloud case, which is half the users, fails on the boxes that are hardest to fix by hand. |
| **What must be true is a manifest. The script executes it** | **ACCEPTED** | The list of dependencies, paths and register entries is data. A person can read it and do it by hand. | Installation logic is branching code that only its author can audit. |
| **Everything about setup lives in one folder** | **ACCEPTED** | The command surface is small on purpose. Two scripts at the root are two things the reader has to tell apart. | The root grows an entry per platform, and the surface is where the mess shows first. |
| **One installer program, two thin bootstraps** | **ACCEPTED** | The real work is written once. Each bootstrap only makes the runtime exist and hands over. | The same logic is written twice and the two copies drift apart. |
| A **single polyglot script file** | **REJECTED** | It works. The technique is real. It costs readability, which this design has ruled load-bearing, and buys one file name. | Nothing. |
| The desktop profile **ends with the editor open**, on an empty folder, extension loaded, welcome shown | **ACCEPTED** | The install is not done when the files are in place. It is done when the user can act. | The user is left at a prompt and has to find out what to do next. |
| The installer **registers the copy it installed** | **ACCEPTED** | The register is how a folder finds an engine. An unregistered copy is invisible. | The install succeeds and nothing can find it. |
| A failed step **names the step**, says what to do, and leaves the machine usable | **ACCEPTED** | A partial install must not be a broken machine. | The user is worse off than before they ran it. |
| Marketplace publication is **out of scope for now** | **ACCEPTED** | The install works from a clone or a folder. Publication is a distribution question, not an installation question. | The design binds itself to a publication route that does not exist yet. |
| The extension is **linked, not copied** | **ACCEPTED** | v3 does this and it works. The build renders the installable tree. The install points a link at it, so a rebuild needs no second install. | A copy that goes stale, and a user who does not know they are running an old shell. |
| The editor's own extension list is **written by the engine**, with backup and rollback | **ACCEPTED** | The editor loads what its list names, and it does not find a linked folder on its own. That list holds every extension the person has. A careless write loses other people's work. | Either the extension never loads, or one bad write makes the editor reject every extension at once. |
| A **locked extension names the cause**, not the file | **ACCEPTED** | The editor holds the files it is running. The raw failure names an internal file and hides the reason. This is the one step that needs the editor closed. | A clear condition is reported as an unreadable error. |
| **OPEN** — offline install | **DEFERRED** | A first install needs the network. Whether a fully offline install is required is not yet stated. | Nothing yet. It becomes a hole the day somebody installs on an air-gapped machine. |

**Order of the walk.** Detect the profile. Read the manifest. Check and install each
dependency. Put the method root in place and register it. For the desktop profile, install
the extension and open the editor.

---

## Projection

**Some files exist because another tool insists on them.** The harness wants its
configuration in one place. The editor wants the extension list in another. Those files are
**projections** of an original that lives in this system.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Projection is one mechanism, not a feature of one file** | **ACCEPTED** | Instructions, cage configuration and anything a future tool insists on are the same shape: authored here, written there. | A second mechanism per file kind, each with its own staleness and its own bugs. |
| **What is projected where is data** | **ACCEPTED** | A list of sources, a target, and how that format writes a comment. Adding one is an entry, not a change to a program. | Every new target needs code, so the cheap ones do not get made and the copies come back. |
| A source may **name the roots and the engine** | **ACCEPTED** | A cage has to say which program the guards call, and only the projector knows where that program is. | The cage is written by hand for each machine, which is the thing being removed. |
| A file another tool requires is a **projection**, and it says so | **ACCEPTED** | Two files hold the same fact. Which one is the original must not be a matter of memory. | Somebody edits the copy, and the edit is lost on the next write. |
| **The engine projects. Nobody copies by hand** | **ACCEPTED** | This is the one thing v3 got wrong here. Placing was a step in the installer, so a projection could only be refreshed by running the installer again. | Hand steps in a procedure that claims to need none, and the user finds out by hitting a stale file. |
| A changed original **re-projects on its own** | **ACCEPTED** | The whole reason to name it a projection is that the relation is maintained, not performed once. | A projection is correct only immediately after an install. |
| A projection is **read-only to the user** | **ACCEPTED** | It is output. Editing output is editing something that will be overwritten. | Silent loss of the user's edit, which reads as the tool corrupting a file. |
| A **stale projection is a stated fact**, not a warning in a log | **ACCEPTED** | v3 warns that the first boot will name which projection is stale. That is a defect described rather than removed. | The system knows it is out of date and expects the user to notice. |
| Guidance is **authored once and projected many times** | **ACCEPTED** | Each host reads its own file in its own place. One source and three outputs is one thing to keep right. | The same rules are written three times, and they agree for about a month. |
| A projection that is **already correct is not written** | **ACCEPTED** | Rewriting an unchanged file changes its modification time, and everything watching it wakes for nothing. | A projection that looks changed on every start, and watchers that learn to ignore it. |
| Change is detected by **content, not by time** | **ACCEPTED** | A file written with the same bytes is not a change. A digest says so and a timestamp does not. | Saving a file without editing it re-projects everything. |
| Each projection **declares itself in its own comment syntax** | **ACCEPTED** | It is the first line a person sees when they open the wrong file. Frontmatter for one host, a comment for another. | The declaration is invisible in the format that most needed it. |
| The **generated prompt layer is a projection** of the guidance it is built from | **ACCEPTED** | It is assembled, not authored. Shipping it in a package ships something that can arrive stale. | A brand-new install starts red on files nobody placed. |

---

## What Level 0 guards on its own

**Level 0 guards the shape of the world.**
**The authority guards the meaning of the work.**
A guard belongs here when files, identities and this layer's own machinery state it fully.
A guard that must know what work is belongs above.

**Almost nothing is forbidden.** One write is refused outright. Everything else is either
scrutinised, or simply allowed.

### Where a write lands decides how much attention it gets

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A write **outside the roots is allowed**, and is not guarded | **ACCEPTED** | Told to write a file to the desktop, the agent writes it. The machine is the user's, and the cage is not there to police their disk. | The agent cannot do ordinary things, and the user works around the tool to get them. |
| A write **inside the roots is scrutinised** | **ACCEPTED** | Inside is where the record, the method and the work live. That is what the rules are for. | The rules apply everywhere and mean nothing anywhere. |
| **No root is declared or registered** | **ACCEPTED** | The install knows where the two roots are. v3 made the user declare them, and it was an annoyance that bought nothing. | A registration ceremony stands between the user and the first useful action. |
| Roots are **locations, not a fence** | **ACCEPTED** | They say where the method and the work live. They are not a permission boundary. | The two roots are read as a sandbox, and the sandbox becomes the design. |

### Two kinds of refusal, and they are not the same thing

**A destination can be refused, or a form can be.** Mixing them is how a small rule reads
like a large one.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Exactly one destination is forbidden: a projection** | **ACCEPTED** — no override | It is output. The edit is lost on the next projection, and losing a person's work is not a thing to be talked into. | Silent loss of an edit, which reads as the tool corrupting a file. |
| That refusal **names the original** | **ACCEPTED** | The writer wants an effect, not a file. Naming where to write gets the effect. | A refusal that says only no, and a writer who has to go looking. |
| **A form can be refused anywhere** | **ACCEPTED** | Nothing is forbidden about the place. What is refused is text that breaks a rule the checker can see. The same file, written properly, goes through. | The two are read as one rule, and a check on wording looks like a ban on a folder. |
| A refused form **says what to change**, and the write is made again | **ACCEPTED** | A destination refusal ends the attempt. A form refusal bounces it, and the writer fixes the text. | Both read as walls, and the fixable one gets worked around. |

### Scrutinised, not forbidden

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The agent **may write its own machinery** | **ACCEPTED** | The agent works on this system. Forbidding it forbids the work. The rules apply to those files as to any other. | The tool cannot be built with the tool, which is the one capability that keeps it honest. |
| A **straight copy of a private original into the persistent area** is refused | **ACCEPTED** | Digests travel. Originals do not. A copy is a hash match, so this is a comparison and not a judgement about content. | The private side leaks by an ordinary file operation that nothing questions. |
| Moving one **inside** the private folder is nobody's business | **ACCEPTED** | The rule is about leaving, not about tidying. | The private area becomes read-only by accident. |
| The **record is not material** | **ACCEPTED** | The log is this system's own writing. Comparing against it would refuse a quotation from it. | Quoting the record back into a note is refused as a leak. |
| It refuses a **form, not a place** | **ACCEPTED** | The same file with a digest in it goes through. What is refused is the original's own bytes leaving. | It reads as a ban on a folder, which is not what it is. |
| An agent **cannot act as another identity** | **ACCEPTED** | Identity is this layer's own product. | Every per-agent rule above becomes unenforceable, which is v3's exact gap. |
| A **guard that cannot reach an answer refuses** | **ACCEPTED** | Silence and permission must not look the same. | The protection is absent exactly when something is already wrong. |
| **Written text is checked against the mechanical form rules**, and a write that breaks one is refused | **ACCEPTED** — on, and not a parameter | Sentence length and forbidden words are properties of the text, so no work concept appears. This refuses a form and never a place: the same file, written properly, goes through. | Voice applies to conversation and never to the record. |
| Only the **mechanical tiers** refuse | **ACCEPTED** | Pattern and vocabulary are reproducible. Judgement is not, and a refusal nobody can reproduce is an obstacle rather than a rule. | Either judgement blocks work unpredictably, or nothing blocks at all. |
| **Prose only** | **ACCEPTED** | Markdown and plain text. Code, data and everything else are not what the rules are about. | A semicolon in a program is reported as a defect in writing. |
| A **stop with no stated reason** is refused once | **ACCEPTED** | This layer can force a reason to exist without judging it. That is rule 3 applied to stopping. | Agents stop for nothing and the record cannot say what was happening. |
| **Everything else** | **ASKED, NEVER DECIDED** | Whether this work may proceed, who may close what, what blocks whom. All of it needs vocabulary this layer must not hold. | The two layers grow a shared vocabulary, and the split stops being real. |

**Shell writes stay unguarded here too.** The list above binds the guarded path. A write
through the shell bypasses it, that is accepted, and the log is what makes it visible.

**Reach-back needs no guard.** A copy produced from this system is an independent copy, and
never a live link. Local changes stay local because there is nothing to carry them. Writing
back into the original is allowed when the user asks for it. Cross-cutting holds the rule.

---

## The user interface

**Three surfaces, and only the first two are ours.** This section replaces the sketch it was
drawn from. Nothing here depends on that drawing surviving.

```
+--------------------------------------------------------------+
| [start the agent] [show log] [ ] [ ] [ ]   <- toolbar row     |
|                                                              |
|  agent and engine ctrl                                       |
|  label | element | element | element | element   <- 5 cols   |
|  label | element spanning three columns          |           |
+--------------------------------------------------------------+
             the panel: a view in the editor sidebar

+-----+--------------+---------------------------+------------+
| ico |  the panel   |         editor            |  chat      |
|  o  |     (1)      |                           |  sidebar   |
|     |              +---------------------------+            |
|     |              |  the log window   (2)     |            |
+-----+--------------+---------------------------+------------+
                     the editor window

+--------------------------------------------------------------+
|  log lines                        |  details, or filter help |
|  ---------------------------      |                          |
|  ---------------------------  <-  |  the selected record      |
|  ---------------------------      |                          |
|  > filter                         |                          |
+--------------------------------------------------------------+
      the log window: one terminal that splits itself
```

### The panel

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **One icon opens it** | **ACCEPTED** | One way in. v3's icon is the shape to keep. | Several entry points, and a user who finds the wrong one. |
| One control section, **agent and engine control** | **ACCEPTED** | Level 0 has one job to expose. One section says so. | A panel organised by implementation rather than by what the user does. |
| A **five-column grid**, and a column is a fifth of the width | **ACCEPTED** | A stated grid makes every later row a placement rather than a decision. | Each new control invents its own layout, and the panel drifts. |
| An element **may span columns** | **ACCEPTED** | Some controls need the room. The grid stays the ruler. | Either everything is one width, or the grid is abandoned. |
| A row that needs clarifying puts a **label in the first column** | **ACCEPTED** | One convention, so a reader knows where to look. | Labels above, beside and inside, in the same panel. |
| **Columns do not collapse** when a slot is empty | **ACCEPTED** | Controls keep their position as the panel grows. A moving control has to be found again. | The toolbar reflows every time a button is added. |
| **Native where native is enough**, otherwise a view of our own | **ACCEPTED** | It is buttons, text fields, choices and numbers. The choice of technology must not be visible in the result. | Technology is chosen first and the result is whatever it gives. |

### The chat sidebar

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The harness keeps its own chat sidebar, **unchanged** | **ACCEPTED** | It is not ours. Rebuilding it buys nothing and breaks with every harness release. | A second chat that has to track someone else's. |
| At launch the **kickoff text is placed there** | **ACCEPTED** | It is what the agent is told first, and the user should see the same words. | The user cannot see what the agent was asked to do. |

### The log window

**One terminal that splits itself.** Left, the log lines. Right, the details. No second
process, no docking, no channel between two windows.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **No mouse. None** | **ACCEPTED** | Mouse tracking takes selection and copy away from the terminal, and the bypass is missing in browser-based editors. A log the user cannot copy from is a log with a hole in it. | Copy breaks exactly where the cloud users are. |
| **Arrows scroll and move the selection** | **ACCEPTED** | Typing belongs to the filter, so letters cannot also be movement. | Two keys mean two things, and the filter eats the navigation. |
| **Typing always goes to the filter** | **ACCEPTED** | The most frequent act needs no mode and no key to reach it. | A mode to enter before the common action, which is the thing that makes a tool feel slow. |
| **The filter is a row like any other** | **ACCEPTED** | Selecting it shows what it can do, in the pane that shows what a record holds. The help then lives where the eye already is. | Either the help has its own key, or reading it means giving up the selection. |
| It sits **under the list and above the status line** | **ACCEPTED** | It is the last row a person walks onto, so it is the last row. | Walking down past the end lands somewhere the eye did not follow. |
| Only **one step** reaches it | **ACCEPTED** | A page down from the middle stops at the last record. Otherwise a long press leaves the list entirely. | The filter is easy to fall into and hard to leave. |
| **Keys are matched by type, not only by name** | **ACCEPTED** | A terminal may report a key under an unexpected name. The key then reaches the filter, where an arrow moves a text cursor and nothing visible happens. | Movement works on the machine it was built on. |
| **One key opens the details, and the same key closes them** | **ACCEPTED** | A toggle is one thing to learn. Enter is what a person reaches for, and ctrl+d works where a terminal gives Enter to something else. | Two keys, and a pane that cannot be dismissed the way it was opened. |
| **Every call has details** | **ACCEPTED** | The record is complete, so the view over it is complete. | Some lines can be inspected and some cannot, with no rule saying which. |
| **The two sides scroll independently** | **ACCEPTED** | They answer different questions. Tying them together makes one of them useless. | Reading a detail means losing your place in the list. |
| **A new entry never moves or redraws the other side** | **ACCEPTED** | This is the v3 defect named directly. A live log that reloads the pane you are reading makes reading impossible. | The window fights the person using it, and they stop using it. |
| The left pane **follows the newest line only while the selection is there** | **ACCEPTED** | It is the mechanism the two rules above need. Scrolling up detaches following, and nothing jumps. | Either the log never follows, or it always does and drags the reader with it. |
| The selection is **anchored to a record**, not to a row number | **ACCEPTED** | Rows shift as entries arrive and as filters change. A number is the wrong handle. | The selection slides to a different line while the user looks at it. |
| The details pane is **bound to the selected record** | **ACCEPTED** | It answers about one call. Later calls are not that call. | The pane shows something other than what the user chose. |

### The viewer is its own process

**A general program that reads log files.** It knows nothing about this system. Give it a
file and it shows the lines, filters them, and opens details beside them.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The viewer is a **separate process** | **ACCEPTED** | Its input is a file. Nothing about it needs to live inside the engine. | A view is welded to an engine, and neither can be replaced alone. |
| **The file is the whole interface** | **ACCEPTED** | No channel, no protocol, no shared memory. This is also why a person with no viewer can still read the log. | A record that only one program can read, which is the same as a record nobody can check. |
| The viewer **only reads** | **ACCEPTED** | A reader that writes is a second writer to the record. | The record can be changed by the thing that displays it. |
| **There is only ever one log window** | **ACCEPTED** | Asking for the log means this session, from the beginning. A second window is never the thing that was wanted. | Windows accumulate, and the person has to work out which one is current. |
| Asking for it again **replaces it**, it does not join it | **ACCEPTED** | A terminal survives the editor closing, so a restored one is showing a session that is over. | The window that survived is the one being read, and it is the wrong one. |
| A window left from an earlier session is **put back on the current log** | **ACCEPTED** | The person left it where they wanted it. Moving it back to the current session keeps the place and drops the stale content. | Either a stale window, or a layout the person has to rebuild. |
| It **starts with the engine** | **ACCEPTED** | The user pressed a button to work, not to manage processes. | The user has to start two things and remember the order. |
| The engine can **kill it and restart it**, and the button is that control | **ACCEPTED** | A stuck view is a thing that happens. Restarting it must not mean restarting the work. | The only cure for a stuck window is to end the session. |
| It **keeps working when the engine is dead** | **ACCEPTED** | That is exactly when the log matters most. It is reading a file, so nothing stops it. | The record becomes unreadable at the moment it is needed. |
| A restart is a **fresh view, not a fresh log** | **ACCEPTED** | The session file is the default scope, so a restart lands in nearly the same place. | Restarting the window loses the history it exists to show. |
| It is **started from the command line**, and that is the only way it starts | **ACCEPTED** | The editor has nothing special to do. It opens a terminal and runs a command. | A launch path that only the editor can perform, which cannot be tested by hand. |
| **The editor integration is one command in one terminal** | **ACCEPTED** | The button opens a terminal and runs the viewer with a file. Nothing is embedded, nothing is rendered twice. | The window has two implementations, and only one of them gets fixed. |
| The **language of the viewer is free** | **ACCEPTED** | It shares nothing with the engine except a file format. | A tool choice in one program constrains an unrelated one. |

### How a record reaches the viewer

**The engine writes. The viewer reads. A wake-up is separate from the record.**

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **The engine writes the record to disk itself** | **ACCEPTED** | Completeness of the record is this layer's first duty. A record written by the viewer exists only while the viewer runs, and the engine may kill the viewer on a button. | The button that restarts the window also stops the recording, and nobody notices until the record is needed. |
| **The record never travels as a message** | **ACCEPTED** | A dropped message means a line on disk that never appeared on screen. A viewer that shows a different set of lines than the file is worse than a slow one. | Two versions of what happened, and the wrong one is the one being read. |
| A **notification may travel as a message**, carrying no content | **PROPOSED** | This is the part worth having. It says new bytes exist. Losing one costs latency and nothing else. | Nothing. The poll below already covers it. |
| **The operating system is the notification** | **PROPOSED** — file-change events | Both platforms wake a reader when a file changes. No port, no protocol, no second thing to configure. | A hand-built channel where the system already has one. |
| A **slow poll is the backstop** | **PROPOSED** | File events are missed under some conditions. A poll behind them costs one stat call. | A missed event means the window stops updating, with no way to tell. |
| **Fire-and-forget datagrams are not the transport for records** | **REJECTED** | Three reasons. They are lossy by design, which the record cannot be. A record with a large detail exceeds a datagram. On Windows a datagram sent to a port with no listener can raise an error on the sender, so it does not quite forget. | The audit trail has a hole that appears only under load. |

**On the cost, plainly.** The write happens either way, because the record must be durable.
What a reader adds is a wake-up and a read of the new bytes. Those bytes sit in the page
cache, put there by the writer moments ago. The read does not reach the disk. This is
what every log viewer does.

**And the v3 slowness was not this.** The measured cause was that back-end events triggered
front-end redraws. The rules above about independent panes are the fix for that. Transport
was never the problem.

### The filter

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The filter language is **KQL**, the one Kibana uses | **ACCEPTED** | It already says what was wanted: bare words search everything, `name: value` narrows to a column, quotes make a phrase, `and` `or` `not` combine, brackets group. A language people already know beats one invented here. | A private syntax that has to be learned, documented and defended. |
| **`/pattern/` is added, written as Lucene writes it** | **ACCEPTED** | KQL has no regular expressions, and a log window is where they earn their keep. Borrowing the notation is cheaper than inventing one. | Either no patterns, or a third way of writing them. |
| **`details:` searches the whole payload** | **ACCEPTED** | The detail of a record is where the answer usually is, and its field names differ per record. One word reaches all of it. | The only way to search a detail is to know what it is called. |
| **Column titles are always on screen** | **ACCEPTED** | A column nobody can name is a column nobody can filter on. The titles are the filter's own documentation. | The syntax needs a column name and the screen never says one. |
| One description of the columns, **rendered twice** | **ACCEPTED** | The header and the rows come from the same list, so they cannot drift apart. | Titles that stop lining up with the thing under them. |
| **Bare text filters everything** | **ACCEPTED** | The common case needs no syntax at all. | The user must learn a language to do the simplest thing. |
| **`name:value` filters one column** | **ACCEPTED** | The familiar shape. It reads as what it does. | Narrowing to one field needs a menu, and menus need a hand on a mouse. |
| **Regular expressions work** | **ACCEPTED** | The user asks for them, and a log is where they earn their keep. | The hard searches, which are the ones worth having a filter for, cannot be expressed. |
| An **invalid expression does not empty the view** | **ACCEPTED** | Half a typed expression is invalid most of the time. A view that blanks on every keystroke is unusable. | The window flashes empty while the user types, and they cannot tell an error from no results. |
| An invalid expression **says so, and keeps the last good filter** | **ACCEPTED** | The state stays honest and the reader keeps their place. | An error looks the same as a search with no hits. |
| The details pane **shows the filter syntax** when the filter needs explaining | **ACCEPTED** | The explanation belongs where the user is already looking. The pane holds either a record or the help. | The syntax lives in documentation nobody opens while typing. |

### What the window shows, and how the log is kept

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| On start the window shows **this session only** | **ACCEPTED** | It is what the user is looking at when they open it. Everything older is a different question. | The window opens on a wall of history, and the thing that just happened is somewhere in it. |
| Reaching **further back is a deliberate act** | **ACCEPTED** | Older sessions are kept, so they must be reachable. Reaching them is asked for, never given by default. | Either history is unreachable, or it is always in the way. |
| **One log file per session** | **ACCEPTED** | The session is already the default scope. Making it the file boundary means the default view is a whole file and nothing has to be searched for. | The scope the user sees and the way the log is stored disagree, and one of them has to be computed. |
| A session file that grows too large **rotates**, and the session stays one scope | **ACCEPTED** | A long session is unbounded. The file must not be. | Either a single file grows without limit, or a long session is split into pieces the view cannot rejoin. |
| **Retention** — when old logs are deleted | **DEFERRED** | Ruled to be decided later. Nothing in the design depends on the answer yet. | Nothing now. It becomes real the first time a disk fills. |
| The log holds **log messages only** | **ACCEPTED** | v3 puts notes in the log. A note is work, and how work is shown is decided where work exists. Level 0 has no notion of work at all. | The log fills with things that are not calls, and the level acquires a concept it must not hold. |

### How a log line looks

**Keep it small.** A terminal does not need a design system. It needs a few colours used
consistently.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Columns: **time, source, kind, message, and a mark** | **ACCEPTED** | It is what v3 shows, minus the part below. It reads well at a glance. | Each writer decides what a line looks like. |
| **Kind and source each get a colour** | **ACCEPTED** | These are the two things the eye scans for. Colour is the cheapest way to scan. | Every line looks the same, and finding the one that matters means reading all of them. |
| **Time is grey** | **ACCEPTED** | Always present, rarely the thing being looked for. | The least interesting column competes with the most interesting one. |
| The **link column is dropped** | **REMOVED from v3** | It is not needed any more. | Nothing. A column that costs width and earns nothing. |
| **No styling system for the terminal** | **ACCEPTED** | A stylesheet for a terminal exists and is not worth it here. A short palette is the whole requirement. | Effort spent on a system where a list of five colours does the job. |

---

## Voice and standing behaviour

**How the agent speaks and behaves is Level 0.** It binds every turn, including turns with
no work at all. It is the floor of manner, as the floor of action is a floor.

**Guidance is not here.** Guidance applies to a piece of work, and Level 0 has no work. What
the agent must know for a task rides the task. What the agent must always be rides here.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The **standing layer holds voice and general behaviour only** | **ACCEPTED** | These are the rules with no task to attach to. Everything with a task attaches to the task. | Either manner depends on what is being worked on, or the floor is copied into every guidance document. |
| The standing layer is **small, and its size is budgeted** | **ACCEPTED** | It is paid on every turn. The standing prefix is a measured complaint about v3, and a rule with no owner grows. | The prefix tax returns, one reasonable addition at a time. |
| **MEASURED, AND THE NUMBER IS THE OWNER'S** | **SPIKE**, wk-23801b6603 | EVERY FIGURE HERE HAS THE COMMAND THAT ANSWERS IT, because a number in a design document with nothing behind it outlives everybody who could have checked it. `uvx --from tiktoken python util/checks/count-standing.py .` answers **one turn carries 5,506 tokens** of standing layer, cl100k_base, which is not this host's own encoding and is the nearest reproducible one. The same command against a worktree at **c28e87d8** answers **5,502**. SO THE SPLIT HAS BOUGHT NOTHING YET, AND THE LAYER IS 4 TOKENS LARGER THAN BEFORE IT. The case studies leaving behaviour.md took text out, and rules added to behaviour.md since have put more back, and the two cannot be separated from here because nothing was committed between the split and this reading. What would separate them is a commit at the split, and there is not one. THE CEILING PUT TO THE OWNER: 6,000, and a rule added above it is paid for by one removed. WHAT STILL OWES A NUMBER is the other half, whether a rule in this layer changes behaviour at all, which is wk-69150c6d69 and is the half that should decide the ceiling. | A budget nobody set is a budget nobody meets. |
| The standing layer is a **projection** of the guidance corpus | **ACCEPTED** | It is assembled from documents that are authored elsewhere. See Projection. | Two places state the voice rules, and they disagree within a month. |
| **Delivery is not enforcement**, and this layer says which it is doing | **ACCEPTED** | Rules in a prompt change behaviour some of the time. Claiming more is the error that makes the gap invisible. | The rules are believed to be enforced, so nobody measures whether they hold. |
| **Written artefacts are checked at the write path** | **ACCEPTED** | That is where interception exists. A refusal names the rule and the place. | Voice rules apply to conversation and not to the record, which is the part that lasts. |
| Only the **mechanical tiers** may refuse a write | **ACCEPTED** | Pattern and vocabulary checks are reproducible. Judgement is not, and a refusal that cannot be reproduced is an obstacle rather than a rule. | Either judgement blocks work unpredictably, or nothing blocks at all. |
| **Never state what does not exist** | **ACCEPTED** | An absence is not actionable. Naming a thing that is not there is the only way the agent learns it might be, and then it looks. | The prompt teaches the vocabulary of things the agent then hunts for. |
| **Never narrate the machinery** | **ACCEPTED** | That the engine is running, that the session is recorded, that a person can read along. None of it changes what the agent does next. | Every prompt grows a preamble, and the preamble is paid for on every turn. |
| Every line must **change what the agent does next** | **ACCEPTED** | It is the admission test for the standing layer and the kickoff alike. A line that fails it is background, and background belongs in guidance a state asks for. | Text that is true, well written, and worth nothing. |
| **A voice rule that cannot be checked is not admitted to this layer** | **ACCEPTED** | The standing layer is the enforceable floor. Unenforceable advice is guidance, and guidance has a place. | The floor fills with sentiment, and its size budget is spent on text nothing can verify. |
| **The answer arrives whole, or not at all** | **ACCEPTED** | A short message that announces a finding and then goes quiet for minutes is worse than silence. The reader has been told an answer exists and is made to wait for it. Do the work, then write once. | The user is teased with a conclusion and left holding it, which reads as withholding rather than working. |
| **No message before work that a reader could mistake for the answer** | **ACCEPTED** | Silence while working is honest. A fragment is not. If something must be said first, it is a blocker or a change of direction, and it says which. | Every task grows a preamble, and the preamble is the part that arrives fastest. |
| This one is **delivery, and it is measured** | **ACCEPTED** | The shape is only partly mechanical: a short message immediately before a long run of work, carrying a claim marker and no claim. The rest is counted by sampling. | It is written down as a rule and never checked, which is how the last three attempts at it failed. |
| **Conversation is measured, not guarded** | **ACCEPTED** | Sample the record, run the checker, count findings. This is the method that produced the earlier measurement, so the number is comparable. | Adherence in conversation is an impression, and impressions do not show a trend. |
| **Stop-time inspection is the fallback** | **ACCEPTED** | The stop event carries the path to the session record and can refuse the stop with a reason the agent reads. That is enough to catch a breach in the same session. | A breach is found in the retro, long after the turn that could have fixed it. |
| **OPEN** — whether the message-display event can refuse | **SPIKE, already recorded** | The event exists and fires while assistant text is displayed. Whether a refusal there is honoured is undocumented, so it is measured rather than assumed. | The design either over-promises a live guard or gives up one it has. |

---

## Launch

**From idle to a ready agent.** Idle means the extension is loaded, the welcome page is
shown, and nothing runs. Launch is what one button does from there.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **One button starts everything**: engine, log window, agent | **ACCEPTED** | Three presses in a fixed order is a procedure, and a procedure a person performs is a procedure they can get wrong. | The person learns an order, and the order is the first thing a newcomer gets wrong. |
| The engine is **not the tool server**, and it starts first | **ACCEPTED** | The tool server is started by the harness for one agent client. The engine must exist before any agent. It answers guards that are separate processes with no client. It is one per folder, and it runs with no agent at all. | The record starts at the first tool call, guards have nothing to ask, two clients make two engines, and nothing runs by hand. |
| **Startup order is never a question put to a person** | **ACCEPTED** | v3 asks the person to reload the window when the engine came up after the agent. A tool that knows what went wrong and asks anyway has moved its problem to the user. | The person learns an internal ordering rule and pays for it every session. |
| The lane is reached through a **stub that finds the engine or starts one** | **ACCEPTED** | This is what makes the order not matter. An engine that comes up late is then no different from one that was always there. | Every launch has a correct order, and every wrong order is the user's to notice. |
| Until the stub exists, **there is nothing to warn about** | **ACCEPTED** | A warning about a lane that does not exist is noise, and noise trains people to dismiss warnings. | A dialog nobody can act on, appearing every time. |
| **The heartbeat is not a record** | **ACCEPTED** | It says nothing happened. It goes to whoever started the engine, on its own output, and never into the log. | The log fills with nothing happening, which is how a log stops being read. |
| **One button**, and it acts on the folder that is open | **ACCEPTED** | The user has already chosen the folder by opening it. Asking again is asking a question with one answer. | A second choice to get wrong, and a way to cage the wrong tree. |
| **The cage is set before the agent can act** | **ACCEPTED** | An agent that acts first and is caged second has already done the thing the cage exists to prevent. | The cage is advisory for the length of one turn, which is the turn that matters. |
| **The engine is ready before the agent is started** | **ACCEPTED** | A tool server that answers late looks to the agent like a tool server that is broken. | The first calls fail, and the agent works around the failure. |
| The output style is **set, not offered** | **ACCEPTED** | A style a person has to choose is a style most sessions run without. The cage sets it. | The voice rules are delivered and not in force, which is worse than absent because it looks done. |
| **One command for every event** | **ACCEPTED** | The event names itself in the input. The cage lists eleven events and one program, so adding an event is a line rather than a program. | A guard per event, and eleven places for the same bug. |
| A guard **started by the harness cannot find the method root** | **ACCEPTED** — the cage carries it | It runs from wherever the harness is. The cage is itself a projection, and a projection knows both roots. | The guard guesses, and guesses wrong on every machine but the author's. |
| A guard **appends to the session that is running** | **ACCEPTED** | It is a separate process for one event. A second file would split the record in half. | One record per event, and no way to read the session as one thing. |
| **One kickoff text, in one file**, used by every launch path | **ACCEPTED** | v3 already does this, because the wording forks the moment there are two copies. | Two launch paths tell the agent two different things. |
| Level 0 ends at **ready**, which is a condition and not a place | **ACCEPTED** | Level 0 has no places. Preparation is done, and where the agent then stands is another level's question. | A resting place is defined here, and every level above inherits it whether it fits or not. |
| **A ready agent says so**, in one short message | **ACCEPTED** | The user pressed a button. Silence and success look the same. | The user waits for something that already happened. |
| **Budget: 15 seconds** from the press to ready, on the reference machine | **ACCEPTED** | It is the difference between a tool and a wait. A number that is not stated is not met. | Startup cost grows one step at a time and nobody owns the total. |
| The **preparation payload is prepared**, not discovered | **ACCEPTED** | What the agent must know at ready is known before the button is pressed. The engine hands it over in one piece. | The budget is spent on a read loop, and the number is unreachable by construction. |
| **Two harnesses.** The Claude extension is preferred. Copilot is supported | **ACCEPTED** | The user works in the editor, and the editor has both. Supporting one makes the tool depend on a choice the user may not have made. | Half the users cannot run it, and the design has no way to find out which half. |
| **Preference is detected, recorded, and can be overridden** | **ACCEPTED** | Installed is not the same as usable. A recorded choice can be read back and corrected. | The launch guesses again every time, and a wrong guess has no cure. |
| **Missing features on the fallback are named at launch** | **ACCEPTED** | An absent capability found in the middle of work looks like a failure of the work. | A degraded run is indistinguishable from a broken one. |
| **OPEN** — which of the ten portable hooks the editor integration carries | **SPIKE** | The portable set was measured on the command-line hosts. The in-editor integrations are a different surface, and the answer is not assumed. | The launch promises a cage the editor cannot enforce. |

---

## First build

Level 0 ships as an editor plugin. From its first version it carries **both roots**: the
tree being worked on, and the tree the method comes from.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Both roots from the first version | **ACCEPTED** | Retrofitting a second root means reversing every path decision made in between | The system can only ever work on itself. That is the case it is least meant for |
| **One engine, no question. Several, the editor asks at startup** | **ACCEPTED** | The common case costs nothing. The rare case is one choice, made once | Either a prompt nobody needs, or a silent guess between engines |
| Level 0 is buildable before anything above it | **ACCEPTED** | It knows only an authority, a last answer, and identities. None of the levels above leak into it | The first build waits on decisions that have not been made |

---

## The floor, and emergency mode

Level 0 asks an authority whether a call may proceed. **The floor is what is permitted
regardless of the answer** — including when the answer is no, and when nothing answers.

**Why it exists.** If every action needs an authority, a broken authority means no action.
Three concrete cases show it. A position declares its permitted set wrongly, a declaration
is malformed, or an authority answers nonsense. Without a floor the agent is somewhere it
can neither inspect nor leave.

**The floor is to diagnose and report. It is not to repair.** When the daemon is dead and
cannot restart itself, the recovery path is the person. The agent does not have to fix
anything. It has to notice that it is stuck, and say so.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The floor is **look and shout** | **ACCEPTED** | Read enough to understand the situation, and get a message out. Nothing that changes the world. | Either the agent cannot report a problem, or the floor grows into the real permitted set. |
| No policy may deny a floor entry | **ACCEPTED** | A floor a policy can override is a default, and the bug case walks straight back in. | The one case the floor exists for is the case it does not cover. |
| Every floor use that policy **would have denied** is recorded | **ACCEPTED** | A permanent bypass nobody counts is a bypass nobody notices. | The floor becomes the quiet way around every rule. |
| **Emergency mode** widens the floor, and only the owner may enter it | **ACCEPTED** | Repair needs powers the floor deliberately lacks. v3 has this already — the walk's hold on open work releases when emergency is armed. Rule 1 decides who may arm it. | Either the floor is wide enough to repair with, which makes it a standing bypass, or a broken system cannot be repaired from inside. |
| Emergency mode is **bounded, announced and marked** | **ACCEPTED** | Break-glass is legitimate when it is time-bound, visible while active, and every act under it is marked. | It is armed once and never disarmed, and nothing afterwards can tell what was done under it. |

**The test the floor has to pass:** with the daemon dead, can a person diagnose what
happened and recover? If not, the floor is too small, and the pressure to widen it wins.

## Configuration

**Three files, and the writer decides which.** The floor is the method's. The project's is
the owner's. The surface is the editor's, because that is the only place the editor can both
read and write.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **The floor is in the program, not in a file** | **ACCEPTED** | A floor a file can delete is not a floor. | The minimum is reachable by editing a file, or by deleting one. |
| Later layers may **narrow, never widen** | **ACCEPTED** | A guard may be turned on and never off. A budget may be made smaller and never larger. | Configuration becomes a way to ask for fewer rules. |
| **Each value says where it came from** | **ACCEPTED** | The first question about a surprising setting is which file did this. | Three files, one answer, and no way to find which produced it. |
| A file that **cannot be read is skipped** | **ACCEPTED** | One bad file must not stop the machine from working. | A typo in a setting takes the whole system down. |
| The surface lives in **the editor's own settings file** | **ACCEPTED** | It is interface state, and it is the only file the editor both reads and writes. | The interface keeps its state somewhere the interface cannot reach. |

---

## Emergency mode

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Emergency mode widens the floor** | **ACCEPTED** | Repair needs powers the floor deliberately lacks. | The only way to fix the guard is to go around it. |
| It **says who armed it and why** | **ACCEPTED** | A wider floor is worth having only if it is attributable. | A period with no rules and nobody attached to it. |
| It **ends on its own** | **ACCEPTED** | Half an hour by default, four at most. A mode that has to be turned off is a mode left on. | Emergency becomes the normal state, quietly. |
| Everything done while armed is **marked as such in the record** | **ACCEPTED** | The retro needs to tell repair from ordinary work. | The record says a rule was broken and cannot say it was allowed. |

---

## The tool lane

**A stub, and it holds no rules.** It is what the harness starts. Everything it is asked, it
asks the engine, and what the engine answers is what the agent gets.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The stub **holds no rules** | **ACCEPTED** | Two places that can answer the same question will eventually answer it differently. | The lane becomes a second engine, with its own version of the truth. |
| It finds its engine **through the register** | **ACCEPTED** | Nothing is compiled in, and an entry that no longer resolves is skipped. | The lane works on the machine it was built on. |
| It **echoes the protocol version** the client asked for | **ACCEPTED** | Choosing one here is how a stub stops working when a harness moves on. | A version number that has to be chased. |
| The engine **owns the record**, and the stub asks it to write | **ACCEPTED** | One writer, one format. | A second writer with its own idea of what a record looks like. |
| The lane is **a projection like any other** | **ACCEPTED** | Where the stub lives differs per machine, and the projector already knows. | The lane configuration is written by hand on every machine. |

---

## Copies, and the projects they drive

**The purpose is to work on projects that are not this one.** Three things make that work,
and all three are this layer's.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A copy has an **identity of its own**, made on first use | **ACCEPTED** | Two copies of the same method are two things. A name they share cannot tell them apart. | The register holds one entry per product rather than one per copy. |
| A project records **which copy drives it, by identity** | **ACCEPTED** | An identity survives either tree moving or being renamed. A path survives neither. | v3's exact failure: a driver is recorded and can never be resolved. |
| The **register turns an identity into a place** | **ACCEPTED** | It is the only indirection needed, and it already exists. | Either the path is stored, or nothing can be found. |
| An identity **not on this machine is a fact, not an error** | **ACCEPTED** | The copy may simply be somewhere else. Saying so is useful. Failing is not. | Opening a folder somebody else worked on is an error condition. |
| A copy carries the **method and nothing else** | **ACCEPTED** | No version history, no private material, no built programs, no identity. It builds and identifies itself. | Someone else's records ship inside their tool, and two copies claim one identity. |
| **`.se/` is the marker** that a folder is a project | **ACCEPTED** | It already holds the record and the parameters. One private folder, one meaning. | A second marker file whose only job is to exist. |
| A folder becomes a project **on the first start**, with no ceremony | **ACCEPTED** | The marker is written, and it says which copy did it. Nothing is declared. | A registration step between the user and the first useful action. |

---

## The end to end test

**One command proves the story, with no agent and no model.**

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The **whole story is one command**, and it is hand-runnable | **ACCEPTED** | Produce a copy, register it, drive a fresh project with it, check what came out. Parts working alone prove nothing about the story they exist for. | The one thing the system is for is the one thing nothing tests. |
| It checks **what did not happen** as well as what did | **ACCEPTED** | That the copy did not write into itself, and that nothing was written back into the tree it came from. Separation is only proved by the absence. | The trees leak into each other and every check still passes. |
| It runs **against a redirected register** and leaves nothing behind | **ACCEPTED** | A test that touches the real machine is a test people stop running. | Running the test changes the machine it is testing. |
| It reports **step by step**, not pass or fail | **ACCEPTED** | A failure names which of the eleven claims stopped being true. | One red line, and the same investigation every time. |

---

## Read evidence

**What an agent has read is a fact about this session.** It is kept with the session, and it
is thrown away when the session's memory is.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A read is **recorded with what the file said** | **ACCEPTED** | A hash is what makes a later change detectable. Without it the record says a file was read and not which version. | Evidence that cannot tell a current read from a stale one. |
| **Compaction resets it** | **ACCEPTED** | The agent no longer holds what it read, so the record of having read it is no longer true. | The system believes the agent knows something it has forgotten. |
| A **write to a file drops the read** of that file | **ACCEPTED** | What was read is no longer what is there. | Stale knowledge counts as current, and the write that invalidated it is the one that hid it. |
| A **configuration change resets it** | **ACCEPTED** | What was read was read under rules that no longer hold. | Evidence gathered under one policy is used under another. |
| It is **evidence, not permission** | **ACCEPTED** | Nothing here refuses anything. Level 0 records, and whether a read is required before an action is a question about work. | A dedup rule at the layer that cannot know what the work needs. |
| Evidence is **never the reason a machine stops** | **ACCEPTED** | A file that cannot be read is an empty set. | One unreadable file takes the session down. |

---

## Identity

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Every call carries an identity**, and the record says which | **ACCEPTED** | Every per-agent rule above depends on telling two hands apart. This is v3's exact gap. | One dispatcher serves every agent and nothing can attribute anything. |
| The **harness says who is calling** | **ACCEPTED** | The agent does not write that field, so it cannot claim another. The guarantee comes from where the field comes from, not from a check here. | A check that looks like a guarantee and is not. |
| An identity the harness starts is **registered** | **ACCEPTED** | So the record can say what kind of agent it was and when it first appeared. | A name in the log that means nothing to a later reader. |
| An **unknown identity is recorded, not refused** | **ACCEPTED** | A harness that names its agents differently would otherwise be unusable, and the threat model here is a confused agent rather than a hostile one. | The tool works on one harness and refuses everything on the next. |

---

## Liveness

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The daemon is watched by **heartbeat** | **ACCEPTED** | Unreachable and slow look the same from one call. | A dead daemon is discovered one refused call at a time. |
| Dead and unable to restart cleanly means **tell the person** | **ACCEPTED** | The recovery path is the person, which is what keeps the floor small. | The agent tries to repair the thing that governs it. |

## Prior art

Checked before building, against the bodies of practice this layer resembles.

| Body | Verdict |
|---|---|
| Reference monitors — complete mediation, tamperproof, small enough to analyse | Two of three are **not met and will not be**. A hook filters above the resource, and runs in the same trust domain as the thing it constrains. Accepted: the threat model is a confused agent, not a hostile one. |
| Policy engines with a declarative language | The decide-and-enforce split is adopted. The language is not. This policy is workflow legality, not access control. |
| Syscall interposition | The time-of-check-to-time-of-use warning is taken, and answered by the atomic check-and-write. |
| Audit logs with hash chains and an external witness | **Rejected.** That is tamper evidence. This record exists to explain change, not to resist forgery. |
| Optimistic concurrency | Adopted, with a content hash rather than a timestamp as the token. |
| Capability security | The confused-deputy risk is real and accepted. Helpers carry an identity, not a scoped handle, because we spawn them. |
| Break-glass practice | Adopted as emergency mode, with the bounded, announced and marked discipline it prescribes. |

---

## Configuration

Every level is configurable, this one included.

**Authored configuration and system-written state are different things and must not share
a file**. One written by a person and a program alike gets clobbered. Neither side can
tell an intentional change from a stale one. Three kinds, by who writes them:

| Kind | Written by | Travels | Holds |
|---|---|---|---|
| Configuration | the owner | with the copy | switches, budgets, ceilings |
| Machine-local override | the owner | no | what legitimately differs between the machines a person works on |
| Interface state | the system | no | what a surface remembers across restarts. v3 calls this "settings", which is what made it look like configuration. It is neither authored nor a channel. |

**Resolution order:**

```
built-in defaults → configuration → machine-local override → unit overlay → interface state
```

**Overlays may only narrow, never widen.** Config sets ceilings. Every later layer can
reduce and none can raise. The always-allowed floor is the one thing that does not move:
ceilings narrow downward, the floor is a hard minimum. This is what makes the chain safe
to audit. A unit can be stricter than its vehicle, never looser, so no overlay needs
checking for privilege escalation.

**An overlay is a diff. A record is not**. Whatever unit a level overlays must stamp the
**resolved absolute values** when it opens. Not the diff, and not a pointer to the config
file.

Once the base config changes, a pointer can no longer say what was in force. Past policy
would be reconstructed from present configuration. A pointer to something mutable is not a
record. Which unit gets overlaid is decided by the level that owns it. Level 0 owns only
the resolution order and the narrowing rule.

The overlay layer belongs to whichever level owns the unit it overlays. Level 0 owns only
the resolution order and the narrowing rule.

### What is settable at Level 0

A setting must name what breaks if it is *not* settable. Applying that test:

| Setting | Settable | Why / why not |
|---|---|---|
| Read size clamp | **yes** | Context budgets differ per harness and model. Fixed, one number is wrong for every vehicle but one. |
| Helper compression ratio (default 1:10) and its absolute floor | **yes** | Delegation jobs differ in kind. Too tight blocks a legitimate large digest. |
| WIP limit on human-assigned tokens | **yes** | Depends entirely on how much the human can absorb. |
| Landing injection byte ceiling | **yes** | Vehicles differ in how much bootstrap they need. Fixed, a larger vehicle cannot land. |
| Hook timeout | **yes** | A cloud box and a laptop are not the same machine. Fixed and too low, a slow machine denies everything. |
| Stop-policy **ceiling** | **yes** | An autonomy cap a click cannot exceed. The current value stays UI state. Only the cap is config. |
| Loop-breaker threshold | **no** | Nothing breaks if it is fixed at three. A knob nobody moves is a branch nobody tests. |
| Daemon-unreachable behaviour | **no** | Fixed at deny-closed. A config that can open the cage is not a cage — and under narrowing-only there is nothing stricter to move toward. |

---

# Part 1 — the portable set

Present on both Claude Code and Copilot CLI. These may be load-bearing.

## `PreToolUse`

Fires after the model emits a call, before it executes. Can `allow` / `deny` / `ask` with a
reason the model sees, or rewrite the call before it runs. Tool-name matchers.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Path scoping | **REJECTED** | The system is self-hosting — the agent legitimately edits the engine that runs it. The correct version already exists as engine state (`actbound.ts`): the bound travels with the act, and *which* tree is asked rather than assumed. | Nothing. It cannot name a failure, so it is not admitted. |
| Write refused when the file changed since it was read | **ACCEPTED** — refused, never corrected | More than one editor works over these files. A stale write cannot be auto-corrected, because we do not know what was intended against content the agent has not seen. | Collisions: a second editor's change silently overwritten, and the agent overwriting its own stale read within a session. |
| Read size clamp | **ACCEPTED** — corrected, not refused | The correction is unambiguous, so it needs no agent decision. Pagination becomes automatic. | Oversize reads either blow the context or come back silently truncated. |
| The check and the write are **one atomic step**, keyed on a **content hash** | **ACCEPTED** | A gap between checking and writing reintroduces the race the check exists to close. Size and timestamp also miss a change that restores the earlier length. | The guard passes and the collision happens in the gap. |
| Writes made through the shell are **not guarded**, and are accepted | **ACCEPTED** | A shell call reaches the filesystem without the file guards. Documented evasions of this kind of check include command substitution, `eval`, `find -exec` and backgrounding. Everything is logged, and the retro decides whether a pattern needs an answer. | Either a rule that is quietly false, or a sandbox this threat model does not need. |
| Never-delete | **REJECTED** | Deletion is legitimate work. The log makes it recoverable-by-audit. | Nothing. |
| **The floor** — a small set no authority may deny | **ACCEPTED** | See the section below. It is the minimum needed to diagnose and report, not to repair. | A bug in a layer the agent cannot reach leaves it unable to say so. |
| Every floor entry passes the admission test **individually** | **ACCEPTED** | A floor entry is a permanent exemption in every position that will ever exist. It earns that separately, never by association. | The floor accretes convenience verbs and the permitted set stops meaning anything. |
| A refusal reads as a **fact, never as a policy** | **ACCEPTED** | "Hash mismatch, re-read first" is a fact. "This is not permitted" is policy vocabulary. Measurement shows such vocabulary in front of a model amplifies fabricated policy refusals, from 0.25% to 3.95% in one study. | The agent invents rules that exist nowhere and refuses on their authority. |
| Permission check | **ACCEPTED** — answered by the authority, floor always permitted, no authority → permitted | Level 0 asks "is this call permitted right now" and enforces the answer. It never learns what makes it permitted. Extending the check to natives is what makes re-enabling them safe. | Un-denying the natives removes every check. The cage becomes advisory. |
| Read dedup | **ACCEPTED** — per-agent read set `{path → hash}` | The model's context already is the cache. An unchanged re-read pays twice for the same tokens. Hashing at check time means owner edits are caught without a watcher. | Redundant reads inflate every turn, and the context fills with content it already holds. |
| `Bash` requires a stated reason | **ACCEPTED** — as a replacement verb under rule 6 | Shell use is where the agent improvises. The reason is what makes it learnable later. Native `Bash` has no field to carry it, so this is one of the few verbs that earns a place in the MCP surface. | Unexplained shell calls in the record — nothing to learn from, no way to spot a pattern. |
| WIP limit on the human queue | **MOVED TO LEVEL 1** | Mechanically a counter, but the thing counted is a work token and the queue is an assignee's. Level 0 has no vocabulary for either. | — |
| A read cache in the hook | **REJECTED** | A `PreToolUse` hook can deny or rewrite but cannot return a result. Faking it by stuffing content into a deny reason records a cache hit as a refusal. | Nothing — dedup covers the need honestly. |
| Hot server, no process spawn | **ACCEPTED** | The hook gates every call. 605 lane calls in a turn would mean 605 spawns. | Per-call process spawn becomes the new bottleneck — the same class of defect this layer exists to remove. |

Needs a hard timeout, since the hook now gates every call.

## `PostToolUse`

Fires after a tool returns. Sees input and result.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Result half of the log | **ACCEPTED** | `PreToolUse` records the request. The result must be recorded where it exists. | With natives enabled, results are invisible. The record shows calls with no outcomes. |
| Read-set bookkeeping | **ACCEPTED** | The dedup guard needs hashes of what was actually read, not what was requested. | Dedup runs on intent rather than fact and denies reads that never landed. |
| Label tool-side truncation | **ACCEPTED** | Our clamp is not the only truncator. | Silent truncation reaches the model unlabelled — the failure honest-truncation exists to prevent. |
| `decision: "block"` on results | **REJECTED** | The tokens are already spent. Blocking discards a paid result. | Nothing — prevent it in `PreToolUse` instead. |

## `UserPromptSubmit`

Fires on owner input, before the model sees it. No matchers.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Inject state **version** only | **ACCEPTED** | State, legal tools and legal MCP tools change as the result of a *pull*, never of a user prompt — the pull's output is the carrier. This is a drift detector: a matching version costs one token and does nothing. | Drift after an interrupt or resume is only caught on the next pull. |
| Inject the full state or packet | **REJECTED** | Duplicates the pull's output and can go stale between them. | Nothing. A stale injection is worse than none — the agent becomes confidently wrong. |
| Record the human turn in the log | **ACCEPTED** | The log holds every agent call and nothing the human said: the answers without the questions. | The record cannot explain why anything was done, which is the system's stated purpose. |
| Blocking the prompt | **REJECTED** | Rule 1. | Nothing. |

**Privacy:** user prompts are private data. The log is private data, so this is fine. But
anything derived from the log inherits private tier permanently. It can never source a
shareable digest without a filtering step.

## `SessionStart`

Fires at session begin, with a matcher on the reason. **No per-reason procedures** — the
reason resolves to two mechanical bits.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Invalidate read set when context did not survive (`startup`, `clear`, `compact`) | **ACCEPTED** | The dedup guard's premise is "the content is already above." After a wipe that premise is false. | The agent asks for a file, is told it already has it, and does not. A silent wrong answer. |
| Keep read set on `resume` | **ACCEPTED** | Context is intact, so the premise holds. | The agent re-reads everything it still holds — a pure token loss. |
| Tell the authority "new session" on `startup` only | **ACCEPTED** | Level 0 reports the fact. What a new session means is the authority's business. `clear` and `compact` are the same session and are not reported as new. | The authority cannot distinguish a fresh session from a wiped context, and resets the wrong things. |
| Reap zombie sessions | **ACCEPTED** | Most sessions do not end cleanly, so `SessionEnd` cannot be relied on. Startup is the only place a stale session is guaranteed to be noticed. | Dead sessions accumulate and are indistinguishable from live ones. |
| A `resume`-specific procedure | **REJECTED** | The authority already re-obliges a re-read when its material moves, regardless of entry reason. | Nothing. |
| Byte ceiling on the landing injection, tested | **ACCEPTED** | Paid at every session start forever. This is where prefixes accrete. | The landing banner grows unwatched and becomes the next prefix tax. |

## `SubagentStart`

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Apply the same guards to helper calls | **ACCEPTED** | Claude Code subagents inherit the parent's denies. Copilot subagents do not. | The uncaged twin — a helper that can do everything the cage forbids. The one hole big enough to walk the whole cage through. |
| Establish an **agent identity** at start, carry it on every call | **ACCEPTED** | Every permission question becomes `(action, identity)`. What identities mean is Level 1's business. Level 0 only guarantees each agent has one and cannot forge another's. | Without it, one dispatcher serves every agent and nothing can tell two hands apart. That is v3's exact gap, and the reason every per-actor rule above it is unenforceable there. |
| Fresh read set per agent | **ACCEPTED** | Helpers do not read the same things as the main agent, and neither one's reads are "above" for the other. | Dedup either forces redundant reads or denies a read of content the agent does not hold. |

What identities exist and who may assign work to whom is Level 1. Level 0 owns only that
an identity exists, is carried, and cannot be forged.

## `SubagentStop`

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Compression budget as a **ratio** of bytes returned to bytes read | **ACCEPTED** — overridable per delegation | A ceiling punishes a helper given a small job. A ratio measures the thing actually wanted. | A helper returning raw content moves the tokens into the parent's context with extra steps and a delay — today invisible, looks like a slow turn. |
| Absolute floor when nothing was read | **ACCEPTED** | The ratio is undefined for a helper that only reasoned or searched. | A whole class of helpers is unbudgeted. |
| Content contracts (must cite file:line) | **REJECTED at this level** | Domain judgment. Belongs in the engine. | Nothing here. |
| Bounded retry on forced continuation | **ACCEPTED** | The harness overrides a hook that blocks more than ~8 consecutive times. | A retry loop the harness silently breaks — a guard that looks like it works. |

## `Stop`

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Hard block when the authority reports outstanding obligations for this identity | **ACCEPTED** — no override | Level 0 asks "may this identity stop". The authority answers. Per-identity, not global, so one agent's outstanding work never blocks another's stop. | An agent walks away from work the authority is still counting, and the abandonment is invisible. |
| Soft challenge on the first stop since the authority's answer last changed | **ACCEPTED** — granted on second ask | Agents stop without a reason. This forces the reason to exist without evaluating it (rule 3). Keyed to the answer version, so it re-arms whenever the situation moves. | Keyed to anything coarser, a long session gets one challenge ever and the reminder decays to nothing. |
| The authority computes the stop decision — Level 0 enforces it | **ACCEPTED** | v3's hook interprets policy names itself (`if (notch === "blockers only" ...)`). That is Level 0 reading vocabulary it should not know. The answer should carry a decision and a reason, already computed. | Policy semantics live in two places and drift. Adding a policy value means editing the hook. |
| A repeatedly blocking stop must **notice it is doing so and relent** | **ACCEPTED** | The harness overrides a hook that blocks too many times consecutively. So an unbounded block is not a stronger guard — it is a guard that stops existing without saying so. | The block cap is hit silently. Plausibly what froze the chat before. |
| The record names **which rule decided** | **ACCEPTED** | A refusal without its cause cannot be analysed later. | The log shows that something was refused and never why. |

**Stop policy — where it lives.** The names and semantics of a stop policy stay above
Level 0 entirely. Level 0 owns three things about it. The **ceiling** is configuration — an
autonomy cap a click cannot exceed. The **current value** is interface state, and the
**enforcement** is whatever decision the last answer carried. With no authority present,
every stop is permitted.

## `PreCompact`

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Invalidate the read set | **ACCEPTED** | Compaction destroys the dedup guard's premise, same as `clear`. | The agent is told it holds content compaction removed. |
| Warn the agent to save what it needs | **OPEN — verify first** | Only works if the agent gets a turn between the hook firing and compaction. | If there is no turn, the warning is unactionable and creates false confidence. |
| Make context reconstructible instead of preserved | **ACCEPTED as the preferred design** | If everything that must survive lives with the authority and the read set with Level 0, compaction costs nothing. Preservation schemes rot. Reconstruction does not. | Every compaction becomes a recovery problem. |
| Block compaction | **REJECTED** | Running out of context is strictly worse. | Nothing. |

## `PostToolUseFailure`

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Everything reaches the log | **ACCEPTED** | Interpretation happens later (rule 7). The record must be complete first. | Failures are the thinnest and most valuable part of the record, and they go missing. |
| Loop breaker on repeated identical `tool_input` | **ACCEPTED** | Mechanical: a counter over input hashes, no domain knowledge. | The agent retries a broken call until the turn dies. |
| Separate **rejection** (our guard said no) from **failure** (the tool broke) | **ACCEPTED** | Different causes, different remedies. | One bucket makes both unanalysable. |

## `Notification`

Matchers on notification type. **Both events are forwarded to the engine as signals. The
engine decides what happens, including transport.**

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Forward `idle_prompt` to the authority | **ACCEPTED** | Idle-only work needs a trustworthy idle signal, and only the harness knows. | Anything that must run only when nothing is in flight runs at the wrong time, or never. |
| Forward `permission_prompt` to the authority | **ACCEPTED** | It fires exactly when the agent is blocked on a human decision. | Being blocked on a human is invisible until someone looks. |
| Level 0 decides transport, batching or content | **REJECTED** | Rule 2. Level 0 forwards a signal. What to send, to whom, batched how, is the authority's — and the privacy rules live there. | Transport and privacy split across two places and drift. |

**Privacy:** this is the only path that sends data off the machine. An opaque identifier and the fact that
something waits — yes. Prompt or file content — never.

---

# Part 2 — the optionals

Claude Code only. Under rule 8 these are optimizations and may never be load-bearing.
**Three of nineteen adopted.**

## `StopFailure`

Fires when a turn ends due to an **API error** — not when a Stop hook fails. Typed
`error_type` matcher: `rate_limit`, `overloaded`, `authentication_failed`,
`billing_error`, `max_output_tokens`, `server_error`, `invalid_request`,
`model_not_found`, `unknown`.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Log the ending with its `error_type` | **ACCEPTED** — degrade to `unknown` where unsupported | `stopping-layer.ts` returns `unknown` when nothing observed says which layer ended a call. This is a class of ending nothing currently observes. `max_output_tokens` in particular is self-inflicted. | Self-inflicted endings keep being diagnosed as `unknown`, and the one class the agent could fix looks identical to the one it cannot. |

## `ConfigChange`

Fires when an external process or editor modifies a settings file mid-session. Matcher on
`source` (`user_settings`, `project_settings`, `local_settings`, `policy_settings`,
`skills`), receives `file_path`, and can block the change except for policy settings.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Reset read-evidence for the changed files | **ACCEPTED** | Targeted invalidation: read-evidence for a settings file that just changed is stale by definition. Mechanical, so legitimately Level 0. | The agent holds read-evidence for config that no longer says what it read. |
| Record the change | **ACCEPTED** | The startup check compares the rendered source against the installed copy, so a stale cage is caught **at startup**. A change *during* a session is not. | The cage silently stops being the cage that was verified, and nothing says so. Same family as "advisory on VS Code and nobody noticed". |

## `SessionEnd`

Fires on termination, matcher on reason. Notification only. **All SessionEnd hooks share a
1.5-second budget**, so teardown must be cheap.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Write the lifecycle line and tell the authority the session ended | **ACCEPTED** — best-effort only | The daemon is detached and does not exit with the session, so nothing else tells it. | A clean end is only noticed at the next startup's zombie reap, and diagnosis falls through to `unknown` in the meantime. |

**Most sessions do not end cleanly**. This hook is a latency optimization on top of a
mechanism that must exist anyway. Startup zombie reaping is the guarantee, this is not.

## Rejected

| Hook | Why not |
|---|---|
| `PostToolBatch` | Cannot name what breaks. Coalescing renders here would make the engine's render loop depend on a non-portable hook firing — rule 8. |
| `FileChanged` | The dedup guard hashes at check time and self-corrects without a watcher. Literal filenames only, no globs, so it cannot watch a corpus. The engine already has a watcher. |
| `InstructionsLoaded` | Cannot carry engine-owned guidance: output capability is undocumented and the trigger is on filesystem events, not pulls. Adopting `path_glob_match` rules would create a second guidance home — rule 9. |
| `Elicitation` / `ElicitationResult` | The mechanism blocks a tool call synchronously on a human answering, which contradicts an asynchronous design and reintroduces the freeze a Stop hook already caused. Level 1 supersedes it. |
| `PostCompact` | Read-set invalidation is already covered by `PreCompact` and `SessionStart(compact)`. Reinjection saves one turn the permission check recovers anyway. |
| `CwdChanged` | Only matters if relative paths are trusted. Resolving against the work root instead removes the failure entirely. |
| `DirectoryAdded` | With path scoping rejected, a newly reachable tree is just more filesystem. |
| `PermissionRequest` | `PreToolUse` owns the decision. The harness permission system would be a second check on the same concern — rule 9. |
| `PermissionDenied` | Fires only for calls `PreToolUse` allowed and the harness then blocked. Near-empty set. |
| `UserPromptExpansion` | The cage denies `Skill`. Nothing to observe. |
| `Setup` | Arrival is already idempotent wherever it runs, so a second trigger buys nothing. Revisit only for headless workflows. |
| `MessageDisplay` | Presentation layer. The Mirror is the owner's surface and reads from the engine. |
| `TaskCreated` / `TaskCompleted` | Duplicates the obligation system Level 1 owns — rule 9. |
| `TeammateIdle` | Agent identity and roles are Level 1's. There are no teammates in the harness sense. **Not here, rather than not ever** — Level 1 has a crew, and it takes this up. |
| `WorktreeCreate` / `WorktreeRemove` | i34 removed worktrees. Records are folders on trunk. Revisit if worktrees return. |
