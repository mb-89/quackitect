// The work view in shadow: drawn over fake rows, the badge it wears, and
// what the compare names.
// [[spec/tickets/the-work-view-gains-actions]]

package work

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/tui/tree"
)

type fakeSource struct{ values map[string]any }

func (f fakeSource) Read(name string) (json.RawMessage, error) {
	value, found := f.values[name]
	if !found {
		return nil, fmt.Errorf("no provider answers %s", name)
	}
	return json.Marshal(value)
}

var stamp = time.Date(2026, 9, 29, 12, 0, 0, 0, time.UTC)

var fakeRows = []IndexRow{
	{Name: "a-group", Kind: "group", State: "open", Queue: "1"},
	{Name: "a-child", Kind: "ticket", State: "open", Group: "a-group", Queue: "1.1"},
}

var fakeNames = []NameRow{{Name: "work/open-tasks", Label: "work", Looks: "count", Value: 5}}

func itemsAt(state, queue string) []tree.Item {
	return []tree.Item{{Name: "a-child", Keys: map[string]string{"state": state, "queue": queue}}}
}

func shadowOf(mode string) *Shadow {
	source := fakeSource{values: map[string]any{"work/rows": fakeRows, "index/names": fakeNames}}
	return &Shadow{From: source, Mode: func() string { return mode }, Now: func() time.Time { return stamp }}
}

// [[spec/tickets/the-work-view-gains-actions]]
func TestTheWorkViewDrawsOverAFakeWorkRows(t *testing.T) {
	t.Parallel()
	base, err := os.ReadFile(filepath.Join("..", "..", "..", "spec", "views", "work.base"))
	if err != nil {
		t.Fatal(err)
	}
	grid, err := ViewOver(string(base), fakeRows)
	if err != nil {
		t.Fatal(err)
	}
	drawn := grid.Header(120) + "\n" + grid.Rows(120, 10)
	for _, want := range []string{"a-group", "a-child"} {
		if !strings.Contains(drawn, want) {
			t.Fatalf("the work view over fake rows draws no %q:\n%s", want, drawn)
		}
	}
}

// [[spec/tickets/the-work-view-gains-actions]]
func TestTheBadgeDrawsTheLabelAndLookThePortDeclares(t *testing.T) {
	t.Parallel()
	if said := BadgeOf(fakeNames, "work/open-tasks"); said != "work (5)" {
		t.Fatalf("a count under the label work draws %q, and wants work (5)", said)
	}
	labelled := []NameRow{{Name: "work/open-tasks", Label: "queue", Looks: "count", Value: 2}}
	if said := BadgeOf(labelled, "work/open-tasks"); said != "queue (2)" {
		t.Fatalf("the label the port declares draws %q, and wants queue (2)", said)
	}
	plain := []NameRow{{Name: "work/open-tasks", Label: "work", Looks: "state", Value: 2}}
	if said := BadgeOf(plain, "work/open-tasks"); said != "work" {
		t.Fatalf("a look that is no count draws %q, and wants the label alone", said)
	}
	if said := BadgeOf(nil, "work/open-tasks"); said != "" {
		t.Fatalf("a name the catalog lacks draws %q", said)
	}
}

// [[spec/tickets/the-work-view-gains-actions]]
func TestTheShadowNamesEachWorkRowTheTabAndTheIndexReadApart(t *testing.T) {
	t.Parallel()
	apart := Apart(itemsAt("open", "2"), []IndexRow{{Name: "a-child", State: "open", Queue: "3"}})
	if len(apart) != 1 || apart[0].Name != "a-child" || apart[0].Old != "state=open queue=2" || apart[0].New != "state=open queue=3" {
		t.Fatalf("the compare names %+v, and wants a-child alone", apart)
	}
	if same := Apart(itemsAt("open", "3"), []IndexRow{{Name: "a-child", State: "open", Queue: "3"}}); len(same) != 0 {
		t.Fatalf("rows read alike name %+v", same)
	}
}

