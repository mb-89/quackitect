// A file that reads as no Go or no JSON comes back at its line, and a sound one
// comes back clean.
// [[spec/design_output/lsp]]
package main

import "testing"

func TestABrokenGoFileNamesItsLine(t *testing.T) {
	found := goFaults("broken.go", "package main\n\nfunc one( {\n}\n")
	if len(found) == 0 {
		t.Fatal("a broken Go file reads clean")
	}
	if found[0].Rule != syntaxRule || found[0].Line != 3 {
		t.Fatalf("the finding names %s at line %d", found[0].Rule, found[0].Line)
	}
	if len(goFaults("sound.go", "package main\n\nfunc one() {}\n")) != 0 {
		t.Fatal("a sound Go file draws a finding")
	}
}

func TestABrokenJSONFileNamesItsLine(t *testing.T) {
	found := jsonFaults("broken.json", "{\n  \"one\": 1,\n  \"two\": ,\n}\n")
	if len(found) != 1 || found[0].Line != 3 {
		t.Fatalf("the finding reads %+v", found)
	}
	if len(jsonFaults("sound.json", "{\"one\": 1}\n")) != 0 {
		t.Fatal("a sound JSON file draws a finding")
	}
}
