// The names the private folder holds, the rule placing a spelling of one beside
// its owner, and the rule holding the installer's loops to the lists.
// [[spec/design_input/the-runtime-files-stand-apart]]
package check

// The names the runtime half took, its older names, the older places of the log, and a name one side holds alone. [[spec/design_input/the-runtime-files-stand-apart]]
var (
	Moved   []string
	Renamed []string
	Logged  []string
	Apart   map[string]struct{ Side, Why string }
)

// [[spec/design_input/the-runtime-files-stand-apart]]
func privateFolderOwned(tree *Tree) []Finding { return nil }

// [[spec/design_input/the-runtime-files-stand-apart]]
func installerHoldsTheNames(tree *Tree) []Finding { return nil }

// The names each loop moves by the list its mark names, and the line of each loop naming no list. [[spec/design_input/the-runtime-files-stand-apart]]
func loopNames(text string, lists map[string][]string) (map[string][]string, []int) {
	return nil, nil
}
