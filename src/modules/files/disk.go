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

func (one disk) Remove(path string) error {
	if err := os.Remove(one.at(path)); err != nil && !errors.Is(err, fs.ErrNotExist) {
		return err
	}
	return nil
}

// A disk in memory, keyed by the forward-slash path, which tells its listeners each change. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeDisk struct {
	mu    sync.Mutex
	files map[string]string
	hands []func(path, text string, gone bool)
}

func NewFakeDisk() *FakeDisk { return &FakeDisk{files: map[string]string{}} }

func (one *FakeDisk) Write(path, text string) error {
	one.mu.Lock()
	one.files[path] = text
	hands := one.hands
	one.mu.Unlock()
	for _, hand := range hands {
		hand(path, text, false)
	}
	return nil
}

func (one *FakeDisk) Read(path string) (string, bool, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	text, ok := one.files[path]
	return text, ok, nil
}

func (one *FakeDisk) Remove(path string) error {
	one.mu.Lock()
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
