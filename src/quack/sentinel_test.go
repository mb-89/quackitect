// The sentinel the wiring builds, over the fake registry, clock and runner.
// [[spec/tickets/the-hooks-feed-the-sentinel]]
package main // level0: InPackageTest - no external test imports a main package, and the case reaches sentinelHere, sentinelOver, say and sessionLog

import (
	"bytes"
	"errors"
	"io"
	"path/filepath"
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

// The sentinel the wiring hands the hooks door reads the tree's nodes and writes a fired row into the session log. [[spec/tickets/wiring-names-listens-hooks]]
// level0: FixtureOutsideHome - the sentinel reads its node and writes its session log under a root of the case's own
func TestSentinelHereWritesTheSessionLog(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := realDisk().makeAll(filepath.Join(root, filepath.FromSlash(failure.Folder)), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := realDisk().write(filepath.Join(root, filepath.FromSlash(failure.Folder), "take-watched.md"), []byte(watchedNode), 0o644); err != nil {
		t.Fatal(err)
	}
	sentinelHere(root, io.Discard)(failure.Event{Kind: "tool.call", Text: `{"command":"./RUNME.sh branch take"}`})
	said, err := realDisk().read(filepath.Join(root, filepath.FromSlash(sessionLog)))
	if err != nil || !strings.Contains(string(said), `"take-watched"`) {
		t.Fatalf("the session log reads %q (%v), and wants the row of take-watched", said, err)
	}
}
