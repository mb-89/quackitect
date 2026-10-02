// The index ask decodes a Grep's and a Glob's params into the index's ask,
// and encodes the answer back into the shape se-index prints.
// [[spec/tickets/grep-glob-answer-off-index]]
package main

import (
	"reflect"
	"testing"

	"quackitect/src/index"
)

// [[spec/tickets/grep-glob-answer-off-index]]
func TestTheIndexAskCarriesTheAskAndTheAnswer(t *testing.T) {
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
