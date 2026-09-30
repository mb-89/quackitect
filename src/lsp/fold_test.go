// The server folds the frontmatter, so the drawing stands over it.
// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
package main

import "testing"

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
