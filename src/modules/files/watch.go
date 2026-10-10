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
	"quackitect/src/watcher"
)

// The out-port family, by its local name. [[spec/design_output/model#the-wiring-file]]
const Family = "files/<path...>"

const familyPrefix = "files/"

// The folders the index walk stands off: git's own, the packages, and the dot folders a tool writes under the private one. [[spec/design_output/index#the-rows-the-walk-writes]]
var skipped = map[string]bool{".git": true, "node_modules": true}

const private = ".se"

// The text bytes one seed commit carries at most: JSON escapes swell a text, and the bus caps a message at 64 MiB. [[spec/tickets/seed-splits-under-bus-cap]]
const seedBatch = 8 << 20

// The dot folders under the private one the watch adds by name, each with the extension of the files a module reads there: a loaded projection's JSON, and the session log's lines. Each stands alone, and no folder under it joins. [[spec/tickets/the-log-topic-lands]]
// src/modules/check/folders.go owns these names, and a module spells them again. [[spec/design_output/model#everything-on-disk-mirrors]]
var named = map[string]string{".se/.runtime": ".json", ".se/.runtime/hold": ".json", ".se/.log": ".jsonl"}

// Whether a body reads as text: a built program or an image holds a NUL byte, and no text file does. A binary file reaches no rule, reader or search, and its bytes swell a seed past the bus cap. [[spec/tickets/sweep-reads-tracked-after-restart]]
func textual(body string) bool { return !strings.Contains(body, "\x00") }

