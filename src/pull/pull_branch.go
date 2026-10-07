// The branch a pull takes on trunk, the free tickets a desk works there,
// and the prompt a hand of its own takes, off src/scripts/pull-hand.js.
// [[spec/design_output/pull#the-engine-takes-the-branch]]
package pull

import (
	"fmt"
	"strings"

	"quackitect/src/failure"
	"quackitect/src/q"
)

// A free ticket stands in no group and is no group, so a desk works it on trunk. [[spec/design_output/pull#the-engine-takes-the-branch]]
func freeIn(all []*Held) []*Held {
	out := []*Held{}
	for _, one := range all {
		if !one.Private && FieldOf(one.Text, GroupField) == "" && !IsGroup(one.Text) {
			out = append(out, one)
		}
	}
	return out
}

// An open group works on a branch, so a desk cuts one where none stands and leaves the group to the cloud. [[spec/design_output/pull#the-engine-takes-the-branch]]
func (it *It) cutForGroups(all []*Held) {
	stands := map[string]bool{}
	heads, _ := it.Git.RemoteHeads(WorkBranch)
	for _, head := range heads {
		stands[head] = true
	}
	for _, one := range all {
		if one.Private || !IsGroup(one.Text) || FieldOf(one.Text, "state") != Open {
			continue
		}
		branch := WorkBranch + one.Name
		if stands[branch] || it.Git.Branch(branch, Trunk) != nil {
			continue
		}
		it.Git.Push(branch, true)
		it.Println(branch + " is cut and pushed, because a group works on a branch and the cloud takes it.")
	}
}

// A group a pull names on trunk. [[spec/design_output/pull#the-engine-takes-the-branch]]
func (it *It) namedGroup(name string) string {
	for _, one := range TicketsHere(it.Disk) {
		if !one.Private && one.Name == name && IsGroup(one.Text) {
			return name
		}
	}
	return ""
}

// The pull on trunk: a cloud box takes a branch, and a desk takes none. A negative answer hands the pull on to the queue. [[spec/design_output/pull#the-engine-takes-the-branch]]
func (it *It) branchTaken(named string) int {
	if it.Cloud {
		return it.Take(named)
	}
	if named != "" {
		return it.deskRefused("the pull takes no branch for " + named)
	}
	if it.Ready != nil && it.Ready() {
		return 0
	}
	return -1
}

// [[spec/design_output/work#a-desk-works-on-trunk]]
// The message alone, since the node desk-works-on-trunk holds the remedy. [[spec/tickets/go-pull-desk-remedy-once]]
func (it *It) deskRefused(what string) int {
	it.Refuse(failure.Raise(it.Failures, "desk-works-on-trunk",
		fmt.Sprintf("A desk works on %s alone, and a cloud box works each %s branch, so %s.", Trunk, WorkBranch, what)))
	return 2
}

// [[spec/design_output/pull#a-hand-of-its-own]]
func (it *It) spawnAnswer(one *Held, leaf *Leaf, why string) int {
	name := fmt.Sprintf("%s-%d", helper, len(entriesOf(one.Front))+1)
	it.Say(spawn, fmt.Sprintf("%s at %s %s.", one.Name, leaf.Path, why),
		"Spawn a hand of its own with the prompt below in the background, and take the next item. Pull again once it answers.")
	it.Println("")
	it.Println(spawnPrompt(one.Name, leaf, name))
	return 0
}

// The prompt the pull hands a reader where it takes no step itself, for a hand of its own. [[spec/design_output/pull#a-hand-of-its-own]]
func spawnPrompt(ticket string, leaf *Leaf, name string) string {
	back := CallOf("ticket", "pull", ticket, "--as", name, "--pass", "--fields", "<json>") + ", or --fail \"why\" in place of --pass"
	if leaf.holdsForm("verdict") != nil {
		back = CallOf("ticket", "pull", ticket, "--as", name, "--fields", "<json>")
	}
	return strings.Join([]string{
		fmt.Sprintf("%s, named %s, and you work one step of one ticket.", q.HandOfItsOwn, name),
		"",
		fmt.Sprintf("1. Call %s. It hands you %s at %s, with its fields and its guidance.", CallOf("ticket", "pull", "--as", name), ticket, leaf.Path),
		"2. Answer each field the pull names as a key of one JSON object, and pass it as --fields to the hand-back below. The engine writes the ticket.",
		fmt.Sprintf("3. Call %s. It checks the hand-back and answers done, or refused with what to fix.", back),
		"4. Answer with what the last pull said, word for word.",
	}, "\n")
}
