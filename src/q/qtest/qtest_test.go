// The fake index runs a derived provider, a fold and an action, and reads
// back every commit and every call.
// [[spec/design_output/model#the-fake-index]]
package qtest

import (
	"strings"
	"testing"

	"quackitect/src/q"
)

type linesOf struct {
	Text string `q:"files/a.md"`
}

func lines(c *q.Catalog) {
	q.DerivedIn(c, "t/lines", 0, func(in linesOf) int { return strings.Count(in.Text, "\n") })
}

func TestADerivedProviderRunsThroughTheFake(t *testing.T) {
	fake := New(t, lines)
	fake.Seed(map[string]any{"files/a.md": "one\ntwo\n"})
	if got := fake.Run("t/lines"); got != 2 {
		t.Fatalf("t/lines reads %v", got)
	}
}

func TestAFoldReducesTheSeededEvents(t *testing.T) {
	fake := New(t, func(c *q.Catalog) {
		q.FoldIn(c, "t/sum", 0, func(sum, event int) int { return sum + event })
	})
	if got := fake.Land("t/sum", 1, 2, 3); got != 6 {
		t.Fatalf("t/sum reads %v", got)
	}
}

func TestAnActionAnswersItsCallsAndThen(t *testing.T) {
	fake := New(t, func(c *q.Catalog) {
		q.ActionIn(c, "t/save", func(path string) []q.Call {
			return []q.Call{{Door: "disk", Verb: "write", Args: path, NoUndo: "a case", Then: func(said []any) []q.Call {
				if len(said) == 1 && said[0] == "ok" {
					return []q.Call{{Door: "git", Verb: "commit", NoUndo: "a case"}}
				}
				return nil
			}}}
		})
	})
	calls := fake.Act("t/save", "a.md", []any{"ok"})
	if len(calls) != 2 || calls[0].Door != "disk" || calls[0].Args != "a.md" || calls[1].Door != "git" {
		t.Fatalf("the action answers %+v", calls)
	}
}

func TestCommitsReadEveryCommitOfTheRun(t *testing.T) {
	fake := New(t, lines)
	fake.Seed(map[string]any{"files/a.md": "one\n"})
	fake.Run("t/lines")
	said := fake.Commits()
	if len(said) != 2 || said[0]["files/a.md"] != "one\n" || said[1]["t/lines"] != 1 {
		t.Fatalf("the commits read %v", said)
	}
}
