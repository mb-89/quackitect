// FakeRepo's verbs that read refs, history and the work tree, and the push
// verbs that move origin. [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
)

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

func (one *FakeRepo) ForcePushTo(commit, branch string) Pushed {
	one.mu.Lock()
	defer one.mu.Unlock()
	local, ok := one.resolve(commit)
	if !ok && one.origin != nil {
		return Pushed{Err: fmt.Sprintf("error: src refspec %s does not match any", commit)}
	}
	if one.origin == nil {
		return one.pushHash(local, branch, false)
	}
	one.origin.mu.Lock()
	was, held := one.origin.refs[headsPrefix+branch]
	delete(one.origin.refs, headsPrefix+branch)
	one.origin.mu.Unlock()
	pushed := one.pushHash(local, branch, false)
	if !pushed.OK && held {
		one.origin.mu.Lock()
		one.origin.refs[headsPrefix+branch] = was
		one.origin.mu.Unlock()
	}
	return pushed
}

func (one *FakeRepo) EmptyCommit(message string) (string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	if err := one.identity(); err != nil {
		return "", err
	}
	subject, _, _ := strings.Cut(message, "\n")
	return one.store(&fakeCommit{tree: map[string]string{}, subject: subject, when: one.now().Unix()}), nil
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
