// The sentinel the wiring builds, over the fake registry, clock and runner.
// [[spec/tickets/the-hooks-feed-the-sentinel]]
package main

import (
	"bytes"
	"errors"
	"io"
	"strings"
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
	hear := sentinelOver(dir, clock.NewFake(time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)), &failure.FakeRunner{}, say, io.Discard)
	hear(failure.Event{Kind: "tool.call", Text: `{"command":"./RUNME.sh branch take"}`})
	if len(rows) != 1 || rows[0][failure.IDField] != "take-watched" || rows[0]["at"] != "2026-01-02T03:04:05.000Z" {
		t.Fatalf("the sentinel writes %+v, and wants one row of take-watched stamped at the clock's time", rows)
	}
}

// A write the log refuses says the lost row's id and the fault, so a lost row shows. [[spec/tickets/sentinel-say-error-lands]]
func TestSentinelOverSaysALostRow(t *testing.T) {
	t.Parallel()
	say := func(map[string]any) error { return errors.New("the log stands read-only") }
	dir := failure.FakeDir{failure.Folder + "/take-watched.md": watchedNode}
	var errs bytes.Buffer
	hear := sentinelOver(dir, clock.NewFake(time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)), &failure.FakeRunner{}, say, &errs)
	hear(failure.Event{Kind: "tool.call", Text: `{"command":"./RUNME.sh branch take"}`})
	if said := errs.String(); !strings.Contains(said, "take-watched") || !strings.Contains(said, "the log stands read-only") {
		t.Fatalf("the sentinel says %q, and wants the lost row's id and the fault", said)
	}
}
