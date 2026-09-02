package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE SCHEMA IS DRIVEN OVER FIXTURES, NOT OVER THE CORPUS.
//
// A test reading doc/guidance would go red whenever anybody edited a guidance
// file, which is a defect in nobody's program. The one test below that reads a
// real file reads src/schemas, which is source rather than record: a schema
// that does not load is a defect, and this is the check that says so.

// aSchema writes a schema into a method root and answers the root.
func aSchema(t *testing.T, body string) string {
	t.Helper()
	root := t.TempDir()
	dir := SchemasDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "note.schema.yaml"), []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	return root
}

// theTestSchema is the shape the cases below depart from, one at a time.
const theTestSchema = `kind: note
frontmatter:
  type: object
  additionalProperties: false
  required:
    - kind
  properties:
    kind:
      const: note
      description: which schema reads this note
body:
  headingLevel: 2
  order: strict
  extraSections: false
  sections:
    - header: One
      required: true
      maxSentences: 2
      maxWords: 10
    - header: Two
      required: true
      list: true
      maxItems: 2
      maxWordsPerItem: 4
`

// aNote builds a note that fits theTestSchema, so a case can break one thing.
func aNote(one, two string) string {
	return "---\nkind: note\n---\n\n# A note\n\n## One\n\n" + one + "\n\n## Two\n\n" + two + "\n"
}

func load(t *testing.T, root string) Schema {
	t.Helper()
	s, err := LoadSchema(root, "note")
	if err != nil {
		t.Fatalf("the fixture schema did not load, so nothing below guards anything: %v", err)
	}
	return s
}

// says answers whether any problem mentions the words given.
func says(problems []string, want string) bool {
	for _, p := range problems {
		if strings.Contains(p, want) {
			return true
		}
	}
	return false
}

func saidIn(ds []Departure, want string) bool {
	for _, d := range ds {
		if strings.Contains(d.Says, want) {
			return true
		}
	}
	return false
}

func TestANoteThatFitsItsSchemaAnswersNothing(t *testing.T) {
	t.Parallel()
	root := aSchema(t, theTestSchema)
	s := load(t, root)
	got := ValidateNote(s, aNote("A short one.", "- one two\n- three four"), root)
	if len(got) != 0 {
		t.Fatalf("a conforming note was refused: %v", got)
	}
}

// AND THE CHECK CAN FAIL, one departure at a time, each named.
func TestEachDepartureFromTheSchemaIsNamed(t *testing.T) {
	t.Parallel()
	root := aSchema(t, theTestSchema)
	s := load(t, root)
	for _, one := range []struct{ what, note, want string }{
		{"a missing chapter",
			"---\nkind: note\n---\n\n# A note\n\n## One\n\nShort.\n", "no Two chapter"},
		{"chapters out of order",
			"---\nkind: note\n---\n\n# A note\n\n## Two\n\n- a b\n\n## One\n\nShort.\n", "the chapters run"},
		{"an undeclared chapter",
			aNote("Short.", "- a b") + "\n## Three\n\nmore\n", "does not declare"},
		{"too many items", aNote("Short.", "- a\n- b\n- c"), "holds 3 items"},
		{"an item too long", aNote("Short.", "- one two three four five"), "runs to 5 words"},
		{"too many words", aNote("One two three four five six seven eight nine ten eleven.", "- a"), "runs to 11 words"},
		{"too many sentences", aNote("One. Two. Three.", "- a"), "runs to 3 sentences"},
		{"no frontmatter", "# A note\n\n## One\n\nShort.\n\n## Two\n\n- a b\n", "no frontmatter"},
		{"an undeclared field",
			"---\nkind: note\nowner: nobody\n---\n\n# A note\n\n## One\n\nShort.\n\n## Two\n\n- a b\n",
			"which the schema does not declare"},
		{"a wrong const",
			"---\nkind: other\n---\n\n# A note\n\n## One\n\nShort.\n\n## Two\n\n- a b\n",
			"the schema allows only"},
		{"a chapter that is not a list", aNote("Short.", "a paragraph, not a list"), "is not a list"},
	} {
		got := ValidateNote(s, one.note, root)
		if !saidIn(got, one.want) {
			t.Errorf("%s was not named. wanted something saying %q, got %v", one.what, one.want, got)
		}
		for _, d := range got {
			if d.Line < 1 {
				t.Errorf("%s was named at line %d, and an editor cannot mark that: %s",
					one.what, d.Line, d.Says)
			}
		}
	}
}

