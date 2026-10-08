// The ticket every shipped route mints, held in a golden the JavaScript voice
// case reads, so that case reads the Go mint and no copy of it. The -update
// flag mints each route again.
// [[spec/tickets/schema-libs-leave]]
package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/modules/check"
	"quackitect/src/pull"
)

// [[spec/tickets/schema-libs-leave]]
const mintedGoldenAt = "testdata/minted.golden.json"

// [[spec/tickets/schema-libs-leave]]
type mintedEntry struct {
	Route string `json:"route"`
	Text  string `json:"text"`
}

// [[spec/tickets/schema-libs-leave]]
func shippedRoutes(t *testing.T) []string {
	t.Helper()
	out := []string{}
	for _, one := range globbedIn(t, "spec/processes/*.yaml") {
		out = append(out, strings.TrimSuffix(filepath.Base(one), ".yaml"))
	}
	if len(out) < 2 {
		t.Fatalf("spec/processes holds %v, and wants the routes the tree ships", out)
	}
	return out
}

// [[spec/tickets/schema-libs-leave]]
func shippedSchemas(t *testing.T) *check.Kinds {
	t.Helper()
	root, err := filepath.Abs(treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	return check.SchemasIn(check.TreeOver(root, rootDisk{root}))
}

// [[spec/tickets/schema-libs-leave]]
func mintedRoute(t *testing.T, schemas *check.Kinds, route string) string {
	t.Helper()
	root, _ := filepath.Abs(treeRoot)
	fields := map[string]any{"state": "open", "process": route}
	if why := withRoute(pull.OSDisk{Root: root}, schemas.Get(ticketKind), fields); why != "" {
		t.Fatalf("the %s route copies in no route: %s", route, why)
	}
	text, why := check.Minted(schemas, ticketKind, "spec/tickets/"+route+"-rendered.md", fields)
	if why != "" {
		t.Fatalf("the %s route mints no ticket: %s", route, why)
	}
	return text
}

// [[spec/tickets/schema-libs-leave]]
func TestEveryShippedRouteMintsItsGolden(t *testing.T) {
	t.Parallel()
	body, err := os.ReadFile(mintedGoldenAt)
	if err != nil {
		t.Fatalf("%s reads %v, and wants the entries go test ./src/quack -run TestTheMintedGoldenMintsEveryRouteAgain -update writes", mintedGoldenAt, err)
	}
	var entries []mintedEntry
	if err := json.Unmarshal(body, &entries); err != nil {
		t.Fatalf("%s reads %v", mintedGoldenAt, err)
	}
	held := map[string]string{}
	for _, one := range entries {
		held[one.Route] = one.Text
	}
	schemas := shippedSchemas(t)
	routes := shippedRoutes(t)
	for _, route := range routes {
		if got := mintedRoute(t, schemas, route); got != held[route] {
			t.Errorf("the %s route mints\n%s\nand the golden holds\n%s", route, got, held[route])
		}
	}
	if len(entries) != len(routes) {
		t.Errorf("%s holds %d routes, and the tree ships %v", mintedGoldenAt, len(entries), routes)
	}
}

// [[spec/tickets/schema-libs-leave]]
func TestTheMintedGoldenMintsEveryRouteAgain(t *testing.T) {
	t.Parallel()
	if !*update {
		t.Skip("go test ./src/quack -run TestTheMintedGoldenMintsEveryRouteAgain -update mints the golden again")
	}
	schemas := shippedSchemas(t)
	entries := []mintedEntry{}
	for _, route := range shippedRoutes(t) {
		entries = append(entries, mintedEntry{Route: route, Text: mintedRoute(t, schemas, route)})
	}
	var out bytes.Buffer
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	writes.SetIndent("", "  ")
	if err := writes.Encode(entries); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(mintedGoldenAt, out.Bytes(), 0o644); err != nil {
		t.Fatal(err)
	}
}
