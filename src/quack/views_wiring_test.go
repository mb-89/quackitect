// The projected modules load where the watch loads, so the sidebar reads the
// view bases and the bless word over /v1.
// [[spec/tickets/the-sidebar-reads-v1]]
package main

import (
	"testing"

	"quackitect/src/q"
)

func TestTheProjectedModulesAnswerTheBasesAndTheBless(t *testing.T) {
	t.Parallel()
	c := q.New()
	q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file"))
	for _, registers := range projected {
		registers(c)
	}
	store := q.NewStore(c)
	for _, name := range []string{"views/bases", "bless/agent"} {
		if _, ok := store.Declared(name); !ok {
			t.Errorf("the projected modules answer no %s", name)
		}
	}
}
