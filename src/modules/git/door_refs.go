// The real door's verbs on branches, refs, trees and worktrees, and the
// readers of git's answers they share. [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"errors"
	"maps"
	"path"
	"slices"
	"sort"
	"strconv"
	"strings"

	"quackitect/src/proc"
)

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
	for _, name := range slices.Sorted(maps.Keys(entries)) {
		rows = append(rows, entries[name])
	}
	said := one.run(proc.Command{Argv: []string{"git", "mktree", "-z"}, Dir: one.root, Stdin: strings.Join(rows, "\x00") + "\x00"})
	if said.Code != 0 {
		return "", errors.New(strings.TrimSpace(said.Err))
	}
	return strings.TrimSpace(said.Out), nil
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
