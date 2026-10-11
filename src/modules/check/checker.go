// The one checker every front asks. The command line, the port and the editor
// each asks it for the sweep, and each reads back the same findings.
// [[spec/design_output/lsp#one-checker-every-front-asks]]
package check

type Checker struct {
	tree *Tree
	// The runs the restated rules refuse, off the config. [[spec/design_output/lsp#a-second-copy-draws]]
	pointer int
	rule    int
}

// The checker over a tree, with the runs the restated rules refuse. [[spec/tickets/lsp-rules-move-to-check]]
func CheckerOver(tree *Tree, pointer, rule int) *Checker {
	return &Checker{tree: tree, pointer: pointer, rule: rule}
}

// Every rule over the whole tree, which the sweep runs. [[spec/design_output/tree#what-a-rule-answers]]
var Rules = []func(*Tree) []Finding{
	settingsNameBinaries,
	biomeOnWindows,
	extensionsOnOffer,
	noLogDeleted,
	privateFolderOwned,
	installerHoldsTheNames,
	nameHoldsTheWords,
	nothingPrivateTravels,
	surveyNamesInstalls,
	surveyFindsNode,
	everyPointerResolves,
	everyNamedPathStands,
	groupAsksNobody,
	engineSweep,
	noConflictMarkers,
	ExampleCovers,
	exampleProves,
	declaresFaults,
	helperCopies,
}

// [[spec/design_output/tree#what-a-rule-answers]]
func treeFaults(tree *Tree) []Finding {
	out := []Finding{}
	for _, rule := range Rules {
		out = append(out, rule(tree)...)
	}
	return out
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Sweep() []Finding {
	one.tree.Forgets()
	out := append(treeFaults(one.tree), schemaFaults(one.tree)...)
	out = append(out, syntaxSweep(one.tree)...)
	out = append(out, restatedFaults(one.tree, one.pointer, one.rule)...)
	return sorted(pastHistory(one.tree, out))
}

func (one *Checker) Tree() *Tree { return one.tree }
