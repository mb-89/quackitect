// The tabs the window holds, reached off the model the way the window
// tests read them.
// [[spec/design_output/tui#the-packages-the-window-holds]]

package main

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/q/qtest"
	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
	"quackitect/src/tui/log"
	"quackitect/src/tui/tree"
	"quackitect/src/tui/work"
)

func theWork(m frame.Model) *work.Tab { return m.Tabs[1].(*work.Tab) }

// A row the way the log writes one, read through the parser the tab reads with. [[spec/design_output/log#what-one-line-looks-like]]
func row(at int, door, said string) log.Record {
	return log.ParseRecord(fmt.Sprintf(`{"at":"2026-09-11T15:00:%02dZ","level":"info","kind":%q,"said":%q}`, at, door, said))
}

func window(n int) frame.Model {
	m := newModel("no/such/log.jsonl", time.UTC)
	m.W, m.H = 120, 10+frame.NamesWide+frame.HeadWide+frame.FootWide
	for at := 1; at <= n; at++ {
		logTab(m).All = append(logTab(m).All, row(at, "tool", fmt.Sprintf("line %d", at)))
	}
	logTab(m).Rebuild(m.Rows())
	return m
}

func press(m frame.Model, keys ...string) frame.Model {
	for _, name := range keys {
		msg := tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(name)}
		if name == "enter" {
			msg = tea.KeyMsg{Type: tea.KeyEnter}
		}
		out, _ := m.Update(msg)
		m = out.(frame.Model)
	}
	return m
}

func alt(m frame.Model, key rune) frame.Model {
	out, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{key}, Alt: true})
	return out.(frame.Model)
}

// The window's catalog posts through the door over the root, and an action no index takes answers an error, whether an index stands or none does. [[spec/tickets/the-work-keys-call-actions]]
func TestTheIndexCatalogAnswersAnErrorForAnActionNoIndexTakes(t *testing.T) {
	t.Parallel()
	var catalog work.Source = indexCatalog{clock: qtest.Wall()}
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