// Whether a change at rel reaches the family: a path the walk stands off does not, past a file carrying its folder's extension straight under a named folder. [[spec/design_output/model#everything-on-disk-mirrors]]
func heard(rel string) bool {
	parts := strings.Split(rel, "/")
	for i, part := range parts[:len(parts)-1] {
		if skipped[part] || (i > 0 && parts[i-1] == private && strings.HasPrefix(part, ".")) {
			folder := rel[:strings.LastIndex(rel, "/")]
			ext, ok := named[folder]
			return ok && strings.HasSuffix(rel, ext)
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

// What a folder joins the watch through: the watcher, or a case's record. [[spec/tickets/watch-hands-new-folders]]
type adder interface{ Add(path string) error }

// What the real watch holds while it runs: the paths heard with bytes, and every file it meets. The start's walk and the watcher's loop both reach it. [[spec/tickets/watch-hands-new-folders]]
type held struct {
	mu    sync.Mutex
	known map[string]bool
	seen  map[string]bool
}

func newHeld() *held { return &held{known: map[string]bool{}, seen: map[string]bool{}} }

func (one watch) Changes(hand Hand) (func(), error) {
	// The watcher's loop adds a folder while a stop runs, and its Close returns. [[spec/tickets/a-watch-stops-mid-add]]
	state := newHeld()
	eyes, err := watcher.New(func(eyes *watcher.Watcher, event fsnotify.Event) {
		one.hears(eyes, event, hand, state)
	})
	if err != nil {
		return func() {}, err
	}
	// The watcher's loop hears while the start walk runs, so the walk holds the lock hears holds. [[spec/tickets/watch-hands-new-folders]]
	state.mu.Lock()
	err = one.adds(eyes, one.root, state, nil)
	state.mu.Unlock()
	if err != nil {
		eyes.Close()
		return func() {}, err
	}
	return func() { eyes.Close() }, nil
}

// A folder the walk or the watcher refuses under from costs itself alone. [[spec/tickets/seed-survives-bad-files]]
// Every folder under from the walk enters joins the watch, a named folder among them, and every heard file joins the record; with a hand, each file's text is handed too. The caller holds the lock. [[spec/tickets/watch-hands-new-folders]]
func (one watch) adds(eyes adder, from string, state *held, hand Hand) error {
	return filepath.WalkDir(from, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return walkPast(from, path, err)
		}
		rel, _ := filepath.Rel(one.root, path)
		rel = filepath.ToSlash(rel)
		if entry.IsDir() {
			if rel != "." && !entered(rel) {
				return filepath.SkipDir
			}
			return walkPast(from, path, eyes.Add(path))
		}
		if !entry.Type().IsRegular() || !heard(rel) {
			return nil
		}
		state.seen[rel] = true
		if info, err := entry.Info(); err == nil && hand != nil {
			state.reads(path, rel, info, hand)
		}
		return nil
	})
}

func (one watch) hears(eyes adder, event fsnotify.Event, hand Hand, state *held) {
	state.mu.Lock()
	defer state.mu.Unlock()
	rel, err := filepath.Rel(one.root, event.Name)
	if err != nil || strings.HasPrefix(rel, "..") {
		return
	}
	rel = filepath.ToSlash(rel)
	if !heard(rel) {
		if named[rel] != "" {
			_ = one.adds(eyes, event.Name, state, hand)
		}
		return
	}
	if event.Has(fsnotify.Remove) || event.Has(fsnotify.Rename) {
		state.leaves(rel, hand)
		return
	}
	info, err := os.Stat(event.Name)
	if err != nil {
		return
	}
	if info.IsDir() {
		_ = one.adds(eyes, event.Name, state, hand)
		return
	}
	state.seen[rel] = true
	state.reads(event.Name, rel, info, hand)
}

// Hands a heard file's text, and gone where it no longer stands. The caller holds the lock. [[spec/tickets/watch-hands-new-folders]]
func (state *held) reads(path, rel string, info fs.FileInfo, hand Hand) {
	body, err := os.ReadFile(path)
	if errors.Is(err, fs.ErrNotExist) {
		state.leaves(rel, hand)
		return
	}
	// A read lands before its writer's bytes, and the write that follows brings them. [[spec/tickets/sweep-reads-tracked-after-restart]]
	if err != nil || (len(body) == 0 && !state.known[rel]) {
		return
	}
	state.known[rel] = textual(string(body))
	if state.known[rel] {
		hand(rel, string(body), info.ModTime().UnixNano(), false)
	}
}

// Hands gone for rel and for every recorded file under rel plus a slash, so a folder moved out leaves no ghost and a sibling sharing its prefix stays. The caller holds the lock. [[spec/tickets/watch-hands-new-folders]]
func (state *held) leaves(rel string, hand Hand) {
	delete(state.known, rel)
	delete(state.seen, rel)
	hand(rel, "", 0, true)
	for path := range state.seen {
		if strings.HasPrefix(path, rel+"/") {
			delete(state.known, path)
			delete(state.seen, path)
			hand(path, "", 0, true)
		}
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
			return named[rel] != ""
		}
	}
	return true
}

// Hands every file standing under root that a change there reaches, once, so the family holds the tree before its first change. [[spec/tickets/tickets-becomes-a-module]]
func Standing(root string, hand Hand) error {
	return filepath.WalkDir(root, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return walkPast(root, path, err)
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
		if err == nil && textual(string(body)) {
			hand(rel, string(body), info.ModTime().UnixNano(), false)
		}
		return nil
	})
}

// What a walk does past a path it cannot read: an error at the root ends it, and one under the root costs that path alone. [[spec/tickets/seed-survives-bad-files]]
func walkPast(root, at string, err error) error {
	if at == root {
		return err
	}
	return nil
}

// A watch handing the changes a test pushes, or the writes of a FakeDisk it listens on. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeWatch struct {
	mu    sync.Mutex
	hands map[int]Hand
	next  int
	// The paths heard with bytes, so a new empty file stays unheard as the real watch leaves it. [[spec/tickets/sweep-reads-tracked-after-restart]]
	known map[string]bool
}

func NewFakeWatch() *FakeWatch {
	return &FakeWatch{hands: map[int]Hand{}, known: map[string]bool{}}
}

// [[spec/design_output/model#io-modules-and-their-fakes]]
func NewFakeWatchOver(over *FakeDisk) *FakeWatch {
	one := NewFakeWatch()
	over.Listen(one.Push)
	return one
}

