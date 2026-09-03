package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// WHERE TOKENS LIVE, AND WHAT THEY ARE.
//
// A TOKEN IS A MARKDOWN NOTE. Its frontmatter is what the engine reads and
// what a query filters on. Its body is prose, which is what makes it a thing a
// person reads six months later rather than a record only a program can open.
//
// TWO FOLDERS, AND WHICH ONE DEPENDS ON THE TOKEN.
//
//	.se/work/   ephemeral. Scratch work, an agent's own breakdown. Private
//	            material, and it never travels with a copy.
//	doc/work/   traced. The record of what was done. It travels, and it is in
//	            version control, because that is the point of tracing it.
//
// The minter decides which, by deciding whether the token is traced, and
// nothing moves afterwards.
//
// A FOLDER MAY HOLD OTHER NOTES. A note is a token when its frontmatter says
// `type: work`, so neither folder is claimed whole and a person may keep their
// own notes beside them.

// EphemeralDir is private and never travels. TracedDir is the record.
func EphemeralDir(r Roots) string { return r.Private("work") }
func TracedDir(r Roots) string    { return filepath.Join(r.Work, "doc", "work") }

func workDirs(r Roots) []string { return []string{TracedDir(r), EphemeralDir(r)} }

// dirFor asks the process where a token of this kind lives.
//
// THE FOLDER IS THE ANSWER, NOT A FIELD. A token in doc/work is traced and one
// in .se/work is not, so writing it on the note as well was a second copy that
// could disagree with where the file actually is. The process decides where a
// new one goes, and the folder answers for one that exists.
func dirFor(r Roots, t Token) string {
	if p, err := LoadProcess(r.Method, t.Process); err == nil && p.Traced {
		return TracedDir(r)
	}
	return EphemeralDir(r)
}

// The frontmatter's order on the page: what it is, then where it stands, then
// what holds it back, then how it ended.
var frontOrder = []string{
	"kind", "process", "guidance", "title", "status", "bucket",
	"holder", "needs_human", "depends_on", "parent", "ready_when",
	"began", "ended", "disposition", "reason", "successors",
}

// A value the editor walks is written in brackets. The name inside is the
// value, so nothing downstream has to know the difference.
// asLinks is asLink over a list, and an empty entry is dropped rather than
// written as an empty pair of brackets.
func asLinks(all []string) []string {
	var out []string
	for _, v := range all {
		if l := asLink(v); l != "" {
			out = append(out, l)
		}
	}
	return out
}

// unlinkAll reads a list of links back as the names inside them. A list
// written before this program wrote links is read unchanged, because unlink
// takes a bare name as it stands.
func unlinkAll(all []string) []string {
	var out []string
	for _, v := range all {
		if name := unlink(v); name != "" {
			out = append(out, name)
		}
	}
	return out
}

func asLink(v string) string {
	if v == "" {
		return ""
	}
	return "[[" + v + "]]"
}

func (t Token) front() Front {
	f := Front{
		"kind":     asLink("work-token"),
		"process":  asLink(t.Process),
		"guidance": asLink(t.Guidance),
		"title":    t.Title,
		"status":   string(t.Status),
		"bucket":   t.Bucket,
		"holder":   t.Holder,
		// A RELATION IS WRITTEN AS A LINK, because the schema says the editor
		// walks it. It was written as a bare id, so the walk had nothing to
		// follow and the x-link on those two fields was a claim about a
		// behaviour that was not there.
		"depends_on":  asLinks(t.DependsOn),
		"parent":      asLink(t.Parent),
		"ready_when":  t.ReadyWhen,
		"began":       t.Began,
		"ended":       t.Finished,
		"disposition": string(t.Disposition),
		"reason":      t.Reason,
		"successors":  asLinks(t.Successors),
	}
	if t.NeedsHuman {
		f["needs_human"] = "true"
	}
	return f
}

// THE ID IS THE FILE NAME AND IS NOT WRITTEN TWICE. It is set by the reader
// from the path, so a token that is renamed is the token it is called.
func tokenFromFront(f Front) Token {
	return Token{
		Process:     unlink(fs(f, "process")),
		Guidance:    unlink(fs(f, "guidance")),
		Title:       fs(f, "title"),
		Status:      Status(fs(f, "status")),
		Bucket:      fs(f, "bucket"),
		Holder:      fs(f, "holder"),
		NeedsHuman:  fb(f, "needs_human"),
		DependsOn:   unlinkAll(fl(f, "depends_on")),
		Parent:      unlink(fs(f, "parent")),
		ReadyWhen:   fs(f, "ready_when"),
		Began:       fl(f, "began"),
		Finished:    fl(f, "ended"),
		Disposition: Disposition(fs(f, "disposition")),
		Reason:      fs(f, "reason"),
		Successors:  unlinkAll(fl(f, "successors")),
	}
}

