// What every work verb reads before it moves a thing: the standing a group
// ticket carries, the branches standing, and the trunk coming in, as
// src/scripts/work-stands.js reads them.
// [[spec/design_output/work#a-group-is-a-ticket]]
package branches

import (
	"encoding/json"
	"regexp"
	"slices"
	"strings"

	"quackitect/src/failure"
	"quackitect/src/yaml"
)

// The standings a group reads at, and the widths the listing pads to. [[spec/design_output/work#held-derives-from-the-record]]
const (
	todo   = "todo"
	held   = "held"
	done   = "done"
	merged = "merged"
	// A branch sharing no ancestor with trunk reaches no sync. [[spec/design_output/work#the-listing-reads-git-once]]
	orphan = "orphan"
	// The field a group names a config key under. [[spec/design_output/work#a-switch-holds-a-group]]
	switchField = "enabled_by"
	// The tracked config every box shares. [[spec/design_output/work#a-switch-holds-a-group]]
	trackedConfig = "spec/config/level0.json"
	configComment = "comment"
)

// The columns the listing pads to. [[spec/design_output/work#a-row-per-group]]
const (
	colBranch = 34
	colChild  = 32
	colPlace  = 6
	colStatus = 6
	colWhy    = 24
)

// The routine that works a branch. [[spec/design_output/work#the-routine-a-verb-names]]
const (
	routineName = "do_work"
	routineID   = "trig_01EenLoDAB3NdmANnRM9mSh6"
)

// The branches the close reads as this tree's own. [[spec/design_output/work#a-merged-branch-closes]]
var ownBranch = regexp.MustCompile(`^(work|claude)/`)

// A ticket file on a tip: its path, its name and its text. [[spec/design_output/work#the-listing-reads-git-once]]
type ticketFile struct {
	Path, Name, Text string
}

// A work branch standing on origin, with its group ticket and every ticket on its tip. [[spec/design_output/work#a-group-is-a-ticket]]
type stand struct {
	ref
	Orphan  bool
	Behind  bool
	Name    string
	Ticket  string
	Tickets []ticketFile
	Shut    string
}

// What a branch waits for: the groups its ticket and every ancestor's name, then its switch. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func waitsOf(one stand, standing map[string]string, trunkTickets map[string]string) []string {
	out := waitsIn(one.Ticket, standing, trunkTickets)
	if one.Shut != "" {
		out = appendNew(out, one.Shut+" to read true")
	}
	return out
}

// The groups a group ticket and its ancestors wait on. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func waitsIn(text string, standing map[string]string, trunkTickets map[string]string) []string {
	chain := []string{text}
	for _, one := range ancestorsOf(text, trunkTickets) {
		chain = append(chain, one.Text)
	}
	out := []string{}
	for _, one := range chain {
		for _, name := range waitingOn(one, standing, trunkTickets) {
			out = appendNew(out, name)
		}
	}
	return out
}

// A list with a name added where it stands nowhere yet. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func appendNew(list []string, name string) []string {
	if slices.Contains(list, name) {
		return list
	}
	return append(list, name)
}

// The key a group waits on, or nothing where the shared config turns it on. [[spec/design_output/work#a-switch-holds-a-group]]
func shutBy(text string, shared map[string]any) string {
	key := fieldOf(text, switchField)
	if key == "" || shared[key] == true {
		return ""
	}
	return key
}

// A dependency waits while its branch stands, and one on no branch waits while trunk's copy stands short of closed. [[spec/design_output/work#a-dependency-waits-for-trunk]]
func waitingOn(text string, standing map[string]string, trunkTickets map[string]string) []string {
	var out []string
	for _, name := range dependsOnText(text) {
		status, stands := standing[workBranch+name]
		switch {
		case status == todo || status == held || status == done:
			out = append(out, name)
		case stands && status != "":
		case trunkTickets[name] != "" && fieldOf(trunkTickets[name], "state") != closedState:
			out = append(out, name)
		}
	}
	return out
}

// The groups a ticket depends on, off the raw front rows, each bare of its branch prefix. [[spec/design_output/work#the-mark-and-what-waits]]
func dependsOnText(text string) []string {
	rows := splitRows(text)
	if strings.TrimSpace(rows[0]) != frontFence {
		return nil
	}
	var raw []string
	reading := false
	for _, row := range rows[1:] {
		if strings.TrimSpace(row) == frontFence {
			break
		}
		if rest, ok := strings.CutPrefix(row, "depends_on:"); ok {
			reading = true
			raw = append(raw, strings.Split(rest, ",")...)
			continue
		}
		if !reading {
			continue
		}
		if item := strings.TrimSpace(row); strings.HasPrefix(item, "- ") {
			raw = append(raw, strings.TrimSpace(item[2:]))
			continue
		}
		if strings.TrimSpace(row) != "" {
			reading = false
		}
	}
	var out []string
	for _, one := range raw {
		if name := groupNamed(one); name != "" {
			out = append(out, name)
		}
	}
	return out
}

