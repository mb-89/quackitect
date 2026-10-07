// The check refuses a path a note or a comment names where the tree holds no
// such file, and passes a shape, a standing path and an open ticket.
// [[spec/tickets/every-named-path-resolves]]
package check

import "testing"

// The rule the check draws on a named path the tree lacks. [[spec/tickets/every-named-path-resolves]]
const namedRule = "EveryNamedPathStands"

// A note naming a deleted file in a code span draws the rule on that note. [[spec/tickets/every-named-path-resolves]]
func TestTheCheckRefusesANoteNamingADeletedFile(t *testing.T) {
	found := sweepOver(t, map[string]string{"spec/a.md": "# A\n\nRun `src/gone.go` first.\n"}, nil)
	if !holdsRule(found, namedRule, "spec/a.md") {
		t.Fatalf("the sweep answers %+v, and wants %s on spec/a.md", found, namedRule)
	}
}

// A comment naming a deleted file draws the rule on the code file. [[spec/tickets/every-named-path-resolves]]
func TestACommentNamingADeletedFileDrawsTheRule(t *testing.T) {
	found := sweepOver(t, map[string]string{"src/a.go": "// Reads src/gone.go beside it.\npackage a\n"}, nil)
	if !holdsRule(found, namedRule, "src/a.go") {
		t.Fatalf("the sweep answers %+v, and wants %s on src/a.go", found, namedRule)
	}
}

// A glob, a placeholder and a path the tree holds draw nothing. [[spec/tickets/every-named-path-resolves]]
func TestAGlobAPlaceholderAndAStandingPathPass(t *testing.T) {
	files := map[string]string{
		"spec/a.md": "# A\n\nRead `src/*.go`, `spec/<name>.md` and `spec/b.md`.\n",
		"spec/b.md": "# B\n",
	}
	for _, one := range sweepOver(t, files, nil) {
		if one.Rule == namedRule {
			t.Fatalf("the sweep answers %+v on a shape or a standing path", one)
		}
	}
}

// An open ticket names the file its own change writes, and draws nothing. [[spec/tickets/every-named-path-resolves]]
func TestAnOpenTicketNamingANewFilePasses(t *testing.T) {
	for _, one := range sweepOver(t, map[string]string{"spec/tickets/a.md": "# Ask\n\nWrite `src/new.go`.\n"}, nil) {
		if one.Rule == namedRule {
			t.Fatalf("the sweep answers %+v on an open ticket", one)
		}
	}
}
