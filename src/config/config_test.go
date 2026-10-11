// The reader, over a fixture root each case writes for itself.
// [[spec/tickets/the-colours-stand-in-config]]
package config

import (
	"path/filepath"
	"testing"
)

// A root holding the files a case names, written through the door under the test's own folder. [[spec/tickets/test-walks-move-onto-fakes]]
func rootWith(t *testing.T, files map[string]string) string {
	t.Helper()
	root := t.TempDir() // level0: FixtureOutsideHome - each case writes the layer files of its own root
	for path, said := range files {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := makeDir(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := writeFile(at, []byte(said), 0o644); err != nil {
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
	if said != float64(5) {
		t.Fatalf("the reader answers %v, and the environment says 5", said)
	}
}

func TestTheEnvironmentBeatsTheLocalLayer(t *testing.T) {
	root := rootWith(t, map[string]string{
		Tracked: `{"answer": {"words": 3}}`,
		Local:   `{"answer": {"words": 7}}`,
	})
	t.Setenv("SE_ANSWER_WORDS", "5")

	said, _ := Value(root, "answer.words")
	if whole, ok := said.(float64); !ok || int(whole) != 5 {
		t.Fatalf("the reader answers %v, and the environment says 5", said)
	}
}

// A shared key reads the tracked file alone, whatever the variable and the local file say. [[spec/design_output/model#a-keys-layers]]
func TestASharedKeyReadsTheTrackedFileAlone(t *testing.T) {
	root := rootWith(t, map[string]string{
		Schema:  `{"properties": {"migration": {"properties": {"opentasks": {"type": "string", "default": "new", "shared": true}}}}}`,
		Tracked: `{"migration": {"opentasks": "shadow"}}`,
		Local:   `{"migration": {"opentasks": "old"}}`,
	})
	t.Setenv("SE_MIGRATION_OPENTASKS", "old")
	if said, layer, _ := Where(root, "migration.opentasks"); said != "shadow" || layer != Tracked {
		t.Fatalf("migration.opentasks reads %v off %s, and wants shadow off %s", said, layer, Tracked)
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
	// A path of the case's own, because src/tui owns the one the window reads. [[spec/tickets/the-colours-stand-in-config]]
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

// [[spec/design_output/config#the-go-reader]]
func TestACountReadsANumberOrATextAndZeroWhereNoneStands(t *testing.T) {
	root := rootWith(t, map[string]string{
		Tracked: `{"ops": {"keepDone": 3600, "keepFailed": 60}}`,
		Local:   `{"ops": {"keepFailed": " 90 "}}`,
	})
	if said := Count(root, "ops.keepDone"); said != 3600 {
		t.Fatalf("the tracked number reads %d", said)
	}
	if said := Count(root, "ops.keepFailed"); said != 90 {
		t.Fatalf("the local text reads %d", said)
	}
	if said := Count(root, "ops.none"); said != 0 {
		t.Fatalf("a key standing nowhere reads %d", said)
	}
}

// Where names the layer answering: the variable over the local file over the tracked file. [[spec/tickets/cfg-topic-holds-one-resolver]]
func TestWhereNamesTheLayer(t *testing.T) {
	root := rootWith(t, map[string]string{Tracked: `{"names": {"words": 3, "kept": 1}}`, Local: `{"names": {"words": 8}}`})
	t.Setenv("SE_NAMES_KEPT", "4")
	if _, layer, held := Where(root, "names.words"); !held || layer != Local {
		t.Fatalf("names.words reads off %q", layer)
	}
	if said, layer, held := Where(root, "names.kept"); !held || layer != "SE_NAMES_KEPT" || said != float64(4) {
		t.Fatalf("names.kept reads %v off %q", said, layer)
	}
	if _, layer, held := Where(root, "names.none"); held || layer != "" {
		t.Fatalf("names.none reads off %q", layer)
	}
}

// A key no file sets answers the schema's default, under the layer built-in. [[spec/tickets/the-config-schema-gets-generated]]
func TestWhereAnswersTheBuiltIn(t *testing.T) {
	root := rootWith(t, map[string]string{
		Tracked:                          `{}`,
		"spec/config/level0.schema.json": `{"properties": {"names": {"properties": {"words": {"type": "number", "default": 4}}}}}`,
	})

	said, layer, held := Where(root, "names.words")
	if !held || layer != "built-in" {
		t.Fatalf("the reader answers the layer %q, held %v, and wants built-in", layer, held)
	}
	if whole, ok := said.(float64); !ok || int(whole) != 4 {
		t.Fatalf("the reader answers %v, and wants the default 4", said)
	}
	if said := Count(root, "names.words"); said != 4 {
		t.Fatalf("the count answers %d, and wants the default 4", said)
	}
}

// The default reads the schema alone, past a value the tracked and local files set. [[spec/tickets/stale-span-reads-schema-unset]]
func TestDefaultReadsTheSchemaAlone(t *testing.T) {
	root := rootWith(t, map[string]string{
		Tracked: `{"work": {"staleAfter": "1h"}}`,
		Local:   `{"work": {"staleAfter": "2h"}}`,
		Schema:  `{"properties": {"work": {"properties": {"staleAfter": {"default": "30m"}}}}}`,
	})
	if said, held := Default(root, "work.staleAfter"); !held || said != "30m" {
		t.Fatalf("the default reads %v, held %v, and wants 30m", said, held)
	}
	if _, held := Default(root, "work.unknown"); held {
		t.Fatal("a key the schema leaves out holds a default")
	}
}

// A key the schema leaves out, or names with no default, holds no built-in. [[spec/tickets/the-config-schema-gets-generated]]
func TestAKeyTheSchemaLeavesOutHoldsNoBuiltIn(t *testing.T) {
	root := rootWith(t, map[string]string{Schema: `{"properties": {"names": {"properties": {"words": {"type": "number"}}}}}`})
	for _, key := range []string{"names.words", "names.none", "none.words"} {
		if said, _, ok := Where(root, key); ok {
			t.Fatalf("%s holds the built-in %v, and wants none", key, said)
		}
	}
}

// The slices whose mode the bridge's slicesOf read off the config. [[spec/tickets/bridge-library-leaves]]
var slicesRead = []string{"config", "log", "guidance", "check", "prose"}

// A slice's mode reads the local layer again at each ask, so a drop reaches the next reader. [[spec/tickets/bridge-library-leaves]]
func TestASliceModeReadsTheLocalLayerAgainAtEachAsk(t *testing.T) {
	t.Parallel()
	for _, slice := range slicesRead {
		key := "migration." + slice
		root := rootWith(t, map[string]string{
			Tracked: `{"migration": {"` + slice + `": "shadow"}}`,
			Local:   `{"migration": {"` + slice + `": "old"}}`,
		})
		for at, mode := range []string{"old", "new", "old"} {
			if at > 0 {
				if err := Drop(root, key, mode); err != nil {
					t.Fatal(err)
				}
			}
			if said, layer, held := Where(root, key); !held || said != mode || layer != Local {
				t.Errorf("%s reads %v off %q at ask %d, and wants %s off %s", key, said, layer, at, mode, Local)
			}
			if said, held := Value(root, key); !held || said != mode {
				t.Errorf("the value of %s reads %v at ask %d, and wants %s", key, said, at, mode)
			}
		}
	}
}

// A slice's mode no file sets reads the schema's default under the layer built-in, and a slice the schema gives no default reads nothing. [[spec/tickets/bridge-library-leaves]]
func TestASliceModeNoFileSetsReadsTheSchemaDefault(t *testing.T) {
	t.Parallel()
	for _, slice := range slicesRead {
		key := "migration." + slice
		root := rootWith(t, map[string]string{
			Tracked: `{"migration": {"cage": "old"}}`,
			Local:   `{"log": {"level": "debug"}}`,
			Schema:  `{"properties": {"migration": {"properties": {"` + slice + `": {"type": "string", "default": "new"}}}}}`,
		})
		if said, layer, held := Where(root, key); !held || said != "new" || layer != BuiltIn {
			t.Errorf("%s reads %v off %q, and wants new off %s", key, said, layer, BuiltIn)
		}
		if said, held := Value(root, key); !held || said != "new" {
			t.Errorf("the value of %s reads %v, and wants new", key, said)
		}
	}
	bare := rootWith(t, map[string]string{
		Tracked: `{}`,
		Schema:  `{"properties": {"migration": {"properties": {"check": {"type": "string"}}}}}`,
	})
	if said, layer, held := Where(bare, "migration.check"); held || layer != "" || said != nil {
		t.Errorf("a slice with no default reads %v off %q", said, layer)
	}
}

// A drop writes its key and keeps every other key of the local layer, and makes the layer where none stands. [[spec/tickets/cage-hold-drops-port]]
func TestDropWritesOneKeyOfTheLocalLayer(t *testing.T) {
	root := rootWith(t, map[string]string{Local: `{"stop": {"hold": "finish", "other": "kept"}, "ask": {"wanted": "brief"}}`})
	if err := Drop(root, "stop.hold", "off"); err != nil {
		t.Fatal(err)
	}
	for key, want := range map[string]string{"stop.hold": "off", "stop.other": "kept", "ask.wanted": "brief"} {
		if said, _, _ := Where(root, key); said != want {
			t.Fatalf("%s reads %v after the drop, and wants %s", key, said, want)
		}
	}
	bare := t.TempDir()
	if err := Drop(bare, "ask.wanted", "quiet"); err != nil {
		t.Fatal(err)
	}
	if said, layer, _ := Where(bare, "ask.wanted"); said != "quiet" || layer != Local {
		t.Fatalf("a drop into a bare root reads %v off %s, and wants quiet off %s", said, layer, Local)
	}
}

// A drop over a local layer holding broken JSON errors and leaves the file as it stands, so a hand edit loses no key. [[spec/tickets/drop-keeps-a-broken-layer]]
func TestDropRefusesALocalLayerThatFailsToParse(t *testing.T) {
	broken := `{"stop": {"hold": "finish"},}`
	root := rootWith(t, map[string]string{Local: broken})
	if err := Drop(root, "ask.wanted", "quiet"); err == nil {
		t.Fatal("a drop over broken JSON answers no error")
	}
	if held, _ := readFile(filepath.Join(root, filepath.FromSlash(Local))); string(held) != broken {
		t.Fatalf("the layer holds %q after the drop, and wants %q", held, broken)
	}
}