// A departure is reported on the line it is on, because an editor marks a row.
func TestADepartureIsReportedOnItsOwnLine(t *testing.T) {
	t.Parallel()
	root := aSchema(t, theTestSchema)
	s := load(t, root)
	// Lines: 1 ---, 2 kind, 3 ---, 4 blank, 5 # A note, 6 blank, 7 ## One,
	// 8 blank, 9 prose, 10 blank, 11 ## Two, 12 blank, 13 the long item.
	note := "---\nkind: note\n---\n\n# A note\n\n## One\n\nShort.\n\n## Two\n\n- one two three four five\n"
	got := ValidateNote(s, note, root)
	if len(got) != 1 {
		t.Fatalf("wanted the one long item, got %v", got)
	}
	if got[0].Line != 13 {
		t.Errorf("the long item is on line 13 and it was reported on %d: %s", got[0].Line, got[0].Says)
	}

	// AND A FRONTMATTER DEPARTURE LANDS ON ITS KEY, not on the fence.
	bad := "---\nkind: note\nowner: nobody\n---\n\n# A note\n\n## One\n\nShort.\n\n## Two\n\n- a b\n"
	for _, d := range ValidateNote(s, bad, root) {
		if strings.Contains(d.Says, "owner") && d.Line != 3 {
			t.Errorf("owner is on line 3 and was reported on %d", d.Line)
		}
	}
}

// A VALUE WRITTEN AS A LINK IS THE NAME INSIDE IT.
//
// The brackets are how a value is shown and walked. A schema saying const
// guidance matches kind: [[guidance]], because the two are one value.
func TestALinkedValueIsTheNameInsideIt(t *testing.T) {
	t.Parallel()
	root := aSchema(t, theTestSchema)
	s := load(t, root)
	linked := "---\nkind: [[note]]\n---\n\n# A note\n\n## One\n\nShort.\n\n## Two\n\n- a b\n"
	if got := ValidateNote(s, linked, root); len(got) != 0 {
		t.Fatalf("a linked kind was refused: %v", got)
	}
	// AND THE WRONG NAME IS STILL WRONG, brackets or not.
	wrong := "---\nkind: [[other]]\n---\n\n# A note\n\n## One\n\nShort.\n\n## Two\n\n- a b\n"
	if !saidIn(ValidateNote(s, wrong, root), "the schema allows only") {
		t.Error("a linked kind naming another schema was accepted")
	}
	if unlink("[[a name]]") != "a name" || unlink("plain") != "plain" || unlink("[[open") != "[[open" {
		t.Error("unlink does not read the three shapes it meets")
	}
}

// A CHAPTER IS FOUND AT THE LEVEL THE SCHEMA NAMES, not at a level baked in.
func TestChaptersAreFoundAtTheDeclaredLevel(t *testing.T) {
	t.Parallel()
	oneDeep := strings.Replace(theTestSchema, "headingLevel: 2", "headingLevel: 1", 1)
	root := aSchema(t, oneDeep)
	s := load(t, root)
	note := "---\nkind: note\n---\n\n# One\n\nShort.\n\n## a sub heading\n\nmore\n\n# Two\n\n- a b\n"
	if got := ValidateNote(s, note, root); len(got) != 0 {
		t.Fatalf("chapters at level one were not read: %v", got)
	}
	// The sub heading belongs to its chapter rather than being a chapter.
	if got := chaptersOf("# One\n\ntext\n\n## sub\n\nmore\n", 1); len(got) != 1 {
		t.Fatalf("a deeper heading was cut as a chapter: %d chapters", len(got))
	}
}

// A LONG SENTENCE IS NAMED EVEN WHEN THE COUNT OF THEM IS FINE.
func TestASentenceOverTheWordLimitIsNamed(t *testing.T) {
	t.Parallel()
	capped := strings.Replace(theTestSchema, "maxWords: 10", "maxWordsPerSentence: 5", 1)
	root := aSchema(t, capped)
	s := load(t, root)
	note := aNote("One two three four five six seven.", "- a b")
	if !saidIn(ValidateNote(s, note, root), "a sentence in One runs to 7 words") {
		t.Errorf("the long sentence was not named: %v", ValidateNote(s, note, root))
	}
}

// THE TEMPLATE IS THE SAME EVERY TIME IT IS GENERATED.
//
// Narrow built the required list by walking a map, and Go randomises that, so
// the fields came out in a different order on every run. Nothing was wrong
// with any one template. Every mint would have looked like an edit.
func TestTheTemplateDoesNotReshuffleItself(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	first, err := TemplateFor(root, "work-token", "note")
	if err != nil {
		t.Fatalf("the template did not generate: %v", err)
	}
	for i := 0; i < 20; i++ {
		again, err := TemplateFor(root, "work-token", "note")
		if err != nil {
			t.Fatal(err)
		}
		if again != first {
			t.Fatalf("run %d differs from the first:\n%s\n---\n%s", i+2, first, again)
		}
	}
	// AND IT LEADS WITH WHAT THE SCHEMA DECLARED FIRST, rather than with
	// whichever field the map happened to hand over.
	if !strings.HasPrefix(first, "---\n# which schema reads this note\nkind: [[work-token]]\n") {
		t.Errorf("the template does not open with kind:\n%s", firstWords(first, 12))
	}
}

