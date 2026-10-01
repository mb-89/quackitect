// The git commands that write the repository, off lib/git-writes.js, each
// with the verb standing for it or the road where none stands.
// [[spec/tickets/cage-command-rules-port]]
package command

import "strings"

// The roads the rows share. [[spec/design_output/bash#git-writes-take-verbs]]
const (
	lands  = "Land the change through ./RUNME.sh commit, which stages, commits and runs the check."
	merges = "Take a branch in with ./RUNME.sh branch merge <branch>, on main."
	syncs  = "Take main in with ./RUNME.sh branch sync, on main or a work branch."
)

// [[spec/design_output/bash#git-writes-take-verbs]]
var gitWrites = map[string]string{
	"add":         lands,
	"stage":       lands,
	"rm":          lands,
	"commit":      lands,
	"revert":      "No verb reverts. Write the change back, and land it through ./RUNME.sh commit.",
	"push":        "Push with ./RUNME.sh push once the check answers green, or let ./RUNME.sh commit push from a cloud box.",
	"merge":       merges,
	"pull":        syncs,
	"mv":          "Move a name with ./RUNME.sh rename <from> <to>, which rewrites every reach.",
	"stash":       "No verb stashes. " + lands,
	"rebase":      "No verb rewrites history. " + syncs,
	"reset":       "No verb moves a branch back. Put a write back with mcp__level0__undo, or ask a person.",
	"tag":         "No verb tags. A tag is a person's act, so ask a person.",
	"cherry-pick": "No verb takes one commit. " + merges,
}

// One row a git write, and a move under the ticket folder answers the rename verb alone. [[spec/design_output/bash#git-writes-take-verbs]]
func gitWriteRows(command string) []Row {
	var out []Row
	segments, _ := partsOf(command)
	for _, one := range segments {
		words := wordsIn(one)
		if BaseName(first(words)) != "git" {
			continue
		}
		rest := afterGit(words)
		road, ok := gitWrites[first(rest)]
		if !ok {
			continue
		}
		sub := rest[0]
		if sub == "mv" && movesATicket(rest[1:]) {
			out = append(out, row(TicketRename, "git mv",
				"A ticket moves through ./RUNME.sh rename <from> <to>, which rewrites every",
				"link reaching it. git mv leaves each link pointing at the old name."))
			continue
		}
		out = append(out, row(GitWrite, "git "+sub,
			"git "+sub+" writes the repository, and the agent reaches git through the",
			"engine alone. "+road))
	}
	return out
}

// [[spec/design_output/bash#git-writes-take-verbs]]
func movesATicket(args []string) bool {
	for _, arg := range args {
		said := strings.TrimPrefix(Clean(arg), "./")
		if said == publicTickets || strings.HasPrefix(said, publicTickets+"/") {
			return true
		}
	}
	return false
}
