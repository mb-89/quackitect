// The work tab's door: the ticket schema is the one file the tab reads, and
// every write goes to an action over the index.
// [[spec/design_output/tui#the-work-tab-takes-edits]]

package work

import (
	"io/fs"
	"os"
)

// The outside every other file of this package reads through: the tree at that root. [[spec/design_output/doors#a-door-reads-the-outside]]
func treeAt(root string) fs.FS { return os.DirFS(root) }
