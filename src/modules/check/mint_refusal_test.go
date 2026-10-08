// A mint the schema refuses names each fault and closes on the road to the
// shape, as mintedNote in mint.go writes it.
// [[spec/design_output/schema#the-tool-writes-the-note]]
package check

import (
	"testing"

	"quackitect/src/yaml"
)

func TestMintedRefusalClosesOnTheShape(t *testing.T) {
	schemas := &Kinds{}
	schemas.set("ticket", yaml.AsDoc(yaml.Read("kind: ticket\nfrontmatter:\n  required: [state]\n  properties:\n    state:\n      enum: [open]\n")))
	_, why := Minted(schemas, "ticket", "a/b.md", map[string]any{"state": "bogus"})
	want := "The ticket schema refuses this write to a/b.md.\n\n  a/b.md:2:1  Schema.state\n    state reads bogus, and the schema allows open.\n\nRun ./RUNME.sh mint ticket <path> for the shape it names, or park a draft as _name.md."
	if why != want {
		t.Errorf("the mint refuses with\n%s\nand refusedNote writes\n%s", why, want)
	}
}
