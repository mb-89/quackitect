package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"quackitect/engine/internal/frontmatter"
	"quackitect/engine/internal/sessionlog"
	"sort"
	"strings"
)

// Where tokens live, and what they are.
//
// A token is a markdown note. Two folders hold them, and the minter picks one:
//
//	.se/work/   local. Private material, and it never travels with a copy.
//	doc/work/   tracked. The record of what was done, in version control.
//
// A note is a token when its frontmatter says `type: work`, so a folder may
// hold other notes beside them.
//
// Why it is this shape: [[tokens-are-notes-in-two-folders]].

// LocalDir is private and never travels. TrackedDir is the record.
func LocalDir(r Roots) string   { return r.Private("work") }
func TrackedDir(r Roots) string { return filepath.Join(r.Work, "doc", "work") }

func workDirs(r Roots) []string { return []string{TrackedDir(r), LocalDir(r)} }

// dirFor answers where a token's file belongs.
//
// The folder is the answer, and nothing else is. A token that has a file is in
// the folder holding it, so one moved by hand stays moved. A token with no file
// is new, and the mint said where it is born.
//
// Why it is this shape: [[the-folder-answers-where-a-token-lives]].
func dirFor(r Roots, t Token) string {
	if at := noteAt(r, t.ID); at != "" {
		return filepath.Dir(at)
	}
	if t.Tracked != nil && *t.Tracked {
		return TrackedDir(r)
	}
	return LocalDir(r)
}

