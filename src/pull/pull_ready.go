// A desk's empty queue reads the cloud branches first: the first one standing
// done names the verbs that take it in, off readyToMerge in
// src/scripts/work-review.js and the standing reads in work-stands.js.
// [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
package pull

import (
	"fmt"
	"strings"
)

// The refs a fetch leaves for origin's branches. [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
const originRefs = "refs/remotes/origin/"

// Whether a cloud branch stands done, and the rows that take it in where one does. [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
func (it *It) ReadyToMerge() bool {
	refs, err := it.Git.Refs(originRefs + WorkBranch)
	if err != nil {
		return false
	}
	done := []string{}
	for _, ref := range refs {
		branch := strings.TrimPrefix(ref.Name, originRefs)
		name := strings.TrimPrefix(branch, WorkBranch)
		if _, ok := it.Git.MergeBase("origin/"+Trunk, "origin/"+branch); ok && !it.landedOnTrunk(name) && it.groupDone(ref.Hash, name) {
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
	said, ok := it.Git.Show("origin/"+Trunk, Tickets+"/"+name+".md")
	return ok && FieldOf(said+"\n", "state") == Closed
}

// A branch's group ticket at its tip stands a group, closed. [[spec/design_output/work#held-derives-from-the-record]]
func (it *It) groupDone(tip, name string) bool {
	said, ok := it.Git.Show(tip, Tickets+"/"+name+".md")
	return ok && IsGroup(said+"\n") && FieldOf(said+"\n", "state") == Closed
}
