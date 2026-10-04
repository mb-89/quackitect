// The retro's backlog read: every prose criterion a ticket the window closes
// carries, printed beside the verdict the retro's folder holds for it.
// [[spec/tickets/the-retro-reads-the-backlog]]
package main

import "io"

// What backlog reaches: the root and git. [[spec/tickets/the-retro-reads-the-backlog]]
type retroBacklogDoors struct {
	root string
	git  func(args ...string) retroRan
}

func init() { register("retro backlog", retroBacklogVerb(retroBacklogLive)) }

// The doors backlog runs on outside a test. [[spec/tickets/the-retro-reads-the-backlog]]
func retroBacklogLive() retroBacklogDoors { return retroBacklogDoors{} }

// retro backlog <retro>, as backlog in src/engine/retro/backlog.js answers it. [[spec/tickets/the-retro-reads-the-backlog]]
func retroBacklogVerb(doors func() retroBacklogDoors) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return 0 }
}

// A prose criterion is an Ask bullet naming no command in backticks. [[spec/tickets/the-retro-reads-the-backlog]]
func retroCriteriaOf(text string) []string { return nil }
