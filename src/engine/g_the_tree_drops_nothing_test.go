package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
)

// THE ENGINE'S TREE CARRIES EVERYTHING THE DECLARATION WROTE.
//
// The panel reads the engine's answer rather than the file, so a field the
// engine's own struct lacks is a field the panel never sees. Measured in
// September 2026: source and columns were not on the struct. The agents table
// drew a polite sentence saying there was no list called present, and the queue
// count drew nothing. Neither errored, and both read as small separate cosmetic
// faults rather than as one field being dropped in transit.
//
// THE ENGINE MAY ADD, AND MAY NOT DROP. It derives keywords, resolves icons and
// fills pickers, so its answer is the declaration plus what it worked out. What
// it may never do is answer with less.
//
// EVERY CASE HERE IS PLANTED IN A TEMPORARY METHOD ROOT. A test that judges
// whatever the work folder happens to hold answers that nobody has broken the
// rule yet, which is not the same answer as the rule holding.

// treeDropsPlant writes one file under a planted method root.
func treeDropsPlant(t *testing.T, dir, rel, text string) {
	t.Helper()
	at := filepath.Join(dir, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatalf("the case could not be planted: %v", err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatalf("the case could not be planted: %v", err)
	}
}

const treeDropsTheTree = "spec/config/parameters.json"
const treeDropsTheTable = "spec/config/icons.json"

// treeDropsRoot plants a declaration and the icon table it names, and answers
// the root they were planted in. The table is planted because the one place a
// tree is read resolves icons while it reads.
func treeDropsRoot(t *testing.T, declared string) string {
	t.Helper()
	dir := t.TempDir()
	treeDropsPlant(t, dir, treeDropsTheTree, declared)
	treeDropsPlant(t, dir, treeDropsTheTable,
		"{\n  \"$comment\": \"a planted table\",\n  \"power\": { \"glyph\": \"o\", \"at\": \"U+006F\" }\n}\n")
	return dir
}

// treeDropsRead reads a planted declaration back as plain JSON, which is what
// somebody wrote rather than what the engine happens to model.
func treeDropsRead(t *testing.T, dir string) map[string]any {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(dir, filepath.FromSlash(treeDropsTheTree)))
	if err != nil {
		t.Fatalf("the planted declaration could not be read back: %v", err)
	}
	var declared map[string]any
	if err := json.Unmarshal(b, &declared); err != nil {
		t.Fatalf("the planted declaration is not readable JSON: %v", err)
	}
	return declared
}

// treeDropsAnswer is the tree the engine answers for that root, taken through
// the same JSON a console or a panel would be handed.
func treeDropsAnswer(t *testing.T, dir string) map[string]any {
	t.Helper()
	root, err := LoadTree(dir)
	if err != nil {
		t.Fatalf("the engine could not be asked for the tree: %v", err)
	}
	b, err := json.Marshal(root)
	if err != nil {
		t.Fatalf("the engine's tree will not marshal: %v", err)
	}
	var answered map[string]any
	if err := json.Unmarshal(b, &answered); err != nil {
		t.Fatalf("the engine's tree is not readable JSON: %v", err)
	}
	return answered
}

func treeDropsNameOf(n map[string]any) string {
	name, _ := n["name"].(string)
	return name
}

func treeDropsChildrenOf(n map[string]any) []map[string]any {
	raw, _ := n["children"].([]any)
	out := make([]map[string]any, 0, len(raw))
	for _, c := range raw {
		if child, ok := c.(map[string]any); ok {
			out = append(out, child)
		}
	}
	return out
}

