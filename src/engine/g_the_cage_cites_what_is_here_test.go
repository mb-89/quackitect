package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE CITATIONS ARE PLANTED RATHER THAN LOOKED FOR. The reader this replaces
// scanned whatever the tree happened to hold, so a green run said nobody had
// broken it yet and not that the rule was held. These build a tree, write one
// citation into a cage file, and read the answer.

// The tokens the fixture puts in each place a citation can land. A fixture id is
// one digit repeated, because it stands for some token and not for a token in
// the record.
const (
	cageCitesAHeldToken    = "wk-1111111111"
	cageCitesAClosedToken  = "wk-2222222222"
	cageCitesAPrivateToken = "wk-3333333333"
	cageCitesALostToken    = "wk-4444444444"
)

// cageCitesSaying is a settings file whose comment says one thing, which is the
// shape both cage files have: a long comment and the keys it explains.
func cageCitesSaying(says string) string {
	return `{` + "\n" + `  "$comment": "THE CAGE THAT TRAVELS. ` + says + `",` + "\n" +
		`  "hooks": {}` + "\n" + `}` + "\n"
}

// A NOTE THAT NEVER TRAVELS IS NOT AN ANSWER, and this is the shape that lost
// the source: the id was a private note on the box that wrote the comment, so
// the box that wrote it could open it and no clone ever could.
func TestTheCageIsRefusedATokenOnlyThisBoxCanOpen(t *testing.T) {
	r := cageCitesFixture(t)
	rel := "src/cage/claude-settings.json"

	planted := cageCitesSaying("The measurement this is written from is on " + cageCitesAPrivateToken + ".")
	err := theCageCitesOnlyWhatTravels(r, false, rel, planted)
	if err == nil {
		t.Fatal("a citation of a note in the folder that never travels was allowed into the cage")
	}
	for _, want := range []string{cageCitesAPrivateToken, cageCitesThePrivateFolder, TheTrackedFolder} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal does not name %q: %s", want, err)
		}
	}

	clean := cageCitesSaying("The measurement is on " + cageCitesAHeldToken +
		", and what came before it is on " + cageCitesAClosedToken + ".")
	if err := theCageCitesOnlyWhatTravels(r, false, rel, clean); err != nil {
		t.Fatalf("a citation of a note in the record and of a row in the archive was refused: %v", err)
	}
}

// AND AN ID IN NEITHER PLACE IS A DOOR THAT OPENS ON NOTHING AT ALL.
func TestTheCageIsRefusedATokenNothingCarries(t *testing.T) {
	r := cageCitesFixture(t)
	rel := "src/cage/claude-settings-local.json"

	planted := cageCitesSaying("The port was measured under " + cageCitesALostToken + ".")
	err := theCageCitesOnlyWhatTravels(r, false, rel, planted)
	if err == nil {
		t.Fatal("a citation of a token this tree does not carry was allowed into the cage")
	}
	for _, want := range []string{cageCitesALostToken, "archive.jsonl"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal does not name %q: %s", want, err)
		}
	}

	clean := cageCitesSaying("The port was measured under " + cageCitesAClosedToken + ".")
	if err := theCageCitesOnlyWhatTravels(r, false, rel, clean); err != nil {
		t.Fatalf("a citation of a token the archive carries was refused: %v", err)
	}
}

// A PATH IS A CITATION TOO, WHEREVER IN THE TREE IT POINTS. The reader this
// replaces resolved a path only under util, doc and src, so a citation into
// spec, which is where the record moved to, was never looked at.
func TestTheCageIsRefusedAPathTheTreeDoesNotCarry(t *testing.T) {
	r := cageCitesFixture(t)
	rel := "src/cage/claude-settings.json"

	planted := cageCitesSaying("Why an event is registered here is spec/rationale/a-hook-is-taken.md.")
	err := theCageCitesOnlyWhatTravels(r, false, rel, planted)
	if err == nil {
		t.Fatal("a citation of a file under spec, which this tree does not carry, was allowed")
	}
	if !strings.Contains(err.Error(), "spec/rationale/a-hook-is-taken.md") {
		t.Errorf("the refusal does not name the path: %s", err)
	}

	clean := cageCitesSaying("What each event fires is counted in src/cage/hooks-the-harness-fires.md.")
	if err := theCageCitesOnlyWhatTravels(r, false, rel, clean); err != nil {
		t.Fatalf("a citation of a file this tree carries was refused: %v", err)
	}
}

