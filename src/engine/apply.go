package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"quackitect/engine/internal/voice"
)

// WRITING IS A VERB OF THE ENGINE, AND IT NAMES ITS TOKEN.
//
// THE OWNER'S WORDS: every time you write, you have to say what the token is
// that you are working on, and that means you never have to make a dedicated
// call for it. If you change the token on the next write, you just say so, the
// old one goes out of your hands and the new one goes in.
//
// A TICKET WAS THE OTHER ANSWER AND IT WAS THE WRONG SHAPE. se work --on armed
// one write and the write spent it, so naming the token was a SEPARATE call
// before every edit. The name belongs on the edit.
//
// VALIDATE EVERYTHING, THEN WRITE. Every edit is checked against the file as
// the earlier edits in this manifest left it, and one failure refuses the whole
// manifest with nothing written. A half-applied change is worse than a refused
// one: the tree is in a state nobody designed and the agent believes it landed.
// This is v3's applier, which learned that, with the token on the front.
//
// BYTES IN, BYTES OUT. No encoding pass and no line-ending pass. A file that
// was CRLF stays CRLF, because the edit says which bytes to replace and this
// replaces those bytes.

// An Edit is one operation. The zero op is the byte-exact replacement, which is
// the one almost every edit is.
type Edit struct {
	File string `json:"file"`
	Old  string `json:"old"`
	New  string `json:"new"`

	// "" replaces Old with New, and Old must appear exactly once.
	// "create" writes a file that must not exist.
	// "write" replaces a whole file, existing or not.
	Op string `json:"op,omitempty"`
}

// Applied is what the verb answers, so the caller learns what landed without
// reading the tree back.
type Applied struct {
	On    string         `json:"on"`
	Files []string       `json:"files"`
	Edits map[string]int `json:"edits"`
	Dry   bool           `json:"dry,omitempty"`
	Undo  string         `json:"undo,omitempty"`
}

