package main

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// theLaneSocket is the rule src/mcp/model.go carries, written out here so the
// two can be held against each other. The limit arrives as a parameter rather
// than as a literal, so this file keeps no second copy of the number and a
// drifted one can be handed in and seen to change the answer.
func theLaneSocket(work string, limit int) string {
	p := filepath.Join(work, ".se", "engine.sock")
	if len(p) < limit {
		return p
	}
	sum := sha256.Sum256([]byte(work))
	return filepath.Join(os.TempDir(), "quackitect-"+hex.EncodeToString(sum[:6])+".sock")
}

// THE LANE DIALS WHERE THE ENGINE LISTENS.
//
// theEngineSocket in src/mcp/model.go decides the engine's socket from the
// work folder alone, with its own copy of the rule socketPath holds here:
// .se/engine.sock under the work folder while that path is short enough for a
// socket, and quackitect- plus six bytes of sha256 under the temporary folder
// once it is not. The lane dials that path whenever the runtime record names
// no socket.
//
// NOTHING HELD THE TWO COPIES TOGETHER. The engine's tests drove one and the
// lane's tests drove the other, so a change to the limit, to the width of the
// hash or to the name on either side left the lane dialling a path nothing
// listens on, and the answer an agent got was to start an engine that was
// already up.
//
// So this drives both sides of the limit over planted folders, and then hands
// the lane's rule a limit that has drifted, because two functions that agree
// whatever they are told agree about nothing.
func TestTheLaneDialsWhereTheEngineListens(t *testing.T) {
	t.Parallel()
	planted := t.TempDir()

	// THE PLANTED CASE is a work folder whose socket path is past the limit.
	long := filepath.Join(planted, strings.Repeat("a", 96))
	if err := os.MkdirAll(filepath.Join(long, ".se"), 0o755); err != nil {
		t.Fatal(err)
	}
	// THE CLEAN CASE is a short work folder on the same volume. Neither
	// socketPath nor theLaneSocket reads the disk, so this one is a path and
	// nothing more, and it stays short whatever the box calls its temporary
	// folder.
	short := filepath.Join(filepath.VolumeName(planted)+string(filepath.Separator), "quack-short")

	own := filepath.Join(short, ".se", "engine.sock")
	if len(own) >= socketPathLimit {
		t.Fatalf("the clean case is not under the limit: %s is %d bytes", own, len(own))
	}
	if got := socketPath(Roots{Work: short, Method: short}); got != own {
		t.Fatalf("a work folder under the limit keeps its socket at %s, and the engine answered %s", own, got)
	}

	deep := socketPath(Roots{Work: long, Method: long})
	if strings.HasPrefix(deep, long) {
		t.Fatalf("a work folder past the limit leaves its socket behind, and the engine answered %s", deep)
	}
	if filepath.Dir(deep) != filepath.Clean(os.TempDir()) {
		t.Fatalf("a socket past the limit belongs under %s, and the engine answered %s", os.TempDir(), deep)
	}
	if !regexp.MustCompile(`^quackitect-[0-9a-f]{12}\.sock$`).MatchString(filepath.Base(deep)) {
		t.Fatalf("the folded name is not the one the lane rebuilds: %s", filepath.Base(deep))
	}

	// AND THE LANE ARRIVES WHERE THE ENGINE IS, on both sides of the limit.
	for _, work := range []string{short, long} {
		listens := socketPath(Roots{Work: work, Method: work})
		if dials := theLaneSocket(work, socketPathLimit); dials != listens {
			t.Fatalf("over %s the lane dials %s and the engine listens on %s", work, dials, listens)
		}
	}

	// AND A DRIFTED LIMIT IS SEEN. A lane that thought the limit was the
	// length of the clean case would fold a path the engine keeps private.
	if dials := theLaneSocket(short, len(own)); dials == socketPath(Roots{Work: short, Method: short}) {
		t.Fatalf("a lane holding a limit of %d dials %s, which is where the engine listens, so a drift would pass", len(own), dials)
	}
}
