// The sentinel the wiring builds: the registry off the tree, the clock door,
// the process door, and the log a fired failure writes its row to.
// [[spec/design_output/failures#the-sentinel-fires-a-watch]]
package main

import (
	"time"

	"quackitect/src/failure"
)

// The clock door the sentinel arms a quiet watch on and stamps a fired row by. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type sentinelClock interface {
	failure.Timer
	Now() time.Time
}

// The hand the hooks door hears each post through, over a sentinel on the registry the reader holds. [[spec/tickets/the-hooks-feed-the-sentinel]]
func sentinelOver(from failure.Reader, clock sentinelClock, run failure.Runner, say func(row map[string]any) error) func(failure.Event) {
	return func(failure.Event) {}
}
