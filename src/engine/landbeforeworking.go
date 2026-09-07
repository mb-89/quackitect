package main

import (
	"fmt"
	"strconv"
	"strings"
)

// A GROUP BOX LANDS ON THE TIP BEFORE IT WORKS.
//
// A cloud box clones the branch tip as it stood when the session was made. A
// person who pushed a minute later has a box that is behind and says it is
// current. Two sessions were asked whether they were up to date, said yes, and
// were wrong. A box that works a stale tree hands out tokens another box has
// already finished, and every push after that is a merge.
//
// THE CARD ASKED AND THE CARD WAS NOT ENOUGH. It has been wrong three times in
// one session with nobody noticing. Every other rule the engine cares about is
// a refusal naming the next move, and this one was prose.
//
// IT FORCES, AND THAT IS SAFE ONLY AT THE BEGINNING. The owner's ruling: at the
// start nothing of ours exists, so there is nothing to lose, and stopping would
// be refusing over an empty risk. The beginning is defined rather than assumed:
// no uncommitted change, and no commit ahead of origin. Either of those means
// this is not the beginning, and then it stops and says what it found.
//
// THE CONDITION IS THE WORLD AND NOT A FLAG. A box has landed when it is no
// longer behind, so nothing has to remember whether the landing happened. A
// flag would go stale the first time somebody fetched by hand.
//
// NOTHING HERE REACHES THE NETWORK. The demand compares this tree with what
// origin last showed, which git already holds. Only the landing itself fetches.

// Landed is what a landing did, for the record and for the person reading it.
type Landed struct {
	At     string `json:"at,omitempty"`  // the commit this tree stands on
	Tip    string `json:"tip,omitempty"` // the commit origin holds
	Ahead  int    `json:"ahead"`
	Behind int    `json:"behind"`
	Moved  bool   `json:"moved"`
	Says   string `json:"says"`
}

// aheadBehind answers how far this tree stands from what origin last showed.
// It asks the network nothing.
func aheadBehind(r Roots) (ahead, behind int, ok bool) {
	said, err := gitHere(r, "rev-list", "--left-right", "--count", "@{upstream}...HEAD")
	if err != nil {
		return 0, 0, false
	}
	parts := strings.Fields(said)
	if len(parts) != 2 {
		return 0, 0, false
	}
	behind, err1 := strconv.Atoi(parts[0])
	ahead, err2 := strconv.Atoi(parts[1])
	if err1 != nil || err2 != nil {
		return 0, 0, false
	}
	return ahead, behind, true
}

// theTreeCarriesNothingOfItsOwn answers whether anything here is uncommitted.
// A tree git cannot report on is treated as carrying something, because the
// safe reading of an unreadable tree is that it is not empty.
func theTreeCarriesNothingOfItsOwn(r Roots) bool {
	said, err := gitHere(r, "status", "--porcelain")
	if err != nil {
		return false
	}
	return strings.TrimSpace(said) == ""
}

// LandOnTheTip fetches, and puts this tree on what origin holds when it is safe
// to do so. It answers what it did either way.
func LandOnTheTip(r Roots) Landed {
	if _, err := gitHere(r, "fetch", "--quiet"); err != nil {
		return Landed{Says: "origin could not be reached, so nothing was landed: " + err.Error()}
	}
	at, err := gitHere(r, "rev-parse", "HEAD")
	if err != nil {
		return Landed{Says: "this tree has no commit to compare: " + err.Error()}
	}
	tip, err := gitHere(r, "rev-parse", "@{upstream}")
	if err != nil {
		return Landed{At: at, Says: "this tree tracks nothing, so there is no tip to land on"}
	}
	ahead, behind, ok := aheadBehind(r)
	if !ok {
		return Landed{At: at, Tip: tip, Says: "how far this tree stands from origin could not be read"}
	}
	stood := Landed{At: at, Tip: tip, Ahead: ahead, Behind: behind}
	if behind == 0 {
		stood.Says = "this tree is on the tip, " + aShortCommit(at)
		return stood
	}
	// THIS IS NO LONGER THE BEGINNING, so the force is off and the box is told
	// what it is standing on rather than losing it.
	if ahead > 0 || !theTreeCarriesNothingOfItsOwn(r) {
		stood.Says = fmt.Sprintf("this tree is %d behind %s and carries work of its own, "+
			"so it was not forced. Merge or push what is here first.", behind, aShortCommit(tip))
		return stood
	}
	if _, err := gitHere(r, "reset", "--hard", "--quiet", "@{upstream}"); err != nil {
		stood.Says = "the tip could not be taken: " + err.Error()
		return stood
	}
	stood.Moved = true
	stood.Says = fmt.Sprintf("this tree was %d behind and now stands on the tip, %s, off %s",
		behind, aShortCommit(tip), aShortCommit(at))
	return stood
}

// TheGroupHasNotLanded refuses a pull on a group branch that is behind, and
// names both commits so a reader can check rather than believe.
//
// IT IS THE SHAPE THE OTHER DEMANDS USE. AStaffShortfall and TooManyNotes both
// refuse a call and name the next move, and a third of that shape is a rule
// rather than a mechanism.
func TheGroupHasNotLanded(r Roots, tool, command string) (string, bool) {
	if !aPullCall(tool, command) {
		return "", false
	}
	if theGroupOnTheBranch(r) == "" {
		return "", false
	}
	ahead, behind, ok := aheadBehind(r)
	if !ok || behind == 0 {
		return "", false
	}
	at, _ := gitHere(r, "rev-parse", "HEAD")
	tip, _ := gitHere(r, "rev-parse", "@{upstream}")
	var b strings.Builder
	b.WriteString("THIS TREE IS NOT ON THE TIP, SO NOTHING IS HANDED OUT YET.\n\n")
	fmt.Fprintf(&b, "It stands on %s and origin holds %s. That is %d behind",
		aShortCommit(at), aShortCommit(tip), behind)
	if ahead > 0 {
		fmt.Fprintf(&b, " and %d ahead", ahead)
	}
	b.WriteString(".\n\n")
	b.WriteString("A box that works a stale tree hands out tokens another box has finished. " +
		"Land first: se --land, which takes the tip when this tree carries nothing " +
		"of its own, and says what it found when it does.\n")
	return b.String(), true
}

// aShortCommit is a commit as a person reads one.
func aShortCommit(commit string) string {
	commit = strings.TrimSpace(commit)
	if len(commit) > 12 {
		return commit[:12]
	}
	return commit
}
