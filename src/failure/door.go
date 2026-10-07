// The failure package's door: the folder of nodes under a root, and its fake
// in memory. No other file of the package reaches outside.
// [[spec/design_output/failures#the-registry-reads-the-nodes]]
package failure

import (
	"errors"
	"os"
	"os/exec"
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
	out := []string{}
	_ = filepath.WalkDir(one.at(folder), func(at string, entry os.DirEntry, err error) error {
		if err != nil || entry.IsDir() {
			return nil
		}
		if path, err := filepath.Rel(one.Root, at); err == nil {
			out = append(out, filepath.ToSlash(path))
		}
		return nil
	})
	sort.Strings(out)
	return out
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

// A nonzero exit answers its code, and a shell that starts nowhere answers its error. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func (one Shell) Run(line string) (int, error) {
	command := exec.Command("sh", "-c", "./RUNME.sh "+line)
	command.Dir = one.Root
	err := command.Run()
	var exited *exec.ExitError
	if errors.As(err, &exited) {
		return exited.ExitCode(), nil
	}
	return 0, err
}

// A process door in memory, keeping each line it gets. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type FakeRunner struct {
	Lines []string
	Exits map[string]int
}

func (one *FakeRunner) Run(line string) (int, error) {
	one.Lines = append(one.Lines, line)
	return one.Exits[line], nil
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
	out := []string{}
	for held := range one {
		if strings.HasPrefix(held, folder+"/") {
			out = append(out, held)
		}
	}
	sort.Strings(out)
	return out
}

func (one FakeDir) Read(path string) (string, bool) {
	text, ok := one[path]
	return text, ok
}
