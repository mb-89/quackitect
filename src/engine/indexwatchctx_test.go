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
// context's end begins the shutdown, and stop is how a caller waits for it.
//
// THE TEST DECIDES BOTH HALVES ITSELF. The socket is watched to go on the
// cancel alone, before stop is called, so a shutdown that only stop began
// would leave that wait to time out. The handles are asked after stop, and a
// closed one says so, because the tree's cleanup unlinks an open file on
// Linux and would assert nothing.
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
	stop, socket, _, handles := startIndexer(ctx, r, log, time.Hour, fed.open)
	if socket == "" {
		t.Fatal("the model did not listen")
	}
	fed.settle()

	cancel()
	deadline := time.Now().Add(5 * time.Second)
	for {
		if _, err := os.Stat(socket); os.IsNotExist(err) {
			break
		}
		if time.Now().After(deadline) {
			t.Fatal("the socket file survived the context, and stop was not called")
		}
		time.Sleep(10 * time.Millisecond)
	}
	if conn, err := net.Dial("unix", socket); err == nil {
		conn.Close()
		t.Fatal("the model still listens after its context ended")
	}

	stop() // the shutdown has begun, so this waits for the loop to end and the handles to close
	for i, h := range handles {
		var one int
		err := h.QueryRow("select 1").Scan(&one)
		if err == nil || err.Error() != "sql: database is closed" {
			t.Fatalf("index handle %d is not closed after stop returned: %v", i, err)
		}
	}
}
