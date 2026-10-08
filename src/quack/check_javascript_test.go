// The javascript part of the check against a fake tree: a file the doors
// note leaves out, a row covering nothing, and a list matching the tree.
// [[spec/tickets/remaining-js-names-its-reason]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A doors note holding the list's rows under its heading. [[spec/design_output/doors#the-javascript-that-stays]]
func doorsNoteListing(rows ...string) string {
	listed := "# Scope\n\nThe doors.\n\n# The JavaScript that stays\n\n| files | reason |\n|---|---|\n"
	for _, one := range rows {
		listed += "| `" + one + "` | a reason |\n"
	}
	return listed + "\n# One door per outside thing\n"
}

func TestTheJavaScriptPartRefusesAFileTheListLeavesOut(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name    string
		note    string
		files   []string
		code    int
		refuses string
	}{
		{
			name:    "a JavaScript file no row covers refuses",
			note:    doorsNoteListing("src/extension/"),
			files:   []string{"src/extension/one.js", "src/engine/stray.mjs", "src/one.go"},
			code:    1,
			refuses: "src/engine/stray.mjs",
		},
		{
			name:    "a row covering no tracked file refuses",
			note:    doorsNoteListing("src/extension/", "src/gone.js"),
			files:   []string{"src/extension/one.js"},
			code:    1,
			refuses: "src/gone.js",
		},
		{
			name:    "a note with no list refuses",
			note:    "# Scope\n\nThe doors.\n",
			files:   []string{"src/extension/one.js"},
			code:    1,
			refuses: "The JavaScript that stays",
		},
		{
			name:  "a list covering every file, a folder row and a file row, passes",
			note:  doorsNoteListing("src/extension/", "src/engine/tools.js"),
			files: []string{"src/extension/one.js", "src/extension/lib/two.ts", "src/engine/tools.js", "src/one.go"},
			code:  0,
		},
	}
	for _, one := range cases {
		t.Run(one.name, func(t *testing.T) {
			t.Parallel()
			files := map[string]int{}
			for _, rel := range one.files {
				files[rel] = 1
			}
			d, _, errs := linesDoors(t, files, one.files)
			at := filepath.Join(d.root, "spec", "design_output", "doors.md")
			if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(at, []byte(one.note), 0o644); err != nil {
				t.Fatal(err)
			}
			if got := javascriptListed(d); got != one.code {
				t.Fatalf("the part answers %d, and wants %d; it said\n%s", got, one.code, errs)
			}
			if one.refuses != "" && !strings.Contains(errs.String(), one.refuses) {
				t.Fatalf("the refusal names no %q:\n%s", one.refuses, errs)
			}
			if one.code == 0 && errs.Len() > 0 {
				t.Fatalf("a passing list says\n%s", errs)
			}
		})
	}
}
