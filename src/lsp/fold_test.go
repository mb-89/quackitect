// The server folds the frontmatter, so the drawing stands over it.
// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
package main

import (
	"reflect"
	"testing"
)

func TestTheFrontmatterFoldsFromFenceToFence(t *testing.T) {
	got := foldsOf("---\nkind: [[ticket]]\nprocess:\n---\n\n# Ask\n")
	want := []foldingRange{{StartLine: 0, EndLine: 3, Kind: "region"}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("the fold reads %v", got)
	}
}

func TestANoteWithNoFrontmatterFoldsNothing(t *testing.T) {
	for _, text := range []string{"# Ask\n", "---\nkind: open\n"} {
		if got := foldsOf(text); len(got) != 0 {
			t.Fatalf("%q folds %v", text, got)
		}
	}
}

func TestTheServerAnnouncesTheFold(t *testing.T) {
	said := capabilitiesOf()
	if said["foldingRangeProvider"] != true {
		t.Fatalf("the capabilities read %v", said)
	}
}

func TestTheFrontRecordsItsClosingFence(t *testing.T) {
	front := frontOf([]string{"---", "kind: [[ticket]]", "state: open", "---", "", "# Ask"})
	if !front.Stands || front.Close != 3 {
		t.Fatalf("the front reads %v at %d", front.Stands, front.Close)
	}
}
