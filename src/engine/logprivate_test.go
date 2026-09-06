package main

import (
	"path/filepath"
	"testing"
)

// The log is private material. It holds prompts, so it lives where private
// material lives and never travels.
func TestTheLogLivesInThePrivateFolder(t *testing.T) {
	t.Parallel()
	r := Roots{Method: "/m", Work: "/w"}
	got := r.Private("log")
	if filepath.ToSlash(got) != "/w/.se/log" {
		t.Fatalf("the log should be private, got %s", got)
	}
}
