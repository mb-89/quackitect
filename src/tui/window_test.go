// The tabs the window holds, reached off the model the way the window
// tests read them.
// [[spec/design_output/tui#the-packages-the-window-holds]]

package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
	"quackitect/src/tui/tree"
	"quackitect/src/tui/work"
)

func theWork(m frame.Model) *work.Tab { return m.Tabs[1].(*work.Tab) }

// The window's catalog posts through the door over the root, and an action no index takes answers an error, whether an index stands or none does. [[spec/tickets/the-work-keys-call-actions]]
func TestTheIndexCatalogAnswersAnErrorForAnActionNoIndexTakes(t *testing.T) {
	t.Parallel()
	var catalog work.Source = indexCatalog{}
	if _, err := catalog.Call("t/nowhere", struct{}{}); err == nil {
		t.Fatal("a call of t/nowhere answers no error")
	}
}

// The declared views stand first, and the registry tabs after them. [[spec/design_output/model#the-registry-tabs]]
func TestTheStripNamesTheRegistryTabsAfterTheViews(t *testing.T) {
	m := newModel(filepath.Join(t.TempDir(), "session.jsonl"), time.UTC)
	for at, want := range []string{"log", "work", "index", "cli", "help"} {
		if at >= len(m.Tabs) || m.Tabs[at].Name() != want {
			t.Fatalf("the tab at %d reads %v, not %s", at+1, m.Tabs, want)
		}
	}
}

// Every row's name in the order the tree draws them. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func namesOf(t *tree.Tree) []string {
	out := make([]string, 0, t.Len())
	for at := 0; at < t.Len(); at++ {
		t.MoveTo(at)
		out = append(out, t.Selected().Name)
	}
	return out
}

// The window reads the colours at start, and a case run stands in for that start. [[spec/tickets/the-colours-stand-in-config]]
func TestMain(m *testing.M) {
	draw.LoadColoursForCases(filepath.Join("..", ".."))
	os.Exit(m.Run())
}
