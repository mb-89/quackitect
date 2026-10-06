package main

import (
	"path/filepath"
	"testing"
)

// A root with no Vale under it reads no voice, as the bridge reads none. [[spec/tickets/cage-commit-guards-port]]
func TestCommitVoiceReadsNothingWhereNoValeStands(t *testing.T) {
	t.Parallel()
	if rows := commitVoice(t.TempDir(), "a commit message"); rows != nil {
		t.Errorf("commitVoice answers %v under a root with no Vale", rows)
	}
}

// The rules over the message answer the kept findings, and a private shape refuses. [[spec/tickets/cage-commit-guards-port]] [[spec/tickets/vale-leaves-the-tree]]
func TestCommitVoiceRefusesAPrivateShape(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	rows := commitVoice(root, "cage-commit-guards-port: the guard lands\n\nmail somebody at someone"+"@"+"somewhere.net\n")
	for _, one := range rows {
		if one.Rule == "Private" {
			return
		}
	}
	t.Errorf("commitVoice answers %v, and the message carries an address", rows)
}
