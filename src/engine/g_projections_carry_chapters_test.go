package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A GUIDANCE FILE CARRIES MORE THAN THE CHAPTER THAT TRAVELS. Motivation is the
// chapter the broken engine copied along, so every source here has one.
func theGuidanceSource(which string) string {
	return "# Motivation\n\nWhy the " + which + " rule exists.\n\n" +
		"# Actionables\n\n- do the " + which + " thing\n\n" +
		"## In detail\n\nthe " + which + " detail\n"
}

// theProjectionAsProjected is the file the projector writes: the preamble
// whole, then each source's Actionables chapter under that source's title.
const theProjectionAsProjected = "<!-- GENERATED -->\n\n" +
	"# How to read this\n\nWhat you are looking at.\n\n" +
	"# One rule\n\n## Actionables\n\n- do the one thing\n\n### In detail\n\nthe one detail\n\n" +
	"# Two rules\n\n## Actionables\n\n- do the two thing\n\n### In detail\n\nthe two detail\n"

func TestAProjectionCarryingMoreThanItsChapter(t *testing.T) {
	r := aPlantedProjectionTree(t)
	const target = ".made/rules.md"

	t.Run("a projection carrying whole sources is refused", func(t *testing.T) {
		whole := "<!-- GENERATED -->\n\n" +
			"# How to read this\n\nWhat you are looking at.\n\n" +
			"# One rule\n\n## Motivation\n\nWhy the one rule exists.\n\n" +
			"## Actionables\n\n- do the one thing\n\n### In detail\n\nthe one detail\n\n" +
			"# Two rules\n\n## Motivation\n\nWhy the two rule exists.\n\n" +
			"## Actionables\n\n- do the two thing\n\n### In detail\n\nthe two detail\n"
		err := aProjectionCarryingMoreThanItsChapter(r, false, target, whole)
		if err == nil {
			t.Fatal("the projection carries every chapter of every source, and the write was let through")
		}
		said := err.Error()
		if !strings.Contains(said, "## Motivation") || !strings.Contains(said, "## Actionables") {
			t.Errorf("the refusal does not say which heading is wrong or what belongs there. said: %s", said)
		}
		if !strings.Contains(said, "spec/guidance") {
			t.Errorf("the refusal does not name the sources to edit instead, which is a wall. said: %s", said)
		}
	})

	// THE ORDER IS THE CASE THE CHECK THIS REPLACES COULD NOT ASK. It stopped
	// reading as soon as one source came up short, so a projection with the
	// right headings in the wrong order went through.
	t.Run("a projection whose sources arrive out of order is refused", func(t *testing.T) {
		swapped := "<!-- GENERATED -->\n\n" +
			"# How to read this\n\nWhat you are looking at.\n\n" +
			"# Two rules\n\n## Actionables\n\n- do the two thing\n\n### In detail\n\nthe two detail\n\n" +
			"# One rule\n\n## Actionables\n\n- do the one thing\n\n### In detail\n\nthe one detail\n"
		if err := aProjectionCarryingMoreThanItsChapter(r, false, target, swapped); err == nil {
			t.Fatal("the sources arrive in the wrong order, and the write was let through")
		}
	})

	t.Run("a projection missing its preamble is refused", func(t *testing.T) {
		short := "<!-- GENERATED -->\n\n" +
			"# One rule\n\n## Actionables\n\n- do the one thing\n\n### In detail\n\nthe one detail\n\n" +
			"# Two rules\n\n## Actionables\n\n- do the two thing\n\n### In detail\n\nthe two detail\n"
		if err := aProjectionCarryingMoreThanItsChapter(r, false, target, short); err == nil {
			t.Fatal("the preamble headings are gone, and the write was let through")
		}
	})

	t.Run("the projection the projector writes is let through", func(t *testing.T) {
		if err := aProjectionCarryingMoreThanItsChapter(r, false, target, theProjectionAsProjected); err != nil {
			t.Fatalf("this is the file the projector builds, and it was refused: %v", err)
		}
	})

	t.Run("what the rule is not about", func(t *testing.T) {
		for _, c := range []struct {
			name string
			rel  string
			text string
		}{
			{
				"a projection that copies a whole file, which names no chapter",
				".made/whole.json",
				"# anything at all\n\n## and more of it\n",
			},
			{
				"a file nothing projects",
				"doc/a-note.md",
				"# One rule\n\n## Motivation\n\nwhatever a person writes here\n",
			},
			{
				"a source of the projection rather than the projection",
				"spec/guidance/one-rule.md",
				theGuidanceSource("one"),
			},
		} {
			t.Run(c.name, func(t *testing.T) {
				if err := aProjectionCarryingMoreThanItsChapter(r, true, c.rel, c.text); err != nil {
					t.Fatalf("this write is not the rule's business, and it was refused: %v", err)
				}
			})
		}
	})

	t.Run("a source with no such chapter is said rather than skipped", func(t *testing.T) {
		r := aPlantedProjectionTree(t)
		at := filepath.Join(r.Method, filepath.FromSlash("spec/guidance/two-rules.md"))
		if err := os.WriteFile(at, []byte("# Motivation\n\nand nothing else\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		err := aProjectionCarryingMoreThanItsChapter(r, false, target, theProjectionAsProjected)
		if err == nil {
			t.Fatal("a source carries no Actionables chapter, so what the projection takes from it is undefined, and the write was let through")
		}
		if !strings.Contains(err.Error(), "two-rules.md") {
			t.Errorf("the refusal does not name the source that came up short. said: %s", err.Error())
		}
	})
}
