// The git door that carries writes: the typed operations the pull and the branch
// verbs run, each one git command line in the real door over a process runner,
// and FakeRepo beside it on a work tree any Disk holds. [[spec/design_output/doors#the-git-door-carries-writes]]
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
	Staged(only []string) ([]Change, error)
	SoftReset(ref string) error
	UpdateRef(name, hash string) error
	History(path string) ([]Commit, error)
	Switch(name string, create bool) error
	Merge(ref, message string, noFF bool) ([]string, error)
	CommitTree(of, parent, message string) (string, error)
	Cherry(upstream, head string) ([]string, error)
	RemoteRefs(prefix string) ([]Ref, error)
	Restore(path string) error
	ShowMany(asks []string) (map[string]string, error)
	FetchAll() error
	PushTo(commit, branch string) Pushed
	DeleteRemote(branch string) error
	DeleteRef(name string) error
	Amend() error
	ResetTo(ref string, hard bool) error
	FirstParents(ref string) ([]string, error)
	Files(ref, folder string) ([]string, error)
	Patch(a, b string, stat bool, paths ...string) (string, error)
	CommitFiles(parent string, files map[string]string, message string) (string, error)
	AddWorktree(path, ref string) error
	RemoveWorktree(path string) error
	Unshallow() bool
	Merged(prefix, into string) ([]Ref, error)
	When(ref string) (int64, bool)
}

// The refs a branch and its tracking copy stand under, and the remote every push and fetch names. [[spec/design_output/doors#the-git-door-carries-writes]]
const (
	headsPrefix   = "refs/heads/"
	remotesPrefix = "refs/remotes/"
	originName    = "origin"
	trackPrefix   = remotesPrefix + originName + "/"
	mergeHead     = "MERGE_HEAD"
	noSignature   = "N"
	shortHash     = 7
	batchFields   = 3
	conflictSides = 3
)

var (
	// A push origin refuses because it moved past the branch. [[spec/design_output/pull#the-rejected-push]]
	movedPush = regexp.MustCompile(`\((?:fetch first|non-fast-forward)\)`)
	hunkStart = regexp.MustCompile(`^@@+ .*\+(\d+)(?:,\d+)? @@`)
)

type door struct {
	root string
	run  proc.Runner
}

// The real door over the repository at root. [[spec/design_output/doors#the-git-door-carries-writes]]
func NewRepo(root string, run proc.Runner) Repo { return &door{root: root, run: run} }

// One git line in the root, its words in the C locale, so a refusal reads the same on every box. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) git(args ...string) proc.Said {
	return one.run(proc.Command{Argv: append([]string{"git"}, args...), Dir: one.root, Env: []string{"LC_ALL=C"}})
}

func (one *door) must(args ...string) (string, error) {
	said := one.git(args...)
	if said.Code != 0 {
		because := strings.TrimSpace(said.Err)
		if because == "" {
			because = strings.TrimSpace(said.Out)
		}
		if because == "" {
			because = fmt.Sprintf("git %s answers %d", args[0], said.Code)
		}
		return said.Out, errors.New(because)
	}
	return said.Out, nil
}

func (one *door) word(args ...string) (string, bool) {
	said, err := one.must(args...)
	return strings.TrimSpace(said), err == nil
}

func (one *door) Head() (string, error) {
	said, err := one.must("rev-parse", "--abbrev-ref", "HEAD")
	return strings.TrimSpace(said), err
}

func (one *door) Resolve(ref string) (string, bool) {
	said, ok := one.word("rev-parse", "--verify", "--quiet", ref+"^{commit}")
	if !ok {
		return "", false
	}
	return said, true
}

func (one *door) Fetch(branch string) error {
	_, err := one.must("fetch", "--quiet", originName, branch)
	return err
}

func (one *door) Count(from, to string) (int, bool) {
	said, ok := one.word("rev-list", "--count", from+".."+to, "--")
	if !ok {
		return 0, false
	}
	count, err := strconv.Atoi(said)
	return count, err == nil
}

func (one *door) FastForward(ref string) error {
	_, err := one.must("merge", "--ff-only", "--quiet", ref)
	return err
}

func (one *door) MergeBase(a, b string) (string, bool) {
	return one.word("merge-base", a, b)
}

func (one *door) IsAncestor(a, b string) bool {
	return one.git("merge-base", "--is-ancestor", a, b).Code == 0
}

func (one *door) Signature(ref string) string {
	said, _ := one.word("log", "-1", "--format=%G?", ref, "--")
	return said
}

func (one *door) RemoteHeads(prefix string) ([]string, error) {
	said, err := one.must("ls-remote", "--heads", originName, headsPrefix+prefix+"*")
	if err != nil {
		return nil, err
	}
	out := []string{}
	for _, row := range rowsIn(said) {
		if _, ref, ok := strings.Cut(row, "\t"); ok && strings.HasPrefix(ref, headsPrefix+prefix) {
			out = append(out, strings.TrimPrefix(ref, headsPrefix))
		}
	}
	sort.Strings(out)
	return out, nil
}

func (one *door) Branch(name, at string) error {
	_, err := one.must("branch", name, at)
	return err
}

func (one *door) Push(branch string, upstream bool) Pushed {
	args := []string{"push", "--quiet"}
	if upstream {
		args = append(args, "--set-upstream")
	}
	return one.pushed(append(args, originName, branch)...)
}

func (one *door) PushTo(commit, branch string) Pushed {
	return one.pushed("push", "--quiet", originName, commit+":"+headsPrefix+branch)
}

func (one *door) pushed(args ...string) Pushed {
	said := one.git(args...)
	if said.Code == 0 {
		return Pushed{OK: true}
	}
	because := strings.TrimSpace(said.Err)
	if because == "" {
		because = fmt.Sprintf("git push answers %d", said.Code)
	}
	return Pushed{Moved: movedPush.MatchString(said.Err), Err: because}
}

func (one *door) Status(untracked bool) ([]Change, error) {
	files := "--untracked-files=no"
	if untracked {
		files = "--untracked-files=all"
	}
	said, err := one.must("status", "--porcelain", "-z", files)
	if err != nil {
		return nil, err
	}
	out := []Change{}
	parts := strings.Split(said, "\x00")
	for at := 0; at < len(parts); at++ {
		row := parts[at]
		if len(row) < len("XY p") {
			continue
		}
		change := Change{Status: row[:2], Path: row[3:]}
		if (row[0] == 'R' || row[0] == 'C') && at+1 < len(parts) {
			at++
			change.From = parts[at]
		}
		out = append(out, change)
	}
	return out, nil
}

func (one *door) Log(from, to string, ancestry bool) ([]Commit, error) {
	args := []string{"log", "--format=%H%x00%s"}
	if ancestry {
		args = append(args, "--ancestry-path")
	}
	span := to
	if from != "" {
		span = from + ".." + to
	}
	said, err := one.must(append(args, span, "--")...)
	if err != nil {
		return nil, err
	}
	return commitsIn(said), nil
}

func commitsIn(said string) []Commit {
	out := []Commit{}
	for _, row := range rowsIn(said) {
		hash, subject, _ := strings.Cut(row, "\x00")
		out = append(out, Commit{Hash: hash, Subject: subject})
	}
	return out
}

func (one *door) Added(folder string) (map[string]int64, error) {
	said, err := one.must("log", "--diff-filter=A", "--format=%ct", "--name-only", "--", folder)
	if err != nil {
		return nil, err
	}
	out := map[string]int64{}
	var when int64
	for _, row := range rowsIn(said) {
		if number, err := strconv.ParseInt(row, secondsBase, secondsBits); err == nil {
			when = number
			continue
		}
		if _, ok := out[unquoted(row)]; !ok {
			out[unquoted(row)] = when
		}
	}
	return out, nil
}

