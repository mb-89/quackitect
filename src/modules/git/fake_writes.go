// FakeRepo's verbs that stage, commit, rebase, merge and move refs.
// [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"errors"
	"fmt"
	"sort"
	"strings"
)

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
