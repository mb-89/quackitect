// The sentinel the wiring builds: the registry off the tree, the clock door,
// the process door, and the log a fired failure writes its row to.
// [[spec/design_output/failures#the-sentinel-fires-a-watch]]
package main

import (
	"fmt"
	"io"
	"path/filepath"
	"time"

	"quackitect/src/failure"
	"quackitect/src/modules/clock"
	"quackitect/src/modules/hooks"
)

// The clock door the sentinel arms a quiet watch on and stamps a fired row by. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type sentinelClock interface {
	failure.Timer
	Now() time.Time
}

// The hand the hooks door hears each post through, over a sentinel on the registry the reader holds. [[spec/tickets/the-hooks-feed-the-sentinel]]
func sentinelOver(from failure.Reader, clock sentinelClock, run failure.Runner, say func(row map[string]any) error, errs io.Writer) func(failure.Event) {
	// The fire hand answers nothing, so a row the log refuses prints here, and a lost row shows. [[spec/tickets/sentinel-say-error-lands]]
	fire := func(raised failure.Raised) {
		if err := say(raised.Row(clock.Now().UTC().Format(logStamp))); err != nil {
			fmt.Fprintf(errs, "the sentinel lost the row of %s: %v\n", raised.ID, err)
		}
	}
	return failure.NewSentinel(failure.Load(from), clock, fire, run).Hear
}

// The sentinel listensHooks hands the hooks door: the tree's nodes, the clock door, the process door at the root, and the session log. [[spec/tickets/wiring-names-listens-hooks]]
func sentinelHere(root string, errs io.Writer) func(failure.Event) {
	return sentinelOver(failure.Dir{Root: root}, clock.New(), failure.Shell{Root: root}, hooks.ShadowTo(filepath.Join(root, filepath.FromSlash(sessionLog))), errs)
}