func (one *door) Show(ref, path string) (string, bool) {
	said, err := one.must("show", ref+":"+path)
	if err != nil {
		return "", false
	}
	return said, true
}

func (one *door) Config(key string) (string, bool) {
	said := one.git("config", "--get", key)
	if said.Code != 0 {
		return "", false
	}
	return strings.TrimSuffix(said.Out, "\n"), true
}

func (one *door) Changed(commit string) ([]Change, error) {
	said, err := one.must("show", "--format=", "--name-status", "-M", "-z", commit, "--")
	if err != nil {
		return nil, err
	}
	return namesIn(said), nil
}

func (one *door) Diff(a, b string) ([]Change, error) {
	said, err := one.must("diff", "--name-status", "-M", "-z", a, b, "--")
	if err != nil {
		return nil, err
	}
	return namesIn(said), nil
}

// The rows of a name-status answer under -z: a status, then one path, or two for a move. [[spec/design_output/doors#the-git-door-carries-writes]]
func namesIn(said string) []Change {
	parts := []string{}
	for _, part := range strings.Split(said, "\x00") {
		if part = strings.Trim(part, "\n"); part != "" {
			parts = append(parts, part)
		}
	}
	out := []Change{}
	for at := 0; at+1 < len(parts); at += 2 {
		change := Change{Status: parts[at][:1], Path: parts[at+1]}
		if (change.Status == "R" || change.Status == "C") && at+2 < len(parts) {
			change.From, change.Path = parts[at+1], parts[at+2]
			at++
		}
		out = append(out, change)
	}
	return out
}

func (one *door) Ignored(paths []string) []string {
	if len(paths) == 0 {
		return nil
	}
	said := one.git(append([]string{"check-ignore", "--"}, paths...)...)
	out := []string{}
	for _, path := range rowsIn(said.Out) {
		out = append(out, unquoted(path))
	}
	return out
}

func (one *door) Tracked(path string) bool {
	return one.git("ls-files", "--error-unmatch", "--", path).Code == 0
}

func (one *door) Add(paths []string) error {
	_, err := one.must(append([]string{"add", "--"}, paths...)...)
	return err
}

func (one *door) AddAll() error {
	_, err := one.must("add", "-A")
	return err
}

func (one *door) Reset(paths []string) error {
	args := []string{"reset", "-q"}
	if len(paths) > 0 {
		args = append(append(args, "--"), paths...)
	}
	_, err := one.must(args...)
	return err
}

func (one *door) Commit(message string, only []string) (string, error) {
	args := []string{"commit", "-q", "-m", message}
	if len(only) > 0 {
		args = append(append(args, "--"), only...)
	}
	if _, err := one.must(args...); err != nil {
		return "", err
	}
	hash, _ := one.Resolve("HEAD")
	return hash, nil
}

func (one *door) Unmerged() ([]string, error) {
	said, err := one.must("ls-files", "-u", "-z")
	if err != nil {
		return nil, err
	}
	paths := map[string]bool{}
	for _, row := range strings.Split(said, "\x00") {
		if _, path, ok := strings.Cut(row, "\t"); ok {
			paths[path] = true
		}
	}
	return sortedOf(paths), nil
}

func (one *door) StagedAdds(only []string) ([]Line, error) {
	args := []string{"diff", "--cached", "--unified=0", "--no-color", "--no-ext-diff"}
	if len(only) > 0 {
		args = append(append(args, "--"), only...)
	}
	said, err := one.must(args...)
	if err != nil {
		return nil, err
	}
	return addsIn(said), nil
}

// The added lines of a diff with no context, by file and line, a binary file skipped. [[spec/design_output/work#no-commit-carries-a-marker]]
func addsIn(said string) []Line {
	out := []Line{}
	file, at, binary, hunk := "", 0, false, false
	for _, row := range strings.Split(said, "\n") {
		switch {
		case strings.HasPrefix(row, "diff --git "):
			file, binary, hunk = "", false, false
			continue
		case !hunk && (strings.HasPrefix(row, "Binary files") || strings.HasPrefix(row, "GIT binary patch")):
			binary = true
			continue
		case !hunk && strings.HasPrefix(row, "+++ "):
			file = strings.TrimPrefix(unquoted(row[len("+++ "):]), "b/")
			if file == "/dev/null" {
				file = ""
			}
			continue
		}
		if found := hunkStart.FindStringSubmatch(row); found != nil {
			at, _ = strconv.Atoi(found[1])
			hunk = true
			continue
		}
		if !hunk || !strings.HasPrefix(row, "+") {
			continue
		}
		if file != "" && !binary {
			out = append(out, Line{File: file, Line: at, Text: row[1:]})
		}
		at++
	}
	return out
}

func (one *door) Rebase(onto string) error {
	if _, err := one.must("rebase", "--quiet", onto); err != nil {
		one.git("rebase", "--abort")
		return err
	}
	return nil
}

func (one *door) Refs(prefix string) ([]Ref, error) {
	said, err := one.must("for-each-ref", "--format=%(refname)%00%(objectname)", prefix)
	if err != nil {
		return nil, err
	}
	out := []Ref{}
	for _, row := range rowsIn(said) {
		name, hash, _ := strings.Cut(row, "\x00")
		out = append(out, Ref{Name: name, Hash: hash})
	}
	return out, nil
}

func (one *door) Staged(only []string) ([]Change, error) {
	args := []string{"diff", "--cached", "--name-status", "-M", "-z"}
	if len(only) > 0 {
		args = append(append(args, "--"), only...)
	}
	said, err := one.must(args...)
	if err != nil {
		return nil, err
	}
	return namesIn(said), nil
}

func (one *door) SoftReset(ref string) error {
	_, err := one.must("reset", "-q", "--soft", ref)
	return err
}

func (one *door) UpdateRef(name, hash string) error {
	_, err := one.must("update-ref", name, hash)
	return err
}

func (one *door) History(path string) ([]Commit, error) {
	said, err := one.must("log", "--format=%H%x00%s", "--", path)
	if err != nil {
		return nil, err
	}
	return commitsIn(said), nil
}

func (one *door) Switch(name string, create bool) error {
	args := []string{"switch", "--quiet"}
	if create {
		args = append(args, "--create")
	}
	_, err := one.must(append(args, name)...)
	return err
}

func (one *door) Merge(ref, message string, noFF bool) ([]string, error) {
	args := []string{"merge", "--no-edit", "--quiet"}
	if noFF {
		args = append(args, "--no-ff")
	}
	if message != "" {
		args = append(args, "-m", message)
	}
	_, err := one.must(append(args, ref)...)
	if err == nil {
		return nil, nil
	}
	conflicts, _ := one.Unmerged()
	return conflicts, err
}

// A commit holding the tree of one ref onto a parent, moving no ref. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) CommitTree(of, parent, message string) (string, error) {
	said, err := one.must("commit-tree", of+"^{tree}", "-p", parent, "-m", message)
	return strings.TrimSpace(said), err
}

// The commits head holds whose patch upstream lacks, oldest first. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) Cherry(upstream, head string) ([]string, error) {
	said, err := one.must("cherry", upstream, head)
	if err != nil {
		return nil, err
	}
	out := []string{}
	for _, row := range rowsIn(said) {
		if hash, ok := strings.CutPrefix(row, "+ "); ok {
			out = append(out, hash)
		}
	}
	return out, nil
}

// The refs origin holds under a prefix with their commits, by name. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) RemoteRefs(prefix string) ([]Ref, error) {
	said, err := one.must("ls-remote", originName, prefix+"*")
	if err != nil {
		return nil, err
	}
	out := []Ref{}
	for _, row := range rowsIn(said) {
		if hash, name, ok := strings.Cut(row, "\t"); ok && strings.HasPrefix(name, prefix) && !strings.HasSuffix(name, "^{}") {
			out = append(out, Ref{Name: name, Hash: hash})
		}
	}
	sort.Slice(out, func(x, y int) bool { return out[x].Name < out[y].Name })
	return out, nil
}

