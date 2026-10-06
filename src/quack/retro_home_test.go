// The retro's folder stands under the private folder, and each timed source
// reads the time its lines carry.
// [[spec/guidance/retro/chapter]]
package main

import (
	"path/filepath"
	"testing"
)

// A retro's home stands at .se/.retro/<name> under the root. [[spec/guidance/retro/chapter]]
func TestARetroHomeStandsUnderTheRetroFolder(t *testing.T) {
	t.Parallel()
	got := retroHome("/tree", "retro-abc")
	want := filepath.Join("/tree", ".se", ".retro", "retro-abc")
	if got != want {
		t.Fatalf("retroHome answers %q, want %q", got, want)
	}
}

// A retro verb works under the work root SE_WORK_ROOT names, and under the box's root where it names none. [[spec/design_output/vehicle#the-work-root-inherits]]
func TestARetroHomeReadsTheWorkRoot(t *testing.T) {
	t.Parallel()
	env := map[string]string{workRoot: " /work "}
	d := boxDoors{root: "/tree", env: func(key string) string { return env[key] }}
	if got := retroRootOf(d); got != "/work" {
		t.Fatalf("retroRootOf answers %q, want /work", got)
	}
	delete(env, workRoot)
	if got := retroRootOf(d); got != "/tree" {
		t.Fatalf("retroRootOf answers %q, want /tree", got)
	}
}

// The box doors a retro case runs on: the tree in a temp folder on the box's disk, no environment, and a runner that answers nothing. [[spec/tickets/quack-reaches-the-box-through-doors]]
func retroBoxAt(root string) func() boxDoors {
	return func() boxDoors {
		return boxDoors{
			root: root,
			env:  func(string) string { return "" },
			disk: realDisk(),
			run:  func([]string, runOpts) ranResult { return ranResult{code: exitFailed} },
		}
	}
}

// The transcripts read their time off timestamp, and the log off at. [[spec/guidance/retro/chapter]]
func TestEachTimedSourceReadsItsTime(t *testing.T) {
	t.Parallel()
	lines := map[string]string{
		"transcripts": `{"type":"user","timestamp":"2026-01-02T03:04:05Z"}`,
		"log":         `{"level":"info","at":"2026-01-02T03:04:05Z"}`,
	}
	for _, source := range retroTimed {
		found := source.field.FindStringSubmatch(lines[source.top])
		if len(found) < 2 || found[1] != "2026-01-02T03:04:05Z" {
			t.Fatalf("%s reads %v", source.top, found)
		}
	}
}
