package main

import (
	"context"
	"net"
	"os"
	"testing"
	"time"
)

// THE INDEXER STOPS WITH ITS CONTEXT.
//
// It is the engine's longest-lived goroutine, and nothing it started took a
// context, so a test had nothing to hand t.Context to, and one that forgot
// stop left the index handles and the socket open past its own cleanup. Two
// tests on the record failed their TempDir cleanup that way. Now the
// context's end is the shutdown, and stop is how a caller waits for it.
func TestTheIndexerStopsWithItsContext(t *testing.T) {
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
	fed := feedWatcher(r, true)
	stop, socket, _ := startIndexer(ctx, r, log, time.Hour, fed.open)
	if socket == "" {
		t.Fatal("the model did not listen")
	}
	fed.settle()

	cancel()
	stop() // waits for the shutdown the cancel began, and starts none of its own

	if _, err := os.Stat(socket); !os.IsNotExist(err) {
		t.Fatalf("the socket file survived the context: %v", err)
	}
	if conn, err := net.Dial("unix", socket); err == nil {
		conn.Close()
		t.Fatal("the model still listens after its context ended")
	}
	// THE INDEX HANDLES ARE CLOSED, so the tree's cleanup finds nothing held.
	// t.TempDir's own cleanup is the assertion: a handle left open fails it.
}
