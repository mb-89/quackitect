// The tree's cases wear the colours the config names, so a colour assertion
// reads a colour and no bare text.
// [[spec/tickets/the-colours-stand-in-config]]

package tree

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/tui/draw"
)

// The window reads the colours at start, and a case run stands in for that start. [[spec/tickets/the-colours-stand-in-config]]
func TestMain(m *testing.M) {
	draw.LoadColours(filepath.Join("..", "..", ".."))
	os.Exit(m.Run())
}