// The frontmatter's order on the page: what it is, then where it stands, then
// what holds it back, then how it ended.
var frontOrder = []string{
	"kind", "process", "guidance", "title", "status", "bucket",
	"author", "claimed_by", "claimed_at", "urgent", "needs_human", "depends_on", "parent", "ready_when",
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

// narrowedSchema answers the work-token schema cut to the token's process.
// A schema that cannot be read answers the zero schema, which describes
// nothing and bounds nothing, because a writer that cannot look things up
// must still save.
func narrowedSchema(r Roots, t Token) Schema {
	s, err := LoadSchema(r.Method, "work-token")
	if err != nil {
		return Schema{}
	}
	if p, err := LoadProcess(r.Method, t.Process); err == nil {
		s = p.Narrow(s)
	}
	return s
}

// describeFields answers each field's description, so a saved token carries
// the same field guidance the template writes.
func describeFields(s Schema) map[string]string {
	out := map[string]string{}
	for name, spec := range s.Frontmatter.Properties {
		out[name] = spec.Description
	}
	return out
}

func (t Token) front() frontmatter.Front {
	f := frontmatter.Front{
		"kind":     asLink(t.kind()),
		"process":  asLink(t.Process),
		"guidance": asLink(t.Guidance),
		"title":    t.Title,
		"status":   string(t.Status),
		"bucket":   t.Bucket,
		// The holder is not written: holdstore.go keeps it under .se. Why is
		// [[the-hold-is-engine-state]].
		"author": t.Author,
		// The claim is written, where the holder is not, because it is for
		// the other boxes. See [[the-hold-is-engine-state]].
		"claimed_by": t.ClaimedBy,
		"claimed_at": t.ClaimedAt,
		// A relation is written as a link, so the editor can walk it. Why is
		// [[a-note-is-written-for-its-readers]].
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
	// A flag that is off is not written, the way needs_human is not. See
	// [[a-note-is-written-for-its-readers]].
	if t.Urgent {
		f["urgent"] = "true"
	}
	return f
}

// The id is the file name and is not written twice: the reader sets it from
// the path, so a renamed token is the token it is called. See
// [[a-field-is-read-or-gone]].
func tokenFromFront(f frontmatter.Front) Token {
	return Token{
		Process:  unlink(frontmatter.Str(f, "process")),
		Guidance: unlink(frontmatter.Str(f, "guidance")),
		Title:    frontmatter.Str(f, "title"),
		Status:   Status(frontmatter.Str(f, "status")),
		Bucket:   frontmatter.Str(f, "bucket"),
		// A holder in the file is not read, and there is no field to read it
		// into: the hold comes from holdstore.go. See [[the-hold-is-engine-state]].
		Author:      frontmatter.Str(f, "author"),
		ClaimedBy:   frontmatter.Str(f, "claimed_by"),
		ClaimedAt:   frontmatter.Str(f, "claimed_at"),
		NeedsHuman:  frontmatter.Bool(f, "needs_human"),
		Urgent:      frontmatter.Bool(f, "urgent"),
		DependsOn:   unlinkAll(frontmatter.List(f, "depends_on")),
		Parent:      unlink(frontmatter.Str(f, "parent")),
		ReadyWhen:   frontmatter.Str(f, "ready_when"),
		Began:       frontmatter.List(f, "began"),
		Finished:    frontmatter.List(f, "ended"),
		Disposition: Disposition(frontmatter.Str(f, "disposition")),
		Reason:      frontmatter.Str(f, "reason"),
		Successors:  unlinkAll(frontmatter.List(f, "successors")),
	}
}

// The body is prose, and the engine writes all of it. Each section sits under
// a heading this program owns, and a section under any other heading is kept
// whole and written back. Why is [[a-section-nobody-understands-is-kept]].
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
	// What done means, in the note a person reads and edits.
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
	// And whatever this program does not understand is put back, in
	// [[a-section-nobody-understands-is-kept]].
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

// A criterion is a list item: one line, and the line is the whole of it.
// The save refuses a second line, see
// [[the-record-refuses-what-it-cannot-read-back]].
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

// noteMove writes what moved into the record. Whoever moves a token moves it
// through SaveToken, so no caller writes these. See [[the-save-is-the-one-door]].
func noteMove(r Roots, t, was Token, existed bool) {
	switch {
	// The line says what happened, and it is not inferred from what is in it.
	//
	// Why it is this shape: [[the-line-says-what-happened]].
	case !existed:
		inSession(r, "work", orElse(t.Holder, "main"), t.ID+" minted "+t.Status+": "+t.Title, sessionlog.Yes(),
			map[string]any{"id": t.ID, "minted": true, "status": t.Status, "process": t.Process})
	case was.Status != t.Status:
		who := orElse(t.Holder, was.Holder)
		inSession(r, "work", who,
			t.ID+" "+was.Status+" to "+t.Status+": "+t.Title, sessionlog.Yes(),
			map[string]any{"id": t.ID, "from": was.Status, "to": t.Status,
				"disposition": string(t.Disposition)})
	}
}

// errNotAToken says a note is not a work token: it carries no frontmatter, or
// its kind belongs to somebody else. That is not a fault and nothing says it
// out loud, because both folders may hold notes beside the tokens.
var errNotAToken = errors.New("it is not a work token")

// noteToken reads a token out of a note's text. The id comes from the caller,
// because the file name is the id and the text does not carry it.
//
// One reader for both doors: readNote opens a file and this reads what was in
// it, and the save checks a write through it too. See
// [[the-record-refuses-what-it-cannot-read-back]].
func noteToken(text, id string) (Token, error) {
	front, body := frontmatter.Split(text)
	if front == "" {
		return Token{}, errNotAToken
	}
	f, err := frontmatter.Parse(front)
	if err != nil {
		return Token{}, err
	}
	// A note is a token when its kind says the work-token schema reads it.
	// Why type: work went is [[a-field-is-read-or-gone]].
	if unlink(frontmatter.Str(f, "kind")) != "work-token" {
		return Token{}, errNotAToken
	}
	t := tokenFromFront(f)
	// The id is the file name, and the caller passes it in. See
	// [[a-field-is-read-or-gone]].
	t.ID = id
	readBody(&t, body)
	return t, nil
}

func readNote(path string) (Token, bool) {
	b, err := os.ReadFile(path)
	if err != nil {
		return Token{}, false
	}
	t, err := noteToken(string(b), strings.TrimSuffix(filepath.Base(path), ".md"))
	if err != nil {
		// A note that will not read is said out loud. Skipping it silently
		// would drop work from the queue and nothing would say why.
		if !errors.Is(err, errNotAToken) {
			fmt.Fprintf(os.Stderr, "engine: %s: %v\n", path, err)
		}
		return Token{}, false
	}
	// A note is edited by hand, so the title rule is checked here as well as
	// at the mint. A break is said out loud and the token is still returned.
	// Why the read side never refuses is [[the-record-refuses-what-it-cannot-read-back]].
	if err := checkTitle(t.Title); err != nil {
		fmt.Fprintf(os.Stderr, "engine: %s: %v\n", path, err)
	}
	return t, true
}

func LoadToken(r Roots, id string) (Token, error) {
	// One token is read out of the snapshot rather than opened again. See
	// [[the-folders-are-read-once-per-process]].
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
			t.Holder = HeldBy(r, t.ID)
			return t, nil
		}
	}
	// The last place looked is the archive, in history. Why a closed token
	// is off the disk is [[the-close-archives-the-token]].
	if t, ok := readArchivedNote(r, id); ok {
		return t, nil
	}
	return Token{}, fmt.Errorf("no such token: %s", id)
}