// A path put back as HEAD holds it, in the index and the work tree. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) Restore(path string) error {
	_, err := one.must("checkout", "HEAD", "--", path)
	return err
}

// Many files at refs in one ask, each ask a ref and a path joined by a colon, a missing one left out. [[spec/design_output/doors#a-raw-run-keeps-bytes]]
func (one *door) ShowMany(asks []string) (map[string]string, error) {
	out := map[string]string{}
	if len(asks) == 0 {
		return out, nil
	}
	said := one.run(proc.Command{Argv: []string{"git", "cat-file", "--batch"}, Dir: one.root, Env: []string{"LC_ALL=C"}, Stdin: strings.Join(asks, "\n") + "\n"})
	if said.Code != 0 {
		return nil, errors.New(strings.TrimSpace(said.Err))
	}
	stream, at := said.Out, 0
	for _, ask := range asks {
		ends := strings.IndexByte(stream[at:], '\n')
		if ends < 0 {
			break
		}
		head := strings.Fields(stream[at : at+ends])
		at += ends + 1
		if len(head) != batchFields {
			continue
		}
		size, err := strconv.Atoi(head[2])
		if err != nil {
			continue
		}
		to := min(at+size, len(stream))
		if head[1] == "blob" {
			out[ask] = stream[at:to]
		}
		at = min(to+1, len(stream))
	}
	return out, nil
}

// Every branch origin holds, the tracking refs of gone ones pruned. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) FetchAll() error {
	_, err := one.must("fetch", "--quiet", "--prune", originName)
	return err
}

func (one *door) DeleteRemote(branch string) error {
	_, err := one.must("push", "--quiet", originName, "--delete", branch)
	return err
}

// Deletes a ref by its full name, a local branch among them. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) DeleteRef(name string) error {
	_, err := one.must("update-ref", "-d", name)
	return err
}

// Folds the index into the commit HEAD stands on, its parents and its message kept. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) Amend() error {
	_, err := one.must("commit", "--quiet", "--amend", "--no-edit", "--allow-empty")
	return err
}

// Moves HEAD's branch to a ref, the index and the tracked work tree with it: hard drops local changes, and keep refuses to lose one. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) ResetTo(ref string, hard bool) error {
	mode := "--keep"
	if hard {
		mode = "--hard"
	}
	_, err := one.must("reset", "--quiet", mode, ref)
	return err
}

// The commits a ref stands on down its first parents, newest first. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) FirstParents(ref string) ([]string, error) {
	said, err := one.must("rev-list", "--first-parent", ref, "--")
	return rowsIn(said), err
}

// Every file a ref holds under a folder, or under its root for none, by path. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) Files(ref, folder string) ([]string, error) {
	args := []string{"ls-tree", "-r", "--name-only", "-z", ref}
	if folder != "" {
		args = append(args, "--", folder)
	}
	said, err := one.must(args...)
	if err != nil {
		return nil, err
	}
	out := []string{}
	for _, path := range strings.Split(said, "\x00") {
		if path != "" {
			out = append(out, path)
		}
	}
	sort.Strings(out)
	return out, nil
}

// The patch from one ref to another, or its stat, over the paths named or every one. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) Patch(a, b string, stat bool, paths ...string) (string, error) {
	args := []string{"diff", "--no-color", "--no-ext-diff"}
	if stat {
		args = append(args, "--stat")
	}
	return one.must(append(append(args, a, b, "--"), paths...)...)
}

// A commit onto a parent holding its tree with the files written over it, moving no ref and touching no work tree. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) CommitFiles(parent string, files map[string]string, message string) (string, error) {
	tree, err := one.treeWith(parent, "", files)
	if err != nil {
		return "", err
	}
	said, err := one.must("commit-tree", tree, "-p", parent, "-m", message)
	return strings.TrimSpace(said), err
}

// The tree a folder of a ref holds with the files written over it, every folder they reach made anew. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) treeWith(parent, folder string, files map[string]string) (string, error) {
	entries := map[string]string{}
	if said, err := one.must("ls-tree", "-z", parent+":"+folder); err == nil {
		for _, row := range strings.Split(said, "\x00") {
			if _, name, ok := strings.Cut(row, "\t"); ok {
				entries[name] = row
			}
		}
	}
	under := map[string]map[string]string{}
	for at, text := range files {
		name, rest, deep := strings.Cut(at, "/")
		if deep {
			if under[name] == nil {
				under[name] = map[string]string{}
			}
			under[name][rest] = text
			continue
		}
		said := one.run(proc.Command{Argv: []string{"git", "hash-object", "-w", "--stdin"}, Dir: one.root, Stdin: text})
		if said.Code != 0 {
			return "", errors.New(strings.TrimSpace(said.Err))
		}
		entries[at] = "100644 blob " + strings.TrimSpace(said.Out) + "\t" + at
	}
	for name, inside := range under {
		hash, err := one.treeWith(parent, path.Join(folder, name), inside)
		if err != nil {
			return "", err
		}
		entries[name] = "040000 tree " + hash + "\t" + name
	}
	rows := []string{}
	for _, name := range sortedKeys(entries) {
		rows = append(rows, entries[name])
	}
	said := one.run(proc.Command{Argv: []string{"git", "mktree", "-z"}, Dir: one.root, Stdin: strings.Join(rows, "\x00") + "\x00"})
	if said.Code != 0 {
		return "", errors.New(strings.TrimSpace(said.Err))
	}
	return strings.TrimSpace(said.Out), nil
}

func sortedKeys(set map[string]string) []string {
	out := make([]string, 0, len(set))
	for key := range set {
		out = append(out, key)
	}
	sort.Strings(out)
	return out
}

// A worktree at a path under the root, detached at a ref, the gone ones pruned first. [[spec/design_output/review#a-worktree-runs-the-check]]
func (one *door) AddWorktree(path, ref string) error {
	one.git("worktree", "prune")
	_, err := one.must("worktree", "add", "--quiet", "--detach", path, ref)
	return err
}

// Removes a worktree and every file it holds, then prunes. [[spec/design_output/review#a-worktree-runs-the-check]]
func (one *door) RemoveWorktree(path string) error {
	_, err := one.must("worktree", "remove", "--force", path)
	one.git("worktree", "prune")
	return err
}

// Fetches a shallow clone's history whole, and answers whether it stood shallow. [[spec/design_output/work#the-listing-reads-git-once]]
func (one *door) Unshallow() bool {
	if said, _ := one.word("rev-parse", "--is-shallow-repository"); said != "true" {
		return false
	}
	_, err := one.must("fetch", "--quiet", "--unshallow", originName)
	return err == nil
}

// The refs under a prefix whose commit a ref holds, by name. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) Merged(prefix, into string) ([]Ref, error) {
	said, err := one.must("for-each-ref", "--merged", into, "--format=%(refname)%00%(objectname)", prefix)
	if err != nil {
		return nil, err
	}
	out := []Ref{}
	for _, row := range rowsIn(said) {
		name, hash, _ := strings.Cut(row, "\x00")
		out = append(out, Ref{Name: name, Hash: hash})
	}
	return out, nil
}

// The second a ref's commit was made, by its committer. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *door) When(ref string) (int64, bool) {
	said, ok := one.word("log", "-1", "--format=%ct", ref, "--")
	if !ok {
		return 0, false
	}
	when, err := strconv.ParseInt(said, secondsBase, secondsBits)
	return when, err == nil
}

// The rows of an answer, the empty ones dropped. [[spec/design_output/doors#the-git-door-carries-writes]]
func rowsIn(said string) []string {
	out := []string{}
	for _, row := range strings.Split(said, "\n") {
		if row = strings.TrimSpace(row); row != "" {
			out = append(out, row)
		}
	}
	return out
}

