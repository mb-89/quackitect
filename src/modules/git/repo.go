// The git door that carries writes: the typed operations the pull and the branch
// verbs run, each one git command line in the real door over a process runner,
// and FakeRepo beside it on a work tree any Disk holds. [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

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
	// A parentless commit on the empty tree, and a push of a commit onto the branch whatever origin holds there, which a beat writes. [[spec/design_output/work#the-session-beats-its-hold]]
	EmptyCommit(message string) (string, error)
	ForcePushTo(commit, branch string) Pushed
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

func (one *door) ForcePushTo(commit, branch string) Pushed {
	return one.pushed("push", "--quiet", "--force", originName, commit+":"+headsPrefix+branch)
}

// The empty tree comes off git itself, so a repository of either hash names it. [[spec/design_output/work#the-session-beats-its-hold]]
func (one *door) EmptyCommit(message string) (string, error) {
	empty := one.run(proc.Command{Argv: []string{"git", "hash-object", "-w", "-t", "tree", "--stdin"}, Dir: one.root, Env: []string{"LC_ALL=C"}})
	if empty.Code != 0 {
		return "", fmt.Errorf("git names no empty tree: %s", strings.TrimSpace(empty.Err))
	}
	said, err := one.must("commit-tree", strings.TrimSpace(empty.Out), "-m", message)
	return strings.TrimSpace(said), err
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
	return addedIn(said, unquoted), nil
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
	return AddsIn(said), nil
}

// The added lines of a diff with no context, by file and line, a binary file skipped. [[spec/design_output/work#no-commit-carries-a-marker]]
func AddsIn(said string) []Line {
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
			// Git ends a path holding a space with a tab. [[spec/tickets/staged-adds-drop-the-tab]]
			file = strings.TrimPrefix(unquoted(strings.TrimSuffix(row[len("+++ "):], "\t")), "b/")
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

// A ref set to a commit. Git from 2.45 on refuses update-ref on MERGE_HEAD as a pseudoref, so the door writes its file in the git folder, as git merge does. [[spec/tickets/the-doors-pr-goes-green]]
func (one *door) UpdateRef(name, hash string) error {
	if name != mergeHead {
		_, err := one.must("update-ref", name, hash)
		return err
	}
	full, ok := one.word("rev-parse", "--verify", "--quiet", hash+"^{commit}")
	if !ok {
		return fmt.Errorf("%s names no commit", hash)
	}
	at, ok := one.word("rev-parse", "--git-path", mergeHead)
	if !ok {
		return errors.New("git names no path for " + mergeHead)
	}
	if !filepath.IsAbs(at) {
		at = filepath.Join(one.root, at)
	}
	return os.WriteFile(at, []byte(full+"\n"), 0o644)
}
