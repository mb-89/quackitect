package main

import (
	"strings"
	"testing"
)

// THE CAGE UNDER TEST IS PLANTED RATHER THAN READ OFF THIS BOX. The reader this
// replaces judged whatever the working copy happened to hold, so a green run
// said nobody had broken it lately and not that the rule was held. Each case
// here writes one cage and reads the answer.

// cageCannotBlockSaying is a cage registering one event that runs one thing,
// which is the shape both travelling files have.
func cageCannotBlockSaying(event, command string) string {
	return `{
  "$comment": "THE CAGE THAT TRAVELS.",
  "outputStyle": "quackitect",
  "hooks": {
    "` + event + `": [
      {
        "matcher": "",
        "hooks": [
          { "type": "command", "command": "` + command + `" }
        ]
      }
    ]
  }
}
`
}

// A REFUSING EVENT THAT IS NOT THE WAKE IS THE WHOLE INCIDENT. A clone carries
// this file, so the session it stops is one with no engine to ask about it.
func TestTheTravellingCageIsRefusedAHookThatCanDeny(t *testing.T) {
	r := cageCannotBlockRoots(t)
	for _, event := range []string{"PreToolUse", "Stop", "SubagentStop", "PreModelSwitch"} {
		planted := cageCannotBlockSaying(event, "node ./src/cage/say-no.mjs")
		err := theTravellingCageNamesNoRefusal(r, false, "src/cage/claude-settings.json", planted)
		if err == nil {
			t.Fatalf("%s ran a script that is not the wake and the cage was allowed to travel", event)
		}
		for _, want := range []string{event, "say-no.mjs", cageCannotBlockTheLocalCage} {
			if !strings.Contains(err.Error(), want) {
				t.Errorf("the refusal does not name %q: %s", want, err)
			}
		}
	}
}

// AND THE WAKE IS THE ONE REFUSING HOOK THAT MAY TRAVEL, in both its spellings:
// the source writes a placeholder and the projection fills it in.
func TestTheTravellingCageTakesTheWakeInEitherSpelling(t *testing.T) {
	r := cageCannotBlockRoots(t)
	cases := map[string]string{
		"src/cage/claude-settings.json": cageCannotBlockSaying("UserPromptSubmit",
			"node {{hooklane}} hook --method {{method}} --wake"),
		".claude/settings.json": cageCannotBlockSaying("UserPromptSubmit",
			"node ./src/cage/hook-lane.mjs hook --method . --wake"),
	}
	for rel, clean := range cases {
		if err := theTravellingCageNamesNoRefusal(r, false, rel, clean); err != nil {
			t.Errorf("%s registers the wake and was refused: %v", rel, err)
		}
	}
}

// AN EVENT THAT CANNOT REFUSE RUNS WHATEVER IT LIKES. SessionStart is how the
// engine is brought up, and a door that read it as a refusal would refuse the
// cage as it stands and offer nobody a move.
func TestTheTravellingCageLeavesSessionStartAlone(t *testing.T) {
	r := cageCannotBlockRoots(t)
	clean := cageCannotBlockSaying("SessionStart", "sh $CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh")
	if err := theTravellingCageNamesNoRefusal(r, false, ".claude/settings.json", clean); err != nil {
		t.Fatalf("SessionStart cannot refuse a call and the cage was refused anyway: %v", err)
	}
	for _, event := range []string{"PostToolUse", "Notification", "SessionEnd", "PreCompact"} {
		if err := theTravellingCageNamesNoRefusal(r, false, ".claude/settings.json",
			cageCannotBlockSaying(event, "node ./src/cage/say-something.mjs")); err != nil {
			t.Errorf("%s cannot refuse a call and was judged as though it could: %v", event, err)
		}
	}
}

// A REFUSING EVENT IS HELD WHOLE. One entry being the wake says nothing about
// the one beside it, and a second command on the same event is exactly where a
// refusal would be dropped in unnoticed.
func TestTheTravellingCageReadsEveryHookOnTheEvent(t *testing.T) {
	r := cageCannotBlockRoots(t)
	planted := `{
  "hooks": {
    "UserPromptSubmit": [
      { "matcher": "", "hooks": [
        { "type": "command", "command": "node {{hooklane}} hook --method {{method}} --wake" },
        { "type": "command", "command": "node ./src/cage/say-no.mjs" }
      ] }
    ]
  }
}
`
	err := theTravellingCageNamesNoRefusal(r, false, "src/cage/claude-settings.json", planted)
	if err == nil {
		t.Fatal("a second hook beside the wake on a refusing event was allowed to travel")
	}
	if !strings.Contains(err.Error(), "say-no.mjs") {
		t.Errorf("the refusal does not name what runs beside the wake: %s", err)
	}
}

// THE RULE IS ABOUT THE TWO FILES A CLONE CARRIES. The local cage is written by
// the engine as it starts, so what it registers arrives with an engine that can
// be asked about it, and every other file in the tree is none of this door's
// business.
func TestTheTravellingCageJudgesOnlyWhatTravels(t *testing.T) {
	r := cageCannotBlockRoots(t)
	broken := cageCannotBlockSaying("PreToolUse", "node ./src/cage/say-no.mjs")
	for _, rel := range []string{
		"src/cage/claude-settings-local.json",
		".claude/settings.local.json",
		"src/cage/hook-lane.mjs",
		"README.md",
	} {
		if err := theTravellingCageNamesNoRefusal(r, true, rel, broken); err != nil {
			t.Errorf("%s does not travel to a box without an engine and was judged anyway: %v", rel, err)
		}
	}
	for _, rel := range []string{"src/cage/claude-settings.json", ".claude/settings.json", "./.claude/settings.json"} {
		if err := theTravellingCageNamesNoRefusal(r, true, rel, broken); err == nil {
			t.Errorf("%s travels to every clone and was not judged", rel)
		}
	}
}

// AND A CAGE NOTHING CAN PARSE IS NOT A CAGE ANYBODY HAS READ.
func TestTheTravellingCageIsRefusedWhatWillNotParse(t *testing.T) {
	r := cageCannotBlockRoots(t)
	if err := theTravellingCageNamesNoRefusal(r, false, ".claude/settings.json", "{ not json"); err == nil {
		t.Fatal("a cage that does not read as JSON was allowed to travel")
	}
	if err := theTravellingCageNamesNoRefusal(r, false, ".claude/settings.json", "{}"); err != nil {
		t.Fatalf("a cage registering no hook at all was refused: %v", err)
	}
}
