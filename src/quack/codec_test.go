// Every codec the root wires writes back every committed file of its glob,
// and every local one standing, byte for byte.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package main

import (
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"testing"
)

const treeRoot = "../.."

func TestEveryCodecRoundTripsItsCommittedFiles(t *testing.T) {
	listed, err := exec.Command("git", "-C", treeRoot, "ls-files").Output()
	if err != nil {
		t.Fatal(err)
	}
	paths := strings.Split(strings.TrimSpace(string(listed)), "\n")
	read := 0
	for _, one := range projections() {
		local, _ := filepath.Glob(filepath.Join(treeRoot, filepath.FromSlash(one.glob)))
		for _, abs := range local {
			rel, _ := filepath.Rel(treeRoot, abs)
			paths = append(paths, filepath.ToSlash(rel))
		}
		for _, rel := range paths {
			if matched, _ := path.Match(one.glob, rel); !matched {
				continue
			}
			body, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(rel)))
			if err != nil {
				continue
			}
			out, err := one.roundTrip(body)
			if err != nil || string(out) != string(body) {
				t.Fatalf("%s writes back another way: %v", rel, err)
			}
			read++
		}
	}
	if read == 0 {
		t.Fatal("no codec reads a committed file")
	}
}
