// The two tabs the window holds, reached off the model the way the window
// tests read them.
// [[spec/design_output/tui#the-packages-the-window-holds]]

package main

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/tui/draw"
	"quackitect/tui/frame"
	"quackitect/tui/tree"
	"quackitect/tui/work"
)

func theWork(m frame.Model) *work.Tab { return m.Tabs[1].(*work.Tab) }

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
