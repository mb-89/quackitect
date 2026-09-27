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

type linesOf struct {
	Text string `q:"files/a.md"`
}

func TestADerivedProviderReadsASeededFile(t *testing.T) {
	fake := New(t, func(c *q.Catalog) {
		q.DerivedIn(c, "t/lines", 0, func(in linesOf) int { return strings.Count(in.Text, "\n") })
	})
	fake.Seed(map[string]any{"files/a.md": "one\ntwo\n"})
	if got := fake.Run("t/lines"); got != 2 {
		t.Fatalf("t/lines reads %v", got)
	}
}
