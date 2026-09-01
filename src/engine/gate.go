package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
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

// InWorkFor is every token that agent is holding. The invariant is that this is
// never longer than one, and it answers a list rather than a token so a check
// can see the invariant break rather than only its consequences.
func InWorkFor(r Roots, actor string) []Token {
	var held []Token
	for _, t := range Tokens(r) {
		if t.Holder != actor {
			continue
		}
		// A REVIEWER HOLDS A TOKEN TOO, AND IT IS THE ONE IT IS JUDGING.
		//
		// MEASURED, BY THE REVIEWERS THIS BROKE. Two of them reported the same
		// thing in one afternoon: the gate refuses all Bash unless a token is
		// named, a reviewer has none to name, so neither could run go test, node
		// or the battery. One wrote that every measurement it reported had been
		// recomputed by hand and named the claims it could not confirm.
		//
		// That is the first thing doc/guidance/reviewing.md asks of a reviewer,
		// which is to reproduce every measurement, refused by this gate. And the
		// answer is not a list of safe commands, which goes stale the day
		// somebody runs a new one: a reviewer holding a token IS working on one.
		if t.Status == ImpInWork || t.Status == SpecInWork ||
			t.Status == ImpInReview || t.Status == SpecInReview {
			held = append(held, t)
		}
	}
	return held
}

// WHERE A TOKEN PUT BACK GOES, and it is open rather than backlogged. Open is
// where it came from. Backlogged means nobody is doing it, and somebody was.
func putBack(s Status) Status {
	if s == SpecInWork {
		return SpecOpen
	}
	return ImpOpen
}

// WHICH IN-WORK STATE A TOKEN TAKES, decided by which half it is in. A draft
// being written and an implementation being cut are both work, and they are not
// the same state.
func takesUp(s Status) Status {
	if s.Drafting() {
		return SpecInWork
	}
	return ImpInWork
}

// WorkOn names the token an agent is working on. It puts that token in work and
// puts back everything else that agent was holding.
func WorkOn(r Roots, id, actor string) (Token, error) {
	t, err := LoadToken(r, id)
	if err != nil {
		return t, err
	}
	// A TOKEN THAT HAS ENDED CANNOT BE NAMED. Writing under a closed token files
	// the work where nobody will go looking for it.
	if t.Status.Ended() {
		return t, fmt.Errorf("%s already ended as %s. Name a token that is open, or mint one",
			t.ID, t.Status)
	}
	// A TOKEN SOMEBODY ELSE IS HOLDING IS NOT TAKEN AWAY FROM THEM. The flip is
	// per agent, and two agents on one token is the collision this record has
	// already paid for once.
	if (t.Status == ImpInWork || t.Status == SpecInWork) && t.Holder != "" && t.Holder != actor {
		return t, fmt.Errorf("%s is held by %s. One token has one holder", t.ID, t.Holder)
	}
	// THE PUTTING BACK COMES FIRST, and it skips the token being named, so an
	// agent naming what it already holds does not put it back a moment before
	// taking it up again.
	for _, held := range InWorkFor(r, actor) {
		if held.ID == t.ID {
			continue
		}
		held.Status, held.Holder = putBack(held.Status), ""
		if err := SaveToken(r, held); err != nil {
			return t, err
		}
		inSession(r, "work", actor, held.ID+" put back to "+string(held.Status)+
			", because "+actor+" is on "+t.ID+" now", Yes(),
			map[string]any{"id": held.ID, "for": t.ID})
	}
	was := t.Status
	t.Status, t.Holder = takesUp(t.Status), actor
	if err := SaveToken(r, t); err != nil {
		return t, err
	}
	if was != t.Status {
		inSession(r, "work", actor, t.ID+" taken up from "+string(was), Yes(),
			map[string]any{"id": t.ID, "from": string(was)})
	}
	// AND NAMING IT ARMS ONE WRITE. See ticket.go.
	ArmTicket(r, actor, t.ID)
	return t, nil
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
func WriteNeedsAToken(r Roots, actor, tool, path string) (string, bool) {
	if !WriteTools[tool] {
		return "", false
	}
	if insideTheScratchpad(r, path) {
		return "", false
	}
	// EVERY NAME THIS PROCESS ANSWERS TO, because the harness calls it one thing
	// and it pulls under another.
	names := everyNameOf(r, actor)
	// A REVIEWER'S HOLD WRITES WITHOUT A TICKET. The queue put that token in its
	// hands, so it has already said which work this is.
	for _, name := range names {
		if holdsAReview(r, name) {
			return "", false
		}
	}
	if SpendsATicket[tool] {
		// ONE NAME, ONE WRITE. The tool names the file it changes, and the
		// ticket is the record of which work that file belongs to.
		for _, name := range names {
			if _, armed := SpendTicket(r, name); armed {
				return "", false
			}
		}
	} else {
		// A SHELL NAMES NO FILE, so it keeps the standing hand it has today.
		// Charging it a ticket would charge a name for every cat and rg.
		for _, name := range names {
			if len(InWorkFor(r, name)) > 0 {
				return "", false
			}
		}
	}
	var open []string
	for _, t := range Tokens(r) {
		if t.Assignee != actor {
			continue
		}
		if t.Status == ImpOpen || t.Status == SpecOpen {
			open = append(open, "  "+t.ID+"  "+t.Title)
		}
	}
	why := "NO TOKEN, NO WRITING. " + tool + " can write, and you have not said which " +
		"work this belongs to.\n\nName it. Naming it is what opens it, so there is " +
		"nothing else to do first:\n\n  se work --on <id> --by " + actor + "\n\n"
	if len(open) == 0 {
		return why + "Nothing is open for " + actor + ". Mint one with se work, which is " +
			"the one thing you may do with no token in hand.", true
	}
	return why + "Open for " + actor + ":\n\n" + strings.Join(open, "\n"), true
}

// WHO SENT A TOKEN FOR JUDGMENT, which is what four eyes is a question about.
//
// A REVIEWER MAY NOT JUDGE WHAT IT SUBMITTED, and that was asked of the
// assignee, which is a field any actor may rewrite. One extra command made four
// eyes into two: draft it, submit it, hand it to somebody else, then pull as a
// reviewer and agree your own draft. The note afterwards reads exactly like a
// legitimate review.
//
// SO IT ASKS ABOUT THE PAST. Who sent it is a thing that happened and the
// engine writes it. Who owns it now is a decision somebody may change.
//
// AND A TOKEN SENT BEFORE THIS FIELD EXISTED FALLS BACK TO THE ASSIGNEE. That
// is the guard that was there, so nothing already in flight loses the weaker
// check while gaining the stronger one.
func sentBy(t Token) string {
	if t.SubmittedBy != "" {
		return t.SubmittedBy
	}
	return t.Assignee
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
	if !pulls || named == "" || named == harness {
		return
	}
	known := TheNamesItPullsWith(r)
	for _, was := range known[harness] {
		if was == named {
			return
		}
	}
	known[harness] = append(known[harness], named)
	if b, err := json.MarshalIndent(known, "", "  "); err == nil {
		_ = os.WriteFile(aliasPath(r), b, 0o644)
	}
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
