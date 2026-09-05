package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
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
// nothing in git naming it, so removing it is final.
//
// SO THE CLOSE DOES NOT REMOVE IT. It closed deleting them at once, and the
// next retro then had nothing to read about what happened. A retro that cannot
// read what happened is a retro about nothing. It stays, marked closed, and
// the retro is what takes it, reads it and clears it.
//
// THE AGENT CALLS NOTHING. This hangs off the save that ends a token, so every
// door reaches it and none has to remember to.

// archiveRefs is where an older archive kept a token: one tag per token,
// written locally and pushed on the close.
//
// NOTHING WRITES ONE ANY MORE. A ref has to be pushed to leave the box, and
// refs/tags answers HTTP 403 from the git proxy a cloud box runs behind. The
// push result was discarded, so the tag stood on one machine, the note was
// deleted from doc/work, and the next branch commit took the content off the
// branch: the only copy left was a local tag on a box about to be destroyed.
//
// THE PREFIX STAYS BECAUSE THE TAGS ALREADY WRITTEN ARE STILL READ. It is read
// from here and never written to, and the blob each tag holds is folded into
// the list the first time the list is written.
const archiveRefs = "refs/tags/archive/"

// ArchiveList is the archive: one line per closed token, naming the git object
// that holds it.
//
// IT TRAVELS, AND THAT IS THE WHOLE POINT. It is a file on the branch, so every
// box that has the branch has the archive, and archiving needs no ref and no
// push that a box might be refused.
func ArchiveList(r Roots) string {
	return filepath.Join(TrackedDir(r), "archive.jsonl")
}

// Archived is one line of that list.
type Archived struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Process     string `json:"process"`
	Disposition string `json:"disposition"`
	// Blob is the note as it stood at the close, written into git by the close.
	// It is exact, and it is what a reader on the box that closed the token gets.
	Blob string `json:"blob,omitempty"`
	// OnBranch is the note as the branch last committed it, and it is the copy
	// that travels.
	//
	// A BLOB WRITTEN AT THE CLOSE HANGS OFF NOTHING. git hash-object -w puts the
	// object in the store and no tree or ref reaches it, so a clone is never sent
	// it and a gc is free to sweep it. What the branch committed is in every
	// clone of the branch: the same note without the lines the close wrote, and
	// this row carries what those said.
	OnBranch string `json:"on_branch,omitempty"`
	// Tag is what an older archive wrote, and nothing writes one now. It stays on
	// the rows that already carry one so they go on reading.
	Tag string `json:"tag,omitempty"`
}

// Where names the git object a reader opens first to see the token.
func (a Archived) Where() string {
	for _, at := range []string{a.Blob, a.OnBranch, a.Tag} {
		if at != "" {
			return at
		}
	}
	return ""
}

// gitHere runs git over the work tree without touching the branch, the index
// or anybody's staging. The author is the engine, so nothing depends on a name
// being configured on the box.
func gitHere(r Roots, args ...string) (string, error) {
	cmd := quiet.Quietly(exec.Command("git", args...))
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
	if filepath.Dir(at) != TrackedDir(r) {
		return nil // it stays, closed, until a retro has read it
	}
	if _, err := os.Stat(filepath.Join(r.Work, ".git")); err != nil {
		return nil // no history to archive into, so it stays where a reader can find it
	}
	blob, err := keepInGit(r, at)
	if err != nil {
		return err
	}
	row := Archived{ID: t.ID, Title: t.Title, Process: t.Process,
		Disposition: string(t.Disposition), Blob: blob, OnBranch: onBranch(r, at)}
	// THE LIST IS WRITTEN BEFORE THE NOTE COMES OFF THE DISK. The list is the
	// only thing naming the objects, so a write that failed after the delete
	// would leave the content in git with nothing pointing at it.
	if err := keepInList(r, row); err != nil {
		return err
	}
	return forget(r, at)
}

// NotArchived says a token closed and its archive could not be written.
//
// THE ARCHIVE IS A CONSEQUENCE OF THE CLOSE AND NOT A CONDITION OF IT. By the
// time it runs the note is on the disk, closed, and the move is in the record.
// Returning git's error as the save's said a close that had happened had not,
// and the retry then made it permanent: the second save sees a token that has
// already ended, takes the arm for a repair rather than for a close, and never
// archives. The token was then closed, on the disk, and nothing would archive
// it again except a sweep nobody knew to run.
//
// So the close stands and this says what is left over. It is the shape
// snapshotFor already uses for a tree it cannot snapshot: said out loud, and
// the work goes on.
type NotArchived struct {
	ID  string
	Err error
}

