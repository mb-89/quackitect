package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"quackitect/engine/internal/frontmatter"
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
	if err := theShapeOfTheTree(r, out.Files, content, born); err != nil {
		return out, err
	}
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
//
// AND THE TEXT IT WROTE, NOT ONLY THE HASH OF IT. The hash is what the drift
// check reads, and nobody can read a file back out of one. The private folder
// is not in git, so a file the engine overwrote was gone for good unless some
// later apply happened to journal that text as its own before. Two tokens were
// lost that way, one entry holding a blank template and one holding a state an
// apply short of what the token said.
//
// SO THE ENTRY IS THE WHOLE OF BOTH SIDES, and the state between two applies is
// rebuilt from the older entry alone. It costs the size of the file again,
// which is what a journal of an edit is for.
type wasFile struct {
	File    string `json:"file"`
	Was     string `json:"was,omitempty"`
	Made    string `json:"made,omitempty"`
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
		e := wasFile{File: shortPath(r, path), Made: string(after[path]), Applied: hashOf(after[path])}
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
	rules, err := voice.Load(DeclaredAt(r.Method, "voice-rules.json"))
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


// SIX RULES THAT WERE SWEEPS, REFUSED AT THE WRITE INSTEAD.
//
// Each of these was a check walking whatever the tree happened to hold: every
// .sh, every .mjs, every note, every .go. A sweep finds the defect after it is
// in, on a run somebody has to remember to make, and it gets slower as the tree
// grows. The bytes are in hand here, so the answer is known before the file
// exists, and the refusal can say what to do instead.
//
// THEY REFUSE A FORM, NEVER A PLACE. The same content written properly goes
// through, and each refusal says how, the way proseThatReads does above.
//
// AND EACH ONE IS TESTED ON A PLANTED CASE AND A CLEAN ONE BESIDE IT. That is
// what the checks they replace could never do: their input was the tree, so a
// green run meant nobody had broken it yet rather than that the rule was held.
// IT READS THE FILE AND NOT THE EDIT. An exact edit hands over a fragment, so a
// rule asked about the fragment answers about a few lines and calls the file
// clean. Every one of these is a question about what the file will hold, and
// that is in hand here: the manifest is resolved before anything is written.
func theShapeOfTheTree(r Roots, files []string, content map[string][]byte, born map[string]bool) error {
	for _, at := range files {
		if underPrivate(r, at) {
			continue // .se is where what does not travel lives
		}
		rel, err := filepath.Rel(r.Work, at)
		if err != nil || strings.HasPrefix(rel, "..") {
			continue
		}
		rel = filepath.ToSlash(rel)
		text := string(content[at])
		for _, refuse := range []func(Roots, bool, string, string) error{
			aScriptWithoutACarriageReturn,
			aPatternWithoutALoneEscape,
			aTestWithoutATokenId,
			aNameThatStandsOnce,
			aDrawingWithoutALooseGlyph,
			aNoteTheRecordWouldRefuse,
			aNoteLinkingWhatNoCloneCarries,
			aParallelTestSwappingASeam,
			aSecondReachForTheChildProcess,
			aRefusalNamingNoDoor,
			aPushLandingOffTheBranches,
			anOpenTokenMissingASection,
			everyNewArchiveRowTravels,
			aNoteStandingBesideItsArchiveRow,
			theBurnDownBarDrawsWhatItWasHanded,
			aCheckPathTheMethodDoesNotHold,
			aDoneWhenLineNamesARunnableCommand,
			anArchiveDroppingANoteThatIsGone,
			theCageCitesOnlyWhatTravels,
			aStartOfTheEngineWritingItsOwnFlags,
			aDrawingFileSaysNoColourOutLoud,
			everyLabelNamesADeclaredIcon,
			aProjectionCarryingMoreThanItsChapter,
			aCardDiscussesEveryPointItLists,
			theTravellingCageNamesNoRefusal,
			everyFlagAVerbDeclaresHasALaneField,
		} {
			if err := refuse(r, born[at], rel, text); err != nil {
				return err
			}
		}
	}
	return nil
}

// A SCRIPT CARRIES NO CARRIAGE RETURN. The interpreter reads it as part of the
// line, so the script dies on Linux and nowhere else.
func aScriptWithoutACarriageReturn(_ Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".sh") || !strings.Contains(text, "\r") {
		return nil
	}
	at := strings.Index(text, "\r")
	return fmt.Errorf("%s carries a carriage return at byte %d, and a shell reads it as part of the "+
		"line, so the script dies on Linux and nowhere else. Write it with line feeds. "+
		"A carriage return a checkout adds is .gitattributes' business and not this one.", rel, at)
}

