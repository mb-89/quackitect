// The failure package's door: the folder of nodes under a root, and its fake
// in memory. No other file of the package reaches outside.
// [[spec/design_output/failures#the-registry-reads-the-nodes]]
package failure

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// The reads the registry takes: the names a folder holds, and one file's text. [[spec/design_output/failures#the-registry-reads-the-nodes]]
type Reader interface {
	Files(folder string) []string
	Read(path string) (string, bool)
}

// The disk under a root, by slashed paths relative to it. [[spec/design_output/failures#the-registry-reads-the-nodes]]
type Dir struct{ Root string }

func (one Dir) at(path string) string { return filepath.Join(one.Root, filepath.FromSlash(path)) }

func (one Dir) Files(folder string) []string {
	entries, err := os.ReadDir(one.at(folder))
	if err != nil {
		return []string{}
	}
	out := []string{}
	for _, entry := range entries {
		if !entry.IsDir() {
			out = append(out, entry.Name())
		}
	}
	sort.Strings(out)
	return out
}

func (one Dir) Read(path string) (string, bool) {
	said, err := os.ReadFile(one.at(path))
	return string(said), err == nil
}

// A folder in memory, keyed by slashed path. [[spec/design_output/failures#the-registry-reads-the-nodes]]
type FakeDir map[string]string

func (one FakeDir) Files(folder string) []string {
	out := []string{}
	for held := range one {
		if name, ok := strings.CutPrefix(held, folder+"/"); ok && !strings.Contains(name, "/") {
			out = append(out, name)
		}
	}
	sort.Strings(out)
	return out
}

func (one FakeDir) Read(path string) (string, bool) {
	text, ok := one[path]
	return text, ok
}