// [[spec/tickets/the-work-view-gains-actions]]
func TestTheShadowNamesABadgeTheTwoPathsDrawApart(t *testing.T) {
	t.Parallel()
	if apart := BadgeApart("work (3)", "work (4)"); len(apart) != 1 || apart[0].Name != "badge" || apart[0].Old != "work (3)" || apart[0].New != "work (4)" {
		t.Fatalf("the compare names %+v, and wants the badge alone", apart)
	}
	if apart := BadgeApart("work (4)", "work (4)"); len(apart) != 0 {
		t.Fatalf("a badge drawn alike names %+v", apart)
	}
}

// [[spec/tickets/the-work-view-gains-actions]]
func TestTheWorkShadowWritesAShadowRowOnAMismatchInShadow(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	if err := os.WriteFile(path, []byte("{\"kind\":\"prompt\"}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := shadowOf("shadow").Check(path, itemsAt("open", "9"), "work (4)"); err != nil {
		t.Fatal(err)
	}
	body, _ := os.ReadFile(path)
	if !strings.Contains(string(body), `"kind":"shadow"`) || !strings.Contains(string(body), "a-child") || !strings.Contains(string(body), `"slice":"window"`) {
		t.Fatalf("the log holds no shadow row naming a-child: %s", body)
	}
}

// [[spec/tickets/the-work-view-gains-actions]]
func TestTheWorkShadowWritesNoRowUnderOld(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	if err := os.WriteFile(path, []byte("{\"kind\":\"prompt\"}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := shadowOf("old").Check(path, itemsAt("open", "9"), "work (4)"); err != nil {
		t.Fatal(err)
	}
	if body, _ := os.ReadFile(path); strings.Count(string(body), "\n") != 1 {
		t.Fatalf("the log grew under old: %s", body)
	}
}

// The view draws the columns the base file names, whatever rows it holds. [[spec/tickets/fake-rows-case-panics-red]]
func TestTheViewOverDrawsTheColumnsOfTheBaseFile(t *testing.T) {
	t.Parallel()
	base, err := os.ReadFile(filepath.Join("..", "..", "..", "spec", "views", "work.base"))
	if err != nil {
		t.Fatal(err)
	}
	grid, err := ViewOver(string(base), nil)
	if err != nil {
		t.Fatal(err)
	}
	if head := grid.Header(120); !strings.Contains(head, "name") || !strings.Contains(head, "queue") {
		t.Fatalf("the header draws %q, and wants the name and queue columns", head)
	}
}

// The tab starts no compare before the count has landed, or with no shadow. [[spec/tickets/the-work-view-gains-actions]]
func TestTheWorkTabRunsNoCompareBeforeTheCountLands(t *testing.T) {
	t.Parallel()
	tab := New(filepath.Join(t.TempDir(), "session.jsonl"))
	tab.Shadow = shadowOf("shadow")
	tab.Tree = tree.NewTree(nil, nil, false)
	if tab.check() != nil {
		t.Fatal("a tab with no count starts a compare")
	}
	tab.counted = true
	if tab.check() == nil {
		t.Fatal("a tab with its count starts no compare")
	}
	tab.Shadow = nil
	if tab.check() != nil {
		t.Fatal("a tab with no shadow starts a compare")
	}
}

// A pair told once stands once in the log. [[spec/tickets/the-work-view-gains-actions]]
func TestAWorkPairToldOnceStandsOnceInTheLog(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	sh := shadowOf("shadow")
	for range 3 {
		if err := sh.Check(path, itemsAt("open", "9"), "work (5)"); err != nil {
			t.Fatal(err)
		}
	}
	body, _ := os.ReadFile(path)
	if lines := strings.Count(string(body), "\n"); lines != 2 {
		t.Fatalf("the log holds %d lines after three compares, and wants the two mismatches once", lines)
	}
}