// A PATTERN IS NOT BUILT FROM A LONE ESCAPE.
//
// The string is read before the pattern is, so a single backslash reaches the
// matcher as a control character. The pattern then matches nothing and every
// assertion resting on it is green. It fails silent by construction, which is
// why finding it afterwards means every run in between was false evidence.
// IT COUNTS THE BACKSLASHES AND DOES NOT MERELY FIND ONE. A first draft asked
// for a backslash anywhere ahead of the class letter, so it refused the doubled
// form as well, which is the answer it tells the writer to give. Its own clean
// case said so on the first run.
//
// So the run before the letter has to be odd: the head takes backslashes two at
// a time, and the one that reaches the letter stands alone.
var aLoneEscape = regexp.MustCompile(`(?:RegExp|regexp\.MustCompile|regexp\.Compile)\(\s*"(?:[^"\\]|\\\\|\\")*` +
	`\\(?:[dDwWsSbBAzZnrtfv0-9pPkQEuxc]|\.)`)

func aPatternWithoutALoneEscape(_ Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".mjs") && !strings.HasSuffix(rel, ".ts") && !strings.HasSuffix(rel, ".go") {
		return nil
	}
	m := aLoneEscape.FindString(text)
	if m == "" {
		return nil
	}
	return fmt.Errorf("%s builds a pattern from a double-quoted string holding a lone backslash: %q. "+
		"The string is read before the pattern is, so this reaches the matcher as a control character, "+
		"the pattern matches nothing, and everything resting on it goes green. "+
		"Double the backslashes, or write it as a literal pattern.", rel, m)
}

// A TEST NAMES NO TOKEN. A file meant to outlive the record carrying an id from
// the record hands a reader a link into work that has closed and gone.
var aTokenId = regexp.MustCompile(`wk-[0-9a-f]{10}`)

func aTestWithoutATokenId(_ Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, "_test.go") && !strings.HasPrefix(rel, "spec/guidance/") {
		return nil
	}
	for _, id := range aTokenId.FindAllString(text, -1) {
		// A PLACEHOLDER IS NOT AN ID. wk-1111111111 is a fixture saying "some
		// token", and every test that needs one writes it that way.
		if strings.Count(id, string(id[3])) == len(id)-3 {
			continue
		}
		return fmt.Errorf("%s names %s, which is a token in the record. "+
			"A test outlives the work it was written for, and the record's ids close and go, "+
			"so a reader is left with a link into nothing. Provenance belongs on the token. "+
			"A fixture that needs an id writes one repeated digit, like wk-1111111111.", rel, id)
	}
	return nil
}

// A NAME STANDS ONCE. A file moved into a package and also left behind means one
// copy is read by everything and one by nothing, and the compiler does not mind.
// IT LOOKS BOTH WAYS. The twin is made by whichever half arrives second, and
// either half can be the one arriving, so asking only about a new flat file
// would let the same pair through when the internal copy is the new one.
func aNameThatStandsOnce(r Roots, isNew bool, rel, _ string) error {
	dir := filepath.ToSlash(filepath.Dir(rel))
	if !isNew || !strings.HasSuffix(rel, ".go") {
		return nil // already there, so this write is not making a second one
	}
	name := filepath.Base(rel)
	internal := filepath.Join(r.Work, "src", "engine", "internal")

	if dir == "src/engine" {
		pkgs, err := os.ReadDir(internal)
		if err != nil {
			return nil
		}
		for _, p := range pkgs {
			if !p.IsDir() {
				continue
			}
			if _, err := os.Stat(filepath.Join(internal, p.Name(), name)); err == nil {
				return theTwin(rel, "src/engine/internal/"+p.Name()+"/"+name)
			}
		}
		return nil
	}

	if pkg, ok := strings.CutPrefix(dir, "src/engine/internal/"); ok && !strings.Contains(pkg, "/") {
		if _, err := os.Stat(filepath.Join(r.Work, "src", "engine", name)); err == nil {
			return theTwin(rel, "src/engine/"+name)
		}
	}
	return nil
}

