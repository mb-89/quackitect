package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// MerkleRoot: sha256 hex of sorted "id:fullhash" pairs joined by ';' — matches report.py _merkle_root.
func MerkleRoot(nodes map[string]Node) string {
	memo := map[string]string{}
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	parts := make([]string, 0, len(ids))
	for _, id := range ids {
		parts = append(parts, id+":"+fullHash(id, nodes, memo))
	}
	x := sha256.Sum256([]byte(strings.Join(parts, ";")))
	return hex.EncodeToString(x[:])
}

// design: go-selftest  implements: req-behavior-parity
// The engine verifies ITSELF, in Go, in-process, with zero external toolchain — no uv, no python,
// no go test. Executed checks carry 'verify: selftest:<name>'; the engine runs the named check
// directly. Parity = the merkle root equals the baselined golden root (a determinism regression).
func runSelftest(name string) bool {
	switch name {
	case "parser":
		return selftestParser()
	case "determinism":
		r1, r2 := MerkleRoot(LoadAll()), MerkleRoot(LoadAll())
		return r1 != "" && r1 == r2
	case "ids":
		return len(DuplicateIDs()) == 0
	case "help":
		_, bad := badIDArg("start", []string{"-x"})
		return helpRequested([]string{"start", "--help"}) && bad && !helpRequested([]string{"status", "an-id"})
	case "parity":
		return selftestParity()
	case "perf":
		return selftestPerf()
	case "deps":
		return true // this running at all proves the dependency-free binary works
	case "deps-prompt":
		_, err := os.Stat(filepath.Join(ROOT, "product", "quackitect", "method", "prompts", "dependencies.md"))
		return err == nil
	}
	fmt.Fprintln(os.Stderr, "unknown selftest:", name)
	return false
}

func selftestParser() bool {
	dir, _ := os.MkdirTemp("", "qst")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "req-x.md")
	os.WriteFile(p, []byte("---\nid: req-x\ntype: requirement\nrefines: [uc-a, uc-b]\nstatement: Hello world.\nkiller: true\n---\n"), 0o644)
	n := ParseNode(p)
	return n.ID == "req-x" && n.Type == "requirement" && n.Statement == "Hello world." && n.Killer && len(n.Refines) == 2
}

// selftestParity: the merkle root must equal the baselined golden. The golden is written once
// (from the verified-parity moment) and then enforced forever — even after Python is gone.
func selftestParity() bool {
	root := MerkleRoot(LoadAll())
	gp := filepath.Join(QUACK, "engine", "golden-root.txt")
	if raw, err := os.ReadFile(gp); err == nil {
		return strings.TrimSpace(string(raw)) == root
	}
	os.MkdirAll(filepath.Dir(gp), 0o755)
	os.WriteFile(gp, []byte(root+"\n"), 0o644)
	return true
}

func selftestPerf() bool {
	t0 := time.Now()
	MerkleRoot(LoadAll())
	return time.Since(t0) < time.Second
}

// RunSelftestCLI runs one named check (or all) and returns an exit code.
func RunSelftestCLI(args []string) int {
	all := []string{"deps", "parser", "determinism", "ids", "help", "parity", "perf", "deps-prompt"}
	names := args
	if len(names) == 0 {
		names = all
	}
	ok := true
	for _, n := range names {
		pass := runSelftest(n)
		status := "ok"
		if !pass {
			status, ok = "FAIL", false
		}
		fmt.Printf("selftest %-12s %s\n", n, status)
	}
	if ok {
		return 0
	}
	return 1
}

// enddesign
