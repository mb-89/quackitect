// Each config layer parses off its file, keyed by its path.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package config

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestEachLayerParsesOffItsFile(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	for _, path := range []string{Tracked, Local} {
		index.Seed(map[string]any{"files/" + path: q.Content{Hash: "h", Text: "{\n  \"a\": 1\n}\n"}})
		got, _ := index.Run("config/" + path).(q.Ordered)
		if len(got.Keys) != 1 || got.Keys[0] != "a" || got.Fields[0].Literal != "1" {
			t.Fatalf("config/%s reads %+v", path, got)
		}
	}
}