// theTwin says the pair, because the hand that reads it is the one that has to
// decide which of the two is the dead one.
func theTwin(writing, standing string) error {
	return fmt.Errorf("%s would stand twice: this name is already %s. "+
		"One of the two would be read by everything and the other by nothing, and the "+
		"compiler will not say which, because they are different packages. "+
		"Read the callers and write the one they use.", writing, standing)
}

// A FILE THAT DRAWS CARRIES NO LOOSE GLYPH. The icon table decides what a name
// looks like, and a character written into the page is a second decision that
// can disagree with it.
func aDrawingWithoutALooseGlyph(_ Roots, _ bool, rel, text string) error {
	if !aFileThatDraws(rel) {
		return nil
	}
	// IT ASKS FOR THE PROPERTY AND NOT FOR THE REGISTRY.
	//
	// A first draft refused the marks the icon table declares. That can only
	// ever catch a mark already in the table, and a mark nowhere in it is the
	// actual violation: five went past that way, a gear on a button among them.
	// So every character above ASCII is refused, and the table is the exemption
	// list rather than the search list.
	for n, body := range strings.Split(text, "\n") {
		body = strings.TrimRight(body, "\r")
		trimmed := strings.TrimSpace(body)
		if strings.Contains(body, theGlyphIsData) || strings.HasPrefix(trimmed, "//") || strings.HasPrefix(trimmed, "*") {
			continue // the line says the character is data, or the line is prose
		}
		ch, line := rune(0), n+1
		for _, c := range theEntitiesWrittenOut(body) {
			if c > 127 {
				ch = c
				break
			}
		}
		if ch == 0 {
			continue
		}
		return fmt.Errorf("%s carries %q at line %d, and this file draws. "+
			"The icon table decides what a name looks like, so a character written here is a "+
			"second decision that can disagree with it. Name an entry in the table, or write "+
			"the words `"+theGlyphIsData+"` on the line to say the character is data.", rel, ch, line)
	}
	return nil
}

// A NOTE PASSES WHAT THE RECORD ITSELF REFUSES.
//
// THE TWO DOORS DID NOT AGREE. SaveToken puts every note through
// TheRecordRefuses, and a note written as a file through here went past it: the
// only thing asked was whether a section had run past its word cap. A doubled
// heading, or a heading inside a fenced block, went in through the door agents
// are told to use and was refused only through the one they do not.
//
// IT ASKS THE OWNER RATHER THAN HOLDING A COPY. The rules live in store.go and
// they move; a second reading of them here would drift, which is what the
// scanning check that used to do this did.
//
// THE CAPS ARE LEFT TO tokensThatFit. A cap already past its bound refuses a
// write that brings it down, and that trap is why the other door holds the two
// apart. Only the absolute rules are asked here.
func aNoteTheRecordWouldRefuse(r Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".md") {
		return nil
	}
	id := strings.TrimSuffix(filepath.Base(rel), ".md")
	if t, err := noteToken(text, id); err == nil {
		if err := blocksHoldNoHeading(t); err != nil {
			return fmt.Errorf("%s: %w. Nothing was written", rel, err)
		}
	}
	// THE HEADING RULE IS ABOUT THE NOTE AND NOT ABOUT THE TOKEN. A file that
	// does not parse as a token is still read by a person, and a chapter lost
	// on the way in is lost either way.
	if filepath.ToSlash(filepath.Dir(rel)) != TheTrackedFolder {
		return nil
	}
	// THE QUESTION IS ABOUT THE BYTES AND NOT ABOUT THE TOKEN THEY PARSE TO.
	//
	// headingsSaidOnce asks a Token, whose body is rendered back out of the
	// fields the reader filled. A section written twice is read into one field,
	// the second overwriting the first, so by the time the rule looks there is
	// one heading and a chapter has been lost without a word. Which is the same
	// defect, seen from the far side.
	//
	// So the owner's chapter splitter is asked about the text as written.
	//
	// A FENCED BLOCK IS NOT THE NOTE'S OWN PROSE. A note quoting a markdown
	// sample carries the sample's headings, and those belong to the sample.
	_, body := frontmatter.Split(text)
	seen := map[string]bool{}
	for _, c := range chaptersOf(theFencesTakenOut(body), 2) {
		if seen[c.Header] {
			return fmt.Errorf("%s opens a %q section twice, and the reader keeps the second: "+
				"the first is lost on the way in, without a word. "+
				"Fold the two into one. Nothing was written", rel, c.Header)
		}
		seen[c.Header] = true
	}
	return nil
}

