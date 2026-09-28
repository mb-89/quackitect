// The fake index keeps the contract, and reads a file the case seeds.
// [[spec/design_output/model#the-fake-index]]
package qtest

import (
	"strings"
	"testing"

	"quackitect/src/q"
)

func TestTheFakeKeepsTheContract(t *testing.T) {
	Suite(t, func(t testing.TB, register func(*q.Catalog)) Harness { return New(t, register) })
}

func TestTheFakeHandsAnIOModuleItsStore(t *testing.T) {
	ix := New(t, func(c *q.Catalog) { q.GivenIn(c, "t/n", 0, q.Doc("a count")) })
	if ix.Store() == nil {
		t.Fatal("the fake hands an IO module no store")
	}
}

type linesOf struct {
	File q.Content `q:"files/a.md"`
}

func TestADerivedProviderReadsASeededFile(t *testing.T) {
	fake := New(t, func(c *q.Catalog) {
		q.DerivedIn(c, "t/lines", 0, func(in linesOf) int { return strings.Count(in.File.Text, "\n") })
	})
	fake.Seed(map[string]any{"files/a.md": q.Content{Hash: "h", Text: "one\ntwo\n"}})
	if got := fake.Run("t/lines"); got != 2 {
		t.Fatalf("t/lines reads %v", got)
	}
}

// Over drives a catalog another hand fills, and asks for no provider key, since the wiring file picks a module in place of a key. [[spec/tickets/the-wiring-file-binds-ports]]
func TestOverDrivesACatalogWithNoProviderKeys(t *testing.T) {
	c := q.New()
	inputs := q.GivenIn(c, "files/<path...>", q.Content{}, q.Doc("a file, as the case seeds it"))
	q.DerivedIn(c, "t/lines", 0, func(in linesOf) int { return strings.Count(in.File.Text, "\n") })
	fake := Over(t, c, inputs)
	fake.Seed(map[string]any{"files/a.md": q.Content{Hash: "h", Text: "one\n"}})
	if got := fake.Run("t/lines"); got != 1 {
		t.Fatalf("t/lines reads %v", got)
	}
}
