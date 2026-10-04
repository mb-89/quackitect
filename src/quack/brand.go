// The brand a vehicle stamps on itself: both manifests and the icon come out
// of the brand folder, the marketplace, its owner and the plugin's author
// named after the folder the tree stands in.
// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// The brand folder, and the files a stamp writes. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
const (
	brandFolder       = "spec/config/brand"
	marketplaceTarget = ".claude-plugin/marketplace.json"
	pluginTarget      = ".claude/skills/level0/.claude-plugin/plugin.json"
	iconTarget        = "src/extension/icon.svg"
	extensionTarget   = "src/extension/package.json"
)

// The shape a manifest takes where the brand folder carries no source for it, as JSON.stringify writes it. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
var brandShapes = map[string]string{
	marketplaceTarget: `{"name":"","owner":{"name":""},"plugins":[{"name":"level0","description":"Level zero, run from the vehicle's own folder. A stub names this folder as a marketplace and enables the plugin, and carries no copy.","source":"./.claude/skills/level0"}]}`,
	pluginTarget:      `{"name":"level0","description":"Level zero: the rules that shape what the agent writes, taken inside the harness process, and the pull as a tool. The voice rules hold at the write door on turn one of a clone that has never been built.","author":{"name":""}}`,
}

var notSlug = regexp.MustCompile(`[^a-z0-9]+`)

// The last folder of a path, whichever slash it takes. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func folderOf(method string) string {
	parts := strings.Split(strings.TrimRight(strings.ReplaceAll(method, "\\", "/"), "/"), "/")
	return parts[len(parts)-1]
}

// The slug a marketplace takes off the tree's folder. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func brandOf(method string) string {
	return strings.Trim(notSlug.ReplaceAllString(strings.ToLower(folderOf(method)), "-"), "-")
}

// The line a folder slugging to nothing says. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func emptyBrand(method string) string {
	return folderOf(method) + " carries no letter and no digit, so it slugs to an empty brand. Rename the folder to one a marketplace takes, or move the vehicle into one."
}

func objectOf(text string) *ordered {
	value, err := orderedOf(text)
	if err != nil {
		return nil
	}
	object, _ := value.(*ordered)
	return object
}

// A manifest wearing the brand on its owner and the marketplace name, or on its author. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func brandedJSON(text, brand string) string {
	held := objectOf(text)
	if held == nil {
		return text
	}
	if owner, ok := held.values["owner"].(*ordered); ok {
		owner.set("name", brand)
		held.set("name", brand)
	}
	if author, ok := held.values["author"].(*ordered); ok {
		author.set("name", brand)
	}
	return orderedText(held) + "\n"
}

// A manifest wearing the tree's version, the text as it stands where the version is empty. [[spec/design_output/vehicle#one-file-holds-the-version]]
func versionedJSON(text, version string) string {
	held := objectOf(text)
	if version == "" || held == nil {
		return text
	}
	held.set("version", version)
	return orderedText(held) + "\n"
}

// The tree's version, which package.json alone holds. [[spec/design_output/vehicle#one-file-holds-the-version]]
func versionIn(root string) string {
	text, _ := readText(filepath.Join(root, "package.json"))
	held := objectOf(text)
	if held == nil {
		return ""
	}
	switch one := held.values["version"].(type) {
	case string:
		return one
	case json.Number:
		return one.String()
	}
	return ""
}

// Stamps each target off its source in the brand folder, and answers the targets it writes. A target standing already reads as its own source. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func stamps(root, brand string) ([]string, error) {
	version := versionIn(root)
	targets := []struct {
		rel, source string
		branded     func(string) string
	}{
		{marketplaceTarget, brandFolder + "/marketplace.json", func(text string) string { return brandedJSON(text, brand) }},
		{pluginTarget, brandFolder + "/plugin.json", func(text string) string { return versionedJSON(brandedJSON(text, brand), version) }},
		{extensionTarget, extensionTarget, func(text string) string { return versionedJSON(text, version) }},
		{iconTarget, brandFolder + "/icon.svg", func(text string) string { return text }},
	}
	var done []string
	for _, one := range targets {
		to := filepath.Join(root, filepath.FromSlash(one.rel))
		was, standing := readText(to)
		held, ok := readText(filepath.Join(root, filepath.FromSlash(one.source)))
		if !ok && !standing {
			held, ok = brandShapes[one.rel]
		}
		if !ok {
			continue
		}
		made := one.branded(held)
		if standing && made == was {
			continue
		}
		if err := os.MkdirAll(filepath.Dir(to), 0o755); err != nil {
			return done, err
		}
		if err := os.WriteFile(to, []byte(made), 0o644); err != nil {
			return done, err
		}
		done = append(done, one.rel)
	}
	return done, nil
}
