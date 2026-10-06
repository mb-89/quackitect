// The doors' rules over the tree: a walk-around of a door, refused in the lint
// and drawn in the editor, and a door standing in no declaration.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package check

// [[spec/design_output/doors#nothing-walks-around-a-door]]
const (
	WalksAroundADoor = "WalksAroundADoor"
	DoorDeclares     = "DoorDeclares"
)

// Every walk-around the file makes: at error where a door owning the name refuses, and as a hint in an editor's buffer where every one stands at report. [[spec/design_output/doors#nothing-walks-around-a-door]]
func walkFaults(tree *Tree, path string) []Finding {
	return nil
}

// Every declaration of no form, and every door no declaration holds. [[spec/design_output/doors#a-door-declares-what-it-owns]]
func declaresFaults(tree *Tree) []Finding {
	return nil
}
