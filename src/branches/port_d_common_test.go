// The fixtures the ported sync, switch, orphan, stands, list and desk cases
// share: the JS group note, its child, and the git moves a case sets up.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"fmt"
	"regexp"
	"strings"
	"testing"
)

// The group note the JS cases share: urgent, on the group route, with a sync and a children step. [[spec/tickets/work-verbs-port-to-go]]
const pdGroupNote = `---
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

// A child of a group at a state, as CHILD in the JS doors writes it. [[spec/tickets/work-verbs-port-to-go]]
func pdChild(group, state string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\ngroup: " + group + "\nsteps:\n  - name: do\n    does: makes the change the ask names\n---\n\n# Ask\n\nOne piece of it.\n\n# do\n\n# Discussion\n\nNothing yet.\n"
}

// A ticket no group holds, at a state. [[spec/tickets/work-verbs-port-to-go]]
func pdLoose(state string) string {
	return strings.Replace(pdChild("", state), "group: \n", "", 1)
}

// A note with a front row added under its kind row. [[spec/tickets/work-verbs-port-to-go]]
func pdUnderKind(text, row string) string {
	return strings.Replace(text, "kind: [[ticket]]\n", "kind: [[ticket]]\n"+row+"\n", 1)
}

// Moves the box onto a local work branch at origin's tip. [[spec/tickets/work-verbs-port-to-go]]
func pdOn(one *tree, name string) {
	one.t.Helper()
	one.git("switch", "-q", "-c", workBranch+name, "origin/"+workBranch+name)
}

// A file name no other commit of the case writes. [[spec/tickets/work-verbs-port-to-go]]
func pdFresh(one *tree, at int) string {
	return fmt.Sprintf("moved/%s-%d.txt", one.git("rev-parse", "--short", "HEAD"), at)
}

// Lands commits on main, pushes them, and comes back to the branch the box stood on. [[spec/tickets/work-verbs-port-to-go]]
func pdMainMoves(one *tree, count int) {
	one.t.Helper()
	was := one.git("rev-parse", "--abbrev-ref", "HEAD")
	if was != trunk {
		one.git("switch", "-q", trunk)
	}
	for at := 0; at < count; at++ {
		one.land("main moves", map[string]string{pdFresh(one, at): "x\n"})
	}
	one.git("push", "-q", "origin", trunk)
	if was != trunk {
		one.git("switch", "-q", was)
	}
	one.git("fetch", "-q", "origin")
}

// Pushes commits on the branch the box stands on, then drops them here, so origin stands ahead. [[spec/tickets/work-verbs-port-to-go]]
func pdRemoteAhead(one *tree, files ...map[string]string) {
	one.t.Helper()
	branch := one.git("rev-parse", "--abbrev-ref", "HEAD")
	for at, each := range files {
		if each == nil {
			each = map[string]string{pdFresh(one, at): "x\n"}
		}
		one.land("another hand lands", each)
	}
	one.git("push", "-q", "origin", branch)
	one.git("reset", "-q", "--hard", fmt.Sprintf("HEAD~%d", len(files)))
}

// Whether the first commit stands inside the second. [[spec/tickets/work-verbs-port-to-go]]
func pdInside(one *tree, commit, in string) bool {
	return one.d.quiet("merge-base", "--is-ancestor", commit, in).OK
}

// Fails where the text matches no pattern. [[spec/tickets/work-verbs-port-to-go]]
func pdMatches(t *testing.T, text, pattern string) {
	t.Helper()
	if !regexp.MustCompile(pattern).MatchString(text) {
		t.Fatalf("%q matches no %q", text, pattern)
	}
}

// Fails where the text matches the pattern. [[spec/tickets/work-verbs-port-to-go]]
func pdMisses(t *testing.T, text, pattern string) {
	t.Helper()
	if regexp.MustCompile(pattern).MatchString(text) {
		t.Fatalf("%q matches %q", text, pattern)
	}
}
