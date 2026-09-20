// The colours stand in the config, and the window reads them there.
// [[spec/tickets/the-colours-stand-in-config]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The file the ruling under the ticket's Discussion names. [[spec/tickets/the-colours-stand-in-config]]
const coloursAt = "spec/config/styles/colours.json"

func treeRoot() string { return filepath.Join("..", "..") }

func TestTheShippedFileHoldsAColourForEveryKindTheWindowDraws(t *testing.T) {
	read, err := os.ReadFile(filepath.Join(treeRoot(), filepath.FromSlash(coloursAt)))
	if err != nil {
		t.Fatalf("the colours file reads: %v", err)
	}
	var said map[string]map[string]string
	if err := json.Unmarshal(read, &said); err != nil {
		t.Fatalf("the colours file parses: %v", err)
	}
	for _, kind := range []string{"level0", "config", "note", "answer", "prompt", "reply"} {
		if said["kinds"][kind] == "" {
			t.Fatalf("the kinds map holds no colour for %q", kind)
		}
	}
	for _, tool := range []string{"Read", "Edit", "Bash"} {
		if said["tools"][tool] == "" {
			t.Fatalf("the tools map holds no colour for %q", tool)
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
