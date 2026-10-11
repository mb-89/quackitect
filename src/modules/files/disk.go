// The disk IO module: it accepts the requests to write and to remove a file.
// Its file carries the interface, the real disk and the fake.
// [[spec/design_output/model#its-file-carries-its-fake]]
package files

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"quackitect/src/q"
)

// The module name a request to the disk carries. [[spec/design_output/model#an-action-lists-requests]]
const DiskModule = "disk"

const (
	folderMode = 0o755
	fileMode   = 0o644
)

// The arguments of the request disk.write. Read carries the hash of the file its writer read, and stays empty where the writer met no file. [[spec/design_output/model#everything-on-disk-mirrors]]
type Write struct {
	Path string
	Text string
	Read string
}

// The verbs the disk module takes, over forward-slash paths. [[spec/design_output/model#io-modules-and-their-fakes]]
type Disk interface {
	Write(path, text string) error
	Read(path string) (string, bool, error)
	Remove(path string) error
	List(folder string) ([]string, error)
	Link(path, to string) error
}

type disk struct{ root string }

// The real disk under root. [[spec/design_output/model#its-file-carries-its-fake]]
func NewDisk(root string) Disk { return disk{root} }

func (one disk) at(path string) string { return filepath.Join(one.root, filepath.FromSlash(path)) }

func (one disk) Write(path, text string) error {
	if err := os.MkdirAll(filepath.Dir(one.at(path)), folderMode); err != nil {
		return err
	}
	return os.WriteFile(one.at(path), []byte(text), fileMode)
}

func (one disk) Read(path string) (string, bool, error) {
	body, err := os.ReadFile(one.at(path))
	if errors.Is(err, fs.ErrNotExist) {
		return "", false, nil
	}
	return string(body), err == nil, err
}

// Every file under the folder at any depth, by its slashed path from the root, sorted. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one disk) List(folder string) ([]string, error) {
	out := []string{}
	top := one.at(folder)
	err := filepath.WalkDir(top, func(at string, entry fs.DirEntry, err error) error {
		if errors.Is(err, fs.ErrNotExist) {
			return gone(top, at)
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

// What the walk does past a path gone before its read. [[spec/tickets/disk-list-skips-gone-folders]]
func gone(top, at string) error {
	if at == top {
		return fs.SkipAll
	}
	return nil
}

func (one disk) Remove(path string) error {
	if err := os.Remove(one.at(path)); err != nil && !errors.Is(err, fs.ErrNotExist) {
		return err
	}
	return nil
}

// The path to standing as an alias of path, a file or a folder, so a read under to reads path. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one disk) Link(path, to string) error {
	if err := os.MkdirAll(filepath.Dir(one.at(to)), folderMode); err != nil {
		return err
	}
	target, err := filepath.Abs(one.at(path))
	if err != nil {
		return err
	}
	return os.Symlink(target, one.at(to))
}

// A disk in memory, keyed by the forward-slash path, which tells its listeners each change. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeDisk struct {
	mu    sync.Mutex
	files map[string]string
	links map[string]string
	hands []func(path, text string, gone bool)
}

func NewFakeDisk() *FakeDisk {
	return &FakeDisk{files: map[string]string{}, links: map[string]string{}}
}

// The path a link stands in for, followed through every link on the way. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *FakeDisk) target(path string) string {
	for to, from := range one.links {
		if rest, ok := strings.CutPrefix(path, to); ok && (rest == "" || strings.HasPrefix(rest, "/")) {
			return one.target(from + rest)
		}
	}
	return path
}

func (one *FakeDisk) Write(path, text string) error {
	one.mu.Lock()
	path = one.target(path)
	if err := one.blocked(path); err != nil {
		one.mu.Unlock()
		return err
	}
	one.files[path] = text
	hands := one.hands
	one.mu.Unlock()
	for _, hand := range hands {
		hand(path, text, false)
	}
	return nil
}

// Refuses a write whose folder a file holds, or onto a folder. [[spec/design_output/doors#a-fake-behaves]]
func (one *FakeDisk) blocked(path string) error {
	for at := path; strings.Contains(at, "/"); {
		at = at[:strings.LastIndex(at, "/")]
		if _, held := one.files[at]; held {
			return fmt.Errorf("mkdir %s: not a directory", at)
		}
	}
	for held := range one.files {
		if strings.HasPrefix(held, path+"/") {
			return fmt.Errorf("open %s: is a directory", path)
		}
	}
	return nil
}

func (one *FakeDisk) Read(path string) (string, bool, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	text, ok := one.files[one.target(path)]
	return text, ok, nil
}

// [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeDisk) List(folder string) ([]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	out := []string{}
	for path := range one.links {
		if folder == "" || strings.HasPrefix(path, folder+"/") {
			out = append(out, path)
		}
	}
	for path := range one.files {
		if folder == "" || strings.HasPrefix(path, folder+"/") {
			out = append(out, path)
		}
	}
	sort.Strings(out)
	return out, nil
}

func (one *FakeDisk) Remove(path string) error {
	one.mu.Lock()
	if _, link := one.links[path]; link {
		delete(one.links, path)
		one.mu.Unlock()
		return nil
	}
	path = one.target(path)
	_, held := one.files[path]
	delete(one.files, path)
	hands := one.hands
	one.mu.Unlock()
	if held {
		for _, hand := range hands {
			hand(path, "", true)
		}
	}
	return nil
}

// A link the fake keeps as an alias, which a read and a write under it follow, and a remove of it drops alone. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *FakeDisk) Link(path, to string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	if _, held := one.links[to]; held {
		return fmt.Errorf("symlink %s %s: file exists", path, to)
	}
	if _, held := one.files[to]; held {
		return fmt.Errorf("symlink %s %s: file exists", path, to)
	}
	one.links[to] = path
	return nil
}

// [[spec/design_output/model#io-modules-and-their-fakes]]
func (one *FakeDisk) Listen(hand func(path, text string, gone bool)) {
	one.mu.Lock()
	defer one.mu.Unlock()
	one.hands = append(one.hands, hand)
}

// Answers the requests addressed to disk. [[spec/design_output/model#an-action-lists-requests]]
func Accept(to Disk) func(q.Request) (any, error) {
	return func(one q.Request) (any, error) {
		if one.Module != DiskModule {
			return nil, fmt.Errorf("the disk takes no request to %s", one.Module)
		}
		switch args := one.Args.(type) {
		case Write:
			if one.Verb == "write" {
				if err := current(to, args); err != nil {
					return nil, err
				}
				return nil, to.Write(args.Path, args.Text)
			}
		case string:
			if one.Verb == "remove" {
				return nil, to.Remove(args)
			}
		}
		return nil, fmt.Errorf("the disk takes no %s over a %T", one.Verb, one.Args)
	}
}

// A write goes back one way: it lands where the file still stands at the revision its writer read. [[spec/design_output/model#everything-on-disk-mirrors]]
func current(to Disk, args Write) error {
	text, held, err := to.Read(args.Path)
	if err != nil {
		return err
	}
	now := ""
	if held {
		now = ContentOf(text).Hash
	}
	if now != args.Read {
		return fmt.Errorf("%s moves since its writer read it, so the write stands refused", args.Path)
	}
	return nil
}
