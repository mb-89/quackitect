// The fixtures the port_b cases share, ported from test/level0/work-doors.js:
// the group note, its child, the box identity and the reads over a real tree.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it declares the unexported pb helpers on the tree fixture and drives identity and withHashAfter

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"quackitect/src/front"
)

// The group ticket every work case reads, as GROUP_NOTE writes it. [[spec/tickets/work-verbs-port-to-go]]
const pbGroupNote = `---
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

// Where the group one-group stands, and the box id the identity names. [[spec/tickets/work-verbs-port-to-go]]
const (
	pbAt  = "spec/tickets/one-group.md"
	pbBox = "box d462e994b4cef"
)

// A child of a group at a state, as CHILD writes it. [[spec/tickets/work-verbs-port-to-go]]
func pbChild(group, state string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\ngroup: " + group + `
steps:
  - name: do
    does: makes the change the ask names
---

# Ask

One piece of it.

# do

# Discussion

Nothing yet.
`
}

// A child of one-group whose step needs a verb no box holds. [[spec/tickets/work-verbs-port-to-go]]
func pbNeeds() string {
	return strings.Replace(pbChild("one-group", "open"), "    does: makes the change the ask names\n", "    does: makes the change the ask names\n    needs: [\"nowhere here\"]\n", 1)
}

// The group with box 3f9a's take open on its sync step. [[spec/tickets/work-verbs-port-to-go]]
func pbTook() string {
	return withEntry(pbGroupNote, front.Ordered{{Key: "step", Value: "sync"}, {Key: "hand", Value: "box 3f9a"}, {Key: "hash_before", Value: "a1b2c3"}})
}

// A text's group closed, its take closed first. [[spec/tickets/work-verbs-port-to-go]]
func pbClosed(text string) string {
	took := withEntry(text, front.Ordered{{Key: "step", Value: "sync"}, {Key: "hand", Value: "box 3f9a"}, {Key: "hash_before", Value: "a1b2c3"}})
	return withField(withHashAfter(took, "d4e5f6"), "state", closedState)
}

// Writes the box identity the HAND fixture names into the clone. [[spec/tickets/work-verbs-port-to-go]]
func pbIdentify(one *tree) *tree {
	one.write(map[string]string{identity: `{"id":"d462e994b4cef"}`})
	return one
}

// Everything a verb printed, its output and its errors. [[spec/tickets/work-verbs-port-to-go]]
func pbSaid(one *tree) string { return one.out.String() + one.errs.String() }

// Moves the clone onto a local copy of a pushed work branch. [[spec/tickets/work-verbs-port-to-go]]
func pbOnBranch(one *tree, name string) {
	one.git("switch", "-q", "-c", workBranch+name, "origin/"+workBranch+name)
}

// Sets the clock a span past a ref's commit time. [[spec/tickets/work-verbs-port-to-go]]
func pbClockAt(one *tree, ref string, past time.Duration) {
	seconds, _ := strconv.ParseInt(one.git("log", "-1", "--format=%ct", ref), 10, 64)
	at := time.Unix(seconds, 0).Add(past)
	one.d.Now = func() time.Time { return at }
}

// Writes an executable hook script at a path. [[spec/tickets/work-verbs-port-to-go]]
func pbHook(one *tree, at, script string) {
	one.t.Helper()
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		one.t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte("#!/bin/sh\n"+script+"\n"), 0o755); err != nil {
		one.t.Fatal(err)
	}
}
