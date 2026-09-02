package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
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

const TypeWork = "work"

// EphemeralDir is private and never travels. TracedDir is the record.
func EphemeralDir(r Roots) string { return r.Private("work") }
func TracedDir(r Roots) string    { return filepath.Join(r.Work, "doc", "work") }

func workDirs(r Roots) []string { return []string{TracedDir(r), EphemeralDir(r)} }

func dirFor(r Roots, t Token) string {
	if t.Traced {
		return TracedDir(r)
	}
	return EphemeralDir(r)
}

// The frontmatter's order on the page. Identity first, then where it stands,
// then what it is attached to, then the times.
var frontOrder = []string{
	"id", "seq", "type", "title", "status", "assignee", "scope", "traced",
	"disposition", "reason", "aborted_from", "holder", "bucket",
	"parent", "subs", "depends_on", "successors",
	"evidence", "evidence_script", "rounds",
	"spec_fails", "imp_fails", "rung_two_spent", "rung",
	"minted_by", "submitted_by", "reviewed_by", "spec_seen",
}

func (t Token) front() Front {
	f := Front{
		"id": t.ID, "seq": strconv.Itoa(t.Seq), "type": TypeWork, "title": t.Title,
		"status": string(t.Status), "assignee": t.Assignee, "scope": string(t.Scope),
		"traced":      strconv.FormatBool(t.Traced),
		"disposition": string(t.Disposition), "reason": t.Reason,
		"aborted_from": string(t.AbortedFrom), "holder": t.Holder,
		"bucket": t.Bucket,
		"parent": t.Parent, "subs": t.Subs, "depends_on": t.DependsOn,
		"successors": t.Successors,
		"evidence":   t.Evidence.Sections, "evidence_script": t.Evidence.Script,
		"minted_by": t.MintedBy, "submitted_by": t.SubmittedBy,
		"reviewed_by": t.ReviewedBy,
		"spec_seen": t.SpecSeen,
	}
	if t.Rounds > 0 {
		f["rounds"] = strconv.Itoa(t.Rounds)
	}
	// THE LADDER'S COUNT IS ON THE NOTE ONLY WHILE IT SAYS SOMETHING. A zero on
	// every note is a column of noise, and the reader that wants one reads a
	// missing key as zero.
	if t.SpecFails > 0 {
		f["spec_fails"] = strconv.Itoa(t.SpecFails)
	}
	if t.ImpFails > 0 {
		f["imp_fails"] = strconv.Itoa(t.ImpFails)
	}
	if t.RungTwoSpent {
		f["rung_two_spent"] = "true"
	}
	if t.Rung > 0 {
		f["rung"] = strconv.Itoa(t.Rung)
	}
	return f
}

func tokenFromFront(f Front) Token {
	return Token{
		ID: fs(f, "id"), Seq: fi(f, "seq"), Title: fs(f, "title"),
		SubmittedBy: fs(f, "submitted_by"), ReviewedBy: fs(f, "reviewed_by"),
		SpecSeen: fs(f, "spec_seen"),
		// EVERY TOKEN ALREADY ON DISK KEEPS WHAT IT SAYS. The states were
		// renamed and no note was rewritten by hand, so this is what reads one
		// under the name it used.
		Status: ReadStatus(fs(f, "status")), Assignee: fs(f, "assignee"),
		Scope: Scope(fs(f, "scope")), Traced: fb(f, "traced"),
		Disposition: Disposition(fs(f, "disposition")), Reason: fs(f, "reason"),
		AbortedFrom: ReadStatus(fs(f, "aborted_from")),
		Holder:      fs(f, "holder"), Bucket: fs(f, "bucket"), Parent: fs(f, "parent"),
		Subs: fl(f, "subs"), DependsOn: fl(f, "depends_on"),
		Successors: fl(f, "successors"),
		Evidence:   EvidenceSpec{Sections: fl(f, "evidence"), Script: fs(f, "evidence_script")},
		Rounds:     fi(f, "rounds"), MintedBy: fs(f, "minted_by"),
		SpecFails: fi(f, "spec_fails"), ImpFails: fi(f, "imp_fails"),
		RungTwoSpent: fb(f, "rung_two_spent"), Rung: fi(f, "rung"),
	}
}

