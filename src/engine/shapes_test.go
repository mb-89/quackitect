package main

import (
	"reflect"
	"sort"
	"strings"
	"testing"
)

// EVERY FIELD THE NOTE WRITES AND READS BACK, ANSWERED FOR BY NAME.
//
// THE WALK ASKS THE TYPE RATHER THAN READING A LIST. A hand list of fields is
// exactly the size of what somebody happened to think of, and the token this
// guards exists because a field joined the record and the walk did not grow.
// Token.Rewatched joined two hours after the last round wrote its table, and
// Lesson.Prevents joined an hour after that.
//
// FIVE SHAPES, AND THE TABLE ANSWERS FOR EVERY FIELD THE WALK REACHES.
var theShapes = map[string]string{
	// ONE LINE BY DESIGN. A person types these on one line and a folded
	// continuation nobody typed is a syntax somebody gets wrong. Refused.
	"Criterion.Says":    "one line by design",
	"Criterion.Runs":    "one line by design",
	"Criterion.Without": "one line by design",
	"Criterion.Red":     "one line by design",

	// A BLOCK BY DESIGN. The writer already writes these whole and only the
	// reader was line-based. Read back whole, and refused when they carry a
	// line that opens a section, because a block reads to the next heading.
	"Rejection.Wrong":     "a block by design",
	"Rejection.Satisfies": "a block by design",
	"Rejection.Answer":    "a block by design",
	"Lesson.Class":        "a block by design",
	"Lesson.Avoid":        "a block by design",
	"Lesson.Prevents":     "a block by design",
	"Lesson.Learned":      "a block by design",
	"Token.Detail":        "a block by design",
	"Token.Guidance":      "a block by design",
	"Token.GuidanceRef":   "a block by design",

	// A ROW FOR THE KIND AND NOT FOR THE MEMBER. Every map of string the note
	// writes as a body section: its VALUE is a block, and its KEY is one line
	// and not a heading, because a newline in a key is cut and its tail moves
	// into the value, while the middle dot is safe there.
	"Token.Submission": "a map the note writes as a body section",
	"Token.Rewatched":  "a map the note writes as a body section",

	// INTO A HEADING. Joined into a line with the round and the author on the
	// middle dot, so they cannot hold that character or a newline.
	"Rejection.Clause": "into a heading",
	"Rejection.By":     "into a heading",
	"Lesson.By":        "into a heading",

	// IN THE FRONTMATTER, HELD WHOLE, AND NOTHING REFUSED. front() hands these
	// to the frontmatter writer, which quotes what needs quoting, so a newline
	// in one is written and read back rather than cut.
	"Token.ID":                "in the frontmatter",
	"Token.Title":             "in the frontmatter",
	"Token.Status":            "in the frontmatter",
	"Token.Assignee":          "in the frontmatter",
	"Token.Scope":             "in the frontmatter",
	"Token.Disposition":       "in the frontmatter",
	"Token.Reason":            "in the frontmatter",
	"Token.AbortedFrom":       "in the frontmatter",
	"Token.Holder":            "in the frontmatter",
	"Token.Bucket":            "in the frontmatter",
	"Token.Parent":            "in the frontmatter",
	"Token.MintedBy":          "in the frontmatter",
	"Token.SubmittedBy":       "in the frontmatter",
	"Token.ReviewedBy":        "in the frontmatter",
	"Token.SpecSeen":          "in the frontmatter",
	"Token.Evidence.Script":   "in the frontmatter",
	"Token.Subs":              "in the frontmatter",
	"Token.DependsOn":         "in the frontmatter",
	"Token.Successors":        "in the frontmatter",
	"Token.Evidence.Sections": "in the frontmatter",

	// NOT ON THE PAGE. The note never writes them, so nothing can cut them.
	"Criterion.Ran": "not on the page",
	"Lesson.Token":  "not on the page",
}