func (one *FakeWatch) Push(path, text string, gone bool) {
	if !heard(path) || (!gone && !textual(text)) {
		return
	}
	one.mu.Lock()
	if !gone && text == "" && !one.known[path] {
		one.mu.Unlock()
		return
	}
	one.known[path] = !gone
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
	return q.OutIn(c, Family, q.Content{}, q.Doc("the hash and the text of a tracked file"), q.IO())
}

// The value a file's text takes, hashed the way the index hashes a file. [[spec/design_output/model#io-modules-are-modules]]
func ContentOf(text string) q.Content {
	sum := sha256.Sum256([]byte(text))
	return q.Content{Hash: hex.EncodeToString(sum[:]), Text: text}
}

// Commits each change the watch hands, under the family's local name. A change the store refuses reaches failed. [[spec/design_output/model#io-modules-are-modules]]
func Start(from Watch, commit func(values map[string]any) error) (stop func(), err error) {
	return from.Changes(func(path, text string, changed int64, gone bool) {
		commitsHeard(commit, path, text, changed, gone)
	})
}

// Commits one heard change under the family's local name, so Start and the seed's drain give a change the same value. [[spec/tickets/watch-opens-before-the-seed]]
func commitsHeard(commit func(values map[string]any) error, path, text string, changed int64, gone bool) {
	value := q.Content{}
	if !gone {
		value = ContentOf(text)
		value.Changed = changed
	}
	_ = commit(map[string]any{familyPrefix + path: value})
}

// Commits every file standing under root in one commit, then each change, so a reader of the family meets the tree at start. [[spec/tickets/tickets-becomes-a-module]]
func Seeds(root string, from Watch, commit func(values map[string]any) error) (stop func(), err error) {
	return seedsIn(root, from, commit, seedBatch)
}

// The seed in commits of at most most text bytes each, the last one landing whatever stands, so one message stays under the bus cap. [[spec/tickets/seed-splits-under-bus-cap]]
// The watch opens before the walk and holds each change it hears, and the seed's last commit drains them in order, so a change during the walk lands after it. [[spec/tickets/watch-opens-before-the-seed]]
func seedsIn(root string, from Watch, commit func(values map[string]any) error, most int) (stop func(), err error) {
	var mu sync.Mutex
	live, waiting := false, []func(){}
	stop, err = from.Changes(func(path, text string, changed int64, gone bool) {
		mu.Lock()
		if !live {
			waiting = append(waiting, func() { commitsHeard(commit, path, text, changed, gone) })
			mu.Unlock()
			return
		}
		mu.Unlock()
		commitsHeard(commit, path, text, changed, gone)
	})
	if err != nil {
		return func() {}, err
	}
	batch, size := map[string]any{}, 0
	err = Standing(root, func(path, text string, changed int64, _ bool) {
		if size > 0 && size+len(text) > most {
			landEach(commit, batch)
			batch, size = map[string]any{}, 0
		}
		value := ContentOf(text)
		value.Changed = changed
		batch[familyPrefix+path], size = value, size+len(text)
	})
	if err != nil {
		stop()
		return func() {}, err
	}
	landEach(commit, batch)
	// The drain commits outside the lock, and sets live on the read finding the list empty, so no change slips between. [[spec/tickets/watch-opens-before-the-seed]]
	for {
		mu.Lock()
		if len(waiting) == 0 {
			live = true
			mu.Unlock()
			return stop, nil
		}
		next := waiting
		waiting = nil
		mu.Unlock()
		for _, one := range next {
			one()
		}
	}
}

// Commits a batch, and where the commit refuses it, each file alone, so a file refused alone drops out of the seed and the rest land. [[spec/tickets/seed-survives-bad-files]]
func landEach(commit func(values map[string]any) error, batch map[string]any) {
	if commit(batch) == nil {
		return
	}
	for path, value := range batch {
		_ = commit(map[string]any{path: value})
	}
}