// theFencesTakenOut blanks the lines between fences, keeping the line count so
// anything counting lines still answers about the file as written.
func theFencesTakenOut(body string) string {
	lines := strings.Split(strings.ReplaceAll(body, "\r\n", "\n"), "\n")
	fenced := false
	for i, line := range lines {
		if strings.HasPrefix(strings.TrimLeft(line, " \t"), "```") {
			fenced = !fenced
			lines[i] = ""
			continue
		}
		if fenced {
			lines[i] = ""
		}
	}
	return strings.Join(lines, "\n")
}

// A TRACKED NOTE LINKS ONLY WHAT A CLONE CAN OPEN.
//
// A note under the tracked folder travels. A note under .se does not, so a
// [[link]] from the first to the second is a shut door on every box but this
// one, and it reads as a live reference right up until somebody clicks it.
//
// THE QUESTION IS ABOUT WHAT TRAVELS AND NOT ABOUT WHAT IS PRIVATE. The check
// this replaces asked whether the id was under .se, so on a fresh clone, where
// .se holds nothing, every broken link passed: it was dead exactly on the box
// it was written to protect. So the rule is that a link names a note the
// tracked folder holds, and no private folder is read at all.
var aWikiLink = regexp.MustCompile(`\[\[(wk-[0-9a-z]+)\]\]`)

func aNoteLinkingWhatNoCloneCarries(r Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".md") || filepath.ToSlash(filepath.Dir(rel)) != TheTrackedFolder {
		return nil
	}
	named := aWikiLink.FindAllStringSubmatch(text, -1)
	if len(named) == 0 {
		return nil
	}
	travels := map[string]bool{strings.TrimSuffix(filepath.Base(rel), ".md"): true}
	entries, err := os.ReadDir(TrackedDir(r))
	if err != nil {
		return nil // no tracked folder to ask, so nothing is decided here
	}
	for _, e := range entries {
		travels[strings.TrimSuffix(e.Name(), ".md")] = true
	}
	for _, m := range named {
		if travels[m[1]] {
			continue
		}
		return fmt.Errorf("%s links [[%s]], and %s holds no such note, so the link is a shut "+
			"door on every box but this one. A note that travels links only what travels. "+
			"Say what it said in a sentence, or move the note into %s.",
			rel, m[1], TheTrackedFolder, TheTrackedFolder)
	}
	return nil
}

// A TEST THAT RUNS BESIDE OTHERS SWAPS NO SEAM.
//
// t.Parallel() says this test runs at the same time as its siblings. A package
// variable assigned inside it is assigned under all of them, so the failure
// lands in whichever test happened to be reading, and it lands differently
// every run. It is the one defect a green run says nothing about.
var theParallelMark = regexp.MustCompile(`\bt\.Parallel\(\)`)
var aPlainAssignment = regexp.MustCompile(`(?m)^\s+([A-Za-z_]\w*)\s*=[^=]`)
var aPackageVariable = regexp.MustCompile(`(?m)^var\s+([A-Za-z_]\w*)|^\t([A-Za-z_]\w*)\s+=[^=]`)

