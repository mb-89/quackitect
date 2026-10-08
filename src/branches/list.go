// The branch listing: one row a group, its tickets under it, the loose tickets
// after, and the narrow reads a flag asks for. The queue and the JSON read
// the index the board reads.
// [[spec/design_output/work#a-row-per-group]]
package branches

import (
	"bytes"
	"encoding/json"
	"fmt"
	"slices"
	"strings"
)

// The index value the board draws, which --json prints. [[spec/design_output/work#one-reading-answers-git]]
const rowsValue = "work/rows"

// One row of the listing, and whether its claim stands stale. [[spec/design_output/work#a-row-per-group]]
type listRow struct {
	Name, Age, Said string
	Stale           bool
}

// Lists what stands open, or what a flag asks for. [[spec/design_output/work#a-row-per-group]]
func list(d *Doors, _ string, argv []string) int {
	if slices.Contains(argv, "--fetch") {
		d.fetch()
	}
	if slices.Contains(argv, "--queue") {
		if d.Queue == nil {
			d.warn("branch list --queue reads the index, and no index answers here.")
			return codeRed
		}
		return d.Queue()
	}
	if slices.Contains(argv, "--json") {
		return d.rowsJSON()
	}
	stood, loose := d.readWork(true)
	standing := standingAll(stood)
	if slices.Contains(argv, "--done") {
		return d.doneOnly(stood, standing)
	}
	now := d.nowSeconds()
	all := slices.Contains(argv, "--all")
	var rows []listRow
	for _, one := range stood {
		if !all && standing[one.Branch] == merged {
			continue
		}
		rows = append(rows, d.rowOf(one, standing, now))
		rows = append(rows, childRows(one, all)...)
	}
	looseRows := looseRows(loose, all)
	if len(rows) == 0 && len(looseRows) == 0 {
		if all {
			d.say("No group and no loose ticket stands.")
		} else {
			d.say("Nothing stands open.")
		}
		return codeOK
	}
	var stale []listRow
	for _, row := range rows {
		if row.Stale {
			stale = append(stale, row)
		}
	}
	if len(stale) > 0 {
		d.say("Yours")
		for _, row := range stale {
			d.say("  %s", row.Said)
			d.say("    %s held %s. Release it, take it over, or close it.", row.Name, row.Age)
		}
		d.say("")
	}
	for _, row := range append(rows, looseRows...) {
		d.say("%s", row.Said)
	}
	return codeOK
}

// The index's rows as one JSON line. [[spec/design_output/work#one-reading-answers-git]]
func (d *Doors) rowsJSON() int {
	if d.Value == nil {
		d.warn("branch list --json reads the index, and no index answers here.")
		return codeRed
	}
	var rows any
	if err := d.Value(rowsValue, &rows); err != nil {
		d.warn("%v", err)
		return codeRed
	}
	var text bytes.Buffer
	writes := json.NewEncoder(&text)
	writes.SetEscapeHTML(false)
	if err := writes.Encode(rows); err != nil {
		d.warn("%v", err)
		return codeRed
	}
	fmt.Fprint(d.Out, text.String())
	return codeOK
}

// A text padded on the right to a width, as padEnd pads it. [[spec/design_output/work#a-row-per-group]]
func padEnd(said string, width int) string {
	if gap := width - len([]rune(said)); gap > 0 {
		return said + strings.Repeat(" ", gap)
	}
	return said
}

// A text padded on the left to a width, as padStart pads it. [[spec/design_output/work#a-row-per-group]]
func padStart(said string, width int) string {
	if gap := width - len([]rune(said)); gap > 0 {
		return strings.Repeat(" ", gap) + said
	}
	return said
}

// A group's row: its branch, its standing, what it waits for, and its claim's age. [[spec/design_output/work#a-row-per-group]]
func (d *Doors) rowOf(one stand, standing map[string]string, now int64) listRow {
	status := standing[one.Branch]
	if status == "" {
		status = "no status"
	}
	waits := waitsOf(one, standing, nil)
	var why []string
	if len(waits) > 0 {
		why = append(why, "waits for "+strings.Join(waits, ", "))
	}
	if one.Behind {
		why = append(why, "behind main")
	}
	if len(waits) == 0 && urgent(one.Ticket) {
		why = append(why, urgentField)
	}
	var age claim
	if status == held {
		age = d.staleClaim(one, now)
	}
	live := ""
	if age.Live {
		live = ", live, beat " + age.Beat + " ago"
	}
	return listRow{
		Name:  one.Name,
		Age:   age.Age,
		Stale: age.Stale,
		Said:  padEnd(one.Branch, colBranch) + " " + padEnd(status, colStatus) + " " + padEnd(strings.Join(why, ", "), colWhy) + " " + age.Age + live,
	}
}

// A ticket's state, open where it names none. [[spec/design_output/work#a-ticket-under-its-group]]
func stateOf(text string) string {
	if said := fieldOf(text, "state"); said != "" {
		return said
	}
	return openState
}

// A group's tickets under its row, each with what it waits for or its step. [[spec/design_output/work#a-ticket-under-its-group]]
func childRows(one stand, all bool) []listRow {
	if one.Ticket == "" {
		return nil
	}
	open := map[string]bool{}
	for _, child := range one.Tickets {
		if stateOf(child.Text) == openState {
			open[child.Name] = true
		}
	}
	var out []listRow
	for _, child := range one.Tickets {
		if fieldOf(child.Text, groupField) != one.Name || (!all && stateOf(child.Text) == closedState) {
			continue
		}
		var waits []string
		for _, name := range dependsOnText(child.Text) {
			if open[name] {
				waits = append(waits, name)
			}
		}
		why := whyOf(child.Text)
		if len(waits) > 0 {
			why = "waits for " + strings.Join(waits, ", ")
		}
		out = append(out, listRow{Said: "  " + padEnd(child.Name, colChild) + " ticket " + padEnd(stateOf(child.Text), colStatus) + " " + why})
	}
	return out
}

// The why column of a ticket: its step, or its mark. [[spec/design_output/work#a-ticket-under-its-group]]
func whyOf(text string) string {
	if step := stepOf(text); step != "" {
		return step
	}
	if urgent(text) {
		return urgentField
	}
	return ""
}

// The tickets on trunk no group holds. [[spec/design_output/work#a-row-per-group]]
func looseRows(loose []ticketFile, all bool) []listRow {
	var out []listRow
	for _, one := range loose {
		if fieldOf(one.Text, groupField) != "" || isGroup(one.Text) || (!all && stateOf(one.Text) == closedState) {
			continue
		}
		mark := ""
		if urgent(one.Text) {
			mark = urgentField
		}
		out = append(out, listRow{Said: padEnd(one.Name, colBranch) + " ticket " + padEnd(stateOf(one.Text), colStatus) + " " + mark})
	}
	return out
}

// The branches at done, each with the read that opens it. [[spec/design_output/work#a-merged-branch-goes]]
func (d *Doors) doneOnly(stood []stand, standing map[string]string) int {
	var ready []stand
	for _, one := range stood {
		if standing[one.Branch] == done {
			ready = append(ready, one)
		}
	}
	if len(ready) == 0 {
		d.say("No branch stands at %s.", done)
		return codeOK
	}
	for _, one := range ready {
		d.say("%s ./RUNME.sh branch read %s", padEnd(one.Branch, colBranch), one.Name)
	}
	return codeOK
}
