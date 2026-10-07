// FakeRepo, the git door in memory: its commits, refs, index and hooks, and
// the tree helpers its verbs share. [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

// The branch a repository opens on, the ignore file it reads, and the folder a work tree on a real folder keeps apart. [[spec/design_output/doors#the-git-door-carries-writes]]
const (
	firstBranch = "main"
	ignoreFile  = ".gitignore"
	gitFolder   = ".git/"
)

// The work tree a FakeRepo stands on, by forward-slash paths: the verbs of files.Disk, which a module names here in place of importing it. [[spec/design_output/doors#the-git-door-carries-writes]]
type Tree interface {
	Write(path, text string) error
	Read(path string) (string, bool, error)
	Remove(path string) error
	List(folder string) ([]string, error)
}

// A commit the fake holds: its parents, the text of every path, its subject and its second. [[spec/design_output/doors#the-git-door-carries-writes]]
type fakeCommit struct {
	parents []string
	tree    map[string]string
	subject string
	when    int64
}

// A path's text in a tree, and whether the tree holds it at all. [[spec/design_output/doors#the-git-door-carries-writes]]
type entry struct {
	text string
	held bool
}

func entryAt(tree map[string]string, path string) entry {
	text, held := tree[path]
	return entry{text, held}
}

func (one entry) into(tree map[string]string, path string) {
	if one.held {
		tree[path] = one.text
	} else {
		delete(tree, path)
	}
}

// A repository in memory: commits keyed by the hash of their content, the refs, HEAD, the index, a config, an origin, and the work tree on a Disk, a FakeDisk or a real folder. [[spec/design_output/doors#the-git-door-carries-writes]]
type FakeRepo struct {
	mu        sync.Mutex
	tree      Tree
	now       func() time.Time
	origin    *FakeRepo
	commits   map[string]*fakeCommit
	refs      map[string]string
	head      string
	index     map[string]string
	config    map[string]string
	merging   string
	unmerged  map[string]bool
	stages    map[string][conflictSides]entry
	worktrees map[string]bool
	shallow   bool
	hooks     map[string]Hook
}

// The hook a repository runs before a commit lands on it, and the one origin runs before a push lands, as git's hooks folder names them. [[spec/design_output/doors#the-git-door-carries-writes]]
const (
	preCommit  = "pre-commit"
	preReceive = "pre-receive"
)

// What a hook reads: the ref a commit or a push moves, and the commit it moves to, empty for a delete. Its fault refuses the move. [[spec/design_output/doors#the-git-door-carries-writes]]
type Hook func(ref, to string) error

// Sets the hook git runs under a name, pre-commit on a clone or pre-receive on an origin. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Hook(name string, run Hook) {
	one.mu.Lock()
	defer one.mu.Unlock()
	one.hooks[name] = run
}

func (one *FakeRepo) hooked(name, ref, to string) error {
	if run, ok := one.hooks[name]; ok {
		return run(ref, to)
	}
	return nil
}

// Moves HEAD onto a new branch holding no commit, the index and the tracked work tree emptied, as git switch --orphan does. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Orphan(name string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	if _, held := one.refs[headsPrefix+name]; held {
		return fmt.Errorf("fatal: a branch named '%s' already exists", name)
	}
	for key := range one.index {
		if err := one.tree.Remove(key); err != nil {
			return err
		}
	}
	one.head, one.index = headsPrefix+name, map[string]string{}
	return nil
}

// [[spec/design_output/doors#the-git-door-carries-writes]]
func NewFakeRepo(tree Tree, now func() time.Time) *FakeRepo {
	return &FakeRepo{
		tree: tree, now: now, head: headsPrefix + firstBranch,
		commits: map[string]*fakeCommit{}, refs: map[string]string{}, index: map[string]string{},
		config: map[string]string{}, unmerged: map[string]bool{},
		stages: map[string][conflictSides]entry{}, worktrees: map[string]bool{}, hooks: map[string]Hook{},
	}
}

// A clone holding the tips of origin's branches alone, as git clone --depth 1 cuts it. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) CloneShallow(tree Tree) *FakeRepo {
	out := one.Clone(tree)
	out.mu.Lock()
	defer out.mu.Unlock()
	tips := map[string]bool{}
	for _, hash := range out.refs {
		tips[hash] = true
	}
	for hash := range out.commits {
		if !tips[hash] {
			delete(out.commits, hash)
		}
	}
	out.shallow = true
	return out
}

