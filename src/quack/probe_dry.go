// The dry probe in Go: the shapes its session leaves and its reading, stubs
// until the implement step lands the road. [[spec/tickets/probes-leave-node]]
package main

import "quackitect/src/modules/hooks"

// The checks the dry probe reads, in order. [[spec/tickets/probes-leave-node]]
var dryChecks = []string{"door", "rules", "prompt", "tools", "guard", "canary", "quiet", "clear"}

// One post the dry session makes, and the door's answer to it. [[spec/tickets/probes-leave-node]]
type dryPost struct {
	url, event string
	e          map[string]any
	status     int
	effects    []hooks.Effect
}

// One run of the clear road: its words, its exit, and what it says. [[spec/tickets/probes-leave-node]]
type dryRan struct {
	words string
	exit  int
	said  string
}

// What the clear road leaves: its runs, the pull past the clear, the read's pass, and the leaf's commit. [[spec/tickets/probes-leave-node]]
type dryCleared struct {
	runs         []dryRan
	pulled, read string
	committed    dryRan
}

// What one dry session leaves: whether the door stood, the prompt as given, the tools the index lists, every post, and the clear road. [[spec/tickets/probes-leave-node]]
type drySeen struct {
	door    bool
	prompt  string
	tools   []string
	posts   []dryPost
	cleared *dryCleared
}

// Reads every dry check off the rows and the session, a stub reading none. [[spec/tickets/probes-leave-node]]
func readsDry(rows []probeRow, seen drySeen) []coldCheck { return nil }

// The working change as a patch, untrimmed, a stub reading none. [[spec/tickets/probes-leave-node]]
func workingDelta(d boxDoors) string { return "" }

// Reads every dry check but the clear, a stub reading none. [[spec/tickets/probes-leave-node]]
func readsSmoke(rows []probeRow, seen drySeen) []coldCheck { return nil }

// Stands the smoke's shared clone with the root's built tools, a stub standing nothing. [[spec/tickets/probes-leave-node]]
func smokeTree(d boxDoors, say func(string), box coldBox) bool { return false }

// Removes the probe's temp tree and names it where it stays, a stub removing nothing. [[spec/tickets/probes-leave-node]]
func leaves(remove func(string) error, temp string, say func(string)) {}

// Drops every park the clone carries and commits that, a stub dropping none. [[spec/tickets/probes-leave-node]]
func unparked(d boxDoors, tree string) {}
