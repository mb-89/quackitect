// The reader, over a fixture root each case writes for itself.
// [[spec/tickets/the-colours-stand-in-config]]
package config

import (
	"os"
	"path/filepath"
	"testing"
)

// A root holding the files a case names, written under the test's own folder. [[spec/tickets/the-colours-stand-in-config]]
func rootWith(t *testing.T, files map[string]string) string {
	t.Helper()
	root := t.TempDir()
	for path, said := range files {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(said), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return root
}

func TestAnEnvironmentNameReadsOffTheKey(t *testing.T) {
	if said := EnvOf("names.words"); said != "SE_NAMES_WORDS" {
		t.Fatalf("EnvOf answers %q", said)
	}
	if said := EnvOf("viewer.colours"); said != "SE_VIEWER_COLOURS" {
		t.Fatalf("EnvOf answers %q", said)
	}
}

func TestAValueReadsTheTrackedLayer(t *testing.T) {
	root := rootWith(t, map[string]string{Tracked: `{"names": {"words": 3}}`})

	said, held := Value(root, "names.words")
	if !held {
		t.Fatal("the tracked layer holds the key, and the reader answers nothing")
	}
	if whole, ok := said.(float64); !ok || int(whole) != 3 {
		t.Fatalf("the reader answers %v", said)
	}
}

func TestTheEnvironmentBeatsTheTrackedLayer(t *testing.T) {
	root := rootWith(t, map[string]string{Tracked: `{"names": {"words": 3}}`})
	t.Setenv("SE_NAMES_WORDS", "5")

	said, held := Value(root, "names.words")
	if !held {
		t.Fatal("the environment holds the key, and the reader answers nothing")
	}
	if said != "5" {
		t.Fatalf("the reader answers %v, and the environment says 5", said)
	}
}

func TestTheLocalLayerBeatsTheEnvironment(t *testing.T) {
	root := rootWith(t, map[string]string{
		Tracked: `{"names": {"words": 3}}`,
		Local:   `{"names": {"words": 7}}`,
	})
	t.Setenv("SE_NAMES_WORDS", "5")

	said, _ := Value(root, "names.words")
	if whole, ok := said.(float64); !ok || int(whole) != 7 {
		t.Fatalf("the reader answers %v, and the local layer says 7", said)
	}
}

func TestAKeyNobodyWritesAnswersNothing(t *testing.T) {
	root := rootWith(t, map[string]string{Tracked: `{"names": {"words": 3}}`})

	if said, held := Value(root, "names.nobody"); held {
		t.Fatalf("a key nobody writes answers %v", said)
	}
	if said, held := Value(root, "nobody.at.all"); held {
		t.Fatalf("a key nobody writes answers %v", said)
	}
}

// A named file's values stand in that file, and no layer sets one. [[spec/tickets/the-colours-stand-in-config]]
func TestAMapReadsTheFileTheCallerNames(t *testing.T) {
	// A path of the case's own, because src/viewer owns the one the window reads. [[spec/tickets/the-colours-stand-in-config]]
	at := "spec/config/styles/a-fixture.json"
	root := rootWith(t, map[string]string{
		at:      `{"kinds": {"level0": "141", "note": "181"}}`,
		Tracked: `{"kinds": {"level0": "1"}}`,
		Local:   `{"kinds": {"level0": "2"}}`,
	})

	said := Map(root, at, "kinds")
	if said["level0"] != "141" || said["note"] != "181" {
		t.Fatalf("the map reads %v", said)
	}
	if len(said) != 2 {
		t.Fatalf("the map holds %d entries, and the file holds two", len(said))
	}
	if held := Map(root, at, "nobody"); len(held) != 0 {
		t.Fatalf("a key the file holds nowhere answers %v", held)
	}
	if held := Map(root, "spec/config/styles/nobody.json", "kinds"); len(held) != 0 {
		t.Fatalf("a file standing nowhere answers %v", held)
	}
}

// A list keeps the order the file writes, where a map keeps none. [[spec/tickets/the-colours-stand-in-config]]
func TestAListReadsInTheOrderTheFileWrites(t *testing.T) {
	at := "spec/config/styles/a-fixture.json"
	root := rootWith(t, map[string]string{
		at: `{"spare": ["67", "103", "9", "144"]}`,
	})

	said := List(root, at, "spare")
	want := []string{"67", "103", "9", "144"}
	if len(said) != len(want) {
		t.Fatalf("the list reads %v", said)
	}
	for at := range want {
		if said[at] != want[at] {
			t.Fatalf("the list reads %v, and the file writes %v", said, want)
		}
	}
	if held := List(root, at, "kinds"); len(held) != 0 {
		t.Fatalf("a key the file holds nowhere answers %v", held)
	}
}
