// The trunk end of a work branch: merge takes a done branch into trunk, and
// close deletes a branch trunk already carries, as src/scripts/work-merge.js
// answers them, with the cloud marker trunk's copy of a group carries.
// [[spec/design_output/work#a-merged-branch-closes]]
package branches

import (
	"regexp"
	"slices"
	"sort"
	"strings"

	"quackitect/src/failure"
)

// The key the group ticket on trunk carries while its branch stands in the cloud. [[spec/rationales/git-stays-the-archive]]
const cloudMark = "cloud"

// Where a local branch stands, and where origin keeps each pull request's head. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
const (
	localRefs = "refs/heads/"
	pullRefs  = "refs/pull/"
)

// The error a two-answer call ends on. [[spec/design_output/doors#a-door-standing-on-another]]
func second[T any](_ T, err error) error { return err }

// A branch a cloud routine cuts carries no group, so it reads against trunk by its commits. [[spec/design_output/work#a-cloud-branch-comes-in]]
var cloudBranch = regexp.MustCompile(`^claude/`)

var diffLine = regexp.MustCompile(`^[-+]`)

var diffHead = regexp.MustCompile(`^[-+][-+][-+]`)

// Sets the marker on trunk's copy of a group, or drops it, and stages the file where it moves. [[spec/tickets/groups-carry-the-cloud-marker]]
func (d *Doors) marks(name string, on bool) bool {
	at := ticketAt(name)
	text := d.read(at)
	if text == "" || (fieldOf(text, cloudMark) == "true") == on {
		return false
	}
	if on {
		text = withField(text, cloudMark, "true")
	} else {
		text = withoutField(text, cloudMark)
	}
	_ = d.write(at, text)
	_ = d.Repo.Add([]string{at})
	return true
}

// The marker lands on trunk once the branch stands, so a refused branch push leaves trunk bare. [[spec/tickets/groups-carry-the-cloud-marker]]
func (d *Doors) marksTrunk(name string) bool {
	if !d.marks(name, true) {
		return true
	}
	_, _ = d.Repo.Commit(name+": opens in the cloud", nil)
	if d.push(trunk) {
		return true
	}
	d.warn("The push of %s comes back refused, so it carries no marker. Run ./RUNME.sh branch open %s again.", trunk, name)
	return false
}

// Whether the box stands off trunk or on a dirty tree, which every verb committing on trunk refuses. [[spec/tickets/groups-carry-the-cloud-marker]]
func (d *Doors) offTrunk(what string) bool {
	if on := d.here(); on != trunk {
		d.raises(failure.Raise(d.Failures, "branch-off-trunk", "branch "+what+" runs on "+trunk+", and this is "+on+"."))
		return true
	}
	return d.dirty("")
}

// Takes a done branch into trunk, runs the check on the merge commit, pushes, and closes the branch. [[spec/design_output/work#the-merge-lands-the-truth]]
func merge(d *Doors, name string, argv []string) int {
	if cloudBranch.MatchString(name) {
		return d.mergeCloud(name)
	}
	if d.dirty("") {
		return codeRefused
	}
	if name == "" {
		d.warn("branch merge needs a name: ./RUNME.sh branch merge fix-lsp")
		return codeRefused
	}
	branch := workBranch + name
	if on := d.here(); on != trunk {
		d.warn("branch merge runs on %s, and this is %s.", trunk, on)
		return codeRefused
	}
	d.fetch()
	ticket := d.textAt("origin/"+branch, ticketAt(name))
	if !isGroup(ticket) {
		d.warn("%s carries no group at %s.", branch, ticketAt(name))
		return codeRed
	}
	if status := groupStanding(ticket); status != done {
		if status == "" {
			status = "no status"
		}
		d.warn("%s stands at %s, so it is not ready.", branch, status)
		return codeRed
	}
	if !slices.Contains(argv, "--closed") {
		if pull := d.pullCarrying(branch); pull != "" {
			d.warn("%s stands in pull request #%s, and GitHub lands it once the check passes.", branch, pull)
			d.warn("Where #%s stands closed unmerged, run ./RUNME.sh branch merge %s --closed.", pull, name)
			return codeRed
		}
	}
	if moved := d.movedOnTrunk(branch); len(moved) > 0 {
		d.warn("%s moved what %s holds, so the branch is no longer the truth.", trunk, branch)
		for _, one := range moved {
			d.warn("  %s", one.Path)
			for _, line := range one.Lines {
				d.warn("    %s", line)
			}
		}
		d.warn("Take %s into %s first, resolve it there, then merge.", trunk, branch)
		return codeRed
	}
	was := d.head()
	if _, err := d.Repo.Merge("origin/"+branch, "", true); !d.loudly(err) {
		held := d.conflicted(ticketAt(name))
		if !held {
			d.marks(name, false)
		}
		d.warn("%s conflicts. Resolve it, commit, then run branch close.", branch)
		if held {
			d.warn("Drop %s: true from %s as you resolve it.", cloudMark, ticketAt(name))
		}
		return codeRed
	}
	freed := d.freeChildren(name, "")
	if unmarked := d.marks(name, false); len(freed) > 0 || unmarked {
		_ = d.Repo.Amend()
	}
	d.installs()
	if ok, says := d.checkSays(); !ok {
		_ = d.Repo.ResetTo(was, true)
		d.warn("The check answers red on the merge commit, so %s stands where it was.", trunk)
		if says == "" {
			says = "Run ./RUNME.sh check to read what it says."
		}
		d.warn("%s", says)
		return codeRed
	}
	d.say("%s is merged, and the check passes on the merge commit.", branch)
	for _, one := range freed {
		d.say("  %s lost its group, and stands loose on %s.", one, trunk)
	}
	if !d.push(trunk) {
		d.say("Push %s, then run ./RUNME.sh branch close %s.", trunk, name)
		return codeOK
	}
	if closeVerb(d, name, nil) != codeOK {
		d.say("%s stands on the remote, and trunk carries its ticket closed.", branch)
	}
	return codeOK
}