// A path git quotes for an odd character, read back. [[spec/design_output/doors#the-git-door-carries-writes]]
func unquoted(path string) string {
	if strings.HasPrefix(path, `"`) {
		if said, err := strconv.Unquote(path); err == nil {
			return said
		}
	}
	return path
}

func sortedOf(set map[string]bool) []string {
	out := make([]string, 0, len(set))
	for key := range set {
		out = append(out, key)
	}
	sort.Strings(out)
	return out
}

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

func (one *FakeRepo) Head() (string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	if _, ok := one.headHash(); !ok {
		return "", errors.New("fatal: ambiguous argument 'HEAD': the branch holds no commit yet")
	}
	return strings.TrimPrefix(one.head, headsPrefix), nil
}

func (one *FakeRepo) Resolve(ref string) (string, bool) {
	one.mu.Lock()
	defer one.mu.Unlock()
	return one.resolve(ref)
}

func (one *FakeRepo) Fetch(branch string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	if one.origin == nil {
		return errors.New("fatal: 'origin' does not appear to be a git repository")
	}
	one.origin.mu.Lock()
	defer one.origin.mu.Unlock()
	hash, ok := one.origin.refs[headsPrefix+branch]
	if !ok {
		return fmt.Errorf("fatal: couldn't find remote ref %s", branch)
	}
	one.take(one.origin, hash)
	one.refs[trackPrefix+branch] = hash
	return nil
}

func (one *FakeRepo) Count(from, to string) (int, bool) {
	one.mu.Lock()
	defer one.mu.Unlock()
	start, ok := one.resolve(from)
	end, held := one.resolve(to)
	if !ok || !held {
		return 0, false
	}
	behind := one.ancestors(start)
	count := 0
	for hash := range one.ancestors(end) {
		if !behind[hash] {
			count++
		}
	}
	return count, true
}

func (one *FakeRepo) FastForward(ref string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	target, err := one.mustResolve(ref)
	if err != nil {
		return err
	}
	if here, born := one.headHash(); born {
		if one.ancestors(here)[target] {
			return nil
		}
		if !one.ancestors(target)[here] {
			return errors.New("fatal: Not possible to fast-forward, aborting.")
		}
	}
	return one.moveTo(target)
}

func (one *FakeRepo) mergeBase(a, b string) (string, bool) {
	left, right := one.ancestors(a), one.ancestors(b)
	common := map[string]bool{}
	for hash := range left {
		if right[hash] {
			common[hash] = true
		}
	}
	best := ""
	for hash := range common {
		beaten := false
		for other := range common {
			if other != hash && one.ancestors(other)[hash] {
				beaten = true
				break
			}
		}
		if !beaten && (best == "" || one.commits[hash].when > one.commits[best].when || (one.commits[hash].when == one.commits[best].when && hash < best)) {
			best = hash
		}
	}
	return best, best != ""
}

func (one *FakeRepo) MergeBase(a, b string) (string, bool) {
	one.mu.Lock()
	defer one.mu.Unlock()
	left, ok := one.resolve(a)
	right, held := one.resolve(b)
	if !ok || !held {
		return "", false
	}
	return one.mergeBase(left, right)
}

func (one *FakeRepo) IsAncestor(a, b string) bool {
	one.mu.Lock()
	defer one.mu.Unlock()
	left, ok := one.resolve(a)
	right, held := one.resolve(b)
	return ok && held && one.ancestors(right)[left]
}

// No fake commit carries a signature. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Signature(ref string) string {
	if _, ok := one.Resolve(ref); !ok {
		return ""
	}
	return noSignature
}

func (one *FakeRepo) RemoteHeads(prefix string) ([]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	if one.origin == nil {
		return nil, errors.New("fatal: 'origin' does not appear to be a git repository")
	}
	one.origin.mu.Lock()
	defer one.origin.mu.Unlock()
	out := []string{}
	for name := range one.origin.refs {
		if branch, ok := strings.CutPrefix(name, headsPrefix); ok && strings.HasPrefix(branch, prefix) {
			out = append(out, branch)
		}
	}
	sort.Strings(out)
	return out, nil
}

func (one *FakeRepo) Branch(name, at string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	hash, err := one.mustResolve(at)
	if err != nil {
		return err
	}
	if _, held := one.refs[headsPrefix+name]; held {
		return fmt.Errorf("fatal: a branch named '%s' already exists", name)
	}
	one.refs[headsPrefix+name] = hash
	return nil
}

func (one *FakeRepo) Push(branch string, upstream bool) Pushed {
	one.mu.Lock()
	defer one.mu.Unlock()
	local, ok := one.refs[headsPrefix+branch]
	if !ok && one.origin != nil {
		return Pushed{Err: fmt.Sprintf("error: src refspec %s does not match any", branch)}
	}
	return one.pushHash(local, branch, upstream)
}

func (one *FakeRepo) PushTo(commit, branch string) Pushed {
	one.mu.Lock()
	defer one.mu.Unlock()
	local, ok := one.resolve(commit)
	if !ok && one.origin != nil {
		return Pushed{Err: fmt.Sprintf("error: src refspec %s does not match any", commit)}
	}
	return one.pushHash(local, branch, false)
}

func (one *FakeRepo) pushHash(local, branch string, upstream bool) Pushed {
	if one.origin == nil {
		return Pushed{Err: "fatal: 'origin' does not appear to be a git repository"}
	}
	one.origin.mu.Lock()
	defer one.origin.mu.Unlock()
	if err := one.origin.hooked(preReceive, headsPrefix+branch, local); err != nil {
		return Pushed{Err: fmt.Sprintf("remote: %s\nTo origin\n ! [remote rejected] %s -> %s (pre-receive hook declined)\nerror: failed to push some refs to 'origin'", err, branch, branch)}
	}
	if remote, held := one.origin.refs[headsPrefix+branch]; held && !one.ancestors(local)[remote] {
		why := "(fetch first)"
		if _, known := one.commits[remote]; known {
			why = "(non-fast-forward)"
		}
		return Pushed{Moved: true, Err: fmt.Sprintf(" ! [rejected]        %s -> %s %s\nerror: failed to push some refs to 'origin'", branch, branch, why)}
	}
	one.origin.take(one, local)
	one.origin.refs[headsPrefix+branch] = local
	one.refs[trackPrefix+branch] = local
	if upstream {
		one.upstream(branch)
	}
	return Pushed{OK: true}
}

func (one *FakeRepo) Status(untracked bool) ([]Change, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	work, err := one.worktree()
	if err != nil {
		return nil, err
	}
	rows := map[string]*Change{}
	for _, change := range treeDiff(one.headTree(), one.index) {
		rows[change.Path] = &Change{Status: change.Status + " ", Path: change.Path, From: change.From}
	}
	for key := range one.unmerged {
		rows[key] = &Change{Status: "UU", Path: key}
	}
	for _, key := range keysOf(one.index) {
		if one.unmerged[key] {
			continue
		}
		worked := entryAt(work, key)
		if worked == entryAt(one.index, key) {
			continue
		}
		row, ok := rows[key]
		if !ok {
			row = &Change{Status: "  ", Path: key}
			rows[key] = row
		}
		letter := "M"
		if !worked.held {
			letter = "D"
		}
		row.Status = row.Status[:1] + letter
	}
	out := []Change{}
	for _, row := range rows {
		out = append(out, *row)
	}
	sort.Slice(out, func(x, y int) bool { return out[x].Path < out[y].Path })
	if untracked {
		rules := ignoreRules(work)
		for _, key := range keysOf(work) {
			if _, tracked := one.index[key]; !tracked && !one.unmerged[key] && !ignoredBy(rules, key) {
				out = append(out, Change{Status: "??", Path: key})
			}
		}
	}
	return out, nil
}

