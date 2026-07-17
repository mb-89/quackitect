package main

import (
	"fmt"
	"sort"
	"strings"
)

// design: go-decisions  implements: req-decision-model.1, req-decision-model.3, req-decision-model.2, req-decision-model.4
// Decision model v2 (adr-decision-model-v2): a decision is born made and never edited. ALL classification derives from graph facts. An edge to the built-in `scrap` sink without ready_when is a VETO. With ready_when it is a DEFER. An incoming supersedes edge means SUPERSEDED. Anything else is an ADOPTION. `scrap` is the /dev/null of the trace: one engine-built-in sink, no file on disk; ref-integrity recognizes it. Placement is forward-only from i0009. A decision minted in a newer iteration outside spec/decisions/ is a lint finding. The roughly 20 historical iteration-folder ADRs stay grandfathered. The realized lint flags an ADOPTION whose addressed requirements lack realized designs. Being class-driven, it can never nag a veto or a defer. `decisions --parked` lists exactly the live defers, no incoming supersedes. The engage-start migration walks THIS list.
const decisionsSince = "i0009"
const scrapSink = "scrap"

func decisionClassRaw(addressesScrap bool, readyWhen string, superseded bool) string {
	switch {
	case superseded:
		return "superseded"
	case addressesScrap && strings.TrimSpace(readyWhen) != "":
		return "defer"
	case addressesScrap:
		return "veto"
	default:
		return "adoption"
	}
}

// supersededSet: every node named by some node's supersedes edge.
func supersededSet(nodes map[string]Node) map[string]bool {
	out := map[string]bool{}
	for _, n := range nodes {
		for _, t := range n.Supersedes {
			out[t] = true
		}
	}
	return out
}

func addressesSink(n Node) bool {
	for _, a := range n.Addresses {
		if a == scrapSink {
			return true
		}
	}
	return false
}

// removalDecided reports whether a requirement's realization is a REMOVAL testified by a
// veto: some veto (a decision addressing the scrap sink, no ready_when) names the requirement
// in its addresses. Such a requirement owes no realized design region — its decision IS the
// realization and git history is the archive, so no tombstone design is ever needed.
func removalDecided(reqID string, nodes map[string]Node) bool {
	for _, n := range nodes {
		if n.Type != "adr" || strings.TrimSpace(n.ReadyWhen) != "" || !addressesSink(n) {
			continue
		}
		for _, a := range n.Addresses {
			if a == reqID {
				return true
			}
		}
	}
	return false
}

func decisionClass(n Node, superseded map[string]bool) string {
	return decisionClassRaw(addressesSink(n), n.ReadyWhen, superseded[n.ID])
}

func parkedFrom(defers map[string]bool, superseded map[string]bool) []string {
	var out []string
	for id := range defers {
		if !superseded[id] {
			out = append(out, id)
		}
	}
	sort.Strings(out)
	return out
}

func parkedDecisions(nodes map[string]Node) []string {
	sup := supersededSet(nodes)
	defers := map[string]bool{}
	for id, n := range nodes {
		if n.Type == "adr" && decisionClass(n, sup) == "defer" {
			defers[id] = true
		}
	}
	return parkedFrom(defers, sup)
}

// lintDecisionPlacementRaw: forward-only path rule — a decision from `since` onward lives in
// spec/decisions/; older iteration-folder decisions are grandfathered.
func lintDecisionPlacementRaw(path, iter, since string) bool {
	p := strings.ToLower(strings.ReplaceAll(path, "\\", "/"))
	if strings.Contains(p, "spec/decisions/") {
		return false
	}
	return iterKey(iter) >= iterKey(since)
}

// iterKey normalizes "i0009_contract_attestation" / "i0009" / "0009" to a comparable "i0009".
func iterKey(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	if i := strings.IndexByte(s, '_'); i >= 0 {
		s = s[:i]
	}
	return strings.TrimPrefix(s, "i")
}

func lintDecisionRealizedRaw(class string, hasImplementingDesign bool) bool {
	return class == "adoption" && !hasImplementingDesign
}

// decisionFindings: the graph-level placement + realized lints.
func decisionFindings(nodes map[string]Node) (placement, unrealized []string) {
	sup := supersededSet(nodes)
	impl := map[string]bool{}
	for _, n := range nodes {
		if n.Type == "design" {
			for _, r := range n.Implements {
				// a sub-addressed implement (req-x.2) credits its base, exactly as the
				// coverage rules count it (go-sub-addressing); the adoption lint agreeing
				// killed a 50-strong false-positive class in i25
				impl[subAddrBase(r)] = true
			}
		}
	}
	for id, n := range nodes {
		if n.Type != "adr" {
			continue
		}
		if lintDecisionPlacementRaw(n.Path, iterOf(n.Path), decisionsSince) {
			placement = append(placement, id+" lives outside spec/decisions/ ("+iterOf(n.Path)+")")
		}
		if decisionClass(n, sup) == "adoption" {
			realized := len(n.Addresses) > 0
			for _, a := range n.Addresses {
				if an, ok := nodes[a]; ok && an.Type == "requirement" && !impl[a] {
					realized = false
				}
			}
			if lintDecisionRealizedRaw("adoption", realized) {
				unrealized = append(unrealized, id)
			}
		}
	}
	sort.Strings(placement)
	sort.Strings(unrealized)
	return placement, unrealized
}

// enddesign

// cmdDecisions is the console shell over the decision classes: list, or --parked.
func cmdDecisions(args []string) {
	nodes := LoadAll()
	if hasFlag(args, "--parked") {
		parked := parkedDecisions(nodes)
		if len(parked) == 0 {
			fmt.Println("no parked defers")
			return
		}
		for _, id := range parked {
			fmt.Println(id + "\tready when: " + nodes[id].ReadyWhen)
		}
		return
	}
	sup := supersededSet(nodes)
	var ids []string
	for id, n := range nodes {
		if n.Type == "adr" {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)
	for _, id := range ids {
		fmt.Println(id + "\t" + decisionClass(nodes[id], sup))
	}
}
