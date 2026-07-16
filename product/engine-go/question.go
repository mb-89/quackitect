package main

import (
	"sort"
	"strings"
)

// design: go-question-nodes  implements: req-question-nodes
// Open unknowns ride the trace as first-class question nodes (adr-question-nodes-provenance). `type: question` is trace CONTENT like requirement and adr. It is never a gate, never blessed, with no DONE/SUSPECT/OPEN of its own. A question carries a decision state, open, proposed, or decided, and once decided, a `decided_via` provenance line. The ledger records WHAT was decided and via what; it never simulates the deciding. Both fields fold into the node's identity, the fullHash question seed. So deciding a question ripples its dependents through the existing edge lanes like any content edit. The EARS lint never applies, since questions are questions, not shall-statements. The requirement-only rule exempts them by type, the same way every other non-requirement type is exempt.

// questionState returns a question node's decision state (open | proposed | decided).
func questionState(n Node) string { return n.State }

// decidedVia returns how a decided question was decided (free text; empty when undecided).
func decidedVia(n Node) string { return n.DecidedVia }

// questionStates is the state vocabulary; anything else is a lint finding.
var questionStates = map[string]bool{"open": true, "proposed": true, "decided": true}

// questionFindings lints question hygiene: unknown state vocabulary,
// decided-without-provenance, and decided_via on an undecided question.
func questionFindings(nodes map[string]Node) []string {
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		if nodes[id].Type == "question" {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)
	var findings []string
	for _, id := range ids {
		n := nodes[id]
		st := strings.TrimSpace(n.State)
		if !questionStates[st] {
			findings = append(findings, id+": unknown question state '"+st+"' (open | proposed | decided)")
		}
		if st == "decided" && strings.TrimSpace(n.DecidedVia) == "" {
			findings = append(findings, id+": decided without decided_via (provenance is required)")
		}
		if st != "decided" && strings.TrimSpace(n.DecidedVia) != "" {
			findings = append(findings, id+": decided_via on an undecided question")
		}
	}
	return findings
}

// enddesign
