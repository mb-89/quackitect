// The golden file holds the Ask and the standing of every ticket in the tree,
// read through the fake index by the tickets module's port all. A row compares
// while its ticket and its group read as they did when the file was written.
// [[spec/tickets/tickets-becomes-a-module]]
package main

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

	"quackitect/src/modules/tickets"
	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The golden file, beside the case that reads it. [[spec/tickets/tickets-becomes-a-module]]
const goldenAt = "testdata/tree.golden.json"

var update = flag.Bool("update", false, "write the golden file again off the tree")

type goldenRow struct {
	Name      string `json:"name"`
	Hash      string `json:"hash"`
	GroupHash string `json:"group_hash,omitempty"`
	Ask       string `json:"ask"`
	Standing  string `json:"standing"`
}

func shortHash(text string) string {
	sum := sha256.Sum256([]byte(text))
	return hex.EncodeToString(sum[:8])
}

func TestTreeGolden(t *testing.T) {
	found, err := filepath.Glob(filepath.Join(treeRoot, "spec", "tickets", "*.md"))
	if err != nil {
		t.Fatal(err)
	}
	seeded, hashes := map[string]any{}, map[string]string{}
	for _, one := range found {
		read, err := os.ReadFile(one)
		if err != nil {
			t.Fatal(err)
		}
		hashes[strings.TrimSuffix(filepath.Base(one), ".md")] = shortHash(string(read))
		seeded["files/spec/tickets/"+filepath.Base(one)] = q.Content{Hash: shortHash(string(read)), Text: string(read)}
	}
	index := qtest.New(t, func(c *q.Catalog) { tickets.Registers(c) })
	index.Seed(seeded)
	list, _ := index.Run(tickets.AllPort).([]tickets.Ticket)
	if *update {
		writes(t, list, hashes)
		return
	}
	read, err := os.ReadFile(goldenAt)
	if err != nil {
		t.Fatalf("the golden file stands nowhere: run go test ./src/quack -run TestTreeGolden -update")
	}
	var rows []goldenRow
	if err := json.Unmarshal(read, &rows); err != nil {
		t.Fatal(err)
	}
	now := map[string]tickets.Ticket{}
	for _, one := range list {
		now[one.Name] = one
	}
	compared := 0
	for _, row := range rows {
		one, stands := now[row.Name]
		if !stands || hashes[row.Name] != row.Hash || hashes[one.Group] != row.GroupHash {
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
		t.Fatalf("no row of the golden file compares over %d tickets: run go test ./src/quack -run TestTreeGolden -update", len(list))
	}
}

// Writes the golden file again, a row a ticket in name order. [[spec/tickets/tickets-becomes-a-module]]
func writes(t *testing.T, list []tickets.Ticket, hashes map[string]string) {
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
}
