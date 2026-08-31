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
	"id", "type", "form", "status", "assignee", "scope", "traced",
	"disposition", "reason", "holder", "bucket",
	"parent", "subs", "depends_on", "successors",
	"evidence", "evidence_script", "rounds",
	"minted_by", "opened", "taken_at", "sent_at", "closed_at",
}

func (t Token) front() Front {
	f := Front{
		"id": t.ID, "type": TypeWork, "form": t.Form,
		"status": string(t.Status), "assignee": t.Assignee, "scope": string(t.Scope),
		"traced":      strconv.FormatBool(t.Traced),
		"disposition": string(t.Disposition), "reason": t.Reason, "holder": t.Holder,
		"bucket": t.Bucket,
		"parent": t.Parent, "subs": t.Subs, "depends_on": t.DependsOn,
		"successors": t.Successors,
		"evidence":   t.Evidence.Sections, "evidence_script": t.Evidence.Script,
		"minted_by": t.MintedBy, "opened": t.Opened, "taken_at": t.TakenAt,
		"sent_at": t.SentAt, "closed_at": t.ClosedAt,
	}
	if t.Rounds > 0 {
		f["rounds"] = strconv.Itoa(t.Rounds)
	}
	return f
}

func tokenFromFront(f Front) Token {
	return Token{
		ID: fs(f, "id"), Form: fs(f, "form"),
		Status: Status(fs(f, "status")), Assignee: fs(f, "assignee"),
		Scope: Scope(fs(f, "scope")), Traced: fb(f, "traced"),
		Disposition: Disposition(fs(f, "disposition")), Reason: fs(f, "reason"),
		Holder: fs(f, "holder"), Bucket: fs(f, "bucket"), Parent: fs(f, "parent"),
		Subs: fl(f, "subs"), DependsOn: fl(f, "depends_on"),
		Successors: fl(f, "successors"),
		Evidence:   EvidenceSpec{Sections: fl(f, "evidence"), Script: fs(f, "evidence_script")},
		Rounds:     fi(f, "rounds"), MintedBy: fs(f, "minted_by"),
		Opened: fs(f, "opened"), TakenAt: fs(f, "taken_at"),
		SentAt: fs(f, "sent_at"), ClosedAt: fs(f, "closed_at"),
	}
}

// THE BODY IS PROSE, AND THE ENGINE WRITES ALL OF IT.
//
// Four kinds of section, each under a heading this program owns. A person may
// write anything else in the note and it is left alone, because nothing but
// these headings is read back.
const (
	headDetail   = "## detail"
	headGuidance = "## guidance"
	headEvidence = "## evidence: "
	headFinding  = "## finding "
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
	for i, f := range t.Findings {
		fmt.Fprintf(&b, "%s%d · round %d · %s · by %s\n\n", headFinding, i+1, f.Round, f.Clause, f.By)
		b.WriteString("**wrong:** " + f.Wrong + "\n\n")
		b.WriteString("**satisfies:** " + f.Satisfies + "\n\n")
		if f.At != "" {
			b.WriteString("**at:** " + f.At + "\n\n")
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
		case strings.HasPrefix(head, headEvidence):
			if t.Submission == nil {
				t.Submission = map[string]string{}
			}
			t.Submission[strings.TrimPrefix(head, headEvidence)] = text
		case strings.HasPrefix(head, headFinding):
			t.Findings = append(t.Findings, readFinding(head, text))
		}
	}
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
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSpace(line)
		switch {
		case strings.HasPrefix(line, "**wrong:** "):
			f.Wrong = strings.TrimPrefix(line, "**wrong:** ")
		case strings.HasPrefix(line, "**satisfies:** "):
			f.Satisfies = strings.TrimPrefix(line, "**satisfies:** ")
		case strings.HasPrefix(line, "**at:** "):
			f.At = strings.TrimPrefix(line, "**at:** ")
		}
	}
	return f
}

// SaveToken writes the whole note, and it writes it atomically.
//
// A reader sees the old file or the new one and never half of one. Two writers
// are ordinary here: a command line and a lane are separate processes that talk
// to no one, and only the rename decides which of them landed last.
func SaveToken(r Roots, t Token) error {
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
	return os.Rename(name, final)
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
	sort.Slice(out, func(i, j int) bool { return out[i].Opened < out[j].Opened })
	return out
}
