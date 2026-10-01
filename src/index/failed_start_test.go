// A start that fails part way stops every part it reached.
// [[spec/design_output/index#the-door-owns-the-database]]
package index

import (
	"errors"
	"net"
	"path/filepath"
	"sync/atomic"
	"testing"

	"quackitect/src/q"
)

// The door listens for the old API first and for /v1 second. [[spec/design_output/model#surfaces]]
const v1Listen = 2

func TestAFailedV1StartStopsThePartsItReached(t *testing.T) {
	root := tree(t)
	var managed, started atomic.Bool
	manage := func(string, *q.Store, OpRows, Reads, func(func())) (Managed, error) {
		return Managed{Stop: func() { managed.Store(true) }}, nil
	}
	start := func(string, Commit) (func(), error) {
		return func() { started.Store(true) }, nil
	}
	var old net.Listener
	calls := 0
	listen := func(network, address string) (net.Listener, error) {
		calls++
		if calls == v1Listen {
			return nil, errors.New("the /v1 port stands taken")
		}
		listener, err := net.Listen(network, address)
		old = listener
		return listener, err
	}
	_, _, _, err := opensOn(listen, root, filepath.Join(t.TempDir(), "index.db"), q.New(), manage, start)
	if err == nil {
		t.Fatal("the start answers no error past a failed /v1 listen")
	}
	if !managed.Load() || !started.Load() {
		t.Fatalf("the manager stops %v and the IO module stops %v after the failed start", managed.Load(), started.Load())
	}
	if conn, err := net.Dial("tcp", old.Addr().String()); err == nil {
		conn.Close()
		t.Fatal("the old API port still answers after the failed start")
	}
}