// A clone of this repository on a work tree of its own, with this one as its origin and origin's head checked out. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Clone(tree Tree) *FakeRepo {
	one.mu.Lock()
	defer one.mu.Unlock()
	out := NewFakeRepo(tree, one.now)
	out.origin, out.head = one, one.head
	out.config["remote."+originName+".url"] = originName
	for name, hash := range one.refs {
		if branch, ok := strings.CutPrefix(name, headsPrefix); ok {
			out.take(one, hash)
			out.refs[trackPrefix+branch] = hash
		}
	}
	if hash, ok := one.refs[one.head]; ok {
		out.refs[out.head] = hash
		out.upstream(strings.TrimPrefix(out.head, headsPrefix))
		_ = out.checkout(map[string]string{}, out.commits[hash].tree)
	}
	return out
}

// Sets a config key, as git config does. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Set(key, value string) {
	one.mu.Lock()
	defer one.mu.Unlock()
	one.config[key] = value
}

// Copies every commit the hash reaches from another repository. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) take(from *FakeRepo, hash string) {
	for reached := range from.ancestors(hash) {
		one.commits[reached] = from.commits[reached]
	}
}

func (one *FakeRepo) upstream(branch string) {
	one.config["branch."+branch+".remote"] = originName
	one.config["branch."+branch+".merge"] = headsPrefix + branch
}

// Every commit the hash reaches, the hash among them. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) ancestors(hash string) map[string]bool {
	out := map[string]bool{}
	for next := []string{hash}; len(next) > 0; {
		at := next[len(next)-1]
		next = next[:len(next)-1]
		commit, ok := one.commits[at]
		if out[at] || !ok {
			continue
		}
		out[at] = true
		next = append(next, commit.parents...)
	}
	return out
}

func (one *FakeRepo) headHash() (string, bool) {
	hash, ok := one.refs[one.head]
	return hash, ok
}

func (one *FakeRepo) treeOf(hash string) map[string]string {
	if commit, ok := one.commits[hash]; ok {
		return commit.tree
	}
	return map[string]string{}
}

func (one *FakeRepo) headTree() map[string]string {
	hash, _ := one.headHash()
	return one.treeOf(hash)
}

// A ref's step back: ~n walks first parents, ^n takes the nth parent. [[spec/design_output/doors#the-git-door-carries-writes]]
var (
	revSteps = regexp.MustCompile(`^(.*?)((?:[~^]\d*)*)$`)
	revStep  = regexp.MustCompile(`[~^]\d*`)
	hexWord  = regexp.MustCompile(`^[0-9a-f]{4,40}$`)
)

func (one *FakeRepo) resolve(ref string) (string, bool) {
	parts := revSteps.FindStringSubmatch(ref)
	hash, ok := one.named(parts[1])
	for _, step := range revStep.FindAllString(parts[2], -1) {
		if !ok {
			break
		}
		count := 1
		if len(step) > 1 {
			count, _ = strconv.Atoi(step[1:])
		}
		if step[0] == '~' {
			for ; count > 0 && ok; count-- {
				hash, ok = one.parent(hash, 1)
			}
			continue
		}
		if count > 0 {
			hash, ok = one.parent(hash, count)
		}
	}
	if !ok {
		return "", false
	}
	return hash, true
}

func (one *FakeRepo) parent(hash string, nth int) (string, bool) {
	commit, ok := one.commits[hash]
	if !ok || len(commit.parents) < nth {
		return "", false
	}
	return commit.parents[nth-1], true
}

func (one *FakeRepo) named(base string) (string, bool) {
	switch base {
	case "HEAD":
		return one.headHash()
	case mergeHead:
		return one.merging, one.merging != ""
	}
	if _, ok := one.commits[base]; ok {
		return base, true
	}
	for _, full := range []string{base, headsPrefix + base, remotesPrefix + base} {
		if hash, ok := one.refs[full]; ok {
			return hash, true
		}
	}
	if !hexWord.MatchString(base) {
		return "", false
	}
	found := ""
	for hash := range one.commits {
		if strings.HasPrefix(hash, base) {
			if found != "" {
				return "", false
			}
			found = hash
		}
	}
	return found, found != ""
}

func (one *FakeRepo) mustResolve(ref string) (string, error) {
	if hash, ok := one.resolve(ref); ok {
		return hash, nil
	}
	return "", fmt.Errorf("fatal: bad revision '%s'", ref)
}

