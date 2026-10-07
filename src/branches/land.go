// A hand-back lands: the ticket goes to disk, the named paths stage, and one
// commit names the ticket and what changes, as landedAlone in
// src/pull/pull_landed.go lands it. A commit the hook refuses lands nothing.
// [[spec/design_output/pull#the-refused-commit]]
package branches

import (
	"strconv"
	"strings"

	"quackitect/src/modules/git"
)

// A note to land: its name, its path under the work root, its text, and whether it stands private. [[spec/design_output/pull#the-refused-commit]]
type note struct {
	Name, At, Text string
	Private        bool
}

// Lands the note and the paths beside it in one commit, and answers the refusal where one comes back. [[spec/design_output/pull#the-refused-commit]]
func (d *Doors) landedAlone(one note, changes []string, also ...string) string {
	if !one.Private {
		if fault := d.unmergedFault(); fault != "" {
			return fault
		}
	}
	stood := d.read(one.At)
	_ = d.write(one.At, one.Text)
	if one.Private {
		return ""
	}
	paths := append([]string{one.At}, also...)
	_ = d.Repo.Add(paths)
	fault := d.stagedFault(paths)
	if fault == "" {
		fault = d.committed(one.Name+": "+strings.Join(changes, ", "), paths)
	}
	if fault == "" {
		return ""
	}
	_ = d.Repo.Reset(paths)
	_ = d.write(one.At, stood)
	return fault
}

// Commits the index, or the paths named alone, and answers what git refused it with. [[spec/design_output/pull#the-refused-commit]]
func (d *Doors) committed(message string, only []string) string {
	_, err := d.Repo.Commit(message, only)
	switch {
	case err == nil:
		return ""
	case strings.TrimSpace(err.Error()) != "":
		return strings.TrimSpace(err.Error())
	}
	return "the commit answers nothing"
}

// The refusal a merge standing unresolved answers before anything stages. [[spec/design_output/work#no-commit-carries-a-marker]]
func (d *Doors) unmergedFault() string {
	_, order := d.unmerged()
	return MergeRefusal(order, nil)
}

// The refusal a staged conflict marker answers before the commit. [[spec/design_output/work#no-commit-carries-a-marker]]
func (d *Doors) stagedFault(only []string) string {
	added, _ := d.Repo.StagedAdds(only)
	return MergeRefusal(nil, MarkedIn(added))
}

// The refusal every commit road answers, naming each file. [[spec/design_output/work#no-commit-carries-a-marker]]
func MergeRefusal(unmerged, marked []string) string {
	if len(unmerged) == 0 && len(marked) == 0 {
		return ""
	}
	rows := []string{"A merge stands unresolved, so no commit lands:"}
	for _, one := range unmerged {
		rows = append(rows, "  "+one+"  git lists it unmerged")
	}
	for _, one := range marked {
		rows = append(rows, "  "+one+"  a conflict marker")
	}
	rows = append(rows, "Resolve the merge first: write each file without its markers, then land the merge with ./RUNME.sh commit.")
	return strings.Join(rows, "\n")
}

// The conflict openers a staged delta with no context adds, each as its file and line, for a caller holding the diff's text. [[spec/design_output/work#no-commit-carries-a-marker]]
func MarkersIn(delta string) []string { return MarkedIn(git.AddsIn(delta)) }

// The conflict openers among the lines a delta adds, each as its file and line. [[spec/design_output/work#no-commit-carries-a-marker]]
func MarkedIn(added []git.Line) []string {
	var out []string
	for _, one := range added {
		if markOpens.MatchString(one.Text) {
			out = append(out, one.File+":"+strconv.Itoa(one.Line))
		}
	}
	return out
}
