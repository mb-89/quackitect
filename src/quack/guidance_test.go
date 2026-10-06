// The guidance golden file holds the notes each reader hands every leaf of
// every process in this tree, on a box binding no env. The Go test owns the
// module's section, and test/level0/guidance-golden.js writes the old one.
// [[spec/tickets/the-guidance-topic-lands]]
package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"testing"

	"quackitect/src/modules/guidance"
)

// The golden file, and the names each section stands under. [[spec/tickets/the-guidance-topic-lands]]
const (
	guidanceGoldenAt = "testdata/guidance.golden.json"
	guidanceModule   = "src/modules/guidance"
	guidanceOld      = "src/scripts/guidance-hand.js readsFor"
)

func readGuidanceGolden(t *testing.T) map[string]map[string][]string {
	t.Helper()
	out := map[string]map[string][]string{}
	body, err := os.ReadFile(guidanceGoldenAt)
	if err != nil {
		return out
	}
	if err := json.Unmarshal(body, &out); err != nil {
		t.Fatalf("the golden file reads as no JSON: %v", err)
	}
	return out
}

func TestGuidanceGoldenHoldsTheModule(t *testing.T) {
	t.Parallel()
	rows, err := guidanceRows(filepath.Join("..", ".."), map[string]string{})
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) == 0 {
		t.Fatal("the module answers no leaf of the tree")
	}
	golden := readGuidanceGolden(t)
	if *update {
		golden[guidanceModule] = rows
		var body bytes.Buffer
		encoder := json.NewEncoder(&body)
		encoder.SetEscapeHTML(false)
		encoder.SetIndent("", "  ")
		if err := encoder.Encode(golden); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(guidanceGoldenAt, body.Bytes(), 0o644); err != nil {
			t.Fatal(err)
		}
		return
	}
	want, held := golden[guidanceModule]
	if !held {
		t.Fatalf("the golden file holds no section for %s: run go test ./src/quack -run TestGuidanceGolden -update", guidanceModule)
	}
	if !reflect.DeepEqual(rows, want) {
		t.Fatalf("%s answers apart from the golden file: run go test ./src/quack -run TestGuidanceGolden -update, and read the difference at the merge", guidanceModule)
	}
}

func TestGuidanceGoldenOldMeetsNew(t *testing.T) {
	t.Parallel()
	golden := readGuidanceGolden(t)
	new, old := golden[guidanceModule], golden[guidanceOld]
	if len(new) == 0 || len(old) == 0 {
		t.Fatal("the golden file holds both sections: run both writers")
	}
	for key, notes := range old {
		if !reflect.DeepEqual(notes, new[key]) {
			t.Errorf("%s reads %v on the old path, and %v on the module", key, notes, new[key])
		}
	}
	for key := range new {
		if _, held := old[key]; !held {
			t.Errorf("%s stands in the module's section alone", key)
		}
	}
}

func TestGuidanceFilesKeyEachFileByItsPathUnderTheRoot(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	at := filepath.Join(root, filepath.FromSlash(guidance.Guidance), "code")
	if err := os.MkdirAll(at, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(at, "code.md"), []byte("# Actionables\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	said, err := guidanceFiles(root)
	if err != nil {
		t.Fatal(err)
	}
	want := guidance.Guidance + "/code/code.md"
	if len(said) != 1 || said[want].Text != "# Actionables\n" {
		t.Fatalf("the files read %v, and want %s alone, with a processes folder standing nowhere", said, want)
	}
}