// Apply runs a manifest against the work root. It answers what it wrote, or
// says why it wrote nothing.
//
// IT IS TOLD WHOSE CHANGE THIS IS, because the journal it writes is the thing
// an undo reads, and an undo that cannot tell one agent's apply from another's
// takes the wrong one back.
func Apply(r Roots, edits []Edit, dry bool, on, by string) (Applied, error) {
	out := Applied{On: on, Edits: map[string]int{}, Dry: dry}
	if len(edits) == 0 {
		return out, fmt.Errorf("an apply with no edits: say what to change")
	}

	// The content of every file this manifest touches, as the edits so far
	// have left it. Edits to one file compose in the order they were written.
	content := map[string][]byte{}
	before := map[string][]byte{}
	born := map[string]bool{}

	for i, e := range edits {
		if strings.TrimSpace(e.File) == "" {
			return out, fmt.Errorf("edit %d names no file", i+1)
		}
		path, err := inTheTree(r, e.File)
		if err != nil {
			return out, fmt.Errorf("edit %d (%s): %w", i+1, e.File, err)
		}
		if _, seen := content[path]; !seen {
			out.Files = append(out.Files, path)
		}
		switch e.Op {
		case "create":
			if e.New == "" {
				return out, fmt.Errorf("edit %d (%s): create with no content", i+1, e.File)
			}
			if _, seen := content[path]; seen {
				return out, fmt.Errorf("edit %d (%s): create over a file this manifest already writes. "+
					"Put the whole content in one entry", i+1, e.File)
			}
			if _, err := os.Stat(path); err == nil {
				return out, fmt.Errorf("edit %d (%s): create refused, the file is already there. "+
					"Use an exact edit, or op write to replace it whole. Nothing was written", i+1, e.File)
			}
			born[path] = true
			content[path] = []byte(e.New)
		case "write":
			if e.New == "" {
				return out, fmt.Errorf("edit %d (%s): write with no content. "+
					"To empty a file, say so with an exact edit", i+1, e.File)
			}
			if _, seen := content[path]; !seen {
				if raw, err := os.ReadFile(path); err == nil {
					before[path] = raw
				} else {
					born[path] = true
				}
			}
			content[path] = []byte(e.New)
		case "":
			if e.Old == "" {
				return out, fmt.Errorf("edit %d (%s): no old text. "+
					"Use op create for a new file, or op write to replace one whole", i+1, e.File)
			}
			buf, seen := content[path]
			if !seen {
				raw, err := os.ReadFile(path)
				if err != nil {
					return out, fmt.Errorf("edit %d (%s): %w", i+1, e.File, err)
				}
				buf, before[path] = raw, raw
			}
			// EXACTLY ONCE, OR IT IS REFUSED. Twice means the edit is about a
			// place the manifest cannot name, and picking one is guessing.
			switch n := bytes.Count(buf, []byte(e.Old)); n {
			case 1:
			case 0:
				return out, fmt.Errorf("edit %d (%s): the old text is not in the file. "+
					"Read it and copy the bytes exactly. Nothing was written", i+1, e.File)
			default:
				return out, fmt.Errorf("edit %d (%s): the old text is there %d times and it has to be one. "+
					"Take in more of what is around it. Nothing was written", i+1, e.File, n)
			}
			content[path] = bytes.Replace(buf, []byte(e.Old), []byte(e.New), 1)
		default:
			return out, fmt.Errorf("edit %d (%s): no such op: %q. It is create, write, or left off",
				i+1, e.File, e.Op)
		}
		out.Edits[path]++
	}

	// AND THE VOICE RULES, WHICH THIS DOOR WENT ROUND.
	//
	// The check lives in the guard hook, which fires on the harness's write
	// tools. Those are refused: the method sends every write through here. So
	// the rules were enforced on the door nobody uses and not on the one
	// everybody uses, and a sentence carrying a semicolon, a contraction and a
	// Latin abbreviation went into a report through this door and was taken.
	if err := proseThatReads(r, edits); err != nil {
		return out, err
	}

	// THE SCHEMA IS CHECKED HERE TOO, and a dry run checks it with the rest.
	for _, path := range out.Files {
		id, isNote := tokenNoteAt(r, path)
		if !isNote {
			continue
		}
		if err := tokensThatFit(r, id, before[path], content[path]); err != nil {
			return out, err
		}
	}

	if dry {
		return out.said(r), nil
	}

	// WHAT WAS THERE IS WRITTEN DOWN BEFORE ANYTHING IS OVERWRITTEN, and a
	// journal that cannot be written refuses the apply. A bulk edit nobody can
	// undo is the incident this exists to prevent.
	undo, err := journalUndo(r, on, by, out.Files, before, born, content)
	if err != nil {
		return out, fmt.Errorf("the undo journal would not write, so nothing was: %w", err)
	}
	out.Undo = undo

	for _, path := range out.Files {
		if err := writeAtomic(path, content[path], 0o644); err != nil {
			return out, fmt.Errorf("writing %s: %w", shortPath(r, path), err)
		}
		_ = IndexFile(r, path) // the file is the truth, and the watcher catches up on a row it could not write
	}
	return out.said(r), nil
}

// said rewrites the answer in paths from the work root.
//
// AN ABSOLUTE PATH IS A PATH ON ONE MACHINE. The answer goes into the record
// and out to whoever called, and neither of those is this laptop. The walk uses
// absolute paths because that is what a file operation needs; what is REPORTED
// is where the file is in the tree.
func (a Applied) said(r Roots) Applied {
	out := Applied{On: a.On, Dry: a.Dry, Undo: a.Undo, Edits: map[string]int{}}
	for _, path := range a.Files {
		short := shortPath(r, path)
		out.Files = append(out.Files, short)
		out.Edits[short] = a.Edits[path]
	}
	return out
}

