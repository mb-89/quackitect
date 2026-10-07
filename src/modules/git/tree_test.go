// The work trees the git suite hands FakeRepo: one in memory, one over a
// folder, each standing local so the suite imports no other module.
// [[spec/design_output/doors#the-git-door-carries-writes]]
package git // level0: InPackageTest - the trees the contract suite hands FakeRepo reach its unexported mu and root

import (
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
)

const (
	treeFolderMode = 0o755
	treeFileMode   = 0o644
)

// [[spec/design_output/doors#the-git-door-carries-writes]]
type memoryTree struct {
	mu    sync.Mutex
	files map[string]string
}

func newMemoryTree() *memoryTree { return &memoryTree{files: map[string]string{}} }

func (one *memoryTree) Write(path, text string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	one.files[path] = text
	return nil
}

func (one *memoryTree) Read(path string) (string, bool, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	text, ok := one.files[path]
	return text, ok, nil
}

func (one *memoryTree) Remove(path string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	delete(one.files, path)
	return nil
}

func (one *memoryTree) List(folder string) ([]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	out := []string{}
	for path := range one.files {
		if folder == "" || strings.HasPrefix(path, folder+"/") {
			out = append(out, path)
		}
	}
	sort.Strings(out)
	return out, nil
}

// [[spec/design_output/doors#the-git-door-carries-writes]]
type folderTree struct{ root string }

func (one folderTree) at(path string) string {
	return filepath.Join(one.root, filepath.FromSlash(path))
}

func (one folderTree) Write(path, text string) error {
	if err := os.MkdirAll(filepath.Dir(one.at(path)), treeFolderMode); err != nil {
		return err
	}
	return os.WriteFile(one.at(path), []byte(text), treeFileMode)
}

func (one folderTree) Read(path string) (string, bool, error) {
	body, err := os.ReadFile(one.at(path))
	if errors.Is(err, fs.ErrNotExist) {
		return "", false, nil
	}
	return string(body), err == nil, err
}

func (one folderTree) Remove(path string) error {
	if err := os.Remove(one.at(path)); err != nil && !errors.Is(err, fs.ErrNotExist) {
		return err
	}
	return nil
}

func (one folderTree) List(folder string) ([]string, error) {
	out := []string{}
	err := filepath.WalkDir(one.at(folder), func(at string, entry fs.DirEntry, err error) error {
		if errors.Is(err, fs.ErrNotExist) {
			return fs.SkipAll
		}
		if err != nil || entry.IsDir() {
			return err
		}
		path, err := filepath.Rel(one.root, at)
		out = append(out, filepath.ToSlash(path))
		return err
	})
	sort.Strings(out)
	return out, err
}
