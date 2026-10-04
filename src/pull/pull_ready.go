// A desk's empty queue reads the cloud branches first: the first one standing
// done names the verbs that take it in, off readyToMerge in
// src/scripts/work-review.js and the standing reads in work-stands.js.
// [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
package pull

import (
	"fmt"
	"strings"
)

// Whether a cloud branch stands done, and the rows that take it in where one does. [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
func (it *It) ReadyToMerge() bool {
	said := it.Git.Run("for-each-ref", "--format=%(refname:short) %(objectname)", "refs/remotes/origin/"+WorkBranch)
	if !said.OK {
		return false
	}
	done := []string{}
	for _, row := range strings.Split(said.Out, "\n") {
		parts := strings.Fields(row)
		if len(parts) < 2 {
			continue
		}
		branch := strings.TrimPrefix(parts[0], "origin/")
		name := strings.TrimPrefix(branch, WorkBranch)
		if it.Git.Run("merge-base", "origin/"+Trunk, "origin/"+branch).OK && !it.landedOnTrunk(name) && it.groupDone(parts[1], name) {
			done = append(done, branch)
		}
	}
	if len(done) == 0 {
		return false
	}
	name := strings.TrimPrefix(done[0], WorkBranch)
	it.Println(fmt.Sprintf("work  %s stands done, so the desk takes it in:", done[0]))
	it.Println(fmt.Sprintf("  1. ./RUNME.sh branch review %s, and fix what it names", name))
	it.Println(fmt.Sprintf("  2. ./RUNME.sh branch merge %s, from %s", name, Trunk))
	it.Println(fmt.Sprintf("  3. ./RUNME.sh branch close %s", name))
	if len(done) > 1 {
		it.Println(fmt.Sprintf("%d more stand done behind it.", len(done)-1))
	}
	return true
}

// A branch stands merged where trunk carries its group ticket closed. [[spec/design_output/work#a-merged-branch-closes]]
func (it *It) landedOnTrunk(name string) bool {
	said := it.Git.Run("show", "origin/"+Trunk+":"+Tickets+"/"+name+".md")
	return said.OK && FieldOf(said.Out+"\n", "state") == Closed
}

// A branch's group ticket at its tip stands a group, closed. [[spec/design_output/work#held-derives-from-the-record]]
func (it *It) groupDone(tip, name string) bool {
	said := it.Git.Run("show", tip+":"+Tickets+"/"+name+".md")
	return said.OK && IsGroup(said.Out+"\n") && FieldOf(said.Out+"\n", "state") == Closed
}
