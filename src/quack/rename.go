// The rename verb: one name moves, and every reach the tree writes moves with
// it, an import, a path, a note link and a word in prose.
// [[spec/design_output/index#a-rename-reaches-a-name]]
package main

import (
	"io"

	"quackitect/src/modules/edits"
)

// The word a rename's journal entry names its hand by, and the folder the undo reads. [[spec/tickets/landing-verbs-port-to-go]]
const (
	renameBy   = "rename"
	undoFolder = edits.Journal
)

// A rename's journal entry: the undo's entry, and the move it carries. [[spec/tickets/journal-the-rename-verb]]
type renameEntry struct {
	edits.Entry
	Moved struct {
		From string `json:"from"`
		To   string `json:"to"`
	} `json:"moved"`
}

// A line naming the old name, with its number. [[spec/design_output/index#a-rename-reaches-a-name]]
type reach struct {
	line int
	said string
}

func reachesIn(text, from string) []reach { return nil }

func renamedForms(text string, forms [][2]string) string { return "" }

func formsOf(from, to string) [][2]string { return nil }

// [[spec/tickets/landing-verbs-port-to-go]]
func renameVerb(d landingDoors) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return -1 }
}
