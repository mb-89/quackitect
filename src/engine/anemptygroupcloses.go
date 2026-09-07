package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// AN EMPTY GROUP IS NOT A QUIET ONE.
//
// The queue answers wait when it has nothing to hand out, and wait reads as
// nothing to do. On a group branch it is the opposite: the bucket is empty
// because the group is finished, and the closing work has not started. A box
// that reads wait stops there, with its notes private, its branch unmerged and
// its learnings dying with the container.
//
// THE CARD ASKED THE AGENT TO REMEMBER FOUR THINGS at the end of a session,
// which is the moment an agent is least likely to remember anything. Every
// other rule this engine cares about is a refusal naming the next move.
//
// EACH STEP IS READ OFF THE WORLD, not off a list beside it. The queue answers
// whether there is work, the retro folder answers whether a retro ran, the
// notes answer themselves, and the marker is a file. So nothing has to be kept
// in step with anything, and a step done by hand counts the same as one done
// through a verb.
//
// THE CLOSING LOOPS BACK. A retro may mint into its own bucket, which makes the
// group not empty again, so the first question is asked every time. Without
// that a box would mint something fixable and then merge away from it.
//
// THE BOX WRITES THE MARKER AND THE ENGINE READS IT. A marker the engine wrote
// would be the engine saying the work is finished, and that is the box's claim
// to make.

// The steps a group owes, in the order they are owed.
const (
	closingWork   = "work"   // the bucket is not empty, so the group is not done
	closingRetro  = "retro"  // no retro has run over this period
	closingNotes  = "notes"  // notes are still private
	closingMarker = "marker" // the branch does not say it is finished
	closingDone   = "done"   // nothing is owed but the merge itself
)

// Closing is where a group stands, and what it owes next.
type Closing struct {
	Step  string `json:"step"`
	Group string `json:"group,omitempty"`
	Says  string `json:"says,omitempty"`
}

// theMarkerPath is the file a box writes to say its group is finished. It is
// under doc/work, which git carries, because the reader is a sweeper on another
// box and nothing under .se reaches one.
func theMarkerPath(r Roots, group string) string {
	return filepath.Join(r.Work, "doc", "work", "groups", group+".done")
}

// aRetroHasRun answers whether this tree carries a retro folder. A retro makes
// one folder per run, so one folder is one retro.
func aRetroHasRun(r Roots) bool {
	entries, err := os.ReadDir(RetroDir(r))
	if err != nil {
		return false
	}
	for _, e := range entries {
		if e.IsDir() {
			return true
		}
	}
	return false
}

// TheClosing answers what a group box owes. A tree that is not on a group
// branch owes nothing and is answered as working.
func TheClosing(r Roots) Closing {
	group := theGroupOnTheBranch(r)
	if group == "" {
		return Closing{Step: closingWork}
	}
	if work, _ := TheQueueWouldHandOut(r); work > 0 {
		return Closing{Step: closingWork, Group: group, Says: fmt.Sprintf(
			"%d token(s) are open in %s, so the group is not done.", work, group)}
	}
	if !aRetroHasRun(r) {
		return Closing{Step: closingRetro, Group: group, Says: "THE GROUP IS EMPTY, " +
			"WHICH MEANS IT IS FINISHED RATHER THAN QUIET.\n\n" +
			"Run the retro. It is the cycle boundary, and it is what turns this " +
			"period into something a reader who was not here can use.\n\n" +
			"You never widen your own filter. An empty group is the signal to close " +
			"it, and never the signal to go shopping on trunk.\n"}
	}
	if notes := NotesInHand(r); len(notes) > 0 {
		var b strings.Builder
		fmt.Fprintf(&b, "%d NOTE(S) ARE STILL PRIVATE, AND PRIVATE DOES NOT LEAVE THIS BOX.\n\n",
			len(notes))
		for _, one := range notes {
			fmt.Fprintf(&b, "  %s  %s\n", one.ID, one.Title)
		}
		b.WriteString("\nEach one is dropped, or minted as a tracked token that travels. " +
			"Mint into this group's own bucket when the group can fix it, or into no " +
			"bucket at all, and never into somebody else's.\n")
		return Closing{Step: closingNotes, Group: group, Says: b.String()}
	}
	if _, err := os.Stat(theMarkerPath(r, group)); err != nil {
		return Closing{Step: closingMarker, Group: group, Says: "THE WORK IS DONE AND THE " +
			"BRANCH DOES NOT SAY SO.\n\nWrite the marker, which is what a sweeper reads:\n\n  " +
			filepath.ToSlash(filepath.Join("doc", "work", "groups", group+".done")) +
			"\n\nIt is under doc/work because git carries that, and the reader is on " +
			"another box.\n"}
	}
	return Closing{Step: closingDone, Group: group, Says: "THE GROUP IS CLOSED. Merge " +
		"this branch into trunk, push, and say the branch is ready to sweep.\n\n" +
		"Do not attempt the delete. It answers 403 and always will, and the branch " +
		"is swept from outside.\n"}
}

// TheGroupIsNotClosed refuses a pull while the closing owes a step.
//
// IT HOLDS THE PULL AND NOTHING ELSE, the way the other two demands do. Every
// step it names is done with a call this would otherwise be holding.
func TheGroupIsNotClosed(r Roots, tool, command string) (string, bool) {
	if !aPullCall(tool, command) {
		return "", false
	}
	switch c := TheClosing(r); c.Step {
	case closingRetro, closingNotes, closingMarker:
		return c.Says, true
	}
	return "", false
}
