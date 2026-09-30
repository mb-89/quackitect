// A hold parses off its file, and a file past the glob runs nothing.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package holds

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

const held = ".se/.runtime/hold/box.json"

func TestAHoldParsesOffItsFile(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	index.Seed(map[string]any{"files/" + held: q.Content{Hash: "h", Text: "{\n  \"branch\": \"work/one\"\n}\n"}})
	got, _ := index.Run("hold/" + held).(q.Ordered)
	if len(got.Keys) != 1 || got.Keys[0] != "branch" || got.Fields[0].Literal != `"work/one"` {
		t.Fatalf("hold/%s reads %+v", held, got)
	}
}

// The bless file's word answers at bless/agent, so the sidebar reads it over /v1. [[spec/tickets/the-sidebar-reads-v1]]
func TestBlessProjectsTheFile(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	if err := index.Store().Run("bless/agent"); err != nil {
		t.Fatalf("bless/agent runs nowhere: %v", err)
	}
	if index.Read("bless/agent") != false {
		t.Fatalf("bless/agent reads %v with no bless file, and wants false", index.Read("bless/agent"))
	}
	index.Seed(map[string]any{"files/.se/.runtime/bless.json": q.Content{Hash: "h", Text: "{\"agent\":true}\n"}})
	if got := index.Run("bless/agent"); got != true {
		t.Fatalf("bless/agent reads %v, and wants true", got)
	}
}
