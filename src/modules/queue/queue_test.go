// The plan parses off its file, and keeps its keys in order.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package queue

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestThePlanParsesOffItsFile(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	index.Seed(map[string]any{"files/" + Plan: q.Content{Hash: "h", Text: "{\n  \"working\": \"one\",\n  \"todos\": []\n}\n"}})
	got, _ := index.Run("queue/" + Plan).(q.Ordered)
	if len(got.Keys) != 2 || got.Keys[0] != "working" || got.Keys[1] != "todos" {
		t.Fatalf("queue/%s reads %+v", Plan, got)
	}
}
