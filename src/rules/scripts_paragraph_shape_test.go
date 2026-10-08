// The branches of the shape scripts the corpus misses, each settled on the
// real Vale. [[spec/design_output/rules#a-script-answers-offsets]]
package rules // level0: InPackageTest - the cases read the unexported scriptIn and paraRestatedTable

import "testing"

// Each branch of Shape, ShapeAnswer and RestatedTable answers the rows and the messages Vale answered. [[spec/design_output/rules#a-script-answers-offsets]]
func TestTheParagraphShapeBranchesMeetVale(t *testing.T) {
	t.Parallel()
	paraBranchesMeetVale(t, []paraBranch{
		{"a fence closing a run", "VoiceParagraph.Shape", "notes.md", "The door reads.\n\nThe door reads.\n\n```\ncode\n```\n\nThe door reads.\n\nThe door reads.\n", nil},
		{"a run in an answer", "VoiceParagraph.ShapeAnswer", "answer.md", "- The door reads.\n\nThe door reads.\n\nThe door reads.\n\nThe door reads.\n", []paraSettled{
			{3, [2]int{1, 49}, "The door reads.\n\nThe door reads.\n\nThe door reads.", "A run holds 2 paragraphs in an answer with no list, table or diagram between them, and this one holds 3. Carry the rest as structure."},
		}},
		{"a heading opening an answer", "VoiceParagraph.ShapeAnswer", "answer.md", "# The door\n\n- The door reads.\n", []paraSettled{
			{1, [2]int{1, 10}, "# The door", "A heading stands under the TL;DR list, and this one opens the answer. Write the list first."},
		}},
		{"a questions table before the list", "VoiceParagraph.ShapeAnswer", "answer.md", "| question | answer |\n|---|---|\n| a | b |\n\n- The door reads.\n", nil},
		{"a line above the table", "VoiceParagraph.RestatedTable", "notes.md", "The engine hands the next free ticket to the hand at a pull.\n\n| step | what it does |\n|---|---|\n| pull | the engine hands the next free ticket to the hand |\n", []paraSettled{
			{1, [2]int{1, 60}, "The engine hands the next free ticket to the hand at a pull.", "This line says again what a cell of the table beside it holds. Cut it, and let the table carry it."},
		}},
	})
}

// The table rule refuses a line sharing a run as long as its layer names, and passes a shorter one. [[spec/design_output/lsp#a-second-copy-draws]]
func TestRestatedTableLooksUpRunsOfTheLengthItsLayerNames(t *testing.T) {
	t.Parallel()
	schema := "layers:\n  restated:\n    table: 4\n"
	rule, err := paraRestatedTable(func(string) string { return schema })
	if err != nil {
		t.Fatal(err)
	}
	table := "\n\n| step | what it does |\n|---|---|\n| pull | red green blue gold pink |\n"
	if got := rule(scriptIn{Path: "notes.md", Text: "Say red green blue gold now." + table}); len(got) != 1 {
		t.Errorf("a line sharing four words answers %d matches, want 1", len(got))
	}
	if got := rule(scriptIn{Path: "notes.md", Text: "Say red green blue now." + table}); len(got) != 0 {
		t.Errorf("a line sharing three words answers %d matches, want 0", len(got))
	}
}