// THE BODY IS PROSE, AND THE ENGINE WRITES ALL OF IT.
//
// Four kinds of section, each under a heading this program owns. A person may
// write anything else in the note and it is left alone, because nothing but
// these headings is read back.
const (
	headDetail    = "## detail"
	headGuidance  = "## guidance"
	headEvidence  = "## evidence: "
	headRewatched = "## re-watched: "
	headFinding   = "## finding "
	headCriteria  = "## done when"

	// WHAT A WATCHED CRITERION SAYS ON THE PAGE. One lead each, so a reader
	// sees what was absent and what it said without opening anything else.
	leadWithout = "**red without** "
	leadRed     = "**red said** "
	headLesson  = "## lesson "

	// WHAT WOULD HAVE STOPPED THE MISTAKE BEING MADE. One lead of its own, so
	// a reader sees the prevention beside the detection rather than inside it.
	leadPrevents = "**before it:** "
)

func (t Token) body() string {
	var b strings.Builder
	if t.Detail != "" {
		b.WriteString(headDetail + "\n\n" + t.Detail + "\n\n")
	}
	if t.Guidance != "" {
		b.WriteString(headGuidance + "\n\n" + t.Guidance + "\n\n")
	}
	if t.GuidanceRef != "" {
		b.WriteString(headGuidance + "\n\nSee " + t.GuidanceRef + "\n\n")
	}
	for _, s := range sortedKeys(t.Submission) {
		b.WriteString(headEvidence + s + "\n\n" + t.Submission[s] + "\n\n")
	}
	// AND WHAT THE REVIEWER WATCHED, beside the evidence rather than in a
	// session that ends. The gate takes the worker's recorded red on trust,
	// so the second look is the only thing holding it and it has to be a
	// record a later reader can follow.
	for _, s := range sortedKeys(t.Rewatched) {
		b.WriteString(headRewatched + s + nl + nl + t.Rewatched[s] + nl + nl)
	}
	// WHAT DONE MEANS, in the note a person reads and edits. A criterion with a
	// command carries it, so a reader runs the same thing the engine runs.
	if len(t.Criteria) > 0 {
		b.WriteString(headCriteria + "\n\n")
		for _, c := range t.Criteria {
			b.WriteString("- " + c.Says + "\n")
			if c.Runs != "" {
				b.WriteString("  `" + c.Runs + "`\n")
			}
			// WHAT WAS TAKEN AWAY TO MAKE IT FAIL, AND WHAT IT SAID. It sits
			// beside the command because that is what it is about, and it is a
			// field rather than prose because prose here is lost on the next
			// save.
			if c.Without != "" {
				b.WriteString("  " + leadWithout + c.Without + "\n")
			}
			if c.Red != "" {
				b.WriteString("  " + leadRed + c.Red + "\n")
			}
		}
		b.WriteString("\n")
	}
	for i, f := range t.Findings {
		fmt.Fprintf(&b, "%s%d · round %d · %s · by %s\n\n", headFinding, i+1, f.Round, f.Clause, f.By)
		b.WriteString("**wrong:** " + f.Wrong + "\n\n")
		b.WriteString("**satisfies:** " + f.Satisfies + "\n\n")
		if f.Answer != "" {
			b.WriteString("**answered:** " + f.Answer + "\n\n")
		}
	}
	// A LESSON SITS BESIDE THE ROUND THAT TAUGHT IT, so a reader finds what a
	// round cost and what it was worth in the same place.
	for i, l := range t.Lessons {
		fmt.Fprintf(&b, "%s%d · round %d · by %s\n\n", headLesson, i+1, l.Round, l.By)
		b.WriteString("**the class:** " + l.Class + "\n\n")
		b.WriteString("**instead:** " + l.Avoid + "\n\n")
		// AND WHAT WOULD HAVE STOPPED IT BEING MADE, which is the half a
		// worker reads before starting rather than after being caught.
		if l.Prevents != "" {
			b.WriteString(leadPrevents + l.Prevents + nl + nl)
		}
		// THE TOKEN THE REVIEWER MINTED FOR IT, so a reader of this note can
		// go to the work rather than to a sentence about it.
		if l.Learned != "" {
			b.WriteString("**minted as:** " + l.Learned + "\n\n")
		}
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

// readBody fills the prose fields back. Only the headings above are read, so
// anything else in the note survives a rewrite untouched by being ignored.
func readBody(t *Token, body string) {
	for _, sec := range sections(body) {
		head, text := sec[0], sec[1]
		switch {
		case head == headDetail:
			t.Detail = text
		case head == headGuidance:
			if ref := strings.TrimPrefix(text, "See "); ref != text {
				t.GuidanceRef = ref
			} else {
				t.Guidance = text
			}
		case strings.HasPrefix(head, headRewatched):
			if t.Rewatched == nil {
				t.Rewatched = map[string]string{}
			}
			t.Rewatched[strings.TrimPrefix(head, headRewatched)] = text
		case strings.HasPrefix(head, headEvidence):
			if t.Submission == nil {
				t.Submission = map[string]string{}
			}
			t.Submission[strings.TrimPrefix(head, headEvidence)] = text
		case head == headCriteria:
			t.Criteria = readCriteria(text)
		case strings.HasPrefix(head, headFinding):
			t.Findings = append(t.Findings, readFinding(head, text))
		case strings.HasPrefix(head, headLesson):
			t.Lessons = append(t.Lessons, readLesson(head, text))
		}
	}
}

// One newline, named, because writing it inline is where these files keep
// breaking.
const nl = "\n"

// A CRITERION IS A LIST ITEM, and the command under it is fenced in backticks
// so a person can copy it out and run the same thing the engine runs.
func readCriteria(text string) []Criterion {
	var out []Criterion
	for _, line := range strings.Split(text, nl) {
		l := strings.TrimSpace(line)
		switch {
		case strings.HasPrefix(l, "- "):
			out = append(out, Criterion{Says: strings.TrimSpace(l[2:])})
		case strings.HasPrefix(l, "`") && strings.HasSuffix(l, "`") && len(out) > 0:
			out[len(out)-1].Runs = strings.Trim(l, "`")
		case strings.HasPrefix(l, leadWithout) && len(out) > 0:
			out[len(out)-1].Without = strings.TrimPrefix(l, leadWithout)
		case strings.HasPrefix(l, leadRed) && len(out) > 0:
			out[len(out)-1].Red = strings.TrimPrefix(l, leadRed)
		}
	}
	return out
}

func readLesson(head, text string) Lesson {
	// The heading carries the round and the author, the way a finding's does.
	l := Lesson{}
	for _, p := range strings.Split(strings.TrimPrefix(head, headLesson), "·") {
		p = strings.TrimSpace(p)
		switch {
		case strings.HasPrefix(p, "round "):
			l.Round, _ = strconv.Atoi(strings.TrimPrefix(p, "round "))
		case strings.HasPrefix(p, "by "):
			l.By = strings.TrimPrefix(p, "by ")
		}
	}
	said := underLeads(text, []string{"**the class:** ", "**instead:** ",
		leadPrevents, "**minted as:** "})
	l.Class = said["**the class:** "]
	l.Avoid = said["**instead:** "]
	l.Prevents = said[leadPrevents]
	l.Learned = strings.TrimSpace(said["**minted as:** "])
	return l
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

func readFinding(head, text string) Rejection {
	f := Rejection{}
	// "## finding 2 · round 1 · voice · by rev"
	parts := strings.Split(strings.TrimPrefix(head, headFinding), "·")
	for i, p := range parts {
		p = strings.TrimSpace(p)
		switch {
		case strings.HasPrefix(p, "round "):
			f.Round, _ = strconv.Atoi(strings.TrimPrefix(p, "round "))
		case strings.HasPrefix(p, "by "):
			f.By = strings.TrimPrefix(p, "by ")
		case i > 0:
			f.Clause = p
		}
	}
	said := underLeads(text, []string{"**wrong:** ", "**satisfies:** ", "**answered:** "})
	f.Wrong, f.Satisfies = said["**wrong:** "], said["**satisfies:** "]
	f.Answer = said["**answered:** "]
	return f
}

// underLeads answers what each lead holds, to the next lead or to the end.
//
// A BLOCK IS A BLOCK AND NOT A LINE. This read line by line, so a value written
// in two paragraphs came back as its first, which is the silent loss the whole
// token is about: of fourteen findings in the record every paragraphed one was
// cut, 85 characters of about 1900 in the worst case.
//
// THE WRITER ALREADY WRITES THEM WHOLE. Only the reader was wrong, so there is
// no format to invent and nothing for a person to get wrong.
func underLeads(text string, leads []string) map[string]string {
	said := map[string]string{}
	seen := map[string]bool{}
	at, held := "", []string{}
	keep := func() {
		if at != "" {
			said[at] = strings.TrimSpace(strings.Join(held, nl))
		}
	}
	for _, line := range strings.Split(text, nl) {
		trimmed := strings.TrimSpace(line)
		opened := false
		for _, lead := range leads {
			// A LEAD OPENS ONCE, THE FIRST TIME IT IS SEEN. A block quoting
			// one of these leads in a later paragraph is a block and not a
			// second section, and reading it as a section is how a value that
			// quotes the parser's own words comes back cut.
			if seen[lead] || !strings.HasPrefix(trimmed, lead) {
				continue
			}
			keep()
			seen[lead] = true
			at, held = lead, []string{strings.TrimPrefix(trimmed, lead)}
			opened = true
			break
		}
		if opened || at == "" {
			continue
		}
		held = append(held, line)
	}
	keep()
	return said
}

// SaveToken writes the whole note, and it writes it atomically.
//
// A reader sees the old file or the new one and never half of one. Two writers
// are ordinary here: a command line and a lane are separate processes that talk
// to no one, and only the rename decides which of them landed last.
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
	noteMove(r, t, was, existed == nil)
	if existed == nil && was.Status != t.Status {
		followChildren(r, t)
	}
	return nil
}

// WHAT MOVED, IN THE RECORD. The agent does not remember to write these and
// cannot forget to: whoever moves a token moves it through SaveToken.
func noteMove(r Roots, t, was Token, existed bool) {
	switch {
	case !existed:
		inSession(r, "work", t.MintedBy, t.ID+" minted "+string(t.Status)+": "+t.Title, Yes(),
			map[string]any{"id": t.ID, "status": string(t.Status), "assignee": t.Assignee})
	case was.Status != t.Status:
		who := t.Holder
		if who == "" {
			who = t.Assignee
		}
		inSession(r, "work", who,
			t.ID+" "+string(was.Status)+" to "+string(t.Status)+": "+t.Title, Yes(),
			map[string]any{"id": t.ID, "from": string(was.Status), "to": string(t.Status)})
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
	if fs(f, "type") != TypeWork || fs(f, "id") == "" {
		return Token{}, false
	}
	t := tokenFromFront(f)
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
	for _, dir := range workDirs(r) {
		if t, ok := readNote(filepath.Join(dir, id+".md")); ok {
			return t, nil
		}
	}
	return Token{}, fmt.Errorf("no such token: %s", id)
}

// Tokens reads both folders, oldest first. Order is by when a token was opened,
// so a queue hands out the thing that has waited longest.
func Tokens(r Roots) []Token {
	var out []Token
	for _, dir := range workDirs(r) {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
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
		if out[i].Seq != out[j].Seq {
			return out[i].Seq < out[j].Seq
		}
		return out[i].ID < out[j].ID
	})
	return out
}

// A PARENT FOLLOWS ITS CHILDREN INTO WORK, AND OUT OF IT AGAIN.
//
// A parent is in work while any child is in work, and it leaves in_work when
// the last child does. That is how two tokens are in work at once without an
// agent holding two: the agent holds the child, and the parent is in work
// because the child is how the parent is being done.
//
// It also replaces a wrong reading. A parent looked blocked by its own
// sub-token, which said the sub-token was in the way when it was the work.
//
// NOTHING PULLS A PARENT, so the rule can only live here. This is the one
// place that sees a state change, and a parent is not a queue entry: the
// holder stays empty, because nobody is holding it.
func followChildren(r Roots, child Token) {
	if child.Parent == "" {
		return
	}
	p, err := LoadToken(r, child.Parent)
	if err != nil {
		return
	}
	// A parent already settled is left alone. Its children are history.
	if p.Status.Ended() || p.Status == ImpSubmitted || p.Status == ImpInReview {
		return
	}
	working := false
	for _, id := range p.Subs {
		if s, err := LoadToken(r, id); err == nil && s.Status == ImpInWork {
			working = true
			break
		}
	}
	// LOWER ONLY WHAT THIS RULE RAISED, and the empty holder is the mark. A
	// parent an agent pulled has a holder, and putting that one back to open
	// left the record saying a token was open and held at once.
	switch {
	case working && p.Status == ImpOpen && p.Holder == "":
		p.Status = ImpInWork
	case !working && p.Status == ImpInWork && p.Holder == "":
		p.Status = ImpOpen
	default:
		return
	}
	_ = SaveToken(r, p)
}

// linesThatFit refuses a criterion carrying a second line in a field the note
// writes on one.
//
// WHY THIS IS A REFUSAL AND NOT A FOLD. A folded value invents a continuation
// syntax. The note is a file a person opens and edits, and a syntax nobody
// typed is a syntax somebody gets wrong. It would also need reading back, which
// is a second place to be wrong about one thing.
//
// AND WITHOUT IT THE OBSERVATION GATE SWITCHES ITSELF OFF. A two-line command
// reads back as no command, the criterion becomes prose, and prose is answered
// by name in the evidence rather than by watching it fail. Writing a command on
// two lines therefore turned the gate off, silently, at the moment of the save.
// WHAT THE NOTE CANNOT HOLD, REFUSED WHERE THE VALUE BECOMES A LINE.
//
// A BLOCK READS TO THE NEXT LEAD OR THE NEXT HEADING, so a value carrying a
// line that opens a section is cut on the save, by design and in silence. That
// is the one outcome this refuses.
//
// REFUSED RATHER THAN ESCAPED. A person reads and edits these notes in an
// editor, and a value written differently from how it was typed is one somebody
// re-types wrongly. Accepting was never open: silence is what the refusal
// exists to end. The cost is small and it is said here so nobody rediscovers
// it: a reviewer quoting a section name indents that line or runs it into the
// sentence.
func blocksHoldNoHeading(t Token) error {
	opens := func(where, value string) error {
		for _, line := range strings.Split(value, nl) {
			if !strings.HasPrefix(strings.TrimRight(line, "\r"), "## ") {
				continue
			}
			return fmt.Errorf("%s carries a line that opens a section, %q, and a block "+
				"reads to the next heading, so everything after it would be lost on this "+
				"save. Indent that line, or run it into the sentence", where, firstLines(line, 1))
		}
		return nil
	}
	for _, one := range []struct{ where, value string }{
		{"Token.Detail", t.Detail}, {"Token.Guidance", t.Guidance},
		{"Token.GuidanceRef", t.GuidanceRef},
	} {
		if err := opens(one.where, one.value); err != nil {
			return err
		}
	}
	for i, f := range t.Findings {
		for _, one := range []struct{ where, value string }{
			{fmt.Sprintf("Rejection.Wrong on finding %d", i+1), f.Wrong},
			{fmt.Sprintf("Rejection.Satisfies on finding %d", i+1), f.Satisfies},
			// ANSWER IS A BLOCK AND THIS LIST WENT SHORT WITHOUT IT. The table in
			// the shapes check calls it a block by design, and the refusal named
			// two of the three, so a worker's answer carrying a section opener
			// lost everything after it on the save and nothing said so.
			{fmt.Sprintf("Rejection.Answer on finding %d", i+1), f.Answer},
		} {
			if err := opens(one.where, one.value); err != nil {
				return err
			}
		}
	}
	for i, l := range t.Lessons {
		for _, one := range []struct{ where, value string }{
			{fmt.Sprintf("Lesson.Class on lesson %d", i+1), l.Class},
			{fmt.Sprintf("Lesson.Avoid on lesson %d", i+1), l.Avoid},
			{fmt.Sprintf("Lesson.Prevents on lesson %d", i+1), l.Prevents},
			{fmt.Sprintf("Lesson.Learned on lesson %d", i+1), l.Learned},
		} {
			if err := opens(one.where, one.value); err != nil {
				return err
			}
		}
	}
	// EVERY VALUE THE NOTE JOINS INTO A HEADING cannot hold the character it is
	// joined on, the middle dot, or a newline. The set is the table's, not the
	// one member a finding was found on.
	for i, f := range t.Findings {
		for _, one := range []struct{ where, value string }{
			{fmt.Sprintf("Rejection.Clause on finding %d", i+1), f.Clause},
			{fmt.Sprintf("Rejection.By on finding %d", i+1), f.By},
		} {
			if err := fitsAHeading(one.where, one.value); err != nil {
				return err
			}
		}
	}
	for i, l := range t.Lessons {
		if err := fitsAHeading(fmt.Sprintf("Lesson.By on lesson %d", i+1), l.By); err != nil {
			return err
		}
	}
	// A MAP THE NOTE WRITES AS A BODY SECTION: its value is a block, and its
	// KEY is one line and not a heading. A newline in a key is cut and its
	// tail moves into the value. The middle dot is safe there, because
	// readBody strips the lead and takes the rest of the heading whole, so
	// refusing it would refuse a character the record carries.
	for _, one := range []struct {
		where string
		held  map[string]string
	}{{"Token.Submission", t.Submission}, {"Token.Rewatched", t.Rewatched}} {
		for key, value := range one.held {
			if strings.ContainsAny(key, "\r\n") {
				return fmt.Errorf("%s is filed under a key written on more than one line, "+
					"%q. The reader takes the heading and stops, so the rest of the key "+
					"moves into the value. Write the key on one line",
					one.where, firstLines(key, 1))
			}
			if err := opens(one.where+", under "+firstLines(key, 1), value); err != nil {
				return err
			}
		}
	}
	return nil
}

// fitsAHeading refuses a value the note joins into a heading line.
func fitsAHeading(where, value string) error {
	for _, bad := range []struct{ what, name string }{
		{"·", "the heading separator"}, {"\n", "a newline"}, {"\r", "a newline"},
	} {
		if !strings.Contains(value, bad.what) {
			continue
		}
		return fmt.Errorf("%s carries %s, and it is joined into a heading line with "+
			"the round and the author on that character, so the reader would split it "+
			"there. Write it without one", where, bad.name)
	}
	return nil
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
			{"runs", c.Runs},
			{"red without", c.Without},
			{"red said", c.Red},
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
