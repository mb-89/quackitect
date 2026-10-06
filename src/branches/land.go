// A hand-back lands: the ticket goes to disk, the named paths stage, and one
// commit names the ticket and what changes, as landedAlone in
// src/scripts/pull-landed.js lands it. A commit the hook refuses lands nothing.
// [[spec/design_output/pull#the-refused-commit]]
package branches

import (
	"regexp"
	"strconv"
	"strings"
)

var hunkAt = regexp.MustCompile(`^@@+ .*\+(\d+)(?:,\d+)? @@`)

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
	d.quiet(append([]string{"add", "--"}, paths...)...)
	only := append([]string{"--"}, paths...)
	ran := Said{Err: d.stagedFault(only)}
	if ran.Err == "" {
		ran = d.quiet(append([]string{"commit", "-m", one.Name + ": " + strings.Join(changes, ", ")}, only...)...)
	}
	if ran.OK {
		return ""
	}
	d.quiet(append([]string{"reset", "-q"}, only...)...)
	_ = d.write(one.At, stood)
	switch {
	case ran.Err != "":
		return ran.Err
	case ran.Out != "":
		return ran.Out
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
	return MergeRefusal(nil, MarkedIn(d.quiet(append([]string{"diff", "--cached", "--unified=0"}, only...)...).Out))
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

// The openers a staged delta adds, each as its file and line. [[spec/design_output/work#no-commit-carries-a-marker]]
func MarkedIn(delta string) []string {
	var out []string
	file, at, binary := "", 0, false
	for _, line := range splitRows(delta) {
		switch {
		case strings.HasPrefix(line, "diff --git "):
			file, binary = "", false
			continue
		case strings.HasPrefix(line, "Binary files") || strings.HasPrefix(line, "GIT binary patch"):
			binary = true
			continue
		case strings.HasPrefix(line, "+++ "):
			file = strings.TrimPrefix(strings.TrimPrefix(line, "+++ "), "b/")
			continue
		}
		if found := hunkAt.FindStringSubmatch(line); found != nil {
			at, _ = strconv.Atoi(found[1])
			continue
		}
		if !strings.HasPrefix(line, "+") || strings.HasPrefix(line, "+++") {
			continue
		}
		if file != "" && !binary && markOpens.MatchString(line[1:]) {
			out = append(out, file+":"+strconv.Itoa(at))
		}
		at++
	}
	return out
}
