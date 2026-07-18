package main

// i27_red.go — the i0027_book_feedback RED battery: tests first, they FAIL until
// the build. Each case carries its trace line: test-<id> -> selftest:<name>.

import (
	"os"
	"path/filepath"
)

var i27Tests = []namedTest{
	{"attest-freshness", selftestAttestFreshness},
}

// test-attest-freshness -> selftest:attest-freshness
// A long-lived process must see ledger events written by ANOTHER process: the pager's
// watch server records a bless; the resident MCP child answers next. The attest-events
// memo must therefore invalidate on file change, never trust a per-process snapshot.
func selftestAttestFreshness() bool {
	dir, err := os.MkdirTemp("", "q27att")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldAttest := ATTEST
	defer func() { ATTEST = oldAttest }()
	ATTEST = filepath.Join(dir, "attest.json")
	os.WriteFile(ATTEST, []byte(`[{"check":"g-a","action":"bless","actor":"user","ts":"t1","hash":"h1","statement_hash":"s1","deps":{},"prev_hash":null}]`), 0o644)
	if len(attestEvents()) != 1 {
		return false // the first read parses the file
	}
	// an EXTERNAL writer (another process) appends a second event; force a
	// distinguishable file identity even on coarse mtime clocks via size change
	os.WriteFile(ATTEST, []byte(`[{"check":"g-a","action":"bless","actor":"user","ts":"t1","hash":"h1","statement_hash":"s1","deps":{},"prev_hash":null},{"check":"g-b","action":"bless","actor":"user","ts":"t2","hash":"h2","statement_hash":"s2","deps":{},"prev_hash":null}]`), 0o644)
	return len(attestEvents()) == 2 // the memo must not mask the external write
}
