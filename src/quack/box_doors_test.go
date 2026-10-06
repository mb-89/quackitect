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

// The disk contract, one case a member, held by the fake and by the box's own disk under a temp folder. [[spec/tickets/quack-reaches-the-box-through-doors]]
func TestTheFakeDiskKeepsTheContractTheRealDiskKeeps(t *testing.T) {
	t.Parallel()
	disks := map[string]func(t *testing.T) (diskDoors, string){
		"fake": func(*testing.T) (diskDoors, string) { return newFakeDisk(), "/tree" },
		"real": func(t *testing.T) (diskDoors, string) { return realDisk(), t.TempDir() },
	}
	for name, open := range disks {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			for clause, check := range diskContract {
				t.Run(clause, func(t *testing.T) {
					disk, root := open(t)
					if err := disk.makeAll(root, 0o777); err != nil {
						t.Fatal(err)
					}
					check(t, disk, root)
				})
			}
		})
	}
}

// Each member's case, over a disk and a root folder standing empty. [[spec/tickets/quack-reaches-the-box-through-doors]]
var diskContract = map[string]func(t *testing.T, disk diskDoors, root string){
	"write then read answers the text": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "a.txt")
		if err := disk.write(at, []byte("said"), 0o644); err != nil {
			t.Fatal(err)
		}
		if got, err := disk.read(at); err != nil || string(got) != "said" || disk.text(at) != "said" {
			t.Fatalf("read answers %q, %v", got, err)
		}
	},
	"read of no file answers not exist": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "none.txt")
		if _, err := disk.read(at); !errors.Is(err, fs.ErrNotExist) {
			t.Fatalf("read answers %v", err)
		}
		if disk.text(at) != "" || disk.stands(at) {
			t.Fatal("a file standing nowhere reads as one")
		}
	},
	"write into no folder refuses until makeAll makes it": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "deep", "er", "a.txt")
		if err := disk.write(at, []byte("x"), 0o644); err == nil {
			t.Fatal("a write into no folder passes")
		}
		if err := disk.makeAll(filepath.Dir(at), 0o777); err != nil {
			t.Fatal(err)
		}
		if err := disk.makeAll(filepath.Dir(at), 0o777); err != nil {
			t.Fatalf("makeAll over a standing folder answers %v", err)
		}
		if err := disk.write(at, []byte("x"), 0o644); err != nil {
			t.Fatal(err)
		}
	},
	"stat answers the size and the kind": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "a.txt")
		_ = disk.write(at, []byte("four"), 0o644)
		file, err := disk.stat(at)
		if err != nil || file.Size() != 4 || file.IsDir() {
			t.Fatalf("stat answers %v, %v", file, err)
		}
		if folder, err := disk.stat(root); err != nil || !folder.IsDir() {
			t.Fatalf("stat of the folder answers %v, %v", folder, err)
		}
		if _, err := disk.stat(filepath.Join(root, "none")); !errors.Is(err, fs.ErrNotExist) {
			t.Fatalf("stat of nothing answers %v", err)
		}
	},
	"list names each entry by name, a folder as one": func(t *testing.T, disk diskDoors, root string) {
		_ = disk.write(filepath.Join(root, "b.txt"), nil, 0o644)
		_ = disk.makeAll(filepath.Join(root, "a"), 0o777)
		got := []string{}
		for _, one := range disk.listed(root) {
			got = append(got, one.Name()+map[bool]string{true: "/"}[one.IsDir()])
		}
		if !slices.Equal(got, []string{"a/", "b.txt"}) {
			t.Fatalf("list names %v", got)
		}
		if disk.listed(filepath.Join(root, "none")) != nil {
			t.Fatal("a folder standing nowhere lists entries")
		}
	},
	"remove takes a file and refuses a full folder": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "f", "a.txt")
		_ = disk.makeAll(filepath.Dir(at), 0o777)
		_ = disk.write(at, nil, 0o644)
		if err := disk.remove(filepath.Dir(at)); err == nil {
			t.Fatal("remove takes a folder holding a file")
		}
		if err := disk.remove(at); err != nil || disk.stands(at) {
			t.Fatalf("remove answers %v", err)
		}
		if err := disk.remove(at); err == nil {
			t.Fatal("remove of nothing passes")
		}
	},
	"removeAll takes a folder with all it holds": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "f", "g", "a.txt")
		_ = disk.makeAll(filepath.Dir(at), 0o777)
		_ = disk.write(at, nil, 0o644)
		if err := disk.removeAll(filepath.Join(root, "f")); err != nil || disk.stands(filepath.Join(root, "f")) {
			t.Fatalf("removeAll answers %v", err)
		}
		if err := disk.removeAll(filepath.Join(root, "none")); err != nil {
			t.Fatalf("removeAll of nothing answers %v", err)
		}
	},
	"appendTo adds to the end, makes the file, and refuses a missing folder": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "a.jsonl")
		if err := disk.appendTo(at, []byte("one\n")); err != nil {
			t.Fatal(err)
		}
		if err := disk.appendTo(at, []byte("two\n")); err != nil || disk.text(at) != "one\ntwo\n" {
			t.Fatalf("appendTo answers %v, and the file reads %q", err, disk.text(at))
		}
		if err := disk.appendTo(filepath.Join(root, "none", "a.jsonl"), []byte("x")); err == nil {
			t.Fatal("an append into no folder passes")
		}
	},
	"symlink makes a link readlink answers, and readlink refuses a plain file": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "link")
		if err := disk.symlink(filepath.Join(root, "target"), at); err != nil {
			t.Fatal(err)
		}
		if got, err := disk.readlink(at); err != nil || got != filepath.Join(root, "target") {
			t.Fatalf("readlink answers %q, %v", got, err)
		}
		if err := disk.symlink("elsewhere", at); err == nil {
			t.Fatal("a link over a standing link passes")
		}
		_ = disk.write(filepath.Join(root, "plain"), []byte("a"), 0o644)
		if _, err := disk.readlink(filepath.Join(root, "plain")); err == nil {
			t.Fatal("readlink of a plain file passes")
		}
		if _, err := disk.readlink(filepath.Join(root, "none")); !errors.Is(err, fs.ErrNotExist) {
			t.Fatalf("readlink of nothing answers %v", err)
		}
	},
	"makeTemp makes a fresh empty folder under the folder each call": func(t *testing.T, disk diskDoors, root string) {
		one, err := disk.makeTemp(root, "cold-")
		if err != nil {
			t.Fatal(err)
		}
		other, err := disk.makeTemp(root, "cold-")
		if err != nil {
			t.Fatal(err)
		}
		if one == other || !strings.HasPrefix(filepath.Base(one), "cold-") || filepath.Dir(filepath.Clean(one)) != filepath.Clean(root) {
			t.Fatalf("makeTemp answers %q and %q under %q", one, other, root)
		}
		if said, err := disk.stat(one); err != nil || !said.IsDir() || len(disk.listed(one)) != 0 {
			t.Fatalf("the folder %q stands not empty: %v", one, err)
		}
	},
	"rename moves a file and a folder with what it holds": func(t *testing.T, disk diskDoors, root string) {
		_ = disk.makeAll(filepath.Join(root, "f"), 0o777)
		_ = disk.write(filepath.Join(root, "f", "a.txt"), []byte("a"), 0o644)
		if err := disk.rename(filepath.Join(root, "f"), filepath.Join(root, "g")); err != nil {
			t.Fatal(err)
		}
		if disk.stands(filepath.Join(root, "f")) || disk.text(filepath.Join(root, "g", "a.txt")) != "a" {
			t.Fatal("the folder stays where it stood")
		}
		if err := disk.rename(filepath.Join(root, "g", "a.txt"), filepath.Join(root, "b.txt")); err != nil || disk.text(filepath.Join(root, "b.txt")) != "a" {
			t.Fatalf("rename of a file answers %v", err)
		}
		if err := disk.rename(filepath.Join(root, "none"), filepath.Join(root, "c")); err == nil {
			t.Fatal("rename of nothing passes")
		}
	},
}

// The box contract, one case a member past the disk, held by the fake box and by the box itself. [[spec/tickets/quack-reaches-the-box-through-doors]]
func TestTheFakeBoxKeepsTheContractTheRealBoxKeeps(t *testing.T) {
	t.Parallel()
	boxes := map[string]func(t *testing.T) boxDoors{
		"fake": func(t *testing.T) boxDoors { d, _, _, _ := fakeBoxDoors(t); return d },
		"real": func(*testing.T) boxDoors { return quietBox() },
	}
	for name, open := range boxes {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			d := open(t)
			t.Run("environ names each variable as env reads it", func(t *testing.T) {
				pairs := d.environ()
				if len(pairs) == 0 {
					t.Fatal("environ names no variable")
				}
				for key, value := range vehicleEnv(pairs) {
					if got := d.env(key); got != value {
						t.Errorf("environ names %s=%q, and env reads %q", key, value, got)
					}
				}
			})
		})
	}
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
