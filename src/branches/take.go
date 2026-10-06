// The take and the open: a group reaches the cloud as a branch of its own, and
// a cloud box takes the next free one and writes its claim on the group, as
// openGroup, take and claimGroup in src/scripts/work.js answer them.
// [[spec/design_output/work#the-take-writes-the-record]]
package branches

import (
	"slices"
	"sort"
	"strings"

	"quackitect/src/front"
)

// A group reaches the cloud as a branch of its own, pushed off trunk, so no hand runs git for it. [[spec/design_output/work#a-group-is-a-ticket]]
func openGroup(d *Doors, name string, _ []string) int {
	if name == "" {
		d.warn("branch open needs a group: ./RUNME.sh branch open the-window-grows-tabs")
		return codeRefused
	}
	if d.offTrunk("open") {
		return codeRefused
	}
	at := ticketAt(name)
	text := d.textAt("origin/"+trunk, at)
	switch {
	case text == "":
		d.warn("%s carries no %s, so push the group first.", trunk, at)
		return codeRefused
	case !isGroup(text):
		d.warn("%s names no group process, so a branch carries nothing.", at)
		return codeRefused
	case fieldOf(text, "state") == closedState:
		d.warn("%s stands closed, and a closed group opens no branch.", at)
		return codeRefused
	}
	branch := workBranch + name
	d.fetch()
	if slices.ContainsFunc(d.standOf(), func(one stand) bool { return one.Branch == branch }) {
		d.say("%s already stands in the cloud, carrying %s.", branch, at)
		if d.marksTrunk(name) {
			return codeOK
		}
		return codeRed
	}
	mark := d.markOff(branch)
	if mark == "" {
		d.warn("The commit that opens %s came back refused, so nothing is pushed.", branch)
		return codeRed
	}
	if !d.loud("push", "origin", mark+":refs/heads/"+branch).OK {
		d.warn("%s", refusedPush(branch))
		return codeRed
	}
	d.say("%s stands at %s in the cloud, carrying %s.", branch, todo, at)
	if !d.marksTrunk(name) {
		return codeRed
	}
	d.say("Run ./RUNME.sh cloud trigger to fire a box at it.")
	return codeOK
}

// The commit a branch opens on, off trunk's tree, so trunk moving on leaves it unmerged. [[spec/design_output/work#a-merged-branch-closes]]
func (d *Doors) markOff(branch string) string {
	tree := d.quiet("rev-parse", "origin/"+trunk+"^{tree}")
	if !tree.OK || tree.Out == "" {
		return ""
	}
	said := d.quiet("commit-tree", tree.Out, "-p", "origin/"+trunk, "-m", branch+" opens")
	if !said.OK {
		return ""
	}
	return said.Out
}

// The refusal a desk meets where a verb moves it onto a work branch. [[spec/design_output/work#a-desk-works-on-trunk]]
func deskRefusal(what string) string {
	return "A desk works on " + trunk + " alone, and a cloud box works each " + workBranch + " branch, so " + what + ".\n" +
		"Run git switch " + trunk + ", and take a finished cloud branch in with ./RUNME.sh branch merge <name>."
}