// inTheTree answers the absolute path of a file the manifest names, and refuses
// one that leaves the folder being worked on.
//
// A RELATIVE PATH IS FROM THE WORK ROOT, because that is what the agent sees
// and what every other verb here means by a path.
func inTheTree(r Roots, name string) (string, error) {
	path := filepath.FromSlash(name)
	if !filepath.IsAbs(path) {
		path = filepath.Join(r.Work, path)
	}
	path = filepath.Clean(path)
	rel, err := filepath.Rel(r.Work, path)
	if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("it is outside the folder being worked on")
	}
	return path, nil
}

// tokenNoteAt answers the id a file would be read under, when the file is a
// note in one of the folders tokens live in. Everywhere else this door writes
// what it is told to write.
func tokenNoteAt(r Roots, path string) (string, bool) {
	if !strings.HasSuffix(path, ".md") {
		return "", false
	}
	dir := filepath.Clean(filepath.Dir(path))
	for _, one := range workDirs(r) {
		if dir == filepath.Clean(one) {
			return strings.TrimSuffix(filepath.Base(path), ".md"), true
		}
	}
	return "", false
}

// tokensThatFit holds a write to the same bounds the save holds a token to, so
// this door cannot leave behind a token the engine will not load.
//
// MEASURED. A detail was grown well past its bound through here, and the write
// was taken. Every engine call the holder made afterwards
// was refused naming that size, because switching tokens puts the held one
// back and putting it back validates it. So the write door was the way to make
// a token unreadable, and the mint door's check was the only one there was.
//
// THE REFUSAL NAMES THE TOKEN IT MEASURED. A size on its own reads as a
// complaint about whatever the caller happened to name, and the caller has no
// way to tell which file is the one over.
//
// AN EDIT THAT BRINGS AN OVER-LONG SECTION DOWN IS LET THROUGH. A guard that
// weighs the result alone refuses the one edit that fixes the file, and the
// holder is then locked out with nowhere to go. What is refused is a write
// that pushes a section past its bound, or further past it.
func tokensThatFit(r Roots, id string, was, now []byte) error {
	t, err := noteToken(string(now), id)
	if err != nil {
		return nil // a note that is not a token is not this guard's business
	}
	over := overCaps(narrowedSchema(r, t), t)
	if len(over) == 0 {
		return nil
	}
	held := map[string]int{}
	if before, err := noteToken(string(was), id); err == nil {
		held = before.bounded()
	}
	for _, one := range over {
		if one.Words <= held[one.Says] {
			continue // it came down, or did not move, and refusing that is the trap
		}
		return fmt.Errorf("%s: %s would run to %d words and the schema allows %d. Nothing was written. "+
			"Shorten it in this edit: a write that pushes a section further past its bound is "+
			"refused, and one that brings it down is not", id, one.Says, one.Words, one.Max)
	}
	return nil
}

// shortPath says where a file is from the work root, because an absolute path
// in the record is a path on one machine written into a file that travels.
func shortPath(r Roots, path string) string {
	rel, err := filepath.Rel(r.Work, path)
	if err != nil {
		return filepath.ToSlash(path)
	}
	return filepath.ToSlash(rel)
}

// THE UNDO JOURNAL. What every file said before, and what this apply made it say.
//
// BOTH HALVES, BECAUSE THE UNDO CHECKS DRIFT BEFORE IT RESTORES. A file changed
// since the apply is somebody else's work, or a later apply's, and writing the
// old bytes over it would throw that away silently. So the undo compares what
// is there now against what this apply wrote, refuses the whole entry if any
// file has moved, and restores nothing.
type wasFile struct {
	File    string `json:"file"`
	Was     string `json:"was,omitempty"`
	Applied string `json:"applied"`
	Blank   bool   `json:"did_not_exist,omitempty"`
}

func undoDir(r Roots) string { return r.Private("undo") }

