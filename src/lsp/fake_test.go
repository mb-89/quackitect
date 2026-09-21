package main

import (
	"io/fs"
	"sort"
	"strings"
	"time"
)

// A disk in memory that behaves: what a case writes into it, it reads back, and a stat or a listing answers out of the same map. [[spec/design_output/doors#a-fake-behaves]]
type memDisk struct {
	files map[string]string
}

func fakeDisk(files map[string]string) *memDisk {
	held := map[string]string{}
	for name, text := range files {
		held[slashed(name)] = text
	}
	return &memDisk{files: held}
}

func (one *memDisk) ReadFile(path string) ([]byte, error) {
	text, held := one.files[slashed(path)]
	if !held {
		return nil, fs.ErrNotExist
	}
	return []byte(text), nil
}

func (one *memDisk) Stat(path string) (fs.FileInfo, error) {
	said := slashed(path)
	if text, held := one.files[said]; held {
		return memInfo{name: baseOf(said), size: int64(len(text))}, nil
	}
	if one.holdsFolder(said) {
		return memInfo{name: baseOf(said), dir: true}, nil
	}
	return nil, fs.ErrNotExist
}

func (one *memDisk) ReadDir(path string) ([]fs.DirEntry, error) {
	said := strings.TrimSuffix(slashed(path), "/")
	if !one.holdsFolder(said) {
		return nil, fs.ErrNotExist
	}
	seen := map[string]bool{}
	out := []fs.DirEntry{}
	for name := range one.files {
		if !strings.HasPrefix(name, said+"/") {
			continue
		}
		rest := strings.TrimPrefix(name, said+"/")
		head, dir := rest, false
		if at := strings.Index(rest, "/"); at >= 0 {
			head, dir = rest[:at], true
		}
		if seen[head] {
			continue
		}
		seen[head] = true
		out = append(out, memEntry{memInfo{name: head, dir: dir}})
	}
	sort.Slice(out, func(a, b int) bool { return out[a].Name() < out[b].Name() })
	return out, nil
}

func (one *memDisk) WalkDir(root string, fn fs.WalkDirFunc) error {
	said := strings.TrimSuffix(slashed(root), "/")
	names := []string{}
	for name := range one.files {
		if strings.HasPrefix(name, said+"/") {
			names = append(names, name)
		}
	}
	sort.Strings(names)
	for _, name := range names {
		if err := fn(name, memEntry{memInfo{name: baseOf(name)}}, nil); err != nil {
			return err
		}
	}
	return nil
}

func (one *memDisk) holdsFolder(said string) bool {
	for name := range one.files {
		if strings.HasPrefix(name, said+"/") {
			return true
		}
	}
	return false
}

func baseOf(path string) string {
	if at := strings.LastIndex(path, "/"); at >= 0 {
		return path[at+1:]
	}
	return path
}

type memInfo struct {
	name string
	size int64
	dir  bool
}

func (one memInfo) Name() string       { return one.name }
func (one memInfo) Size() int64        { return one.size }
func (one memInfo) Mode() fs.FileMode  { return 0o644 }
func (one memInfo) ModTime() time.Time { return time.Time{} }
func (one memInfo) IsDir() bool        { return one.dir }
func (one memInfo) Sys() any           { return nil }

type memEntry struct{ memInfo }

func (one memEntry) Type() fs.FileMode          { return one.Mode() }
func (one memEntry) Info() (fs.FileInfo, error) { return one.memInfo, nil }

// A tree over the fake disk, so a case touches memory and nothing else. [[spec/design_output/doors#a-fake-behaves]]
func fakeTree(files map[string]string) *Tree {
	root := "/tree"
	held := map[string]string{}
	for name, text := range files {
		held[root+"/"+slashed(name)] = text
	}
	tree := treeOver(root, fakeDisk(held))
	tree.Words = 5
	return tree
}
