package main

import (
	"strings"
	"testing"

	"quackitect/yaml"
)

const rationaleHere = `kind: rationale
governs:
  - spec/rationales/*.md
frontmatter:
  type: object
  properties:
    kind:
      const: rationale
      x-link: true
      description: the schema this note is minted from
    explains:
      x-link: true
      description: the note these chapters argue for
body:
  headingLevel: 1
  sections:
    - header: Why
      required: true
      description: the argument
      subsections:
        headingLevel: 2
        numbered: true
        order: strict
        matches: explains
        description: one chapter per marked item
`

func rationaleSchema(t *testing.T) *yaml.Doc {
	t.Helper()
	said := yaml.AsDoc(yaml.Read(rationaleHere))
	if said == nil {
		t.Fatal("the schema reads as nothing")
	}
	return said
}

const markedNote = "# Actionables\n\n1. Reach a door. *\n2. Write a fake.\n3. Take the clock. *\n"

// A marked rule wants the chapter arguing it, and the rationale carries that chapter. [[spec/design_output/lsp#a-second-copy-draws]]
func TestAMarkedRuleWantsItsChapter(t *testing.T) {
	tree := fixture(t, map[string]string{"spec/guidance/one.md": markedNote})
	text := "---\nkind: [[rationale]]\nexplains: [[spec/guidance/one]]\n---\n\n# Why\n\n## 1. The door stands\n\nA line.\n"

	found := checkNoteIn(tree, text, rationaleSchema(t), "spec/rationales/one.md")
	one := onlyOne(t, found, "Schema.Why")
	if !strings.Contains(one.Message, "3") {
		t.Errorf("the message names the marked rule standing with no chapter, and reads %q", one.Message)
	}
}

// Every marked rule carries its chapter, so the rule stands quiet. [[spec/design_output/lsp#a-second-copy-draws]]
func TestEveryMarkedRuleCarriesItsChapter(t *testing.T) {
	tree := fixture(t, map[string]string{"spec/guidance/one.md": markedNote})
	text := "---\nkind: [[rationale]]\nexplains: [[spec/guidance/one]]\n---\n\n# Why\n\n## 1. The door stands\n\nA line.\n\n## 3. The clock comes in\n\nA line.\n"

	if found := checkNoteIn(tree, text, rationaleSchema(t), "spec/rationales/one.md"); len(found) != 0 {
		t.Fatalf("a rationale carrying every chapter draws nothing, and it draws %v", rules(found))
	}
}

// A chapter past the marked rules stands, because a note arguing more costs a reader nothing. [[spec/design_output/lsp#a-second-copy-draws]]
func TestAChapterPastAMarkStands(t *testing.T) {
	tree := fixture(t, map[string]string{"spec/guidance/one.md": markedNote})
	text := "---\nkind: [[rationale]]\nexplains: [[spec/guidance/one]]\n---\n\n# Why\n\n## 1. The door stands\n\nA line.\n\n## 2. The fake behaves\n\nA line.\n\n## 3. The clock comes in\n\nA line.\n"

	if found := checkNoteIn(tree, text, rationaleSchema(t), "spec/rationales/one.md"); len(found) != 0 {
		t.Fatalf("a chapter past a mark draws nothing, and it draws %v", rules(found))
	}
}

// The write door hands one buffer, so the pair reading stands off there. [[spec/design_output/lsp#a-second-copy-draws]]
func TestNoTreeHoldsTheMarkedReading(t *testing.T) {
	text := "---\nkind: [[rationale]]\nexplains: [[spec/guidance/one]]\n---\n\n# Why\n\n## 1. The door stands\n\nA line.\n"

	if found := checkNote(text, rationaleSchema(t), "spec/rationales/one.md"); len(found) != 0 {
		t.Fatalf("one buffer draws nothing over a pair, and it draws %v", rules(found))
	}
}

// A rationale naming no note reads nothing against anything. [[spec/design_output/lsp#a-second-copy-draws]]
func TestARationaleNamingNoNoteStandsQuiet(t *testing.T) {
	tree := fixture(t, map[string]string{"spec/guidance/one.md": markedNote})
	text := "---\nkind: [[rationale]]\n---\n\n# Why\n\n## 1. The door stands\n\nA line.\n"

	if found := checkNoteIn(tree, text, rationaleSchema(t), "spec/rationales/one.md"); len(found) != 0 {
		t.Fatalf("a rationale naming no note draws nothing, and it draws %v", rules(found))
	}
}
