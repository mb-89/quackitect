package main

import (
	"encoding/json"
	"os"
)

// THE ENGINE COUNTS THE RESULTS IT RETURNS, AND HOW MANY OF THEM WERE WRONG.
//
// The engine returned errors to the agent and kept no count of them, so how
// much a session erred could be read only off the harness's transcripts. The
// engine does not own those, and they do not always keep what a reading needs:
// of four transcripts in one project, two kept none of their thinking text.
//
// The engine sees every result on its way back through runVerbInside, and it
// knows whether the verb erred or refused, so it counts both itself. This is
// the basic under ending a long session: a budget cannot be watched before the
// thing it counts is counted.
//
// THE COUNT IS THE SESSION'S. It is keyed by the session the current log
// names, so a new session starts over, and it lives on disk, so a compaction,
// which resets the read set and nothing else, leaves it standing.

type Results struct {
	Session  string `json:"session"`
	Returned int    `json:"returned"`
	Wrong    int    `json:"wrong"`
}

func resultsPath(r Roots) string { return r.Private("results.json") }

// CountResult adds one result to this session's count, and one wrong result
// when it was an error or a refusal. The store is read, changed and written
// under the lock, because two verbs answer at once.
func CountResult(r Roots, wrong bool) {
	session := currentSession(r)
	_ = locked(resultsPath(r), func() error { // a count it cannot write is one result short, and the next one is counted
		got := loadResults(r)
		if got.Session != session {
			got = Results{Session: session}
		}
		got.Returned++
		if wrong {
			got.Wrong++
		}
		b, err := json.MarshalIndent(got, "", "  ")
		if err != nil {
			return err
		}
		return writeAtomic(resultsPath(r), append(b, '\n'), 0o644)
	})
}

func loadResults(r Roots) Results {
	var got Results
	b, err := os.ReadFile(resultsPath(r))
	if err != nil {
		return got
	}
	_ = json.Unmarshal(b, &got) // a store that will not read is a count of nothing
	return got
}

// ResultsSoFar answers this session's count. A store an earlier session left
// answers zero for this one, under this one's name.
func ResultsSoFar(r Roots) Results {
	session := currentSession(r)
	got := loadResults(r)
	if got.Session != session {
		return Results{Session: session}
	}
	return got
}
