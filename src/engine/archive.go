package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// WHERE A CLOSED TOKEN GOES, AND THE FOLDER DECIDES.
//
// A token is the work rather than the record of it. Kept on disk after it
// closes, it is material nobody walks, and the tree grows without bound.
//
// At the moment it closes the engine reads the folder it is in, which is the
// same fact every other door reads.
//
//	doc/work   it travels, so it goes into git and comes off the disk
//	.se/work   it does not travel, so it stays until a retro takes it
//
// A local token is in a folder git ignores. There is no commit holding it and
// no tag to read it back from, so removing it is final.
//
// SO THE CLOSE DOES NOT REMOVE IT. It closed deleting them at once, and the
// next retro then had nothing to read about what happened. A retro that cannot
// read what happened is a retro about nothing. It stays, marked closed, and
// the retro is what takes it, reads it and clears it.
//
// THE AGENT CALLS NOTHING. This hangs off the save that ends a token, so every
// door reaches it and none has to remember to.

// archiveRefs is where an archived token lives. Under tags, so the tag list is
// the archive, and under a prefix of its own so nothing collides with a
// release tag somebody made.
const archiveRefs = "refs/tags/archive/"

// ArchiveList is the list a person opens. It travels, because a box that reads
// the tree out of git should see what has been archived without asking git.
func ArchiveList(r Roots) string {
	return filepath.Join(TracedDir(r), "archive.jsonl")
}

// Archived is one line of that list.
//
// It is what the commit message carries, so the list is derived from the tags
// rather than kept beside them. Level 2 ruled against an index to keep in
// step, and a list that rebuilds from git is not one.
type Archived struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Process     string `json:"process"`
	Disposition string `json:"disposition"`
	Tag         string `json:"tag"`
}

// gitHere runs git over the work tree without touching the branch, the index
// or anybody's staging. The author is the engine, so nothing depends on a name
// being configured on the box.
func gitHere(r Roots, args ...string) (string, error) {
	cmd := Quietly(exec.Command("git", args...))
	cmd.Dir = r.Work
	cmd.Env = append(os.Environ(),
		"GIT_AUTHOR_NAME=quackitect", "GIT_AUTHOR_EMAIL=engine@quackitect",
		"GIT_COMMITTER_NAME=quackitect", "GIT_COMMITTER_EMAIL=engine@quackitect")
	out, err := cmd.Output()
	if err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			return "", fmt.Errorf("git %s: %s", args[0], strings.TrimSpace(string(ee.Stderr)))
		}
		return "", fmt.Errorf("git %s: %w", args[0], err)
	}
	return strings.TrimSpace(string(out)), nil
}

// Archive puts a closed token where it belongs and takes it off the disk.
//
// A tree with no history keeps its tokens. Deleting one there would lose it
// with nowhere to read it back from, and a folder handed to somebody rather
// than cloned is a case the design accepts.
func Archive(r Roots, t Token) error {
	at := noteAt(r, t.ID)
	if at == "" {
		return nil // nothing on disk to archive
	}
	if filepath.Dir(at) != TracedDir(r) {
		return nil // it stays, closed, until a retro has read it
	}
	if _, err := os.Stat(filepath.Join(r.Work, ".git")); err != nil {
		return nil // no history to archive into, so it stays where a reader can find it
	}
	row := Archived{ID: t.ID, Title: t.Title, Process: t.Process,
		Disposition: string(t.Disposition), Tag: archiveRefs + t.ID}
	if err := keepInGit(r, at, row); err != nil {
		return err
	}
	if err := forget(r, at); err != nil {
		return err
	}
	return WriteArchiveList(r)
}

// forget removes a token from the disk and tells the index it is gone.
func forget(r Roots, at string) error {
	if err := os.Remove(at); err != nil && !os.IsNotExist(err) {
		return err
	}
	rel, err := filepath.Rel(r.Work, at)
	if err == nil {
		_ = IndexFile(r, filepath.ToSlash(rel)) // the file is the truth, and the watcher catches up
	}
	r.forget()
	return nil
}

