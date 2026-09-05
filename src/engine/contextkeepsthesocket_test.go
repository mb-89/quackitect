package main

import (
	"context"
	"errors"
	"net"
	"os"
	"strings"
	"testing"
	"time"
)

// THE CONTEXT OWNS THE SOCKET FOR LONGER THAN THE LOOP LIVES.
//
// runIndexer returns of its own accord on four supported paths, and each one
// is written to the record and carried on from: the watcher cannot be opened,
// the first scan fails, the tree cannot be watched, and the watcher's channels
// close. On those runs the loop is over while the process lives on, and the
// listener and the socket file are still the engine's to take away. So the
// shutdown the context runs has to outlive the loop, and a caller that holds
// the context alone is enough to close the socket.
func TestTheContextClosesTheSocketAfterTheLoopEnds(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	if err := os.MkdirAll(r.Private("log"), 0o755); err != nil {
		t.Fatal(err)
	}
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()

	ctx, cancel := context.WithCancel(t.Context())
	noWatcher := func() (watcher, error) { return nil, errors.New("this mount has no watcher") }
	stop, socket, _, _ := startIndexer(ctx, r, log, time.Hour, noWatcher)
	if socket == "" {
		t.Fatal("the model did not listen")
	}
	t.Cleanup(stop)

	// The loop ends before the context does, and the record is where it says
	// so. What follows is the degraded run the file's own comment covers, the
	// engine going on without an index.
	waitUntil(t, "the loop says it cannot watch the tree", func() bool {
		for _, line := range logLines(t, r) {
			if strings.Contains(line, "the tree cannot be watched") {
				return true
			}
		}
		return false
	})

	// THE LOOP'S OWN GOROUTINE IS GIVEN ITS TURN BEFORE THE CONTEXT ENDS.
	// The shutdown was watched for by a goroutine that also watched the loop,
	// and that one leaves as soon as the loop does. So the cancel below lands
	// after everything the loop's end set going, which is the run this test is
	// about, and not in a race with it.
	time.Sleep(100 * time.Millisecond)

	cancel()

	waitUntil(t, "the socket file to go with the context", func() bool {
		_, err := os.Stat(socket)
		return os.IsNotExist(err)
	})
	if conn, err := net.Dial("unix", socket); err == nil {
		conn.Close()
		t.Fatal("the model still listens after its context ended")
	}
}

// waitUntil gives the engine's own goroutines a bounded time to reach what the
// test waits on, and fails naming what did not happen. The wait is bounded
// because the thing waited on is another goroutine's, and nothing in the test
// hands it its turn.
func waitUntil(t *testing.T, what string, reached func() bool) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for {
		if reached() {
			return
		}
		if time.Now().After(deadline) {
			t.Fatalf("waited five seconds for %s", what)
		}
		time.Sleep(2 * time.Millisecond)
	}
}
