package main

import (
	"strings"
	"testing"
)

// A pointer naming a chapter nobody wrote reads as a live link and teaches nothing, so the rule refuses it. [[spec/design_output/lsp#every-pointer-resolves]]
func TestEveryPointerResolvesRefusesAChapterNobodyWrote(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/design_output/one.md": "# The stop hook holds a turn\n\nA line stands here.\n",
		"spec/guidance/two.md":      "# A rule\n\nFor details, see [[spec/design_output/one#the-turn-holds-the-hook]].\n",
	})

	found := onlyOne(t, everyPointerResolves(tree), EveryPointerResolves)
	if found.File != "spec/guidance/two.md" || found.Line != 3 || found.Severity != SeverityError {
		t.Fatalf("the finding names the file and the line as an error, and it answers %+v", found)
	}
	if !strings.Contains(found.Message, "the-turn-holds-the-hook") {
		t.Fatalf("the message names the chapter, and it says %q", found.Message)
	}
}

// A pointer naming a note nobody wrote draws the same way. [[spec/design_output/lsp#every-pointer-resolves]]
func TestEveryPointerResolvesRefusesANoteNobodyWrote(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/guidance/two.md": "# A rule\n\nFor details, see [[spec/design_output/viewer]].\n",
	})

	found := onlyOne(t, everyPointerResolves(tree), EveryPointerResolves)
	if !strings.Contains(found.Message, "spec/design_output/viewer") {
		t.Fatalf("the message names the note, and it says %q", found.Message)
	}
}

// A comment in a code file carries a pointer the way a note does, and the rule reads it there. [[spec/design_output/lsp#every-pointer-resolves]]
func TestEveryPointerResolvesReadsACommentInCode(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/design_output/one.md": "# The stop hook holds a turn\n",
		"src/one.go":                "package main\n\n// [[spec/design_output/one#nobody-wrote-this]]\nfunc one() {}\n",
		"src/two.js":                "// [[spec/design_output/one#the-stop-hook-holds-a-turn]]\nexport const x = 1;\n",
	})

	found := onlyOne(t, everyPointerResolves(tree), EveryPointerResolves)
	if found.File != "src/one.go" || found.Line != 3 {
		t.Fatalf("the finding names the comment line, and it answers %+v", found)
	}
}

// A pointer resolves the four ways the index resolves one, plus a process file and a chapter. [[spec/design_output/lsp#every-pointer-resolves]]
func TestEveryPointerResolvesStandsQuietOverSoundPointers(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/design_output/one.md":    "# The stop hook holds a turn\n\n## A `quoted` heading\n",
		"spec/processes/standard.yaml": "for: a change\n",
		"spec/tickets/a-ticket.md": "---\nkind: [[ticket]]\nprocess: [[spec/processes/standard]]\nreads: [[spec/design_output/one]]\n---\n\n" +
			"# Ask\n\n" +
			"[[spec/design_output/one.md]] and [[spec/design_output/one#the-stop-hook-holds-a-turn]] and\n" +
			"[[spec/design_output/one#a-quoted-heading]] and [[a-ticket]] and [[spec/processes]].\n",
	})

	if found := everyPointerResolves(tree); len(found) != 0 {
		t.Fatalf("every pointer resolves, and the rule answers %v", rules(found))
	}
}

// A code span, a fenced block, an indented block and a placeholder quote the shape, so the rule reads no pointer there. [[spec/design_output/lsp#every-pointer-resolves]]
func TestEveryPointerResolvesSkipsAQuotedShape(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/guidance/two.md": "---\nkind: [[guidance]]\nsays: \"a `[[spec/nowhere#in-the-front]]` quoted\"\n---\n\n# A rule\n\n" +
			"Write `[[spec/nowhere]]` in a span, or [[<name>]] as a placeholder.\n\n" +
			"```\n[[spec/nowhere#in-a-fence]]\n```\n\n" +
			"    kind: [[nowhere-indented]]\n",
		"src/one.js": "const at = \"[[spec/nowhere#in-a-string]]\";\n",
	})

	if found := everyPointerResolves(tree); len(found) != 0 {
		t.Fatalf("a quoted shape draws nothing, and the rule answers %v", rules(found))
	}
}
