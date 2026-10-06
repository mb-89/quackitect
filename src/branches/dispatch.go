// The dispatcher's plan: what stands ready, stuck, loose and waiting on a
// person, read off origin/main and the work branches. The run carries it out
// through dispatch_write.go, and the dry run prints it and writes nothing.
// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
package branches

import (
	"encoding/json"
	"slices"
	"sort"
	"strconv"
	"strings"
)

// A ready group and its branch. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
type readyRow struct {
	Group  string `json:"group"`
	Branch string `json:"branch"`
}

// A group a fresh hold keeps, and the hold's age. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
type heldRow struct {
	Group  string `json:"group"`
	Branch string `json:"branch"`
	Age    string `json:"age"`
}

// A group and the groups it waits on. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
type waitRow struct {
	Group string   `json:"group"`
	Waits []string `json:"waits"`
}

// A hand-over at done, and why it stands stuck. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
type stuckRow struct {
	Group string `json:"group"`
	Why   string `json:"why"`
}

// One parent's loose agent tickets, the top standing as the empty parent. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
type bundle struct {
	Parent  string   `json:"parent"`
	Tickets []string `json:"tickets"`
}

// A ticket a person alone can do, and the group it holds open. [[spec/tickets/the-dispatch-opens-no-issues]]
type personRow struct {
	Ticket string `json:"ticket"`
	Group  string `json:"group"`
}

// What happened to the writes, and on which branch. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
type writeRow struct {
	Branch string `json:"branch"`
	State  string `json:"state"`
	Why    string `json:"why"`
}

// The plan in the order the Action reads its JSON. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
type dispatchPlan struct {
	Ready   []readyRow  `json:"ready"`
	Held    []heldRow   `json:"held"`
	Waiting []waitRow   `json:"waiting"`
	Stuck   []stuckRow  `json:"stuck"`
	Bundles []bundle    `json:"bundles"`
	Opens   []string    `json:"opens"`
	Closes  []string    `json:"closes"`
	Person  []personRow `json:"person"`
	Write   *writeRow   `json:"write,omitempty"`
	Fire    *fireRow    `json:"fire,omitempty"`
	// The work branches at done that carry a commit main lacks, whose pull request the fire opens. [[spec/tickets/dispatch-skips-merged-done-branches]]
	Done []string `json:"done,omitempty"`
	// The work branches standing at done, which a red fire reads. [[spec/tickets/ci-reds-name-their-cases]]
	atDone map[string]bool
}

// The parts of the plan, in the order the dry run prints them. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
var planParts = [][2]string{
	{"ready", "ready groups, one worker each"},
	{"stuck", "stuck hand-overs, one worker each"},
	{"held", "groups a fresh hold keeps"},
	{"waiting", "groups waiting on another"},
	{"bundles", "loose agent tickets, one fix group per parent"},
	{"opens", "groups on main that open a branch"},
	{"closes", "parent groups whose children all read closed"},
	{"person", "tickets a person alone can do, loose on main"},
}

// The read a plan stands on, which the writes take their texts from. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
type workRead struct {
	Stand []stand
	Loose []ticketFile
}

// The plan beside the read it stands on. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
func (d *Doors) planned() (*dispatchPlan, workRead) {
	now := d.nowSeconds()
	all, loose := d.readWork(true)
	read := workRead{Stand: all, Loose: loose}
	var stood []stand
	for _, one := range all {
		if one.Ticket != "" {
			stood = append(stood, one)
		}
	}
	standing := standingAll(stood)
	trunkTickets := trunkOf(loose)
	free := d.freeIn(stood, standing, now, trunkTickets)
	freed := map[string]bool{}
	plan := &dispatchPlan{Ready: []readyRow{}, Held: []heldRow{}, Waiting: []waitRow{}, Stuck: []stuckRow{}, atDone: map[string]bool{}}
	for _, one := range free {
		freed[one.Branch] = true
		plan.Ready = append(plan.Ready, readyRow{Group: one.Name, Branch: one.Branch})
	}
	for _, one := range stood {
		switch standing[one.Branch] {
		case held:
			if !freed[one.Branch] {
				plan.Held = append(plan.Held, heldRow{Group: one.Name, Branch: one.Branch, Age: d.staleClaim(one, now).Age})
			}
		case todo:
			if waits := waitsOf(one, standing, trunkTickets); len(waits) > 0 {
				plan.Waiting = append(plan.Waiting, waitRow{Group: one.Name, Waits: waits})
			}
		case done:
			plan.atDone[one.Branch] = true
			if why := d.stuckIn(one, now); why != "" {
				plan.Stuck = append(plan.Stuck, stuckRow{Group: one.Name, Why: why})
			}
			if d.aheadOfTrunk(one.Branch) {
				plan.Done = append(plan.Done, one.Branch)
			}
		}
	}
	plan.Opens = opensOf(read, standing, trunkTickets)
	idle := idleIn(read, standing, trunkTickets, plan.Opens)
	plan.Bundles = bundlesOf(loose, idle)
	plan.Closes = closesOf(loose, idle)
	plan.Person = personOf(loose)
	return plan, read
}

