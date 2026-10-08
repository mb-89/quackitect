// The find tool answers in Go: the lines the index ranks for the words, a
// function's body off the disk, and the dead index line where the read fails.
// Each case calls the action by name over a tree in a temp folder and a fake
// of the reads the door hands the manager.
// [[spec/tickets/find-and-wait-in-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"errors"
	"fmt"
	"reflect"
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

// Calls an action by name through the manager over the root and the reads, as the index does, and answers what the caller reads: the result, the error, or the refusal of the call. [[spec/tickets/find-and-wait-in-go]]
func servedCall(t *testing.T, root, kind string, reads index.Reads, name string, input any) string {
	t.Helper()
	c := q.New()
	as := manager.Registers(c)
	if one, ok := modules[kind]; ok {
		one.registers(c)
	}
	store := q.NewStore(c)
	served, err := manager.Serving(manager.Outside{
		Root: root, Store: store, As: as, Rows: opRows{heldTable{}},
		Steps: func(func()) {}, Clock: stillClock(),
		Accept: accepts(root, store, reads),
	})
	if err != nil {
		t.Fatal(err)
	}
	defer served.Stop()
	said, err := served.Call(name, input, "s1", findWait)
	if err != nil {
		return err.Error()
	}
	if said.Error != "" {
		return said.Error
	}
	return fmt.Sprint(said.Result)
}

// Calls the find over the root and the reads. [[spec/tickets/find-and-wait-in-go]]
func findCall(t *testing.T, root string, reads index.Reads, input any) string {
	t.Helper()
	return servedCall(t, root, searchModuleType, reads, findAction, input)
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

// [[spec/tickets/grep-glob-answer-off-index]]
func TestTheIndexAskCarriesTheAskAndTheAnswer(t *testing.T) {
	t.Parallel()
	var grepAsks []index.GrepAsk
	var globAsks []index.GlobAsk
	reads := fakeReads{
		grepAsks: &grepAsks, globAsks: &globAsks,
		grep: index.GrepSaid{Files: []index.FileHits{{Path: "src/a.go", Count: 1, Lines: []index.Found{{Line: 2, Text: "func One() {}", Match: true}}}}, Total: 1},
		glob: index.GlobSaid{Paths: []string{"src/a.go"}, Cut: true},
	}
	ask := indexAsk(reads)
	said, err := ask("grep", map[string]any{"pattern": "One", "glob": "*.go", "insensitive": true, "before": 2, "limit": 250})
	if err != nil {
		t.Fatal(err)
	}
	if want := []index.GrepAsk{{Pattern: "One", Glob: "*.go", Insensitive: true, Before: 2, Limit: 250}}; !reflect.DeepEqual(grepAsks, want) {
		t.Errorf("the grep asks the index %+v, and wants %+v", grepAsks, want)
	}
	files, _ := said["files"].([]any)
	if len(files) != 1 || said["total"] != float64(1) {
		t.Errorf("the grep answers %v, and wants one file and a total of 1, as se-index prints them", said)
	}
	said, err = ask("glob", map[string]any{"pattern": "**/*.go", "path": "src"})
	if err != nil {
		t.Fatal(err)
	}
	if want := []index.GlobAsk{{Pattern: "**/*.go", Path: "src"}}; !reflect.DeepEqual(globAsks, want) {
		t.Errorf("the glob asks the index %+v, and wants %+v", globAsks, want)
	}
	if paths, _ := said["paths"].([]any); len(paths) != 1 || paths[0] != "src/a.go" || said["cut"] != true {
		t.Errorf("the glob answers %v, and wants src/a.go, cut", said)
	}
	if _, err := ask("find", map[string]any{}); err == nil {
		t.Errorf("the index ask takes the method find, and wants a refusal naming grep and glob alone")
	}
}
