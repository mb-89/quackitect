// The model door rides beside the voice, so a box with Vale reads both.
// [[spec/tickets/model-trailer-refuses-in-place]]
package hooks // level0: InPackageTest - reaches the unexported Door.commitVoice, Door.from and disk

import (
	"testing"

	"quackitect/src/modules/hooks/command"
)

// A message breaking a voice rule and naming a model draws both rows. [[spec/tickets/model-trailer-refuses-in-place]]
func TestCommitVoiceReadsTheModelBesideTheVoice(t *testing.T) {
	// The -m form reads no file, and the fake voice reads no root. [[spec/design_output/model#the-guards-hold-a-baseline]]
	const root = "the-root"
	d := &Door{}
	d.from.Voice = func(string, string) []command.Row { return []command.Row{{Rule: "Private", Said: "a name"}} }
	rows := d.commitVoice(`git commit -m "a-ticket: the change

Co-Authored-By: Claude Opus 5.5"`, root, disk{root})
	if len(rows) != 2 || rows[0].Rule != "ModelTrailer" || rows[1].Rule != "Private" {
		t.Errorf("the door reads %v", rows)
	}
}
