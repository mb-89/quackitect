// A check reads the buffer an editor holds open where one stands, and the
// file otherwise, as the topics table in the model says.
// [[spec/tickets/buffers-feed-the-checks]]
package check

import "testing"

// What the sweep answers over the files and the buffers a case seeds. [[spec/tickets/buffers-feed-the-checks]]
func sweepHeld(t *testing.T, files, buffers map[string]string) []Finding {
	t.Helper()
	return sweepSeeded(t, files, pathsOf(files), buffers, nil)
}

const (
	cleanNote = "# A\n\nNothing points anywhere.\n"
	deadNote  = "# A\n\nSee [[spec/nowhere]].\n"
)

func TestABufferStandsOverItsFile(t *testing.T) {
	found := sweepHeld(t, map[string]string{"spec/a.md": cleanNote}, map[string]string{"spec/a.md": deadNote})
	if !holdsRule(found, "EveryPointerResolves", "spec/a.md") {
		t.Fatalf("the sweep answers %+v, and wants the dead pointer the buffer writes", found)
	}
}

func TestAPathWithNoBufferReadsItsFile(t *testing.T) {
	found := sweepHeld(t, map[string]string{"spec/a.md": deadNote, "spec/b.md": cleanNote}, map[string]string{"spec/b.md": cleanNote})
	if !holdsRule(found, "EveryPointerResolves", "spec/a.md") {
		t.Fatalf("the sweep answers %+v, and wants the dead pointer spec/a.md holds on disk", found)
	}
}

func TestABufferOverNoFileAddsNoPath(t *testing.T) {
	found := sweepHeld(t, map[string]string{"spec/a.md": cleanNote}, map[string]string{"spec/ghost.md": deadNote})
	if holdsRule(found, "EveryPointerResolves", "spec/ghost.md") {
		t.Fatalf("the sweep answers %+v, and wants no path the files lack", found)
	}
}

func TestAClosedBufferLeavesItsFileRead(t *testing.T) {
	found := sweepHeld(t, map[string]string{"spec/a.md": deadNote}, map[string]string{"spec/a.md": ""})
	if !holdsRule(found, "EveryPointerResolves", "spec/a.md") {
		t.Fatalf("the sweep answers %+v, and wants the dead pointer the file holds on disk", found)
	}
}
