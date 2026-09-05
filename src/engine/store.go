package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"quackitect/engine/internal/frontmatter"
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
//	.se/work/   local. Scratch work, an agent's own breakdown. Private
//	            material, and it never travels with a copy.
//	doc/work/   tracked. The record of what was done. It travels, and it is in
//	            version control, because that is the point of tracking it.
//
// The minter decides which, by deciding whether the token is tracked, and
// nothing moves afterwards.
//
// A FOLDER MAY HOLD OTHER NOTES. A note is a token when its frontmatter says
// `type: work`, so neither folder is claimed whole and a person may keep their
// own notes beside them.

// LocalDir is private and never travels. TrackedDir is the record.
func LocalDir(r Roots) string   { return r.Private("work") }
func TrackedDir(r Roots) string { return filepath.Join(r.Work, "doc", "work") }

func workDirs(r Roots) []string { return []string{TrackedDir(r), LocalDir(r)} }

// dirFor answers where a token's file belongs.
//
// THE FOLDER IS THE ANSWER, AND NOTHING ELSE IS. A token in doc/work travels
// and one in .se/work does not, so a field saying the same thing is a second
// answer that can disagree with the first. There is no such field, on the note
// or on the process.
//
// A token that has a file is in the folder that answers for it. So a token
// moved by hand stays moved, which is what a move means.
//
// MEASURED. The process carried the answer and dirFor read it on every save.
// A token dragged into the other store was dragged back by the next save, and
// moving a hundred of them needed the process edited as well.
//
// A token with no file is new, and the mint said where it is born.
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
		// THE HOLDER IS NOT WRITTEN. It is engine state, and it was kept here,
		// so a take-up that was never put down left a name in a file nothing
		// reopened. holdstore.go keeps it under .se, where a hold can be
		// dropped when the agent holding it is gone.
		"author": t.Author,
		// THE CLAIM IS WRITTEN, WHERE THE HOLDER IS NOT. A hold is this tree's
		// own and holdstore.go keeps it under .se. A claim is for the other
		// boxes, so it goes in the note that travels.
		"claimed_by": t.ClaimedBy,
		"claimed_at": t.ClaimedAt,
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
	// A FLAG THAT IS OFF IS NOT WRITTEN, the way needs_human is not. False on
	// every note is a line the reader learns to skip.
	if t.Urgent {
		f["urgent"] = "true"
	}
	return f
}