// The work tree, path by path, off the disk it stands on. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) worktree() (map[string]string, error) {
	names, err := one.tree.List("")
	if err != nil {
		return nil, err
	}
	out := map[string]string{}
	for _, name := range names {
		if strings.HasPrefix(name, gitFolder) || one.inWorktree(name) {
			continue
		}
		text, ok, err := one.tree.Read(name)
		if err != nil {
			return nil, err
		}
		if ok {
			out[name] = text
		}
	}
	return out, nil
}

// Whether a path stands inside a worktree this repository added, which its own work tree leaves out. [[spec/design_output/review#a-worktree-runs-the-check]]
func (one *FakeRepo) inWorktree(name string) bool {
	for at := range one.worktrees {
		if strings.HasPrefix(name, at+"/") {
			return true
		}
	}
	return false
}

// The ignore file's lines: a folder, a path or a path.Match glob, matched against a name anywhere where it holds no slash. [[spec/design_output/doors#the-git-door-carries-writes]]
func ignoredBy(rules []string, at string) bool {
	segments := strings.Split(at, "/")
	out := false
	for _, rule := range rules {
		rule = strings.TrimSpace(rule)
		if rule == "" || strings.HasPrefix(rule, "#") {
			continue
		}
		negated := strings.HasPrefix(rule, "!")
		rule = strings.TrimPrefix(rule, "!")
		folder := strings.HasSuffix(rule, "/")
		rule = strings.TrimSuffix(rule, "/")
		anchored := strings.Contains(rule, "/")
		rule = strings.TrimPrefix(rule, "/")
		for depth := range segments {
			if folder && depth == len(segments)-1 {
				break
			}
			candidate := segments[depth]
			if anchored {
				candidate = strings.Join(segments[:depth+1], "/")
			}
			if matched, _ := path.Match(rule, candidate); matched {
				out = !negated
				break
			}
		}
	}
	return out
}

func ignoreRules(work map[string]string) []string {
	return strings.Split(work[ignoreFile], "\n")
}

// The keys of a pathspec: the path itself, every path under it as a folder, or all of them for a dot. [[spec/design_output/doors#the-git-door-carries-writes]]
func matching(spec string, trees ...map[string]string) []string {
	spec = strings.TrimSuffix(spec, "/")
	found := map[string]bool{}
	for _, tree := range trees {
		for key := range tree {
			if spec == "." || spec == "" || key == spec || strings.HasPrefix(key, spec+"/") {
				found[key] = true
			}
		}
	}
	return sortedOf(found)
}

func keysOf(trees ...map[string]string) []string {
	return matching(".", trees...)
}

func copyOf(tree map[string]string) map[string]string {
	out := make(map[string]string, len(tree))
	for key, text := range tree {
		out[key] = text
	}
	return out
}

func sameTree(a, b map[string]string) bool {
	if len(a) != len(b) {
		return false
	}
	for key, text := range a {
		if other, ok := b[key]; !ok || other != text {
			return false
		}
	}
	return true
}

func within(tree map[string]string, only []string) map[string]string {
	if len(only) == 0 {
		return tree
	}
	out := map[string]string{}
	for _, spec := range only {
		for _, key := range matching(spec, tree) {
			out[key] = tree[key]
		}
	}
	return out
}

// The paths two trees differ in, a move read where a removed path's text stands whole under an added one. [[spec/design_output/doors#the-git-door-carries-writes]]
func treeDiff(a, b map[string]string) []Change {
	out, added, removed := []Change{}, []string{}, []string{}
	for _, key := range keysOf(a, b) {
		before, after := entryAt(a, key), entryAt(b, key)
		switch {
		case before == after:
		case !before.held:
			added = append(added, key)
		case !after.held:
			removed = append(removed, key)
		default:
			out = append(out, Change{Status: "M", Path: key})
		}
	}
	paired := map[string]bool{}
	for _, gone := range removed {
		moved := ""
		for _, came := range added {
			if !paired[came] && a[gone] != "" && b[came] == a[gone] {
				moved = came
				break
			}
		}
		if moved == "" {
			out = append(out, Change{Status: "D", Path: gone})
			continue
		}
		paired[moved] = true
		out = append(out, Change{Status: "R", Path: moved, From: gone})
	}
	for _, came := range added {
		if !paired[came] {
			out = append(out, Change{Status: "A", Path: came})
		}
	}
	sort.Slice(out, func(x, y int) bool { return out[x].Path < out[y].Path })
	return out
}

