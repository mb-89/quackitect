// The index core writes no input name: files/, clock/ and env/ come from the
// IO modules the wiring loads.
// [[spec/design_output/model#io-modules-are-modules]]
package index

import (
	"testing"

	"quackitect/src/q"
)

func TestTheCoreWritesNoInputName(t *testing.T) {
	c := q.New()
	read := q.NewStore(c).Snapshot()
	for _, name := range []string{"files/a.md", "clock/minute", "env/SE_ROLE"} {
		if got := read.Read(name); got != nil {
			t.Fatalf("the core writes %s, which reads %v", name, got)
		}
	}
}