// THE ID IS THE FILE NAME AND IS NOT WRITTEN TWICE. It is set by the reader
// from the path, so a token that is renamed is the token it is called.
func tokenFromFront(f frontmatter.Front) Token {
	return Token{
		Process:  unlink(frontmatter.Str(f, "process")),
		Guidance: unlink(frontmatter.Str(f, "guidance")),
		Title:    frontmatter.Str(f, "title"),
		Status:   Status(frontmatter.Str(f, "status")),
		Bucket:   frontmatter.Str(f, "bucket"),
		// A HOLDER IN THE FILE IS NOT READ. A note written before the hold
		// moved into the engine carries one, naming an agent that is gone, and
		// reading it would put a dead hand back on live work. There is no
		// field to read it into: the hold comes from holdstore.go.
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

// errNotAToken says a note is not a work token: it carries no frontmatter, or
// its kind belongs to somebody else. That is not a fault and nothing says it
// out loud, because both folders may hold notes beside the tokens.
var errNotAToken = errors.New("it is not a work token")

// noteToken reads a token out of a note's text. The id comes from the caller,
// because the file name is the id and the text does not carry it.
//
// ONE READER FOR BOTH DOORS. readNote opens a file and this reads what was in
// it, so a write checked before it lands is checked as the thing that will be
// read back off disk afterwards, by the same code.
func noteToken(text, id string) (Token, error) {
	front, body := frontmatter.Split(text)
	if front == "" {
		return Token{}, errNotAToken
	}
	f, err := frontmatter.Parse(front)
	if err != nil {
		return Token{}, err
	}
	// A NOTE IS A TOKEN WHEN IT SAYS WHICH SCHEMA READS IT. type: work said the
	// same thing twice, so it went with the rest of what nothing read.
	if unlink(frontmatter.Str(f, "kind")) != "work-token" {
		return Token{}, errNotAToken
	}
	t := tokenFromFront(f)
	// THE ID IS THE FILE NAME. It was written into the note as well, and two
	// copies of one name is one that can be renamed and one that cannot.
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
			t.Holder = HeldBy(r, t.ID)
			return t, nil
		}
	}
	// THE ARCHIVE IS A FOLDER THE READER CANNOT SEE. A token that closed came
	// off the disk, and every caller that names an id by hand would otherwise
	// be told it never existed. So the last place looked is history.
	if t, ok := readArchivedNote(r, id); ok {
		return t, nil
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
	// THE HOLDS ARE READ ONCE, not per note, because they are one small file
	// and the folder can be hundreds of them.
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
// IT IS SEPARATE FROM THE REFUSAL because two doors need the measurement and
// only one of them wants the save's wording: the write door has to compare
// what a section would become against what it already holds.
//
// IT WEIGHS WHAT THE EDITOR WEIGHS. The bound is the section's maxWords and
// the count is overWords, which is what the lint and the language server run.
// A chapter the editor marks is a chapter the save refuses, and there is no
// third answer for the writer to discover at the door.
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

// settleEnding makes the status follow the disposition.
//
// THE DISPOSITION IS THE FIELD THAT SAYS A TOKEN HAS STOPPED. Ended reads it,
// because the disposition is the engine's and the state is the process's. So a
// token carrying one has ended whatever its status says.
//
// AND A STATUS LEFT BEHIND IS UNREACHABLE BY EVERY VERB. Three tokens read
// noted while carrying dropped. A submission against one was refused as already
// closed, and writeField refuses a status outright as the pull's to write, so
// the field could not be repaired except by hand. The archive never took them
// either, because it asks for a closing state and decide still leaves noted.
//
// IT ONLY MOVES A TOKEN ITS PROCESS CANNOT MOVE. A standard token at done owes
// a verdict and has not ended, so nothing here touches it. One that has ended
// somewhere a step still leaves is the disagreement, and it goes to the state
// the process ends at.
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
	// THE TWO FIELDS AGREE BEFORE ANYTHING IS WRITTEN, so the file a person
	// reads and the answer Ended gives are the same answer. This is the one
	// place every write goes through, which is why the rule lives here rather
	// than in each caller that ends a token.
	t = settleEnding(r, t)
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
	schema := narrowedSchema(r, t)
	if err := proseThatFits(schema, t); err != nil {
		return err
	}
	// EVERY CHANGE OF STATE IS IN THE RECORD, and this is the one place that
	// sees them all. The agent does not remember to write them and cannot
	// forget to: whoever moves a token moves it through here.
	//
	// It is the record and not the token because a tracked token travels, and a
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
	// THE HOLD GOES WHERE THE ENGINE KEEPS IT, and not into the file that was
	// just written. Whoever moves a hold moves it through here, so this is the
	// one place that has to remember, and it is the same one place that used to
	// put the name on the page.
	if err := recordHold(r, t.ID, t.Holder); err != nil {
		return err
	}
	// WHAT THIS PROCESS WROTE IS WHAT IT READS BACK. The snapshot was read
	// before the write, so it is dropped and the next ask reads the folder.
	// And the index is told, so the write is not missing from it either.
	r.forget()
	_ = IndexFile(r, final) // the file is the truth, and the watcher catches up on a row it could not write
	noteMove(r, t, was, existed == nil)
	// THE CLOSE IS THE MOMENT, AND THIS IS THE ONE PLACE THAT SEES IT. A token
	// that has just ended goes to the archive if it travels and is deleted if
	// it does not, so no agent has to call anything and no door can forget.
	//
	// It asks whether this save is the one that ended it. A save of a token
	// that was already ended is a repair, and a repair does not archive twice.
	//
	// IT IS THE STATE AS WELL AS THE DISPOSITION. A token that has ended where
	// its process still declares a step is one a hand edit or an older engine
	// left, and archiving on the disposition alone would take it off the disk
	// while its process can still move it. Archivable is the rule, and the
	// sweep asks the same one.
	//
	// AND AN ARCHIVE IT CANNOT WRITE DOES NOT UNDO ANY OF THAT. Everything
	// above has already happened, so a git failure here is a consequence left
	// over and not a save that went wrong. See NotArchived.
	if ended := Archivable(r, t); ended && (existed != nil || !Archivable(r, was)) {
		if err := Archive(r, t); err != nil {
			inSession(r, "work", orElse(t.Holder, "engine"), t.ID+" closed, and not archived: "+err.Error(), No(),
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