// Takes the next free branch, or the one named, and writes the claim. [[spec/design_output/work#why-a-routine-needs-this]]
func take(d *Doors, name string, argv []string) int {
	over := name == overFlag
	if over {
		name = word(argv, 2)
	}
	if !d.cloud() {
		d.warn("%s", deskRefusal("branch take moves this box onto no branch"))
		return codeRefused
	}
	if d.dirty("") {
		return codeRefused
	}
	d.fetch()
	holding := d.heldHere()
	read := d.readFree(d.nowSeconds())
	if holding != nil {
		named := holding.Branch
		if name != "" {
			named = workBranch + name
		}
		if named == holding.Branch {
			d.say("You already hold %s, so the take hands its ask again.", holding.Branch)
			d.brief(holding.Branch, holding.Name, holding.Hand, holding.Text)
			return codeOK
		}
		past := d.pastHold(holding, read.Stand, read.Standing)
		if past == "" {
			d.warn("The take names %s, and this box holds %s, which stands in work.", named, holding.Branch)
			d.warn("Hand %s back with ./RUNME.sh branch release, or ./RUNME.sh branch done, then take %s.", holding.Branch, named)
			return codeRed
		}
		d.say("%s stands %s, so its hold drops and the take goes on to %s.", holding.Branch, past, named)
	}
	if name != "" {
		if live := d.liveHold(read.Stand, read.Standing, workBranch+name); live != "" {
			d.warn("%s", live)
			return codeRed
		}
	}
	if over && name == "" {
		return d.takeOver(read)
	}
	if name == "" {
		if stuck := d.stuckFirst(read.Stand, read.Standing, d.nowSeconds()); stuck != nil {
			return d.handsStuck(stuck)
		}
	}
	var open []stand
	for _, one := range read.Stand {
		switch read.Standing[one.Branch] {
		case todo:
			open = append(open, one)
		case orphan:
			d.say("%s shares no ancestor with trunk, so this take skips it.", one.Branch)
		}
	}
	if len(open) == 0 && len(read.Free) == 0 && name == "" {
		d.say("No work branch stands at %s. Nothing to take.", todo)
		return codeOK
	}
	free := read.Free
	if name != "" {
		free = nil
		for _, one := range read.Free {
			if one.Branch == workBranch+name {
				free = append(free, one)
			}
		}
		if len(free) == 0 {
			d.warn("work/%s stands at no free %s. Run ./RUNME.sh branch list to read where it stands.", name, todo)
			return codeRed
		}
	}
	if len(free) == 0 {
		d.say("Every branch at %s waits for another. Nothing to take.", todo)
		for _, one := range open {
			d.say("  %s waits for %s", one.Branch, strings.Join(waitsOf(one, read.Standing, read.Trunk), ", "))
		}
		return codeOK
	}
	wanted := slices.Clone(free)
	sort.SliceStable(wanted, func(a, b int) bool {
		if urgent(wanted[a].Ticket) != urgent(wanted[b].Ticket) {
			return urgent(wanted[a].Ticket)
		}
		return wanted[a].Branch < wanted[b].Branch
	})
	for _, one := range wanted {
		if d.dirty(one.Branch) {
			return codeRefused
		}
		if !d.onBranch(one.Branch) {
			return codeRed
		}
		stands := d.standsOpen(one.Name)
		if len(stands.Open) == 0 || len(stands.Busy) > 0 {
			return d.claimGroup(one)
		}
		d.say("%s stays at %s, because no hand here takes an open step.", one.Branch, todo)
		for _, child := range stands.Open {
			d.say("  %s", d.waitsAt(child, stands.Children))
		}
	}
	d.say("Answer it, then run ./RUNME.sh branch take again.")
	return codeOK
}

// The step a child stands at, and what it waits for, read in the order takeable reads it. [[spec/tickets/the-small-faults-land]]
func (d *Doors) waitsAt(one named, all []named) string {
	doc := frontOf(one.Text)
	var open []string
	for _, dep := range dependsOn(doc) {
		if !d.closedHere(all, dep) {
			open = append(open, dep)
		}
	}
	if len(open) > 0 {
		return one.Name + " waits for " + strings.Join(open, ", ") + " to close"
	}
	path := stepPathOf(doc)
	at := leafOf(doc, path)
	if at == nil {
		if path == "" {
			path = "no step"
		}
		return one.Name + " stands at " + path
	}
	if writes, why := writesHere(at, d.handRule(doc, all, "")); !writes {
		return one.Name + " " + why
	}
	var lacking []string
	for _, need := range at.Needs {
		if !holdsVerb(need) {
			lacking = append(lacking, need)
		}
	}
	if len(lacking) > 0 {
		return one.Name + " needs " + strings.Join(lacking, ", ") + " at " + at.Path
	}
	return one.Name + " stands at " + at.Path
}

// What a hand can take across a group: its children, the open ones, and the ones a hand here takes. [[spec/design_output/work#the-take-writes-the-record]]
type groupStands struct {
	Children, Open []named
	Busy           []string
}

