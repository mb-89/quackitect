// The javascript part of the check: every tracked JavaScript file stands
// under a row of the doors note's list, and every row covers a file.
// [[spec/design_output/doors#the-javascript-that-stays]]
package main

import (
	"fmt"
	"path"
	"slices"
	"strings"
)

// The note holding the list, the heading over it, and the cells a row splits into on its pipes. [[spec/design_output/doors#the-javascript-that-stays]]
const (
	javascriptNote    = "spec/design_output/doors.md"
	javascriptHeading = "# The JavaScript that stays"
	rowCells          = 3
)

// The javascript part, answering 1 where the list and the tree part. [[spec/design_output/doors#the-javascript-that-stays]]
func javascriptListed(d checkDoors) int {
	files := []string{}
	for _, rel := range strings.Split(d.git("ls-files", "-z", "--cached", "--others", "--exclude-standard"), "\x00") {
		if rel = strings.TrimSpace(rel); slices.Contains(lineLanguages[1].exts, path.Ext(rel)) {
			files = append(files, rel)
		}
	}
	rows := javascriptRows(d.text(javascriptNote))
	if len(files) == 0 && len(rows) == 0 {
		return 0
	}
	if len(rows) == 0 {
		fmt.Fprintf(d.errs, "%s holds no table under %q, so no JavaScript file names its reason.\n", javascriptNote, javascriptHeading)
		return 1
	}
	covered := map[string]bool{}
	answer := 0
	for _, rel := range files {
		at := slices.IndexFunc(rows, func(row string) bool { return rel == row || strings.HasSuffix(row, "/") && strings.HasPrefix(rel, row) })
		if at < 0 {
			fmt.Fprintf(d.errs, "%s stands under no row of %s. Add a row with its reason, or delete the file.\n", rel, javascriptNote)
			answer = 1
			continue
		}
		covered[rows[at]] = true
	}
	for _, row := range rows {
		if !covered[row] {
			fmt.Fprintf(d.errs, "%s covers no tracked JavaScript file in %s. Delete the row.\n", row, javascriptNote)
			answer = 1
		}
	}
	return answer
}

// The first cell of each row of the table under the heading, its backticks dropped. [[spec/design_output/doors#the-javascript-that-stays]]
func javascriptRows(note string) []string {
	_, after, found := strings.Cut(note, "\n"+javascriptHeading+"\n")
	if !found {
		return nil
	}
	rows := []string{}
	for _, line := range strings.Split(after, "\n") {
		if strings.HasPrefix(line, "# ") {
			break
		}
		cells := strings.Split(line, "|")
		if len(cells) < rowCells {
			continue
		}
		cell := strings.TrimSpace(cells[1])
		if strings.HasPrefix(cell, "`") {
			rows = append(rows, strings.Trim(cell, "`"))
		}
	}
	return rows
}
