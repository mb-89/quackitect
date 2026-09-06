package main

import (
	"encoding/json"
	"fmt"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"sync"
)

// A CLONE BEHIND THE BRANCH READS ITS OWN doc/work, AND THERE A CLOSED TOKEN
// STILL READS OPEN.
//
// MEASURED, ON 2026-09-05. A box handed out wk-a463727d87 as open work. The
// branch had closed and archived it hours before: the change was on it, the
// note carried both checklists answered, and doc/work/archive.jsonl named the
// token. The clone was three hours behind, its copy of the note stood as it had
// before the close, and the pull read that copy. The claim relay could not
// help: a claim says who holds a token and nothing about whether it has ended.
//
// THE CLOSE IS READ FROM THE FETCHED BRANCH. Every box fetches before it works,
// so the branch this tree tracks is already in .git, and the archive list is a
// file on it. One git show answers which ids the branch has archived, nothing
// on the pull path touches the network, and the working tree is not moved:
// bringing doc/work into step is the person's, and the pull only declines to
// hand out what has ended. The answer names each token it passed over and the
// branch that closed it, so a shorter queue is explained rather than guessed.
//
// A TREE THAT TRACKS NO BRANCH, OR HAS NEVER FETCHED, READS AS BEFORE. There
// is nothing to read, so nothing is passed over.

// archiveOnBranch is where the archive list sits in a commit, which is what a
// git show is asked for. ArchiveList answers the same file on the disk.
const archiveOnBranch = "doc/work/archive.jsonl"

// fetchedBranch answers the commit the branch this tree tracks stood at when it
// was last fetched, and the name the answer calls it, or nothing where the tree
// tracks none.
//
// THE UPSTREAM FIRST, AND ORIGIN'S HEAD WHERE THERE IS NONE. A checkout of the
// branch tracks it. A detached worktree tracks nothing, and origin's default
// branch is then the best reading of where a close would be.
func fetchedBranch(r Roots) (commit, name string) {
	if commit, err := gitHere(r, "rev-parse", "--verify", "--quiet", "@{upstream}"); err == nil && commit != "" {
		name, err := gitHere(r, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}")
		if err != nil || name == "" {
			name = "the branch this tree tracks"
		}
		return commit, name
	}
	const head = "refs/remotes/origin/HEAD"
	if commit, err := gitHere(r, "rev-parse", "--verify", "--quiet", head); err == nil && commit != "" {
		name, err := gitHere(r, "symbolic-ref", "--short", head)
		if err != nil || name == "" {
			name = "origin/HEAD"
		}
		return commit, name
	}
	return "", ""
}

// archivedAt is the last reading of the list at a commit. The same commit names
// the same ids, and a resident engine answers many pulls between two fetches,
// so the list is read once per commit rather than once per pull.
var archivedAt struct {
	sync.Mutex
	commit string
	ids    map[string]bool
}

// archivedOn answers the ids the archive list names at a commit.
//
// A COMMIT WITHOUT THE LIST HAS ARCHIVED NOTHING. A line that will not read is
// passed over rather than refused: this is a reading of another tree's record,
// and a refusal would stop the queue over a file this box cannot mend.
func archivedOn(r Roots, commit string) map[string]bool {
	archivedAt.Lock()
	defer archivedAt.Unlock()
	if archivedAt.commit == commit {
		return archivedAt.ids
	}
	ids := map[string]bool{}
	if said, err := gitHere(r, "show", commit+":"+archiveOnBranch); err == nil {
		for _, line := range strings.Split(said, "\n") {
			var row Archived
			if json.Unmarshal([]byte(strings.TrimSpace(line)), &row) == nil && row.ID != "" {
				ids[row.ID] = true
			}
		}
	}
	archivedAt.commit, archivedAt.ids = commit, ids
	return ids
}

// ArchivedOnTheBranch answers the ids the fetched branch has already archived.
// It changes nothing, and it is empty where the tree tracks no branch or has
// never fetched.
//
// THE PULL AND THE COUNT READ ONE RULE. The queue hands out what is left after
// this, and the staffing count counts what the queue would hand out. Two
// readings of one rule drift, and this drift deadlocked a session: the count
// knew nothing of the branch and demanded reviewers for forty-one tokens no
// pull would ever produce. Each spawned reviewer was told wait and left, so
// the demand came back for ever.
func ArchivedOnTheBranch(r Roots) map[string]bool {
	commit, _ := fetchedBranch(r)
	if commit == "" {
		return nil
	}
	return archivedOn(r, commit)
}

// offTheFetchedBranch takes out of the queue every open token the fetched
// branch has archived, and answers what it took and the branch's name.
//
// ONE THE ACTOR HOLDS IS PUT DOWN, the way a token that waits on a person is,
// so it stops counting as theirs on every pull that follows. The note stays on
// the disk: the tree is the person's to bring into step.
func offTheFetchedBranch(r Roots, actor string, all []Token) (kept []Token, behind []string, branch string) {
	_, branch = fetchedBranch(r)
	archived := ArchivedOnTheBranch(r)
	if len(archived) == 0 {
		return all, nil, branch
	}
	kept = make([]Token, 0, len(all))
	for _, t := range all {
		if t.Ended() || !archived[t.ID] {
			kept = append(kept, t)
			continue
		}
		if t.Holder == actor {
			_, _ = PutDown(r, t.ID, actor)
		}
		behind = append(behind, t.ID)
	}
	if len(behind) > 0 {
		inSession(r, "work", actor, "passed over, archived on "+branch+" while this clone is behind it",
			sessionlog.Yes(), map[string]any{"ids": behind, "branch": branch})
	}
	return kept, behind, branch
}

// behindNotice names what the queue passed over because the fetched branch has
// archived it, and says what brings the tree into step. It rides on every
// answer, work or wait, because the queue is shorter either way.
func behindNotice(branch string, behind []string) string {
	if len(behind) == 0 {
		return ""
	}
	return fmt.Sprintf("\n\nPassed over, because %s has archived them and this clone is behind it:\n  %s\n\n"+
		"They are not open work. Bring doc/work into step with %s, and pull again.",
		branch, strings.Join(behind, "\n  "), branch)
}