// whatTheTreeAnswerDrops walks the declaration against the answer and says what
// was lost on the way, by path.
//
// A VALUE THE ENGINE FILLS IN IS ITS BUSINESS. What is walked here is whether
// the key survives at all, so a picker the engine answers with real choices in
// is not a difference.
//
// TWO SIBLINGS OF ONE NAME STAY TWO. The check this replaces built a map from
// name to node, so a second sibling of the same name overwrote the first, and
// both declared siblings were then held against the same answered node. A
// sibling the answer left out entirely read as present that way. They are
// paired here in the order they were written, which is the order the engine
// keeps.
func whatTheTreeAnswerDrops(declared, answered map[string]any, path string) []string {
	var lost []string
	keys := make([]string, 0, len(declared))
	for key := range declared {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	for _, key := range keys {
		// Children are walked below rather than compared here, and a key
		// beginning with a dollar is a note to whoever opens the declaration
		// rather than a field, so it has no business travelling.
		if key == "children" || strings.HasPrefix(key, "$") {
			continue
		}
		if _, carried := answered[key]; !carried {
			lost = append(lost, path+" lost "+key)
		}
	}
	theirs := map[string][]map[string]any{}
	for _, child := range treeDropsChildrenOf(answered) {
		name := treeDropsNameOf(child)
		theirs[name] = append(theirs[name], child)
	}
	sofar := map[string]int{}
	for _, child := range treeDropsChildrenOf(declared) {
		name := treeDropsNameOf(child)
		at := sofar[name]
		sofar[name]++
		here := name
		if path != "" {
			here = path + "." + name
		}
		if at >= len(theirs[name]) {
			lost = append(lost, here+" is declared and the engine answers no such node")
			continue
		}
		lost = append(lost, whatTheTreeAnswerDrops(child, theirs[name][at], here)...)
	}
	return lost
}

// treeDropsDeclaration is a tree shaped like the real one, with the two fields
// that were lost in September on it and one node standing where the planted
// fault goes.
func treeDropsDeclaration(extra string) string {
	return `{
  "$comment": "a planted declaration",
  "name": "quackitect",
  "type": "group",
  "children": [
    {
      "name": "control",
      "type": "group",
      "shown": true,
      "children": [
        {
          "name": "agents",
          "type": "status",
          "source": "present",
          "columns": [{ "field": "who", "title": "who" }],
          "label": "power"
        },
        {
          "name": "claim",
          "type": "int",
          "default": 3,
          "unit": "hours",
          "help": "how long a claim lasts"` + extra + `
        }
      ]
    }
  ]
}
`
}

func TestTheEnginesTreeCarriesEveryKeyTheDeclarationWrote(t *testing.T) {
	t.Run("a declared field the engine has no room for is caught", func(t *testing.T) {
		// THIS IS THE SHAPE OF THE INCIDENT. A field nobody put on the struct
		// survives in the file and vanishes from the answer, in silence.
		dir := treeDropsRoot(t, treeDropsDeclaration(",\n          \"footnote\": \"drawn under the box\""))

		lost := whatTheTreeAnswerDrops(treeDropsRead(t, dir), treeDropsAnswer(t, dir), "")
		if len(lost) == 0 {
			t.Fatal("the declaration writes footnote, the engine answers without it, and the walk found nothing")
		}
		said := strings.Join(lost, "\n")
		if !strings.Contains(said, "footnote") || !strings.Contains(said, "quackitect.control.claim") {
			t.Errorf("the report does not say which field on which node. said: %s", said)
		}
	})

	t.Run("a declaration of fields the engine carries travels whole", func(t *testing.T) {
		// THE CLEAN HALF. A door that refused everything would pass the case
		// above for the wrong reason, so the same tree without the planted field
		// has to come back with nothing lost.
		dir := treeDropsRoot(t, treeDropsDeclaration(""))

		if lost := whatTheTreeAnswerDrops(treeDropsRead(t, dir), treeDropsAnswer(t, dir), ""); len(lost) != 0 {
			t.Fatalf("every field declared here is one the engine carries, and the walk reported: %s", strings.Join(lost, "\n"))
		}
	})

	t.Run("a note to the reader does not have to travel", func(t *testing.T) {
		dir := treeDropsRoot(t, treeDropsDeclaration(",\n          \"$why\": \"a note to whoever opens this\""))

		if lost := whatTheTreeAnswerDrops(treeDropsRead(t, dir), treeDropsAnswer(t, dir), ""); len(lost) != 0 {
			t.Fatalf("a dollar key is a note rather than a field, and the walk reported: %s", strings.Join(lost, "\n"))
		}
	})

	t.Run("two siblings of one name are held against two answers", func(t *testing.T) {
		// A MAP FROM NAME TO NODE LOSES THE FIRST OF TWO. Both halves are built
		// here rather than loaded, because the fault is in how the two trees are
		// paired rather than in what the engine answers.
		declared := map[string]any{
			"name": "quackitect",
			"type": "group",
			"children": []any{
				map[string]any{"name": "log", "type": "action", "source": "present"},
				map[string]any{"name": "log", "type": "action"},
			},
		}
		answered := map[string]any{
			"name": "quackitect",
			"type": "group",
			"children": []any{
				map[string]any{"name": "log", "type": "action"},
				map[string]any{"name": "log", "type": "action", "source": "present"},
			},
		}

		lost := whatTheTreeAnswerDrops(declared, answered, "")
		if len(lost) == 0 {
			t.Fatal("the first sibling lost its source and the second was read in its place")
		}
		if said := strings.Join(lost, "\n"); !strings.Contains(said, "source") {
			t.Errorf("the report does not name the field the first sibling lost. said: %s", said)
		}
	})

	t.Run("a sibling the answer left out is not read as present", func(t *testing.T) {
		declared := map[string]any{
			"name": "quackitect",
			"type": "group",
			"children": []any{
				map[string]any{"name": "log", "type": "action"},
				map[string]any{"name": "log", "type": "action"},
			},
		}
		answered := map[string]any{
			"name": "quackitect",
			"type": "group",
			"children": []any{
				map[string]any{"name": "log", "type": "action"},
			},
		}

		lost := whatTheTreeAnswerDrops(declared, answered, "")
		if len(lost) != 1 || !strings.Contains(lost[0], "no such node") {
			t.Fatalf("two siblings were declared and one was answered, and the walk reported: %v", lost)
		}
	})

	t.Run("two siblings of one name that both travel are let be", func(t *testing.T) {
		node := map[string]any{"name": "log", "type": "action", "source": "present"}
		two := func() map[string]any {
			return map[string]any{
				"name": "quackitect",
				"type": "group",
				"children": []any{node, node},
			}
		}

		if lost := whatTheTreeAnswerDrops(two(), two(), ""); len(lost) != 0 {
			t.Fatalf("both siblings carry what they declared, and the walk reported: %v", lost)
		}
	})
}
