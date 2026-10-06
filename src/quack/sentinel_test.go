// The sentinel the wiring builds, over the fake registry, clock and runner.
// [[spec/tickets/the-hooks-feed-the-sentinel]]
package main

import (
	"testing"
	"time"

	"quackitect/src/failure"
	"quackitect/src/modules/clock"
)

const watchedNode = `---
kind: [[failure]]
level: warn
remedies: ["Run the take again."]
watch:
  event: tool.call
  match: "branch take"
---

# When

A box takes a branch.
`

// A post a watch matches writes the fired failure's row, its id under the id field. [[spec/tickets/the-hooks-feed-the-sentinel]]
func TestSentinelOverWritesTheFiredRow(t *testing.T) {
	t.Parallel()
	rows := []map[string]any{}
	say := func(row map[string]any) error { rows = append(rows, row); return nil }
	dir := failure.FakeDir{failure.Folder + "/take-watched.md": watchedNode}
	hear := sentinelOver(dir, clock.NewFake(time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)), &failure.FakeRunner{}, say)
	hear(failure.Event{Kind: "tool.call", Text: `{"command":"./RUNME.sh branch take"}`})
	if len(rows) != 1 || rows[0][failure.IDField] != "take-watched" || rows[0]["at"] != "2026-01-02T03:04:05.000Z" {
		t.Fatalf("the sentinel writes %+v, and wants one row of take-watched stamped at the clock's time", rows)
	}
}
