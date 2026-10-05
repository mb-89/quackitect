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
)

// The key the group ticket on trunk carries while its branch stands in the cloud. [[spec/rationales/git-stays-the-archive]]
const cloudMark = "cloud"

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
	d.quiet("add", at)
	return true
}

// The marker lands on trunk once the branch stands, so a refused branch push leaves trunk bare. [[spec/tickets/groups-carry-the-cloud-marker]]
func (d *Doors) marksTrunk(name string) bool {
	if !d.marks(name, true) {
		return true
	}
	d.quiet("commit", "-m", name+": opens in the cloud")
	if d.loud("push", "origin", trunk).OK {
		return true
	}
	d.warn("The push of %s comes back refused, so it carries no marker. Run ./RUNME.sh branch open %s again.", trunk, name)
	return false
}

// Whether the box stands off trunk or on a dirty tree, which every verb committing on trunk refuses. [[spec/tickets/groups-carry-the-cloud-marker]]
func (d *Doors) offTrunk(what string) bool {
	if on := d.here(); on != trunk {
		d.warn("branch %s runs on %s, and this is %s.", what, trunk, on)
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
	if !d.loud("merge", "--no-ff", "--no-edit", "origin/"+branch).OK {
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
		d.quiet("commit", "--amend", "--no-edit")
	}
	d.installs()
	if ok, says := d.checkSays(); !ok {
		d.quiet("reset", "--hard", was)
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
	if !d.loud("push", "origin", trunk).OK {
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
	return slices.Contains(strings.Split(d.quiet("diff", "--name-only", "--diff-filter=U").Out, "\n"), at)
}

// The number of the pull request whose head stands at the branch tip, or nothing. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
func (d *Doors) pullCarrying(branch string) string {
	tip := d.quiet("rev-parse", "origin/"+branch).Out
	if tip == "" {
		return ""
	}
	for _, row := range strings.Split(d.quiet("ls-remote", "origin", "refs/pull/*/head").Out, "\n") {
		parts := strings.Split(row, "\t")
		if parts[0] != tip {
			continue
		}
		if len(parts) < 2 {
			return ""
		}
		if ref := strings.Split(parts[1], "/"); len(ref) > 2 {
			return ref[2]
		}
		return ""
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
	left := 0
	for _, row := range strings.Split(d.quiet("cherry", trunk, "origin/"+branch).Out, "\n") {
		if strings.HasPrefix(row, "+") {
			left++
		}
	}
	was := d.head()
	if left > 0 && !d.loud("merge", "--no-ff", "--no-edit", "origin/"+branch).OK {
		d.warn("%s conflicts. Resolve it, commit, then run branch close.", branch)
		return codeRed
	}
	d.installs()
	if ok, says := d.checkSays(); !ok {
		if left > 0 {
			d.quiet("reset", "--hard", was)
		}
		d.warn("The check answers red on %s, so %s stands.", trunk, branch)
		if says == "" {
			says = "Run ./RUNME.sh check to read what it says."
		}
		d.warn("%s", says)
		return codeRed
	}
	if !d.loud("push", "origin", trunk).OK {
		d.warn("The push of %s comes back refused, so %s stands.", trunk, branch)
		return codeRed
	}
	if !d.loud("push", "origin", "--delete", branch).OK {
		return codeRed
	}
	d.quiet("branch", "-D", branch)
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
	for _, path := range strings.Split(d.quiet("diff", "--name-only", base+"..origin/"+branch, "--", ticketsFolder).Out, "\n") {
		if path == "" {
			continue
		}
		var lines []string
		for _, one := range strings.Split(d.quiet("diff", "--unified=0", base+"..origin/"+trunk, "--", path).Out, "\n") {
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
	d.quiet("add", at)
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
	if ahead := d.quiet("rev-list", "--count", "origin/"+trunk+".."+trunk).Out; ahead != "0" && !forced {
		d.warn("%s holds %s commit(s) origin has never seen.", trunk, ahead)
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
			d.quiet("commit", "-m", ticketNamed(branch)+": leaves the cloud")
			if !d.loud("push", "origin", trunk).OK {
				d.warn("The push of %s comes back refused, so %s stands.", trunk, branch)
				continue
			}
		}
		if !d.loud("push", "origin", "--delete", branch).OK {
			continue
		}
		d.quiet("branch", "-D", branch)
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