// THE BODY IS PROSE, AND THE ENGINE WRITES ALL OF IT.
//
// Each section sits under a heading this program owns. A section under any
// other heading is kept whole and written back, because not understanding
// something is not a reason to delete it.
const (
	headDetail   = "## detail"
	headProposed = "## proposed action"
	headEvidence = "## evidence: "
	headCriteria = "## done when"
)

func (t Token) body() string {
	var b strings.Builder
	if t.Detail != "" {
		b.WriteString(headDetail + nl + nl + t.Detail + nl + nl)
	}
	if t.ProposedAction != "" {
		b.WriteString(headProposed + nl + nl + t.ProposedAction + nl + nl)
	}
	// WHAT DONE MEANS, in the note a person reads and edits.
	if len(t.Criteria) > 0 {
		b.WriteString(headCriteria + nl + nl)
		for _, c := range t.Criteria {
			b.WriteString("- " + c.Says + nl)
		}
		b.WriteString(nl)
	}
	for _, s := range sortedKeys(t.Submission) {
		b.WriteString(headEvidence + s + nl + nl + t.Submission[s] + nl + nl)
	}
	// AND WHATEVER THIS PROGRAM DOES NOT UNDERSTAND, PUT BACK.
	for _, k := range t.Kept {
		b.WriteString(k.Head + nl + nl + k.Text + nl + nl)
	}
	return b.String()
}