// Whether git lists the path unmerged. [[spec/tickets/conflicts-drop-the-marker]]
func (d *Doors) conflicted(at string) bool {
	unmerged, _ := d.Repo.Unmerged()
	return slices.Contains(unmerged, at)
}

// The number of the pull request whose head stands at the branch tip, or nothing. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
func (d *Doors) pullCarrying(branch string) string {
	tip := d.rev("origin/" + branch)
	if tip == "" {
		return ""
	}
	pulls, _ := d.Repo.RemoteRefs(pullRefs)
	for _, one := range pulls {
		if number, ok := strings.CutSuffix(strings.TrimPrefix(one.Name, pullRefs), "/head"); ok && one.Hash == tip && !strings.Contains(number, "/") {
			return number
		}
	}
	return ""
}

// Takes a cloud routine's branch into trunk by its commits, checks, pushes and deletes it. [[spec/design_output/work#a-cloud-branch-comes-in]]
func (d *Doors) mergeCloud(branch string) int {
	if d.dirty("") {
		return codeRefused
	}
	if on := d.here(); on != trunk {
		d.warn("branch merge runs on %s, and this is %s.", trunk, on)
		return codeRefused
	}
	d.fetch()
	carried, _ := d.Repo.Cherry(trunk, "origin/"+branch)
	left := len(carried)
	was := d.head()
	if left > 0 && !d.loudly(second(d.Repo.Merge("origin/"+branch, "", true))) {
		d.warn("%s conflicts. Resolve it, commit, then run branch close.", branch)
		return codeRed
	}
	d.installs()
	if ok, says := d.checkSays(); !ok {
		if left > 0 {
			_ = d.Repo.ResetTo(was, true)
		}
		d.warn("The check answers red on %s, so %s stands.", trunk, branch)
		if says == "" {
			says = "Run ./RUNME.sh check to read what it says."
		}
		d.warn("%s", says)
		return codeRed
	}
	if !d.push(trunk) {
		d.warn("The push of %s comes back refused, so %s stands.", trunk, branch)
		return codeRed
	}
	if !d.loudly(d.Repo.DeleteRemote(branch)) {
		return codeRed
	}
	_ = d.Repo.DeleteRef(localRefs + branch)
	if left > 0 {
		d.say("%s is merged, the check passes, and the branch is gone.", branch)
	} else {
		d.say("%s carries %s already, the check passes, and the branch is gone.", trunk, branch)
	}
	return codeOK
}

// A ticket trunk moved under a branch, with the lines it moved. [[spec/design_output/work#the-merge-lands-the-truth]]
type movedTicket struct {
	Path  string
	Lines []string
}

// The tickets a branch touches that trunk moved since they shared a base. [[spec/design_output/work#the-merge-lands-the-truth]]
func (d *Doors) movedOnTrunk(branch string) []movedTicket {
	_, base := d.baseOnTrunk(branch)
	if base == "" {
		return nil
	}
	var out []movedTicket
	touched, _ := d.Repo.Diff(base, "origin/"+branch)
	for _, change := range touched {
		path := change.Path
		if !strings.HasPrefix(path, ticketsFolder+"/") {
			continue
		}
		var lines []string
		patch, _ := d.Repo.Patch(base, "origin/"+trunk, false, path)
		for _, one := range strings.Split(patch, "\n") {
			if diffLine.MatchString(one) && !diffHead.MatchString(one) {
				lines = append(lines, one)
			}
		}
		if len(lines) > 0 {
			out = append(out, movedTicket{path, lines})
		}
	}
	return out
}

