// The plugin-tests part: the kit run over the plugin, and the count of its
// tests against the code the hooks entry reaches.
// [[spec/tickets/level0-tests-move-to-plugin-test]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func TestPluginTestsPart(t *testing.T) {
	t.Parallel()
	t.Run("the plugin-tests part runs the kit over the plugin, and passes where claude stands nowhere", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"claude": 1}}
		if code := partNamed(partsOf(fake.doors(), nil, false), "plugin-tests").run(); code != 1 {
			t.Fatalf("a failing kit run answers %d", code)
		}
		if !reflect.DeepEqual(fake.runs, [][]string{{"claude", "plugin", "test", filepath.Join(".claude", "skills", "level0")}}) {
			t.Fatalf("the plugin-tests part ran %v", fake.runs)
		}
		gone := &checkFake{gone: map[string]bool{"claude": true}}
		if code := partNamed(partsOf(gone.doors(), nil, false), "plugin-tests").run(); code != 0 {
			t.Fatalf("no claude answers %d", code)
		}
	})
	t.Run("the plugin-tests part fails where the tests run longer than the code the hooks entry reaches", func(t *testing.T) {
		lines := func(n int) string { return strings.Repeat("x\n", n) }
		for _, one := range []struct {
			tests int
			want  int
		}{{tests: 9, want: 0}, {tests: 10, want: 1}} {
			fake := &checkFake{}
			doors := fake.doors()
			plugin := filepath.Join(doors.root, ".claude", "skills", "level0")
			for rel, text := range map[string]string{
				"hooks/hooks.json":   `{"modules": ["./a.ts"]}`,
				"hooks/a.ts":         "import { b } from \"./b.ts\";\nimport { c } from \"../lib/c.js\";\n" + lines(2),
				"hooks/b.ts":         lines(3),
				"lib/c.js":           lines(2),
				"hooks/unreached.ts": lines(50),
				"tests/world.ts":     lines(4),
				"tests/door.test.ts": lines(one.tests - 4),
			} {
				at := filepath.Join(plugin, filepath.FromSlash(rel))
				if err := doors.disk.makeAll(filepath.Dir(at), 0o755); err != nil {
					t.Fatal(err)
				}
				if err := doors.disk.write(at, []byte(text), 0o644); err != nil {
					t.Fatal(err)
				}
			}
			var said strings.Builder
			doors.errs = &said
			if code := partNamed(partsOf(doors, nil, false), "plugin-tests").run(); code != one.want {
				t.Fatalf("%d test lines over 9 code lines answer %d, and want %d: %s", one.tests, code, one.want, said.String())
			}
			if one.want == 1 && !strings.Contains(said.String(), "10") {
				t.Fatalf("the refusal names no count: %q", said.String())
			}
		}
	})
}