// The commits of a set newest first, each before its parents, a tie going to the one the walk from the tip meets first. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) ordered(set map[string]bool, tip string) []string {
	met := map[string]int{}
	for queue := []string{tip}; len(queue) > 0; queue = queue[1:] {
		if _, seen := met[queue[0]]; seen || !set[queue[0]] {
			continue
		}
		met[queue[0]] = len(met)
		queue = append(queue, one.commits[queue[0]].parents...)
	}
	children := map[string]int{}
	for hash := range set {
		for _, parent := range one.commits[hash].parents {
			if set[parent] {
				children[parent]++
			}
		}
	}
	ready := []string{}
	for hash := range set {
		if children[hash] == 0 {
			ready = append(ready, hash)
		}
	}
	out := []string{}
	for len(ready) > 0 {
		sort.Slice(ready, func(x, y int) bool {
			a, b := one.commits[ready[x]], one.commits[ready[y]]
			if a.when != b.when {
				return a.when > b.when
			}
			return metAt(met, ready[x]) < metAt(met, ready[y])
		})
		next := ready[0]
		ready = ready[1:]
		out = append(out, next)
		for _, parent := range one.commits[next].parents {
			if set[parent] {
				if children[parent]--; children[parent] == 0 {
					ready = append(ready, parent)
				}
			}
		}
	}
	return out
}

func metAt(met map[string]int, hash string) int {
	if at, ok := met[hash]; ok {
		return at
	}
	return len(met)
}

func (one *FakeRepo) logOf(hashes []string) []Commit {
	out := []Commit{}
	for _, hash := range hashes {
		out = append(out, Commit{Hash: hash, Subject: one.commits[hash].subject})
	}
	return out
}

// Stores a commit under the SHA-1 of its content. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) store(commit *fakeCommit) string {
	sum := sha1.New()
	for _, key := range keysOf(commit.tree) {
		text := sha1.Sum([]byte(commit.tree[key]))
		fmt.Fprintf(sum, "%s\x00%x\n", key, text)
	}
	for _, parent := range commit.parents {
		fmt.Fprintf(sum, "parent %s\n", parent)
	}
	fmt.Fprintf(sum, "by %s <%s> %d\n\n%s", one.config["user.name"], one.config["user.email"], commit.when, commit.subject)
	hash := hex.EncodeToString(sum.Sum(nil))
	one.commits[hash] = commit
	return hash
}

func (one *FakeRepo) identity() error {
	if one.config["user.useConfigOnly"] == "true" && (one.config["user.name"] == "" || one.config["user.email"] == "") {
		return errors.New("Author identity unknown: no user.name and user.email stand in the config")
	}
	return nil
}

// Writes the paths a move from one tree to another changes into the work tree and the index, and leaves every other path as it stands. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) checkout(from, to map[string]string) error {
	for _, key := range keysOf(from, to) {
		before, after := entryAt(from, key), entryAt(to, key)
		if before == after {
			continue
		}
		if err := one.place(key, after); err != nil {
			return err
		}
	}
	return nil
}

func (one *FakeRepo) place(key string, at entry) error {
	at.into(one.index, key)
	if at.held {
		return one.tree.Write(key, at.text)
	}
	return one.tree.Remove(key)
}

// Refuses a move that writes over a local change, or over an untracked file standing at a path it writes. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) overwrites(from, to map[string]string) error {
	work, err := one.worktree()
	if err != nil {
		return err
	}
	lost := []string{}
	for _, key := range keysOf(from, to) {
		before, after := entryAt(from, key), entryAt(to, key)
		if before == after {
			continue
		}
		staged, worked := entryAt(one.index, key), entryAt(work, key)
		if staged != before || (worked != staged && worked != after) {
			lost = append(lost, key)
		}
	}
	if len(lost) > 0 {
		return fmt.Errorf("error: your local changes to the following files would be overwritten: %s", strings.Join(lost, ", "))
	}
	return nil
}

// Moves HEAD's branch to a commit, the work tree and the index with it. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) moveTo(hash string) error {
	from, to := one.headTree(), one.treeOf(hash)
	if err := one.overwrites(from, to); err != nil {
		return err
	}
	if err := one.checkout(from, to); err != nil {
		return err
	}
	one.refs[one.head] = hash
	return nil
}