func sortedKeys(m map[string]string) []string {
	var out []string
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

// One newline, named, because writing it inline is where these files keep
// breaking.
const nl = "\n"

// A CRITERION IS A LIST ITEM. One line, and the line is the whole of it.
func readCriteria(text string) []Criterion {
	var out []Criterion
	for _, line := range strings.Split(text, nl) {
		if l := strings.TrimSpace(line); strings.HasPrefix(l, "- ") {
			out = append(out, Criterion{Says: strings.TrimSpace(l[2:])})
		}
	}
	return out
}

// sections cuts the body at every level-two heading. The heading is the whole
// line, because a finding's heading carries its round and its author.
func sections(body string) [][2]string {
	var out [][2]string
	var head string
	var buf []string
	flush := func() {
		if head != "" {
			out = append(out, [2]string{head, strings.TrimSpace(strings.Join(buf, "\n"))})
		}
		buf = nil
	}
	for _, line := range strings.Split(body, "\n") {
		if strings.HasPrefix(line, "## ") {
			flush()
			head = strings.TrimRight(line, " \t")
			continue
		}
		buf = append(buf, line)
	}
	flush()
	return out
}

// WHAT MOVED, IN THE RECORD. The agent does not remember to write these and
// cannot forget to: whoever moves a token moves it through SaveToken.
func noteMove(r Roots, t, was Token, existed bool) {
	switch {
	// THE LINE SAYS WHAT HAPPENED, IT IS NOT INFERRED FROM WHAT IS IN IT.
	//
	// MEASURED. The burn-down counted a mint by looking for a line that had a
	// status and no from, and an ending by looking for a disposition, and
	// neither key was ever written. Both numbers read nought for every day
	// there has ever been, and nothing said so, because nought is a number a
	// burn-down is allowed to answer.
	case !existed:
		inSession(r, "work", orElse(t.Holder, "main"), t.ID+" minted "+t.Status+": "+t.Title, Yes(),
			map[string]any{"id": t.ID, "minted": true, "status": t.Status, "process": t.Process})
	case was.Status != t.Status:
		who := orElse(t.Holder, was.Holder)
		inSession(r, "work", who,
			t.ID+" "+was.Status+" to "+t.Status+": "+t.Title, Yes(),
			map[string]any{"id": t.ID, "from": was.Status, "to": t.Status,
				"disposition": string(t.Disposition)})
	}
}

func readNote(path string) (Token, bool) {
	b, err := os.ReadFile(path)
	if err != nil {
		return Token{}, false
	}
	front, body := SplitNote(string(b))
	if front == "" {
		return Token{}, false
	}
	f, err := ParseFront(front)
	if err != nil {
		// A note that will not read is said out loud. Skipping it silently
		// would drop work from the queue and nothing would say why.
		fmt.Fprintf(os.Stderr, "engine: %s: %v\n", path, err)
		return Token{}, false
	}
	// A NOTE IS A TOKEN WHEN IT SAYS WHICH SCHEMA READS IT. type: work said the
	// same thing twice, so it went with the rest of what nothing read.
	if unlink(fs(f, "kind")) != "work-token" {
		return Token{}, false
	}
	t := tokenFromFront(f)
	// THE ID IS THE FILE NAME. It was written into the note as well, and two
	// copies of one name is one that can be renamed and one that cannot.
	t.ID = strings.TrimSuffix(filepath.Base(path), ".md")
	readBody(&t, body)
	// A NOTE IS EDITED BY HAND, so the rule is checked where the note is read
	// and not only where it was minted. A title that broke it is said out loud
	// and the token is still returned: refusing to read work is worse than
	// reading work with a bad title.
	if err := checkTitle(t.Title); err != nil {
		fmt.Fprintf(os.Stderr, "engine: %s: %v\n", path, err)
	}
	return t, true
}

func LoadToken(r Roots, id string) (Token, error) {
	// WHAT THE SNAPSHOT HOLDS IS WHAT IS ON DISK, so one token is read out of
	// it rather than opened again. A process that has read the folder once
	// does not open a file in it a second time.
	if r.snap != nil && r.snap.loaded {
		for _, t := range r.snap.tokens {
			if t.ID == id {
				return t, nil
			}
		}
		return Token{}, fmt.Errorf("no such token: %s", id)
	}
	for _, dir := range workDirs(r) {
		if t, ok := readNote(filepath.Join(dir, id+".md")); ok {
			return t, nil
		}
	}
	return Token{}, fmt.Errorf("no such token: %s", id)
}

// Tokens reads both folders, oldest first. Order is by when a token was opened,
// so a queue hands out the thing that has waited longest.
//
// IT READS THE FOLDERS ONCE PER PROCESS when the roots carry a snapshot, and
// answers a copy of the list, so a caller that moves a token in its copy
// moves nothing in anybody else's.
func Tokens(r Roots) []Token {
	if r.snap != nil {
		if !r.snap.loaded {
			r.snap.tokens = readTokens(r)
			r.snap.loaded = true
		}
		return append([]Token(nil), r.snap.tokens...)
	}
	return readTokens(r)
}

func readTokens(r Roots) []Token {
	var out []Token
	for _, dir := range workDirs(r) {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || Parked(e.Name()) {
				continue
			}
			if t, ok := readNote(filepath.Join(dir, e.Name())); ok {
				out = append(out, t)
			}
		}
	}
	// OLDEST FIRST, by the number it was minted with. A time would have said
	// the same thing and also said when somebody was at their desk.
	sort.Slice(out, func(i, j int) bool {
		// THE FILE NAME IS THE ORDER. A token carries no time and no sequence:
		// when it was typed is an accident, and a queue that sorts on it reads
		// an accident as a decision. An order somebody decided is depends_on.
		return out[i].ID < out[j].ID
	})
	return out
}

// A token is a ticket a person reads cold, and a ticket has a size. The
// record once held a token of 117 KB, grown round by round, and nothing
// refused it. The limits are parameters in util/parameters.json.
func proseThatFits(c Config, t Token) error {
	if n := len(t.Detail); n > c.DetailBytes {
		return fmt.Errorf("the detail is %d bytes and the limit is %d. Say what is asked in a few "+
			"sentences, and put the argument somewhere a reader opens on purpose", n, c.DetailBytes)
	}
	for _, name := range sortedKeys(t.Submission) {
		if n := len(t.Submission[name]); n > c.SectionBytes {
			return fmt.Errorf("evidence %q is %d bytes and the limit is %d. Name what was built "+
				"and what the check said, and leave the rest in the log", name, n, c.SectionBytes)
		}
	}
	return nil
}

func linesThatFit(t Token) error {
	for i, c := range t.Criteria {
		for _, one := range []struct{ field, value string }{
			{"says", c.Says},
		} {
			if !strings.ContainsAny(one.value, "\r\n") {
				continue
			}
			return fmt.Errorf("criterion %d, %q: its %s is written on more than one line, "+
				"and the note holds one. The reader stops at the first newline, so the rest "+
				"would be lost on this save. Write it on one line, or name a file and put "+
				"the whole of it in the evidence", i+1, firstLines(c.Says, 1), one.field)
		}
	}
	return nil
}

