package main

import "testing"

// THE FAULT THIS EXISTS FOR, MEASURED 2026-08-31.
//
// The file was rewritten shorter, the reading restarted from the top, and the
// model appended the second reading to the first. Two lines then carried one
// number, the selection found whichever came first, and paging down from 10:35
// landed at 10:17.
func TestAFileThatStartedAgainReplacesWhatWasRead(t *testing.T) {
	t.Parallel()
	m := newTestModel(20)
	m = key(m, "end")
	if len(m.all) != 20 || m.selID != 20 {
		t.Fatalf("%d lines, selection on %d", len(m.all), m.selID)
	}

	// The same file, read again from the top after it shrank.
	again := []Record{rec(1, "agent", "call", "message 1"), rec(2, "agent", "call", "message 2")}
	out, _ := m.Update(linesMsg{recs: again, restarted: true})
	m = out.(model)

	if len(m.all) != 2 {
		t.Fatalf("it holds %d lines, and the file has 2", len(m.all))
	}
	// One line, one number. A duplicate is what sent the selection backwards.
	seen := map[int64]bool{}
	for _, r := range m.all {
		if seen[r.ID] {
			t.Fatalf("two lines carry the id %d", r.ID)
		}
		seen[r.ID] = true
	}
	// And it follows the newest, because there is nothing else to hold on to.
	if !m.follow || m.selID != 2 {
		t.Fatalf("after the restart it follows=%v and sits on %d", m.follow, m.selID)
	}
}

// Paging down never goes backwards, even after a restart.
func TestPagingDownNeverGoesBackwardsAfterARestart(t *testing.T) {
	t.Parallel()
	m := newTestModel(40)
	out, _ := m.Update(linesMsg{recs: []Record{
		rec(1, "agent", "call", "message 1"),
		rec(2, "agent", "call", "message 2"),
		rec(3, "agent", "call", "message 3"),
	}, restarted: true})
	m = out.(model)
	m = key(m, "home")

	var seen []int64
	for i := 0; i < 6; i++ {
		m = key(m, "pgdown")
		seen = append(seen, m.selID)
	}
	for i := 1; i < len(seen); i++ {
		if seen[i] < seen[i-1] {
			t.Fatalf("paging down went from %d back to %d: %v", seen[i-1], seen[i], seen)
		}
	}
}
