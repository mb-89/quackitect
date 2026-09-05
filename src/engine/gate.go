package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// NO TOKEN, NO WRITING.
//
// THE OWNER'S WORDS: whenever you do something that writes or can write, you
// have to say which token it is about, and that flips the token to in work. It
// flips any other token per agent to not in work. So one agent never holds more
// than one token, and there are never more tokens open than there are agents
// working.
//
// SO NAMING A TOKEN IS THE OPENING, and the agent never opens one as a separate
// act. It says which token a write belongs to, the engine puts that token in
// work, and the person watching the panel sees what is being done without the
// agent having to remember to say so.
//
// IT GATES WRITES ONLY. A read changes nothing, and an agent that cannot read
// cannot find out which token it needs. A guard that refuses too much is one
// somebody turns off.

// THE TOOLS THAT CAN WRITE, DECLARED ONCE.
//
// A shell command can write, which is the owner's own clause and the one an
// agent would otherwise route around: refusing Write and allowing Bash refuses
// nothing. Anything that runs a command is here whether or not this particular
// command was going to write, because the guard sees the command before it runs
// and reading a command to decide whether it writes is a losing game.
var WriteTools = map[string]bool{
	"Write":        true,
	"Edit":         true,
	"MultiEdit":    true,
	"NotebookEdit": true,
	"Bash":         true,
	"PowerShell":   true,
}

// THE TOOLS THAT CANNOT SAY WHICH WORK THEY ARE.
//
// The harness's Write and Edit carry a path and some content, and no field for
// a token. So the engine could only ever ask for the name in a SEPARATE call
// before the edit: se work --on armed one write and the write spent it. Naming
// the work was a thing to remember, and a thing to remember is a thing to
// forget.
//
// se apply takes the name ON the write, so the two cannot come apart. These are
// refused whatever the agent holds, and the refusal says what to use instead.
//
// A SHELL IS HERE TOO, AND FOR THE HARDER REASON. The engine cannot read a
// command and know whether it writes: sed -i, a redirection, mv, rm and a
// script somebody wrote all reach the filesystem, and a list of safe programs
// goes stale the day anybody runs a new one. So the question is not asked. A
// shell command names its work because it COULD write, and se run takes that
// name the same way se apply does.
//
// THE STANDING HAND WAS THE OTHER ANSWER AND IT LEAKED. Holding a token let
// every shell call through for as long as it was held, so one name bought a
// session of writes and nothing said which of them belonged to what.
var NamesItsOwnToken = map[string]bool{
	"Write": true, "Edit": true, "MultiEdit": true, "NotebookEdit": true,
	"Bash": true, "PowerShell": true,
}

// THE HARNESS'S OWN TODO LIST, DECLARED ONCE.
//
// BOTH HALVES ARE HERE. Reading the list is how an agent finds the list it is
// about to write, so refusing only the write moves the plan out of the record
// just as surely and leaves the agent a way round.
var TodoTools = map[string]bool{"TodoWrite": true, "TodoRead": true}

// TodoIsASubToken refuses the harness's todo list and sends the plan into the
// record instead.
//
// A TODO IS A WORK TOKEN NOBODY ELSE CAN SEE. It lives inside this agent, it
// goes when the agent goes, and the queue on the person's screen never learns
// what the work was broken into. The engine already has the shape for it: a
// token that is part of another, which the queue hands out before its parent
// and which keeps that parent open until it closes. So the breakdown is kept by
// the record rather than remembered by whoever wrote it.
func TodoIsASubToken(r Roots, actor, tool string) (string, bool) {
	if !TodoTools[tool] {
		return "", false
	}
	by := theByName(r, actor)
	head := "A TODO IS A SUB-TOKEN, BECAUSE THE PLAN BELONGS IN THE RECORD.\n\n" +
		tool + " keeps a list inside this agent, so it goes when the agent goes and " +
		"the person reading the queue never sees what the work was broken into. " +
		"The engine already has the shape: a token that is part of another.\n\n"
	// NOTHING IN HAND MEANS NO PARENT TO NAME, and an id that is not there is
	// worse than no id at all, so that branch sends the agent for work first.
	held := InWorkFor(r, actor)
	if len(held) == 0 {
		return head + "You are holding nothing, so there is no token to be part of. " +
			"Take work up first:\n\n" +
			"  se pull --by " + by + "\n\n" +
			whichNameIsWhich(actor, by) + whatIsOpen(r, actor), true
	}
	return head + "Mint each step as a part of the token in your hands:\n\n" +
		"  se work --title \"...\" --detail \"...\" --parent " + held[0].ID +
		" --by " + by + "\n\n" +
		"That token cannot close while its parts are open, and the queue hands the " +
		"parts out before it, so the plan is kept rather than remembered.\n\n" +
		whichNameIsWhich(actor, by), true
}

