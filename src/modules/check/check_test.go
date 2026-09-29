// Every twin stands as a check/ name with an empty list for its built-in
// value. TestTwinGoldens in src/lsp holds the golden file beside each.
// [[spec/tickets/check-names-meet-their-goldens]]
package check

import (
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
	}
}