// The groups on trunk no hand reaches: open, on no branch, opening none this run, and waiting on nothing. A ticket filed into one stands loose under it. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func idleIn(read workRead, standing, trunkTickets map[string]string, opened []string) map[string]bool {
	branched := map[string]bool{}
	for _, one := range read.Stand {
		branched[one.Name] = true
	}
	out := map[string]bool{}
	for _, one := range read.Loose {
		if isGroup(one.Text) && fieldOf(one.Text, "state") != closedState && !branched[one.Name] &&
			!slices.Contains(opened, one.Name) && len(waitsIn(one.Text, standing, trunkTickets)) == 0 {
			out[one.Name] = true
		}
	}
	return out
}

// An open ticket on trunk standing in no group, or in a group no hand reaches. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func looseOpen(one ticketFile, idle map[string]bool) bool {
	group := fieldOf(one.Text, groupField)
	return fieldOf(one.Text, "state") != closedState && (group == "" || idle[group]) && !isGroup(one.Text)
}

// Each parent's loose agent tickets go to a fix group of its own, and the top stands as the parent named by nothing. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func bundlesOf(loose []ticketFile, idle map[string]bool) []bundle {
	by := map[string][]string{}
	for _, one := range loose {
		if !looseOpen(one, idle) || leftForPerson(one.Text) {
			continue
		}
		parent := fieldOf(one.Text, groupField)
		by[parent] = append(by[parent], one.Name)
	}
	out := []bundle{}
	for parent, tickets := range by {
		sort.Strings(tickets)
		out = append(out, bundle{Parent: parent, Tickets: tickets})
	}
	sort.Slice(out, func(a, b int) bool { return out[a].Parent < out[b].Parent })
	return out
}

// A group no hand reaches closes once every ticket naming it on trunk stands closed. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func closesOf(loose []ticketFile, idle map[string]bool) []string {
	shut := map[string]bool{}
	for _, one := range loose {
		group := fieldOf(one.Text, groupField)
		if !idle[group] {
			continue
		}
		closed, seen := shut[group]
		shut[group] = (closed || !seen) && fieldOf(one.Text, "state") == closedState
	}
	out := []string{}
	for name, closed := range shut {
		if closed {
			out = append(out, name)
		}
	}
	sort.Strings(out)
	return out
}

// A ticket a box leaves on trunk: work a person alone can do, or a draft whose ask no agent opens. A question goes to a box like other open work. [[spec/tickets/the-dispatch-opens-no-issues]]
func leftForPerson(text string) bool {
	return onPersonRoute(text) || (fieldOf(text, "state") == draftState && !agentOpens(text))
}

// The open tickets on trunk a person alone can do. The ticket holds the work, so nothing opens an issue for it. [[spec/tickets/the-dispatch-opens-no-issues]]
func personOf(loose []ticketFile) []personRow {
	out := []personRow{}
	for _, one := range loose {
		if fieldOf(one.Text, "state") != closedState && !isGroup(one.Text) && onPersonRoute(one.Text) {
			out = append(out, personRow{Ticket: one.Name, Group: fieldOf(one.Text, groupField)})
		}
	}
	sort.Slice(out, func(a, b int) bool { return out[a].Ticket < out[b].Ticket })
	return out
}

// A branch on origin carrying a commit main lacks. The hub refuses a pull request over a branch level with main. [[spec/tickets/dispatch-skips-merged-done-branches]]
func (d *Doors) aheadOfTrunk(branch string) bool {
	count, _ := strconv.Atoi(d.quiet("rev-list", "--count", "origin/"+trunk+"..origin/"+branch).Out)
	return count > 0
}

