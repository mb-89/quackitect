// The fake doors the box verbs run over in a test: a temporary tree, a PATH
// of empty programs, a runner recording each run, and a GET that answers
// nothing. [[spec/tickets/box-verbs-no-node-test]]
package main

import (
	"errors"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"slices"
	"strconv"
	"strings"
	"sync"
	"testing"
	"testing/fstest"
	"time"
)

// A disk in memory, which keeps what it writes and moves under slash paths. [[spec/tickets/quack-reaches-the-box-through-doors]]
type fakeDisk struct {
	mu    sync.Mutex
	files fstest.MapFS
	made  int
}

// The fake disk as the hand a verb takes. [[spec/tickets/quack-reaches-the-box-through-doors]]
func newFakeDisk() diskDoors {
	f := &fakeDisk{files: fstest.MapFS{}}
	return diskDoors{read: f.read, write: f.write, stat: f.stat, list: f.list, makeAll: f.makeAll, remove: f.remove, removeAll: f.removeAll, rename: f.rename, appendTo: f.appendTo, readlink: f.readlink, symlink: f.symlink, makeTemp: f.makeTemp}
}

func fakeKey(at string) string {
	key := strings.TrimPrefix(path.Clean(filepath.ToSlash(at)), "/")
	if key == "" {
		return "."
	}
	return key
}

func (f *fakeDisk) folder(key string) bool {
	said, err := fs.Stat(f.files, key)
	return err == nil && said.IsDir()
}

func (f *fakeDisk) read(at string) ([]byte, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return fs.ReadFile(f.files, fakeKey(at))
}

func (f *fakeDisk) write(at string, data []byte, perm fs.FileMode) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	key := fakeKey(at)
	if !f.folder(path.Dir(key)) || f.folder(key) {
		return &fs.PathError{Op: "open", Path: at, Err: fs.ErrNotExist}
	}
	f.files[key] = &fstest.MapFile{Data: slices.Clone(data), Mode: perm, ModTime: time.Unix(0, 0)}
	return nil
}

func (f *fakeDisk) appendTo(at string, data []byte) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	key := fakeKey(at)
	if !f.folder(path.Dir(key)) || f.folder(key) {
		return &fs.PathError{Op: "open", Path: at, Err: fs.ErrNotExist}
	}
	was := []byte{}
	if held, ok := f.files[key]; ok {
		was = held.Data
	}
	f.files[key] = &fstest.MapFile{Data: append(slices.Clone(was), data...), Mode: appendedMode, ModTime: time.Unix(0, 0)}
	return nil
}

func (f *fakeDisk) symlink(target, at string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	key := fakeKey(at)
	if !f.folder(path.Dir(key)) {
		return &os.LinkError{Op: "symlink", Old: target, New: at, Err: fs.ErrNotExist}
	}
	if _, err := fs.Stat(f.files, key); err == nil {
		return &os.LinkError{Op: "symlink", Old: target, New: at, Err: fs.ErrExist}
	}
	f.files[key] = &fstest.MapFile{Data: []byte(target), Mode: fs.ModeSymlink | 0o777, ModTime: time.Unix(0, 0)}
	return nil
}

func (f *fakeDisk) readlink(at string) (string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	held, ok := f.files[fakeKey(at)]
	if !ok {
		return "", &fs.PathError{Op: "readlink", Path: at, Err: fs.ErrNotExist}
	}
	if held.Mode&fs.ModeSymlink == 0 {
		return "", &fs.PathError{Op: "readlink", Path: at, Err: fs.ErrInvalid}
	}
	return string(held.Data), nil
}

func (f *fakeDisk) makeTemp(dir, pattern string) (string, error) {
	if dir == "" {
		dir = "/tmp"
	}
	f.mu.Lock()
	f.made++
	at := path.Join(filepath.ToSlash(dir), pattern+strconv.Itoa(f.made))
	f.mu.Unlock()
	return at, f.makeAll(at, 0o700)
}

func (f *fakeDisk) stat(at string) (fs.FileInfo, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return fs.Stat(f.files, fakeKey(at))
}

func (f *fakeDisk) list(at string) ([]fs.DirEntry, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return fs.ReadDir(f.files, fakeKey(at))
}

func (f *fakeDisk) makeAll(at string, perm fs.FileMode) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	key := fakeKey(at)
	for up := key; up != "."; up = path.Dir(up) {
		if said, err := fs.Stat(f.files, up); err == nil && !said.IsDir() {
			return &fs.PathError{Op: "mkdir", Path: at, Err: fs.ErrExist}
		}
	}
	if !f.folder(key) {
		f.files[key] = &fstest.MapFile{Mode: fs.ModeDir | perm}
	}
	return nil
}