func (one *FakeRepo) Log(from, to string, ancestry bool) ([]Commit, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	end, err := one.mustResolve(to)
	if err != nil {
		return nil, err
	}
	set := one.ancestors(end)
	if from != "" {
		start, err := one.mustResolve(from)
		if err != nil {
			return nil, err
		}
		for hash := range one.ancestors(start) {
			delete(set, hash)
		}
		if ancestry {
			for hash := range set {
				if !one.ancestors(hash)[start] {
					delete(set, hash)
				}
			}
		}
	}
	return one.logOf(one.ordered(set, end)), nil
}

// The paths a commit changes against its first parent, and a merge's the paths it holds apart from every parent. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) changes(hash string) []Change {
	commit := one.commits[hash]
	first := map[string]string{}
	if len(commit.parents) > 0 {
		first = one.treeOf(commit.parents[0])
	}
	out := []Change{}
	for _, change := range treeDiff(first, commit.tree) {
		apart := true
		for _, parent := range commit.parents[min(1, len(commit.parents)):] {
			if entryAt(one.treeOf(parent), change.Path) == entryAt(commit.tree, change.Path) {
				apart = false
			}
		}
		if apart {
			out = append(out, change)
		}
	}
	return out
}

func (one *FakeRepo) Added(folder string) (map[string]int64, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	tip, ok := one.headHash()
	if !ok {
		return nil, errors.New("fatal: the branch holds no commit yet")
	}
	out := map[string]int64{}
	for _, hash := range one.ordered(one.ancestors(tip), tip) {
		if len(one.commits[hash].parents) > 1 {
			continue
		}
		for _, change := range one.changes(hash) {
			if _, seen := out[change.Path]; !seen && change.Status == "A" && len(matching(folder, map[string]string{change.Path: ""})) > 0 {
				out[change.Path] = one.commits[hash].when
			}
		}
	}
	return out, nil
}

func (one *FakeRepo) Show(ref, path string) (string, bool) {
	one.mu.Lock()
	defer one.mu.Unlock()
	return one.show(ref, path)
}

// A file at a ref, the index standing for the empty ref and a merge's stages for :1, :2 and :3. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) show(ref, path string) (string, bool) {
	if ref == "" || ref == ":0" {
		text, held := one.index[path]
		return text, held && !one.unmerged[path]
	}
	if stage, ok := strings.CutPrefix(ref, ":"); ok {
		at, err := strconv.Atoi(stage)
		sides, held := one.stages[path]
		if err != nil || at < 1 || at > conflictSides || !held || !one.unmerged[path] {
			return "", false
		}
		return sides[at-1].text, sides[at-1].held
	}
	hash, ok := one.resolve(ref)
	if !ok {
		return "", false
	}
	text, held := one.treeOf(hash)[path]
	return text, held
}

func (one *FakeRepo) Config(key string) (string, bool) {
	one.mu.Lock()
	defer one.mu.Unlock()
	said, ok := one.config[key]
	return said, ok
}

func (one *FakeRepo) Changed(commit string) ([]Change, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	hash, err := one.mustResolve(commit)
	if err != nil {
		return nil, err
	}
	return one.changes(hash), nil
}

func (one *FakeRepo) Diff(a, b string) ([]Change, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	left, err := one.mustResolve(a)
	if err != nil {
		return nil, err
	}
	right, err := one.mustResolve(b)
	if err != nil {
		return nil, err
	}
	return treeDiff(one.treeOf(left), one.treeOf(right)), nil
}

// The asked paths the ignore file holds out, past the paths the index tracks. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Ignored(paths []string) []string {
	one.mu.Lock()
	defer one.mu.Unlock()
	work, _ := one.worktree()
	rules := ignoreRules(work)
	out := []string{}
	for _, key := range paths {
		if _, tracked := one.index[key]; !tracked && ignoredBy(rules, key) {
			out = append(out, key)
		}
	}
	return out
}

func (one *FakeRepo) Tracked(path string) bool {
	one.mu.Lock()
	defer one.mu.Unlock()
	return len(matching(path, one.index)) > 0
}

// Stages each path the specs name off the work tree, a path gone from it leaving the index, and an ignored path staying out. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) stage(specs []string, refuse bool) error {
	work, err := one.worktree()
	if err != nil {
		return err
	}
	rules := ignoreRules(work)
	keys := map[string]bool{}
	for _, spec := range specs {
		found := matching(spec, work, one.index)
		if len(found) == 0 && refuse {
			return fmt.Errorf("fatal: pathspec '%s' did not match any files", spec)
		}
		for _, key := range found {
			keys[key] = true
		}
	}
	for key := range keys {
		_, tracked := one.index[key]
		if _, held := work[key]; held && !tracked && !one.unmerged[key] && ignoredBy(rules, key) {
			continue
		}
		entryAt(work, key).into(one.index, key)
		delete(one.unmerged, key)
	}
	return nil
}

func (one *FakeRepo) Add(paths []string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	return one.stage(paths, true)
}

func (one *FakeRepo) AddAll() error {
	one.mu.Lock()
	defer one.mu.Unlock()
	return one.stage([]string{"."}, false)
}

// Unstages the paths, or the whole index with the merge in hand where none is named. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Reset(paths []string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	base := one.headTree()
	if len(paths) == 0 {
		one.index, one.unmerged, one.merging = copyOf(base), map[string]bool{}, ""
		return nil
	}
	for _, spec := range paths {
		for _, key := range matching(spec, one.index, base) {
			entryAt(base, key).into(one.index, key)
			delete(one.unmerged, key)
		}
	}
	return nil
}

// Commits the index, or HEAD's tree with the named paths' work-tree text alone, and a merge in hand as the second parent. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Commit(message string, only []string) (string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	if err := one.identity(); err != nil {
		return "", err
	}
	if len(one.unmerged) > 0 {
		return "", errors.New("error: committing is not possible because you have unmerged files")
	}
	base := one.headTree()
	tree := copyOf(one.index)
	picked := map[string]entry{}
	if len(only) > 0 {
		if one.merging != "" {
			return "", errors.New("fatal: cannot do a partial commit during a merge")
		}
		work, err := one.worktree()
		if err != nil {
			return "", err
		}
		tree = copyOf(base)
		for _, spec := range only {
			found := matching(spec, one.index, base)
			if len(found) == 0 {
				return "", fmt.Errorf("error: pathspec '%s' did not match any file(s) known to git", spec)
			}
			for _, key := range found {
				picked[key] = entryAt(work, key)
				picked[key].into(tree, key)
			}
		}
	}
	if sameTree(tree, base) && one.merging == "" {
		return "", errors.New("nothing to commit, working tree clean")
	}
	if err := one.hooked(preCommit, one.head, ""); err != nil {
		return "", err
	}
	parents := []string{}
	if here, born := one.headHash(); born {
		parents = append(parents, here)
	}
	if one.merging != "" {
		parents = append(parents, one.merging)
	}
	subject, _, _ := strings.Cut(message, "\n")
	hash := one.store(&fakeCommit{parents: parents, tree: tree, subject: subject, when: one.now().Unix()})
	for key, at := range picked {
		at.into(one.index, key)
	}
	one.refs[one.head] = hash
	one.merging = ""
	return hash, nil
}

func (one *FakeRepo) Unmerged() ([]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	return sortedOf(one.unmerged), nil
}

func (one *FakeRepo) StagedAdds(only []string) ([]Line, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	base, staged := one.headTree(), within(one.index, only)
	out := []Line{}
	for _, change := range treeDiff(within(base, only), staged) {
		text := staged[change.Path]
		if (change.Status != "A" && change.Status != "M") || strings.ContainsRune(text, 0) {
			continue
		}
		for _, at := range addedLines(base[change.Path], text) {
			out = append(out, Line{File: change.Path, Line: at + 1, Text: linesOf(text)[at]})
		}
	}
	return out, nil
}

func linesOf(text string) []string {
	if text == "" {
		return nil
	}
	return strings.Split(strings.TrimSuffix(text, "\n"), "\n")
}

