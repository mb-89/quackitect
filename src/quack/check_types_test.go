// The check's types part: the engine's types laid through claude, then tsc over
// the plugin, and a box that lays none going untyped.
// [[spec/tickets/level0-hooks-move-to-typescript]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func TestCheckTypesPart(t *testing.T) {
	t.Parallel()
	laid := func(t *testing.T, d checkDoors) checkDoors {
		t.Helper()
		if err := d.disk.makeAll(filepath.Dir(d.at(typesConfig)), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := d.disk.write(d.at(typesConfig), []byte("{}"), 0o644); err != nil {
			t.Fatal(err)
		}
		return d
	}
	t.Run("the types part lays the engine's types, then runs tsc over the plugin", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"claude": 1, "tsc": 0}}
		if code := partNamed(partsOf(laid(t, fake.doors()), nil, false), "types").run(); code != 0 {
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
	// A claude that runs and lays no types leaves tsc nothing to extend, so the part reads untyped. [[spec/tickets/untyped-boxes-check-on]]
	t.Run("the types part passes, and runs no tsc, where the lay leaves no types", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"claude": 1, "tsc": 2}}
		if code := partNamed(partsOf(fake.doors(), nil, false), "types").run(); code != 0 || len(fake.runs) != 1 {
			t.Fatalf("a lay with no types answers %d, and runs %v", code, fake.runs)
		}
	})
	t.Run("the types part passes where claude or tsc stands nowhere", func(t *testing.T) {
		for _, gone := range []string{"claude", "tsc"} {
			fake := &checkFake{codes: map[string]int{"tsc": 2}, gone: map[string]bool{gone: true}}
			if code := partNamed(partsOf(fake.doors(), nil, false), "types").run(); code != 0 {
				t.Fatalf("no %s answers %d", gone, code)
			}
		}
	})
}
