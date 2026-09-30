// The write door's roads and schema refusals, against the bridge's own text.
// [[spec/tickets/cage-write-door-port]]
package write

import "testing"

func TestRefusedSchemaReadsTheBridgesText(t *testing.T) {
	status := Finding{Rule: "Schema.status", Line: 1, Column: 1, Message: "A handover names status in its frontmatter."}
	kind := Finding{Rule: "Schema.Kind", Line: 1, Column: 1, Message: ".se/HANDOVER.md names no kind, and the handover schema governs this path."}
	for _, one := range []struct {
		name   string
		judged Judged
		want   string
	}{
		{"a note the schema passes meets no refusal", Judged{Kind: "handover"}, ""},
		{"a fault names the kind and each finding", Judged{Kind: "handover", Found: []Finding{status}},
			"The handover schema refuses this write to .se/HANDOVER.md.\n\n  .se/HANDOVER.md:1:1  Schema.status\n    A handover names status in its frontmatter.\n\nRun ./RUNME.sh mint handover <path> for the shape it names, or park a draft as _name.md."},
		{"a stranger names the schema governing the path", Judged{Kind: "handover", Stranger: true, Found: []Finding{kind}},
			"spec/schemas/handover.schema.yaml governs .se/HANDOVER.md, and it refuses this write.\n\n  .se/HANDOVER.md:1:1  Schema.Kind\n    .se/HANDOVER.md names no kind, and the handover schema governs this path.\n\nCall mint_note with kind handover, this path and the fields, and it writes the note.\nA draft named _name.md stands outside every rule while a kind settles."},
	} {
		if got := RefusedSchema(Handover, one.judged); got != one.want {
			t.Errorf("%s: RefusedSchema reads %q, want %q", one.name, got, one.want)
		}
	}
}

func TestAWriteReadsItsPathUnderTheRoot(t *testing.T) {
	for _, one := range []struct {
		e       map[string]any
		where   string
		outside bool
	}{
		{map[string]any{"file_path": "/tree/.se/HANDOVER.md"}, Handover, false},
		{map[string]any{"notebook_path": "/TREE/test/one.ipynb"}, "test/one.ipynb", false},
		{map[string]any{"file_path": "/elsewhere/notes.md"}, "/elsewhere/notes.md", true},
		{map[string]any{"file_path": `C:\other\notes.md`}, "C:/other/notes.md", true},
	} {
		where := RelativeTo("/tree/", PathOf(one.e))
		if where != one.where || Outside(where) != one.outside {
			t.Errorf("%v reads as %q, outside %v, want %q, outside %v", one.e, where, Outside(where), one.where, one.outside)
		}
	}
}

func TestTheDoorReadsTheTextOfAWriteAnEditAndAMultiEditAlone(t *testing.T) {
	for _, one := range []struct {
		e    map[string]any
		want bool
	}{
		{map[string]any{"tool": WriteTool, "file_path": "a.md"}, true},
		{map[string]any{"tool": MultiTool, "file_path": "a.md", "edits": []any{}}, true},
		{map[string]any{"tool": MultiTool, "file_path": "a.md"}, false},
		{map[string]any{"tool": NotebookTool, "notebook_path": "a.md"}, false},
		{map[string]any{"tool": EditTool}, false},
	} {
		if got := Carries(one.e); got != one.want {
			t.Errorf("Carries(%v) reads %v, want %v", one.e, got, one.want)
		}
	}
}
