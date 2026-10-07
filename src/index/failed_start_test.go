// A start that fails part way stops every part it reached.
// [[spec/design_output/index#the-door-owns-the-database]]
package index // level0: InPackageTest - it drives the unexported opensOn

import (
	"errors"
	"net"
	"path/filepath"
	"sync/atomic"
	"testing"
	"time"

	"quackitect/src/q"
)

// The door listens for the old API first and for /v1 second. [[spec/design_output/model#surfaces]]
const v1Listen = 2

// How long the case waits on the close, which Serve's own goroutine makes where the server closes before it serves. [[spec/tickets/io-answers-take-result-shape]]
const closeWait = 2 * time.Second

// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestAFailedV1StartStopsThePartsItReached(t *testing.T) {
	t.Parallel()
	root := tree(t)
	var managed, started atomic.Bool
	manage := func(string, *q.Store, OpRows, Reads, func(func())) (Managed, error) {
		return Managed{Stop: func() { managed.Store(true) }}, nil
	}
	start := func(string, Commit) (func(), error) {
		return func() { started.Store(true) }, nil
	}
	var old *closeTold
	calls := 0
	listen := func(network, address string) (net.Listener, error) {
		calls++
		if calls == v1Listen {
			return nil, errors.New("the /v1 port stands taken")
		}
		listener, err := net.Listen(network, address)
		if err != nil {
			return nil, err
		}
		old = &closeTold{Listener: listener}
		return old, nil
	}
	_, _, _, err := opensOn(listen, root, filepath.Join(t.TempDir(), "index.db"), q.New(), manage, start)
	if err == nil {
		t.Fatal("the start answers no error past a failed /v1 listen")
	}
	if !managed.Load() || !started.Load() {
		t.Fatalf("the manager stops %v and the IO module stops %v after the failed start", managed.Load(), started.Load())
	}
	for deadline := time.Now().Add(closeWait); old != nil && !old.closed.Load() && time.Now().Before(deadline); {
		time.Sleep(time.Millisecond)
	}
	if old == nil || !old.closed.Load() {
		t.Fatal("the old API port still stands open after the failed start")
	}
}

// A listener telling its close, since a dial at a freed port meets whatever test binds it next. [[spec/tickets/io-answers-take-result-shape]]
type closeTold struct {
	net.Listener
	closed atomic.Bool
}

func (one *closeTold) Close() error {
	one.closed.Store(true)
	return one.Listener.Close()
}