// The lines of the new text a longest common run of lines leaves unmatched, by their index. [[spec/design_output/doors#the-git-door-carries-writes]]
func addedLines(before, after string) []int {
	old, now := linesOf(before), linesOf(after)
	start := 0
	for start < len(old) && start < len(now) && old[start] == now[start] {
		start++
	}
	end := 0
	for end < len(old)-start && end < len(now)-start && old[len(old)-1-end] == now[len(now)-1-end] {
		end++
	}
	a, b := old[start:len(old)-end], now[start:len(now)-end]
	run := make([][]int, len(a)+1)
	for x := range run {
		run[x] = make([]int, len(b)+1)
	}
	for x := len(a) - 1; x >= 0; x-- {
		for y := len(b) - 1; y >= 0; y-- {
			if a[x] == b[y] {
				run[x][y] = run[x+1][y+1] + 1
			} else {
				run[x][y] = max(run[x+1][y], run[x][y+1])
			}
		}
	}
	out := []int{}
	x, y := 0, 0
	for y < len(b) {
		switch {
		case x < len(a) && a[x] == b[y]:
			x, y = x+1, y+1
		case x < len(a) && run[x+1][y] >= run[x][y+1]:
			x++
		default:
			out = append(out, start+y)
			y++
		}
	}
	return out
}

// Replays the commits HEAD holds past the ref onto it a path at a time, each keeping a whole path, and leaves everything as it stood on a conflict. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Rebase(onto string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	target, err := one.mustResolve(onto)
	if err != nil {
		return err
	}
	here, born := one.headHash()
	if !born || one.merging != "" {
		return errors.New("fatal: no branch stands ready to rebase")
	}
	if one.ancestors(here)[target] {
		return nil
	}
	if one.ancestors(target)[here] {
		return one.moveTo(target)
	}
	if err := one.clean(); err != nil {
		return err
	}
	base, _ := one.mergeBase(here, target)
	mine := one.ancestors(here)
	for hash := range one.ancestors(base) {
		delete(mine, hash)
	}
	replay := one.ordered(mine, here)
	tree, tip := copyOf(one.treeOf(target)), target
	for at := len(replay) - 1; at >= 0; at-- {
		commit := one.commits[replay[at]]
		if len(commit.parents) != 1 {
			continue
		}
		before := one.treeOf(commit.parents[0])
		for _, key := range keysOf(before, commit.tree) {
			was, now, stands := entryAt(before, key), entryAt(commit.tree, key), entryAt(tree, key)
			switch {
			case was == now || stands == now:
			case stands == was:
				now.into(tree, key)
			default:
				return fmt.Errorf("error: could not apply %s... %s: %s conflicts", replay[at][:shortHash], commit.subject, key)
			}
		}
		if sameTree(tree, one.treeOf(tip)) {
			continue
		}
		tip = one.store(&fakeCommit{parents: []string{tip}, tree: copyOf(tree), subject: commit.subject, when: one.now().Unix()})
	}
	return one.moveTo(tip)
}

// Refuses where the index or a tracked path of the work tree stands apart from HEAD. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) clean() error {
	work, err := one.worktree()
	if err != nil {
		return err
	}
	if !sameTree(one.index, one.headTree()) {
		return errors.New("error: cannot rebase: your index contains uncommitted changes")
	}
	for key, text := range one.index {
		if entryAt(work, key) != (entry{text, true}) {
			return errors.New("error: cannot rebase: you have unstaged changes")
		}
	}
	return nil
}

func (one *FakeRepo) Refs(prefix string) ([]Ref, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	out := []Ref{}
	for name, hash := range one.refs {
		if strings.HasPrefix(name, prefix) {
			out = append(out, Ref{Name: name, Hash: hash})
		}
	}
	sort.Slice(out, func(x, y int) bool { return out[x].Name < out[y].Name })
	return out, nil
}

func (one *FakeRepo) Staged(only []string) ([]Change, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	return treeDiff(within(one.headTree(), only), within(one.index, only)), nil
}

func (one *FakeRepo) SoftReset(ref string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	if one.merging != "" {
		return errors.New("fatal: cannot do a soft reset in the middle of a merge")
	}
	hash, err := one.mustResolve(ref)
	if err != nil {
		return err
	}
	one.refs[one.head] = hash
	return nil
}

func (one *FakeRepo) UpdateRef(name, hash string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	at, err := one.mustResolve(hash)
	if err != nil {
		return err
	}
	switch {
	case name == mergeHead:
		one.merging = at
	case name == "HEAD":
		one.refs[one.head] = at
	case strings.HasPrefix(name, "refs/"):
		one.refs[name] = at
	default:
		return fmt.Errorf("fatal: update-ref takes no ref named %s", name)
	}
	return nil
}

// The commits touching a path newest first, a merge followed down the one parent holding the path as it does. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) History(path string) ([]Commit, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	tip, ok := one.headHash()
	if !ok {
		return nil, errors.New("fatal: the branch holds no commit yet")
	}
	walked, touching := map[string]bool{}, map[string]bool{}
	for next := []string{tip}; len(next) > 0; {
		hash := next[len(next)-1]
		next = next[:len(next)-1]
		if walked[hash] {
			continue
		}
		walked[hash] = true
		commit := one.commits[hash]
		stands := entryAt(commit.tree, path)
		same := ""
		for _, parent := range commit.parents {
			if entryAt(one.treeOf(parent), path) == stands {
				same = parent
				break
			}
		}
		if same != "" {
			next = append(next, same)
			continue
		}
		if len(commit.parents) > 0 || stands.held {
			touching[hash] = true
		}
		next = append(next, commit.parents...)
	}
	out := []string{}
	for _, hash := range one.ordered(walked, tip) {
		if touching[hash] {
			out = append(out, hash)
		}
	}
	return one.logOf(out), nil
}

func (one *FakeRepo) Switch(name string, create bool) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	ref := headsPrefix + name
	hash, held := one.refs[ref]
	if create {
		if held {
			return fmt.Errorf("fatal: a branch named '%s' already exists", name)
		}
		if here, born := one.headHash(); born {
			one.refs[ref] = here
		}
		one.head = ref
		return nil
	}
	if one.merging != "" {
		return errors.New("fatal: you are in the middle of a merge")
	}
	if !held {
		remote, tracked := one.refs[trackPrefix+name]
		if !tracked {
			return fmt.Errorf("fatal: invalid reference: %s", name)
		}
		hash = remote
	}
	from, to := one.headTree(), one.treeOf(hash)
	if err := one.overwrites(from, to); err != nil {
		return err
	}
	if err := one.checkout(from, to); err != nil {
		return err
	}
	if !held {
		one.refs[ref] = hash
		one.upstream(name)
	}
	one.head = ref
	return nil
}

