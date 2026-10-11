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

// A buffer writing a field the verbs own draws the hint in the sweep the editor reads, and the file alone draws nothing. [[spec/design_output/lsp#an-engine-field-warns]]
func TestABufferWritingAnEngineFieldDrawsItsHint(t *testing.T) {
	schema := "kind: thing\nfrontmatter:\n  type: object\n  properties:\n    kind:\n      const: thing\n    state:\n      x-engine: true\nbody:\n  sections:\n    - header: A\n"
	note := func(state string) string { return "---\nkind: thing\nstate: " + state + "\n---\n\n# A\n" }
	files := map[string]string{"spec/schemas/thing.schema.yaml": schema, "spec/t.md": note("open")}
	if found := sweepHeld(t, files, map[string]string{"spec/t.md": note("draft")}); !holdsRule(found, EngineOwnsField, "spec/t.md") {
		t.Fatalf("the sweep answers %+v, and wants the hint on the state the buffer writes", found)
	}
	if found := sweepHeld(t, files, nil); holdsRule(found, EngineOwnsField, "spec/t.md") {
		t.Fatalf("the sweep answers %+v, and wants nothing on a file no editor holds", found)
	}
}
