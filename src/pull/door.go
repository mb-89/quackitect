// The ticket verbs and the pull in Go: the reads every verb shares, the
// writes, and the pull itself, off src/scripts/ticket.js and pull*.js. This
// file holds the disk door and its fake, and no other file reaches outside.
// [[spec/tickets/ticket-verbs-port-to-go]]
package pull

import (
	"os"
	"path/filepath"
	"sort"
)

// The disk under the root, by slashed paths relative to it. [[spec/tickets/ticket-verbs-port-to-go]]
type Disk interface {
	Read(path string) (string, bool)
	Exists(path string) bool
	Files(folder string) []string
	Write(path, text string) error
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

func containsSlash(said string) bool {
	for _, r := range said {
		if r == '/' {
			return true
		}
	}
	return false
}