// A dependency's name, bare of brackets, quotes and the branch prefix. [[spec/design_output/work#the-mark-and-what-waits]]
func groupNamed(said string) string {
	said = strings.TrimSpace(said)
	said = strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(said, "["), "]"))
	said = strings.TrimSpace(trimQuote(said))
	return strings.TrimPrefix(said, workBranch)
}

// Trunk's tickets by name. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func trunkOf(loose []ticketFile) map[string]string {
	out := map[string]string{}
	for _, one := range loose {
		out[one.Name] = one.Text
	}
	return out
}

// The standing a group ticket reads at: done where closed, held where a take stands open, else todo. [[spec/design_output/work#held-derives-from-the-record]]
func groupStanding(text string) string {
	switch {
	case text == "":
		return ""
	case fieldOf(text, "state") == closedState:
		return done
	case heldIn(text) != nil:
		return held
	}
	return todo
}

// Every branch's standing: orphan, merged, or what its ticket says. [[spec/design_output/work#held-derives-from-the-record]]
func standingAll(stood []stand) map[string]string {
	out := map[string]string{}
	for _, one := range stood {
		switch {
		case one.Orphan:
			out[one.Branch] = orphan
		case one.Merged:
			out[one.Branch] = merged
		default:
			out[one.Branch] = groupStanding(one.Ticket)
		}
	}
	return out
}

// The branches inside trunk, past a cut standing on trunk's own line. [[spec/design_output/work#a-merged-branch-closes]]
func (d *Doors) mergedHere() map[string]bool {
	fresh := d.branchesIn("branch", "-r", "--points-at", "origin/"+trunk)
	line := map[string]bool{}
	for _, row := range strings.Split(d.quiet("rev-list", "--first-parent", "origin/"+trunk).Out, "\n") {
		if row = strings.TrimSpace(row); row != "" {
			line[row] = true
		}
	}
	out := map[string]bool{}
	for row := range d.branchesIn("branch", "-r", "--merged", "origin/"+trunk) {
		if !fresh[row] && !line[d.quiet("rev-parse", "origin/"+row).Out] {
			out[row] = true
		}
	}
	return out
}

// The branches of this tree's own a git listing names. [[spec/design_output/work#a-merged-branch-closes]]
func (d *Doors) branchesIn(args ...string) map[string]bool {
	out := map[string]bool{}
	for _, row := range strings.Split(d.quiet(args...).Out, "\n") {
		row = strings.Replace(strings.TrimSpace(row), "origin/", "", 1)
		if ownBranch.MatchString(row) {
			out[row] = true
		}
	}
	return out
}

// The groups landed: trunk carries their ticket closed. [[spec/design_output/work#a-dependency-waits-for-trunk]]
func (d *Doors) landedHere(branches []string) map[string]bool {
	out := map[string]bool{}
	for _, branch := range branches {
		if fieldOf(d.textAt("origin/"+trunk, ticketAt(ticketNamed(branch))), "state") == closedState {
			out[branch] = true
		}
	}
	return out
}

// A work ref with whether it shares a base with trunk and stands behind it. [[spec/design_output/work#the-listing-reads-git-once]]
type refRead struct {
	ref
	Orphan, Behind bool
}

// The work refs on origin, each landed, orphaned or behind. [[spec/design_output/work#the-listing-reads-git-once]]
func (d *Doors) refsHere() []refRead {
	said := d.quiet("for-each-ref", "--format="+refFormat, "refs/remotes/origin/"+workBranch)
	if !said.OK {
		return nil
	}
	var branches []string
	for _, one := range refsIn(said.Out, nil) {
		branches = append(branches, one.Branch)
	}
	tip := ""
	if at := d.quiet("rev-parse", "origin/"+trunk); at.OK {
		tip = at.Out
	}
	var out []refRead
	for _, one := range refsIn(said.Out, d.landedHere(branches)) {
		shares, base := d.baseOnTrunk(one.Branch)
		out = append(out, refRead{ref: one, Orphan: !shares, Behind: shares && tip != "" && base != tip})
	}
	return out
}

