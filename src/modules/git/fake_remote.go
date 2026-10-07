// FakeRepo's verbs on origin, patches, resets and worktrees.
// [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"errors"
	"fmt"
	"sort"
	"strings"
)

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
