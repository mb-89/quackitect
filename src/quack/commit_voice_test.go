package main

import (
	"path/filepath"
	"testing"
)

// A root with no Vale under it reads no voice, as the bridge reads none. [[spec/tickets/cage-commit-guards-port]]
func TestCommitVoiceReadsNothingWhereNoValeStands(t *testing.T) {
	t.Parallel()
	if rows := commitVoice(quietBox(), t.TempDir(), "a commit message"); rows != nil {
		t.Errorf("commitVoice answers %v under a root with no Vale", rows)
	}
}

// Vale over the message answers the kept findings, and a private shape refuses. [[spec/tickets/cage-commit-guards-port]]
func TestCommitVoiceRefusesAPrivateShape(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	if valeAt(realDisk(), root) == "" {
		t.Skip("no Vale stands under the tree")
	}
	rows := commitVoice(quietBox(), root, "cage-commit-guards-port: the guard lands\n\nmail somebody at someone"+"@"+"somewhere.net\n")
	for _, one := range rows {
		if one.Rule == "Private" {
			return
		}
	}
	t.Errorf("commitVoice answers %v, and the message carries an address", rows)
}
