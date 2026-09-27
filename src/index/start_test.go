// The start: the door checks the catalog it takes, and a fault refuses it
// before a listener or a standing file stands.
// [[spec/design_output/model#the-catalog-check]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/q"
)

func TestABrokenCatalogRefusesTheStart(t *testing.T) {
	root := tree(t)
	broken := q.New()
	q.GivenIn(broken, "t/n", 0)
	q.GivenIn(broken, "t/n", 0)
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), broken)
	if err == nil {
		stop()
		t.Fatal("the door stands on a catalog naming t/n twice")
	}
	if !strings.Contains(err.Error(), "t/n") || !strings.Contains(err.Error(), "start_test.go:") {
		t.Fatalf("the refusal says %q", err)
	}
	if _, err := os.Stat(standingPath(root)); err == nil {
		t.Fatal("a standing file stands after the refusal")
	}
}

// A local config picks one of two alternatives. [[spec/tickets/providers-keys-reach-check]]
func picking(t *testing.T, alt string) (string, *q.Catalog) {
	t.Helper()
	root := tree(t)
	local := filepath.Join(root, filepath.FromSlash(".se/.runtime/config.json"))
	if err := os.MkdirAll(filepath.Dir(local), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(local, []byte(`{"providers":{"t/n":"`+alt+`"}}`), 0o644); err != nil {
		t.Fatal(err)
	}
	c := q.New()
	q.GivenIn(c, "t/n", 0, q.Alt("t.local"))
	q.GivenIn(c, "t/n", 0, q.Alt("t.remote"))
	return root, c
}

// [[spec/tickets/providers-keys-reach-check]]
func TestAProviderKeyReachesTheCatalogCheck(t *testing.T) {
	root, c := picking(t, "t.remote")
	if said := providersOf(root, c); said["providers.t/n"] != "t.remote" {
		t.Fatalf("the keys read %v", said)
	}
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), c)
	if err != nil {
		t.Fatalf("the key picks t.remote, and the start answers %v", err)
	}
	stop()
}

// [[spec/tickets/providers-keys-reach-check]]
func TestAProviderKeyNamingNoAltRefusesTheStart(t *testing.T) {
	root, c := picking(t, "t.none")
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), c)
	if err == nil {
		stop()
		t.Fatal("the door stands on a key naming no alternative")
	}
	if !strings.Contains(err.Error(), "t.none") {
		t.Fatalf("the refusal says %q", err)
	}
}
