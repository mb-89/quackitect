package main

import (
	"encoding/json"
	"fmt"
	"path/filepath"
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

// theNoteStandsOnTheBranch answers the ids whose note is on the fetched branch
// exactly as it is here.
//
// FOR THOSE, THIS CLONE IS NOT BEHIND. The branch carries an archive row and an
// open note for one token at once, so bringing doc/work into step changes
// nothing and the two halves of the record disagree with each other.
//
// MEASURED, September 2026. Three ids were named on every pull of a session,
// with an instruction to bring the tree into step. Two of them stood on the
// branch byte for byte as they stood here. Three hands acted on that notice and
// none of them could have satisfied it.
func theNoteStandsOnTheBranch(r Roots, commit string, behind []string) map[string]bool {
	same := map[string]bool{}
	if commit == "" {
		return same
	}
	for _, id := range behind {
		path := "doc/work/" + id + ".md"
		there, err := gitHere(r, "rev-parse", "--verify", "--quiet", commit+":"+path)
		if err != nil || strings.TrimSpace(there) == "" {
			continue // the branch dropped the note, so this clone really is behind
		}
		here, err := gitHere(r, "hash-object", path)
		if err != nil || strings.TrimSpace(here) == "" {
			continue // no note here to compare, so the lag reading stands
		}
		if strings.TrimSpace(here) == strings.TrimSpace(there) {
			same[id] = true
		}
	}
	return same
}

// whereTheNoteIs answers the file a passed-over token was read from, written as
// a reader would type it, and whether that file is this box's own.
//
// A REMEDY NAMES A FILE AND NOT A FOLDER. The stale copy is under doc/work on
// one box and under .se/work on another, and only the first is a lag a fetch
// closes. Where the token has no file at all, doc/work is the folder it would
// have been in, and naming it is the closest true thing to say.
func whereTheNoteIs(r Roots, id string) (shown string, private bool) {
	at := noteAt(r, id)
	if at == "" {
		return "doc/work/" + id + ".md", false
	}
	shown = filepath.ToSlash(at)
	if rel, err := filepath.Rel(r.Work, at); err == nil && !strings.HasPrefix(rel, "..") {
		shown = filepath.ToSlash(rel)
	}
	return shown, strings.HasPrefix(filepath.ToSlash(at), filepath.ToSlash(LocalDir(r))+"/")
}

// behindNotice names what the queue passed over because the fetched branch has
// archived it. It rides on every answer, work or wait, because the queue is
// shorter either way.
//
// IT ONLY BLAMES A LAG IT CANNOT RULE OUT. Where the note here is the branch's
// own note, there is no lag to close, and the answer says the branch disagrees
// with itself instead of asking for a fetch that changes nothing.
//
// AND A PRIVATE COPY IS ITS OWN CASE, WITH ITS OWN REMEDY. .se/work is this
// box's own and git carries it nowhere, so no fetch, no merge and no reset
// moves what is stale there. Sending that reader to doc/work sends them to a
// folder with nothing in it.
//
// MEASURED, September 2026. Three ids were named on every pull of a session
// under the fetch remedy, and doc/work held none of the three. All three sat
// under .se/work, and deleting them drained the queue at once.
func behindNotice(r Roots, branch string, behind []string) string {
	if len(behind) == 0 {
		return ""
	}
	commit, _ := fetchedBranch(r)
	same := theNoteStandsOnTheBranch(r, commit, behind)
	var lagging, disagreeing, ours []string
	for _, id := range behind {
		at, private := whereTheNoteIs(r, id)
		line := id + "  " + at
		switch {
		case private:
			ours = append(ours, line)
		case same[id]:
			disagreeing = append(disagreeing, line)
		default:
			lagging = append(lagging, line)
		}
	}
	said := ""
	if len(lagging) > 0 {
		said += fmt.Sprintf("\n\nPassed over, because %s has archived them and this clone is behind it:\n  %s\n\n"+
			"They are not open work. Bring doc/work into step with %s, and pull again.",
			branch, strings.Join(lagging, "\n  "), branch)
	}
	if len(disagreeing) > 0 {
		said += fmt.Sprintf("\n\nPassed over, and this clone is not behind on them:\n  %s\n\n"+
			"%s carries an archive row and an open note for each, byte for byte as this tree "+
			"holds it. So the record disagrees with itself and a fetch changes nothing. "+
			"A person says which half is the truth: the row, or the note.",
			strings.Join(disagreeing, "\n  "), branch)
	}
	if len(ours) > 0 {
		said += fmt.Sprintf("\n\nPassed over, because %s has archived them, and the copy here is this box's own:\n  %s\n\n"+
			"They are not open work. .se/work is private and git carries it nowhere, so nothing "+
			"the branch does reaches them. Delete the file named beside each id, and pull again.",
			branch, strings.Join(ours, "\n  "))
	}
	return said
}
