// The retro's collect, its first step. It moves everything the private folder
// holds, past the dot folders and the scripts, into the retro's own input
// folder, and copies the scripts, the transcripts, the memory and the
// scratchpads beside it.
// [[spec/guidance/retro/collect]]
package main

import (
	"io"
	"time"
)

// One git run as the doors answer it: whether it passes, its output and its error text. [[spec/tickets/the-retro-reads-cloud-retros]]
type retroRan struct {
	ok       bool
	out, err string
}

// What collect reaches: the root, the home and temp folders the harness keeps its sources under, the clock, git and the move. [[spec/guidance/retro/collect]]
type retroCollectDoors struct {
	root, home, temp string
	now              func() time.Time
	git              func(args ...string) retroRan
	move             func(from, to string) error
}

// A ticket trunk closes, and the trunk commit landing it. [[spec/tickets/the-retro-reads-the-backlog]]
type retroLanding struct {
	name, sha, at string
}

// Every ticket trunk closes inside a window, newest first, or the error the log answers. [[spec/tickets/the-retro-reads-the-backlog]]
type retroClosed struct {
	ok       bool
	err      string
	landings []retroLanding
}

func init() { register("retro collect", retroCollectVerb(retroCollectLive)) }

// The doors collect runs on outside a test. [[spec/guidance/retro/collect]]
func retroCollectLive() retroCollectDoors { return retroCollectDoors{} }

// retro collect <retro> [--again], as collect in src/scripts/retro-collect.js answers it. [[spec/guidance/retro/collect]]
func retroCollectVerb(doors func() retroCollectDoors) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return 0 }
}

// Every ticket trunk takes closed since the window, and the trunk commit landing each. [[spec/tickets/the-retro-reads-the-backlog]]
func retroClosedIn(git func(args ...string) retroRan, since time.Time) retroClosed {
	return retroClosed{}
}

// The battery report a stamp's text keeps for a retro, its parts the median over the runs, or nothing where the stamp holds none. [[spec/guidance/retro/effect]]
func retroKeptReport(stamp string) string { return "" }