func aParallelTestSwappingASeam(r Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, "_test.go") || !theParallelMark.MatchString(text) {
		return nil
	}
	// A SWAP UNDER A LOCK IS DELIBERATE. A seam taken and released around the
	// test is not a race, and refusing it would refuse the answer this refusal
	// tells the writer to give.
	if strings.Contains(text, ".Lock()") {
		return nil
	}
	assigned := aPlainAssignment.FindAllStringSubmatch(text, -1)
	if len(assigned) == 0 {
		return nil
	}
	// THE SEAMS ARE READ OUT OF THE FILES THAT ARE NOT TESTS. A var in a test
	// file is that test's own, and calling it a package seam refused a test for
	// touching what it declared itself.
	seams := theSeamsOf(r, filepath.Dir(rel))
	for _, m := range assigned {
		// A NAME THE FILE DECLARES IS ITS OWN. A local shadowing a package
		// variable is not a swap, and reading one as a swap named 160 tests
		// that swap nothing when the check this replaces first tried it.
		if regexp.MustCompile(`(?m)\bvar\s+`+regexp.QuoteMeta(m[1])+`\b|^\s+`+regexp.QuoteMeta(m[1])+`\s*(?:,[^=\n]*)?:=`).MatchString(text) {
			continue
		}
		if seams[m[1]] {
			return fmt.Errorf("%s calls t.Parallel() and assigns %s, which the package declares. "+
				"Every sibling running beside it reads that variable, so the failure lands in "+
				"whichever test was looking and lands somewhere else next run. "+
				"Drop t.Parallel(), or hand the seam in rather than swapping it.", rel, m[1])
		}
	}
	return nil
}

func theSeamsOf(r Roots, dir string) map[string]bool {
	out := map[string]bool{}
	entries, err := os.ReadDir(filepath.Join(r.Work, filepath.FromSlash(dir)))
	if err != nil {
		return out
	}
	for _, e := range entries {
		name := e.Name()
		if e.IsDir() || !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") {
			continue
		}
		b, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(dir), name))
		if err != nil {
			continue
		}
		for _, m := range aPackageVariable.FindAllStringSubmatch(string(b), -1) {
			for _, got := range m[1:] {
				if got != "" {
					out[got] = true
				}
			}
		}
	}
	return out
}

// THE EXTENSION REACHES FOR child_process IN ONE PLACE.
//
// Every spawn the extension makes has to hide its window, and a second file
// that reaches for the module is a second place that has to remember. The one
// that forgot left a console flashing on every keystroke.
//
// IT WALKS TO THE BOTTOM. The check this replaces read the top folder only,
// which is how a file in a subfolder reached the module unseen.
func aSecondReachForTheChildProcess(r Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".ts") || !strings.HasPrefix(rel, "src/extension/") {
		return nil
	}
	if !strings.Contains(text, "child_process") {
		return nil
	}
	// AND THE ONE PLACE HIDES THE WINDOW. Node leaves windowsHide false, so a
	// child started from a process with no console gets one, and that is a
	// window on somebody's screen. Being the only door is the whole reason this
	// file can be the only one that has to remember.
	if !strings.Contains(text, "windowsHide: true") {
		return fmt.Errorf("%s reaches for child_process and sets no windowsHide. "+
			"Node leaves it false, so a child started from a process with no console "+
			"opens one on somebody's screen. Write windowsHide: true on the spawn.", rel)
	}
	for _, other := range theExtensionFilesNaming(r, "child_process") {
		if other == rel {
			continue
		}
		return fmt.Errorf("%s reaches for child_process, and %s already does. "+
			"Every spawn has to hide its window, and a second place that reaches for the "+
			"module is a second place that has to remember. Call through the door in %s.",
			rel, other, other)
	}
	return nil
}

func theExtensionFilesNaming(r Roots, word string) []string {
	var out []string
	at := filepath.Join(r.Work, "src", "extension")
	_ = filepath.WalkDir(at, func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() || !strings.HasSuffix(path, ".ts") {
			return nil
		}
		if strings.Contains(path, "node_modules") {
			return nil
		}
		b, err := os.ReadFile(path)
		if err != nil || !strings.Contains(string(b), word) {
			return nil
		}
		if rel, err := filepath.Rel(r.Work, path); err == nil {
			out = append(out, filepath.ToSlash(rel))
		}
		return nil
	})
	sort.Strings(out)
	return out
}

// A REFUSAL THAT NAMES A LANE TOOL NAMES A SHELL DOOR BESIDE IT.
//
// A cloud session cloned this tree and its tool lane never came up. Every guard
// then refused every call and named an se_ tool that was not there, so each
// guard's only door was held shut by the other and the session had no legal
// move at all. The refusals were correct and the session was dead.
//
// WHAT COUNTS AS AN INSTRUCTION. A literal naming a lane tool is either a
// sentence to the agent or an identifier the engine compares against, and
// length tells them apart: se_answer is nine characters and a name.
//
// IT READS EVERY .go AND NOT ONE FOLDER. The check this replaces listed the top
// of src/engine, so every refusal written under internal was judged by nobody.
var aLaneTool = regexp.MustCompile(`\bse_(pull|stop|answer|work|apply|run|test|find|ask|claim|said|status)\b`)
var aTopLevelFunc = regexp.MustCompile(`(?m)^func (?:\([^)]*\) )?(\w+)`)
var aStringLiteral = regexp.MustCompile(`"((?:[^"\\]|\\.)*)"`)