// The keys a path holds: itself, and everything under it. [[spec/tickets/quack-reaches-the-box-through-doors]]
func (f *fakeDisk) under(key string) []string {
	out := []string{}
	for one := range f.files {
		if one == key || strings.HasPrefix(one, key+"/") {
			out = append(out, one)
		}
	}
	return out
}

func (f *fakeDisk) remove(at string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	key := fakeKey(at)
	if _, err := fs.Stat(f.files, key); err != nil {
		return &fs.PathError{Op: "remove", Path: at, Err: fs.ErrNotExist}
	}
	if held := f.under(key); len(held) > 1 || (len(held) == 1 && held[0] != key) {
		return &fs.PathError{Op: "remove", Path: at, Err: fs.ErrExist}
	}
	delete(f.files, key)
	return nil
}

func (f *fakeDisk) removeAll(at string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	for _, one := range f.under(fakeKey(at)) {
		delete(f.files, one)
	}
	return nil
}

func (f *fakeDisk) rename(from, to string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	was, now := fakeKey(from), fakeKey(to)
	if _, err := fs.Stat(f.files, was); err != nil {
		return &os.LinkError{Op: "rename", Old: from, New: to, Err: fs.ErrNotExist}
	}
	if !f.folder(path.Dir(now)) {
		return &os.LinkError{Op: "rename", Old: from, New: to, Err: fs.ErrNotExist}
	}
	if len(f.under(now)) > 1 {
		return &os.LinkError{Op: "rename", Old: from, New: to, Err: fs.ErrExist}
	}
	if !f.folder(was) {
		delete(f.files, now)
	}
	for _, one := range f.under(was) {
		f.files[now+strings.TrimPrefix(one, was)] = f.files[one]
		delete(f.files, one)
	}
	return nil
}

// A move into a folder standing already names the code node gives it. [[spec/guidance/retro/collect]]
func TestADiskErrorNamesItsCodeAsNodeDoes(t *testing.T) {
	t.Parallel()
	if got := diskCode(diskTaken("a", "b")); got != "EEXIST" {
		t.Fatalf("diskCode answers %q", got)
	}
	if got := diskCode(errors.New("plain")); got != "" {
		t.Fatalf("a plain error names %q", got)
	}
}

// A runner recording each run, answering off a script keyed by the program's base name and its first word. [[spec/tickets/box-verbs-no-node-test]]
type fakeRunner struct {
	mu      sync.Mutex
	ran     [][]string
	opts    []runOpts
	answers map[string]ranResult
}

func (f *fakeRunner) run(argv []string, o runOpts) ranResult {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.ran = append(f.ran, argv)
	f.opts = append(f.opts, o)
	key := filepath.Base(argv[0])
	if len(argv) > 1 {
		if said, ok := f.answers[key+" "+argv[1]]; ok {
			return said
		}
	}
	if said, ok := f.answers[key]; ok {
		return said
	}
	return ranResult{stdout: key + " 1.2.3\n"}
}

// The fake doors over the box's own disk under a temporary tree, for the verbs that read the tree through stands and readText as well as through the hand. [[spec/tickets/quack-reaches-the-box-through-doors]]
func boxDoorsOnDisk(t *testing.T, programs ...string) (boxDoors, *fakeRunner, *strings.Builder, *strings.Builder) {
	t.Helper()
	d, runner, out, errs := fakeBoxDoors(t, programs...)
	d.disk = realDisk()
	return d, runner, out, errs
}

// The fake doors over a temporary tree, with the named programs standing on its PATH. [[spec/tickets/box-verbs-no-node-test]]
func fakeBoxDoors(t *testing.T, programs ...string) (boxDoors, *fakeRunner, *strings.Builder, *strings.Builder) {
	t.Helper()
	root := t.TempDir()
	path := filepath.Join(root, "path")
	if err := os.MkdirAll(path, 0o755); err != nil {
		t.Fatal(err)
	}
	for _, one := range programs {
		if err := os.WriteFile(filepath.Join(path, one), nil, 0o755); err != nil {
			t.Fatal(err)
		}
	}
	env := map[string]string{"PATH": path}
	// A Windows box names PATHEXT, which splits its PATH on semicolons, so a drive letter stays whole. [[spec/design_output/tools#reading-the-path-variable]]
	if runtime.GOOS == "windows" {
		env["PATHEXT"] = ".EXE"
	}
	runner := &fakeRunner{answers: map[string]ranResult{}}
	var out, errs strings.Builder
	return boxDoors{
		root: root,
		env:  func(key string) string { return env[key] },
		environ: func() []string {
			out := []string{}
			for key, value := range env {
				out = append(out, key+"="+value)
			}
			return out
		},
		goos: "linux",
		pid:  7,
		run:  runner.run,
		get:  func(string, time.Duration) (string, error) { return "", errors.New("no wire here") },
		now:  func() time.Time { return time.Unix(0, 0) },
		disk: newFakeDisk(),
		out:  &out,
		errs: &errs,
	}, runner, &out, &errs
}