// Merges three ways a path at a time: a path both sides change apart conflicts whole, its markers in the work tree. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Merge(ref, message string, noFF bool) ([]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	subject := "Merge branch '" + ref + "'"
	if message != "" {
		subject, _, _ = strings.Cut(message, "\n")
	}
	theirs, ok := one.resolve(ref)
	if !ok {
		return nil, fmt.Errorf("merge: %s - not something we can merge", ref)
	}
	if one.merging != "" {
		return nil, errors.New("fatal: you have not concluded your merge")
	}
	ours, born := one.headHash()
	if born && one.ancestors(ours)[theirs] {
		return nil, nil
	}
	if !born || (!noFF && one.ancestors(theirs)[ours]) {
		return nil, one.moveTo(theirs)
	}
	if err := one.identity(); err != nil {
		return nil, err
	}
	if one.ancestors(theirs)[ours] {
		from, to := one.headTree(), one.treeOf(theirs)
		if err := one.overwrites(from, to); err != nil {
			return nil, err
		}
		if err := one.checkout(from, to); err != nil {
			return nil, err
		}
		one.refs[one.head] = one.store(&fakeCommit{parents: []string{ours, theirs}, tree: copyOf(to), subject: subject, when: one.now().Unix()})
		return nil, nil
	}
	baseHash, _ := one.mergeBase(ours, theirs)
	base, mine, other := one.treeOf(baseHash), one.treeOf(ours), one.treeOf(theirs)
	merged, written, conflicts := map[string]string{}, map[string]string{}, []string{}
	for _, key := range keysOf(base, mine, other) {
		was, kept, came := entryAt(base, key), entryAt(mine, key), entryAt(other, key)
		switch {
		case kept == came || was == came:
			kept.into(merged, key)
		case was == kept:
			came.into(merged, key)
		default:
			conflicts = append(conflicts, key)
			kept.into(merged, key)
			one.stages[key] = [conflictSides]entry{was, kept, came}
			switch {
			case !kept.held:
				written[key] = came.text
			case !came.held:
				written[key] = kept.text
			default:
				written[key] = "<<<<<<< HEAD\n" + endsLine(kept.text) + "=======\n" + endsLine(came.text) + ">>>>>>> " + ref + "\n"
			}
		}
	}
	shown := copyOf(merged)
	for key, text := range written {
		shown[key] = text
	}
	if err := one.overwrites(mine, shown); err != nil {
		return nil, err
	}
	if err := one.checkout(mine, merged); err != nil {
		return nil, err
	}
	if len(conflicts) == 0 {
		hash := one.store(&fakeCommit{parents: []string{ours, theirs}, tree: merged, subject: subject, when: one.now().Unix()})
		one.refs[one.head] = hash
		return nil, nil
	}
	for _, key := range conflicts {
		if err := one.tree.Write(key, written[key]); err != nil {
			return nil, err
		}
		one.unmerged[key] = true
	}
	one.merging = theirs
	return conflicts, errors.New("Automatic merge failed; fix conflicts and then commit the result")
}

func (one *FakeRepo) CommitTree(of, parent, message string) (string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	source, err := one.mustResolve(of)
	if err != nil {
		return "", err
	}
	return one.commitOnto(parent, copyOf(one.treeOf(source)), message)
}

func (one *FakeRepo) commitOnto(parent string, tree map[string]string, message string) (string, error) {
	if err := one.identity(); err != nil {
		return "", err
	}
	base, err := one.mustResolve(parent)
	if err != nil {
		return "", err
	}
	subject, _, _ := strings.Cut(message, "\n")
	return one.store(&fakeCommit{parents: []string{base}, tree: tree, subject: subject, when: one.now().Unix()}), nil
}

func (one *FakeRepo) CommitFiles(parent string, files map[string]string, message string) (string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	base, err := one.mustResolve(parent)
	if err != nil {
		return "", err
	}
	tree := copyOf(one.treeOf(base))
	for path, text := range files {
		tree[path] = text
	}
	return one.commitOnto(base, tree, message)
}

// What a commit changes against its one parent, path by path and text by text, which two commits share where they carry one patch. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) patchOf(hash string) string {
	commit := one.commits[hash]
	before := one.treeOf(commit.parents[0])
	var out strings.Builder
	for _, key := range keysOf(before, commit.tree) {
		was, now := entryAt(before, key), entryAt(commit.tree, key)
		if was != now {
			fmt.Fprintf(&out, "%s\x00%v\x00%s\x00%v\x00%s\x00", key, was.held, was.text, now.held, now.text)
		}
	}
	return out.String()
}

func (one *FakeRepo) Cherry(upstream, head string) ([]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	up, err := one.mustResolve(upstream)
	if err != nil {
		return nil, err
	}
	tip, err := one.mustResolve(head)
	if err != nil {
		return nil, err
	}
	ours, theirs := one.ancestors(tip), one.ancestors(up)
	taken := map[string]bool{}
	for hash := range theirs {
		if !ours[hash] && len(one.commits[hash].parents) == 1 {
			taken[one.patchOf(hash)] = true
		}
	}
	mine := map[string]bool{}
	for hash := range ours {
		if !theirs[hash] {
			mine[hash] = true
		}
	}
	newest := one.ordered(mine, tip)
	out := []string{}
	for at := len(newest) - 1; at >= 0; at-- {
		if hash := newest[at]; len(one.commits[hash].parents) == 1 && !taken[one.patchOf(hash)] {
			out = append(out, hash)
		}
	}
	return out, nil
}

func (one *FakeRepo) RemoteRefs(prefix string) ([]Ref, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	if one.origin == nil {
		return nil, errors.New("fatal: 'origin' does not appear to be a git repository")
	}
	return one.origin.Refs(prefix)
}

func (one *FakeRepo) Restore(path string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	base := one.headTree()
	found := matching(path, base)
	if len(found) == 0 {
		return fmt.Errorf("error: pathspec '%s' did not match any file(s) known to git", path)
	}
	for _, key := range found {
		if err := one.place(key, entryAt(base, key)); err != nil {
			return err
		}
		delete(one.unmerged, key)
	}
	return nil
}

func (one *FakeRepo) ShowMany(asks []string) (map[string]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	out := map[string]string{}
	for _, ask := range asks {
		ref, path, _ := strings.Cut(ask, ":")
		if ref == "" {
			continue
		}
		if text, ok := one.show(ref, path); ok {
			out[ask] = text
		}
	}
	return out, nil
}

func (one *FakeRepo) FetchAll() error {
	one.mu.Lock()
	defer one.mu.Unlock()
	if one.origin == nil {
		return errors.New("fatal: 'origin' does not appear to be a git repository")
	}
	one.origin.mu.Lock()
	defer one.origin.mu.Unlock()
	for name := range one.refs {
		if branch, ok := strings.CutPrefix(name, trackPrefix); ok {
			if _, held := one.origin.refs[headsPrefix+branch]; !held {
				delete(one.refs, name)
			}
		}
	}
	for name, hash := range one.origin.refs {
		if branch, ok := strings.CutPrefix(name, headsPrefix); ok {
			one.takeFetched(hash)
			one.refs[trackPrefix+branch] = hash
		}
	}
	return nil
}

// Copies what origin holds of a hash, the tip alone where this clone stands shallow and lacks it. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) takeFetched(hash string) {
	if !one.shallow {
		one.take(one.origin, hash)
		return
	}
	if _, held := one.commits[hash]; !held {
		one.commits[hash] = one.origin.commits[hash]
	}
}

func (one *FakeRepo) DeleteRemote(branch string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	if one.origin == nil {
		return errors.New("fatal: 'origin' does not appear to be a git repository")
	}
	one.origin.mu.Lock()
	defer one.origin.mu.Unlock()
	if _, held := one.origin.refs[headsPrefix+branch]; !held {
		return fmt.Errorf("error: unable to delete '%s': remote ref does not exist", branch)
	}
	if err := one.origin.hooked(preReceive, headsPrefix+branch, ""); err != nil {
		return fmt.Errorf("remote: %s\n ! [remote rejected] %s (pre-receive hook declined)", err, branch)
	}
	delete(one.origin.refs, headsPrefix+branch)
	delete(one.refs, trackPrefix+branch)
	return nil
}

func (one *FakeRepo) DeleteRef(name string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	delete(one.refs, name)
	return nil
}

func (one *FakeRepo) Amend() error {
	one.mu.Lock()
	defer one.mu.Unlock()
	if err := one.identity(); err != nil {
		return err
	}
	here, born := one.headHash()
	if !born {
		return errors.New("fatal: You have nothing to amend.")
	}
	if len(one.unmerged) > 0 || one.merging != "" {
		return errors.New("fatal: You are in the middle of a merge -- cannot amend.")
	}
	was := one.commits[here]
	one.refs[one.head] = one.store(&fakeCommit{parents: was.parents, tree: copyOf(one.index), subject: was.subject, when: one.now().Unix()})
	return nil
}

