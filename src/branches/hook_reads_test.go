// The reads the git hooks take off this package: the hand of the open take,
// the stale span, and the marker scan.
// [[spec/tickets/git-hooks-run-in-go]]
package branches

import (
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

func TestMergeRefusalNamesEachMarker(t *testing.T) {
	t.Parallel()
	delta := "diff --git a/a.md b/a.md\n+++ b/a.md\n@@ -0,0 +7 @@\n+<<<<<<< ours\n"
	if said := MergeRefusal(nil, MarkedIn(delta)); !strings.Contains(said, "a.md:7  a conflict marker") {
		t.Fatalf("MergeRefusal answers %q, and wants the marker's file and line", said)
	}
}