// A WEB ADDRESS, A VARIABLE THE SHELL EXPANDS AND A FOLDER THE ENGINE WRITES ARE
// NONE OF THEM CITATIONS INTO THIS TREE. All three are in the cage as it stands,
// so a door that read them as paths would refuse the file it is meant to hold
// and offer nobody a move.
func TestTheCageReadsAWebAddressAndAVariableAsNeither(t *testing.T) {
	r := cageCitesFixture(t)
	rel := ".claude/settings.json"

	clean := cageCitesSaying("The door lives in .claude/settings.local.json, which is not in " +
		"version control. See https://code.claude.com/docs/en/settings-reference and " +
		"https://code.claude.com/docs/hooks.html. The start runs " +
		"sh $CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh, and the wake runs node " +
		"./src/cage/hooks-the-harness-fires.md.")
	if err := theCageCitesOnlyWhatTravels(r, false, rel, clean); err != nil {
		t.Fatalf("the cage as it stands was refused: %v", err)
	}

	// AND A PATH WRITTEN FROM WHERE A COMMAND STANDS IS STILL A PATH. The
	// leading dot is taken off rather than read as a folder nobody resolves.
	planted := cageCitesSaying("The wake runs node ./src/cage/hook-lane.mjs.")
	err := theCageCitesOnlyWhatTravels(r, false, rel, planted)
	if err == nil {
		t.Fatal("a command naming a file this tree does not carry was allowed")
	}
	if !strings.Contains(err.Error(), "src/cage/hook-lane.mjs") {
		t.Errorf("the refusal does not name the path: %s", err)
	}
}

// THE RULE IS ABOUT THE FILES THAT CARRY THE CAGE. Every other file in the tree
// cites what it likes, and this door says nothing about it.
func TestTheCageJudgesOnlyTheSettingsFiles(t *testing.T) {
	r := cageCitesFixture(t)
	broken := cageCitesSaying("Measured under " + cageCitesALostToken + ", see spec/rationale/gone.md.")
	for _, rel := range []string{"src/cage/host.mjs", "src/cage/mcp.json", "README.md", "spec/work/notes.md"} {
		if err := theCageCitesOnlyWhatTravels(r, true, rel, broken); err != nil {
			t.Errorf("%s was judged as a cage file: %v", rel, err)
		}
	}
	for _, rel := range []string{
		"src/cage/claude-settings.json", "src/cage/claude-settings-local.json",
		".claude/settings.json", ".claude/settings.local.json",
	} {
		if err := theCageCitesOnlyWhatTravels(r, true, rel, broken); err == nil {
			t.Errorf("%s was not judged, and it carries the cage", rel)
		}
	}
}

func TestTheCageOverTheLiveTreeForNow(t *testing.T) {
	root := filepath.Join("..", "..")
	r := Roots{Work: root, Method: root}
	for _, rel := range []string{
		"src/cage/claude-settings.json", "src/cage/claude-settings-local.json",
		".claude/settings.json", ".claude/settings.local.json",
	} {
		b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(rel)))
		if err != nil {
			continue
		}
		t.Log(rel, cageCitesFilesNamed(string(b)), cageCitesTokensNamed(string(b)))
		if err := theCageCitesOnlyWhatTravels(r, false, rel, string(b)); err != nil {
			t.Errorf("%s: %v", rel, err)
		}
	}
}
