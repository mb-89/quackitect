// The private delta's checks over a delta, off the bridge's lib/private.js.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"reflect"
	"strings"
	"testing"
)

// A delta adding one line to a file. [[spec/tickets/cage-commit-guards-port]]
func deltaOf(file string, lines ...string) string {
	head := "diff --git a/" + file + " b/" + file + "\nindex 1111111..2222222 100644\n--- a/" + file + "\n+++ b/" + file + "\n@@ -0,0 +3,2 @@\n"
	return head + "+" + strings.Join(lines, "\n+")
}

func rulesOfLeaks(found []Leak) []string {
	var out []string
	for _, one := range found {
		out = append(out, one.Rule+" "+one.Said)
	}
	return out
}

func TestAddedInReadsEachAddedLineWithItsPlace(t *testing.T) {
	got := AddedIn(deltaOf("spec/a.md", "one", "two") + "\ndiff --git a/b.png b/b.png\nBinary files differ\n+++ b/b.png\n+x")
	want := []Added{{File: "spec/a.md", Line: 3, Text: "one"}, {File: "spec/a.md", Line: 4, Text: "two"}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("AddedIn reads %+v, want %+v", got, want)
	}
}

func TestPrivateInReadsTheBridgesThreeChecks(t *testing.T) {
	note := Note{Name: ".se/notes/raw.md", Text: "the owner wants the bridge to leave before the summer ends, see vault.inner/keys/door-7"}
	for _, one := range []struct {
		name string
		file string
		line string
		box  Box
		want []string
	}{
		{"an address", "spec/a.md", "Write to quill.owner" + "@mail.org now.", Box{}, []string{ShapeHome + " quill.owner" + "@mail.org"}},
		{"an address nowhere", "spec/a.md", "Write to someone@example.com now.", Box{}, nil},
		{"a date in prose", "spec/a.md", "It lands on 2026-03-14.", Box{}, []string{ShapeHome + " 2026-03-14"}},
		{"a date in code", "src/a.js", "const at = \"2026-03-14\";", Box{}, nil},
		{"a home path under nobody", "spec/a.md", "It stands at /home/user/bin.", Box{}, nil},
		{"the box's user", "spec/a.md", "Ask quill about it.", Box{User: "quill"}, []string{BoxHome + " quill"}},
		{"a user naming nobody", "spec/a.md", "Ask root about it.", Box{User: "root"}, nil},
		{"a run out of a note", "spec/a.md", "We hold that the owner wants the bridge to leave soon.", Box{}, []string{NoteHome + " the owner wants the bridge to leave"}},
		{"a token out of a note", "spec/a.md", "Read vault.inner/keys/door-7 first.", Box{}, []string{NoteHome + " vault.inner/keys/door-7"}},
		{"a line under .se", ".se/a.md", "Write to quill.owner" + "@mail.org now.", Box{}, nil},
	} {
		t.Run(one.name, func(t *testing.T) {
			got := rulesOfLeaks(PrivateIn(AddedIn(deltaOf(one.file, one.line)), one.box, []Note{note}))
			if !reflect.DeepEqual(got, one.want) {
				t.Fatalf("PrivateIn reads %q, want %q", got, one.want)
			}
		})
	}
}

func TestRefusedDeltaNamesEachFindingWhereItStands(t *testing.T) {
	said := RefusedDelta([]Leak{{File: "spec/a.md", Line: 3, Column: 1, Rule: ShapeHome, Said: "2026-03-14", Message: "Drop it."}})
	for _, want := range []string{"This commit carries something private", "  spec/a.md:3:1  ShapeStaysHome", "    adds: 2026-03-14", "    Drop it."} {
		if !strings.Contains(said, want) {
			t.Errorf("the refusal reads\n%s\nand wants %q", said, want)
		}
	}
}

// [[spec/tickets/edit-door-rules-port]]
func TestCarriedFromNamesATokenBeforeARun(t *testing.T) {
	notes := []Note{{Name: "a.md", Text: "the key is sk_live_abcdefghijkl and one two three four five six seven"}}
	if said, ok := CarriedFrom("we hold sk_live_abcdefghijkl here", notes); !ok || !said.Token || said.Note != "a.md" {
		t.Errorf("a token reads as %+v, %v", said, ok)
	}
	if said, ok := CarriedFrom("so one two three four five six seven", notes); !ok || said.Token || said.Said != "one two three four five six seven" {
		t.Errorf("a run reads as %+v, %v", said, ok)
	}
	if _, ok := CarriedFrom("one two three", notes); ok {
		t.Errorf("a short run reads as carried")
	}
	if got := RefusedPrivate("docs/a.md", Carried{Said: "one two three four five six"}); !strings.HasPrefix(got, "docs/a.md carries 6 words straight from a note under .se/notes") {
		t.Errorf("the refusal reads %q", got)
	}
}
