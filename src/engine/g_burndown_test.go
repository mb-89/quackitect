package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// THE BAR DRAWS THE BURN DOWN, AND THE ENGINE HANDS IT EVERY WORD.
//
// The page prints the answer this engine builds. It prints says on the bar and
// hangs detail on the hover, so an answer missing a word leaves the bar with
// nothing to draw and an answer that has formed its own words is a number
// nothing checks.
//
// THE FOURTH NUMBER WENT WITH THE REVIEW FLOW. The owner asked for four, and
// the fourth was the rate at which tokens fail reviews. Nothing writes a
// verdict any more, and a rate taken over no reviews reads as nought percent,
// which is a claim that everything passes. So the bar carries three numbers,
// and a fourth coming back on it is refused here rather than believed.

// aBurnDownBar is BD and three numbers separated by slashes, and nothing else.
var aBurnDownBar = regexp.MustCompile(`^BD: \d+/\d+/\d+$`)

// theBarCanDrawIt reads an answer the way the page does. It asks only for what
// the page reaches for, so this holds whatever else the engine chooses to send.
func theBarCanDrawIt(raw []byte) error {
	var answer map[string]any
	if err := json.Unmarshal(raw, &answer); err != nil {
		return fmt.Errorf("the answer is not JSON the page can read: %v", err)
	}
	for _, field := range []string{"minted", "done", "open", "says", "detail", "window"} {
		if _, ok := answer[field]; !ok {
			return fmt.Errorf("the answer carries no %s, so the bar draws a blank where that word belongs", field)
		}
	}
	says, _ := answer["says"].(string)
	if !aBurnDownBar.MatchString(says) {
		return fmt.Errorf("the bar reads %q rather than BD and three numbers separated by slashes", says)
	}
	detail, _ := answer["detail"].(string)
	if detail == "" {
		return fmt.Errorf("the hover reads nothing, so a reader cannot tell a small number from a short window")
	}
	if strings.Contains(says, detail) {
		return fmt.Errorf("the bar reads %q, which carries the detail the hover is for", says)
	}
	return nil
}

// A TREE WITH A DAY IN IT, and the answer that day builds is drawable.
//
// The log is planted rather than read from the live tree, so the numbers are
// known before the answer is asked for and a counter that is not wired reads
// as nought against a day that had work in it.
func TestTheBurnDownAnswerCarriesEveryWordTheBarDraws(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	r := Roots{Work: dir, Method: dir}
	plantABurnDownLog(t, r)

	b := TheBurndown(r, "2026-08-31")
	if b.Minted != 2 || b.Done != 1 {
		t.Fatalf("the planted day holds two mints and one ending and the answer counted %d and %d", b.Minted, b.Done)
	}
	raw, err := json.Marshal(b)
	if err != nil {
		t.Fatalf("the answer would not marshal: %v", err)
	}
	if err := theBarCanDrawIt(raw); err != nil {
		t.Errorf("the engine built an answer the bar cannot draw: %v", err)
	}
	if b.Says != "BD: 2/1/0" {
		t.Errorf("the bar reads %q where the day counted %d/%d/%d", b.Says, b.Minted, b.Done, b.Open)
	}
}

// AND A DAY NOTHING HAPPENED ON IS STILL DRAWABLE, because nought is a number
// a burn-down may answer and the words around it are built all the same.
func TestAQuietBurnDownIsStillDrawable(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	raw, err := json.Marshal(TheBurndown(Roots{Work: dir, Method: dir}, "1999-01-01"))
	if err != nil {
		t.Fatalf("the answer would not marshal: %v", err)
	}
	if err := theBarCanDrawIt(raw); err != nil {
		t.Errorf("a quiet day built an answer the bar cannot draw: %v", err)
	}
}

// AND AN ANSWER THE BAR CANNOT DRAW IS REFUSED. A reader that let everything
// through would pass the two above for the wrong reason, so each of these is a
// way the page went blank or lied and each must be caught.
func TestAnAnswerTheBarCannotDrawIsRefused(t *testing.T) {
	t.Parallel()
	for _, c := range []struct {
		said    string
		planted string
	}{
		{"the fourth number is back on the bar",
			`{"minted":2,"done":1,"open":0,"says":"BD: 2/1/0/0%","detail":"the detail","window":"the log"}`},
		{"the bar carries the detail the hover is for",
			`{"minted":2,"done":1,"open":0,"says":"BD: 2/1/0","detail":"BD: 2/1/0","window":"the log"}`},
		{"the answer says nothing about what it covers",
			`{"minted":2,"done":1,"open":0,"says":"BD: 2/1/0","detail":"the detail"}`},
		{"the hover is empty",
			`{"minted":2,"done":1,"open":0,"says":"BD: 2/1/0","detail":"","window":"the log"}`},
		{"the bar was formed somewhere else",
			`{"minted":2,"done":1,"open":0,"says":"2 minted, 1 done","detail":"the detail","window":"the log"}`},
	} {
		if err := theBarCanDrawIt([]byte(c.planted)); err == nil {
			t.Errorf("%s and the answer went through", c.said)
		}
	}
}

// plantABurnDownLog writes the day the answer is asked about: two mints and one
// ending, in the shape every move writes.
func plantABurnDownLog(t *testing.T, r Roots) {
	t.Helper()
	dir := r.Private("log")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatalf("planting the log folder: %v", err)
	}
	lines := strings.Join([]string{
		`{"t":"2026-08-31T09:00:00Z","seq":1,"session":"planted","src":"test","kind":"work","data":{"minted":"one"}}`,
		`{"t":"2026-08-31T10:00:00Z","seq":2,"session":"planted","src":"test","kind":"work","data":{"minted":"two"}}`,
		`{"t":"2026-08-31T11:00:00Z","seq":3,"session":"planted","src":"test","kind":"work","data":{"disposition":"done"}}`,
		`{"t":"2026-08-30T11:00:00Z","seq":4,"session":"planted","src":"test","kind":"work","data":{"minted":"the day before"}}`,
	}, "\n") + "\n"
	if err := os.WriteFile(filepath.Join(dir, "planted.jsonl"), []byte(lines), 0o644); err != nil {
		t.Fatalf("planting the log: %v", err)
	}
}