// One place answers what a hand can take across a group, which the take reads before it claims. [[spec/design_output/work#the-take-writes-the-record]]
func (d *Doors) standsOpen(name string) groupStands {
	children := d.childrenHere(name)
	var open []named
	for _, one := range children {
		if fieldOf(one.Text, "state") != closedState {
			open = append(open, one)
		}
	}
	var busy []string
	for _, one := range append(slices.Clone(open), named{name, d.read(ticketAt(name))}) {
		if step := d.takeable(one, children, ""); step != "" {
			busy = append(busy, one.Name)
		}
	}
	return groupStands{children, open, busy}
}

// Moves onto a branch at origin's tip, and writes every parked note back after. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
func (d *Doors) onBranch(branch string) bool {
	parked := d.parkedFiles()
	for _, one := range parked {
		d.quiet("checkout", "--", one.Name)
	}
	if !d.quiet("switch", branch).OK && !d.loud("switch", "-c", branch, "origin/"+branch).OK {
		return false
	}
	d.quiet("reset", "--hard", "origin/"+branch)
	for _, one := range parked {
		_ = d.write(one.Name, one.Text)
	}
	return true
}

// The notes a todo tag parks, each with its text. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
func (d *Doors) parkedFiles() []named {
	var out []named
	for _, one := range d.standingIn() {
		if one.Parked {
			out = append(out, named{Name: one.Name, Text: d.read(one.Name)})
		}
	}
	return out
}

// Why a push came back: a race is one road, and a door turning it away another. [[spec/design_output/work#the-take-writes-the-record]]
func refusedPush(branch string) string {
	return strings.Join([]string{
		"The push of " + branch + " came back refused, so the take stands undone.",
		"Somebody taking it first is one road, and a push door turning it away is another.",
		"The lines above say which. Clear it, then run branch take again.",
	}, "\n")
}

// Writes the claim on a group, commits and pushes it, then takes trunk in and prints the ask. [[spec/design_output/work#the-take-writes-the-record]]
func (d *Doors) claimGroup(one stand) int {
	at := ticketAt(one.Name)
	was := d.read(at)
	hand := d.handOf()
	before := d.head()
	role := roleOf(hand)
	from, base := handedOver(was, role, before)
	_ = d.write(at, withEntry(base, front.Ordered{{Key: "step", Value: stepOf(was)}, {Key: "hand", Value: role}, {Key: "hash_before", Value: before}}))
	d.quiet("add", at)
	says := role + " takes it"
	if from != "" {
		says = role + " takes it over from " + from
	}
	committed := d.quiet("commit", "-m", one.Branch+": "+says)
	if !committed.OK {
		d.quiet("reset", "--", at)
		_ = d.write(at, was)
		d.warn("The claim on %s would not commit, so the take stands undone.", one.Branch)
		if committed.Err != "" {
			d.warn("%s", committed.Err)
		} else {
			d.warn("%s", committed.Out)
		}
		return codeRed
	}
	if !d.loud("push", "origin", one.Branch).OK {
		d.quiet("reset", "--keep", "origin/"+one.Branch)
		d.warn("%s", refusedPush(one.Branch))
		return codeRed
	}
	d.writeBeat(one.Name, role, false)
	if from != "" {
		d.takesRescue(one)
	}
	if d.sync() == codeRed {
		d.warn("Resolve the conflict on %s and commit it, then work the ask below.", one.Branch)
		d.brief(one.Branch, one.Name, hand, was)
		return codeRed
	}
	d.brief(one.Branch, one.Name, hand, was)
	return codeOK
}

// The brief a take prints: where the box stands, and the group's ask. [[spec/design_output/work#the-take-writes-the-record]]
func (d *Doors) brief(branch, name, hand, text string) {
	d.say("You are on %s, and %s holds it.", branch, hand)
	d.say("Its tickets stand in %s, and %s is the group itself.", ticketsFolder, ticketAt(name))
	d.say("Run ./RUNME.sh branch done when the last of them closes.\n")
	d.say("%s", askOf(text))
}
