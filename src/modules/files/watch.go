// The watch IO module: it writes each file's text under its out-port family,
// which the wiring binds to files/<path...>.
// [[spec/design_output/model#io-modules-are-modules]]
package files

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/fsnotify/fsnotify"

	"quackitect/src/q"
)

// The out-port family, by its local name. [[spec/design_output/model#the-wiring-file]]
const Family = "files/<path...>"

const familyPrefix = "files/"

// The folders the index walk stands off: git's own, the packages, and the dot folders a tool writes under the private one. [[spec/design_output/index#the-rows-the-walk-writes]]
var skipped = map[string]bool{".git": true, "node_modules": true}

const private = ".se"

// Hands each change as a path and its text, and gone where the file leaves. [[spec/design_output/model#io-modules-and-their-fakes]]
type Watch interface {
	Changes(hand func(path, text string, gone bool)) (stop func(), err error)
}

type watch struct{ root string }

// The real watch under root. [[spec/design_output/model#its-file-carries-its-fake]]
func NewWatch(root string) Watch { return watch{root} }

func (one watch) Changes(hand func(path, text string, gone bool)) (func(), error) {
	eyes, err := fsnotify.NewWatcher()
	if err != nil {
		return func() {}, err
	}
	if err := one.adds(eyes, one.root); err != nil {
		eyes.Close()
		return func() {}, err
	}
	done := make(chan struct{})
	go func() {
		defer close(done)
		for event := range eyes.Events {
			one.hears(eyes, event, hand)
		}
	}()
	return func() {
		eyes.Close()
		<-done
	}, nil
}

// Every folder under root, so a write in a folder below reaches the watch. [[spec/design_output/model#io-modules-and-their-fakes]]
func (one watch) adds(eyes *fsnotify.Watcher, from string) error {
	return filepath.WalkDir(from, func(path string, entry fs.DirEntry, err error) error {
		if err != nil || !entry.IsDir() {
			return err
		}
		if skipped[entry.Name()] || (strings.HasPrefix(entry.Name(), ".") && filepath.Base(filepath.Dir(path)) == private) {
			return filepath.SkipDir
		}
		return eyes.Add(path)
	})
}

func (one watch) hears(eyes *fsnotify.Watcher, event fsnotify.Event, hand func(path, text string, gone bool)) {
	rel, err := filepath.Rel(one.root, event.Name)
	if err != nil || strings.HasPrefix(rel, "..") {
		return
	}
	rel = filepath.ToSlash(rel)
	if event.Has(fsnotify.Remove) || event.Has(fsnotify.Rename) {
		hand(rel, "", true)
		return
	}
	info, err := os.Stat(event.Name)
	if err != nil {
		return
	}
	if info.IsDir() {
		_ = one.adds(eyes, event.Name)
		return
	}
	body, err := os.ReadFile(event.Name)
	if errors.Is(err, fs.ErrNotExist) {
		hand(rel, "", true)
		return
	}
	if err == nil {
		hand(rel, string(body), false)
	}
}

// A watch handing the changes a test pushes, or the writes of a FakeDisk it listens on. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeWatch struct {
	mu    sync.Mutex
	hands map[int]func(path, text string, gone bool)
	next  int
}

func NewFakeWatch() *FakeWatch {
	return &FakeWatch{hands: map[int]func(path, text string, gone bool){}}
}

// [[spec/design_output/model#io-modules-and-their-fakes]]
func NewFakeWatchOver(over *FakeDisk) *FakeWatch {
	one := NewFakeWatch()
	over.Listen(one.Push)
	return one
}

func (one *FakeWatch) Push(path, text string, gone bool) {
	one.mu.Lock()
	hands := make([]func(path, text string, gone bool), 0, len(one.hands))
	for _, hand := range one.hands {
		hands = append(hands, hand)
	}
	one.mu.Unlock()
	for _, hand := range hands {
		hand(path, text, gone)
	}
}

func (one *FakeWatch) Changes(hand func(path, text string, gone bool)) (func(), error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	at := one.next
	one.next++
	one.hands[at] = hand
	return func() {
		one.mu.Lock()
		defer one.mu.Unlock()
		delete(one.hands, at)
	}, nil
}

// [[spec/design_output/model#io-modules-are-modules]]
func Registers(c *q.Catalog) q.Writer {
	return q.GivenIn(c, Family, q.Content{}, q.Doc("the hash and the text of a tracked file"), q.IO())
}

// The value a file's text takes, hashed the way the index hashes a file. [[spec/design_output/model#io-modules-are-modules]]
func ContentOf(text string) q.Content {
	sum := sha256.Sum256([]byte(text))
	return q.Content{Hash: hex.EncodeToString(sum[:]), Text: text}
}

// Commits each change the watch hands, under the family's local name. A change the store refuses reaches failed. [[spec/design_output/model#io-modules-are-modules]]
func Start(from Watch, commit func(values map[string]any) error) (stop func(), err error) {
	return from.Changes(func(path, text string, gone bool) {
		value := q.Content{}
		if !gone {
			value = ContentOf(text)
		}
		_ = commit(map[string]any{familyPrefix + path: value})
	})
}