// Runs the dispatch: the plan, the writes past a dry run, the fire where asked, then the plan printed or as JSON. The send it takes becomes the doors' one send door. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]] [[spec/tickets/one-send-door]]
func Dispatch(d *Doors, send Send, argv []string) int {
	if send != nil {
		d.Send = send
	}
	// A push to main updates the open work pull requests and plans nothing, so the hourly fire keeps its own clock. [[spec/tickets/running-work-takes-main-fixes]]
	if slices.Contains(argv, "--update") {
		return d.updated(d.Send, argv)
	}
	// The plan reads the remote, so it refreshes the refs first. [[spec/design_output/work#the-listing-reads-git-once]]
	d.fetch()
	plan, read := d.planned()
	dry := slices.Contains(argv, "--dry")
	code := codeOK
	if !dry {
		code = d.carried(plan, read)
	}
	// The Action fires after the writes, so the plan it prints carries both. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
	if !dry && slices.Contains(argv, "--fire") {
		if fired := d.fire(plan); code == codeOK {
			code = fired
		}
	}
	d.told(plan, argv)
	return code
}

// The plan as one JSON line, or as the printed parts. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
func (d *Doors) told(plan *dispatchPlan, argv []string) {
	if slices.Contains(argv, "--json") {
		d.say("%s", jsonLine(plan))
		return
	}
	for _, line := range printedPlan(plan) {
		d.say("%s", line)
	}
}

// A value as JSON.stringify writes it: one line, and no escape of the HTML characters. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
func jsonLine(said any) string {
	var out strings.Builder
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	_ = writes.Encode(said)
	return strings.TrimSuffix(out.String(), "\n")
}

// The writes, where no write branch stands in their way. The plan carries what happened under write. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
func (d *Doors) carried(plan *dispatchPlan, read workRead) int {
	state := d.writeState()
	plan.Write = &writeRow{Branch: state.Branch, State: state.State}
	if state.State != writeFree {
		return codeOK
	}
	if len(plan.Bundles) == 0 && len(plan.Opens) == 0 && len(plan.Closes) == 0 {
		plan.Write.State = "nothing"
		return codeOK
	}
	files, why := d.writesOf(plan, read, state.Main)
	if why != "" {
		return refusedWrite(plan, why)
	}
	if left := d.opens(plan.Opens); len(left) > 0 {
		return refusedWrite(plan, "The push of "+strings.Join(left, ", ")+" came back refused.")
	}
	if why := d.land(state.Branch, files, state.Main); why != "" {
		return refusedWrite(plan, why)
	}
	plan.Write.State = "pushed"
	return codeOK
}

func refusedWrite(plan *dispatchPlan, why string) int {
	plan.Write.State = "refused"
	plan.Write.Why = why
	return codeRed
}

// The printed plan: each part under its head, then the writes and the fire. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
func printedPlan(plan *dispatchPlan) []string {
	var out []string
	for _, part := range planParts {
		out = append(out, part[1]+":")
		rows := rowsOfPart(plan, part[0])
		if len(rows) == 0 {
			rows = []string{"none"}
		}
		for _, row := range rows {
			out = append(out, "  "+row)
		}
	}
	if plan.Write != nil {
		line := "the writes: " + plan.Write.State
		if plan.Write.Branch != "" {
			line += ", on " + plan.Write.Branch
		}
		out = append(out, line)
		if plan.Write.Why != "" {
			out = append(out, "  "+plan.Write.Why)
		}
	}
	if plan.Fire != nil {
		out = append(out, fireLines(plan.Fire)...)
	}
	return out
}

// The rows of one part of the plan. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
func rowsOfPart(plan *dispatchPlan, key string) []string {
	var out []string
	switch key {
	case "ready":
		for _, one := range plan.Ready {
			out = append(out, one.Branch)
		}
	case "stuck":
		for _, one := range plan.Stuck {
			out = append(out, workBranch+one.Group+", "+one.Why)
		}
	case "held":
		for _, one := range plan.Held {
			out = append(out, one.Branch+", held "+one.Age)
		}
	case "waiting":
		for _, one := range plan.Waiting {
			out = append(out, workBranch+one.Group+" waits for "+strings.Join(one.Waits, ", "))
		}
	case "bundles":
		for _, one := range plan.Bundles {
			parent := one.Parent
			if parent == "" {
				parent = "the top"
			}
			out = append(out, parent+": "+strings.Join(one.Tickets, ", "))
		}
	case "opens":
		for _, one := range plan.Opens {
			out = append(out, workBranch+one)
		}
	case "closes":
		out = append(out, plan.Closes...)
	case "person":
		for _, one := range plan.Person {
			row := one.Ticket
			if one.Group != "" {
				row += ", holding " + one.Group + " open"
			}
			out = append(out, row)
		}
	}
	return out
}
