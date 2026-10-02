// The window slice stands at new: the tracked config says so, and no tab
// holds a compare against the old path.
// [[spec/tickets/the-tui-data-paths-leave]]

package main

import (
	"path/filepath"
	"reflect"
	"testing"

	"quackitect/src/config"
	"quackitect/src/tui/log"
	"quackitect/src/tui/work"
)

func TestTheWindowModeReadsNew(t *testing.T) {
	said, _ := config.Value(filepath.Join("..", ".."), "migration.window")
	if said != "new" {
		t.Fatalf("migration.window reads %v in the tracked config, and wants new", said)
	}
}

func TestTheWindowHoldsNoCompare(t *testing.T) {
	for _, tab := range []any{work.Tab{}, log.Tab{}} {
		if _, holds := reflect.TypeOf(tab).FieldByName("Shadow"); holds {
			t.Fatalf("%T still holds a Shadow, the compare the old path runs", tab)
		}
	}
}