// The commit trunk and a branch share, fetching a shallow clone whole where it answers none. [[spec/design_output/work#the-listing-reads-git-once]]
func (d *Doors) baseOnTrunk(branch string) (bool, string) {
	ask := func() Said { return d.quiet("merge-base", "origin/"+trunk, "origin/"+branch) }
	said := ask()
	if !said.OK && d.quiet("rev-parse", "--is-shallow-repository").Out == "true" {
		d.quiet("fetch", "--unshallow", "origin")
		said = ask()
	}
	if !said.OK {
		return false, ""
	}
	return true, said.Out
}

// The refs, then the paths, then the contents: every branch standing, and trunk's tickets where asked. [[spec/design_output/work#the-listing-reads-git-once]]
func (d *Doors) readWork(withTrunk bool) ([]stand, []ticketFile) {
	refs := d.refsHere()
	var where []string
	for _, one := range refs {
		where = append(where, one.Tip)
	}
	if withTrunk {
		where = append(where, "origin/"+trunk)
	}
	paths := d.pathsIn(where)
	var asks []string
	for _, one := range where {
		for _, name := range paths[one] {
			asks = append(asks, one+":"+ticketsFolder+"/"+name)
		}
	}
	read := framed(d.batch(asks), asks)
	ticketsAt := func(at string) []ticketFile {
		var out []ticketFile
		for _, name := range paths[at] {
			out = append(out, ticketFile{Path: ticketsFolder + "/" + name, Name: ticketNamed(name), Text: read[at+":"+ticketsFolder+"/"+name]})
		}
		return out
	}
	var stood []stand
	var texts []string
	for _, one := range refs {
		name := strings.TrimPrefix(one.Branch, workBranch)
		ticket := read[one.Tip+":"+ticketAt(name)]
		if !isGroup(ticket) {
			ticket = ""
		}
		stood = append(stood, stand{ref: one.ref, Orphan: one.Orphan, Behind: one.Behind, Name: name, Ticket: ticket, Tickets: ticketsAt(one.Tip)})
		texts = append(texts, ticket)
	}
	shared := d.sharedOn(texts)
	for at := range stood {
		stood[at].Shut = shutBy(stood[at].Ticket, shared)
	}
	var loose []ticketFile
	if withTrunk {
		loose = ticketsAt("origin/" + trunk)
	}
	return stood, loose
}

// The tracked config trunk carries, flattened, read where a group names a switch alone. [[spec/design_output/work#a-switch-holds-a-group]]
func (d *Doors) sharedOn(texts []string) map[string]any {
	out := map[string]any{}
	if !slices.ContainsFunc(texts, func(text string) bool { return fieldOf(text, switchField) != "" }) {
		return out
	}
	var said map[string]any
	if json.Unmarshal([]byte(d.textAt("origin/"+trunk, trackedConfig)), &said) != nil {
		return out
	}
	flatten(said, "", out)
	return out
}

// A nested config read as dotted keys, the comments past. [[spec/design_output/work#a-switch-holds-a-group]]
func flatten(said map[string]any, at string, out map[string]any) {
	for name, value := range said {
		if name == configComment {
			continue
		}
		key := name
		if at != "" {
			key = at + "." + name
		}
		if under, ok := value.(map[string]any); ok {
			flatten(under, key, out)
			continue
		}
		out[key] = value
	}
}

// The ticket names each tree holds, by where it stands. [[spec/design_output/work#the-listing-reads-git-once]]
func (d *Doors) pathsIn(where []string) map[string][]string {
	var asks []string
	for _, one := range where {
		asks = append(asks, one+":"+ticketsFolder)
	}
	trees := framed(d.batch(asks), asks)
	out := map[string][]string{}
	for _, one := range where {
		for _, name := range namesIn(trees[one+":"+ticketsFolder]) {
			if strings.HasSuffix(name, noteEnd) {
				out[one] = append(out[one], name)
			}
		}
	}
	return out
}

// Every branch standing, with no read of trunk's tickets. [[spec/design_output/work#a-group-is-a-ticket]]
func (d *Doors) standOf() []stand {
	stood, _ := d.readWork(false)
	return stood
}

// A file at a ref, with the newline the show trims put back, or nothing. [[spec/design_output/work#a-group-is-a-ticket]]
func (d *Doors) textAt(at, path string) string {
	said := d.quiet("show", at+":"+path)
	if !said.OK {
		return ""
	}
	return said.Out + "\n"
}

