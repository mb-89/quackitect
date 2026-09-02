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
