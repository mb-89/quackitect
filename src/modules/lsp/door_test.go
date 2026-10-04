// The door's tool runs against a real process: a halt ends a run in flight.
// [[spec/tickets/the-index-stops-its-tools]]
package lsp

import (
	"os"
	"testing"
	"time"
)

// The variable that makes this test binary a tool waiting until it is killed, the span a case lets it start, and the span a halt ends it within. [[spec/tickets/the-index-stops-its-tools]]
const (
	toolWaitsEnv = "SE_LSP_TOOL_WAITS"
	toolStarts   = 200 * time.Millisecond
	haltWithin   = 5 * time.Second
)

func TestAToolThatWaits(t *testing.T) {
	if os.Getenv(toolWaitsEnv) == "" {
		return
	}
	time.Sleep(time.Hour)
}

func TestAHaltEndsARunningTool(t *testing.T) {
	t.Setenv(toolWaitsEnv, "1")
	run, halt := runsUntilHalt()
	done := make(chan struct{})
	go func() {
		run(t.TempDir(), "", os.Args[0], "-test.run=^TestAToolThatWaits$")
		close(done)
	}()
	time.Sleep(toolStarts)
	halt()
	select {
	case <-done:
	case <-time.After(haltWithin):
		t.Fatalf("the tool runs %v past the halt", haltWithin)
	}
}
