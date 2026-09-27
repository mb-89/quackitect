// The contract of the q interface a module sees: one suite of cases, run
// against the fake index and against the real index in process.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package qtest

import (
	"testing"

	"quackitect/src/q"
)

// What a case drives, on the fake and on the real index alike.
type Harness interface {
	Seed(values map[string]any)
	Read(name string) any
	Run(name string) any
	Land(name string, events ...any) any
	Act(name string, input any, answers ...[]any) []q.Request
	Commits() []map[string]any
}

// Opens a harness over the catalog a case registers.
type Opener func(t testing.TB, register func(*q.Catalog)) Harness

type widthOf struct {
	Width string `q:"cfg/width"`
}

func wide(c *q.Catalog) {
	q.DerivedIn(c, "t/wide", 0, func(in widthOf) int { return len(in.Width) })
}

type fileOf struct {
	File q.Content `q:"files/a.md"`
}

func sized(c *q.Catalog) {
	q.DerivedIn(c, "t/size", 0, func(in fileOf) int { return len(in.File.Text) })
}

func sums(c *q.Catalog) {
	q.FoldIn(c, "t/sum", 0, func(sum, event int) int { return sum + event })
}

func saves(c *q.Catalog) {
	q.ActionIn(c, "t/save", func(path string) []q.Request {
		return []q.Request{{Module: "disk", Verb: "write", Args: path, NoUndo: "a case", Then: func(said []any) []q.Request {
			if len(said) == 1 && said[0] == "ok" {
				return []q.Request{{Module: "git", Verb: "commit", NoUndo: "a case"}}
			}
			return nil
		}}}
	})
}

// Runs every case of the contract against the harness open builds.
func Suite(t *testing.T, open Opener) {
	t.Run("a derived provider reads a seeded config key", func(t *testing.T) {
		one := open(t, wide)
		one.Seed(map[string]any{"cfg/width": "wide"})
		if got := one.Run("t/wide"); got != 4 {
			t.Fatalf("t/wide reads %v", got)
		}
	})
	// [[spec/tickets/files-seed-one-type]]
	t.Run("a derived provider reads a seeded file", func(t *testing.T) {
		one := open(t, sized)
		one.Seed(map[string]any{"files/a.md": q.Content{Hash: "h", Text: "abc"}})
		if got := one.Run("t/size"); got != 3 {
			t.Fatalf("t/size reads %v", got)
		}
	})
	t.Run("a fold reduces the events it lands", func(t *testing.T) {
		one := open(t, sums)
		if got := one.Land("t/sum", 1, 2, 3); got != 6 {
			t.Fatalf("t/sum reads %v", got)
		}
	})
	t.Run("an action answers its requests and follows Then", func(t *testing.T) {
		one := open(t, saves)
		asked := one.Act("t/save", "a.md", []any{"ok"})
		if len(asked) != 2 || asked[0].Module != "disk" || asked[0].Args != "a.md" || asked[1].Module != "git" {
			t.Fatalf("the action answers %+v", asked)
		}
	})
	t.Run("commits read every commit of the run", func(t *testing.T) {
		one := open(t, wide)
		one.Seed(map[string]any{"cfg/width": "ab"})
		one.Run("t/wide")
		said := one.Commits()
		if len(said) != 2 || said[0]["cfg/width"] != "ab" || said[1]["t/wide"] != 2 {
			t.Fatalf("the commits read %v", said)
		}
	})
}
