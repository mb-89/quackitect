package main

import (
	"database/sql"
	"strings"
	"testing"
)

// THE INDEX IS READ-ONLY THROUGH THE ASK, AND A QUESTION IS ANSWERED WHOLE
// OR SAYS IT WAS CUT.
func TestAnAskCannotWrite(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	db.Close()

	cases := []struct {
		name  string
		query string
		wants string
	}{
		{"a delete", "DELETE FROM file", "read-only"},
		{"an insert", "insert into meta values ('x', 'y')", "read-only"},
		{"a drop", "DROP TABLE file", "read-only"},
		{"nothing", "   ", "empty"},
		// A write hidden behind a common table expression is refused by the
		// connection, which was opened query-only.
		{"a write behind with", "WITH x AS (SELECT 1) DELETE FROM file", "readonly"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()
			_, err := askFile(r, c.query, 10)
			if err == nil || !strings.Contains(err.Error(), c.wants) {
				t.Fatalf("got %v, want a refusal saying %q", err, c.wants)
			}
		})
	}
	// Nothing above changed anything.
	got, err := askFile(r, "SELECT count(*) FROM file", 10)
	if err != nil {
		t.Fatal(err)
	}
	if got.Rows[0][0] != int64(4) {
		t.Fatalf("the file table holds %v rows after the refused writes", got.Rows[0][0])
	}
}

func TestAnAskSaysWhenItWasCut(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	db.Close()

	got, err := askFile(r, "SELECT path FROM file ORDER BY path", 2)
	if err != nil {
		t.Fatal(err)
	}
	if got.Count != 2 || !got.Truncated {
		t.Fatalf("a limit of two answered %d rows, truncated %v", got.Count, got.Truncated)
	}
	whole, err := askFile(r, "SELECT path FROM file ORDER BY path", 0)
	if err != nil {
		t.Fatal(err)
	}
	if whole.Count != 4 || whole.Truncated {
		t.Fatalf("no limit answered %d rows, truncated %v", whole.Count, whole.Truncated)
	}
}

// askFile asks the index file directly, the way a test with no engine can.
// The verb itself asks the engine that lives, and refuses without one.
func askFile(r Roots, query string, limit int) (Asked, error) {
	db, err := sql.Open("sqlite3", indexDSN(indexPath(r), true))
	if err != nil {
		return Asked{}, err
	}
	defer db.Close()
	return askDB(db, query, limit)
}