func (n NotArchived) Error() string {
	return n.ID + " is closed, and its archive could not be written: " + n.Err.Error() +
		". It is closed and still on the disk, and se archive --sweep puts it into git."
}

func (n NotArchived) Unwrap() error { return n.Err }

// TheCloseStood answers whether an error off a save left the token closed.
// Every door that ends a token asks this one question, so neither of them can
// be taught the rule while the other goes on reporting a close that happened
// as one that did not.
func TheCloseStood(err error) bool {
	var n NotArchived
	return errors.As(err, &n)
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

// keepInGit writes the note into git as a blob and answers its name.
//
// IT WRITES NO REF AND PUSHES NOTHING. A ref has to be pushed to leave the box,
// and the archive namespace is refused there, so anything hanging off one is an
// archive a single machine holds. The row names this blob, and the row is a
// line in a file the branch carries.
//
// WHAT IT WRITES REACHES NO FURTHER THAN THIS BOX, and that is why the row
// names onBranch beside it: an object nothing points at is not sent to a clone.
// This one is exact, and it is the better answer wherever it is there.
//
// IT NEVER TOUCHES THE BRANCH EITHER. A commit on the working branch would put
// the engine in the person's history, and a stage would move what they staged.
func keepInGit(r Roots, at string) (string, error) {
	return gitHere(r, "hash-object", "-w", "--", at)
}

// onBranch answers the blob the branch's own history holds for a path, and
// nothing where it holds none.
//
// THIS IS THE COPY THAT TRAVELS, and it is why the archive needs no ref. The
// note was a file somebody committed, so the branch carries its bytes in every
// clone; the blob the close writes is reachable from nothing and goes nowhere.
// A note nobody committed has no such copy, and the row then names only what
// the close wrote.
func onBranch(r Roots, at string) string {
	rel, err := filepath.Rel(r.Work, at)
	if err != nil {
		return ""
	}
	blob, err := gitHere(r, "rev-parse", "HEAD:"+filepath.ToSlash(rel))
	if err != nil {
		return ""
	}
	return blob
}

// archiveListRows reads the list, which is the archive.
//
// A LINE IT CANNOT READ IS A REFUSAL AND NEVER A SKIP. The list is the record
// now, so dropping a line it cannot parse would take a closed token out of the
// archive in silence, and the next write would make that permanent.
func archiveListRows(r Roots) ([]Archived, error) {
	path := ArchiveList(r)
	said, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var out []Archived
	for n, line := range strings.Split(string(said), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var row Archived
		if err := json.Unmarshal([]byte(line), &row); err != nil || row.ID == "" {
			return nil, fmt.Errorf("%s:%d does not read as an archived token: %s", path, n+1, line)
		}
		out = append(out, row)
	}
	return out, nil
}

// archiveTagRows reads the tags an older archive wrote.
//
// A BOX WITH NO GIT, OR NO SUCH TAGS, HAS NONE, AND THAT IS NOT A FAILURE. The
// list is the archive; these are read so that a tree holding tags and no list
// still answers, and so their blobs can be folded into the list.
func archiveTagRows(r Roots) []Archived {
	said, err := gitHere(r, "for-each-ref", "--format=%(contents)", archiveRefs)
	if err != nil {
		return nil
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
	return out
}

// TheArchive answers every archived token.
//
// THE LIST IS THE ARCHIVE, because the list is what travels. The tags an older
// archive wrote are read for the ids the list does not carry, so nothing that
// was archived before this stops answering.
func TheArchive(r Roots) ([]Archived, error) {
	rows, err := archiveListRows(r)
	if err != nil {
		return nil, err
	}
	listed := make(map[string]bool, len(rows))
	for _, row := range rows {
		listed[row.ID] = true
	}
	for _, row := range archiveTagRows(r) {
		if !listed[row.ID] {
			rows = append(rows, row)
		}
	}
	sort.Slice(rows, func(i, j int) bool { return rows[i].ID < rows[j].ID })
	return rows, nil
}

// keepInList puts a row in the archive list and writes the list out. A row
// already there is replaced, so archiving twice archives once.
func keepInList(r Roots, add Archived) error {
	rows, err := TheArchive(r)
	if err != nil {
		return err
	}
	if add.ID != "" {
		kept := make([]Archived, 0, len(rows)+1)
		for _, row := range rows {
			if row.ID != add.ID {
				kept = append(kept, row)
			}
		}
		rows = append(kept, add)
		sort.Slice(rows, func(i, j int) bool { return rows[i].ID < rows[j].ID })
	}
	return writeArchiveRows(r, rows)
}

// WriteArchiveList writes the list out as it stands, folding in the tags an
// older archive left. A sweep with nothing to sweep calls this, which is how
// the fold happens on a tree nobody is closing anything on.
func WriteArchiveList(r Roots) error {
	return keepInList(r, Archived{})
}

// writeArchiveRows writes the rows, giving each one the blob it is missing.
func writeArchiveRows(r Roots, rows []Archived) error {
	var b strings.Builder
	for i := range rows {
		// A ROW THE OLDER ARCHIVE WROTE IS GIVEN ITS BLOB, and then the tag it
		// names is no longer the only way to the content: a reader with the object
		// and no ref still answers. Where the tag has gone the row keeps what it
		// had, because a row that cannot be resolved on this box today is not a
		// row to drop.
		if rows[i].Blob == "" && rows[i].Tag != "" {
			if blob, err := gitHere(r, "rev-parse", rows[i].Tag+":"+rows[i].ID+".md"); err == nil {
				rows[i].Blob = blob
			}
		}
		line, err := json.Marshal(rows[i])
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
// further. It is Process.Ends asked of the token's own process, and not a
// second loop that could answer differently.
//
// A token that has ended still has a step to take where its process declares
// one from where it stands. The pull never writes that shape, because it sets
// a disposition only on a step into an ending state, but a hand edit or an
// older engine did, and taking such a token off the disk strands it.
func ClosingState(r Roots, t Token) bool {
	p, err := LoadProcess(r.Method, t.Process)
	if err != nil {
		return true // a process nobody can read says nothing about what is left
	}
	return p.Ends(string(t.Status))
}

// Archivable is the one rule for whether a token may come off the disk: it has
// ended, and it stands where its process can move it no further. The save and
// the sweep both ask it, so the two doors cannot disagree about a token.
func Archivable(r Roots, t Token) bool {
	return t.Ended() && ClosingState(r, t)
}

// findArchivedWords answers FTS5 words over the archive the way findDB answers
// them over the tree: the archived lines are read into an index of their own,
// held in memory for the length of the call, and findDB runs the same MATCH
// over it. The archive is not in the tree's index, because it is not in the
// tree, and a second matcher beside findDB is how the two doors drifted apart.
func findArchivedWords(r Roots, rows []Archived, p FindParams) (Found, error) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		return Found{}, err
	}
	defer db.Close()
	// ONE CONNECTION, because every connection to :memory: is a database of
	// its own, and a second one would answer over an empty table.
	db.SetMaxOpenConns(1)
	if _, err := db.Exec(`CREATE VIRTUAL TABLE line_text USING fts5 (path UNINDEXED, n UNINDEXED, text)`); err != nil {
		return Found{}, err
	}
	tx, err := db.Begin()
	if err != nil {
		return Found{}, err
	}
	put, err := tx.Prepare(`INSERT INTO line_text (path, n, text) VALUES (?, ?, ?)`)
	if err != nil {
		_ = tx.Rollback()
		return Found{}, err
	}
	for _, row := range rows {
		said, from, err := readArchived(r, row)
		if err != nil {
			continue // a row whose object has gone proves nothing about the rest
		}
		for n, line := range strings.Split(said, "\n") {
			// THE PATH IS THE OBJECT THAT ANSWERED, so a reader can open it.
			if _, err := put.Exec(from, n+1, strings.TrimRight(line, "\r")); err != nil {
				put.Close()
				_ = tx.Rollback()
				return Found{}, err
			}
		}
	}
	put.Close()
	if err := tx.Commit(); err != nil {
		return Found{}, err
	}
	got, err := findDB(db, FindParams{Words: p.Words, Limit: p.Limit})
	if err != nil {
		return Found{}, err
	}
	got.Fresh = true // the archive is read out of git, and no watcher can be behind it
	return got, nil
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
		if !Archivable(r, t) {
			continue
		}
		tracked := filepath.Dir(noteAt(r, t.ID)) == TrackedDir(r)
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
	// nothing to sweep is how the tags an older archive left are folded in, and
	// how a list somebody deleted a line from is written whole again.
	return kept, gone, WriteArchiveList(r)
}

// FindArchived searches what the archive holds.
//
// CLOSED WORK STILL ANSWERS. Without this the archive is write-only: a token
// comes off the disk and out of the index, and every search stops seeing it.
// Level 2 says search takes a ref, and these are the refs.
//
// It reads the objects the list names rather than the list's own lines, because
// a line carries a title and the body is what somebody is looking for.
func FindArchived(r Roots, p FindParams) (Found, error) {
	rows, err := TheArchive(r)
	if err != nil {
		return Found{}, err
	}
	// A GLOB OVER PATHS HAS NOTHING TO NARROW HERE, SO IT IS REFUSED.
	//
	// An archived token is a git object rather than a file, and a hit names the
	// object it came from. There is no path for a glob to read, and the flag was
	// taken and ignored: a search asking for one folder answered the whole
	// archive.
	//
	// THE DAMAGE IS THE READING RATHER THAN THE MISSING FILTER. A reader handed
	// the whole archive after asking for one folder believes the hits came from
	// that folder, which is worse than being told the flag does not apply. So it
	// says so, and it says so here rather than in the verb, because a field the
	// half that reads it ignores is refused for every caller and not just one.
	if p.Path != "" {
		return Found{}, fmt.Errorf("the archive reads no path, so --path %s has nothing to narrow: "+
			"an archived token is a git object rather than a file. Search the archive without it, "+
			"or search the tree, which does read paths", p.Path)
	}
	if p.Words == "" && p.Regex == "" {
		return Found{}, fmt.Errorf("say what to look for: --words or --regex")
	}
	// WORDS MEAN OVER THE ARCHIVE WHAT THEY MEAN OVER THE TREE. This quoted
	// the words into a regular expression and matched them as one literal
	// string, so se find --words 'undo AND pops' answered two hits and the
	// same words over the archive answered none: no archived line carries
	// the characters "undo AND pops". A searcher reads zero over closed work
	// as work that never was. So the words go to FTS5 here too, through the
	// one function the tree door uses.
	if p.Words != "" {
		return findArchivedWords(r, rows, p)
	}
	re, err := regexp.Compile(p.Regex)
	if err != nil {
		return Found{}, fmt.Errorf("that regular expression will not read: %w", err)
	}
	limit := p.Limit
	if limit <= 0 {
		limit = findLimit
	}
	out := Found{Fresh: true}
	for _, row := range rows {
		said, from, err := readArchived(r, row)
		if err != nil {
			continue // a row whose object has gone proves nothing about the rest
		}
		for n, line := range strings.Split(said, "\n") {
			if !re.MatchString(line) {
				continue
			}
			out.Count++
			if len(out.Hits) < limit {
				// THE PATH IS THE OBJECT THAT ANSWERED, so a reader opens what the
				// hit came from rather than what the row happens to name first.
				out.Hits = append(out.Hits, Hit{Path: from, Line: n + 1,
					Text: strings.TrimRight(line, "\r")})
			}
		}
	}
	out.Truncated = out.Count > len(out.Hits)
	return out, nil
}

// ReadArchived answers the text of an archived token.
func ReadArchived(r Roots, id string) (string, error) {
	rows, err := TheArchive(r)
	if err != nil {
		return "", err
	}
	for _, row := range rows {
		if row.ID == id {
			said, _, err := readArchived(r, row)
			return said, err
		}
	}
	return "", fmt.Errorf("%s is not in the archive", id)
}

// readArchived answers the text one row names, and the object it came from.
//
// A ROW MAY NAME MORE THAN ONE COPY, AND THEY ARE TRIED IN ORDER. The blob the
// close wrote is exact and reaches only as far as the box that wrote it. What
// the branch committed is one close behind and is in every clone of the branch.
// A tag is what an older archive left, and its objects travel with the tag
// where the tag was pushed. A box holding one of the three answers rather than
// refusing.
func readArchived(r Roots, row Archived) (string, string, error) {
	var last error
	for _, at := range []string{row.Blob, row.OnBranch} {
		if at == "" {
			continue
		}
		said, err := gitHere(r, "cat-file", "-p", at)
		if err == nil {
			return said, at, nil
		}
		last = err
	}
	if row.Tag != "" {
		said, err := gitHere(r, "show", row.Tag+":"+row.ID+".md")
		if err == nil {
			return said, row.Tag, nil
		}
		last = err
	}
	if last != nil {
		return "", "", last
	}
	return "", "", fmt.Errorf("%s is in the archive and names no object to read it from", row.ID)
}
