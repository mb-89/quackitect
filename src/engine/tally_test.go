package main

import (
	"quackitect/engine/internal/expr"
	"testing"
)

// A COUNT SAYS WHICH TOKENS IT COUNTED, AND NOT ONLY HOW MANY.
//
// The owner asked for a control on the bar carrying the number in work, that
// opens to the names behind it, and opens a token from there. A number alone
// cannot answer that: the page would have to find the tokens again itself, and
// a set the page derives is a set nothing checks. It can disagree with the
// number printed beside it and still look right.
//
// SO THE COUNT CARRIES ITS MEMBERS and the page draws what it was handed. This
// is the ruling made for the burndown, applied to the same bar.
func TestACountCarriesTheTokensBehindIt(t *testing.T) {
	t.Parallel()
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    counts:
      - name: in work
        filter: status == "imp_in_work" || status == "spec_in_work"
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	rows := []expr.Row{
		row("id", "wk-1", "status", "imp_in_work", "title", "the first"),
		row("id", "wk-2", "status", "imp_open", "title", "the second"),
		row("id", "wk-3", "status", "spec_in_work", "title", "the third"),
	}
	tab, err := Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	if len(tab.Counts) != 1 {
		t.Fatalf("the view declares one count and the table carries %d", len(tab.Counts))
	}
	got := tab.Counts[0]
	if got.N != 2 {
		t.Errorf("two rows are in work and the count says %d", got.N)
	}
	// THE MEMBERS ARE THE POINT. A count that matched the right rows and handed
	// none of them over leaves the page with a number it cannot open.
	if len(got.Of) != got.N {
		t.Fatalf("the count says %d and carries %d token(s)", got.N, len(got.Of))
	}
	want := []struct{ id, title string }{{"wk-1", "the first"}, {"wk-3", "the third"}}
	for i, w := range want {
		if got.Of[i].ID != w.id {
			t.Errorf("member %d is %q and the row that matched is %q", i, got.Of[i].ID, w.id)
		}
		// THE TITLE TRAVELS WITH THE ID, because the list the person opens is a
		// list of names. An id alone would send the page back to the table to
		// look each one up, which is the deriving this exists to stop.
		if got.Of[i].Title != w.title {
			t.Errorf("member %d is titled %q and the row says %q", i, got.Of[i].Title, w.title)
		}
	}
}

// AND A COUNT THAT MATCHES NOTHING CARRIES NOTHING, rather than every row.
//
// The failure this guards is a filter that is ignored on the member list while
// still deciding the number, which draws a pill saying nought that opens onto
// the whole queue.
func TestACountThatMatchesNothingCarriesNothing(t *testing.T) {
	t.Parallel()
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    counts:
      - name: in review
        filter: status == "imp_in_review"
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], []expr.Row{
		row("id", "wk-1", "status", "imp_open", "title", "the first"),
	})
	if err != nil {
		t.Fatal(err)
	}
	if tab.Counts[0].N != 0 {
		t.Errorf("nothing is in review and the count says %d", tab.Counts[0].N)
	}
	if len(tab.Counts[0].Of) != 0 {
		t.Errorf("nothing is in review and the count carries %d token(s)", len(tab.Counts[0].Of))
	}
}

// A COUNT SAYS WHAT IT IS OUT OF. The owner reads the pill as a fraction: two
// in work, out of the twenty-one that are in work or still open. The view
// declares the whole with outOf, both halves are counted over the same rows,
// and a count without an outOf stays a bare number.
func TestACountSaysWhatItIsOutOf(t *testing.T) {
	t.Parallel()
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    counts:
      - name: in work
        filter: status == "imp_in_work"
        outOf: status == "imp_in_work" || status == "imp_open"
      - name: bare
        filter: status == "imp_in_work"
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	rows := []expr.Row{
		row("id", "wk-1", "status", "imp_in_work", "title", "the first"),
		row("id", "wk-2", "status", "imp_open", "title", "the second"),
		row("id", "wk-3", "status", "imp_open", "title", "the third"),
		row("id", "wk-4", "status", "imp_done", "title", "the done one"),
	}
	tab, err := Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	if got := tab.Counts[0]; got.N != 1 || got.OutOf != 3 {
		t.Errorf("one of three is in work and the count says %d/%d", got.N, got.OutOf)
	}
	// THE MEMBERS STAY THE PART AND NOT THE WHOLE: the pill opens onto what is
	// in work, because that is the number the person pressed.
	if got := tab.Counts[0]; len(got.Of) != 1 || got.Of[0].ID != "wk-1" {
		t.Errorf("the members are not the part: %+v", got.Of)
	}
	// AND WITHOUT AN OUTOF THE NUMBER STAYS BARE, so every other view is
	// untouched by this field existing.
	if got := tab.Counts[1]; got.OutOf != 0 {
		t.Errorf("a count without outOf carries a whole of %d", got.OutOf)
	}
}
