// The git door that carries writes: the typed operations the pull runs, each one
// git command line in the real door over a process runner, and FakeRepo beside
// it on a FakeDisk work tree. [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"time"

	"quackitect/src/modules/files"
	"quackitect/src/proc"
)

// What a push answers: whether it landed, whether origin moved past the branch, and git's words. [[spec/design_output/doors#the-git-door-carries-writes]]
type Pushed struct {
	OK, Moved bool
	Err       string
}

// One changed path: its status as git spells it, its path, and the path a move left. [[spec/design_output/doors#the-git-door-carries-writes]]
type Change struct {
	Status, Path, From string
}

// [[spec/design_output/doors#the-git-door-carries-writes]]
type Commit struct {
	Hash, Subject string
}

// One added line of the index, by the file and its line in the new text. [[spec/design_output/doors#the-git-door-carries-writes]]
type Line struct {
	File string
	Line int
	Text string
}

// [[spec/design_output/doors#the-git-door-carries-writes]]
type Ref struct {
	Name, Hash string
}

// [[spec/design_output/doors#the-git-door-carries-writes]]
type Repo interface {
	Head() (string, error)
	Resolve(ref string) (string, bool)
	Fetch(branch string) error
	Count(from, to string) (int, bool)
	FastForward(ref string) error
	MergeBase(a, b string) (string, bool)
	IsAncestor(a, b string) bool
	Signature(ref string) string
	RemoteHeads(prefix string) ([]string, error)
	Branch(name, at string) error
	Push(branch string, upstream bool) Pushed
	Status(untracked bool) ([]Change, error)
	Log(from, to string, ancestry bool) ([]Commit, error)
	Added(folder string) (map[string]int64, error)
	Show(ref, path string) (string, bool)
	Config(key string) (string, bool)
	Changed(commit string) ([]Change, error)
	Diff(a, b string) ([]Change, error)
	Ignored(paths []string) []string
	Tracked(path string) bool
	Add(paths []string) error
	AddAll() error
	Reset(paths []string) error
	Commit(message string, only []string) (string, error)
	Unmerged() ([]string, error)
	StagedAdds(only []string) ([]Line, error)
	Rebase(onto string) error
	Refs(prefix string) ([]Ref, error)
}

type door struct {
	root string
	run  proc.Runner
}

// The real door over the repository at root. [[spec/design_output/doors#the-git-door-carries-writes]]
func NewRepo(root string, run proc.Runner) Repo { return &door{root: root, run: run} }

func (one *door) Head() (string, error)                      { return "", nil }
func (one *door) Resolve(string) (string, bool)              { return "", false }
func (one *door) Fetch(string) error                         { return nil }
func (one *door) Count(string, string) (int, bool)           { return 0, false }
func (one *door) FastForward(string) error                   { return nil }
func (one *door) MergeBase(string, string) (string, bool)    { return "", false }
func (one *door) IsAncestor(string, string) bool             { return false }
func (one *door) Signature(string) string                    { return "" }
func (one *door) RemoteHeads(string) ([]string, error)       { return nil, nil }
func (one *door) Branch(string, string) error                { return nil }
func (one *door) Push(string, bool) Pushed                   { return Pushed{} }
func (one *door) Status(bool) ([]Change, error)              { return nil, nil }
func (one *door) Log(string, string, bool) ([]Commit, error) { return nil, nil }
func (one *door) Added(string) (map[string]int64, error)     { return nil, nil }
func (one *door) Show(string, string) (string, bool)         { return "", false }
func (one *door) Config(string) (string, bool)               { return "", false }
func (one *door) Changed(string) ([]Change, error)           { return nil, nil }
func (one *door) Diff(string, string) ([]Change, error)      { return nil, nil }
func (one *door) Ignored([]string) []string                  { return nil }
func (one *door) Tracked(string) bool                        { return false }
func (one *door) Add([]string) error                         { return nil }
func (one *door) AddAll() error                              { return nil }
func (one *door) Reset([]string) error                       { return nil }
func (one *door) Commit(string, []string) (string, error)    { return "", nil }
func (one *door) Unmerged() ([]string, error)                { return nil, nil }
func (one *door) StagedAdds([]string) ([]Line, error)        { return nil, nil }
func (one *door) Rebase(string) error                        { return nil }
func (one *door) Refs(string) ([]Ref, error)                 { return nil, nil }

// A repository in memory: commits keyed by the hash of their content, the refs, HEAD, the index, a config, an origin, and the work tree on a FakeDisk. [[spec/design_output/doors#the-git-door-carries-writes]]
type FakeRepo struct {
	tree   *files.FakeDisk
	now    func() time.Time
	origin *FakeRepo
}

// [[spec/design_output/doors#the-git-door-carries-writes]]
func NewFakeRepo(tree *files.FakeDisk, now func() time.Time) *FakeRepo {
	return &FakeRepo{tree: tree, now: now}
}

// A clone of this repository on a work tree of its own, with this one as its origin and origin's head checked out. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Clone(tree *files.FakeDisk) *FakeRepo {
	return &FakeRepo{tree: tree, now: one.now, origin: one}
}

// Sets a config key, as git config does. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Set(key, value string) {}

func (one *FakeRepo) Head() (string, error)                      { return "", nil }
func (one *FakeRepo) Resolve(string) (string, bool)              { return "", false }
func (one *FakeRepo) Fetch(string) error                         { return nil }
func (one *FakeRepo) Count(string, string) (int, bool)           { return 0, false }
func (one *FakeRepo) FastForward(string) error                   { return nil }
func (one *FakeRepo) MergeBase(string, string) (string, bool)    { return "", false }
func (one *FakeRepo) IsAncestor(string, string) bool             { return false }
func (one *FakeRepo) Signature(string) string                    { return "" }
func (one *FakeRepo) RemoteHeads(string) ([]string, error)       { return nil, nil }
func (one *FakeRepo) Branch(string, string) error                { return nil }
func (one *FakeRepo) Push(string, bool) Pushed                   { return Pushed{} }
func (one *FakeRepo) Status(bool) ([]Change, error)              { return nil, nil }
func (one *FakeRepo) Log(string, string, bool) ([]Commit, error) { return nil, nil }
func (one *FakeRepo) Added(string) (map[string]int64, error)     { return nil, nil }
func (one *FakeRepo) Show(string, string) (string, bool)         { return "", false }
func (one *FakeRepo) Config(string) (string, bool)               { return "", false }
func (one *FakeRepo) Changed(string) ([]Change, error)           { return nil, nil }
func (one *FakeRepo) Diff(string, string) ([]Change, error)      { return nil, nil }
func (one *FakeRepo) Ignored([]string) []string                  { return nil }
func (one *FakeRepo) Tracked(string) bool                        { return false }
func (one *FakeRepo) Add([]string) error                         { return nil }
func (one *FakeRepo) AddAll() error                              { return nil }
func (one *FakeRepo) Reset([]string) error                       { return nil }
func (one *FakeRepo) Commit(string, []string) (string, error)    { return "", nil }
func (one *FakeRepo) Unmerged() ([]string, error)                { return nil, nil }
func (one *FakeRepo) StagedAdds([]string) ([]Line, error)        { return nil, nil }
func (one *FakeRepo) Rebase(string) error                        { return nil }
func (one *FakeRepo) Refs(string) ([]Ref, error)                 { return nil, nil }