// Tokens reads both folders, oldest first. Order is by when a token was opened,
// so a queue hands out the thing that has waited longest.
//
// It reads the folders once per process when the roots carry a snapshot, and
// answers a copy of the list. Why is [[the-folders-are-read-once-per-process]].
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
	// The holds are read once, not per note. See
	// [[the-folders-are-read-once-per-process]].
	held := heldNow(r)
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
				t.Holder = held[t.ID]
				out = append(out, t)
			}
		}
	}
	// Oldest first, by the number it was minted with, which is the file name.
	// An order somebody decided is depends_on. Why a token carries no time is
	// [[the-token-carries-no-time]].
	sort.Slice(out, func(i, j int) bool {
		return out[i].ID < out[j].ID
	})
	return out
}

// A token is a ticket a person reads cold, and a ticket has a size. The
// record once held a token of 117 KB, grown round by round, and nothing
// refused it. The bounds are the schema's, on the section they bound, so the
// rule lives with the field it holds.
func proseThatFits(s Schema, t Token) error {
	for _, one := range overCaps(s, t) {
		if one.Detail {
			return fmt.Errorf("the detail runs to %d words and the schema allows %d. Say what is asked in a few "+
				"sentences, and put the argument somewhere a reader opens on purpose", one.Words, one.Max)
		}
		return fmt.Errorf("%s runs to %d words and the schema allows %d. Name what was built "+
			"and what the check said, and leave the rest in the log", one.Says, one.Words, one.Max)
	}
	return nil
}

// overLong is one bounded section of a token that runs past its bound.
type overLong struct {
	// Says names the section the way a refusal names it, so the name a reader
	// is given is the name the guard compared on.
	Says   string
	Words  int
	Max    int
	Detail bool
}

// overCaps answers every bounded section that runs past its bound, in the
// order the schema declares them, so a refusal names the same one every time.
//
// It measures and does not refuse, so both doors that want the count can use
// it. It weighs what the editor weighs: maxWords, counted by overWords.
//
// Why it is this shape: [[measuring-is-separate-from-refusing]].
func overCaps(s Schema, t Token) []overLong {
	var out []overLong
	for _, sec := range s.Body.Sections {
		for _, one := range t.chaptersFor(sec) {
			if n, over := overWords(sec.MaxWords, one.Body); over {
				out = append(out, overLong{Says: sectionSaid(one.Header), Words: n,
					Max: sec.MaxWords, Detail: one.Header == "detail"})
			}
		}
	}
	return out
}

// chaptersFor answers what this token carries for one declared section, as the
// same bodyChapter the note reader hands the lint. A section naming a prefix
// matches as many chapters as the process has activities.
func (t Token) chaptersFor(sec SectionSpec) []bodyChapter {
	if sec.HeaderPrefix != "" {
		var out []bodyChapter
		for _, name := range sortedKeys(t.Submission) {
			if strings.HasPrefix("evidence: "+name, sec.HeaderPrefix) {
				out = append(out, bodyChapter{Header: "evidence: " + name, Body: t.Submission[name]})
			}
		}
		return out
	}
	switch sec.Header {
	case "detail":
		return []bodyChapter{{Header: "detail", Body: t.Detail}}
	case "proposed action":
		return []bodyChapter{{Header: "proposed action", Body: t.ProposedAction}}
	}
	// Every other declared chapter is kept as it was written, so it is weighed
	// as it was written.
	for _, k := range t.Kept {
		if strings.TrimPrefix(k.Head, "## ") == sec.Header {
			return []bodyChapter{{Header: sec.Header, Body: k.Text}}
		}
	}
	return nil
}

// sectionSaid names one bounded section the way a refusal names it.
func sectionSaid(header string) string {
	if header == "detail" {
		return "the detail"
	}
	if name, is := strings.CutPrefix(header, "evidence: "); is {
		return fmt.Sprintf("evidence %q", name)
	}
	return "the " + header
}

