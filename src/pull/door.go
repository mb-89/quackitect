// The ticket verbs and the pull in Go: the reads every verb shares, the
// writes, and the pull itself, off src/scripts/ticket.js and pull*.js. This
// file holds the disk door and its fake, and no other file reaches outside.
// [[spec/tickets/ticket-verbs-port-to-go]]
package pull

import (
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"quackitect/src/modules/files"
	"quackitect/src/proc"
)

// The disk under the root, by slashed paths relative to it. [[spec/tickets/ticket-verbs-port-to-go]]
type Disk interface {
	Read(path string) (string, bool)
	Exists(path string) bool
	Files(folder string) []string
	Write(path, text string) error
	Remove(path string) error
}

// A disk in memory, which every case of this package writes to. [[spec/tickets/ticket-verbs-port-to-go]]
type FakeDisk map[string]string

func (one FakeDisk) Read(path string) (string, bool) {
	text, ok := one[path]
	return text, ok
}

func (one FakeDisk) Exists(path string) bool {
	if _, ok := one[path]; ok {
		return true
	}
	for held := range one {
		if len(held) > len(path) && held[:len(path)+1] == path+"/" {
			return true
		}
	}
	return false
}

func (one FakeDisk) Files(folder string) []string {
	out := []string{}
	for held := range one {
		if len(held) <= len(folder)+1 || held[:len(folder)+1] != folder+"/" {
			continue
		}
		if name := held[len(folder)+1:]; !containsSlash(name) {
			out = append(out, name)
		}
	}
	sortStrings(out)
	return out
}

func (one FakeDisk) Write(path, text string) error {
	one[path] = text
	return nil
}

func (one FakeDisk) Remove(path string) error {
	delete(one, path)
	return nil
}

// The disk under a root on this box. [[spec/tickets/ticket-verbs-port-to-go]]
type OSDisk struct{ Root string }

func (one OSDisk) at(path string) string { return filepath.Join(one.Root, filepath.FromSlash(path)) }

func (one OSDisk) Read(path string) (string, bool) {
	said, err := os.ReadFile(one.at(path))
	return string(said), err == nil
}

func (one OSDisk) Exists(path string) bool {
	_, err := os.Stat(one.at(path))
	return err == nil
}

func (one OSDisk) Files(folder string) []string {
	found, _ := os.ReadDir(one.at(folder))
	out := []string{}
	for _, each := range found {
		if !each.IsDir() {
			out = append(out, each.Name())
		}
	}
	sort.Strings(out)
	return out
}

// Writes the text, and makes the folder it stands in. [[spec/tickets/ticket-verbs-port-to-go]]
func (one OSDisk) Write(path, text string) error {
	at := one.at(path)
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		return err
	}
	return os.WriteFile(at, []byte(text), 0o644)
}

// Removes the file, and a file standing nowhere removes clean. [[spec/tickets/ticket-verbs-port-to-go]]
func (one OSDisk) Remove(path string) error {
	if err := os.Remove(one.at(path)); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func containsSlash(said string) bool {
	for _, r := range said {
		if r == '/' {
			return true
		}
	}
	return false
}

// The disk a git work tree stands on, so the pull and the repository read one tree. [[spec/design_output/doors#the-git-door-carries-writes]]
type TreeDisk struct{ Tree files.Disk }

func (one TreeDisk) Read(path string) (string, bool) {
	text, ok, err := one.Tree.Read(path)
	return text, ok && err == nil
}

func (one TreeDisk) Exists(path string) bool {
	if _, ok := one.Read(path); ok {
		return true
	}
	under, _ := one.Tree.List(path)
	return len(under) > 0
}

func (one TreeDisk) Files(folder string) []string {
	under, _ := one.Tree.List(folder)
	out := []string{}
	for _, path := range under {
		if name := strings.TrimPrefix(path, folder+"/"); !containsSlash(name) {
			out = append(out, name)
		}
	}
	return out
}

func (one TreeDisk) Write(path, text string) error { return one.Tree.Write(path, text) }

func (one TreeDisk) Remove(path string) error { return one.Tree.Remove(path) }

// A command line through sh -c in the root on a process runner: what it printed, its exit code, and a fault where its program fails to start. [[spec/design_output/doors#the-process-door]]
func ShellOver(run proc.Runner, root string) Shell {
	return func(line string) (string, int, error) {
		said := run(proc.Command{Argv: []string{"sh", "-c", line}, Dir: root})
		if said.Code == proc.NotStarted {
			return "", 0, errors.New(said.Err)
		}
		return said.Out, said.Code, nil
	}
}
