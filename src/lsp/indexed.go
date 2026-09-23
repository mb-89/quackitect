// The tree as the index holds it. The server reads every file of the tree off
// the index door, keeps what it pulled, and pulls again the paths whose hash
// moves. A door standing nowhere gets started, the way every caller starts one.
// [[spec/design_output/lsp#the-server-reads-the-index]]
package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"net/http"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// The door's standing file and its binary, whose folder .claude/skills/level0/lib/folders.js owns and whose names src/index and lib/index.js own, spelled again here because a Go module imports neither. [[spec/design_output/index#the-door-owns-the-database]]
const (
	indexStandingAt = ".se/.runtime/index.json"
	indexBinAt      = ".se/.runtime/bin/se-index"
)

// A call waits past the changes wait the door holds, so a held call answers before the client lets go. [[spec/design_output/index#the-index-fires-on-change]]
const indexCallWait = 40 * time.Second

// A tree the index holds nowhere, as a case's tree is. [[spec/design_output/lsp#the-server-reads-the-index]]
var errNoIndex = errors.New("this tree reads no index")

// One question to the index door, as a function, so a case hands in a door of its own. [[spec/design_output/lsp#the-server-reads-the-index]]
type indexAsk func(method string, params any) (json.RawMessage, error)

// The door under the root. A door answering nowhere gets started once, and the question goes again. [[spec/design_output/index#a-door-comes-back]]
func indexAt(root string) indexAsk {
	return func(method string, params any) (json.RawMessage, error) {
		said, err := postIndex(root, method, params)
		if err == nil {
			return said, nil
		}
		if err := startsIndex(root, indexBinAt); err != nil {
			return nil, fmt.Errorf("no index answers under %s, and none starts: %v. Run ./RUNME.sh, which builds it", root, err)
		}
		return postIndex(root, method, params)
	}
}

func postIndex(root, method string, params any) (json.RawMessage, error) {
	standing, err := readFile(filepath.Join(root, filepath.FromSlash(indexStandingAt)))
	if err != nil {
		return nil, err
	}
	var at struct {
		Port int `json:"port"`
	}
	if err := json.Unmarshal(standing, &at); err != nil || at.Port == 0 {
		return nil, errors.New("the standing file names no port")
	}
	body, err := json.Marshal(map[string]any{"method": method, "params": params, "id": 1})
	if err != nil {
		return nil, err
	}
	client := &http.Client{Timeout: indexCallWait}
	got, err := client.Post(fmt.Sprintf("http://127.0.0.1:%d/", at.Port), "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	defer got.Body.Close()
	var said struct {
		Result json.RawMessage `json:"result"`
		Error  string          `json:"error"`
	}
	if err := json.NewDecoder(got.Body).Decode(&said); err != nil {
		return nil, err
	}
	if said.Error != "" {
		return nil, errors.New(said.Error)
	}
	return said.Result, nil
}

// What the server holds of one file: its hash, whether git tracks it, and its text. [[spec/design_output/lsp#the-server-reads-the-index]]
type indexed struct {
	hash    string
	tracked bool
	text    string
}

// The index's files, as the disk a tree reads through. [[spec/design_output/lsp#the-server-reads-the-index]]
type indexDisk struct {
	root  string
	ask   indexAsk
	guard sync.Mutex
	files map[string]indexed
}

// A disk over the index, pulled once. A door that answers nothing stops the server here, because the tree has no second road. [[spec/design_output/lsp#the-server-reads-the-index]]
func overIndex(root string, ask indexAsk, fresh bool) (*indexDisk, error) {
	if fresh {
		if _, err := ask("reindex", nil); err != nil {
			return nil, err
		}
	}
	one := &indexDisk{root: root, ask: ask, files: map[string]indexed{}}
	if _, _, err := one.pulls(); err != nil {
		return nil, err
	}
	return one, nil
}

// The list again, and the text of every path whose hash moved. It answers the tracked paths that moved, and the ones that went. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *indexDisk) pulls() (moved, gone []string, err error) {
	raw, err := one.ask("files", nil)
	if err != nil {
		return nil, nil, err
	}
	var list []struct {
		Path    string `json:"path"`
		Hash    string `json:"hash"`
		Tracked bool   `json:"tracked"`
	}
	if err := json.Unmarshal(raw, &list); err != nil {
		return nil, nil, err
	}
	one.guard.Lock()
	was := one.files
	one.guard.Unlock()

	next := map[string]indexed{}
	wanted := []string{}
	for _, row := range list {
		held, known := was[row.Path]
		if known && held.hash == row.Hash {
			next[row.Path] = indexed{hash: row.Hash, tracked: row.Tracked, text: held.text}
			if held.tracked != row.Tracked {
				moved = append(moved, row.Path)
			}
			continue
		}
		next[row.Path] = indexed{hash: row.Hash, tracked: row.Tracked}
		wanted = append(wanted, row.Path)
		if row.Tracked || held.tracked {
			moved = append(moved, row.Path)
		}
	}
	if len(wanted) > 0 {
		// The first pull asks every text at once, and a later one names the paths that moved. [[spec/design_output/lsp#the-server-reads-the-index]]
		var params any
		if len(was) > 0 {
			params = map[string]any{"paths": wanted}
		}
		raw, err := one.ask("texts", params)
		if err != nil {
			return nil, nil, err
		}
		var texts map[string]string
		if err := json.Unmarshal(raw, &texts); err != nil {
			return nil, nil, err
		}
		for path, text := range texts {
			held := next[path]
			held.text = text
			next[path] = held
		}
	}
	for path, held := range was {
		if _, stands := next[path]; !stands && held.tracked {
			gone = append(gone, path)
		}
	}
	one.guard.Lock()
	one.files = next
	one.guard.Unlock()
	sort.Strings(moved)
	sort.Strings(gone)
	return moved, gone, nil
}