// bounded answers every bounded section of a token by the name a refusal gives
// it, so what a section holds now can be weighed against what it would become.
func (t Token) bounded() map[string]int {
	out := map[string]int{
		sectionSaid("detail"):          len(strings.Fields(stripComments(t.Detail))),
		sectionSaid("proposed action"): len(strings.Fields(stripComments(t.ProposedAction))),
	}
	for name, text := range t.Submission {
		out[sectionSaid("evidence: "+name)] = len(strings.Fields(stripComments(text)))
	}
	for _, k := range t.Kept {
		head := strings.TrimPrefix(k.Head, "## ")
		out[sectionSaid(head)] = len(strings.Fields(stripComments(k.Text)))
	}
	return out
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
// A block reads to the next heading, so a heading inside one would lose the
// rest on the save. See [[the-record-refuses-what-it-cannot-read-back]].
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

// headingsSaidOnce refuses a note that opens the same section twice.
//
// A second chapter under one heading would bury the first on the save. See
// [[the-record-refuses-what-it-cannot-read-back]], and the lint's half of the
// rule in [[a-chapter-opened-twice-is-a-departure]].
func headingsSaidOnce(t Token) error {
	seen := map[string]bool{}
	for _, c := range chaptersOf(t.body(), 2) {
		if seen[c.Header] {
			return fmt.Errorf("the note opens a %q section twice, and a reader cannot tell "+
				"which one the work was written against. Fold the two into one", c.Header)
		}
		seen[c.Header] = true
	}
	return nil
}

// readBody fills the prose fields back.
//
// A section this reader does not know is kept, not dropped. Why is
// [[a-section-nobody-understands-is-kept]].
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

// settleEnding makes the status follow the disposition.
//
// The disposition is the field that says a token has stopped, and Ended reads
// it. This moves only a token its process cannot: one that has ended somewhere
// a step still leaves goes to the state the process ends at.
//
// Why it is this shape: [[the-disposition-says-it-stopped]].
func settleEnding(r Roots, t Token) Token {
	if !t.Ended() || ClosingState(r, t) {
		return t
	}
	p, err := LoadProcess(r.Method, t.Process)
	if err != nil {
		return t // a process nobody can read says nothing about where it ends
	}
	if at := p.EndsAt(); at != "" {
		t.Status = Status(at)
	}
	return t
}

func SaveToken(r Roots, t Token) error {
	// The two fields agree before anything is written, here, because every
	// write goes through here. See [[the-disposition-says-it-stopped]] and
	// [[the-save-is-the-one-door]].
	t = settleEnding(r, t)
	// The record refuses what it cannot read back, and here is where a value
	// becomes a line. See [[the-record-refuses-what-it-cannot-read-back]].
	if err := linesThatFit(t); err != nil {
		return err
	}
	if err := blocksHoldNoHeading(t); err != nil {
		return err
	}
	if err := headingsSaidOnce(t); err != nil {
		return err
	}
	schema := narrowedSchema(r, t)
	if err := proseThatFits(schema, t); err != nil {
		return err
	}
	// The token as it was, so the record line can say which move this is.
	// See [[the-save-is-the-one-door]], and [[the-token-carries-no-time]] for
	// why the time goes in the record and not on the note.
	was, existed := LoadToken(r, t.ID)
	// Where it is now, so a token that moves folders leaves nothing behind.
	// See [[the-folder-answers-where-a-token-lives]].
	from := noteAt(r, t.ID)
	dir := dirFor(r, t)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	text := frontmatter.Write(t.front(), frontOrder, describeFields(schema)) + "\n" + t.body()
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
	// The hold goes where the engine keeps it, and not into the file that was
	// just written. See [[the-hold-is-engine-state]].
	if err := recordHold(r, t.ID, t.Holder); err != nil {
		return err
	}
	// The snapshot was read before the write, so it is dropped, and the index
	// is told. See [[the-folders-are-read-once-per-process]].
	r.forget()
	_ = IndexFile(r, final) // the file is the truth, and the watcher catches up on a row it could not write
	noteMove(r, t, was, existed == nil)
	// The save that ends a token archives it, and only that save: a repair of
	// an ended token does not archive twice. Archivable asks the state as well
	// as the disposition, and an archive that fails undoes nothing above, see
	// NotArchived. Why is [[the-close-archives-the-token]].
	if ended := Archivable(r, t); ended && (existed != nil || !Archivable(r, was)) {
		if err := Archive(r, t); err != nil {
			inSession(r, "work", orElse(t.Holder, "engine"), t.ID+" closed, and not archived: "+err.Error(), sessionlog.No(),
				map[string]any{"id": t.ID})
			return NotArchived{ID: t.ID, Err: err}
		}
	}
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
