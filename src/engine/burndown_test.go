package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// aLogHolding writes the lines a fixture needs, in the shapes the engine's own
// writers produce. The day is the UTC stamp, because that is what a reading of
// the log is keyed on.
func aLogHolding(t *testing.T, r Roots, lines ...string) {
	t.Helper()
	dir := r.Private("log")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "session-fixture.jsonl"),
		[]byte(strings.Join(lines, "\n")+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
}

func aMint(day string, seq int, id string) string {
	return `{"t":"` + day + `T10:00:0` + itoaFinding(seq) + `Z","seq":` + itoaFinding(seq) +
		`,"session":"fixture","src":"engine","kind":"work","msg":"` + id +
		` minted imp_open","data":{"id":"` + id + `","status":"imp_open","assignee":"main"}}`
}

func aDone(day string, seq int, id string) string {
	return `{"t":"` + day + `T11:00:0` + itoaFinding(seq) + `Z","seq":` + itoaFinding(seq) +
		`,"session":"fixture","src":"engine","kind":"work","msg":"` + id +
		` imp_in_review to imp_done","data":{"id":"` + id + `","from":"imp_in_review","to":"imp_done"}}`
}

func aVerdict(day string, seq int, id, verdict string) string {
	return `{"t":"` + day + `T12:00:0` + itoaFinding(seq) + `Z","seq":` + itoaFinding(seq) +
		`,"session":"fixture","src":"engine","kind":"review","msg":"` + id + ` ` + verdict +
		`","data":{"id":"` + id + `","verdict":"` + verdict + `"}}`
}

// ended mints a token and then writes the ending on it, which is the only way
// to get one: Mint turns an ended status back to open.
func ended(t *testing.T, r Roots, title string, at Status, traced bool) {
	t.Helper()
	one := mint(t, r, Token{Title: title, Status: ImpOpen, Traced: traced})
	one.Status = at
	if err := SaveToken(r, one); err != nil {
		t.Fatal(err)
	}
}

// THE ENGINE ANSWERS THE FOUR NUMBERS, and says which window it covers.
func TestTheEngineAnswersABurndown(t *testing.T) {
	r := lane(t)
	aLogHolding(t, r,
		aMint("2026-08-31", 1, "wk-aaaaaaaaaa"),
		aDone("2026-08-31", 2, "wk-aaaaaaaaaa"),
		aVerdict("2026-08-31", 3, "wk-aaaaaaaaaa", "rejected"),
	)
	mint(t, r, Token{Title: "still open", Status: ImpOpen})

	got := TheBurndown(r, "2026-08-31")
	if got.Day != "2026-08-31" {
		t.Errorf("the answer is for %q", got.Day)
	}
	if got.Minted != 1 || got.Done != 1 || got.Open != 1 || got.Rate != 100 {
		t.Errorf("the four numbers are %d/%d/%d/%d%%, and one minted, one done, one open "+
			"and one rejection over one token is 1/1/1/100%%",
			got.Minted, got.Done, got.Open, got.Rate)
	}
	// AND THE WINDOW IS SAID, so a reader can tell a small number from a short
	// window rather than reading it as a quiet day.
	if strings.TrimSpace(got.Window) == "" {
		t.Error("the answer says nothing about which window it covers")
	}
	if !strings.Contains(got.Window, "wk-88f4fcc517") {
		t.Errorf("the window does not name where the long run is decided: %q", got.Window)
	}
	if !strings.Contains(got.Says, "BD:") {
		t.Errorf("what the bar shows reads %q", got.Says)
	}
}

// MINTED PER DAY AND DONE PER DAY ARE READ OUT OF THE LOG, and the criterion
// names the answer rather than only the data.
//
// A counter that sums the days answers four and three. One that takes the wrong
// day answers three and one where one and two is owed. Nothing in this fixture
// produces a five.
func TestTheBurndownCountsADay(t *testing.T) {
	r := lane(t)
	aLogHolding(t, r,
		aMint("2026-08-30", 1, "wk-1111111111"),
		aMint("2026-08-30", 2, "wk-2222222222"),
		aMint("2026-08-30", 3, "wk-3333333333"),
		aDone("2026-08-30", 4, "wk-1111111111"),
		aMint("2026-08-31", 5, "wk-4444444444"),
		aDone("2026-08-31", 6, "wk-2222222222"),
		aDone("2026-08-31", 7, "wk-3333333333"),
	)

	later := TheBurndown(r, "2026-08-31")
	if later.Minted != 1 || later.Done != 2 {
		t.Errorf("2026-08-31 answers %d minted and %d done, and one and two is owed",
			later.Minted, later.Done)
	}
	earlier := TheBurndown(r, "2026-08-30")
	if earlier.Minted != 3 || earlier.Done != 1 {
		t.Errorf("2026-08-30 answers %d minted and %d done, and three and one is owed",
			earlier.Minted, earlier.Done)
	}
}

// OPEN PLUS BACKLOGGED IS ONE ABSOLUTE COUNT over every token that has not
// ended, across both stores. It requires a value and not merely more than none.
func TestTheBurndownCountsWhatIsStillOpen(t *testing.T) {
	r := lane(t)
	// Traced goes to doc/work, ephemeral to .se/work, so both stores are read.
	mint(t, r, Token{Title: "a note", Status: Backlogged, Traced: true})
	mint(t, r, Token{Title: "a second note", Status: Backlogged, Traced: true})
	mint(t, r, Token{Title: "a draft", Status: SpecOpen, Traced: true})
	mint(t, r, Token{Title: "in hand", Status: ImpInWork, Traced: false})
	// AN ENDING IS WRITTEN AFTER THE MINT, because Mint refuses to start a
	// token in a state it has already ended in and turns it back to open.
	ended(t, r, "finished there", ImpDone, true)
	ended(t, r, "stopped there", Aborted, true)
	ended(t, r, "finished here", ImpDone, false)
	ended(t, r, "stopped here", Aborted, false)

	if got := TheBurndown(r, "2026-08-31").Open; got != 4 {
		t.Errorf("the fixture holds four tokens that have not ended and the answer is %d", got)
	}
}

// THE FAILURE RATE COUNTS A REJECTION PER ROUND, so a token rejected twice
// counts twice and the rate goes above a hundred.
func TestTheFailureRateCountsEveryRound(t *testing.T) {
	r := lane(t)
	aLogHolding(t, r,
		aVerdict("2026-08-31", 1, "wk-5555555555", "rejected"),
		aVerdict("2026-08-31", 2, "wk-5555555555", "rejected"),
	)
	if got := TheBurndown(r, "2026-08-31").Rate; got != 200 {
		t.Errorf("one token rejected twice answers %d%%, and two hundred is owed", got)
	}
}
