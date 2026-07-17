package main

import (
	"sort"
	"strings"
)

// design: go-ifu-coverage  implements: req-ifu-coverage
// IFU decks are ordinary markdown deck manifests with `kind: ifu`. Their source is the
// authoring truth. The coverage rule reads those sources and requires every in-scope
// use case to be visibly named by at least one IFU deck. The link target can live on
// the final slide; the checker cares about source truth, not slide position.
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
		body := manifestBody(n.Path)
		for _, id := range ids {
			if strings.Contains(body, id) {
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
