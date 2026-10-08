// The fixtures the port_a cases share: the group with one sync step, a
// child, and the helpers that move the clone onto a branch and read origin.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it declares the unexported pa helpers on the tree fixture that the port_a tests use

import (
	"fmt"
	"regexp"
	"strings"
	"testing"

	"quackitect/src/front"
)

// The group GROUP_NOTE names: marked urgent, a sync step, then its children. [[spec/tickets/work-verbs-port-to-go]]
const paGroupNote = `---
kind: [[ticket]]
state: open
urgent: true
process: [[group]]
steps:
  - name: sync
    does: takes trunk into the branch
  - name: children
    by: children
---

# Ask

Two tickets that land as one.

# sync

# children

# Discussion

Nothing yet.
`

// The child CHILD names: a ticket of the group at a state, with one step. [[spec/tickets/work-verbs-port-to-go]]
func paChild(group, state string) string {
	return fmt.Sprintf(`---
kind: [[ticket]]
state: %s
group: %s
steps:
  - name: do
    does: makes the change the ask names
---

# Ask

One piece of it.

# do

# Discussion

Nothing yet.
`, state, group)
}

// The group with a take standing open on its sync step, as the JS done case writes it. [[spec/tickets/work-verbs-port-to-go]]
func paTaken() string {
	return withEntry(paGroupNote, front.Ordered{{Key: "step", Value: "sync"}, {Key: "hand", Value: "box 3f9a"}, {Key: "hash_before", Value: "a1b2c3"}})
}

// Moves the clone onto a local work branch at origin's tip. [[spec/tickets/work-verbs-port-to-go]]
func paOn(one *tree, name string) {
	one.t.Helper()
	one.cut(workBranch+name, "origin/"+workBranch+name)
}

// Whether origin carries a branch. [[spec/tickets/work-verbs-port-to-go]]
func paOriginHas(one *tree, branch string) bool {
	one.t.Helper()
	return one.originHas(branch)
}

// Fails where the text matches no pattern. [[spec/tickets/work-verbs-port-to-go]]
func paMatch(t *testing.T, text, pattern string) {
	t.Helper()
	if !regexp.MustCompile(pattern).MatchString(text) {
		t.Fatalf("%q matches no %q", text, pattern)
	}
}

// Fails where the text matches the pattern. [[spec/tickets/work-verbs-port-to-go]]
func paNoMatch(t *testing.T, text, pattern string) {
	t.Helper()
	if regexp.MustCompile(pattern).MatchString(text) {
		t.Fatalf("%q matches %q", text, pattern)
	}
}

// Everything a verb printed, its output then its errors. [[spec/tickets/work-verbs-port-to-go]]
func paSaid(one *tree) string {
	return strings.TrimRight(one.out.String()+one.errs.String(), "\n")
}
