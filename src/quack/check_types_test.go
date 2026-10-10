// The check's types part, where claude lays the types and tsc reads the hooks. [[spec/tickets/level0-hooks-move-to-typescript]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func TestTheTypesPart(t *testing.T) {
	t.Parallel()
	both := [][]string{{"claude", "--plugin-dir", filepath.FromSlash(pluginDir), "-p", ""}, {"tsc", "-p", filepath.FromSlash(pluginDir)}}
	cases := []struct {
		name string
		fake *checkFake
		laid bool
		runs [][]string
	}{
		{"lays the engine's types, then runs tsc over the plugin", &checkFake{codes: map[string]int{"claude": 1}}, true, both},
		{"fails where tsc refuses the hooks", &checkFake{codes: map[string]int{"tsc": 2}, said: map[string]string{"tsc": "hooks/level0.ts(1,1): error TS2322"}}, true, both},
		{"passes, and runs no tsc, where claude lays no types", &checkFake{codes: map[string]int{"tsc": 2}}, false, both[:1]},
		{"passes where claude stands nowhere", &checkFake{codes: map[string]int{"tsc": 2}, gone: map[string]bool{"claude": true}}, true, both[:1]},
		{"passes where tsc stands nowhere", &checkFake{codes: map[string]int{"tsc": 2}, gone: map[string]bool{"tsc": true}}, true, both},
	}
	for _, one := range cases {
		doors := one.fake.doors()
		if at := doors.at(laidTypes); one.laid && (doors.disk.makeAll(filepath.Dir(at), checkFolderMode) != nil || doors.disk.write(at, []byte("{}\n"), checkFileMode) != nil) {
			t.Fatal("the fake tree takes no laid types")
		}
		var said strings.Builder
		doors.errs = &said
		code := partNamed(partsOf(doors, nil, false), "types").run()
		if code != len(one.fake.said) || !reflect.DeepEqual(one.fake.runs, one.runs) || (code == 1) != strings.Contains(said.String(), "TS2322") {
			t.Fatalf("the types part %s: answers %d, ran %v, and says %q", one.name, code, one.fake.runs, said.String())
		}
	}
}