// aSentenceIsThisLong is where a name stops and an instruction starts.
const aSentenceIsThisLong = 30

func aRefusalNamingNoDoor(_ Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".go") || strings.HasSuffix(rel, "_test.go") {
		return nil
	}
	for name, block := range theTopLevelBlocks(text) {
		var told string
		for _, line := range strings.Split(block, "\n") {
			if strings.HasPrefix(strings.TrimSpace(line), "//") {
				continue // prose is not a literal, and this file's own explains the rule
			}
			for _, m := range aStringLiteral.FindAllStringSubmatch(line, -1) {
				if len(m[1]) >= aSentenceIsThisLong && aLaneTool.MatchString(m[1]) {
					told = m[1]
				}
			}
		}
		if told == "" || strings.Contains(block, "RUNME.sh") || strings.Contains(block, "theShellDoor(") {
			continue
		}
		return fmt.Errorf("%s %s tells the agent to use %s and names no shell command that does "+
			"the same job. A session whose lane never came up cannot follow it, and every other "+
			"guard is refusing it at the same time. Name theShellDoor(...) beside it.\n  %q",
			rel, name, aLaneTool.FindString(told), told[:min(len(told), 120)])
	}
	return nil
}

// theTopLevelBlocks cuts a file at its func lines, so a refusal is judged beside
// the door its own function names.
func theTopLevelBlocks(text string) map[string]string {
	out := map[string]string{}
	starts := aTopLevelFunc.FindAllStringSubmatchIndex(text, -1)
	for i, at := range starts {
		end := len(text)
		if i+1 < len(starts) {
			end = starts[i+1][0]
		}
		out[text[at[2]:at[3]]] = text[at[0]:end]
	}
	return out
}

// A PUSH LANDS ON refs/heads AND NOWHERE ELSE.
//
// MEASURED, September 2026, one commit object and one session, minutes apart:
// refs/heads created twice, refs/se 403, refs/notes 403, refs/tags 403. The git
// proxy in front of a cloud box refuses every namespace but refs/heads.
//
// WHAT THAT COST. claim.go pushed refs/se/claims, put the failure in prose and
// carried on, so a box took a claim, believed it published, and no other box
// saw it. The archive pushed refs/tags/archive/<id> and lost the only copy of
// six notes the same way.
//
// IT IS THE ONE REGRESSION A DESK CANNOT SEE. Both pushes work on every desk
// and fail on every cloud box, so nothing on the box where the code is written
// ever says a word.
func aPushLandingOffTheBranches(r Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".go") || strings.HasSuffix(rel, "_test.go") || !strings.HasPrefix(rel, "src/") {
		return nil // a test drives a fed git that pushes nowhere
	}
	if !strings.Contains(text, `"push"`) {
		return nil
	}
	named := theStringConstantsOf(text)
	for _, sent := range thePushesIn(text, named) {
		far := theFarSideOf(sent)
		if !strings.HasPrefix(far, "refs/") || strings.HasPrefix(far, "refs/heads/") {
			continue
		}
		return fmt.Errorf("%s pushes %s, which lands on %s. A cloud box is answered 403 for "+
			"every namespace but refs/heads, so this fails there and nowhere else: it works on "+
			"every desk. Send it to refs/heads/... instead.", rel, sent, far)
	}
	return nil
}

// theStringConstantsOf collects the string constants a file declares, because a
// push names claimsBranch rather than the text it stands for.
var aStringConstant = regexp.MustCompile(`(?m)^\s*(?:const\s+)?(\w+)\s*=\s*"([^"]*)"`)

func theStringConstantsOf(text string) map[string]string {
	out := map[string]string{}
	for _, m := range aStringConstant.FindAllStringSubmatch(text, -1) {
		out[m[1]] = m[2]
	}
	return out
}