// fieldsTheNoteWrites answers every field the record writes, asked of the type.
//
// FIVE KINDS FOLLOWED, because those are what store.go writes: exported string
// fields, exported struct fields, exported slice-of-struct fields, exported
// map-of-string values and exported slice-of-string fields. A MAP COUNTS ONCE,
// not once for its key and once for its value, so this and the table count the
// same things.
//
// IT DOES NOT FOLLOW unexported fields, integers, booleans or times, because
// none of those is written as prose a parser reads back. A reviewer who
// disagrees with that boundary can argue with a list rather than find an
// omission.
func fieldsTheNoteWrites() []string {
	var out []string
	seen := map[reflect.Type]bool{}
	var walk func(reflect.Type, string)
	walk = func(ty reflect.Type, at string) {
		if ty.Kind() != reflect.Struct || seen[ty] {
			return
		}
		seen[ty] = true
		for i := 0; i < ty.NumField(); i++ {
			f := ty.Field(i)
			if f.PkgPath != "" {
				continue
			}
			name := at + "." + f.Name
			switch f.Type.Kind() {
			case reflect.String:
				out = append(out, name)
			case reflect.Struct:
				walk(f.Type, name)
			case reflect.Slice:
				if f.Type.Elem().Kind() == reflect.Struct {
					walk(f.Type.Elem(), name)
				} else if f.Type.Elem().Kind() == reflect.String {
					out = append(out, name)
				}
			case reflect.Map:
				if f.Type.Elem().Kind() == reflect.String {
					out = append(out, name)
				}
			}
		}
	}
	walk(reflect.TypeOf(Token{}), "Token")
	sort.Strings(out)
	return out
}

// shortName answers the name the table uses, which drops the path to a nested
// struct: Token.Criteria.Says is Criterion.Says, because the shape belongs to
// the field and not to the token that happens to hold it.
var wornBy = map[string]string{
	"Token.Criteria": "Criterion", "Token.Findings": "Rejection",
	"Token.Lessons": "Lesson",
}

func shortName(one string) string {
	at := strings.LastIndex(one, ".")
	if at < 0 {
		return one
	}
	if kind, is := wornBy[one[:at]]; is {
		return kind + one[at:]
	}
	return one
}

func TestEveryFieldTheNoteWritesIsRead(t *testing.T) {
	found := fieldsTheNoteWrites()
	if len(found) < 10 {
		t.Fatalf("the walk arrived at %d fields, so it is not walking the record", len(found))
	}
	answered := map[string]bool{}
	for _, one := range found {
		name := shortName(one)
		if theShapes[name] == "" {
			t.Errorf("the walk arrives at %s and the table answers for it nowhere. "+
				"Say which shape it is, or say it is excluded and why", name)
			continue
		}
		answered[name] = true
	}
	// AND THE TABLE ANSWERS FOR NOTHING THE WALK DOES NOT REACH, so a row
	// left behind by a field that has gone is reported rather than kept.
	for name := range theShapes {
		if !answered[name] {
			t.Errorf("the table answers for %s and the walk reaches no such field", name)
		}
	}
}

// THE TWO COUNTS ARE ONE NUMBER, derived at check time rather than read off the
// detail, so a reviewer holds the size of the derived set against the size of
// the declared one instead of reading the word every.
func TestTheTableAnswersForEveryFieldTheWalkReaches(t *testing.T) {
	found := len(fieldsTheNoteWrites())
	if found == 0 {
		t.Fatal("the walk arrives at nothing, so this guards nothing")
	}
	if found != len(theShapes) {
		t.Errorf("the walk arrives at %d fields and the table answers for %d",
			found, len(theShapes))
	}
	t.Logf("%d fields the note writes, %d rows in the table", found, len(theShapes))
}

