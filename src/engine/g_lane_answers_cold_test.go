package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE DOOR ANSWERS ON A COLD CLONE, BEFORE ANYTHING IS BUILT.
//
// A cloud session cloned this tree and had no tool lane for the whole session,
// twice. The first time the stub built the engine before it answered the
// harness's handshake, and the harness gave up on it. The second time the stub
// answered the handshake at once, the build still left no lane, and nothing on
// this side could say why: the calls were held behind a build that was already
// over, and no answer ever came back naming a way to repair the session.
//
// SO TWO THINGS ARE READ OFF THE STUB. The reader that answers the harness is
// attached before any call that blocks, so initialize, tools/list and a call
// are all answered while the build runs behind them. And the refusal written
// once the build has failed names a door the caller can walk through, so a
// session with no lane is told how to get one rather than left waiting.
//
// EVERYTHING HERE IS PLANTED IN A FOLDER OF ITS OWN. The live tree is neither
// read nor written and nothing is spawned, so this runs the same on a box with
// no toolchain as on one with everything built.

// coldLaneBlocking are the calls that stop the stub dead. Each runs a child to
// completion, so a handshake arriving while one is up is not read until it
// returns, which is the shape of the first incident.
var coldLaneBlocking = []string{"execFileSync(", "spawnSync(", "execSync("}

// coldLaneReader is the line that puts the stub on the harness's side of the
// pipe. Once it has run, every line the harness sends is read.
const coldLaneReader = "input: process.stdin"

// coldLaneDoors are the repairs a refusal may name. Any one of them is a way
// out of a session with no lane.
var coldLaneDoors = []string{"RUNME", "diagnose.mjs", "install.sh"}

// coldLaneFaults answers what is wrong with a lane stub, in one order so a
// failure reads the same way twice, and nothing at all when the stub answers
// cold and refuses with a door.
func coldLaneFaults(source string) []string {
	var faults []string
	reader := strings.Index(source, coldLaneReader)
	switch {
	case reader < 0:
		faults = append(faults, "THE STUB NEVER READS THE HARNESS. Nothing in it "+
			"attaches a reader to "+coldLaneReader+", so the handshake is never answered.")
	default:
		for _, call := range coldLaneBlocking {
			at := strings.Index(source, call)
			if at >= 0 && at < reader {
				faults = append(faults, "THE HANDSHAKE WAITS ON A BUILD. "+call+
					" runs to completion before the reader is attached, so a cold clone "+
					"answers nothing until the build is over and the harness gives up.")
				break
			}
		}
	}
	if !coldLaneRefusesWithADoor(source) {
		faults = append(faults, "A FAILED BUILD LEAVES ONLY SILENCE. No refusal in "+
			"the stub says the session has no tool lane and names a repair, so a call "+
			"made after the build failed is held for ever.")
	}
	return faults
}

// coldLaneRefusesWithADoor says whether the stub carries a refusal that both
// names the missing lane and names a way to get one back.
func coldLaneRefusesWithADoor(source string) bool {
	if !strings.Contains(source, "NO TOOL LANE") {
		return false
	}
	for _, door := range coldLaneDoors {
		if strings.Contains(source, door) {
			return true
		}
	}
	return false
}

// aPlantedColdLane writes a stub into a folder of its own and answers the
// reading taken off the file, so the judgement is made on bytes that went to
// disk rather than on a string held in memory.
func aPlantedColdLane(t *testing.T, source string) []string {
	t.Helper()
	at := filepath.Join(t.TempDir(), "mcp-lane.mjs")
	if err := os.WriteFile(at, []byte(source), 0o644); err != nil {
		t.Fatalf("the planted stub could not be written: %v", err)
	}
	read, err := os.ReadFile(at)
	if err != nil {
		t.Fatalf("the planted stub could not be read: %v", err)
	}
	return coldLaneFaults(string(read))
}

// aStubThatBuildsBeforeItAnswers is the first incident, written small. The
// refusal is there and reads well, and the harness never lives to see it.
const aStubThatBuildsBeforeItAnswers = `import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline";

execFileSync("sh", ["src/scripts/setup/install.sh"], { stdio: "inherit" });

createInterface({ input: process.stdin }).on("line", (line) => {
  answer(read(line), "THIS SESSION HAS NO TOOL LANE. At a shell, ./RUNME.sh works.");
});
`

// aStubWithNoDoorInItsRefusal is the second incident. It answers at once, and
// once the build has failed it holds every call and says nothing.
const aStubWithNoDoorInItsRefusal = `import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const held = [];
createInterface({ input: process.stdin }).on("line", (line) => held.push(line));
spawn("sh", ["src/scripts/setup/install.sh"]).on("exit", () => flush(held));
`

// aStubThatAnswersFirstAndNamesADoor is the shape that holds. The reader goes
// on before anything else, the build runs behind it, and a build that fails
// turns every held call into a refusal with a way out in it.
const aStubThatAnswersFirstAndNamesADoor = `import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const held = [];
createInterface({ input: process.stdin }).on("line", (line) => held.push(read(line)));

const refuse = (msg) => answer(msg.id, "THIS SESSION HAS NO TOOL LANE. " + broken +
  " At a shell, ./RUNME.sh <verb> is the same call. To see why, run " +
  "node src/cage/diagnose.mjs and put its writing in your answer whole.");

spawn("sh", ["src/scripts/setup/install.sh"]).on("exit", () => held.forEach(refuse));
`

func TestTheLaneAnswersOnAColdClone(t *testing.T) {
	t.Run("a stub that builds first answers nothing while it builds", func(t *testing.T) {
		faults := aPlantedColdLane(t, aStubThatBuildsBeforeItAnswers)
		if len(faults) != 1 || !strings.Contains(faults[0], "THE HANDSHAKE WAITS ON A BUILD") {
			t.Fatalf("the planted stub runs the installer to completion before it "+
				"reads a line, so the handshake is not answered on a cold clone. The "+
				"reading found: %v", faults)
		}
	})

	t.Run("a stub with no refusal holds every call after the build fails", func(t *testing.T) {
		faults := aPlantedColdLane(t, aStubWithNoDoorInItsRefusal)
		if len(faults) != 1 || !strings.Contains(faults[0], "A FAILED BUILD LEAVES ONLY SILENCE") {
			t.Fatalf("the planted stub answers cold and then holds every call with no "+
				"word of a repair, which is the session that could not say why it had "+
				"no lane. The reading found: %v", faults)
		}
	})

	t.Run("a stub that answers first and names a door is left alone", func(t *testing.T) {
		faults := aPlantedColdLane(t, aStubThatAnswersFirstAndNamesADoor)
		if len(faults) != 0 {
			t.Fatalf("the planted stub attaches its reader before anything blocks and "+
				"refuses with a door in it, so nothing is owed. The reading found: %v", faults)
		}
	})
}
