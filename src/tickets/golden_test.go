// The golden file holds the Ask and the standing of every ticket in the tree.
// A row compares while its ticket and its group read as they did when the
// file was written, so a mint or a take leaves the test green.
// [[spec/tickets/the-tickets-topic-lands]]
package tickets

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
)

var update = flag.Bool("update", false, "write the golden file again off the tree")

const goldenAt = "testdata/tree.golden.json"

// The tree's own ticket folder, which the test reads as its fixture. [[spec/tickets/the-tickets-topic-lands]]
const treeTickets = "../../spec/tickets"

type goldenRow struct {
	Name      string `json:"name"`
	Hash      string `json:"hash"`
	GroupHash string `json:"group_hash,omitempty"`
	Ask       string `json:"ask"`
	Standing  string `json:"standing"`
}

func hashOf(text string) string {
	sum := sha256.Sum256([]byte(text))
	return hex.EncodeToString(sum[:8])
}

// Every ticket under the tree's folder, with each text's hash by name. [[spec/tickets/the-tickets-topic-lands]]
func treeRows(t *testing.T) ([]Ticket, map[string]string) {
	t.Helper()
	found, err := filepath.Glob(filepath.Join(treeTickets, "*.md"))
	if err != nil {
		t.Fatal(err)
	}
	list := []Ticket{}
	hashes := map[string]string{}
	for _, one := range found {
		read, err := os.ReadFile(one)
		if err != nil {
			t.Fatal(err)
		}
		name := strings.TrimSuffix(filepath.Base(one), ".md")
		hashes[name] = hashOf(string(read))
		list = append(list, Of("spec/tickets/"+filepath.Base(one), name, string(read), 0))
	}
	return All(list), hashes
}

func TestTreeGolden(t *testing.T) {
	list, hashes := treeRows(t)
	if *update {
		rows := []goldenRow{}
		for _, one := range list {
			rows = append(rows, goldenRow{Name: one.Name, Hash: hashes[one.Name], GroupHash: hashes[one.Group], Ask: one.Says, Standing: one.Standing})
		}
		sort.Slice(rows, func(a, b int) bool { return rows[a].Name < rows[b].Name })
		written, err := json.MarshalIndent(rows, "", "  ")
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(goldenAt, append(written, '\n'), 0o644); err != nil {
			t.Fatal(err)
		}
		return
	}

	read, err := os.ReadFile(goldenAt)
	if err != nil {
		t.Fatalf("the golden file stands nowhere: run go test ./src/tickets -update")
	}
	var rows []goldenRow
	if err := json.Unmarshal(read, &rows); err != nil {
		t.Fatal(err)
	}
	now := map[string]Ticket{}
	for _, one := range list {
		now[one.Name] = one
	}
	compared := 0
	for _, row := range rows {
		one, stands := now[row.Name]
		if !stands || hashes[row.Name] != row.Hash || hashes[one.Group] != row.GroupHash {
			t.Logf("%s moved on since the golden file, so its row stands aside", row.Name)
			continue
		}
		compared++
		if one.Says != row.Ask {
			t.Errorf("%s reads the Ask %q, and the golden file %q", row.Name, one.Says, row.Ask)
		}
		if one.Standing != row.Standing {
			t.Errorf("%s stands %q, and the golden file %q", row.Name, one.Standing, row.Standing)
		}
	}
	if compared == 0 {
		t.Fatalf("no row of the golden file compares: run go test ./src/tickets -update")
	}
}