// A BLOCK CARRYING A LINE THAT OPENS A SECTION IS REFUSED.
//
// A BLOCK READS TO THE NEXT LEAD OR THE NEXT HEADING, so a value carrying a
// line that begins a section truncates, by design and in silence, which is the
// one outcome this token forbids.
//
// REFUSED RATHER THAN ESCAPED. A person reads and edits these notes in an
// editor, and a value written differently from how it was typed is a value
// somebody re-types wrongly. Accepting was never open: silence is what this
// exists to end.
func TestABlockOpensNoSection(t *testing.T) {
	r := lane(t)
	// THE OPENER IS THE DETAIL'S OWN, because that is the loss finding 14
	// measured: a section opener in a block does not only lose its tail, it
	// writes a second section under a heading the reader keeps one of, and the
	// later one wins.
	cut := "para one" + nl + nl + headDetail + nl + nl + "para two"
	how := blockFields()
	// THE NEIGHBOUR IS ASSERTED, NOT ONLY THE FIELD. A case asking only whether
	// the field came back short passes on a save that ate the detail.
	const held = "the detail this token was minted with"
	tried := 0
	for _, name := range blockRows() {
		one, ok := how[name]
		if !ok {
			t.Errorf("%s is a block the table names and nothing here feeds it a line "+
				"that opens a section, so the refusal is unchecked on it", name)
			continue
		}
		tried++
		tok := mint(t, r, Token{Title: "a thing", Detail: held})
		one.put(&tok, cut)
		err := SaveToken(r, tok)
		if err == nil {
			t.Errorf("%s carried a line that opens a section and the save took it", name)
			continue
		}
		if !strings.Contains(err.Error(), name) {
			t.Errorf("%s was refused and the refusal names %q instead", name, err)
		}
		back, err := LoadToken(r, tok.ID)
		if err != nil {
			t.Errorf("%s was refused and the token cannot be read back: %v", name, err)
			continue
		}
		if name != "Token.Detail" && back.Detail != held {
			t.Errorf("%s carried a line that opens a section and Token.Detail came "+
				"back %q rather than the detail it was minted with", name, back.Detail)
		}
	}
	if tried == 0 {
		t.Fatal("the table names no block, so this guards nothing")
	}
}

// blockFields answers, for every block the table names, how to put a value in
// it and how to read it back.
//
// THE SET IS THE TABLE'S AND THE CHECKS ASK FOR IT. A block added to the table
// and not to this map goes red by name, which is the one moment either check is
// needed. A MAP'S VALUE IS A BLOCK, so the two map rows are here for their value
// half; the key half is TestAMapsKeyIsOneLine.
func blockFields() map[string]struct {
	put func(*Token, string)
	get func(Token) string
} {
	type pair = struct {
		put func(*Token, string)
		get func(Token) string
	}
	return map[string]pair{
		"Token.Detail":      {func(k *Token, v string) { k.Detail = v }, func(k Token) string { return k.Detail }},
		"Token.Guidance":    {func(k *Token, v string) { k.Guidance = v }, func(k Token) string { return k.Guidance }},
		"Token.GuidanceRef": {func(k *Token, v string) { k.GuidanceRef = v }, func(k Token) string { return k.GuidanceRef }},
		"Rejection.Wrong": {func(k *Token, v string) {
			k.Findings = []Rejection{{Clause: "c", Wrong: v, Satisfies: "s"}}
		}, func(k Token) string { return k.Findings[0].Wrong }},
		"Rejection.Satisfies": {func(k *Token, v string) {
			k.Findings = []Rejection{{Clause: "c", Wrong: "w", Satisfies: v}}
		}, func(k Token) string { return k.Findings[0].Satisfies }},
		"Rejection.Answer": {func(k *Token, v string) {
			k.Findings = []Rejection{{Clause: "c", Wrong: "w", Satisfies: "s", Answer: v}}
		}, func(k Token) string { return k.Findings[0].Answer }},
		"Lesson.Class": {func(k *Token, v string) {
			k.Lessons = []Lesson{{Class: v, Avoid: "a", Prevents: "p"}}
		}, func(k Token) string { return k.Lessons[0].Class }},
		"Lesson.Avoid": {func(k *Token, v string) {
			k.Lessons = []Lesson{{Class: "c", Avoid: v, Prevents: "p"}}
		}, func(k Token) string { return k.Lessons[0].Avoid }},
		"Lesson.Prevents": {func(k *Token, v string) {
			k.Lessons = []Lesson{{Class: "c", Avoid: "a", Prevents: v}}
		}, func(k Token) string { return k.Lessons[0].Prevents }},
		"Lesson.Learned": {func(k *Token, v string) {
			k.Lessons = []Lesson{{Class: "c", Avoid: "a", Prevents: "p", Learned: v}}
		}, func(k Token) string { return k.Lessons[0].Learned }},
		"Token.Submission": {func(k *Token, v string) { k.Submission = map[string]string{"what was built": v} },
			func(k Token) string { return k.Submission["what was built"] }},
		"Token.Rewatched": {func(k *Token, v string) { k.Rewatched = map[string]string{"a criterion": v} },
			func(k Token) string { return k.Rewatched["a criterion"] }},
	}
}

// blockRows answers every row of the table that is a block, in one order.
func blockRows() []string {
	var names []string
	for _, name := range sorted(theShapes) {
		if theShapes[name] == "a block by design" ||
			theShapes[name] == "a map the note writes as a body section" {
			names = append(names, name)
		}
	}
	return names
}

