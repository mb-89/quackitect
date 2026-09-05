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

// TooManyNotes answers why this call is held until the notes are tokens, and
// whether it is. It holds the work and lets everything else through, the way
// the staffing guard does, because minting the tokens is the way out.
func TooManyNotes(r Roots, actor, tool string) (string, bool) {
	if actor != "main" || !heldDuringShortfall[tool] {
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
	b.WriteString("TURN EACH ONE IN, and the work goes through again. There are three answers:\n" +
		"- it is useless, so drop it: se work --close <id> --as dropped --why \"...\"\n" +
		"- it is work, so mint a tracked token from it and close the note as became\n" +
		"- you cannot decide it, so mint a tracked token carrying your best attempt " +
		"and set needs_human on it, which puts it where a person looks\n\n")
	b.WriteString("THE NOTES, AS THEY STAND:\n")
	for _, one := range notes {
		fmt.Fprintf(&b, "  %s  %s\n", one.ID, one.Title)
	}
	fmt.Fprintf(&b, "\nA note that became a token or was dropped stops counting. "+
		"What was asked: %s.\n", tool)
	return b.String(), true
}