// A JOURNAL ENTRY SAYS WHOSE APPLY IT WAS.
//
// It was a bare list of files, and the undo took the newest list in the folder
// whoever had written it. One agent on a tree never notices. Ten agents on one
// tree means the newest apply is somebody else's most of the time, and an undo
// is what an agent reaches for the moment it has made a mistake, which is the
// moment it is least likely to check who wrote last.
//
// MEASURED ONCE, ON THIS TREE: an undo named on one token restored a file that
// belonged to another actor's token, and the newer content was gone for good,
// both files being untracked. So an entry carries the token it was written
// against, and an undo takes back only its own.
type journal struct {
	On    string    `json:"on"`
	By    string    `json:"by"`
	At    string    `json:"at"`
	Files []wasFile `json:"files"`
}

// journalUndo writes what every file held before this apply, and answers where
// it put it. A file this apply brings into being is recorded as absent, so
// undoing removes it rather than writing an empty one.
func journalUndo(r Roots, on, by string, files []string, before map[string][]byte, born map[string]bool, after map[string][]byte) (string, error) {
	var was []wasFile
	for _, path := range files {
		e := wasFile{File: shortPath(r, path), Applied: hashOf(after[path])}
		if born[path] {
			e.Blank = true
		} else {
			e.Was = string(before[path])
		}
		was = append(was, e)
	}
	b, err := json.MarshalIndent(journal{On: on, By: by, At: now(), Files: was}, "", "  ")
	if err != nil {
		return "", err
	}
	// The name is the time, so the newest entry is the last one by name and
	// nothing has to hold a counter.
	name := time.Now().UTC().Format("20060102-150405.000000000") + ".json"
	if err := writeAtomic(filepath.Join(undoDir(r), name), append(b, '\n'), 0o644); err != nil {
		return "", err
	}
	return filepath.ToSlash(filepath.Join(".se", "undo", name)), nil
}

// newestOn answers the newest journal entry written against the token named,
// the file it is in, and whether there was one. An empty want takes the newest
// entry whatever it says, which is what this did before it could tell.
func newestOn(r Roots, names []string, want string) (string, journal, bool) {
	for i := len(names) - 1; i >= 0; i-- {
		path := filepath.Join(undoDir(r), names[i])
		j, err := readJournal(path)
		if err != nil {
			continue // an entry nobody can read is not an entry anybody can undo
		}
		if want == "" || j.On == want {
			return path, j, true
		}
	}
	return "", journal{}, false
}

// readJournal reads one entry, in either shape.
//
// THE OLD SHAPE IS A BARE LIST and entries written before this are still in the
// folder. One read answers both, and an old entry carries no token, so an undo
// naming a token walks past it rather than taking a change nobody can attribute.
func readJournal(path string) (journal, error) {
	var j journal
	b, err := os.ReadFile(path)
	if err != nil {
		return j, err
	}
	if err := json.Unmarshal(b, &j); err == nil && j.Files != nil {
		return j, nil
	}
	var was []wasFile
	if err := json.Unmarshal(b, &was); err != nil {
		return j, fmt.Errorf("the undo journal is not readable: %w", err)
	}
	return journal{Files: was}, nil
}

func hashOf(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}

