package main

import (
	"encoding/json"
	"path/filepath"
	"sort"
)

// design: go-pager-result  implements: req-pager-round-end, req-pager-open-questions
// The round-end contract of the handover pager (owner rulings 2026-07-17/18). A round
// that ends prints ONE machine-readable line and writes ONE pollable result file in the
// data home, so any harness observes the outcome without improvised file watches. The
// ruled semantics: CLOSING THE PAGE WINDOW ENDS THE ROUND AS A REJECTION. A close is an
// answer, never a limbo. And a round never starts over an OPEN cone question. An
// unknown that is neither proposed nor decided means the brief is not ready to rule on,
// and the refusal names the question. A PROPOSED question is the opposite: it deals as
// a card and the bless selects its letter.

// pagerVerdict maps a serve outcome to the round verdict.
func pagerVerdict(outcome string) string {
	switch outcome {
	case "y":
		return "bless"
	case "n":
		return "dissent"
	case "closed":
		return "reject" // the ruling: a closed window is an answer
	}
	return outcome // unopened, error:... pass through honestly
}

// pagerRoundLine is the machine-readable round end, printed last so a scraping
// harness reads it as the final stdout line.
func pagerRoundLine(gate, outcome string) string {
	return "ROUND-END gate=" + gate + " verdict=" + pagerVerdict(outcome)
}

// pagerResultJSON is the pollable result body: the gate, the mapped verdict, and the
// raw serve outcome for diagnosis.
func pagerResultJSON(gate, outcome string) []byte {
	b, _ := json.Marshal(struct {
		Gate    string `json:"gate"`
		Verdict string `json:"verdict"`
		Outcome string `json:"outcome"`
	}{gate, pagerVerdict(outcome), outcome})
	return b
}

// pagerResultPath is fixed and guessable: out/handoff-<gate>.result.json in the data
// home. The round deletes it at start and writes it at end; its appearance IS the
// round-end signal a wait loop polls (never `status`).
func pagerResultPath(gate string) string {
	return filepath.Join(dataDirFor("out"), "handoff-"+gate+".result.json")
}

// pagerOpenQuestions lists the gate's cone questions still state=open, sorted.
// Any hit refuses the round.
func pagerOpenQuestions(gate Node, nodes map[string]Node) []string {
	var open []string
	for id := range handoffCone(gate, nodes) {
		if n, ok := nodes[id]; ok && n.Type == "question" && questionState(n) == "open" {
			open = append(open, id)
		}
	}
	sort.Strings(open)
	return open
}

// enddesign
