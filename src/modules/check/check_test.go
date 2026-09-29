// Every twin stands as a check/ name with a doc and an empty list for its
// built-in value, and a golden file stands beside each.
// [[spec/tickets/check-names-meet-their-goldens]]
package check

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestEveryTwinNameStands(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	for _, twin := range Twins {
		said, ok := index.Read(Prefix + twin).([]Finding)
		if !ok || len(said) != 0 {
			t.Fatalf("%s%s reads %v, and wants an empty list of findings", Prefix, twin, said)
		}
		if _, err := os.Stat(filepath.Join("testdata", twin+".golden.json")); err != nil {
			t.Fatalf("no golden file stands for %s: run go test ./src/lsp -run TestTwinGoldens -twins", twin)
		}
	}
}