// Undo puts back what the newest apply overwrote, and answers what it restored.
//
// IT IS ALL OR NOTHING, AND DRIFT REFUSES IT. Every file is checked against what
// the apply wrote before anything is restored, so an undo never throws away a
// change somebody made afterwards. A tree half restored is worse than one not
// restored at all: nobody can tell which half is which.
func Undo(r Roots, on, by string) ([]string, error) {
	entries, err := os.ReadDir(undoDir(r))
	if err != nil || len(entries) == 0 {
		return nil, fmt.Errorf("nothing to undo: no apply has been journalled")
	}
	var names []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".json") {
			names = append(names, e.Name())
		}
	}
	if len(names) == 0 {
		return nil, fmt.Errorf("nothing to undo: no apply has been journalled")
	}
	sort.Strings(names)
	newest, j, found := newestOn(r, names, on)
	if !found {
		return nil, fmt.Errorf("nothing of %s to undo: an undo puts back what the token it names wrote, "+
			"and nothing here was written against it", on)
	}
	was := j.Files

	// THE DRIFT CHECK COMES FIRST, OVER EVERY FILE.
	for _, e := range was {
		path, err := inTheTree(r, e.File)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", e.File, err)
		}
		now, err := os.ReadFile(path)
		if err != nil {
			if e.Blank && os.IsNotExist(err) {
				continue // it was created and is already gone
			}
			return nil, fmt.Errorf("undo refused: %s cannot be read since the apply (%v). "+
				"Put the file back, then undo", e.File, err)
		}
		if hashOf(now) != e.Applied {
			return nil, fmt.Errorf("undo refused: %s has changed since the apply. "+
				"Somebody's work would be thrown away, so nothing was restored", e.File)
		}
	}

	var done []string
	for _, e := range was {
		path, _ := inTheTree(r, e.File)
		if e.Blank {
			if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
				return done, fmt.Errorf("removing %s, which the apply created: %w", e.File, err)
			}
			done = append(done, "removed "+e.File)
			continue
		}
		if err := writeAtomic(path, []byte(e.Was), 0o644); err != nil {
			return done, fmt.Errorf("restoring %s: %w", e.File, err)
		}
		done = append(done, "restored "+e.File)
	}
	// THE ENTRY GOES WHEN IT HAS BEEN USED, so undoing twice does not undo the
	// same apply twice over whatever came after it.
	if err := os.Remove(newest); err != nil {
		return done, fmt.Errorf("the files were put back and the journal entry was not removed: %w", err)
	}
	return done, nil
}

// proseThatReads holds a write to the mechanical voice rules, the way the guard
// holds the harness's write tools to them.
//
// WHAT IS CHECKED IS WHAT WAS WRITTEN, not the file it lands in. A rule broken
// in a paragraph nobody touched is not this write's to answer for, and the
// guard reads the tool's own text for the same reason.
//
// ONLY THE MECHANICAL RULES. Pattern and vocabulary are reproducible, and a
// refusal nobody can reproduce is an obstacle rather than a rule.
//
// A CHECKER THAT CANNOT RUN LETS THE WRITE THROUGH. It is a check on form, and
// a broken one must not stop somebody working.
//
// AND IDENTITY MATERIAL IS ASKED HERE TOO. The guard hook asks identityMaterial
// of the harness's write tools, and this door is the mirror of that one: it is
// the door agents are told to use, and the only one open while the hook is
// down. So a datetime went through here into a tracked file with no refusal,
// while the same sentence through Write was refused. A write under .se is left
// alone, the way the guard leaves it: that is where what does not travel lives.
func proseThatReads(r Roots, edits []Edit) error {
	var written []string
	for _, e := range edits {
		if e.New == "" || !isProse(e.File) {
			continue
		}
		if path, err := inTheTree(r, e.File); err == nil && !underPrivate(r, path) {
			if rule, matched, yes := identityMaterial(e.New, TheUsername()); yes {
				return fmt.Errorf("this text carries %s, %q, and identity material does not travel, so nothing was written. "+
					"Where a time is needed, write a month and a year. "+
					"A machine field keeps its stamp, and .se keeps what does not travel.", rule, matched)
			}
		}
		written = append(written, e.New)
	}
	if len(written) == 0 {
		return nil
	}
	rules, err := voice.Load(r.Method)
	if err != nil {
		return nil // said by the guard where it can be said; a write is not stopped for it
	}
	found := rules.Check(strings.Join(written, "\n"))
	if len(found) == 0 {
		return nil
	}
	lines := make([]string, 0, len(found))
	for _, f := range found {
		lines = append(lines, "  "+f.String())
	}
	// THIS REFUSES A FORM, NEVER A PLACE. The same text, written properly, goes
	// through, and the refusal says so rather than reading as a ban on the file.
	return fmt.Errorf("this text breaks rules the voice check can see, so nothing was written. "+
		"Nothing is wrong with the file: fix these and write it again.\n%s", strings.Join(lines, "\n"))
}
