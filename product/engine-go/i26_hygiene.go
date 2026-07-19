package main

import (
	"sort"
)

// design: go-ifu-coverage  implements: req-ifu-coverage
// IFU decks are ordinary markdown deck manifests with `kind: ifu`. Their source is the
// authoring truth. The coverage rule reads those sources and requires every in-scope
// use case to be LINKED on at least one IFU deck's COVERAGE slide. That slide is the
// last one, the arc's machine-readable reference home (go-ifu-arc-lint, i27). A
// scattered or bare mention satisfies nothing: that is the coverage theater the owner
// banned.
func ifuCoverageMissing(nodes map[string]Node, scope string) []string {
	covered := map[string]bool{}
	var ids []string
	for id, n := range nodes {
		if n.Type == "usecase" && (scope == "" || iterOf(n.Path) <= scope) {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)
	for _, n := range nodes {
		if n.Type != "manifest" || n.Mode != "deck" || n.Kind != "ifu" {
			continue
		}
		units := parseManifestUnits(manifestBody(n.Path))
		if len(units) == 0 {
			continue
		}
		last := units[len(units)-1].Body
		for _, id := range ids {
			if ifuRefLinked(last, id) {
				covered[id] = true
			}
		}
	}
	var missing []string
	for _, id := range ids {
		if !covered[id] {
			missing = append(missing, id)
		}
	}
	return missing
}

// enddesign
