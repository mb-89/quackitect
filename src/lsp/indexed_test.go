// The tree off the index: a pull names what moved, the tree reads the pull
// and nothing else, a door answering nothing stops the server, and the binary
// holds no second road to a file of the tree.
// [[spec/design_output/lsp#the-server-reads-the-index]]
package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"
)

// A door in memory: its files, the tick a sweep moves, and every method a case asks. [[spec/design_output/index#a-reader-takes-the-tree]]
type fakeIndex struct {
	guard sync.Mutex
	files map[string]fakeFile
	tick  int64
	wake  chan struct{}
	asked []string
}

type fakeFile struct {
	text    string
	tracked bool
}

func newFakeIndex(texts map[string]string) *fakeIndex {
	one := &fakeIndex{files: map[string]fakeFile{}, tick: 1, wake: make(chan struct{})}
	for path, text := range texts {
		one.files[path] = fakeFile{text: text, tracked: true}
	}
	return one
}

// A sweep landing a write, which moves the tick and wakes every waiting call. [[spec/design_output/index#the-index-fires-on-change]]
func (one *fakeIndex) lands(change func()) {
	one.guard.Lock()
	change()
	one.tick++
	close(one.wake)
	one.wake = make(chan struct{})
	one.guard.Unlock()
}

func (one *fakeIndex) writes(path, text string) {
	one.lands(func() { one.files[path] = fakeFile{text: text, tracked: true} })
}

func (one *fakeIndex) ask(method string, params any) (json.RawMessage, error) {
	one.guard.Lock()
	one.asked = append(one.asked, method)
	one.guard.Unlock()
	switch method {
	case "reindex":
		return json.Marshal(map[string]int{"files": len(one.files)})
	case "files":
		one.guard.Lock()
		defer one.guard.Unlock()
		out := []map[string]any{}
		for path, held := range one.files {
			sum := sha256.Sum256([]byte(held.text))
			out = append(out, map[string]any{"path": path, "hash": hex.EncodeToString(sum[:]), "tracked": held.tracked})
		}
		return json.Marshal(out)
	case "texts":
		one.guard.Lock()
		defer one.guard.Unlock()
		out := map[string]string{}
		named, _ := params.(map[string]any)
		paths, _ := named["paths"].([]string)
		for path, held := range one.files {
			if len(paths) == 0 || contains(paths, path) {
				out[path] = held.text
			}
		}
		return json.Marshal(out)
	case "changes":
		since := params.(map[string]any)["since"].(int64)
		for {
			one.guard.Lock()
			tick, wake := one.tick, one.wake
			one.guard.Unlock()
			if tick > since {
				return json.Marshal(map[string]int64{"tick": tick})
			}
			select {
			case <-wake:
			case <-time.After(2 * time.Second):
				return json.Marshal(map[string]int64{"tick": since})
			}
		}
	}
	return nil, fmt.Errorf("no method called %s", method)
}

func contains(paths []string, path string) bool {
	for _, one := range paths {
		if one == path {
			return true
		}
	}
	return false
}

func TestAPullNamesWhatMovedAndWhatWentAndAsksTheirTextsAlone(t *testing.T) {
	door := newFakeIndex(map[string]string{"spec/a.md": "a\n", "spec/b.md": "b\n", "spec/c.md": "c\n"})
	door.files[".se/.log/session.jsonl"] = fakeFile{text: "{}\n"}
	disk, err := overIndex("/tree", door.ask, false)
	if err != nil {
		t.Fatal(err)
	}

	door.lands(func() {
		door.files["spec/a.md"] = fakeFile{text: "a again\n", tracked: true}
		delete(door.files, "spec/b.md")
		door.files[".se/.log/session.jsonl"] = fakeFile{text: "{}\n{}\n"}
	})
	door.asked = nil
	moved, gone, err := disk.pulls()
	if err != nil {
		t.Fatal(err)
	}
	if fmt.Sprint(moved) != "[spec/a.md]" || fmt.Sprint(gone) != "[spec/b.md]" {
		t.Fatalf("the pull moves %v and drops %v, and an untracked file moves nothing", moved, gone)
	}
	if said, _ := disk.ReadFile("/tree/spec/a.md"); string(said) != "a again\n" {
		t.Fatalf("the moved file reads %q", said)
	}
	if said, _ := disk.ReadFile("/tree/.se/.log/session.jsonl"); string(said) != "{}\n{}\n" {
		t.Fatalf("an untracked file still takes its new text, and it reads %q", said)
	}
	if fmt.Sprint(door.asked) != "[files texts]" {
		t.Fatalf("a pull asks the list, then the texts that moved, and it asks %v", door.asked)
	}
}