// theVerbFor says which of the engine's verbs does the job a refused tool was
// reaching for, so a refusal ends with the call to make.
func theVerbFor(tool string) string {
	if tool == "Bash" || tool == "PowerShell" {
		return "run"
	}
	return "apply"
}

// InWorkFor is every token that agent is holding. The invariant is that this is
// never longer than one, and it answers a list rather than a token so a check
// can see the invariant break rather than only its consequences.
func InWorkFor(r Roots, actor string) []Token {
	// NOBODY HOLDS NOTHING, AND NOBODY IS NOT AN ACTOR.
	//
	// MEASURED, AND IT OPENED THE WHOLE GATE. An unheld token carries an empty
	// holder, so an actor with no name matched every one of them: this answered
	// 192 tokens for "", the gate read that as a hand full of work, and every
	// write by an unnamed caller went through. NO TOKEN, NO WRITING was off for
	// anyone who did not say who they were.
	if strings.TrimSpace(actor) == "" {
		return nil
	}
	var held []Token
	for _, t := range Tokens(r) {
		if t.Holder != actor {
			continue
		}
		// HOLDING IT IS BEING ON IT. The gate asks the hold rather than the
		// state, because the state is a word the process owns and the gate
		// would otherwise have to know every process's vocabulary.
		//
		// MEASURED, BY WHAT THE OLD RULE BROKE. It named four states, so an
		// actor holding a token in any other one was refused every command
		// including ls, could not run the battery, and reported measurements it
		// had recomputed by hand.
		if !t.Ended() {
			held = append(held, t)
		}
	}
	return held
}

// TakeUp is a person or an agent saying which token it is on.
//
// IT IS NOT A CALL AN AGENT MAKES ANY MORE. se apply calls it with the name on
// the write, so naming the work and doing the work are one act. The verb is
// still here because a person picks a token up from the panel, and because a
// write has to say what it did.
//
// WHATEVER ELSE THIS ACTOR HELD GOES BACK. One thing in hand at a time, so the
// queue never shows an agent working on two, and so changing what you are
// working on is one word rather than a put-down and a take-up.
func TakeUp(r Roots, id, actor string) (Token, error) {
	t, err := LoadToken(r, id)
	if err != nil {
		return t, err
	}
	// A TOKEN THAT HAS ENDED CANNOT BE NAMED. Writing under a closed token
	// files the work where nobody will go looking for it.
	if t.Ended() {
		return t, fmt.Errorf("%s already ended as %s. Name a token that is open, or mint one",
			t.ID, t.Disposition)
	}
	// A TOKEN SOMEBODY ELSE HOLDS IS NOT TAKEN AWAY FROM THEM. The swap is per
	// agent, and two agents on one token is a collision this record has already
	// paid for once.
	if t.Holder != "" && t.Holder != actor {
		return t, fmt.Errorf("%s is held by %s. One token has one holder", t.ID, t.Holder)
	}
	// A TOKEN THAT TRAVELS IS CLAIMED BEFORE IT IS WORKED, because another box
	// can read it out of git and take the same one.
	if why := NoClaimHere(r, t, time.Now().UTC()); why != "" {
		return t, fmt.Errorf("%s", why)
	}
	// THE PUTTING BACK COMES FIRST, and it skips the token being named, so an
	// agent naming what it already holds does not put it back a moment before
	// taking it up again.
	for _, held := range InWorkFor(r, actor) {
		if held.ID == t.ID {
			continue
		}
		held.Holder = ""
		if err := SaveToken(r, held); err != nil {
			return t, err
		}
		inSession(r, "work", actor, held.ID+" put back, because "+actor+" is on "+t.ID+" now",
			Yes(), map[string]any{"id": held.ID, "for": t.ID})
	}
	if t.Holder == actor {
		return t, nil
	}
	t.Holder = actor
	// TAKING UP OPENS A STRETCH, with the tree as it stands as its before.
	t = openStretch(r, t)
	return t, SaveToken(r, t)
}

