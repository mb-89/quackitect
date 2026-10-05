// The brand a vehicle stamps: the slug off its folder, the names the stamp
// writes, and the targets it writes off the brand folder or the shapes.
// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
package main

import (
	"os"
	"path/filepath"
	"slices"
	"testing"
)

func TestAFolderNameAnswersTheSlugAMarketplaceTakes(t *testing.T) {
	t.Parallel()
	for path, want := range map[string]string{
		"/x/quackitect": "quackitect", "/x/my.app": "my-app", "/x/Acme Tools": "acme-tools",
		"/x/.hidden": "hidden", `C:\x\Desk\`: "desk", "/x/...": "",
	} {
		if got := brandOf(path); got != want {
			t.Errorf("brandOf(%q) = %q, want %q", path, got, want)
		}
	}
}

func TestTheBrandReachesTheMarketplaceNameItsOwnerAndThePluginsAuthor(t *testing.T) {
	t.Parallel()
	got := brandedJSON(`{"name":"old","owner":{"name":"old","email":"e"},"plugins":[]}`, "acme")
	want := "{\n  \"name\": \"acme\",\n  \"owner\": {\n    \"name\": \"acme\",\n    \"email\": \"e\"\n  },\n  \"plugins\": []\n}\n"
	if got != want {
		t.Errorf("the marketplace reads\n%s", got)
	}
	got = brandedJSON(`{"name":"level0","author":{}}`, "acme")
	want = "{\n  \"name\": \"level0\",\n  \"author\": {\n    \"name\": \"acme\"\n  }\n}\n"
	if got != want {
		t.Errorf("the plugin reads\n%s", got)
	}
}

func TestTextThatReadsAsNoObjectStandsAsItIs(t *testing.T) {
	t.Parallel()
	for _, text := range []string{"not json", "[1]", `"x"`, "{} {}"} {
		if got := brandedJSON(text, "acme"); got != text {
			t.Errorf("brandedJSON(%q) = %q", text, got)
		}
		if got := versionedJSON(text, "1.0.0"); got != text {
			t.Errorf("versionedJSON(%q) = %q", text, got)
		}
	}
}

func TestTheVersionLandsInPlaceOrLastAndAnEmptyOneLeavesTheText(t *testing.T) {
	t.Parallel()
	if got := versionedJSON(`{"version":"0","name":"n"}`, "2.0.0"); got != "{\n  \"version\": \"2.0.0\",\n  \"name\": \"n\"\n}\n" {
		t.Errorf("in place: %q", got)
	}
	if got := versionedJSON(`{"name":"n"}`, "2.0.0"); got != "{\n  \"name\": \"n\",\n  \"version\": \"2.0.0\"\n}\n" {
		t.Errorf("last: %q", got)
	}
	if got := versionedJSON(`{"name":"n"}`, ""); got != `{"name":"n"}` {
		t.Errorf("empty: %q", got)
	}
}

func seedTree(t *testing.T, root string, files map[string]string) {
	t.Helper()
	for rel, text := range files {
		at := filepath.Join(root, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

func TestAStampWritesEveryTargetOffTheBrandFolderAndASecondWritesNothing(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedTree(t, root, map[string]string{
		"package.json":                    `{"version":"1.2.3"}`,
		brandFolder + "/marketplace.json": `{"name":"","owner":{"name":""}}`,
		brandFolder + "/plugin.json":      `{"name":"level0","author":{"name":""}}`,
		brandFolder + "/icon.svg":         "<svg/>",
		extensionTarget:                   `{"name":"ext","version":"0.0.0"}`,
	})
	done, err := stamps(root, "acme")
	if err != nil {
		t.Fatal(err)
	}
	if want := []string{marketplaceTarget, pluginTarget, extensionTarget, iconTarget}; !slices.Equal(done, want) {
		t.Fatalf("the stamp writes %v, want %v", done, want)
	}
	plugin, _ := readText(filepath.Join(root, filepath.FromSlash(pluginTarget)))
	if plugin != "{\n  \"name\": \"level0\",\n  \"author\": {\n    \"name\": \"acme\"\n  },\n  \"version\": \"1.2.3\"\n}\n" {
		t.Errorf("the plugin reads\n%s", plugin)
	}
	if again, _ := stamps(root, "acme"); len(again) != 0 {
		t.Errorf("a second stamp writes %v", again)
	}
}

func TestACloneHoldingNoSourceAndNoTargetTakesTheShapes(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	done, err := stamps(root, "acme")
	if err != nil {
		t.Fatal(err)
	}
	if want := []string{marketplaceTarget, pluginTarget}; !slices.Equal(done, want) {
		t.Fatalf("the stamp writes %v, want %v", done, want)
	}
	market, _ := readText(filepath.Join(root, filepath.FromSlash(marketplaceTarget)))
	if held := objectOf(market); held == nil || held.values["name"] != "acme" || len(held.values["plugins"].([]any)) != 1 {
		t.Errorf("the marketplace reads\n%s", market)
	}
}

func TestATargetStandingWithNoSourceReadsAsItsOwnSource(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedTree(t, root, map[string]string{marketplaceTarget: "{\n  \"name\": \"acme\",\n  \"owner\": {\n    \"name\": \"acme\"\n  }\n}\n"})
	done, _ := stamps(root, "acme")
	if slices.Contains(done, marketplaceTarget) {
		t.Errorf("a stamped target with no source takes a write: %v", done)
	}
}