// keepInGit writes one file into history under a tag of its own.
//
// IT NEVER TOUCHES THE BRANCH. A commit on the working branch would put the
// engine in the person's history, and a stage would move what they had staged.
// The blob, the tree and the commit are made by hand, the way a snapshot is,
// and only the tag ref is written.
func keepInGit(r Roots, at string, row Archived) error {
	blob, err := gitHere(r, "hash-object", "-w", "--", at)
	if err != nil {
		return err
	}
	tree, err := treeOfOne(r, filepath.Base(at), blob)
	if err != nil {
		return err
	}
	said, err := json.Marshal(row)
	if err != nil {
		return err
	}
	// THE MESSAGE CARRIES THE ROW, which is what lets the list be rebuilt from
	// the tags alone. Nothing else has to be kept in step with anything.
	commit, err := gitHere(r, "commit-tree", tree, "-m", string(said))
	if err != nil {
		return err
	}
	if _, err := gitHere(r, "update-ref", row.Tag, commit); err != nil {
		return err
	}
	// A REMOTE GETS IT WHERE THERE IS ONE, and a box with none still closes its
	// work. Level 2 asks the engine to push on closing, and a close that fails
	// for want of a network would be worse than an archive one box behind.
	if remote, err := gitHere(r, "remote"); err == nil && remote != "" {
		first := strings.Fields(remote)[0]
		_, _ = gitHere(r, "push", "--quiet", first, row.Tag+":"+row.Tag)
	}
	return nil
}

// treeOfOne writes a tree holding one file, by handing mktree its line.
func treeOfOne(r Roots, name, blob string) (string, error) {
	cmd := Quietly(exec.Command("git", "mktree"))
	cmd.Dir = r.Work
	cmd.Stdin = strings.NewReader("100644 blob " + blob + "\t" + name + "\n")
	out, err := cmd.Output()
	if err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			return "", fmt.Errorf("git mktree: %s", strings.TrimSpace(string(ee.Stderr)))
		}
		return "", fmt.Errorf("git mktree: %w", err)
	}
	return strings.TrimSpace(string(out)), nil
}