// sorted answers the keys of a table in one order, so a failure names the same
// field every run.
func sorted(table map[string]string) []string {
	var names []string
	for name := range table {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}

// AND A MAP'S KEY IS ONE LINE, BECAUSE A NEWLINE IN ONE IS CUT AND ITS TAIL
// MOVES INTO THE VALUE.
//
// THE MIDDLE DOT IS SAFE THERE, and that is why this is written from a run
// rather than from the last finding: readBody strips the evidence lead and
// takes the rest of the heading whole, so it never splits on that character.
// A row written from the finding would have refused something the record holds.
// EVERY MAP THE TABLE NAMES, not the one this test happened to feed. Narrowing
// the refusal to Token.Submission left every check green while Token.Rewatched,
// which joined the record later, went unguarded.
func mapRows() []string {
	var names []string
	for _, name := range sorted(theShapes) {
		if theShapes[name] == "a map the note writes as a body section" {
			names = append(names, name)
		}
	}
	return names
}

func mapFields() map[string]func(*Token, map[string]string) {
	return map[string]func(*Token, map[string]string){
		"Token.Submission": func(k *Token, v map[string]string) { k.Submission = v },
		"Token.Rewatched":  func(k *Token, v map[string]string) { k.Rewatched = v },
	}
}

func TestAMapsKeyIsOneLine(t *testing.T) {
	r := lane(t)
	how := mapFields()
	rows := mapRows()
	if len(rows) == 0 {
		t.Fatal("the table names no map, so this guards nothing")
	}
	for _, name := range rows {
		put, ok := how[name]
		if !ok {
			t.Errorf("%s is a map the table names and nothing here feeds it a key of "+
				"two lines, so the refusal is unchecked on it", name)
			continue
		}
		tok := mint(t, r, Token{Title: "a thing"})
		put(&tok, map[string]string{"two" + nl + "lines": "what was built"})
		if err := SaveToken(r, tok); err == nil {
			t.Errorf("%s took a key of two lines, and it comes back short", name)
		} else if !strings.Contains(err.Error(), name) {
			t.Errorf("the refusal does not name %s: %v", name, err)
		}
		// AND THE MIDDLE DOT IS NOT REFUSED, because the record carries it.
		fine := mint(t, r, Token{Title: "another thing"})
		put(&fine, map[string]string{"what was built · round 2": "it was"})
		if err := SaveToken(r, fine); err != nil {
			t.Errorf("%s refused a key carrying the heading separator: %v", name, err)
		}
	}
}

// A BLOCK COMES BACK BYTE-IDENTICAL.
//
// THE WRITER ALREADY WRITES THESE WHOLE and only the reader was line-based, so
// the fix is in the reader and this is what says the round trip holds.
func TestABlockComesBackWhole(t *testing.T) {
	r := lane(t)
	how := blockFields()
	tried := 0
	for _, value := range []string{
		"para one" + nl + nl + "para two",
		"a line" + nl + nl + nl + "after a blank one",
		"para one" + nl + nl + "**wrong:** a lead this parser reads, in a second paragraph",
	} {
		for _, name := range blockRows() {
			one, ok := how[name]
			if !ok {
				t.Errorf("%s is a block the table names and nothing here round-trips it", name)
				continue
			}
			tok := mint(t, r, Token{Title: "a thing"})
			one.put(&tok, value)
			if err := SaveToken(r, tok); err != nil {
				t.Errorf("%s was given %q and the save refused it: %v", name, firstLines(value, 1), err)
				continue
			}
			now, err := LoadToken(r, tok.ID)
			if err != nil {
				t.Fatal(err)
			}
			tried++
			if got := one.get(now); got != value {
				t.Errorf("%s was given %q and came back %q", name, value, got)
			}
		}
	}
	if tried == 0 {
		t.Fatal("the table names no block, so this guards nothing")
	}
}

// EVERY VALUE THE NOTE JOINS INTO A HEADING IS REFUSED WHEN IT CARRIES THE
// HEADING SEPARATOR OR A NEWLINE.
//
// THE SET IS THE ONE THE TABLE NAMES, not the one member a finding was found
// on. A map's key is NOT in it: readBody strips the evidence lead and takes the
// rest of the heading whole, so the middle dot is safe there.
// THE ROWS THE TABLE NAMES, not the ones this test happened to think of.
//
// This typed its three members and never read theShapes, which is the half of
// the sentence that was the point: a fourth name put on the into a heading row
// was fed by nothing and no test went red, which is the exact moment this token
// exists for. Its siblings over blocks already walk the table and fail by name
// on a row nothing feeds, so the two now behave the same way.
func headingRows() []string {
	var names []string
	for _, name := range sorted(theShapes) {
		if theShapes[name] == "into a heading" {
			names = append(names, name)
		}
	}
	return names
}

func headingFields() map[string]func(*Token, string) {
	return map[string]func(*Token, string){
		"Rejection.Clause": func(k *Token, v string) {
			k.Findings = []Rejection{{Clause: v, Wrong: "w", Satisfies: "s"}}
		},
		"Rejection.By": func(k *Token, v string) {
			k.Findings = []Rejection{{Clause: "c", Wrong: "w", Satisfies: "s", By: v}}
		},
		"Lesson.By": func(k *Token, v string) {
			k.Lessons = []Lesson{{Class: "c", Avoid: "a", Prevents: "p", By: v}}
		},
	}
}

func TestAHeadingHoldsNoDelimiter(t *testing.T) {
	r := lane(t)
	how := headingFields()
	rows := headingRows()
	if len(rows) == 0 {
		t.Fatal("the table names no heading field, so this guards nothing")
	}
	for _, name := range rows {
		put, ok := how[name]
		if !ok {
			t.Errorf("%s is a heading the table names and nothing here feeds it a "+
				"delimiter, so the refusal is unchecked on it", name)
			continue
		}
		one := struct {
			name string
			put  func(*Token, string)
		}{name, put}
		for _, bad := range []string{"rev · 9", "two" + nl + "lines"} {
			tok := mint(t, r, Token{Title: "a thing"})
			one.put(&tok, bad)
			err := SaveToken(r, tok)
			if err == nil {
				t.Errorf("%s carried %q and the save took it", one.name, firstLines(bad, 1))
				continue
			}
			if !strings.Contains(err.Error(), one.name) {
				t.Errorf("%s was refused and the refusal names %q instead", one.name, err)
			}
		}
	}
}

// EVERY FIELD IS FED WHAT THE FORMAT DOES NOT OBVIOUSLY SURVIVE, rather than
// what the writer normally produces.
//
// A ROUND TRIP OVER ORDINARY PROSE SAYS NOTHING. The values that break a note
// are the ones that look like the note's own syntax, so each field is given the
// lead itself, the list marker, a backtick, the section opener, the heading
// separator, and nothing at all.
func TestTheNoteSurvivesAwkwardValues(t *testing.T) {
	r := lane(t)
	awkward := []string{
		"**wrong:** a lead the parser reads",
		"- a list marker at the start",
		"`a backtick fence`",
		"a middle dot · in the middle",
		"",
	}
	for _, value := range awkward {
		tok := mint(t, r, Token{Title: "a thing", Detail: value, Guidance: value})
		tok.Findings = []Rejection{{Clause: "c", Wrong: value, Satisfies: value}}
		tok.Lessons = []Lesson{{Class: value, Avoid: value, Prevents: value}}
		tok.Submission = map[string]string{"what was built": value}
		if err := SaveToken(r, tok); err != nil {
			t.Errorf("%q was refused: %v", value, err)
			continue
		}
		now, err := LoadToken(r, tok.ID)
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range []struct{ where, got string }{
			{"Token.Detail", now.Detail},
			{"Rejection.Wrong", now.Findings[0].Wrong},
			{"Lesson.Class", now.Lessons[0].Class},
			{"Token.Submission", now.Submission["what was built"]},
		} {
			if one.got != value {
				t.Errorf("%s was given %q and came back %q", one.where, value, one.got)
			}
		}
	}
	// AND THE SECTION OPENER IS REFUSED RATHER THAN SURVIVED, which is the
	// decision this token took and the reason it is written down.
	// MINTED CLEAN AND THEN GIVEN THE VALUE, because Mint saves too and the
	// refusal would fire there rather than where this is looking.
	opener := mint(t, r, Token{Title: "a thing"})
	opener.Detail = "one" + nl + nl + "## two"
	if err := SaveToken(r, opener); err == nil {
		t.Error("a value carrying a section opener was saved rather than refused")
	}
}