// THE SCRATCHPAD STAYS ALLOWED, BECAUSE THINKING IS NOT A CHANGE.
//
// A file under .se/scratchpad is not the product. Nobody reviews one, nothing
// ships from it, and the retro drains the folder. So the gate costs something
// there and buys nothing: an agent with nothing in hand could not write the
// note it was reasoning in, which is the one place the rule made the work
// harder without making the queue truer.
//
// IT ASKS THE PATH RATHER THAN THE TEXT OF THE PATH. filepath.Rel answers how
// to get from the scratchpad to this file, and a route that starts by climbing
// out is not inside it. A prefix match on the string would have taken
// scratchpad-notes.md and anything reached through ".." out of the gate.
//
// A CALL WITH NO PATH IS NOT INSIDE IT. Bash is the case: a shell command has
// no one file it writes, so nothing can say it stays in the folder, and it goes
// on being gated. That is the honest half rather than a gap, and it is why the
// carve-out is written where a path is known.
func insideTheScratchpad(r Roots, path string) bool {
	if strings.TrimSpace(path) == "" {
		return false
	}
	pad, err := filepath.Abs(r.Private("scratchpad"))
	if err != nil {
		return false
	}
	full, err := filepath.Abs(path)
	if err != nil {
		return false
	}
	rel, err := filepath.Rel(pad, full)
	if err != nil {
		return false
	}
	return rel != ".." && !strings.HasPrefix(rel, ".."+string(filepath.Separator))
}

// WriteNeedsAToken answers whether this tool call is refused, and why.
//
// THE REFUSAL IS A MENU. A wall that says no and stops there sends the agent
// looking for a way round, so this names what is open for that agent and the
// call that takes one.
func WriteNeedsAToken(r Roots, actor, tool, path, command string) (string, bool) {
	if !WriteTools[tool] {
		return "", false
	}
	if insideTheScratchpad(r, path) {
		return "", false
	}
	// A COMMAND THAT IS ONLY THE ENGINE ALREADY NAMES ITS WORK.
	//
	// runsTheEngine is the named exception this gate always meant to have, and
	// it was written and wired to one caller. So `se pull` at a shell was
	// refused, and a pull is how you get the id this refusal demands.
	//
	// IT ONLY BIT WITH NO MCP LANE. With the lane up, se_pull and se_stop are
	// lane tools and never reach Bash. A cloud box clones, and whatever
	// .mcp.json the clone carries is the lane for that whole session: get it
	// wrong once and the agent has no first move at all. Measured there.
	if runsTheEngine(command) {
		return "", false
	}
	// EVERY TOOL THAT CAN WRITE IS REFUSED, WHATEVER THE AGENT HOLDS.
	//
	// Holding a token is not saying which work THIS call is, and the difference
	// is the whole rule: an agent that names a token once files everything
	// after it under whatever it named first. The engine's own verbs take the
	// name on the call, so the two cannot come apart.
	if NamesItsOwnToken[tool] {
		return whatDisqualified(command) + theRefusal(r, actor, tool, path), true
	}
	return "", false
}

