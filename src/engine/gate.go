package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// This file is the write gate. A call that can write says which token it is
// about, the engine takes that token up, and a read goes through untouched.
// Why a write names its work, and why a read is free, is
// [[a-write-names-its-token]].

// WriteTools are the harness tools that can write, named once. Anything that
// runs a command is one of them, whatever that command was going to do.
var WriteTools = map[string]bool{
	"Write":        true,
	"Edit":         true,
	"MultiEdit":    true,
	"NotebookEdit": true,
	"Bash":         true,
	"PowerShell":   true,
}

// NamesItsOwnToken are the tools refused whatever the agent holds, because none
// of them carries a field for a token. The engine's verbs take the name on the
// call instead, and the refusal says which verb to use.
// See [[a-write-names-its-token]].
var NamesItsOwnToken = map[string]bool{
	"Write": true, "Edit": true, "MultiEdit": true, "NotebookEdit": true,
	"Bash": true, "PowerShell": true,
}

// TodoTools are the harness's own todo list, the read and the write both.
var TodoTools = map[string]bool{"TodoWrite": true, "TodoRead": true}

// TodoIsASubToken refuses the harness's todo list and sends the plan into the
// record instead, as tokens that are part of the one in hand. Why the list is
// refused at both halves is [[a-todo-is-a-sub-token]].
func TodoIsASubToken(r Roots, actor, tool string) (string, bool) {
	if !TodoTools[tool] {
		return "", false
	}
	by := theByName(r, actor)
	head := "A TODO IS A SUB-TOKEN, BECAUSE THE PLAN BELONGS IN THE RECORD.\n\n" +
		tool + " keeps a list inside this agent, so it goes when the agent goes and " +
		"the person reading the queue never sees what the work was broken into. " +
		"The engine already has the shape: a token that is part of another.\n\n"
	// With nothing in hand there is no parent to name, so this branch sends the
	// agent for work first.
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

// TakeUp is a person or an agent saying which token it is on. It puts back
// whatever else that actor holds, and the write verbs call it with the name on
// the write. Why one at a time, and why the verb is still here, is
// [[one-token-in-hand]].
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

// insideTheScratchpad answers whether this path is under the scratchpad, which
// is the one folder a write with nothing in hand may reach. It asks the path
// rather than the text of it, so a route that climbs out is outside, and a call
// naming no path is outside too. Why the carve-out is there, and where it
// stops, is [[the-scratchpad-is-not-the-product]].
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

// WriteNeedsAToken answers whether this tool call is refused, and why. The
// answer names what is open for that agent and the call that takes one, which
// is [[a-refusal-is-a-menu]].
func WriteNeedsAToken(r Roots, actor, tool, path, command string) (string, bool) {
	if !WriteTools[tool] {
		return "", false
	}
	if insideTheScratchpad(r, path) {
		return "", false
	}
	// A command that is only the engine already names its work, and
	// [[the-engine-is-not-the-pipe]] says what takes one back out.
	if runsTheEngine(command) {
		return "", false
	}
	// Every tool that can write is refused, whatever the agent holds.
	if NamesItsOwnToken[tool] {
		return whatDisqualified(command) + theRefusal(r, actor, tool, path), true
	}
	return "", false
}

// whatDisqualified says why a command that is the engine did not get the
// engine's exception, and is empty for one that never had a claim on it. It
// reads the walk runsTheEngine reads, through theQuotings, so the two cannot
// disagree. See [[the-engine-is-not-the-pipe]].
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
	// The two verbs that once needed a pipe say so here, and each has a flag.
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

// whatIsOpen lists what this actor could pick up, over every name it answers
// to, so a refusal ends with something to do rather than with a wall. See
// [[a-refusal-is-a-menu]].
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
	// A list past the screen is no menu, and the queue hands one out.
	if len(open) > 10 {
		open = append(open[:10], "  ... and "+itoa(len(open)-10)+" more. se pull hands you one.")
	}
	return "Open for " + actor + ":\n\n" + strings.Join(append(held, open...), "\n")
}

// aliasPath is where the register keeps, for each harness name, the names it
// has pulled with. Two names for one process, and why the gate has to know it,
// is [[an-actor-is-a-session]].
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

// NoteTheNameItActsAs records that this harness name answers to that one. The
// lane calls it with the actor it was handed, because a lane tool types no
// command for the guard to read.
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

// ANameAnotherSessionHolds refuses a call acting under a name a different live
// session holds, and names that session. It asks the register, which knows each
// session by the id the harness sends, counts only sessions of this run, and
// picks the lowest id so two calls asking one thing answer alike. A helper is
// not asked about, because no session answers to a helper's name.
// Why an actor is a session is [[an-actor-is-a-session]].
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
// flag the verb spells it: --actor for a pull and --by for a write. The shell
// is the other door, and both are open at once in this tree.
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
