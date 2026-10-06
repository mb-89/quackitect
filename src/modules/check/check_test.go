// Every twin stands as a check/ name with an empty list for its built-in
// value. TestTwinGoldens in src/quack holds the golden file beside each.
// [[spec/tickets/check-names-meet-their-goldens]]
package check

import (
	"slices"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestEveryTwinNameStands(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) {
		Registers(c)
		q.OutIn(c, TrackedPort, []string{}, q.Doc("the paths git tracks, as the case seeds them"))
	})
	for _, twin := range Twins {
		said, ok := index.Read(twin).([]Finding)
		if !ok || len(said) != 0 {
			t.Fatalf("%s reads %v, and wants an empty list of findings", twin, said)
		}
	}
}

func TestTheTwinsHoldNoVale(t *testing.T) {
	if slices.Contains(Twins, "vale") {
		t.Fatalf("the twins %v hold vale, and the Go rules own the prose", Twins)
	}
}
