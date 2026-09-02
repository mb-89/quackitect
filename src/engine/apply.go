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
func Apply(r Roots, edits []Edit, dry bool) (Applied, error) {
	out := Applied{Edits: map[string]int{}, Dry: dry}
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

	if dry {
		return out.said(r), nil
	}

	// WHAT WAS THERE IS WRITTEN DOWN BEFORE ANYTHING IS OVERWRITTEN, and a
	// journal that cannot be written refuses the apply. A bulk edit nobody can
	// undo is the incident this exists to prevent.
	undo, err := journalUndo(r, out.Files, before, born, content)
	if err != nil {
		return out, fmt.Errorf("the undo journal would not write, so nothing was: %w", err)
	}
	out.Undo = undo

	for _, path := range out.Files {
		if err := writeAtomic(path, content[path], 0o644); err != nil {
			return out, fmt.Errorf("writing %s: %w", shortPath(r, path), err)
		}
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

// journalUndo writes what every file held before this apply, and answers where
// it put it. A file this apply brings into being is recorded as absent, so
// undoing removes it rather than writing an empty one.
func journalUndo(r Roots, files []string, before map[string][]byte, born map[string]bool, after map[string][]byte) (string, error) {
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
	b, err := json.MarshalIndent(was, "", "  ")
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
func Undo(r Roots) ([]string, error) {
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
	newest := filepath.Join(undoDir(r), names[len(names)-1])

	b, err := os.ReadFile(newest)
	if err != nil {
		return nil, fmt.Errorf("the undo journal will not read: %w", err)
	}
	var was []wasFile
	if err := json.Unmarshal(b, &was); err != nil {
		return nil, fmt.Errorf("the undo journal is not readable: %w", err)
	}

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
