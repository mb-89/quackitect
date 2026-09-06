package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A CLAIM ON A TOKEN IS NOT A FINDING.
//
// se claim writes claimed_by and claimed_at onto every token it takes, and the
// schema sets additionalProperties false and declares neither. So each claimed
// token carries two fields its own schema refuses.
//
// MEASURED. LintNotes over doc/work answered 283 findings, and 208 of them were
// those two lines over 104 tokens. Nothing a token author wrote caused one.
//
// A CLAIM IS NOT A HOLD. A hold belongs to an agent and lives under .se, which
// is why the schema keeps no holder. A claim belongs to a box and travels on
// the branch, which is the whole reason it is written on the token.
// See wk-e318448216.
func TestAClaimOnATokenIsNotAFinding(t *testing.T) {
	t.Parallel()
	method, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	note := `---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: a claimed token
status: open
claimed_by: aeaf7bd9/main
claimed_at: "2026-09-06T07:00:00Z"
---

## detail

A token a box has claimed, which is what every taken token looks like.

## done when

- it reads clean against its own schema
`
	at := filepath.Join(dir, "wk-0000000001.md")
	if err := os.WriteFile(at, []byte(note), 0o644); err != nil {
		t.Fatal(err)
	}

	for _, f := range LintNotes(Roots{Method: method, Work: dir}, dir) {
		t.Errorf("a claimed token was refused by its own schema: %s", f.Says)
	}
}

// AND THE SCHEMA SAYS WHY A CLAIM IS A FIELD AND A HOLD IS NOT.
func TestTheSchemaSaysWhyAClaimIsAField(t *testing.T) {
	t.Parallel()
	b, err := os.ReadFile(filepath.Join("..", "schemas", "work-token.schema.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"claimed_by", "claimed_at", "A CLAIM IS NOT A HOLD"} {
		if !strings.Contains(string(b), want) {
			t.Errorf("the schema does not carry %q", want)
		}
	}
}