// thePushesIn answers every ref a file sends, spelled out as far as the
// constants say.
//
// A PUSH IS AN ARGUMENT AND NOT ANY LINE HOLDING THE WORD. claim.go compares a
// variable against push to decide whether a git call reaches the network, and
// that line sends nothing.
func thePushesIn(text string, named map[string]string) []string {
	var out []string
	const word = `"push"`
	for at := strings.Index(text, word); at >= 0; at = indexFrom(text, word, at+1) {
		before := at - 1
		for before >= 0 && (text[before] == ' ' || text[before] == '\t' || text[before] == '\n' || text[before] == '\r') {
			before--
		}
		if before < 0 || (text[before] != '(' && text[before] != ',') {
			continue
		}
		remote := false
		for _, arg := range theArgumentsAfter(text, at+len(word)) {
			spec := theSpellingOf(arg, named)
			if strings.HasPrefix(spec, "-") {
				continue // a flag before the remote is not a ref
			}
			if !remote {
				remote = true
				continue
			}
			out = append(out, spec)
		}
	}
	return out
}

func indexFrom(text, word string, from int) int {
	if from >= len(text) {
		return -1
	}
	at := strings.Index(text[from:], word)
	if at < 0 {
		return -1
	}
	return from + at
}

// theArgumentsAfter reads from just after one argument to the call's own
// closing paren, and answers the arguments between.
//
// DEPTH IS COUNTED, so a nested call is passed over and a wrapped call is read
// whole. Cutting at the first closing paren cut a refspec short. Reading one
// line glued the closing brace onto the last argument. Both answered green over
// a push that fails on every cloud box.
func theArgumentsAfter(text string, from int) []string {
	var out []string
	var part strings.Builder
	depth, quote := 0, byte(0)
	for i := from; i < len(text); i++ {
		c := text[i]
		if quote != 0 {
			part.WriteByte(c)
			if c == '\\' && i+1 < len(text) {
				i++
				part.WriteByte(text[i])
			} else if c == quote {
				quote = 0
			}
			continue
		}
		if c == '/' && i+1 < len(text) && text[i+1] == '/' {
			if nl := strings.IndexByte(text[i:], '\n'); nl >= 0 {
				i += nl
			} else {
				i = len(text)
			}
			continue
		}
		if c == '"' || c == '`' {
			quote = c
			part.WriteByte(c)
			continue
		}
		if c == ')' && depth == 0 {
			break
		}
		if c == ',' && depth == 0 {
			out = append(out, part.String())
			part.Reset()
			continue
		}
		switch c {
		case '(', '[', '{':
			depth++
		case ')', ']', '}':
			depth--
		}
		part.WriteByte(c)
	}
	out = append(out, part.String())
	var kept []string
	for _, a := range out {
		if a = strings.TrimSpace(a); a != "" {
			kept = append(kept, a)
		}
	}
	return kept
}

// theSpellingOf turns a Go expression into the text it builds, as far as the
// constants say. What it cannot resolve it leaves as the identifier, and an
// unresolved word is not a refs/ prefix, so it reads as a branch name.
func theSpellingOf(expr string, named map[string]string) string {
	var out strings.Builder
	for _, part := range theTermsOf(expr) {
		bit := strings.TrimSpace(part)
		if len(bit) >= 2 && bit[0] == '"' && bit[len(bit)-1] == '"' && !strings.Contains(bit[1:len(bit)-1], `"`) {
			out.WriteString(bit[1 : len(bit)-1])
			continue
		}
		if was, ok := named[bit]; ok {
			out.WriteString(was)
			continue
		}
		out.WriteString(bit)
	}
	return out.String()
}

// theTermsOf cuts a Go expression at its plus signs, outside string literals. A
// plus inside a literal is part of the text rather than a join.
func theTermsOf(expr string) []string {
	var out []string
	var part strings.Builder
	quote := byte(0)
	for i := 0; i < len(expr); i++ {
		c := expr[i]
		if quote != 0 {
			part.WriteByte(c)
			if c == '\\' && i+1 < len(expr) {
				i++
				part.WriteByte(expr[i])
			} else if c == quote {
				quote = 0
			}
			continue
		}
		if c == '"' || c == '`' {
			quote = c
			part.WriteByte(c)
			continue
		}
		if c == '+' {
			out = append(out, part.String())
			part.Reset()
			continue
		}
		part.WriteByte(c)
	}
	return append(out, part.String())
}