func (one *FakeRepo) ResetTo(ref string, hard bool) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	hash, err := one.mustResolve(ref)
	if err != nil {
		return err
	}
	if !hard {
		if one.merging != "" || len(one.unmerged) > 0 {
			return errors.New("error: Entry not uptodate. Cannot merge.")
		}
		return one.moveTo(hash)
	}
	to, base := one.treeOf(hash), one.headTree()
	for _, key := range keysOf(base, one.index, to) {
		at := entryAt(to, key)
		if at.held {
			err = one.tree.Write(key, at.text)
		} else {
			err = one.tree.Remove(key)
		}
		if err != nil {
			return err
		}
	}
	one.index, one.unmerged, one.merging = copyOf(to), map[string]bool{}, ""
	one.refs[one.head] = hash
	return nil
}

func (one *FakeRepo) FirstParents(ref string) ([]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	hash, err := one.mustResolve(ref)
	if err != nil {
		return nil, err
	}
	out := []string{}
	for ok := true; ok; hash, ok = one.parent(hash, 1) {
		if _, held := one.commits[hash]; !held {
			break
		}
		out = append(out, hash)
	}
	return out, nil
}

func (one *FakeRepo) Files(ref, folder string) ([]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	hash, err := one.mustResolve(ref)
	if err != nil {
		return nil, err
	}
	return matching(folder, one.treeOf(hash)), nil
}

// A patch the fake writes a path as one hunk holding the whole of both texts, so its added and removed lines read as git's do. [[spec/design_output/doors#the-git-door-carries-writes]]
func (one *FakeRepo) Patch(a, b string, stat bool, paths ...string) (string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	left, err := one.mustResolve(a)
	if err != nil {
		return "", err
	}
	right, err := one.mustResolve(b)
	if err != nil {
		return "", err
	}
	before, after := within(one.treeOf(left), paths), within(one.treeOf(right), paths)
	var out strings.Builder
	files, added, removed := 0, 0, 0
	for _, change := range treeDiff(before, after) {
		files++
		if change.Status == "R" {
			if stat {
				fmt.Fprintf(&out, " %s => %s | 0\n", change.From, change.Path)
			} else {
				fmt.Fprintf(&out, "diff --git a/%s b/%s\nsimilarity index 100%%\nrename from %s\nrename to %s\n", change.From, change.Path, change.From, change.Path)
			}
			continue
		}
		rows := lineDiff(before[change.Path], after[change.Path])
		plus, minus := 0, 0
		for _, row := range rows {
			switch row[0] {
			case '+':
				plus++
			case '-':
				minus++
			}
		}
		added, removed = added+plus, removed+minus
		if stat {
			fmt.Fprintf(&out, " %s | %d %s%s\n", change.Path, plus+minus, strings.Repeat("+", plus), strings.Repeat("-", minus))
			continue
		}
		from, to := "a/"+change.Path, "b/"+change.Path
		fmt.Fprintf(&out, "diff --git %s %s\n", from, to)
		switch change.Status {
		case "A":
			out.WriteString("new file mode 100644\n")
			from = "/dev/null"
		case "D":
			out.WriteString("deleted file mode 100644\n")
			to = "/dev/null"
		}
		fmt.Fprintf(&out, "--- %s\n+++ %s\n@@ -1,%d +1,%d @@\n%s\n", from, to, len(linesOf(before[change.Path])), len(linesOf(after[change.Path])), strings.Join(rows, "\n"))
	}
	if stat && files > 0 {
		fmt.Fprintf(&out, " %d file%s changed", files, plural(files))
		if added > 0 {
			fmt.Fprintf(&out, ", %d insertion%s(+)", added, plural(added))
		}
		if removed > 0 {
			fmt.Fprintf(&out, ", %d deletion%s(-)", removed, plural(removed))
		}
		out.WriteString("\n")
	}
	return out.String(), nil
}

func plural(count int) string {
	if count == 1 {
		return ""
	}
	return "s"
}

// The rows of a line diff: a space for a kept line, and each run of changes its removed lines before its added ones. [[spec/design_output/doors#the-git-door-carries-writes]]
func lineDiff(before, after string) []string {
	a, b := linesOf(before), linesOf(after)
	run := make([][]int, len(a)+1)
	for x := range run {
		run[x] = make([]int, len(b)+1)
	}
	for x := len(a) - 1; x >= 0; x-- {
		for y := len(b) - 1; y >= 0; y-- {
			if a[x] == b[y] {
				run[x][y] = run[x+1][y+1] + 1
			} else {
				run[x][y] = max(run[x+1][y], run[x][y+1])
			}
		}
	}
	out, gone, came := []string{}, []string{}, []string{}
	flush := func() {
		out = append(append(out, gone...), came...)
		gone, came = nil, nil
	}
	x, y := 0, 0
	for x < len(a) || y < len(b) {
		switch {
		case x < len(a) && y < len(b) && a[x] == b[y]:
			flush()
			out = append(out, " "+a[x])
			x, y = x+1, y+1
		case y >= len(b) || (x < len(a) && run[x+1][y] >= run[x][y+1]):
			gone = append(gone, "-"+a[x])
			x++
		default:
			came = append(came, "+"+b[y])
			y++
		}
	}
	flush()
	return out
}

// A worktree the fake writes under a path of its work tree, detached at a ref. [[spec/design_output/review#a-worktree-runs-the-check]]
func (one *FakeRepo) AddWorktree(path, ref string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	hash, err := one.mustResolve(ref)
	if err != nil {
		return err
	}
	if standing, _ := one.tree.List(path); one.worktrees[path] || len(standing) > 0 {
		return fmt.Errorf("fatal: '%s' already exists", path)
	}
	for key, text := range one.treeOf(hash) {
		if err := one.tree.Write(path+"/"+key, text); err != nil {
			written, _ := one.tree.List(path)
			for _, each := range written {
				_ = one.tree.Remove(each)
			}
			return fmt.Errorf("fatal: could not create work tree dir '%s': %w", path, err)
		}
	}
	one.worktrees[path] = true
	return nil
}

func (one *FakeRepo) RemoveWorktree(path string) error {
	one.mu.Lock()
	defer one.mu.Unlock()
	if !one.worktrees[path] {
		return fmt.Errorf("fatal: '%s' is not a working tree", path)
	}
	delete(one.worktrees, path)
	standing, err := one.tree.List(path)
	if err != nil {
		return err
	}
	for _, key := range standing {
		if err := one.tree.Remove(key); err != nil {
			return err
		}
	}
	return nil
}

func (one *FakeRepo) Unshallow() bool {
	one.mu.Lock()
	defer one.mu.Unlock()
	if !one.shallow || one.origin == nil {
		return false
	}
	one.origin.mu.Lock()
	defer one.origin.mu.Unlock()
	one.shallow = false
	for _, hash := range one.refs {
		one.take(one.origin, hash)
	}
	return true
}

func (one *FakeRepo) Merged(prefix, into string) ([]Ref, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	tip, err := one.mustResolve(into)
	if err != nil {
		return nil, err
	}
	reached := one.ancestors(tip)
	out := []Ref{}
	for name, hash := range one.refs {
		if strings.HasPrefix(name, prefix) && reached[hash] {
			out = append(out, Ref{Name: name, Hash: hash})
		}
	}
	sort.Slice(out, func(x, y int) bool { return out[x].Name < out[y].Name })
	return out, nil
}

func (one *FakeRepo) When(ref string) (int64, bool) {
	one.mu.Lock()
	defer one.mu.Unlock()
	hash, ok := one.resolve(ref)
	if !ok {
		return 0, false
	}
	return one.commits[hash].when, true
}

func endsLine(text string) string {
	if text != "" && !strings.HasSuffix(text, "\n") {
		return text + "\n"
	}
	return text
}