// The tick past the one named, once a sweep lands; the tick named where none lands inside the door's wait. [[spec/design_output/index#the-index-fires-on-change]]
func (one *indexDisk) changes(since int64) (int64, error) {
	raw, err := one.ask("changes", map[string]any{"since": since})
	if err != nil {
		return since, err
	}
	var said struct {
		Tick int64 `json:"tick"`
	}
	if err := json.Unmarshal(raw, &said); err != nil {
		return since, err
	}
	return said.Tick, nil
}

// The files the index moves since the last pull, and the ones it drops. A tree off the index moves nothing. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *Tree) Pulls() (moved, gone []string, err error) {
	from, ok := one.disk.(interface {
		pulls() ([]string, []string, error)
	})
	if !ok {
		return nil, nil, nil
	}
	moved, gone, err = from.pulls()
	if len(moved)+len(gone) > 0 {
		one.Forgets()
	}
	return moved, gone, err
}

// The index's tick past the one named. A tree off the index answers errNoIndex, so no follower waits on it. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *Tree) Changes(since int64) (int64, error) {
	from, ok := one.disk.(interface {
		changes(int64) (int64, error)
	})
	if !ok {
		return since, errNoIndex
	}
	return from.changes(since)
}

// The paths git tracks, which every rule reads. [[spec/design_output/tree#the-tree-handed-in]]
func (one *indexDisk) tracked() []string {
	one.guard.Lock()
	defer one.guard.Unlock()
	out := []string{}
	for path, held := range one.files {
		if held.tracked {
			out = append(out, path)
		}
	}
	sort.Strings(out)
	return out
}

func (one *indexDisk) relative(abs string) string {
	rel, err := filepath.Rel(one.root, abs)
	if err != nil || strings.HasPrefix(rel, "..") {
		return "\x00"
	}
	if rel == "." {
		return ""
	}
	return slashed(rel)
}

func (one *indexDisk) ReadFile(abs string) ([]byte, error) {
	one.guard.Lock()
	held, stands := one.files[one.relative(abs)]
	one.guard.Unlock()
	if !stands {
		return nil, &fs.PathError{Op: "open", Path: abs, Err: fs.ErrNotExist}
	}
	return []byte(held.text), nil
}

func (one *indexDisk) Stat(abs string) (fs.FileInfo, error) {
	rel := one.relative(abs)
	one.guard.Lock()
	defer one.guard.Unlock()
	if held, stands := one.files[rel]; stands {
		return heldInfo{name: filepath.Base(abs), size: int64(len(held.text))}, nil
	}
	for path := range one.files {
		if rel == "" || strings.HasPrefix(path, rel+"/") {
			return heldInfo{name: filepath.Base(abs), folder: true}, nil
		}
	}
	return nil, &fs.PathError{Op: "stat", Path: abs, Err: fs.ErrNotExist}
}

// The files and the folders standing right under a folder. [[spec/design_output/lsp#the-server-reads-the-index]]
func (one *indexDisk) ReadDir(abs string) ([]fs.DirEntry, error) {
	rel := one.relative(abs)
	under := rel + "/"
	if rel == "" {
		under = ""
	}
	one.guard.Lock()
	seen := map[string]heldInfo{}
	for path, held := range one.files {
		if !strings.HasPrefix(path, under) {
			continue
		}
		name, _, folder := strings.Cut(path[len(under):], "/")
		seen[name] = heldInfo{name: name, size: int64(len(held.text)), folder: folder}
	}
	one.guard.Unlock()
	if len(seen) == 0 {
		return nil, &fs.PathError{Op: "readdir", Path: abs, Err: fs.ErrNotExist}
	}
	out := []fs.DirEntry{}
	for _, info := range seen {
		out = append(out, fs.FileInfoToDirEntry(info))
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name() < out[j].Name() })
	return out, nil
}

// Every file under a folder, in order. A folder the walker skips takes every file under it along. [[spec/design_output/lsp#the-server-reads-the-index]]
func (one *indexDisk) WalkDir(abs string, walks fs.WalkDirFunc) error {
	rel := one.relative(abs)
	one.guard.Lock()
	paths := []string{}
	for path := range one.files {
		if rel == "" || strings.HasPrefix(path, rel+"/") {
			paths = append(paths, path)
		}
	}
	one.guard.Unlock()
	sort.Strings(paths)
	skipped := []string{}
	for _, path := range paths {
		if under(path, skipped) {
			continue
		}
		info, _ := one.Stat(filepath.Join(one.root, filepath.FromSlash(path)))
		err := walks(filepath.Join(one.root, filepath.FromSlash(path)), fs.FileInfoToDirEntry(info), nil)
		if errors.Is(err, fs.SkipDir) {
			skipped = append(skipped, filepath.Dir(path)+"/")
			continue
		}
		if err != nil {
			return err
		}
	}
	return nil
}

func under(path string, folders []string) bool {
	for _, folder := range folders {
		if strings.HasPrefix(path, folder) {
			return true
		}
	}
	return false
}

// What a file or a folder of the index reads as. [[spec/design_output/lsp#the-server-reads-the-index]]
type heldInfo struct {
	name   string
	size   int64
	folder bool
}

func (one heldInfo) Name() string       { return one.name }
func (one heldInfo) Size() int64        { return one.size }
func (one heldInfo) ModTime() time.Time { return time.Time{} }
func (one heldInfo) IsDir() bool        { return one.folder }
func (one heldInfo) Sys() any           { return nil }
func (one heldInfo) Mode() fs.FileMode {
	if one.folder {
		return fs.ModeDir | 0o755
	}
	return 0o644
}