// whatDisqualified says why a command that is the engine did not get the
// engine's exception, and is empty for one that never had a claim on it.
//
// THE REFUSAL ANSWERED THE WRONG QUESTION. `./RUNME.sh pull --help | head -40`
// came back talking about naming a token, so a cloud agent read it as the engine
// itself being refused and spent several calls on that reading. The engine was
// not refused. The pipe was, because a pipe can write.
//
// IT READS THE SAME WALK runsTheEngine READS. theQuotings answers both readings
// of the command once, so what disqualified it is read off the same string the
// gate decided on rather than off a second parse that could disagree.
func whatDisqualified(command string) string {
	if !isTheEngine(firstWord(command)) {
		return ""
	}
	separators, substitutions := theQuotings(command)
	says := ""
	switch {
	case strings.ContainsAny(separators, "|"):
		says = "a pipe"
	case strings.ContainsAny(separators, "<>"):
		says = "a redirection"
	case strings.ContainsAny(separators, ";&\n"):
		says = "a second command"
	case strings.Contains(substitutions, "$(") || strings.Contains(substitutions, "`"):
		says = "a substitution"
	default:
		return "" // it is inside the exception, and nothing was refused for it
	}
	out := "THE ENGINE IS NOT WHAT WAS REFUSED. This command runs the engine, and " +
		says + " took it out of the exception, because " + says + " can write and the " +
		"engine cannot tell what it writes. The engine on its own goes through.\n\n"
	// THE TWO VERBS THAT USED TO NEED A PIPE SAY SO HERE. run and apply read
	// their payload from standard input, so the only form of them a session
	// knew was the one form the guard refuses, and a lane failure cost that
	// session every write rather than some convenience. Each has a flag now.
	if says == "a pipe" {
		out += "run and apply take their payload without a pipe, and name the same " +
			"token either way:\n\n" +
			"  se run --on <id> --command 'go test ./...'\n" +
			`  se apply --on <id> --edits '[{"file":"a.go","old":"x","new":"y"}]'` + "\n\n"
	}
	return out
}

// theByName is the name the caller pulls with, which is the name a token is
// held and closed under. The harness name is only linked to it, so a
// suggested command spelling the harness name in --by files the work under a
// name nothing else uses.
func theByName(r Roots, actor string) string {
	names := TheNamesItPullsWith(r)[actor]
	if len(names) == 0 {
		return actor
	}
	return names[len(names)-1]
}

// whichNameIsWhich says so when the two differ, and is empty when they do not.
func whichNameIsWhich(actor, by string) string {
	if by == actor {
		return ""
	}
	return "The harness calls you " + actor + " and you pull as " + by +
		", so --by takes " + by + ".\n\n"
}

// theRefusal sends the agent to the verb that can say what this call is.
func theRefusal(r Roots, actor, tool, path string) string {
	by := theByName(r, actor)
	if theVerbFor(tool) == "run" {
		return "THE ENGINE RUNS COMMANDS, BECAUSE A COMMAND SAYS WHICH WORK IT IS.\n\n" +
			tool + " carries no way to name a token, so it is refused whatever you hold. " +
			"The engine cannot read a command and know whether it writes: a redirection, " +
			"sed -i, mv, rm and a script you wrote all reach the filesystem. So it does " +
			"not ask, and every command names its work:\n\n" +
			"  se run --on <id> --by " + by + " --from .se/scratchpad/cmd.txt\n\n" +
			"The command is read whole from that file, quotes and all, and it runs in " +
			"the folder being worked on. The scratchpad is the one folder a write with " +
			"nothing in hand may reach, so put the command there first, or carry a short " +
			"one inline with --command. Output comes back with its exit code, and a long " +
			"one is cut at the end rather than sent entire.\n\n" +
			"Naming a token you were not on puts the old one back and takes the new one " +
			"up, so changing what you work on is one word on the next command.\n\n" +
			theShellDoor("run --on <id> --by "+by+" --command 'go test ./...'") + "\n\n" +
			whichNameIsWhich(actor, by) + whatIsOpen(r, actor)
	}
	where := shortPath(r, path)
	if strings.TrimSpace(where) == "" {
		where = "the/file.go"
	}
	return "THE ENGINE WRITES FILES, BECAUSE A WRITE SAYS WHICH WORK IT IS.\n\n" +
		tool + " carries no way to name a token, so it is refused whatever you hold. " +
		"se apply takes the name on the write itself, so there is no call to make " +
		"first and nothing to remember:\n\n" +
		"  se apply --on <id> --by " + by + " --from .se/scratchpad/manifest.json\n\n" +
		"The manifest is read whole from that file: a JSON array with one entry per " +
		"edit, {\"file\":\"" + where + "\",\"old\":\"...\",\"new\":\"...\"}. The scratchpad " +
		"is the one folder a write with nothing in hand may reach, so put it there " +
		"first, or carry a short one inline with --edits. " +
		"One manifest changes as many files as you like, and every edit is checked " +
		"before any is written, so one bad edit writes nothing. op create makes a " +
		"file that is not there, op write replaces one whole.\n\n" +
		"Naming a token you were not on puts the old one back and takes the new one " +
		"up, so changing what you work on is one word on the next write.\n\n" +
		theShellDoor("apply --on <id> --by "+by+` --edits '[{"file":"`+where+
			`","old":"...","new":"..."}]'`) + "\n\n" +
		whichNameIsWhich(actor, by) + whatIsOpen(r, actor)
}

