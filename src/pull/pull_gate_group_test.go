// A reject at a group's accept mints each finding as a child the group waits
// on, and a second reject takes the same road. [[spec/design_output/pull#the-gate]]
package pull // level0: InPackageTest - reaches the in-package helpers cloudPull and must

import (
	"strings"
	"testing"
)

// A group at its accept, its one child closed. [[spec/design_output/pull#the-gate]]
const acceptingGroup = `---
kind: [[ticket]]
state: open
steps:
  - name: split
    does: names the children
  - name: children
    by: children
    on_fail: split
  - name: accept
    gate: does the work add up to the goal
    final: true
    evidence:
      - name: verdict
        form: verdict
        says: accept, or reject with findings one a line
process: [[spec/processes/group]]
step: accept
---

# Ask

A group of one change.

# split

# children

# accept

## verdict

<!-- the form is verdict -->

# Discussion
`

// A child of g, closed done. [[spec/design_output/pull#the-gate]]
func closedChild(name string) string {
	return "---\nkind: [[ticket]]\nstate: closed\nprocess: [[spec/processes/small]]\ngroup: g\nreason: done\n---\n\n# Ask\n\n" + name + " closes.\n"
}

// Writes the files, commits and pushes them to work/g. [[spec/design_output/pull#the-gate]]
func landedOn(t *testing.T, it *It, files map[string]string) {
	t.Helper()
	for path, text := range files {
		must(t, it.Disk.Write(path, text))
	}
	must(t, it.Git.AddAll())
	_, err := it.Git.Commit("the fixture lands", nil)
	must(t, err)
	if pushed := it.Git.Push("work/g", false); !pushed.OK {
		t.Fatalf("the push answers %q", pushed.Err)
	}
}

// Pulls g at accept, rejects it with the findings, and reads each child and the group's step. [[spec/design_output/pull#the-gate]]
func rejectsInto(t *testing.T, it *It, errs func() string, names ...string) {
	t.Helper()
	it.Pulling([]string{"pull"})
	rows := []string{"reject"}
	for _, name := range names {
		rows = append(rows, "- "+name+": "+name+" stands short")
	}
	fields := `{"verdict":"` + strings.Join(rows, `\n`) + `"}`
	if code := it.Pulling([]string{"pull", "g", "--fields", fields}); code != 0 {
		t.Fatalf("the reject answers %d:\n%s", code, errs())
	}
	for _, name := range names {
		text, ok := it.Disk.Read("spec/tickets/" + name + ".md")
		if !ok || FieldOf(text, "state") != Open || FieldOf(text, GroupField) != "g" || FieldOf(text, "todo") != "" {
			t.Fatalf("%s stands %v:\n%s\n%s", name, ok, text, errs())
		}
	}
	group, _ := it.Disk.Read("spec/tickets/g.md")
	if FieldOf(group, "step") != "children" || FieldOf(group, "state") != Open || strings.Contains(group, "children-2") {
		t.Fatalf("g stands at %q:\n%s", FieldOf(group, "step"), group)
	}
}

func TestARejectAtAGroupsAcceptMintsItsFindings(t *testing.T) {
	t.Parallel()
	it, _, errs := cloudPull(t)
	landedOn(t, it, map[string]string{"spec/tickets/g.md": acceptingGroup, "spec/tickets/alpha.md": closedChild("alpha")})
	rejectsInto(t, it, errs.String, "fix-one", "fix-two")
	landedOn(t, it, map[string]string{"spec/tickets/fix-one.md": closedChild("fix-one"), "spec/tickets/fix-two.md": closedChild("fix-two")})
	rejectsInto(t, it, errs.String, "fix-three")
}
