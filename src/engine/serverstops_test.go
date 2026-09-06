package main

import (
	"context"
	"net"
	"testing"
	"time"
)

// THE SOCKET SERVER STOPS WITH ITS CONTEXT, and its signature says so.
//
// writing-go asks that a goroutine have an owner and a context that stops it,
// and that the context be the first parameter. Every other long-running thing
// in the engine took one. This did not: its listener was closed for it from
// startIndexer, so the owner was right and the signature said nothing, and a
// reader of serveModel could not tell what ended it.
//
// ACCEPT IS WHAT THE LOOP WAITS ON, so a cancelled context that only set a flag
// would be read when the next client arrived and not before. Closing the
// listener is what a cancel has to do to be felt.
func TestTheModelServerStopsWithItsContext(t *testing.T) {
	t.Parallel()

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = ln.Close() })

	ctx, cancel := context.WithCancel(t.Context())
	done := make(chan struct{})
	go func() {
		defer close(done)
		serveModel(ctx, ln, &model{})
	}()

	cancel()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("the server was still accepting five seconds after its context was cancelled")
	}
}

// AND SO DOES THE HOOK SERVER, which is the engine's other socket server.
//
// serveHooks took a context as its first parameter and stopped for nobody. It
// handed that context down to answerHook and then served until its listener
// was closed from main, so a caller that ended the context alone left the
// server accepting. The comment above it said the listener was what ended it,
// which is the confusion serveModel had just had removed.
func TestTheHookServerStopsWithItsContext(t *testing.T) {
	t.Parallel()

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = ln.Close() })

	ctx, cancel := context.WithCancel(t.Context())
	done := make(chan struct{})
	go func() {
		defer close(done)
		serveHooks(ctx, ln, Roots{}, nil)
	}()

	cancel()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("the hook server was still answering five seconds after its context was cancelled")
	}
}