// whatIsOpen lists what this actor could pick up, so a refusal ends with
// something to do rather than with a wall.
//
// IT ASKS OVER EVERY NAME THE CALLER ANSWERS TO. No token is held under a
// harness name, so a menu built over the raw name told a subagent nothing was
// open while the token it pulled stood open under its pulled-with name.
func whatIsOpen(r Roots, actor string) string {
	mine := map[string]bool{}
	for _, n := range everyNameOf(r, actor) {
		mine[n] = true
	}
	var held, open []string
	for _, t := range Tokens(r) {
		if t.Ended() {
			continue
		}
		if mine[t.Holder] {
			held = append(held, "  "+t.ID+"  "+t.Title+"  (in your hands as "+t.Holder+")")
			continue
		}
		if t.Holder == "" && Workable(r, t) {
			open = append(open, "  "+t.ID+"  "+t.Title)
		}
	}
	if len(held) == 0 && len(open) == 0 {
		return "Nothing is open for " + actor + ". Mint one with se work, which is " +
			"the one thing you may do with no token in hand."
	}
	// A MENU LONGER THAN THE SCREEN IS NOT A MENU. The queue hands one out.
	if len(open) > 10 {
		open = append(open[:10], "  ... and "+itoa(len(open)-10)+" more. se pull hands you one.")
	}
	return "Open for " + actor + ":\n\n" + strings.Join(append(held, open...), "\n")
}

// THE NAME THE HARNESS USES AND THE NAME THE AGENT PULLS WITH.
//
// They are two names for one process and the gate has to know it. A reviewer
// holds its token under the name it pulls with, rev-6, and the guard is handed
// the name the harness uses, general-purpose-28. They never match, so every
// subagent reviewer was refused every command including ls, could not deliver a
// rejection through the one door left to it, and closed a token it had not read.
//
// THE LINK IS THE PULL ITSELF. The guard sees the command go past before it
// runs, and that command carries --actor. So the guard writes down that this
// harness name answers to that one, and the gate asks about both.
//
// IT IS ONE NAME AND NOT A SKELETON KEY. A harness name that has pulled as
// nobody is linked to nobody and is refused exactly as before.
func aliasPath(r Roots) string { return r.Private("actors.json") }

// NoteTheNameItPullsWith records that this harness name answers to the name in
// the command, when the command is a pull. Anything else is left alone.
func NoteTheNameItPullsWith(r Roots, harness, command string) {
	if harness == "" || !runsTheEngine(command) {
		return
	}
	separators, _ := theQuotings(command)
	words := strings.Fields(separators)
	pulls := false
	named := ""
	for i, w := range words {
		if w == "pull" {
			pulls = true
		}
		if w == "--actor" && i+1 < len(words) {
			named = words[i+1]
		}
		if strings.HasPrefix(w, "--actor=") {
			named = strings.TrimPrefix(w, "--actor=")
		}
	}
	if !pulls {
		return
	}
	NoteTheNameItActsAs(r, harness, named)
}

// NoteTheNameItActsAs records that this harness name answers to that one.
//
// THE LANE IS THE OTHER DOOR. se_pull, se_run and the rest carry the actor
// as a field rather than in a command, so a worker that never typed a shell
// pull was never linked: five workers held five tokens under names the
// register had never heard, and the panel drew them waiting with nothing in
// hand while the header showed each one working.
func NoteTheNameItActsAs(r Roots, harness, named string) {
	if harness == "" || named == "" || named == harness {
		return
	}
	_ = locked(aliasPath(r), func() error { // a name it cannot remember is looked up again next call
		known := TheNamesItPullsWith(r)
		for _, was := range known[harness] {
			if was == named {
				return nil
			}
		}
		known[harness] = append(known[harness], named)
		b, err := json.MarshalIndent(known, "", "  ")
		if err != nil {
			return err
		}
		return writeAtomic(aliasPath(r), b, 0o644)
	})
}