// The work branch HEAD stands on, or nothing with the refusal printed. [[spec/design_output/work#a-group-is-a-ticket]]
func (d *Doors) workBranchHere(verb string) string {
	branch := d.here()
	if strings.HasPrefix(branch, workBranch) {
		return branch
	}
	d.warn("branch %s runs on a work branch, and this is %s.", verb, branch)
	return ""
}

// Every ticket a ref carries. [[spec/design_output/work#the-merge-frees-the-tickets]]
func (d *Doors) ticketsOn(at string) []ticketFile {
	said := d.quiet("ls-tree", "-r", "--name-only", at, ticketsFolder+"/")
	if !said.OK {
		return nil
	}
	var out []ticketFile
	for _, path := range strings.Split(said.Out, "\n") {
		if strings.HasSuffix(path, noteEnd) {
			out = append(out, ticketFile{Path: path, Name: ticketNamed(path), Text: d.textAt(at, path)})
		}
	}
	return out
}

// A changed path, and whether a tagged note parks it. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
type change struct {
	Name   string
	Parked bool
}

// Whether work stands uncommitted or unpushed, which holds every branch where it stands. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
func (d *Doors) dirty(branch string) bool {
	for _, one := range d.standingIn() {
		if !one.Parked {
			d.raises(failure.Raise(d.Failures, "branch-tree-dirty", "This tree carries uncommitted changes, so no branch may move.", "Commit them, or stash them, and run this again."))
			return true
		}
	}
	var walked []string
	for _, one := range []string{d.here(), branch} {
		if strings.HasPrefix(one, workBranch) {
			walked = appendNew(walked, one)
		}
	}
	for _, one := range walked {
		if d.unpushed(one) {
			return true
		}
	}
	return false
}

// Whether a branch holds commits origin lacks, which a move drops. [[spec/design_output/work#a-branch-moves-clean]]
func (d *Doors) unpushed(branch string) bool {
	said := d.quiet("rev-list", "--count", "origin/"+branch+".."+branch)
	if !said.OK || said.Out == "" || said.Out == "0" {
		return false
	}
	d.raises(failure.Raise(d.Failures, "branch-unpushed",
		branch+" holds "+said.Out+" commit(s) origin lacks, so no branch may move.",
		"Run git push origin "+branch+", and run this again."))
	return true
}

// Every path git status names, an untracked folder's files each. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
func (d *Doors) standingIn() []change {
	var out []change
	for _, row := range strings.Split(d.quiet("status", "--porcelain", "-uall").Out, "\n") {
		if row == "" {
			continue
		}
		name := changedIn(row)
		out = append(out, change{Name: name, Parked: d.parkedHere(name)})
	}
	return out
}

var statusRow = regexp.MustCompile(`^\s*\S{1,2}\s+(.*)$`)

// The path a status row names, past a rename's arrow and its quotes. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
func changedIn(row string) string {
	said := row
	if found := statusRow.FindStringSubmatch(row); found != nil {
		said = found[1]
	}
	said = strings.TrimSpace(said)
	moved := strings.Split(said, " -> ")
	return strings.TrimSuffix(strings.TrimPrefix(moved[len(moved)-1], `"`), `"`)
}

// Whether a changed note carries the todo tag, which parks it on this box. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
func (d *Doors) parkedHere(name string) bool {
	if !strings.HasSuffix(name, noteEnd) || !d.exists(name) {
		return false
	}
	doc := frontOf(d.read(name))
	if !doc.Has("todo") {
		return false
	}
	said := doc.Get("todo")
	return said != nil && said != false && strings.TrimSpace(asText(said)) != "false"
}

// A front value as text. [[spec/design_output/work#a-group-is-a-ticket]]
func asText(said any) string { return yaml.AsString(said) }

// The tickets of a group on this box's disk. [[spec/design_output/work#a-box-leaves]]
func (d *Doors) childrenHere(name string) []named {
	var out []named
	for _, one := range d.ticketsOnDisk() {
		if fieldOf(one.Text, groupField) == name {
			out = append(out, one)
		}
	}
	return out
}

// Every ticket under the tickets folder on disk, in name order. [[spec/design_output/work#a-box-leaves]]
func (d *Doors) ticketsOnDisk() []named {
	return d.notesIn(ticketsFolder)
}

// Every note under a folder of the work root, in name order. [[spec/design_output/pull#the-hand-out]]
func (d *Doors) notesIn(folder string) []named {
	var out []named
	for _, one := range d.names(folder) {
		if strings.HasSuffix(one, noteEnd) {
			out = append(out, named{Name: ticketNamed(one), Text: d.read(folder + "/" + one)})
		}
	}
	return out
}
