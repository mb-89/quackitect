// The work tab's road to the index: the base file, the rows and the count,
// each read off the catalog the window hands the tab, and each change the
// watch sends.
// [[spec/tickets/the-work-tab-reads-v1]]

package work

import (
	"errors"

	"quackitect/src/tui/registry"
	"quackitect/src/tui/tree"
)

// What the tab reads through: the /v1 door, or the fake a case seeds. [[spec/tickets/the-work-tab-reads-v1]]
type Source interface {
	registry.Catalog
	registry.Watcher
}

// The tree the base file and work/rows draw. [[spec/tickets/the-work-tab-reads-v1]]
func Read(_ registry.Catalog) (*tree.Tree, error) {
	return nil, errors.New("the road stands unbuilt")
}