// TheArchive answers every archived token, read from the tags.
//
// The tags are the archive. This reads them rather than the list, so the list
// can be wrong or missing and the answer is still right.
func TheArchive(r Roots) ([]Archived, error) {
	said, err := gitHere(r, "for-each-ref", "--format=%(contents)", archiveRefs)
	if err != nil {
		return nil, err
	}
	var out []Archived
	for _, line := range strings.Split(said, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var row Archived
		if json.Unmarshal([]byte(line), &row) != nil || row.ID == "" {
			continue // a tag under this prefix that nothing here wrote
		}
		out = append(out, row)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out, nil
}

// WriteArchiveList writes the list from the tags.
//
// IT IS A RENDERING AND NEVER A SOURCE. Delete it and this puts it back, byte
// for byte, which is the whole reason it is allowed to exist beside a ruling
// that refused an index to keep in step.
func WriteArchiveList(r Roots) error {
	rows, err := TheArchive(r)
	if err != nil {
		return err
	}
	var b strings.Builder
	for _, row := range rows {
		line, err := json.Marshal(row)
		if err != nil {
			return err
		}
		b.Write(line)
		b.WriteString("\n")
	}
	path := ArchiveList(r)
	if len(rows) == 0 {
		if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
			return err
		}
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	return os.WriteFile(path, []byte(b.String()), 0o644)
}

// ClosingState says whether a token stands where its process can move it no
// further.
//
// A token that has ended still has a step to take where its process declares
// one from where it stands. The standard process is the case: a done token is
// waiting for a verdict, and taking it off the disk would strand the reviewer.
func ClosingState(r Roots, t Token) bool {
	p, err := LoadProcess(r.Method, t.Process)
	if err != nil {
		return true // a process nobody can read says nothing about what is left
	}
	for _, a := range p.Activities {
		if a.From != "" && a.From == string(t.Status) {
			return false
		}
	}
	return true
}

// readArchivedNote answers a token out of history, so a reader naming a closed
// id is answered rather than told it never existed.
func readArchivedNote(r Roots, id string) (Token, bool) {
	if _, err := os.Stat(filepath.Join(r.Work, ".git")); err != nil {
		return Token{}, false
	}
	said, err := ReadArchived(r, id)
	if err != nil || said == "" {
		return Token{}, false
	}
	t, err := noteToken(said, id)
	if err != nil {
		return Token{}, false
	}
	return t, true
}

// runArchive sweeps what is already closed, and lists what the archive holds.
//
// A CLOSE ARCHIVES ITSELF, so this is for what closed before the engine did
// it, and for reading the archive back. It is not a step anybody takes in the
// ordinary way of working.
func runArchive(c *call) int {
	fs := flag.NewFlagSet("archive", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se archive - what the archive holds. Prints JSON.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se archive            list what is archived")
		fmt.Fprintln(c.err, "  se archive --sweep    archive every token that has already closed")
		fmt.Fprintln(c.err, "  se archive --id <id>  print one archived token")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	sweep := fs.Bool("sweep", false, "archive every token that has already closed, and delete the local ones")
	id := fs.String("id", "", "print one archived token, by id")
	if code, stop := c.parse(fs, "archive"); stop {
		return code
	}
	if *id != "" {
		said, err := ReadArchived(c.roots, *id)
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		fmt.Fprint(c.out, said)
		return 0
	}
	if *sweep {
		kept, gone, err := SweepClosed(c.roots)
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		c.answerJSON(map[string]any{"archived": kept, "deleted": gone})
		return 0
	}
	rows, err := TheArchive(c.roots)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	c.answerJSON(rows)
	return 0
}

// SweepClosed puts what has already closed where it belongs.
//
// The engine archives on the close now, so this is for the tokens that closed
// before it did. It answers how many were kept in git and how many were
// deleted, so a person reads what happened rather than trusting it.
func SweepClosed(r Roots) (kept, gone int, err error) {
	for _, t := range Tokens(r) {
		if !t.Ended() {
			continue
		}
		tracked := filepath.Dir(noteAt(r, t.ID)) == TracedDir(r)
		if err := Archive(r, t); err != nil {
			return kept, gone, fmt.Errorf("%s: %w", t.ID, err)
		}
		if tracked {
			kept++
		} else {
			gone++
		}
	}
	// THE LIST IS LEFT RIGHT WHETHER OR NOT ANYTHING MOVED. A sweep with
	// nothing to sweep is how the list is put back after it is deleted, and
	// that is the whole claim that it is a rendering.
	return kept, gone, WriteArchiveList(r)
}

// FindArchived searches what the archive holds.
//
// CLOSED WORK STILL ANSWERS. Without this the archive is write-only: a token
// comes off the disk and out of the index, and every search stops seeing it.
// Level 2 says search takes a ref, and these are the refs.
//
// It reads the tags rather than the list, because the list carries a title and
// the body is what somebody is looking for.
func FindArchived(r Roots, p FindParams) (Found, error) {
	rows, err := TheArchive(r)
	if err != nil {
		return Found{}, err
	}
	want := p.Regex
	if want == "" {
		want = regexp.QuoteMeta(p.Words)
	}
	if want == "" {
		return Found{}, fmt.Errorf("say what to look for: --words or --regex")
	}
	re, err := regexp.Compile(want)
	if err != nil {
		return Found{}, fmt.Errorf("that regular expression will not read: %w", err)
	}
	limit := p.Limit
	if limit <= 0 {
		limit = findLimit
	}
	out := Found{Fresh: true}
	for _, row := range rows {
		said, err := ReadArchived(r, row.ID)
		if err != nil {
			continue // a tag whose blob has gone proves nothing about the rest
		}
		for n, line := range strings.Split(said, "\n") {
			if !re.MatchString(line) {
				continue
			}
			out.Count++
			if len(out.Hits) < limit {
				// THE PATH IS THE TAG, so a reader can open what answered.
				out.Hits = append(out.Hits, Hit{Path: row.Tag, Line: n + 1,
					Text: strings.TrimRight(line, "\r")})
			}
		}
	}
	out.Truncated = out.Count > len(out.Hits)
	return out, nil
}

// ReadArchived answers the text of an archived token, from its tag.
func ReadArchived(r Roots, id string) (string, error) {
	return gitHere(r, "show", archiveRefs+id+":"+id+".md")
}