// theFarSideOf is where a refspec lands on the remote. One with a colon lands
// where its right half names, and one without lands where it names. A leading
// plus is the force marker rather than part of a name.
func theFarSideOf(spec string) string {
	far := spec
	if at := strings.Index(spec, ":"); at >= 0 {
		far = spec[at+1:]
	}
	return strings.TrimSpace(strings.TrimPrefix(far, "+"))
}

// AN OPEN TOKEN CARRIES THE SECTIONS ITS PROCESS REQUIRES.
//
// A standard token was split in two and the halves were written by hand. Both
// said in their evidence that they carried the approach unchanged, and neither
// file held an approach heading at all. So two open tokens sat in the queue
// offering no shape a reader could have disagreed with before the work began,
// which is the one thing the standard process asks for over the trivial one.
//
// THE DECLARATION IS READ AND NOT COPIED. The process says which sections it
// requires, and a list written here would be a second copy of it. A token
// minted from a template gets them; one written by hand, split off another, or
// edited afterwards is read back by a parser that asks for none.
//
// A CLOSED TOKEN IS NOT JUDGED. What is asked is that work waiting to be taken
// says what it is, and one that has ended is a record rather than an offer.
func anOpenTokenMissingASection(r Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".md") || filepath.ToSlash(filepath.Dir(rel)) != TheTrackedFolder {
		return nil
	}
	t, err := noteToken(text, strings.TrimSuffix(filepath.Base(rel), ".md"))
	if err != nil {
		return nil
	}
	p, err := LoadProcess(r.Method, unlink(t.Process))
	if err != nil {
		return nil // a process nothing declares is another rule's business
	}
	// WHERE A TOKEN ENDS IS THE PROCESS'S OWN ANSWER, not the word closed. A
	// process may end somewhere else, and writing the word here would be a
	// second copy of the declaration.
	if string(t.Status) == p.EndsAt() {
		return nil
	}
	has := map[string]bool{}
	for _, c := range chaptersOf(theFencesTakenOut(text), 2) {
		has[c.Header] = true
	}
	for _, want := range p.RequiredSection {
		if has[want] {
			continue
		}
		return fmt.Errorf("%s is %s under the %s process and carries no %q section, which that "+
			"process requires. A token waiting to be taken has to say what it is, so a reader can "+
			"disagree with it before the work begins.", rel, t.Status, unlink(t.Process), "## "+want)
	}
	return nil
}

// theGlyphIsData is the words a line writes to say its character is data. It is
// a constant because the refusal quotes it, and a refusal naming an escape the
// code does not honour sends the reader round in a circle.
const theGlyphIsData = "not an icon"

// aFileThatDraws answers whether a file puts marks in front of a person. The
// rule is about drawing and not about a suffix, so every other .ts and .go in
// the tree may hold whatever text it likes.
func aFileThatDraws(rel string) bool {
	switch rel {
	case "src/extension/panel.ts", "src/extension/editor.ts":
		return true
	}
	// The viewer prints, and so does the log syntax reader that moved out of it,
	// so any .go in either may draw.
	if !strings.HasSuffix(rel, ".go") {
		return false
	}
	return strings.HasPrefix(rel, "src/viewer/") || strings.HasPrefix(rel, "src/filter/")
}

// theEntitiesWrittenOut answers a line with its numeric character references
// turned back into characters.
//
// A GEAR WRITTEN AS &#9881; IS THE SAME DECISION AS A GEAR. A file that
// generates a page writes the reference, so a rule reading characters alone
// looks straight past it.
var anEntity = regexp.MustCompile(`&#(x[0-9a-fA-F]+|[0-9]+);`)

func theEntitiesWrittenOut(line string) string {
	if !strings.Contains(line, "&#") {
		return line
	}
	return anEntity.ReplaceAllStringFunc(line, func(m string) string {
		body := m[2 : len(m)-1]
		base, digits := 10, body
		if body[0] == 'x' || body[0] == 'X' {
			base, digits = 16, body[1:]
		}
		n, err := strconv.ParseInt(digits, base, 32)
		if err != nil || n <= 0 || n > 0x10FFFF {
			return m
		}
		return string(rune(n))
	})
}
