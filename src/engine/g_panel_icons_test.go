package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE TWO FILES ARE BUILT HERE RATHER THAN READ OFF THE WORK FOLDER. A test
// that judges whatever the tree happens to hold answers that nobody has broken
// the rule yet, which is not the same answer as the rule holding. Every case
// below plants both halves and hands one of them to the door.

// panelIconsPlantedTree is a parameter tree shaped like the real one: a status
// control naming an icon once per state, and an action naming one outright.
func panelIconsPlantedTree(action string) string {
	return `{
  "name": "quackitect",
  "type": "group",
  "children": [
    {
      "name": "control",
      "type": "group",
      "children": [
        {
          "name": "engine",
          "type": "status",
          "labels": { "idle": "power", "good": "power" }
        },
        {
          "name": "log",
          "type": "action",
          "label": "` + action + `"
        }
      ]
    }
  ]
}`
}

// panelIconsPlantedTable declares a glyph for each name it is given, under the
// comment the real table opens with. That comment is a sentence rather than an
// entry, so a reader that took every value for an entry would fall over on it.
func panelIconsPlantedTable(names ...string) string {
	rows := []string{`  "$comment": "EVERY ICON THE SYSTEM DRAWS, in one table."`}
	for _, name := range names {
		rows = append(rows, `  "`+name+`": { "glyph": "o", "at": "U+006F", "for": "a planted mark" }`)
	}
	return "{\n" + strings.Join(rows, ",\n") + "\n}\n"
}

// panelIconsPlant writes a file under the planted work root and answers the root.
func panelIconsPlant(t *testing.T, dir, rel, text string) {
	t.Helper()
	at := filepath.Join(dir, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatalf("the case could not be planted: %v", err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatalf("the case could not be planted: %v", err)
	}
}

const panelIconsTheTree = "spec/config/parameters.json"
const panelIconsTheTable = "spec/config/icons.json"

func TestEveryLabelNamesADeclaredIcon(t *testing.T) {
	t.Run("a label the table has no entry for is refused", func(t *testing.T) {
		dir := t.TempDir()
		r := Roots{Work: dir, Method: dir}
		panelIconsPlant(t, dir, panelIconsTheTable, panelIconsPlantedTable("power"))

		err := everyLabelNamesADeclaredIcon(r, false, panelIconsTheTree, panelIconsPlantedTree("lines"))
		if err == nil {
			t.Fatal("the tree labels a control lines, the table declares no such icon, and the write was let through")
		}
		said := err.Error()
		if !strings.Contains(said, "lines") || !strings.Contains(said, "quackitect.control.log") {
			t.Errorf("the refusal does not say which name on which control. said: %s", said)
		}
	})

	t.Run("a label whose entry carries no glyph is refused", func(t *testing.T) {
		dir := t.TempDir()
		r := Roots{Work: dir, Method: dir}
		panelIconsPlant(t, dir, panelIconsTheTable,
			"{\n  \"power\": { \"at\": \"U+23FB\" },\n  \"lines\": { \"glyph\": \"o\" }\n}\n")

		err := everyLabelNamesADeclaredIcon(r, false, panelIconsTheTree, panelIconsPlantedTree("lines"))
		if err == nil {
			t.Fatal("the entry for power carries no glyph, so the panel draws the word, and the write was let through")
		}
		if !strings.Contains(err.Error(), "power") {
			t.Errorf("the refusal does not name the icon with no glyph. said: %s", err)
		}
	})

	t.Run("a tree whose every label is declared is let through", func(t *testing.T) {
		dir := t.TempDir()
		r := Roots{Work: dir, Method: dir}
		panelIconsPlant(t, dir, panelIconsTheTable, panelIconsPlantedTable("power", "lines"))

		if err := everyLabelNamesADeclaredIcon(r, false, panelIconsTheTree, panelIconsPlantedTree("lines")); err != nil {
			t.Fatalf("every label names a declared icon, and the write was refused: %v", err)
		}
	})

	t.Run("a table dropping a glyph the tree still names is refused", func(t *testing.T) {
		dir := t.TempDir()
		r := Roots{Work: dir, Method: dir}
		panelIconsPlant(t, dir, panelIconsTheTree, panelIconsPlantedTree("lines"))

		err := everyLabelNamesADeclaredIcon(r, false, panelIconsTheTable, panelIconsPlantedTable("lines"))
		if err == nil {
			t.Fatal("the table drops power while the tree still labels a control with it, and the write was let through")
		}
		if !strings.Contains(err.Error(), "power") {
			t.Errorf("the refusal does not name the icon that was dropped. said: %s", err)
		}
	})

	t.Run("a table carrying every name the tree uses is let through", func(t *testing.T) {
		dir := t.TempDir()
		r := Roots{Work: dir, Method: dir}
		panelIconsPlant(t, dir, panelIconsTheTree, panelIconsPlantedTree("lines"))

		if err := everyLabelNamesADeclaredIcon(r, false, panelIconsTheTable, panelIconsPlantedTable("power", "lines")); err != nil {
			t.Fatalf("the table carries every name the tree uses, and the write was refused: %v", err)
		}
	})

	t.Run("a write to any other file is let through", func(t *testing.T) {
		dir := t.TempDir()
		r := Roots{Work: dir, Method: dir}
		panelIconsPlant(t, dir, panelIconsTheTable, panelIconsPlantedTable("power"))

		if err := everyLabelNamesADeclaredIcon(r, true, "spec/config/tools.json", panelIconsPlantedTree("lines")); err != nil {
			t.Fatalf("a file this rule does not own was refused: %v", err)
		}
	})

	t.Run("a tree with no table beside it is let through", func(t *testing.T) {
		dir := t.TempDir()
		r := Roots{Work: dir, Method: dir}

		if err := everyLabelNamesADeclaredIcon(r, false, panelIconsTheTree, panelIconsPlantedTree("lines")); err != nil {
			t.Fatalf("there is nothing to hold the names against, and the write was refused anyway: %v", err)
		}
	})
}
