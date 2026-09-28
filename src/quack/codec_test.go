// Every codec the root wires writes back every committed file of its glob,
// every local one standing, and the fixture the case seeds, byte for byte.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package main

import (
	"fmt"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"testing"

	"quackitect/src/modules/config"
	"quackitect/src/modules/holds"
	"quackitect/src/modules/queue"
)

const treeRoot = "../.."

// The fixtures the case seeds where a box carries no plan, no hold and no local config, keyed by the path each stands at. [[spec/design_output/model#everything-on-disk-mirrors]]
var seeds = map[string]string{
	queue.Plan:   "testdata/plan.json",
	config.Local: "testdata/config.json",
	strings.Replace(holds.Glob, "*", "seeded", 1): "testdata/hold.json",
}

// Reads every committed file, every local one standing under a projection's glob, and each seed, keyed by its path. [[spec/design_output/model#everything-on-disk-mirrors]]
func mirrored(t *testing.T) map[string][]byte {
	t.Helper()
	listed, err := exec.Command("git", "-C", treeRoot, "ls-files").Output()
	if err != nil {
		t.Fatal(err)
	}
	paths := strings.Split(strings.TrimSpace(string(listed)), "\n")
	for _, one := range projections() {
		local, _ := filepath.Glob(filepath.Join(treeRoot, filepath.FromSlash(one.glob)))
		for _, abs := range local {
			rel, _ := filepath.Rel(treeRoot, abs)
			paths = append(paths, filepath.ToSlash(rel))
		}
	}
	out := map[string][]byte{}
	for _, rel := range paths {
		if body, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(rel))); err == nil {
			out[rel] = body
		}
	}
	for at, fixture := range seeds {
		body, err := os.ReadFile(fixture)
		if err != nil {
			t.Fatal(err)
		}
		out[at] = body
	}
	return out
}

// Round-trips each file through the projection its glob names, and answers the first file writing back another way, or a projection reading no file. [[spec/design_output/model#everything-on-disk-mirrors]]
func roundTrips(bodies map[string][]byte) error {
	paths := make([]string, 0, len(bodies))
	for rel := range bodies {
		paths = append(paths, rel)
	}
	sort.Strings(paths)
	for _, one := range projections() {
		read := 0
		for _, rel := range paths {
			if matched, _ := path.Match(one.glob, rel); !matched {
				continue
			}
			out, err := one.roundTrip(bodies[rel])
			if err != nil || string(out) != string(bodies[rel]) {
				return fmt.Errorf("%s writes back another way: %v", rel, err)
			}
			read++
		}
		if read == 0 {
			return fmt.Errorf("the projection over %s reads no file", one.glob)
		}
	}
	return nil
}

func TestEveryCodecRoundTripsItsCommittedFiles(t *testing.T) {
	if err := roundTrips(mirrored(t)); err != nil {
		t.Fatal(err)
	}
}

// A file broken under one projection fails the round trip on that file, where its codec writes the break back another way. The markdown codec writes any bytes back, so a break passes there. [[spec/design_output/model#everything-on-disk-mirrors]]
func TestABrokenFileFailsItsRoundTrip(t *testing.T) {
	bodies := mirrored(t)
	failed := 0
	for _, one := range projections() {
		broken := ""
		for rel := range bodies {
			if matched, _ := path.Match(one.glob, rel); matched && (broken == "" || rel < broken) {
				broken = rel
			}
		}
		if broken == "" {
			t.Fatalf("the projection over %s reads no file", one.glob)
		}
		copied := map[string][]byte{}
		for rel, body := range bodies {
			copied[rel] = body
		}
		copied[broken] = append([]byte(" "), bodies[broken]...)
		err := roundTrips(copied)
		if out, _ := one.roundTrip(copied[broken]); string(out) == string(copied[broken]) {
			if err != nil {
				t.Fatalf("a break %s writes back answers %v", broken, err)
			}
			continue
		}
		if err == nil || !strings.HasPrefix(err.Error(), broken+" ") {
			t.Fatalf("a broken %s answers %v", broken, err)
		}
		failed++
	}
	if failed == 0 {
		t.Fatal("no break fails the round trip")
	}
}
