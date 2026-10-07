// A start that fails part way stops every part it reached.
// [[spec/design_output/index#the-door-owns-the-database]]
package index

import (
	"path/filepath"
	"sync/atomic"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The door listens for the old API first and for /v1 second. [[spec/design_output/model#surfaces]]
const v1Listen = 2

// The old port closes once the start fails, which Serve's own goroutine makes where the server closes before it serves, so the case waits on the close. [[spec/tickets/io-answers-take-result-shape]]
func TestAFailedV1StartStopsThePartsItReached(t *testing.T) {
	root := tree(t)
	var managed, started atomic.Bool
	manage := func(string, *q.Store, OpRows, Reads, func(func())) (Managed, error) {
		return Managed{Stop: func() { managed.Store(true) }}, nil
	}
	start := func(string, Commit) (func(), error) {
		return func() { started.Store(true) }, nil
	}
	fake := newMemNet(t)
	fake.failsAt = v1Listen
	_, _, _, err := opensOn(qtest.Wall(), fake.listen, root, filepath.Join(t.TempDir(), "index.db"), q.New(), manage, start)
	if err == nil {
		t.Fatal("the start answers no error past a failed /v1 listen")
	}
	if !managed.Load() || !started.Load() {
		t.Fatalf("the manager stops %v and the IO module stops %v after the failed start", managed.Load(), started.Load())
	}
	if len(fake.made) != 1 {
		t.Fatalf("the start listens on %d port(s) before the failed one, and wants the old API's", len(fake.made))
	}
	<-fake.made[0].closed
}