func TestTheTreeReadsWhatTheIndexHolds(t *testing.T) {
	door := newFakeIndex(map[string]string{
		"spec/guidance/voice.md": "# Voice\n",
		"spec/guidance/draft.md": "---\nkind: guidance\ndraft: true\n---\n",
		"src/lsp/links.go":       "package main\n",
	})
	door.files["src/extension/icon.svg"] = fakeFile{text: "<svg/>"}
	disk, err := overIndex("/tree", door.ask, false)
	if err != nil {
		t.Fatal(err)
	}
	tree := treeOver("/tree", disk)

	if paths := tree.Paths(); !contains(paths, "spec/guidance/voice.md") || contains(paths, "src/extension/icon.svg") {
		t.Fatalf("the paths are git's, off the index, and they read %v", paths)
	}
	if tree.Read("spec/guidance/voice.md") != "# Voice\n" || !tree.Exists("src/extension/icon.svg") {
		t.Fatal("the tree reads every file the index holds, tracked or not")
	}
	if !tree.Folder("spec/guidance") || tree.Folder("spec/guidance/voice.md") || tree.Exists("spec/nowhere.md") {
		t.Fatal("a folder reads as a folder, a file as a file, and a path the index lacks as nothing")
	}
	names := tree.Names("spec/guidance", ".md")
	sort.Strings(names)
	if fmt.Sprint(names) != "[draft.md voice.md]" {
		t.Fatalf("the names under a folder read %v", names)
	}
}

// The check reads the disk as it stands, so it asks the door to walk before it pulls. [[spec/design_output/lsp#the-server-reads-the-index]]
func TestAFreshTreeWalksTheIndexFirst(t *testing.T) {
	door := newFakeIndex(map[string]string{"spec/a.md": "a\n"})
	if _, err := overIndex("/tree", door.ask, true); err != nil {
		t.Fatal(err)
	}
	if fmt.Sprint(door.asked) != "[reindex files texts]" {
		t.Fatalf("a fresh tree asks %v", door.asked)
	}
}

// A door answering nothing stops the server, because the tree has no second road. [[spec/design_output/lsp#the-server-reads-the-index]]
func TestADoorAnsweringNothingStopsTheServer(t *testing.T) {
	silent := func(string, any) (json.RawMessage, error) {
		return nil, errors.New("no index answers")
	}
	if disk, err := overIndex("/tree", silent, false); err == nil || disk != nil {
		t.Fatal("a tree stands over a door that answers nothing")
	}
}

// A tree off the index answers no tick, so no follower waits on it. [[spec/design_output/lsp#the-panel-follows-the-index]]
func TestATreeOffTheIndexFollowsNothing(t *testing.T) {
	if _, err := treeOver(t.TempDir(), realDisk{}).Changes(0); !errors.Is(err, errNoIndex) {
		t.Fatalf("a case's tree answers %v", err)
	}
}

// The binary holds one type reading a file of the tree, and it reads the index. So no hand adds a second road without this case naming it. [[spec/design_output/lsp#the-server-reads-the-index]]
func TestTheBinaryReadsTheTreeThroughTheIndexAlone(t *testing.T) {
	files := token.NewFileSet()
	sources, err := filepath.Glob("*.go")
	if err != nil {
		t.Fatal(err)
	}
	readers := []string{}
	for _, path := range sources {
		if strings.HasSuffix(path, "_test.go") {
			continue
		}
		parsed, err := parser.ParseFile(files, path, nil, 0)
		if err != nil {
			t.Fatal(err)
		}
		for _, declared := range parsed.Decls {
			method, ok := declared.(*ast.FuncDecl)
			if !ok || method.Recv == nil || method.Name.Name != "ReadFile" {
				continue
			}
			receiver := method.Recv.List[0].Type
			if star, ok := receiver.(*ast.StarExpr); ok {
				receiver = star.X
			}
			readers = append(readers, fmt.Sprint(receiver))
		}
	}
	if fmt.Sprint(readers) != "[indexDisk]" {
		t.Fatalf("the binary reads the tree through %v, and the index alone stands there", readers)
	}
}
