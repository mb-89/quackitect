// A group reaches done once every ticket a box can close stands closed. Work
// a person alone can do stands on the person route, and that alone leaves the
// group loose on main.
// [[spec/design_output/work#a-box-leaves]]
package branches

import (
	"slices"
	"sort"
	"strings"
)

// The route of work a person alone can do. [[spec/processes/person.yaml]]
const personRoute = "person"

// Whether a ticket stands on the person route, in either spelling of its process. [[spec/design_output/work#a-box-leaves]]
func onPersonRoute(text string) bool {
	process := strings.TrimSuffix(strings.TrimPrefix(fieldOf(text, "process"), "[["), "]]")
	return process == personRoute || strings.HasSuffix(process, "/"+personRoute)
}

// The tickets this branch adds over trunk, as the disk holds them. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func (d *Doors) addedHere() []named {
	var out []named
	base, ok := d.Repo.MergeBase("origin/"+trunk, "HEAD")
	if !ok {
		return nil
	}
	changes, _ := d.Repo.Diff(base, "HEAD")
	for _, change := range changes {
		row := change.Path
		if change.Status != "A" || !strings.HasPrefix(row, ticketsFolder+"/") || !strings.HasSuffix(row, noteEnd) || !d.exists(row) {
			continue
		}
		out = append(out, named{Name: ticketNamed(row), Text: d.read(row)})
	}
	return out
}

// The tickets a group leaves open that a box can close: each open child, and each open ticket the branch adds with no group. [[spec/design_output/work#a-box-leaves]]
func (d *Doors) leftOpen(name string) []string {
	all := d.childrenHere(name)
	for _, one := range d.addedHere() {
		if one.Name != name && fieldOf(one.Text, groupField) == "" && fieldOf(one.Text, "state") != draftState {
			all = append(all, one)
		}
	}
	var out []string
	for _, one := range all {
		if fieldOf(one.Text, "state") == closedState || isGroup(one.Text) || onPersonRoute(one.Text) {
			continue
		}
		if !slices.Contains(out, one.Name) {
			out = append(out, one.Name)
		}
	}
	sort.Strings(out)
	return out
}

// Whether done stops, naming each ticket left open, its pull, and the road out for a person's work. [[spec/design_output/work#a-box-leaves]]
func (d *Doors) leftRefuses(name string) bool {
	left := d.leftOpen(name)
	if len(left) == 0 {
		return false
	}
	d.warn("%s reaches done once every ticket a box can close stands closed, and these stand open:", name)
	for _, one := range left {
		d.warn("  %s: ./RUNME.sh ticket pull %s", one, one)
	}
	d.warn("Close each one. Work a person alone can do moves to the person route, and leaves the group loose on main:")
	d.warn("  ./RUNME.sh mint ticket %s/<name>-person.md --process=%s, then ./RUNME.sh ticket pull <name> --became <name>-person", ticketsFolder, personRoute)
	return true
}