// TheNamesItPullsWith answers the map from a harness name to the names it has
// pulled with. An unreadable or absent file is an empty map, because a link
// nobody wrote is a link that does not exist rather than an error.
func TheNamesItPullsWith(r Roots) map[string][]string {
	out := map[string][]string{}
	b, err := os.ReadFile(aliasPath(r))
	if err != nil {
		return out
	}
	_ = json.Unmarshal(b, &out)
	return out
}

// everyNameOf answers the caller and every name it has pulled with.
func everyNameOf(r Roots, actor string) []string {
	return append([]string{actor}, TheNamesItPullsWith(r)[actor]...)
}

// A NAME ANOTHER SESSION HOLDS IS NOT THIS ONE'S TO ACT UNDER.
//
// AN ACTOR IS A SESSION, NOT A WORD. Two sessions ran over one tree and both
// said main. TakeUp puts back everything else that actor holds, so every time
// one of them named a token the other's token left its hands, and the agent it
// left was refused every write for holding nothing.
//
// THE REGISTER ALREADY KNOWS THE SESSIONS. It keys each one by the id the
// harness sends and gives each one a name of its own, so the question here is
// only whether the name on this call belongs to a session that is not this
// one. Nothing in the call itself says which session sent it, and the guard
// sees the session on every event, which is why the guard is where this is
// asked and TakeUp is not.
//
// IT ASKS ABOUT SESSIONS AND NOT ABOUT HELPERS. A helper's name is its own, no
// session answers to it, and two helpers of two sessions are already two names.
//
// AND A LIVE SESSION IS ONE OF THIS RUN, which is what live means everywhere
// else in the register: aSessionName one file over decides the same names and
// asks Run and Gone together. Gone is written on SessionEnd and on nothing
// else, so a session killed without one keeps Kind session, its name and a zero
// Gone for ever. The refusal is the whole product of this guard, and a stale
// record under the same name made it name a session that is not here. The
// refusal itself is never lost: dropping the run can only match more records
// than the live holder, never fewer.
//
// THE PICK IS THE LOWEST ID RATHER THAN THE FIRST KEY. A map hands its keys
// back in nobody's order, so two live sessions under one name would have made
// this message change between two calls that asked the same thing.
func ANameAnotherSessionHolds(r Roots, session, named string) (string, bool) {
	if session == "" || named == "" {
		return "", false
	}
	mine := TheSessionName(r, session)
	if named == mine {
		return "", false
	}
	run := TheRunNow(r)
	theirs := ""
	for id, a := range LoadEvidence(r).Agents {
		if a.Kind != "session" || id == session || a.Name != named {
			continue
		}
		if !a.Gone.IsZero() || a.Run != run {
			continue
		}
		if theirs == "" || id < theirs {
			theirs = id
		}
	}
	if theirs == "" {
		return "", false
	}
	return "THAT NAME IS ANOTHER SESSION'S, AND AN ACTOR IS A SESSION.\n\n" +
		named + " is the session " + theirs + ", which is working over this same " +
		"folder. Naming a token as " + named + " puts back everything " + named +
		" holds, so that session's work would leave its hands and it would be " +
		"refused its next write for holding nothing.\n\n" +
		"You are " + mine + ". Pull under that name:\n\n" +
		"  se pull --actor " + mine + "\n\n" +
		"and send actor: " + mine + " on every call that names a token.", true
}

// theNameACommandActsUnder is the actor a shell command names, under whichever
// flag the verb spells it: --actor for a pull and --by for a write.
//
// THE SHELL IS THE OTHER DOOR. A rule taught to the lane and not to the shell
// is half a mechanism, and both doors are open at once in this tree.
func theNameACommandActsUnder(command string) string {
	if !runsTheEngine(command) {
		return ""
	}
	separators, _ := theQuotings(command)
	words := strings.Fields(separators)
	named := ""
	for i, w := range words {
		for _, flag := range []string{"--actor", "--by"} {
			if w == flag && i+1 < len(words) {
				named = words[i+1]
			}
			if strings.HasPrefix(w, flag+"=") {
				named = strings.TrimPrefix(w, flag+"=")
			}
		}
	}
	return named
}