// Frees a group's open children, to the parent named or the top. [[spec/design_output/work#the-merge-frees-the-tickets]]
func (d *Doors) freeChildren(name, parent string) []string {
	var out []string
	for _, one := range d.childrenHere(name) {
		if fieldOf(one.Text, "state") == closedState {
			continue
		}
		d.filed(one, parent)
		out = append(out, one.Name)
	}
	return out
}

// Leaves the person route loose on main, and files each open child into the group's parent. [[spec/design_output/work#a-box-leaves]]
func (d *Doors) filesUp(name, text string) []string {
	parent := fieldOf(text, groupField)
	var out []string
	for _, one := range d.childrenHere(name) {
		if fieldOf(one.Text, "state") == closedState {
			continue
		}
		into := parent
		if onPersonRoute(one.Text) {
			into = ""
		}
		d.filed(one, into)
		out = append(out, one.Name)
	}
	if parent == "" {
		return out
	}
	for _, one := range d.addedHere() {
		if one.Name == name || fieldOf(one.Text, groupField) != "" || fieldOf(one.Text, "state") == closedState || onPersonRoute(one.Text) {
			continue
		}
		d.filed(one, parent)
		out = append(out, one.Name)
	}
	return out
}

// Writes a ticket into a group, or out of every group, and stages it. [[spec/design_output/work#the-merge-frees-the-tickets]]
func (d *Doors) filed(one named, parent string) {
	at := ticketAt(one.Name)
	text := withoutField(one.Text, groupField)
	if parent != "" {
		text = withField(one.Text, groupField, parent)
	}
	_ = d.write(at, text)
	_ = d.Repo.Add([]string{at})
}

// The install RUNME.sh runs before every verb, run again over the merged tree. [[spec/design_output/work#the-merge-lands-the-truth]]
func (d *Doors) installs() {
	d.run(d.Root, nil, "", "sh", d.at("src/scripts/install.sh"))
}

// The check under --errors on the tree as it stands, and the red cases it prints. [[spec/tickets/the-verbs-need-no-wrapper]]
func (d *Doors) checkSays() (bool, string) {
	said := d.verb(d.Root, "check", "--errors")
	return said.OK, said.Out
}

// Deletes a branch trunk carries, or every one, the marker dropped on trunk first. [[spec/design_output/work#a-merged-branch-closes]]
func closeVerb(d *Doors, name string, argv []string) int {
	forced := slices.Contains(argv, "--force")
	if d.offTrunk("close") {
		return codeRefused
	}
	d.fetch()
	if ahead := d.ahead("origin/"+trunk, trunk); ahead != 0 && !forced {
		d.warn("%s holds %d commit(s) origin has never seen.", trunk, ahead)
		d.warn("Push %s first, so the merge outlives the branch.", trunk)
		return codeRed
	}
	inTrunk := d.mergedHere()
	var wanted []string
	switch {
	case name != "" && ownBranch.MatchString(name):
		wanted = []string{name}
	case name != "":
		wanted = []string{workBranch + name}
	default:
		for branch := range inTrunk {
			wanted = append(wanted, branch)
		}
		sort.Strings(wanted)
	}
	if len(wanted) == 0 {
		d.say("No work branch stands inside %s.", trunk)
		return codeOK
	}
	shut := 0
	for _, branch := range wanted {
		if !inTrunk[branch] && !forced {
			d.warn("%s is outside %s, so closing it drops its work.", branch, trunk)
			d.warn("Merge it first, or run close %s --force.", ticketNamed(branch))
			continue
		}
		if d.marks(ticketNamed(branch), false) {
			_, _ = d.Repo.Commit(ticketNamed(branch)+": leaves the cloud", nil)
			if !d.push(trunk) {
				d.warn("The push of %s comes back refused, so %s stands.", trunk, branch)
				continue
			}
		}
		if !d.loudly(d.Repo.DeleteRemote(branch)) {
			continue
		}
		_ = d.Repo.DeleteRef(localRefs + branch)
		unmerged := ""
		if !inTrunk[branch] {
			unmerged = ", unmerged"
		}
		d.say("%s is closed%s.", branch, unmerged)
		shut++
	}
	if shut > 0 || name == "" {
		return codeOK
	}
	return codeRed
}
