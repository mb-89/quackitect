// The standing file names the bus the manager runs and the token a peer
// shows.
// [[spec/design_output/model#the-standing-file]]
package index // level0: InPackageTest - it reads the unexported standingOf

import (
	"path/filepath"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestTheStandingFileNamesTheBusAndItsToken(t *testing.T) {
	t.Parallel()
	root := tree(t)
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	manage := func(string, *q.Store, OpRows, Reads, func(func())) (Managed, error) {
		return Managed{Stop: func() {}, Bus: bus}, nil
	}
	stop, _, err := ServeManaged(qtest.Wall(), root, filepath.Join(t.TempDir(), "index.db"), q.New(), manage)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	if standing.Bus == 0 || standing.Bus != bus.Port() || standing.Token == "" || standing.Token != bus.Token() {
		t.Fatalf("the standing file names bus %d and token %q, where the bus stands at %d", standing.Bus, standing.Token, bus.Port())
	}
}
