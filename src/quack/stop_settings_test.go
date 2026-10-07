package main // level0: InPackageTest - a main package admits no outside test package

import (
	"testing"

	settingsreader "quackitect/src/config"
)

// The stop hook stands off where the local layer turns its switch off, and on where nothing does. [[spec/tickets/cage-stop-rules-port]]
// level0: FixtureOutsideHome - the case drops the local layer's switch into its own root.
func TestStopOffReadsTheSwitch(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if stopOff(root) {
		t.Error("stopOff answers off where no layer names the switch")
	}
	if err := settingsreader.Drop(root, stopEnabledKey, "false"); err != nil {
		t.Fatal(err)
	}
	if !stopOff(root) {
		t.Error("stopOff answers on where the local layer turns the switch off")
	}
}
