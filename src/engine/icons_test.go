package main

import (
	"os"
	"path/filepath"
	"testing"
)

// A CONTROL NAMES AN ICON AND THE TABLE DRAWS IT. Nothing else carries a
// glyph, so the same mark is the same mark everywhere and one edit changes it.
func TestAControlNamesAnIconAndTheTableDrawsIt(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	os.WriteFile(filepath.Join(r.Method, "util", "parameters.json"), []byte(`{
	  "name":"quackitect","type":"group","children":[
	    {"name":"control","type":"group","shown":true,"children":[
	      {"name":"engine","type":"status","command":"c","labels":{"idle":"power","good":"power"}},
	      {"name":"log","type":"action","command":"c","label":"hand"},
	      {"name":"odd","type":"action","command":"c","label":"nobody-declared-this"}]}]}`), 0o644)

	tree, err := LoadTree(r.Method)
	if err != nil {
		t.Fatal(err)
	}
	byName := map[string]Node{}
	Walk(tree, "", func(_ string, n Node) { byName[n.Name] = n })

	if got := byName["log"].Label; got != "✋" {
		t.Fatalf("the label reads %q rather than the glyph the table gives", got)
	}
	if got := byName["engine"].Labels["idle"]; got != "⏻" {
		t.Fatalf("a state's label reads %q", got)
	}
	// A NAME NOBODY DECLARED DRAWS ITSELF. A blank leaves a button a person
	// cannot see, and the name on the face says which entry is missing.
	if got := byName["odd"].Label; got != "nobody-declared-this" {
		t.Fatalf("an undeclared name drew as %q", got)
	}
}

// The table is read, and its notes are not icons.
func TestTheIconTableSkipsItsOwnNotes(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	icons, err := Icons(r)
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := icons["$comment"]; ok {
		t.Fatal("a note was read as an icon")
	}
	if i := icons["power"]; i.Glyph != "⏻" || i.At != "U+23FB" {
		t.Fatalf("power reads as %+v", i)
	}
}