// blocksHoldNoHeading refuses a block that carries a line opening a section.
//
// THE RECORD REFUSES TO HOLD WHAT IT CANNOT READ BACK. A block reads to the
// next heading, so a heading inside one ends it early and the rest is lost on
// the save rather than on the write.
func blocksHoldNoHeading(t Token) error {
	opens := func(where, value string) error {
		for _, line := range strings.Split(value, nl) {
			if headingDepth(strings.TrimRight(line, "\r")) > 0 {
				return fmt.Errorf("%s carries a line that opens a section, and a block "+
					"reads to the next heading, so everything after it would be lost on this "+
					"save: %q", where, strings.TrimSpace(line))
			}
		}
		return nil
	}
	for _, one := range []struct{ where, value string }{
		{"Token.Detail", t.Detail}, {"Token.ProposedAction", t.ProposedAction},
	} {
		if err := opens(one.where, one.value); err != nil {
			return err
		}
	}
	return nil
}

// readBody fills the prose fields back.
//
// A SECTION THIS READER DOES NOT KNOW IS KEPT, NOT DROPPED. The file is
// rendered from this struct, so a heading nothing matched went nowhere and the
// next save rebuilt the file without it. Not understanding a section is not a
// reason to delete it.
func readBody(t *Token, body string) {
	for _, sec := range sections(body) {
		head, text := sec[0], sec[1]
		switch {
		case head == headDetail:
			t.Detail = text
		case head == headProposed:
			t.ProposedAction = text
		case head == headCriteria:
			t.Criteria = readCriteria(text)
		case strings.HasPrefix(head, headEvidence):
			if t.Submission == nil {
				t.Submission = map[string]string{}
			}
			t.Submission[strings.TrimPrefix(head, headEvidence)] = text
		default:
			t.Kept = append(t.Kept, KeptSection{Head: head, Text: text})
		}
	}
}

func SaveToken(r Roots, t Token) error {
	// THE RECORD REFUSES TO HOLD WHAT IT CANNOT READ BACK. A criterion is one
	// lead and one line, and the reader stops at the first newline, so a second
	// line is lost on the save rather than on the write. Here is where the value
	// stops being a value and becomes a line, and a refusal in a caller is a
	// refusal the next caller does not have.
	if err := linesThatFit(t); err != nil {
		return err
	}
	if err := blocksHoldNoHeading(t); err != nil {
		return err
	}
	if err := proseThatFits(LoadConfig(r), t); err != nil {
		return err
	}
	// EVERY CHANGE OF STATE IS IN THE RECORD, and this is the one place that
	// sees them all. The agent does not remember to write them and cannot
	// forget to: whoever moves a token moves it through here.
	//
	// It is the record and not the token because a traced token travels, and a
	// time on it says when somebody was at their desk.
	was, existed := LoadToken(r, t.ID)
	// WHERE IT IS NOW, so a token whose process moved it leaves nothing behind.
	//
	// MEASURED. A save wrote into the folder the process names and left the old
	// file where it was, so one token became two files with one id, and the
	// editor drew the row twice. It cost nothing while every process agreed
	// with the folder its tokens were already in, and it broke the day a note
	// was converted in doc/work and saved into .se/work.
	from := noteAt(r, t.ID)
	dir := dirFor(r, t)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	text := WriteFront(t.front(), frontOrder) + "\n" + t.body()
	final := filepath.Join(dir, t.ID+".md")

	tmp, err := os.CreateTemp(dir, t.ID+".*.tmp")
	if err != nil {
		return err
	}
	name := tmp.Name()
	if _, err := tmp.WriteString(text); err != nil {
		tmp.Close()
		os.Remove(name)
		return err
	}
	if err := tmp.Close(); err != nil {
		os.Remove(name)
		return err
	}
	if err := os.Rename(name, final); err != nil {
		os.Remove(name)
		return err
	}
	if from != "" && from != final {
		_ = os.Remove(from)    // the note is written; a stale copy is reported by the duplicate check
		_ = IndexFile(r, from) // the file is the truth, and the watcher catches up on a row it could not drop
	}
	// WHAT THIS PROCESS WROTE IS WHAT IT READS BACK. The snapshot was read
	// before the write, so it is dropped and the next ask reads the folder.
	// And the index is told, so the write is not missing from it either.
	r.forget()
	_ = IndexFile(r, final) // the file is the truth, and the watcher catches up on a row it could not write
	noteMove(r, t, was, existed == nil)
	return nil
}

// noteAt is the file a token is in now, or nothing when it is new. LoadToken
// answers the token and this answers where it was found, because a move has to
// know what it is moving from.
func noteAt(r Roots, id string) string {
	for _, dir := range workDirs(r) {
		p := filepath.Join(dir, id+".md")
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}
