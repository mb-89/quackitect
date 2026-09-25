package main

import "testing"

// A closed ticket draws no finding, and an open one keeps its own. [[spec/design_output/lsp#a-closed-ticket-is-history]]
func TestAClosedTicketBlocksNothing(t *testing.T) {
	dead := "# Ask\n\nFor details, see [[spec/design_output/viewer]].\n"
	tree := fixture(t, map[string]string{
		"spec/tickets/done.md": "---\nstate: closed\n---\n\n" + dead,
		"spec/tickets/open.md": "---\nstate: open\n---\n\n" + dead,
	})
	checker := &Checker{tree: tree}

	if found := checker.Over("spec/tickets/done.md"); len(found) != 0 {
		t.Fatalf("a closed ticket draws nothing, and this answers %v", rules(found))
	}
	swept := checker.Sweep()
	for _, one := range swept {
		if one.File == "spec/tickets/done.md" {
			t.Fatalf("the sweep drops a closed ticket's row, and keeps %s", one.Rule)
		}
	}
	kept := 0
	for _, one := range swept {
		if one.File == "spec/tickets/open.md" && one.Rule == EveryPointerResolves {
			kept++
		}
	}
	if kept != 1 {
		t.Fatalf("an open ticket keeps its dead pointer, and the sweep answers %v", rules(swept))
	}
}

// The disk decides, so an open ticket whose buffer writes the close still draws its rows. [[spec/design_output/lsp#a-closed-ticket-is-history]]
func TestABufferWritingTheCloseKeepsItsRows(t *testing.T) {
	dead := "# Ask\n\nFor details, see [[spec/design_output/viewer]].\n"
	tree := fixture(t, map[string]string{
		"spec/tickets/open.md": "---\nstate: open\n---\n\n" + dead,
	})
	tree.Holds("spec/tickets/open.md", "---\nstate: closed\n---\n\n"+dead)
	if isHistory(tree, "spec/tickets/open.md") {
		t.Fatal("the buffer's close reads as history before the disk holds it")
	}
}
