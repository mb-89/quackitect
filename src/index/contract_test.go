// The real index keeps the contract the fake index stands for: each case
// opens the door, and drives the store and the scheduler it builds.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package index // level0: InPackageTest - it drives the unexported opens and the door's store

import (
	"path/filepath"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The catalog Serve builds, with the files, config and clock inputs the IO modules and the config module register, served by the door. [[spec/design_output/model#the-fake-keeps-a-contract]]
func throughTheDoor(t testing.TB, register func(*q.Catalog)) qtest.Harness {
	c := q.New()
	inputs := q.Join(
		q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file's hash and text, as the case seeds it")),
		q.OutIn(c, "cfg/<key...>", "", q.Doc("a config value, as the case seeds it")),
		q.OutIn(c, "clock/minute", int64(0), q.Doc("the minute, as the case seeds it")),
	)
	register(c)
	one, stop, _, err := opens(t.TempDir(), filepath.Join(t.TempDir(), "index.db"), c, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	return qtest.Beside(t, one.store, inputs, one.drains)
}

func TestTheIndexKeepsTheContract(t *testing.T) {
	t.Parallel()
	qtest.Suite(t, throughTheDoor)
}
