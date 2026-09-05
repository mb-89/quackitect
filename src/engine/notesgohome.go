package main

import (
	"fmt"
	"strings"
)

// A CLOUD BOX EMPTIES ITS NOTES INTO GIT BEFORE IT DIES.
//
// THE OWNER'S WORDS: every note you write is not tracked and will not survive,
// so make sure you do not lose any notes. When that variable is on and there
// are twenty notes or more, the engine gives you these notes. You judge them
// and either make work tokens out of them, or drop them if they are useless.
// Where you cannot decide one, make your best attempt, make a tracked token,
// and flag it needs_human.
//
// A NOTE IS PRIVATE BY WHAT IT IS. It lives under .se, which nothing pushes,
// because a note is what nobody has decided yet. On a desk that is right: the
// disk outlives the session. On a cloud box the disk is reclaimed with the
// container, so a note there is a thought with a deadline nobody set.
//
// THE ENGINE HANDS THEM OVER AND CONVERTS NOTHING. Which of the three answers a
// note deserves is a reading, and a program that guessed would either bury work
// in tokens nobody wants or drop what mattered.

// TheNoteCeiling is how many notes a cloud box carries before its work is held
// until they are turned in.
const TheNoteCeiling = 20

// NotesInHand is every note this tree carries that nobody has decided about,
// oldest first.
func NotesInHand(r Roots) []Token {
	var out []Token
	for _, t := range Tokens(r) {
		if t.Process != PrivateProcess || t.Ended() {
			continue
		}
		out = append(out, t)
	}
	return out
}

// NotesGoWithTheBox answers why a stop is refused while a note is still open,
// and whether it is. A cloud box only.
//
// THE OWNER'S WORDS: when you have nothing else to do, claim all the notes that
// are still there and work them in. Then you can stop.
//
// A STOP IS THE BOX SAYING IT HAS NOTHING ELSE TO DO, which is exactly the
// moment every note left is about to go down with the container. The ceiling
// above catches a session that is still working; this catches the end of one.
func NotesGoWithTheBox(r Roots) (string, bool) {
	if !TheHost(r.Method).Cloud {
		return "", false
	}
	notes := NotesInHand(r)
	if len(notes) == 0 {
		return "", false
	}
	var b strings.Builder
	fmt.Fprintf(&b, "%d NOTE(S) ARE STILL OPEN, AND THEY DIE WITH THIS BOX. "+
		"Turn them in, and then stop.\n\n", len(notes))
	for _, one := range notes {
		fmt.Fprintf(&b, "  %s  %s\n", one.ID, one.Title)
	}
	b.WriteString("\nEach one is a tracked token, or it is dropped. Where the answer is not " +
		"yours, mint the token with your best attempt and set needs_human on it, " +
		"which puts it where a person looks.\n")
	return b.String(), true
}

// TooManyNotes answers why this call is held until the notes are tokens, and
// whether it is. It holds the work and lets everything else through, the way
// the staffing guard does, because minting the tokens is the way out.
func TooManyNotes(r Roots, actor, tool, command string) (string, bool) {
	if actor != "main" || !heldDuringShortfall[tool] {
		return "", false
	}
	// A SHELL COMMAND THAT IS ONLY THE ENGINE IS NOT WORK, and here that matters
	// more than anywhere. This guard fires on a cloud box, which is exactly where
	// a lane can be missing, and every refusal this engine writes tells such an
	// agent to make the same call at a shell. Holding Bash while demanding work
	// verbs would leave no legal move at all, which is the deadlock the staffing
	// guard records as having happened once already.
	if runsTheEngine(command) && !engineWork(command) {
		return "", false
	}
	host := TheHost(r.Method)
	if !host.Cloud {
		return "", false
	}
	notes := NotesInHand(r)
	if len(notes) < TheNoteCeiling {
		return "", false
	}
	var b strings.Builder
	fmt.Fprintf(&b, "THIS BOX IS CARRYING %d NOTES, AND NOTHING PUSHES THEM. "+
		"It is %s, by %s, so what is not in git dies with the container.\n\n",
		len(notes), host.Says, host.Because)
	// EACH ANSWER NAMES THE COMMAND THAT PERFORMS IT, AND EACH SITS ON ITS OWN
	// LINE. This guard is a handing-over: it holds the work and says how to get
	// out. Its one copyable line named se work --close and --as, and neither flag
	// is declared, so the agent held here spent a turn on a parse error and then
	// had to read work.go for the real command. Prose after a command is the same
	// defect waiting, because a line is what a reader copies. See
	// refusalflagsexist_test.go, which reads each of these against work.go.
	b.WriteString("TURN EACH ONE IN, and the work goes through again. There are three answers.\n\n" +
		"IT IS USELESS, so drop it:\n" +
		"    se work --abort <id> --why \"...\"\n\n" +
		"IT IS WORK, so mint a tracked token from it:\n" +
		"    se work --title \"...\" --process trivial --tracked true --detail \"...\" --done-when \"...\"\n" +
		"Say --process standard where the work wants an approach first. Then close this note as " +
		"became, naming the minted id in successors. A disposition is moved by a pull, not by " +
		"this verb.\n\n" +
		"YOU CANNOT DECIDE IT, so mint it the same way with your best attempt, and put it where " +
		"a person looks:\n" +
		"    se work --set <minted> --field needs_human --to true\n\n")
	b.WriteString("THE NOTES, AS THEY STAND:\n")
	for _, one := range notes {
		fmt.Fprintf(&b, "  %s  %s\n", one.ID, one.Title)
	}
	fmt.Fprintf(&b, "\nA note that became a token or was dropped stops counting. "+
		"What was asked: %s.\n", tool)
	return b.String(), true
}