// THE TITLE RULE IS WRITTEN ONCE, AND THIS HOLDS THE TWO COPIES TOGETHER.
//
// The schema owns the rule, because the editor reads schemas and not Go. The
// engine still refuses a bad title at the mint and at the save, on paths that
// carry no method root to load a schema from. So the number lives in both, and
// this refuses when they drift. Same shape as the said rule in src/mcp.
func TestTheTitleRuleSaysWhatTheSchemaSays(t *testing.T) {
	t.Parallel()
	s, err := LoadSchema(filepath.Join("..", ".."), "work-token")
	if err != nil {
		t.Fatalf("the work-token schema did not load: %v", err)
	}
	title, declared := s.Frontmatter.Properties["title"]
	if !declared {
		t.Fatal("the schema declares no title, so this guards nothing")
	}
	if title.MaxWords != TitleWords {
		t.Errorf("the schema allows %d words in a title and the engine allows %d",
			title.MaxWords, TitleWords)
	}
	if !title.WholeWords {
		t.Error("the schema does not refuse joined words, and the engine does")
	}
}

// A SCHEMA THAT WILL NOT LOAD STOPS THE OPERATION AND SAYS WHY, rather than
// answering that every note is clean.
func TestASchemaThatWillNotLoadRefuses(t *testing.T) {
	t.Parallel()
	for _, one := range []struct{ what, body, want string }{
		{"a kind that disagrees with the file name", "kind: other\nbody:\n  sections:\n    - header: One\n", "is named for"},
		{"a schema declaring no sections", "kind: note\nbody:\n  order: strict\n", "declares no sections"},
	} {
		if _, err := LoadSchema(aSchema(t, one.body), "note"); err == nil {
			t.Errorf("%s was accepted", one.what)
		} else if !strings.Contains(err.Error(), one.want) {
			t.Errorf("%s said %q, wanted something saying %q", one.what, err, one.want)
		}
	}
	// AND A KIND WITH NO SCHEMA AT ALL IS AN ERROR, not an empty shape that
	// every note fits.
	if _, err := LoadSchema(t.TempDir(), "nothing"); err == nil {
		t.Error("a kind with no schema file was accepted")
	}
}

// A NOTE NAMING NO KIND IS A FINDING, NOT A SKIP. Picking the schema by kind
// only works if a note that names none is heard about.
func TestLintNotesNamesANoteWithNoKind(t *testing.T) {
	t.Parallel()
	root := aSchema(t, theTestSchema)
	dir := filepath.Join(root, "notes")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(name, body string) {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("good.md", aNote("Short.", "- a b"))
	write("kindless.md", "# No kind here\n\n## One\n\nShort.\n")
	write("unknown.md", "---\nkind: nosuch\n---\n\n# Unknown kind\n")

	found := LintNotes(Roots{Method: root, Work: root}, dir)
	if !says(whatEachSaid(found), "names no kind") {
		t.Errorf("the note with no kind was not named: %v", found)
	}
	if !says(whatEachSaid(found), "no schema for kind") {
		t.Errorf("the note naming an unknown kind was not named: %v", found)
	}
	for _, f := range found {
		if f.ID == "good.md" {
			t.Errorf("the conforming note was named: %v", f)
		}
	}
}

func whatEachSaid(found []Finding) []string {
	var out []string
	for _, f := range found {
		out = append(out, f.Says)
	}
	return out
}

// THE SHIPPED SCHEMA LOADS, AND IT CONSTRAINS WHAT IT CLAIMS TO.
//
// This reads src/schemas because a schema that does not parse is a defect in
// this repository, and a check that cannot read what it guards says nothing.
func TestTheGuidanceSchemaLoadsAndConstrains(t *testing.T) {
	t.Parallel()
	s, err := LoadSchema(filepath.Join("..", ".."), "guidance")
	if err != nil {
		t.Fatalf("the shipped guidance schema did not load: %v", err)
	}
	want := map[string]bool{"Motivation": false, "Actionables": false, "Discussion": false}
	for _, sec := range s.Body.Sections {
		if _, named := want[sec.Header]; !named {
			t.Errorf("the schema declares an unexpected chapter %q", sec.Header)
		}
		want[sec.Header] = true
	}
	for header, seen := range want {
		if !seen {
			t.Errorf("the schema does not declare a %s chapter", header)
		}
	}
	if !s.Body.StrictOrder {
		t.Error("the chapters are not ordered, so a file may carry them in any order")
	}
}
