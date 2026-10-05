// The find tool answers in Go: the lines the index ranks for the words, a
// function's body off the disk, and the dead index line where the read fails.
// Each case calls the action by name over a tree in a temp folder and a fake
// of the reads the door hands the manager.
// [[spec/tickets/find-and-wait-in-go]]
package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	"quackitect/src/index"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The module types the find and wait actions stand in, and the find action each case calls by name. [[spec/tickets/find-and-wait-in-go]]
const (
	searchModuleType = "search"
	waitsModuleType  = "waits"
	findAction       = "search/find"
	findWait         = 10 * time.Second
)

// Reads that answer the rows, lines and paths the case hands them, or its fault, and keep the words each find asks and each grep and glob ask. [[spec/tickets/find-and-wait-in-go]] [[spec/tickets/grep-glob-answer-off-index]]
type fakeReads struct {
	hits     []index.Hit
	fault    error
	asked    *[]string
	grep     index.GrepSaid
	glob     index.GlobSaid
	grepAsks *[]index.GrepAsk
	globAsks *[]index.GlobAsk
}

func (one fakeReads) Grep(ask index.GrepAsk) (index.GrepSaid, error) {
	if one.grepAsks != nil {
		*one.grepAsks = append(*one.grepAsks, ask)
	}
	return one.grep, one.fault
}

func (one fakeReads) Glob(ask index.GlobAsk) (index.GlobSaid, error) {
	if one.globAsks != nil {
		*one.globAsks = append(*one.globAsks, ask)
	}
	return one.glob, one.fault
}

func (one fakeReads) Find(words string, _ int) ([]index.Hit, error) {
	if one.asked != nil {
		*one.asked = append(*one.asked, words)
	}
	if one.fault != nil {
		return nil, one.fault
	}
	return one.hits, nil
}

// Calls the find by name through the manager over the root and the reads, and answers what the caller reads: the result, the error, or the refusal of the call. [[spec/tickets/find-and-wait-in-go]]
func findCall(t *testing.T, root string, reads index.Reads, input any) string {
	t.Helper()
	c := q.New()
	as := manager.Registers(c)
	if one, ok := modules[searchModuleType]; ok {
		one.registers(c)
	}
	store := q.NewStore(c)
	served, err := manager.Serving(manager.Outside{
		Root: root, Store: store, As: as, Rows: opRows{heldTable{}},
		Steps: func(func()) {}, Now: time.Now,
		Every:  func(time.Duration, func(time.Time)) func() { return func() {} },
		Accept: accepts(root, store, reads),
	})
	if err != nil {
		t.Fatal(err)
	}
	defer served.Stop()
	said, err := served.Call(findAction, input, "s1", findWait)
	if err != nil {
		return err.Error()
	}
	if said.Error != "" {
		return said.Error
	}
	return fmt.Sprint(said.Result)
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAFindAnswersTheLinesTheIndexRanks(t *testing.T) {
	t.Parallel()
	var asked []string
	reads := fakeReads{asked: &asked, hits: []index.Hit{
		{Path: "src/a.go", Line: 3, Text: "\tfunc one() {  ", Score: 2},
		{Path: "spec/b.md", Line: 1, Text: "one two", Score: 1},
	}}
	said := findCall(t, t.TempDir(), reads, map[string]any{"words": "  one two "})
	if want := "src/a.go:3: func one() {\nspec/b.md:1: one two"; said != want {
		t.Errorf("the find answers %q, and wants the ranked lines: %q", said, want)
	}
	if len(asked) != 1 || asked[0] != "one two" {
		t.Errorf("the find asks the index %q, and wants the words trimmed once: one two", asked)
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAFindByFunctionAnswersItsBody(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "src/x.go", "package x\n\nfunc Mark(a int) int {\n\tif a > 0 {\n\t\treturn a\n\t}\n\treturn 0\n}\n\nfunc after() {}\n")
	reads := fakeReads{hits: []index.Hit{
		{Path: "src/y.go", Line: 7, Text: "\tx := Mark(1)"},
		{Path: "src/x.go", Line: 3, Text: "func Mark(a int) int {"},
	}}
	said := findCall(t, root, reads, map[string]any{"function": "Mark"})
	if want := "src/x.go:3\nfunc Mark(a int) int {\n\tif a > 0 {\n\t\treturn a\n\t}\n\treturn 0\n}"; said != want {
		t.Errorf("the find answers %q, and wants the body from its definition to its close: %q", said, want)
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAFindNoRowCarriesSaysNothingCarriesThem(t *testing.T) {
	t.Parallel()
	said := findCall(t, t.TempDir(), fakeReads{hits: []index.Hit{}}, map[string]any{"words": "marzipan"})
	if want := "Nothing carries those words."; said != want {
		t.Errorf("the find answers %q, and wants %q", said, want)
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAFindOverAFailingReadSaysTheIndexIsDead(t *testing.T) {
	t.Parallel()
	reads := fakeReads{fault: errors.New("the db is locked")}
	said := findCall(t, t.TempDir(), reads, map[string]any{"words": "one"})
	if want := "The index is dead: the db is locked. Run ./RUNME.sh, which builds it, and Grep reads the disk until then."; said != want {
		t.Errorf("the find answers %q, and wants the dead index line: %q", said, want)
	}
}

// [[spec/tickets/find-and-wait-in-go]] [[spec/tickets/level0-tools-leave-the-bridge]]
func TestTheFindAndWaitModulesStandOnTheWiring(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	for _, kind := range []string{searchModuleType, waitsModuleType} {
		if _, ok := modules[kind]; !ok {
			t.Errorf("the root loads no module type %s", kind)
		}
		if !wiresType(w, kind) {
			t.Errorf("the wiring loads no %s", kind)
		}
	}
}
