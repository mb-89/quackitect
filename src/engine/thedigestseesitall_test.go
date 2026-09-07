package main

import (
	"os"
	"path/filepath"
	"testing"
)

// A WATCH THAT CANNOT SEE THE CHANGE IS NOT A WATCH.
//
// The digest is what tells the engine to project again. It read the Sources
// field, which a folder-sourced projection does not carry, and it never read
// the parameter tree at all. So the two things most likely to move were the two
// it could not see, and the projections were right at a start and stale after.

func aTreeToProject(t *testing.T) Roots {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	if _, err := GuidanceDigest(r.Method); err != nil {
		t.Skipf("this fixture carries no projections to digest: %v", err)
	}
	return r
}

// THE PARAMETER TREE MOVES THE DIGEST. The commands are projected from it and
// from nothing else.
func TestTheDigestSeesTheParameterTree(t *testing.T) {
	r := aTreeToProject(t)
	tree := filepath.Join(r.Method, "src", "config", "parameters.json")
	before, err := GuidanceDigest(r.Method)
	if err != nil {
		t.Fatalf("the digest could not be read: %v", err)
	}
	was, err := os.ReadFile(tree)
	if err != nil {
		t.Skipf("this fixture carries no parameter tree: %v", err)
	}
	if err := os.WriteFile(tree, append(was, '\n'), 0o644); err != nil {
		t.Fatalf("the tree could not be written: %v", err)
	}
	after, err := GuidanceDigest(r.Method)
	if err != nil {
		t.Fatalf("the digest could not be read again: %v", err)
	}
	if before == after {
		t.Error("the parameter tree moved and the digest did not, so the commands never project again")
	}
}

// A FOLDER SOURCE MOVES IT TOO. Guidance is projected from a folder, and
// reading the Sources field left the whole of it out.
func TestTheDigestSeesAFolderSource(t *testing.T) {
	r := aTreeToProject(t)
	list, err := LoadProjections(r.Method)
	if err != nil {
		t.Fatalf("the projections could not be read: %v", err)
	}
	var folder string
	for _, p := range list {
		if p.SourcesFrom != "" {
			folder = p.SourcesFrom
			break
		}
	}
	if folder == "" {
		t.Skip("this fixture has no projection that names a folder")
	}
	srcs, err := sourcesOf(r.Method, Projection{SourcesFrom: folder})
	if err != nil || len(srcs) == 0 {
		t.Skipf("%s holds nothing to move: %v", folder, err)
	}
	before, err := GuidanceDigest(r.Method)
	if err != nil {
		t.Fatalf("the digest could not be read: %v", err)
	}
	one := filepath.Join(r.Method, filepath.FromSlash(srcs[0]))
	was, err := os.ReadFile(one)
	if err != nil {
		t.Fatalf("%s could not be read: %v", srcs[0], err)
	}
	if err := os.WriteFile(one, append(was, '\n'), 0o644); err != nil {
		t.Fatalf("%s could not be written: %v", srcs[0], err)
	}
	after, err := GuidanceDigest(r.Method)
	if err != nil {
		t.Fatalf("the digest could not be read again: %v", err)
	}
	if before == after {
		t.Errorf("%s moved and the digest did not, so guidance never projects again", srcs[0])
	}
}
