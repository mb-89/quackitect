// The reads the git hooks take off this package: the hand of the open take,
// the stale span, and the marker scan.
// [[spec/tickets/git-hooks-run-in-go]]
package branches

import (
	"strconv"
	"strings"
	"testing"
)

func TestHandInNamesTheOpenTake(t *testing.T) {
	t.Parallel()
	open := "---\nrecord:\n  - step: design/draft\n    hand: box b1 · claude-code\n    hash_before: abc\n---\n"
	if said := HandIn(open); said != "box b1 · claude-code" {
		t.Fatalf("HandIn answers %q, and wants the open take's hand", said)
	}
	if said := HandIn(strings.Replace(open, "hash_before: abc", "hash_before: abc\n    hash_after: def", 1)); said != "" {
		t.Fatalf("HandIn answers %q, and wants nothing where every take stands closed", said)
	}
}

func TestStaleSpanReadsTheConfigOrTheDefault(t *testing.T) {
	t.Parallel()
	if said := StaleSpan("2h"); said != 2*hour {
		t.Fatalf("StaleSpan answers %d, and wants two hours", said)
	}
	if said := StaleSpan(""); said != int64(spanOf(staleSpan)) {
		t.Fatalf("StaleSpan answers %d, and wants the default span", said)
	}
}

// [[spec/design_output/work#a-hold-beats-with-its-session]]
func TestHoldStaleReadsTheBeatBeforeTheTipsAge(t *testing.T) {
	t.Parallel()
	const now, stale, span = int64(1767268800), int64(1800), int64(600)
	row := func(ago int64, word string) string { return strconv.FormatInt(now-ago, 10) + " box a " + word }
	for _, one := range []struct {
		tipAgo int64
		beat   string
		dead   bool
	}{
		{60, row(60, "ends"), true},
		{60, row(120, "ends"), false},
		{3600, row(60, "beats"), false},
		{3600, row(1200, "beats"), true},
		{3600, row(600, "beats"), true},
		{3600, row(599, "beats"), false},
		{3600, "", true},
		{60, "", false},
	} {
		if got := HoldStale(now-one.tipAgo, one.beat, now, stale, span); got != one.dead {
			t.Errorf("HoldStale over a tip %ds old and the beat %q answers %v, and wants %v", one.tipAgo, one.beat, got, one.dead)
		}
	}
}

func TestMergeRefusalNamesEachMarker(t *testing.T) {
	t.Parallel()
	delta := "diff --git a/a.md b/a.md\n+++ b/a.md\n@@ -0,0 +7 @@\n+<<<<<<< ours\n"
	if said := MergeRefusal(nil, MarkersIn(delta)); !strings.Contains(said, "a.md:7  a conflict marker") {
		t.Fatalf("MergeRefusal answers %q, and wants the marker's file and line", said)
	}
}
