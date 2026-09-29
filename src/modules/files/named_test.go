// The watch mirrors the session log under its named folder, and nothing
// under a folder beneath it.
// [[spec/tickets/the-log-topic-lands]]
package files

import "testing"

func TestTheWatchMirrorsTheSessionLog(t *testing.T) {
	for rel, want := range map[string]bool{
		".se/.log/session.jsonl":     true,
		".se/.log/old/session.jsonl": false,
		".se/.log/serve.log":         false,
		".se/.runtime/plan.json":     true,
		".se/.dump/rows.json":        false,
	} {
		if got := heard(rel); got != want {
			t.Errorf("%s reaches the family %v, and wants %v", rel, got, want)
		}
	}
}
