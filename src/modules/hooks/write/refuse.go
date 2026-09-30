// The wording of the write door's schema refusals, off refusedKind and
// refusedNote in lib/schema.js.
// [[spec/tickets/cage-write-door-port]]
package write

import (
	"strconv"
	"strings"
)

// The folder the schemas stand in, the end each carries, and the tool that mints a note. [[spec/design_output/schema#a-folder-names-its-kind]]
const (
	schemas   = "spec/schemas/"
	schemaEnd = ".schema.yaml"
	mintTool  = "mint_note"
)

// The refusal the schemas answer over a written note, or nothing where they pass it. [[spec/design_output/schema#the-door-refuses-a-departure]]
func RefusedSchema(where string, judged Judged) string {
	if len(judged.Found) == 0 {
		return ""
	}
	if judged.Stranger {
		return RefusedKind(where, judged.Kind, judged.Found[0])
	}
	return RefusedNote(where, judged.Kind, judged.Found)
}

// The refusal of a note the schema governing its path reads as a stranger. [[spec/design_output/schema#a-folder-names-its-kind]]
func RefusedKind(where, kind string, found Finding) string {
	return strings.Join([]string{
		schemas + kind + schemaEnd + " governs " + where + ", and it refuses this write.",
		"",
		"  " + PlaceOf(where, found) + "  " + found.Rule,
		"    " + found.Message,
		"",
		"Call " + mintTool + " with kind " + kind + ", this path and the fields, and it writes the note.",
		"A draft named _name.md stands outside every rule while a kind settles.",
	}, "\n")
}

// The refusal of a note its schema finds faults in. [[spec/design_output/schema#the-door-refuses-a-departure]]
func RefusedNote(where, kind string, found []Finding) string {
	lines := []string{"The " + kind + " schema refuses this write to " + where + ".", ""}
	for _, one := range found {
		lines = append(lines, "  "+PlaceOf(where, one)+"  "+one.Rule+"\n    "+one.Message)
	}
	return strings.Join(append(lines, "", "Run ./RUNME.sh mint "+kind+" <path> for the shape it names, or park a draft as _name.md."), "\n")
}

// Where a finding stands in a file, as a refusal names it. [[spec/design_output/level0#the-write-door]]
func PlaceOf(where string, one Finding) string {
	return where + ":" + strconv.Itoa(one.Line) + ":" + strconv.Itoa(one.Column)
}
