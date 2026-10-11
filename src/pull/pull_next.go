// The next line: a hand-back carries one line for a stranger, the record keeps
// it on the hand's entry, and the next hand-out of the ticket shows it.
// [[spec/design_output/pull#the-next-line-rides-hand-backs]]
package pull

import (
	"strings"

	"quackitect/src/yaml"
)

// The record field and the flag a next line rides, and the words its hand-out row opens on. [[spec/design_output/pull#the-next-line-rides-hand-backs]]
const (
	nextField = "next"
	nextFlag  = "--next"
	nextSays  = "      The hand before left: "
)

// The line a hand-back carries under --next, or nothing, which the record writes no field for. [[spec/design_output/pull#the-next-line-rides-hand-backs]]
func nextIn(argv []string) string {
	for i, one := range argv {
		if one == nextFlag && i+1 < len(argv) {
			return strings.TrimSpace(argv[i+1])
		}
	}
	return ""
}

// The hand-out row of the latest next line on the record, or none. [[spec/design_output/pull#the-next-line-rides-hand-backs]]
func nextRows(text string) []string {
	last := ""
	for _, entry := range recordIn(text) {
		if said := yaml.AsString(entry.Get(nextField)); said != "" {
			last = said
		}
	}
	if last == "" {
		return nil
	}
	return []string{nextSays + last}
}
