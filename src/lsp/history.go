// A closed ticket is history: it records the tree at its close, and no rule
// reads it, so a note or a name that leaves later holds nothing up.
// [[spec/design_output/lsp#a-closed-ticket-is-history]]
package main

import (
	"strings"

	"quackitect/yaml"
)

const (
	ticketsAt = "spec/tickets/"
	closed    = "closed"
)

// [[spec/design_output/lsp#a-closed-ticket-is-history]]
func isHistory(tree *Tree, path string) bool {
	where := slashed(relativeTo(tree.Root, path))
	if !strings.HasPrefix(where, ticketsAt) || !strings.HasSuffix(where, ".md") {
		return false
	}
	// The disk decides, so a buffer writing the close draws its own warning until the engine writes it. [[spec/design_output/lsp#an-engine-field-warns]]
	text, stands := tree.OnDisk(where)
	if !stands {
		return false
	}
	front := frontOf(yaml.SplitLines(text))
	return yaml.AsString(front.Said.Get("state")) == closed
}

// The findings past every closed ticket. [[spec/design_output/lsp#a-closed-ticket-is-history]]
func pastHistory(tree *Tree, found []Finding) []Finding {
	out := []Finding{}
	for _, one := range found {
		if !isHistory(tree, one.File) {
			out = append(out, one)
		}
	}
	return out
}
