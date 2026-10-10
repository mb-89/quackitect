// The check's types part: claude lays the engine's types into the plugin, and
// tsc reads the hooks against them, where both stand and the types land.
// [[spec/tickets/level0-hooks-move-to-typescript]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

// The doors with the engine's types laid into the plugin, as claude lays them on load. [[spec/tickets/level0-hooks-move-to-typescript]]
func laid(t *testing.T, d checkDoors) checkDoors {
	t.Helper()
	if err := d.disk.makeAll(filepath.Dir(d.at(laidTypes)), checkFolderMode); err != nil {
		t.Fatal(err)
	}
	if err := d.disk.write(d.at(laidTypes), []byte("{}\n"), checkFileMode); err != nil {
		t.Fatal(err)
	}
	return d
}

func TestTheTypesPart(t *testing.T) {
	t.Parallel()
	t.Run("the types part lays the engine's types, then runs tsc over the plugin", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"claude": 1, "tsc": 0}}
		doors := laid(t, fake.doors())
		if code := partNamed(partsOf(doors, nil, false), "types").run(); code != 0 {
			t.Fatalf("a plugin whose types hold answers %d", code)
		}
		plugin := filepath.Join(".claude", "skills", "level0")
		want := [][]string{{"claude", "--plugin-dir", plugin, "-p", ""}, {"tsc", "-p", plugin}}
		if !reflect.DeepEqual(fake.runs, want) {
			t.Fatalf("the types part ran %v, and want %v", fake.runs, want)
		}
	})
	t.Run("the types part fails where tsc refuses the hooks", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"tsc": 2}, said: map[string]string{"tsc": "hooks/level0.ts(1,1): error TS2322"}}
		doors := laid(t, fake.doors())
		var said strings.Builder
		doors.errs = &said
		if code := partNamed(partsOf(doors, nil, false), "types").run(); code != 1 || !strings.Contains(said.String(), "TS2322") {
			t.Fatalf("a refused type answers %d, and says %q", code, said.String())
		}
	})
	t.Run("the types part passes, and runs no tsc, where claude lays no types", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"tsc": 2}}
		if code := partNamed(partsOf(fake.doors(), nil, false), "types").run(); code != 0 || len(fake.runs) != 1 {
			t.Fatalf("a box with no laid types answers %d, and ran %v", code, fake.runs)
		}
	})
	t.Run("the types part passes where claude or tsc stands nowhere", func(t *testing.T) {
		for _, gone := range []string{"claude", "tsc"} {
			fake := &checkFake{codes: map[string]int{"tsc": 2}, gone: map[string]bool{gone: true}}
			if code := partNamed(partsOf(laid(t, fake.doors()), nil, false), "types").run(); code != 0 {
				t.Fatalf("no %s answers %d", gone, code)
			}
		}
	})
}
