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

// The bless file answers off a projection beside the holds, so the sidebar reads it over /v1. [[spec/tickets/the-sidebar-reads-v1]]
func TestBlessProjectsTheFile(t *testing.T) {
	const bless = ".se/.runtime/bless.json"
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	index.Seed(map[string]any{"files/" + bless: q.Content{Hash: "h", Text: "{\n  \"agent\": true\n}\n"}})
	if err := index.Store().Run("bless/" + bless); err != nil {
		t.Fatalf("bless/%s runs nowhere: %v", bless, err)
	}
	got, _ := index.Read("bless/" + bless).(q.Ordered)
	if len(got.Keys) != 1 || got.Keys[0] != "agent" || got.Fields[0].Literal != "true" {
		t.Fatalf("bless/%s reads %+v", bless, got)
	}
}
