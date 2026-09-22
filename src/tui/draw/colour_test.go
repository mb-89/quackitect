// The colours stand in the config, and the window reads them there.
// [[spec/tickets/the-colours-stand-in-config]]
package draw

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func treeRoot() string { return filepath.Join("..", "..", "..") }

// The window reads the colours at start, and a case run stands in for that start. [[spec/tickets/the-colours-stand-in-config]]
func TestMain(m *testing.M) {
	LoadColoursForCases(treeRoot())
	os.Exit(m.Run())
}

func TestTheShippedFileHoldsAColourForEveryKindTheWindowDraws(t *testing.T) {
	read, err := os.ReadFile(filepath.Join(treeRoot(), filepath.FromSlash(coloursAt)))
	if err != nil {
		t.Fatalf("the colours file reads: %v", err)
	}
	// The file opens on a comment the way every config file in the tree does. [[spec/tickets/the-colours-stand-in-config]]
	var said struct {
		Kinds  map[string]string `json:"kinds"`
		Tools  map[string]string `json:"tools"`
		Window map[string]string `json:"window"`
	}
	if err := json.Unmarshal(read, &said); err != nil {
		t.Fatalf("the colours file parses: %v", err)
	}
	for _, kind := range []string{"level0", "config", "note", "answer", "prompt", "reply"} {
		if said.Kinds[kind] == "" {
			t.Fatalf("the kinds map holds no colour for %q", kind)
		}
	}
	for _, tool := range []string{"Read", "Edit", "Bash"} {
		if said.Tools[tool] == "" {
			t.Fatalf("the tools map holds no colour for %q", tool)
		}
	}
	for _, name := range []string{"dim", "bar", "rule", "head", "selected", "tab"} {
		if said.Window[name] == "" {
			t.Fatalf("the window map holds no colour for %q", name)
		}
	}
}

// The first line of done_when, as a case: a colour number stands in no file the window builds from. [[spec/tickets/the-colours-stand-in-config]]
func TestNoColourNumberStandsInTheWindowsOwnCode(t *testing.T) {
	names, err := filepath.Glob(filepath.Join(".", "*.go"))
	if err != nil {
		t.Fatal(err)
	}
	for _, name := range names {
		if strings.HasSuffix(name, "_test.go") {
			continue
		}
		read, err := os.ReadFile(name)
		if err != nil {
			t.Fatal(err)
		}
		if strings.Contains(string(read), `lipgloss.Color("`) {
			t.Fatalf("%s holds a colour number, and the config holds them now", name)
		}
	}
}

// The numbers stand in the config, and no two kinds share one. [[spec/tickets/the-colours-stand-in-config]]
func TestEveryKnownDoorAndToolWearsItsOwnColour(t *testing.T) {
	t.Parallel()
	seen := map[string]string{}
	for _, table := range []map[string]string{palette.kinds, palette.tools} {
		for name, colour := range table {
			if other, found := seen[colour]; found {
				t.Fatalf("%s and %s both wear %s", name, other, colour)
			}
			seen[colour] = name
		}
	}
	if KindStyle("Grep").GetForeground() == KindStyle("Read").GetForeground() {
		t.Fatal("Grep and Read wear different colours")
	}
}
