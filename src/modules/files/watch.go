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

// The dot folders under the private one the watch adds by name, since a loaded projection reads their JSON files. Each stands alone, and no folder under it joins. [[spec/design_output/model#everything-on-disk-mirrors]]
// .claude/skills/level0/lib/folders.js owns these names, and a module spells them again. [[spec/design_output/model#everything-on-disk-mirrors]]
var named = map[string]bool{".se/.runtime": true, ".se/.runtime/hold": true}

const namedExt = ".json"

// Whether a change at rel reaches the family: a path the walk stands off does not, past a JSON file straight under a named folder. [[spec/design_output/model#everything-on-disk-mirrors]]
func heard(rel string) bool {
	parts := strings.Split(rel, "/")
	for i, part := range parts[:len(parts)-1] {
		if skipped[part] || (i > 0 && parts[i-1] == private && strings.HasPrefix(part, ".")) {
			folder := rel[:strings.LastIndex(rel, "/")]
			return named[folder] && strings.HasSuffix(rel, namedExt)
		}
	}
	return true
}

// Hands each change as a path, its text and the time it changed in nanoseconds, and gone where the file leaves. [[spec/design_output/model#io-modules-and-their-fakes]]
type Watch interface {
	Changes(hand Hand) (stop func(), err error)
}

// [[spec/tickets/tickets-becomes-a-module]]
type Hand func(path, text string, changed int64, gone bool)

type watch struct{ root string }

// The real watch under root. [[spec/design_output/model#its-file-carries-its-fake]]
func NewWatch(root string) Watch { return watch{root} }

func (one watch) Changes(hand Hand) (func(), error) {
	eyes, err := fsnotify.NewWatcher()
	if err != nil {
		return func() {}, err
	}
	if err := one.adds(eyes, one.root); err != nil {
		eyes.Close()
		return func() {}, err
	}
	for folder := range named {
		_ = eyes.Add(filepath.Join(one.root, filepath.FromSlash(folder)))
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

func (one watch) hears(eyes *fsnotify.Watcher, event fsnotify.Event, hand Hand) {
	rel, err := filepath.Rel(one.root, event.Name)
	if err != nil || strings.HasPrefix(rel, "..") {
		return
	}
	rel = filepath.ToSlash(rel)
	if !heard(rel) {
		if named[rel] {
			_ = eyes.Add(event.Name)
		}
		return
	}
	if event.Has(fsnotify.Remove) || event.Has(fsnotify.Rename) {
		hand(rel, "", 0, true)
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
		hand(rel, "", 0, true)
		return
	}
	if err == nil {
		hand(rel, string(body), info.ModTime().UnixNano(), false)
	}
}

// Whether the walk enters a folder: none the watch stands off, and under a dot folder of the private one, a named folder alone. [[spec/tickets/tickets-becomes-a-module]]
func entered(rel string) bool {
	parts := strings.Split(rel, "/")
	for i, part := range parts {
		if skipped[part] {
			return false
		}
		if i > 0 && parts[i-1] == private && strings.HasPrefix(part, ".") {
			return named[rel]
		}
	}
	return true
}

// Hands every file standing under root that a change there reaches, once, so the family holds the tree before its first change. [[spec/tickets/tickets-becomes-a-module]]
func Standing(root string, hand Hand) error {
	return filepath.WalkDir(root, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(root, path)
		rel = filepath.ToSlash(rel)
		if entry.IsDir() {
			if rel != "." && !entered(rel) {
				return filepath.SkipDir
			}
			return nil
		}
		if !entry.Type().IsRegular() || !heard(rel) {
			return nil
		}
		info, err := entry.Info()
		if err != nil {
			return nil
		}
		body, err := os.ReadFile(path)
		if err == nil {
			hand(rel, string(body), info.ModTime().UnixNano(), false)
		}
		return nil
	})
}

// A watch handing the changes a test pushes, or the writes of a FakeDisk it listens on. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeWatch struct {
	mu    sync.Mutex
	hands map[int]Hand
	next  int
}

func NewFakeWatch() *FakeWatch {
	return &FakeWatch{hands: map[int]Hand{}}
}

// [[spec/design_output/model#io-modules-and-their-fakes]]
func NewFakeWatchOver(over *FakeDisk) *FakeWatch {
	one := NewFakeWatch()
	over.Listen(one.Push)
	return one
}

func (one *FakeWatch) Push(path, text string, gone bool) {
	if !heard(path) {
		return
	}
	one.mu.Lock()
	hands := make([]Hand, 0, len(one.hands))
	for _, hand := range one.hands {
		hands = append(hands, hand)
	}
	one.mu.Unlock()
	for _, hand := range hands {
		hand(path, text, 0, gone)
	}
}

func (one *FakeWatch) Changes(hand Hand) (func(), error) {
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
	return from.Changes(func(path, text string, changed int64, gone bool) {
		value := q.Content{}
		if !gone {
			value = ContentOf(text)
			value.Changed = changed
		}
		_ = commit(map[string]any{familyPrefix + path: value})
	})
}

// Commits every file standing under root in one commit, then each change, so a reader of the family meets the tree at start. A change landing during the walk and committing before it loses to the walk's older read, until its next change sets it right. [[spec/tickets/tickets-becomes-a-module]]
func Seeds(root string, from Watch, commit func(values map[string]any) error) (stop func(), err error) {
	standing := map[string]any{}
	err = Standing(root, func(path, text string, changed int64, _ bool) {
		value := ContentOf(text)
		value.Changed = changed
		standing[familyPrefix+path] = value
	})
	if err != nil {
		return func() {}, err
	}
	if err := commit(standing); err != nil {
		return func() {}, err
	}
	return Start(from, commit)
}
