// The note reader: the front, the chapters, and the section a step opens on.
// [[spec/tickets/the-lens-reads-v1]]
package note

import "testing"

const sample = "---\nkind: ticket\nstep: design/draft\n---\n\n# design\n\n## draft\n\n```\n# fenced\n```\n\n### approach\n\ntext\n\n# draft\n"

// A heading inside a fence names no chapter, and every other heading keeps its level and line. [[spec/tickets/the-lens-reads-v1]]
func TestAFenceParksItsHeadings(t *testing.T) {
	read := Read(sample)
	if !read.Front.Stands || read.Front.Said.Get("step") != "design/draft" {
		t.Fatalf("the front reads %+v", read.Front)
	}
	want := []Section{{Header: "design", Level: 1, Line: 6}, {Header: "draft", Level: 2, Line: 8}, {Header: "approach", Level: 3, Line: 14}, {Header: "draft", Level: 1, Line: 18}}
	if len(read.Sections) != len(want) {
		t.Fatalf("the note reads %d chapters, and wants %d", len(read.Sections), len(want))
	}
	for at, one := range want {
		got := read.Sections[at]
		if got.Header != one.Header || got.Level != one.Level || got.Line != one.Line {
			t.Fatalf("chapter %d reads %+v, and wants %+v", at, got, one)
		}
	}
}

// A step's section stands one level a step deep under its parent's, and a missing step answers -1. [[spec/tickets/the-lens-reads-v1]]
func TestSectionAtWalksOneLevelAStep(t *testing.T) {
	sections := Read(sample).Sections
	if at := SectionAt(sections, "design/draft"); at != 1 {
		t.Fatalf("design/draft opens at %d, and wants 1", at)
	}
	if at := SectionAt(sections, "draft"); at != 3 {
		t.Fatalf("draft opens at %d, and wants the top chapter at 3", at)
	}
	if at := SectionAt(sections, "design/review"); at != -1 {
		t.Fatalf("design/review opens at %d, and wants -1", at)
	}
}
