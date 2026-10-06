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
	Walk(folder string) []string
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

// Every file under a folder, at any depth, by slashed path from the root. [[spec/design_output/failures#the-check-holds-the-registry]]
func (one Dir) Walk(folder string) []string {
	return []string{}
}

func (one Dir) Read(path string) (string, bool) {
	said, err := os.ReadFile(one.at(path))
	return string(said), err == nil
}

// The process door: it runs a ./RUNME.sh verb line. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type Runner interface {
	Run(line string) (exit int, err error)
}

// The shell under a root, running ./RUNME.sh with a line's words. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type Shell struct{ Root string }

func (one Shell) Run(line string) (int, error) {
	return 0, nil
}

// A process door in memory, keeping each line it gets. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type FakeRunner struct{ Lines []string }

func (one *FakeRunner) Run(line string) (int, error) {
	return 0, nil
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

func (one FakeDir) Walk(folder string) []string {
	return []string{}
}

func (one FakeDir) Read(path string) (string, bool) {
	text, ok := one[path]
	return text, ok
}
