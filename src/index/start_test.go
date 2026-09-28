// The start: the door checks the catalog it takes, and a fault refuses it
// before a listener or a standing file stands.
// [[spec/design_output/model#the-index-resolves-in-passes]]
package index

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/q"
)

func TestABrokenCatalogRefusesTheStart(t *testing.T) {
	root := tree(t)
	broken := q.New()
	q.OutIn(broken, "t/n", 0)
	q.OutIn(broken, "t/n", 0)
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), broken)
	if err == nil {
		stop()
		t.Fatal("the door stands on a catalog naming t/n twice")
	}
	if !strings.Contains(err.Error(), "t/n") || !strings.Contains(err.Error(), "start_test.go:") {
		t.Fatalf("the refusal says %q", err)
	}
	if _, err := os.Stat(standingPath(root)); err == nil {
		t.Fatal("a standing file stands after the refusal")
	}
}
