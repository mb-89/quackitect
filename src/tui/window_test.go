// The two tabs the window holds, reached off the model the way the window
// tests read them.
// [[spec/design_output/tui#the-packages-the-window-holds]]

package main

import (
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
